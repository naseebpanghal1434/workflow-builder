/**
 * @fileoverview Keyboard shortcuts hook
 * @module Hooks/UseKeyboardShortcuts
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useReactFlow } from 'reactflow';

/**
 * Keyboard shortcut handlers
 */
interface KeyboardHandlers {
  /** Delete selected node */
  onDelete: () => void;
  /** Undo last action */
  onUndo: () => void;
  /** Redo last undone action */
  onRedo: () => void;
  /** Deselect current selection */
  onDeselect: () => void;
}

/**
 * useKeyboardShortcuts - Global keyboard shortcut handling
 *
 * @param {KeyboardHandlers} handlers - Shortcut action handlers
 *
 * @example
 * useKeyboardShortcuts({
 *   onDelete: () => deleteSelectedNode(),
 *   onUndo: () => undo(),
 *   onRedo: () => redo(),
 *   onDeselect: () => selectNode(null),
 * });
 */
export function useKeyboardShortcuts(handlers: KeyboardHandlers): void {
  const { zoomIn, zoomOut, setViewport, fitView } = useReactFlow();

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifier = ctrlKey || metaKey;

      // Delete - Delete selected node
      if (key === 'Delete' || key === 'Backspace') {
        event.preventDefault();
        handlers.onDelete();
        return;
      }

      // Escape - Deselect
      if (key === 'Escape') {
        event.preventDefault();
        handlers.onDeselect();
        return;
      }

      // Ctrl+Z - Undo
      if (isModifier && key === 'z' && !shiftKey) {
        event.preventDefault();
        handlers.onUndo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if (isModifier && (key === 'y' || (key === 'z' && shiftKey))) {
        event.preventDefault();
        handlers.onRedo();
        return;
      }

      // Ctrl+0 - Zoom to 100%
      if (isModifier && key === '0') {
        event.preventDefault();
        setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
        return;
      }

      // Ctrl+1 - Fit view
      if (isModifier && key === '1') {
        event.preventDefault();
        fitView({ duration: 200, padding: 0.2 });
        return;
      }

      // Ctrl++ - Zoom in
      if (isModifier && (key === '+' || key === '=')) {
        event.preventDefault();
        zoomIn({ duration: 200 });
        return;
      }

      // Ctrl+- - Zoom out
      if (isModifier && key === '-') {
        event.preventDefault();
        zoomOut({ duration: 200 });
        return;
      }
    },
    [handlers, zoomIn, zoomOut, setViewport, fitView]
  );

  /**
   * Attach event listener
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
