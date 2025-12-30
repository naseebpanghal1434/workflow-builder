/**
 * @fileoverview Hook for workflow persistence operations
 * @module Hooks/UseWorkflowStorage
 */

import { useState, useCallback } from 'react';
import type { Node, Edge, Viewport } from 'reactflow';
import {
  createWorkflow,
  getWorkflow,
  updateWorkflow,
} from '@/lib/db/workflows';
import type { WorkflowData } from '@/types/workflow';

/**
 * Return type for useWorkflowStorage hook
 */
interface UseWorkflowStorageReturn {
  /** Current workflow ID (null if not saved) */
  workflowId: string | null;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Whether a load operation is in progress */
  isLoading: boolean;
  /** Last error message */
  error: string | null;
  /** Save current workflow */
  save: (
    name: string,
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ) => Promise<boolean>;
  /** Load workflow by ID */
  load: (id: string) => Promise<WorkflowData | null>;
  /** Set workflow ID (e.g., from URL params) */
  setWorkflowId: (id: string | null) => void;
  /** Clear current workflow ID (for "new workflow") */
  clearWorkflowId: () => void;
}

/**
 * Hook for managing workflow persistence
 *
 * @returns {UseWorkflowStorageReturn} Storage operations and state
 *
 * @example
 * const { save, load, isSaving, workflowId } = useWorkflowStorage();
 *
 * // Save workflow
 * await save('My Workflow', nodes, edges, viewport);
 *
 * // Load workflow
 * const data = await load('workflow-uuid');
 */
export function useWorkflowStorage(): UseWorkflowStorageReturn {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Saves the current workflow (creates new or updates existing)
   */
  const save = useCallback(
    async (
      name: string,
      nodes: Node[],
      edges: Edge[],
      viewport: Viewport
    ): Promise<boolean> => {
      setIsSaving(true);
      setError(null);

      const data: WorkflowData = { nodes, edges, viewport };

      try {
        if (workflowId) {
          // Update existing workflow
          const result = await updateWorkflow(workflowId, { name, data });
          if (!result.success) {
            setError(result.error);
            return false;
          }
        } else {
          // Create new workflow
          const result = await createWorkflow(name, data);
          if (!result.success) {
            setError(result.error);
            return false;
          }
          setWorkflowId(result.data.id);
        }
        return true;
      } catch {
        setError('Failed to save workflow');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [workflowId]
  );

  /**
   * Loads a workflow by ID
   */
  const load = useCallback(
    async (id: string): Promise<WorkflowData | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getWorkflow(id);
        if (!result.success) {
          setError(result.error);
          return null;
        }
        setWorkflowId(result.data.id);
        return result.data.data;
      } catch {
        setError('Failed to load workflow');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Clears the current workflow ID
   */
  const clearWorkflowId = useCallback(() => {
    setWorkflowId(null);
    setError(null);
  }, []);

  return {
    workflowId,
    isSaving,
    isLoading,
    error,
    save,
    load,
    setWorkflowId,
    clearWorkflowId,
  };
}
