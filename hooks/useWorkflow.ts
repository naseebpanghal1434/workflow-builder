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

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  useNodesState,
  useEdgesState,
  useStoreApi,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from "reactflow";
import type { WorkflowData } from "@/types/workflow";
import { DEFAULT_VIEWPORT } from "@/types/workflow";
import {
  type TextNodeData,
  type ImageNodeData,
  type LLMNodeData,
  NODE_TYPES,
  ImageDescribeNodeData,
  NODE_TYPES_LABELS,
} from "@/types/nodes";
import { DEFAULT_MODEL_ID } from "@/constants/models";
import {
  isHandleCompatible,
  wouldCreateCycle,
} from "@/lib/utils/connectionValidation";

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
  /** Validate if a connection is allowed */
  isValidConnection: (connection: Connection) => boolean;

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
type NodeData =
  | TextNodeData
  | ImageNodeData
  | LLMNodeData
  | ImageDescribeNodeData
  | { label: string };

/**
 * Get initial data for a node type
 *
 * @param {string} type - Node type
 * @returns {NodeData} Initial node data
 */
function getInitialNodeData(type: string): NodeData {
  switch (type) {
    case NODE_TYPES.TEXT_INPUT:
      return {
        label: NODE_TYPES_LABELS[type],
        content: "",
      };
    case NODE_TYPES.SYSTEM_PROMPT:
      return {
        label: NODE_TYPES_LABELS[type],
        content: "",
      };
    case NODE_TYPES.IMAGE_INPUT:
      return {
        label: NODE_TYPES_LABELS[type],
        imageData: null,
        fileName: null,
        mimeType: null,
      };
    case NODE_TYPES.LLM:
      return {
        label: NODE_TYPES_LABELS[type],
        model: DEFAULT_MODEL_ID,
        output: "",
        isLoading: false,
        error: null,
      };
    case NODE_TYPES.IMG_DESCRIBE:
      return {
        label: NODE_TYPES_LABELS[type],
        model: DEFAULT_MODEL_ID,
        prompt:
          "You are an expert image analyst tasked with providing detailed accurate and helpful descriptions of images. Your goal is to make visual content accessible through clear comprehensive text descriptions. Be objective and factual using clear descriptive language. Organize information from general to specific and include relevant context. Start with a brief overview of what the image shows then describe the main subjects and setting. Include visual details like colors lighting, textures, style, genre, contrast and composition. Transcribe any visible text accurately. Use specific concrete language and mention spatial relationships. For people focus on actions clothing and general appearance respectfully. For data visualizations explain the information presented. Write as if describing to someone who cannot see the image including important context for understanding. Balance thoroughness with clarity and provide descriptions in natural flowing narrative form. Your description should not be longer than 500 characters",
        output: "",
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
  const [flowName, setFlowName] = useState("Untitled Workflow");

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
   * Ref to always have latest edges for cycle detection
   */
  const edgesRef = useRef(edges);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

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
      let edgeColor = "#F1A0FA"; // default pink

      if (sourceNode) {
        switch (sourceNode.type) {
          case "system":
            edgeColor = "#F5D547"; // yellow
            break;
          case "text":
            edgeColor = "#F1A0FA"; // pink
            break;
          case "image":
            edgeColor = "#6EDDB3"; // green
            break;
          case "llm":
            edgeColor = "#FFFFFF"; // white
            break;
        }
      }

      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        style: { stroke: edgeColor, strokeWidth: 2 },
        animated: true,
        type: "smoothstep",
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Get stable store API reference for real-time access inside callbacks
  // useStoreApi returns a stable reference that doesn't cause re-renders
  const storeApi = useStoreApi();

  /**
   * Validate if a connection is allowed
   *
   * Checks two conditions:
   * 1. Handle compatibility - source output type must match target handle type
   * 2. Cycle detection - connection must not create a circular dependency
   */
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      const { source, target, targetHandle } = connection;

      // Must have source and target
      if (!source || !target) return false;

      // Get real-time data from store API (stable reference, no re-renders)
      const state = storeApi.getState();
      const currentNodes = state.getNodes();
      const currentEdges = state.edges;

      // Get source node to determine its type
      const sourceNode = currentNodes.find((n) => n.id === source);

      // Check handle compatibility
      if (!isHandleCompatible(sourceNode?.type, targetHandle)) {
        return false;
      }

      // Check for cycles
      if (wouldCreateCycle(source, target, currentEdges)) {
        return false;
      }

      return true;
    },
    [storeApi]
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
    isValidConnection,
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
