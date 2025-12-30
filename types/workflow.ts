/**
 * @fileoverview Type definitions for workflow state and operations
 * @module Types/Workflow
 */

import type { Node, Edge, Viewport } from 'reactflow';

/**
 * Complete workflow data structure stored in database
 */
export interface WorkflowData {
  /** Array of React Flow nodes */
  nodes: Node[];
  /** Array of React Flow edges */
  edges: Edge[];
  /** Canvas viewport position and zoom */
  viewport: Viewport;
}

/**
 * Workflow record as stored in Supabase
 */
export interface Workflow {
  /** Unique identifier (UUID) */
  id: string;
  /** Workflow display name */
  name: string;
  /** Workflow data (nodes, edges, viewport) */
  data: WorkflowData;
  /** ISO timestamp of creation */
  created_at: string;
  /** ISO timestamp of last update */
  updated_at: string;
}

/**
 * Workflow summary for list views (without full data)
 */
export interface WorkflowSummary {
  /** Unique identifier (UUID) */
  id: string;
  /** Workflow display name */
  name: string;
  /** ISO timestamp of creation */
  created_at: string;
  /** ISO timestamp of last update */
  updated_at: string;
}

/**
 * Default viewport configuration
 */
export const DEFAULT_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

/**
 * Default empty workflow data
 */
export const DEFAULT_WORKFLOW_DATA: WorkflowData = {
  nodes: [],
  edges: [],
  viewport: DEFAULT_VIEWPORT,
};

/**
 * Workflow export/import format
 */
export interface WorkflowExport {
  /** Export format version */
  version: string;
  /** Workflow display name */
  name: string;
  /** Workflow data */
  data: WorkflowData;
  /** Export timestamp */
  exportedAt: string;
}

/**
 * Viewport state for React Flow
 */
export interface ViewportState {
  /** X coordinate of viewport center */
  x: number;
  /** Y coordinate of viewport center */
  y: number;
  /** Zoom level */
  zoom: number;
}

/**
 * Undo/Redo history entry
 */
export interface HistoryEntry {
  /** Nodes state at this point */
  nodes: Node[];
  /** Edges state at this point */
  edges: Edge[];
}

/**
 * Interaction mode for the canvas
 */
export type InteractionMode = 'select' | 'pan';
