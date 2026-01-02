/**
 * @fileoverview Hook to track connection state and provide handle compatibility info
 * @module Hooks/UseConnectionState
 *
 * Uses React Flow's internal store to detect when a connection is being dragged
 * and determines which handles are compatible with the source node.
 */

'use client';

import { useStore } from 'reactflow';
import { getNodeOutputType } from '@/lib/utils/connectionValidation';

/**
 * Return type for useConnectionState hook
 */
interface UseConnectionStateReturn {
  /** Whether a connection is currently being dragged */
  isConnecting: boolean;
  /** The type of node the connection is being dragged from */
  connectingNodeType: string | null;
  /** Check if a target handle is compatible with the connecting node */
  isHandleCompatible: (handleId: string) => boolean;
}

/**
 * useConnectionState - Provides connection state for visual feedback
 *
 * @returns {UseConnectionStateReturn} Connection state and compatibility checker
 *
 * @example
 * const { isConnecting, isHandleCompatible } = useConnectionState();
 *
 * // In a handle:
 * <Handle
 *   style={{
 *     opacity: isConnecting && !isHandleCompatible('text') ? 0.3 : 1
 *   }}
 * />
 */
export function useConnectionState(): UseConnectionStateReturn {
  // Get the node ID that connection is being dragged from
  const connectionNodeId = useStore((state) => state.connectionNodeId);

  // Get all nodes to find the connecting node's type
  const nodes = useStore((state) => state.getNodes());

  // Find the connecting node and its type
  const connectingNode = connectionNodeId
    ? nodes.find((n) => n.id === connectionNodeId)
    : null;
  const connectingNodeType = connectingNode?.type ?? null;

  // Determine if connection is in progress
  const isConnecting = !!connectionNodeId;

  /**
   * Check if a target handle is compatible with the connecting node
   *
   * @param {string} handleId - The handle ID to check (e.g., 'text', 'image', 'system')
   * @returns {boolean} True if the handle is compatible
   */
  function isHandleCompatible(handleId: string): boolean {
    // If not connecting, all handles are "compatible" (no fading needed)
    if (!isConnecting || !connectingNodeType) return true;

    // Get the output type of the connecting node
    const outputType = getNodeOutputType(connectingNodeType);

    // If we can't determine output type, don't fade (fail open)
    if (!outputType) return true;

    // Handle is compatible if its ID matches the output type
    return handleId === outputType;
  }

  return {
    isConnecting,
    connectingNodeType,
    isHandleCompatible,
  };
}
