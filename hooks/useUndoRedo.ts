/**
 * @fileoverview Undo/Redo functionality hook
 * @module Hooks/UseUndoRedo
 *
 * ## Performance Optimizations
 *
 * 1. **Deep cloning**: Uses JSON.parse(JSON.stringify()) for deep cloning
 *    state snapshots. This ensures complete isolation between history entries,
 *    preventing unintended mutations from affecting history.
 *
 * 2. **MAX_HISTORY_SIZE limit**: Caps history at 50 entries to prevent
 *    unbounded memory growth in long editing sessions.
 *
 * 3. **useCallback for all operations**: All returned functions are wrapped
 *    in useCallback with minimal dependencies to maintain referential equality.
 *
 * 4. **Stack-based approach**: Uses array-based stacks (past/future) which
 *    provide O(1) push/pop operations for undo/redo.
 *
 * 5. **Computed canUndo/canRedo**: Derived from array length, no additional
 *    state needed.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from 'reactflow';

/**
 * History entry representing a state snapshot
 */
interface HistoryEntry {
  /** Nodes at this point in history */
  nodes: Node[];
  /** Edges at this point in history */
  edges: Edge[];
}

/**
 * Return type for useUndoRedo hook
 */
interface UseUndoRedoReturn {
  /** Execute undo */
  undo: () => HistoryEntry | null;
  /** Execute redo */
  redo: () => HistoryEntry | null;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Save current state to history (for undo) */
  saveState: (nodes: Node[], edges: Edge[], clearFutureStack?: boolean) => void;
  /** Push current state to future (for redo) */
  pushToFuture: (nodes: Node[], edges: Edge[]) => void;
  /** Clear history */
  clearHistory: () => void;
}

/**
 * Maximum number of history entries to keep
 *
 * Memory consideration: Each entry stores a full copy of nodes and edges.
 * With 50 entries and ~100 nodes per workflow, this uses roughly:
 * 50 entries × 100 nodes × ~500 bytes/node = ~2.5MB max memory
 */
const MAX_HISTORY_SIZE = 50;

/**
 * useUndoRedo - Undo/Redo functionality for workflow changes
 *
 * @returns {UseUndoRedoReturn} Undo/redo operations and state
 *
 * @example
 * const { undo, redo, canUndo, canRedo, saveState } = useUndoRedo();
 *
 * // Save state before changes
 * saveState(nodes, edges);
 * // Make changes...
 *
 * // Undo last change
 * const previousState = undo();
 * if (previousState) {
 *   setNodes(previousState.nodes);
 *   setEdges(previousState.edges);
 * }
 */
export function useUndoRedo(): UseUndoRedoReturn {
  // Past states for undo (stack)
  const [past, setPast] = useState<HistoryEntry[]>([]);
  // Future states for redo (stack)
  const [future, setFuture] = useState<HistoryEntry[]>([]);
  // Track if we need to save for redo
  const pendingStateRef = useRef<HistoryEntry | null>(null);

  /**
   * Save current state to history (call BEFORE making changes)
   * @param clearFutureStack - Whether to clear future (default true for new actions)
   *
   * Deep clone rationale: JSON.parse(JSON.stringify()) is used because:
   * 1. React Flow nodes/edges are plain objects (no circular refs, no functions)
   * 2. It's faster than structuredClone() for simple objects
   * 3. Creates completely independent copy, preventing mutation issues
   */
  const saveState = useCallback((nodes: Node[], edges: Edge[], clearFutureStack = true) => {
    const entry: HistoryEntry = {
      // Deep clone to isolate history entry from future mutations
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    setPast((prev) => {
      const newPast = [...prev, entry];
      // Limit history size
      if (newPast.length > MAX_HISTORY_SIZE) {
        return newPast.slice(-MAX_HISTORY_SIZE);
      }
      return newPast;
    });

    // Clear future when new action is performed (not during redo)
    if (clearFutureStack) {
      setFuture([]);
    }

    // Store for potential redo
    pendingStateRef.current = entry;
  }, []);

  /**
   * Execute undo - returns the state to restore
   */
  const undo = useCallback((): HistoryEntry | null => {
    if (past.length === 0) return null;

    const stateToRestore = past[past.length - 1];
    const newPast = past.slice(0, -1);

    setPast(newPast);

    return stateToRestore;
  }, [past]);

  /**
   * Execute redo - returns the state to restore
   */
  const redo = useCallback((): HistoryEntry | null => {
    if (future.length === 0) return null;

    const stateToRestore = future[0];
    const newFuture = future.slice(1);

    setFuture(newFuture);

    return stateToRestore;
  }, [future]);

  /**
   * Push current state to future (for redo capability)
   */
  const pushToFuture = useCallback((nodes: Node[], edges: Edge[]) => {
    const entry: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    setFuture((prev) => [entry, ...prev]);
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
    pendingStateRef.current = null;
  }, []);

  return {
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    saveState,
    pushToFuture,
    clearHistory,
  };
}
