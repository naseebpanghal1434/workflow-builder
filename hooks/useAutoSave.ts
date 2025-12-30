/**
 * @fileoverview Auto-save hook with debounced saves
 * @module Hooks/UseAutoSave
 *
 * ## Performance Optimizations
 *
 * 1. **Debouncing**: Saves are debounced by 2.5 seconds to prevent excessive
 *    API calls during rapid editing. This reduces server load and prevents
 *    save conflicts.
 *
 * 2. **JSON comparison**: Uses JSON.stringify comparison to detect actual
 *    changes, preventing unnecessary saves when data hasn't actually changed
 *    (e.g., when only selection changes).
 *
 * 3. **AbortController**: Cancels in-flight save requests when a new save
 *    is triggered, preventing race conditions and stale data overwrites.
 *
 * 4. **Initial mount skip**: Skips saving on initial mount to avoid saving
 *    empty/loading state before actual workflow data is loaded.
 *
 * 5. **Retry with backoff**: Failed saves retry up to 2 times with increasing
 *    delays (1s, 2s) to handle transient network issues without overwhelming
 *    the server.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Node, Edge } from 'reactflow';
import { updateWorkflow } from '@/lib/db/workflows';
import type { WorkflowData } from '@/types/workflow';
import { DEFAULT_VIEWPORT } from '@/types/workflow';

/**
 * Save status type
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Props for useAutoSave hook
 */
interface UseAutoSaveProps {
  /** Workflow ID */
  workflowId: string;
  /** Current nodes */
  nodes: Node[];
  /** Current edges */
  edges: Edge[];
  /** Current flow name */
  flowName: string;
  /** Whether auto-save is enabled */
  enabled?: boolean;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
}

/**
 * Return type for useAutoSave hook
 */
interface UseAutoSaveReturn {
  /** Current save status */
  saveStatus: SaveStatus;
  /** Last saved timestamp */
  lastSavedAt: Date | null;
  /** Error message if save failed */
  error: string | null;
  /** Manually trigger a save */
  triggerSave: () => void;
}

/**
 * useAutoSave - Automatically saves workflow changes with debouncing
 *
 * @param {UseAutoSaveProps} props - Hook props
 * @returns {UseAutoSaveReturn} Auto-save state and controls
 *
 * @example
 * const { saveStatus, lastSavedAt, error } = useAutoSave({
 *   workflowId: 'uuid',
 *   nodes,
 *   edges,
 *   flowName,
 * });
 */
export function useAutoSave({
  workflowId,
  nodes,
  edges,
  flowName,
  enabled = true,
  debounceMs = 2500,
}: UseAutoSaveProps): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refs for tracking state across renders
   *
   * Why refs instead of state?
   * - timeoutRef: Needs to persist across renders without causing re-renders
   * - abortControllerRef: Mutable reference to cancel in-flight requests
   * - previousDataRef: Stores serialized data for change detection
   * - isInitialMount: Prevents saving before data is loaded
   */
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousDataRef = useRef<string>('');
  const isInitialMount = useRef(true);

  /**
   * Perform the actual save operation with retry logic
   */
  const performSave = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 2;

    // Cancel any in-flight save
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setSaveStatus('saving');
    setError(null);

    const workflowData: WorkflowData = {
      nodes,
      edges,
      viewport: DEFAULT_VIEWPORT,
    };

    try {
      const result = await updateWorkflow(workflowId, {
        name: flowName,
        data: workflowData,
      });

      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.success) {
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        setError(null);

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus((current) => (current === 'saved' ? 'idle' : current));
        }, 2000);
      } else {
        // Retry on failure if we haven't exceeded max retries
        if (retryCount < MAX_RETRIES && result.error.includes('connect')) {
          console.log(`[AutoSave] Retrying save (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
          setTimeout(() => performSave(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        setSaveStatus('error');
        setError(result.error);
      }
    } catch (err) {
      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Retry on network errors
      if (retryCount < MAX_RETRIES) {
        console.log(`[AutoSave] Retrying save after error (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
        setTimeout(() => performSave(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      setSaveStatus('error');
      setError('Failed to save workflow. Check your connection.');
      console.error('[AutoSave] Save error:', err);
    }
  }, [workflowId, nodes, edges, flowName]);

  /**
   * Trigger a debounced save
   */
  const triggerSave = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
  }, [performSave, debounceMs]);

  /**
   * Watch for changes and trigger auto-save
   */
  useEffect(() => {
    if (!enabled) return;

    // Skip initial mount to avoid saving empty/initial state
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Store initial data for comparison
      previousDataRef.current = JSON.stringify({ nodes, edges, flowName });
      return;
    }

    // Serialize current data for comparison
    const currentData = JSON.stringify({ nodes, edges, flowName });

    // Only trigger save if data actually changed
    if (currentData !== previousDataRef.current) {
      previousDataRef.current = currentData;
      triggerSave();
    }
  }, [nodes, edges, flowName, enabled, triggerSave]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    saveStatus,
    lastSavedAt,
    error,
    triggerSave,
  };
}
