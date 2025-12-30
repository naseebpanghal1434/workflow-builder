/**
 * @fileoverview Workflow export and import utilities
 * @module Lib/Utils/WorkflowExport
 */

import type { Node, Edge, Viewport } from 'reactflow';
import type { WorkflowData } from '@/types/workflow';

/**
 * Exported workflow file structure
 */
export interface ExportedWorkflow {
  /** Format version for future compatibility */
  version: '1.0';
  /** Workflow name */
  name: string;
  /** ISO timestamp of export */
  exportedAt: string;
  /** Workflow data */
  data: WorkflowData;
}

/**
 * Exports workflow to JSON string
 *
 * @param {string} name - Workflow name
 * @param {Node[]} nodes - Workflow nodes
 * @param {Edge[]} edges - Workflow edges
 * @param {Viewport} viewport - Canvas viewport
 * @returns {string} JSON string representation
 *
 * @example
 * const json = exportWorkflowToJSON('My Workflow', nodes, edges, viewport);
 */
export function exportWorkflowToJSON(
  name: string,
  nodes: Node[],
  edges: Edge[],
  viewport: Viewport
): string {
  const exported: ExportedWorkflow = {
    version: '1.0',
    name,
    exportedAt: new Date().toISOString(),
    data: { nodes, edges, viewport },
  };

  return JSON.stringify(exported, null, 2);
}

/**
 * Parses and validates imported workflow JSON
 *
 * @param {string} json - JSON string to parse
 * @returns {{ success: true; data: ExportedWorkflow } | { success: false; error: string }}
 *
 * @example
 * const result = importWorkflowFromJSON(jsonString);
 * if (result.success) {
 *   setNodes(result.data.data.nodes);
 * }
 */
export function importWorkflowFromJSON(
  json: string
): { success: true; data: ExportedWorkflow } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(json);

    // Validate structure
    if (!parsed.version || !parsed.data) {
      return { success: false, error: 'Invalid workflow file format' };
    }

    if (!Array.isArray(parsed.data.nodes) || !Array.isArray(parsed.data.edges)) {
      return { success: false, error: 'Invalid workflow data structure' };
    }

    return { success: true, data: parsed as ExportedWorkflow };
  } catch {
    return { success: false, error: 'Failed to parse workflow file' };
  }
}

/**
 * Triggers download of workflow as JSON file
 *
 * @param {string} name - Workflow name (used for filename)
 * @param {Node[]} nodes - Workflow nodes
 * @param {Edge[]} edges - Workflow edges
 * @param {Viewport} viewport - Canvas viewport
 *
 * @example
 * downloadWorkflow('My Workflow', nodes, edges, viewport);
 */
export function downloadWorkflow(
  name: string,
  nodes: Node[],
  edges: Edge[],
  viewport: Viewport
): void {
  const json = exportWorkflowToJSON(name, nodes, edges, viewport);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const filename = `${name.replace(/\s+/g, '-').toLowerCase()}-workflow.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Opens file picker and imports workflow from selected JSON file
 *
 * @returns {Promise<ExportedWorkflow | null>} Imported workflow or null if cancelled/failed
 *
 * @example
 * const workflow = await uploadWorkflow();
 * if (workflow) {
 *   setNodes(workflow.data.nodes);
 *   setEdges(workflow.data.edges);
 * }
 */
export function uploadWorkflow(): Promise<ExportedWorkflow | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const text = await file.text();
        const result = importWorkflowFromJSON(text);

        if (result.success) {
          resolve(result.data);
        } else {
          console.error('Import error:', result.error);
          resolve(null);
        }
      } catch (error) {
        console.error('File read error:', error);
        resolve(null);
      }
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}

/**
 * Validate workflow data structure
 *
 * @param {unknown} data - Data to validate
 * @returns {data is WorkflowData} Whether the data is valid
 *
 * @example
 * if (isValidWorkflowData(data)) {
 *   // data is typed as WorkflowData
 * }
 */
export function isValidWorkflowData(data: unknown): data is WorkflowData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const workflowData = data as Record<string, unknown>;

  return (
    Array.isArray(workflowData.nodes) &&
    Array.isArray(workflowData.edges)
  );
}
