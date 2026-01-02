/**
 * @fileoverview Connection validation utilities for React Flow
 * @module Lib/Utils/ConnectionValidation
 *
 * Validates connections between nodes based on:
 * 1. Handle type compatibility (text→text, image→image, etc.)
 * 2. Cycle detection (prevents circular connections)
 */

import type { Edge } from 'reactflow';
import { NODE_TYPES } from '@/types/nodes';

/**
 * Map of node types to their output data types
 * - text, image, system nodes output their respective types
 * - llm and imgDescribe output text (they generate text responses)
 */
const NODE_OUTPUT_TYPE: Record<string, string> = {
  [NODE_TYPES.TEXT_INPUT]: 'text',
  [NODE_TYPES.IMAGE_INPUT]: 'image',
  [NODE_TYPES.SYSTEM_PROMPT]: 'system',
  [NODE_TYPES.LLM]: 'text',
  [NODE_TYPES.IMG_DESCRIBE]: 'text',
};

/**
 * Get the output type for a given node type
 *
 * @param {string | undefined} nodeType - The node type
 * @returns {string | null} The output type or null if unknown
 */
export function getNodeOutputType(nodeType: string | undefined): string | null {
  if (!nodeType) return null;
  return NODE_OUTPUT_TYPE[nodeType] ?? null;
}

/**
 * Check if a source node's output is compatible with a target handle
 *
 * @param {string | undefined} sourceNodeType - The source node type
 * @param {string | null | undefined} targetHandleId - The target handle ID (text, image, system)
 * @returns {boolean} True if compatible
 */
export function isHandleCompatible(
  sourceNodeType: string | undefined,
  targetHandleId: string | null | undefined
): boolean {
  const outputType = getNodeOutputType(sourceNodeType);

  // If we can't determine the output type, allow connection (fail open)
  if (!outputType) return true;

  // If target handle is 'output' or undefined, it's a source handle - allow
  if (!targetHandleId || targetHandleId === 'output') return true;

  // Check if output type matches target handle ID
  return outputType === targetHandleId;
}

/**
 * Check if adding a connection would create a cycle in the graph
 * Uses DFS to detect if target can reach source through existing edges
 *
 * @param {string} sourceId - Source node ID
 * @param {string} targetId - Target node ID
 * @param {Edge[]} edges - Current edges in the graph
 * @returns {boolean} True if adding this connection would create a cycle
 */
export function wouldCreateCycle(
  sourceId: string,
  targetId: string,
  edges: Edge[]
): boolean {
  // Self-loop is a cycle
  if (sourceId === targetId) return true;

  // Build adjacency list for traversal
  const adjacencyList = new Map<string, string[]>();
  for (const edge of edges) {
    const sources = adjacencyList.get(edge.source) ?? [];
    sources.push(edge.target);
    adjacencyList.set(edge.source, sources);
  }

  // DFS to check if we can reach sourceId starting from targetId
  const visited = new Set<string>();
  const stack = [targetId];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current === sourceId) {
      // Found a path from target to source, adding source→target would create cycle
      return true;
    }

    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = adjacencyList.get(current) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return false;
}
