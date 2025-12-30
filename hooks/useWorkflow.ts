/**
 * @fileoverview Central workflow state management hook
 * @module Hooks/UseWorkflow
 *
 * ## Performance Optimizations
 *
 * 1. **useNodesState/useEdgesState**: React Flow's optimized state hooks that
 *    batch updates and minimize re-renders when nodes/edges change.
 *
 * 2. **useCallback for all handlers**: All functions passed to children are
 *    wrapped in useCallback to maintain referential equality, preventing
 *    unnecessary re-renders of child components that depend on these functions.
 *
 * 3. **nodesRef pattern**: Uses a ref to access current nodes in callbacks
 *    without adding nodes to dependency arrays, avoiding callback recreation
 *    on every node change.
 *
 * 4. **Selective updates**: updateNodeData only updates the specific node,
 *    not the entire nodes array, using functional updates.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from 'reactflow';
import type { WorkflowData } from '@/types/workflow';
import { DEFAULT_VIEWPORT } from '@/types/workflow';
import type { TextNodeData, ImageNodeData, LLMNodeData } from '@/types/nodes';
import { DEFAULT_MODEL_ID } from '@/constants/models';

/**
 * Return type for useWorkflow hook
 */
interface UseWorkflowReturn {
  /** Current nodes array */
  nodes: Node[];
  /** Current edges array */
  edges: Edge[];
  /** Selected node ID */
  selectedNodeId: string | null;
  /** Selected edge ID */
  selectedEdgeId: string | null;
  /** Current flow name */
  flowName: string;

  /** Set nodes state */
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  /** Set edges state */
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  /** Handler for node changes */
  onNodesChange: OnNodesChange;
  /** Handler for edge changes */
  onEdgesChange: OnEdgesChange;
  /** Handler for new connections */
  onConnect: OnConnect;

  /** Select a node by ID */
  selectNode: (nodeId: string | null) => void;
  /** Get the currently selected node */
  getSelectedNode: () => Node | null;
  /** Select an edge by ID */
  selectEdge: (edgeId: string | null) => void;

  /** Update data for a specific node */
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  /** Delete a node by ID */
  deleteNode: (nodeId: string) => void;
  /** Delete an edge by ID */
  deleteEdge: (edgeId: string) => void;
  /** Add a new node */
  addNode: (type: string, position: { x: number; y: number }) => void;

  /** Set the flow name */
  setFlowName: (name: string) => void;
  /** Get current workflow data */
  getWorkflowData: () => WorkflowData;
  /** Load workflow data */
  loadWorkflowData: (data: WorkflowData) => void;
}

/**
 * Node data type for initial node creation
 */
type NodeData = TextNodeData | ImageNodeData | LLMNodeData | { label: string };

/**
 * Get initial data for a node type
 *
 * @param {string} type - Node type
 * @returns {NodeData} Initial node data
 */
function getInitialNodeData(type: string): NodeData {
  switch (type) {
    case 'text':
      return {
        label: 'Text',
        content: '',
      };
    case 'system':
      return {
        label: 'System Prompt',
        content: '',
      };
    case 'image':
      return {
        label: 'Image',
        imageData: null,
        fileName: null,
        mimeType: null,
      };
    case 'llm':
      return {
        label: 'LLM',
        model: DEFAULT_MODEL_ID,
        output: '',
        isLoading: false,
        error: null,
      };
    default:
      return { label: type };
  }
}

/**
 * useWorkflow - Central workflow state management
 *
 * @returns {UseWorkflowReturn} Workflow state and operations
 *
 * @example
 * const {
 *   nodes,
 *   edges,
 *   onNodesChange,
 *   onEdgesChange,
 *   onConnect,
 *   addNode,
 * } = useWorkflow();
 */
export function useWorkflow(): UseWorkflowReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState('Untitled Workflow');

  /**
   * Ref to always have latest nodes for edge color calculation
   *
   * Performance: This pattern allows onConnect to access current nodes
   * without including `nodes` in its dependency array. If we used `nodes`
   * directly, onConnect would be recreated on every node change, causing
   * React Flow to re-bindall connection handlers.
   */
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  /**
   * Handle new connections between nodes
   *
   * Performance: Uses nodesRef instead of nodes to avoid recreating
   * this callback on every node change. The ref provides access to
   * current nodes while keeping the dependency array stable ([setEdges]).
   */
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      // Get edge color based on source node type using ref for latest nodes
      const currentNodes = nodesRef.current;
      const sourceNode = currentNodes.find((n) => n.id === connection.source);
      let edgeColor = '#F1A0FA'; // default pink

      if (sourceNode) {
        switch (sourceNode.type) {
          case 'system':
            edgeColor = '#F5D547'; // yellow
            break;
          case 'text':
            edgeColor = '#F1A0FA'; // pink
            break;
          case 'image':
            edgeColor = '#6EDDB3'; // green
            break;
          case 'llm':
            edgeColor = '#FFFFFF'; // white
            break;
        }
      }

      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        style: { stroke: edgeColor, strokeWidth: 2 },
        animated: true,
        type: 'smoothstep',
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  /**
   * Select a node by ID
   */
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    // Deselect edge when selecting a node
    if (nodeId) {
      setSelectedEdgeId(null);
    }
  }, []);

  /**
   * Select an edge by ID
   */
  const selectEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeId(edgeId);
    // Deselect node when selecting an edge
    if (edgeId) {
      setSelectedNodeId(null);
    }
  }, []);

  /**
   * Get the currently selected node
   */
  const getSelectedNode = useCallback((): Node | null => {
    if (!selectedNodeId) return null;
    return nodes.find((node) => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  /**
   * Update data for a specific node
   *
   * Performance: Uses functional update pattern (setNodes(nds => ...))
   * which allows React to batch updates and doesn't require `nodes`
   * in the dependency array. This prevents the callback from being
   * recreated when nodes change.
   */
  const updateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Shallow merge new data into existing node data
            return {
              ...node,
              data: { ...node.data, ...data },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  /**
   * Delete a node by ID
   */
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [setNodes, setEdges, selectedNodeId]
  );

  /**
   * Delete an edge by ID
   */
  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
      if (selectedEdgeId === edgeId) {
        setSelectedEdgeId(null);
      }
    },
    [setEdges, selectedEdgeId]
  );

  /**
   * Add a new node
   */
  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getInitialNodeData(type),
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  /**
   * Get current workflow data
   */
  const getWorkflowData = useCallback((): WorkflowData => {
    return {
      nodes,
      edges,
      viewport: DEFAULT_VIEWPORT,
    };
  }, [nodes, edges]);

  /**
   * Load workflow data
   */
  const loadWorkflowData = useCallback(
    (data: WorkflowData) => {
      setNodes(data.nodes);
      setEdges(data.edges);
      setSelectedNodeId(null);
    },
    [setNodes, setEdges]
  );

  return {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    flowName,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectNode,
    getSelectedNode,
    selectEdge,
    updateNodeData,
    deleteNode,
    deleteEdge,
    addNode,
    setFlowName,
    getWorkflowData,
    loadWorkflowData,
  };
}
