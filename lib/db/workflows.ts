/**
 * @fileoverview Client-side API service for workflow operations
 * @module Lib/DB/Workflows
 */

import type { Workflow, WorkflowData, WorkflowSummary } from '@/types/workflow';

/**
 * API operation result type
 */
type APIResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Creates a new workflow via API
 *
 * @param {string} name - Workflow name
 * @param {WorkflowData} data - Workflow data (nodes, edges, viewport)
 * @returns {Promise<APIResult<Workflow>>} Created workflow or error
 *
 * @example
 * const result = await createWorkflow('My Workflow', { nodes: [], edges: [], viewport });
 * if (result.success) {
 *   console.log('Created:', result.data.id);
 * }
 */
export async function createWorkflow(
  name: string,
  data: WorkflowData
): Promise<APIResult<Workflow>> {
  try {
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, data }),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Failed to create workflow' };
    }
  } catch (error) {
    console.error('[API Client] Create workflow error:', error);
    return { success: false, error: 'Failed to connect to server' };
  }
}

/**
 * Retrieves a workflow by ID via API
 *
 * @param {string} id - Workflow UUID
 * @returns {Promise<APIResult<Workflow>>} Workflow data or error
 *
 * @example
 * const result = await getWorkflow('uuid-here');
 * if (result.success) {
 *   setNodes(result.data.data.nodes);
 * }
 */
export async function getWorkflow(id: string): Promise<APIResult<Workflow>> {
  try {
    const response = await fetch(`/api/workflows/${id}`);
    const result = await response.json();

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Failed to retrieve workflow' };
    }
  } catch (error) {
    console.error('[API Client] Get workflow error:', error);
    return { success: false, error: 'Failed to connect to server' };
  }
}

/**
 * Updates an existing workflow via API
 *
 * @param {string} id - Workflow UUID
 * @param {Partial<{ name: string; data: WorkflowData }>} updates - Fields to update
 * @returns {Promise<APIResult<Workflow>>} Updated workflow or error
 *
 * @example
 * const result = await updateWorkflow('uuid', { name: 'New Name' });
 */
export async function updateWorkflow(
  id: string,
  updates: Partial<{ name: string; data: WorkflowData }>
): Promise<APIResult<Workflow>> {
  try {
    const response = await fetch(`/api/workflows/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Failed to update workflow' };
    }
  } catch (error) {
    console.error('[API Client] Update workflow error:', error);
    return { success: false, error: 'Failed to connect to server' };
  }
}

/**
 * Deletes a workflow via API
 *
 * @param {string} id - Workflow UUID
 * @returns {Promise<APIResult<void>>} Success or error
 *
 * @example
 * const result = await deleteWorkflow('uuid');
 */
export async function deleteWorkflow(id: string): Promise<APIResult<void>> {
  try {
    const response = await fetch(`/api/workflows/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: undefined };
    } else {
      return { success: false, error: result.error || 'Failed to delete workflow' };
    }
  } catch (error) {
    console.error('[API Client] Delete workflow error:', error);
    return { success: false, error: 'Failed to connect to server' };
  }
}

/**
 * Lists all workflows via API (summary only, without full data)
 *
 * @param {number} limit - Maximum number of workflows to return
 * @returns {Promise<APIResult<WorkflowSummary[]>>} List of workflow summaries
 *
 * @example
 * const result = await listWorkflows(10);
 * if (result.success) {
 *   result.data.forEach(w => console.log(w.name));
 * }
 */
export async function listWorkflows(
  limit: number = 50
): Promise<APIResult<WorkflowSummary[]>> {
  try {
    const response = await fetch(`/api/workflows?limit=${limit}`);
    const result = await response.json();

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error || 'Failed to retrieve workflows' };
    }
  } catch (error) {
    console.error('[API Client] List workflows error:', error);
    return { success: false, error: 'Failed to connect to server' };
  }
}
