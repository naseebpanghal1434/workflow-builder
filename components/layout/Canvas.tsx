/**
 * @fileoverview React Flow canvas wrapper component
 * @module Components/Layout/Canvas
 */

'use client';

import { useCallback, useMemo, type ReactElement, type DragEvent } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  useReactFlow,
  NodeTypes,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils/cn';

/**
 * Props for the Canvas component
 */
interface CanvasProps {
  /** Current nodes array */
  nodes: Node[];
  /** Current edges array */
  edges: Edge[];
  /** Node change handler */
  onNodesChange: OnNodesChange;
  /** Edge change handler */
  onEdgesChange: OnEdgesChange;
  /** Connection handler */
  onConnect: OnConnect;
  /** Connection validation handler */
  isValidConnection?: (connection: Connection) => boolean;
  /** Node click handler */
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  /** Edge click handler */
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  /** Pane click handler (deselect) */
  onPaneClick: () => void;
  /** Currently selected node ID */
  selectedNodeId: string | null;
  /** Currently selected edge ID */
  selectedEdgeId?: string | null;
  /** Custom node types */
  nodeTypes: NodeTypes;
  /** Handler for adding new node */
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  /** Current interaction mode */
  interactionMode: 'select' | 'pan';
  /** Default zoom level */
  defaultZoom?: number;
  /** Zoom change callback */
  onZoomChange?: (zoom: number) => void;
}

/**
 * Pro options for React Flow
 * hideAttribution removes the "React Flow" watermark (requires Pro license for commercial use)
 */
const proOptions = {
  hideAttribution: false,
};

/**
 * Canvas - React Flow canvas wrapper with configurations
 *
 * @component
 * @param {CanvasProps} props - Component props
 * @returns {ReactElement} Rendered canvas
 *
 * @example
 * <Canvas
 *   nodes={nodes}
 *   edges={edges}
 *   onNodesChange={onNodesChange}
 *   onEdgesChange={onEdgesChange}
 *   onConnect={onConnect}
 *   onNodeClick={handleNodeClick}
 *   onPaneClick={handlePaneClick}
 *   selectedNodeId={selectedId}
 *   nodeTypes={nodeTypes}
 *   onAddNode={handleAddNode}
 *   interactionMode="select"
 * />
 */
export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  isValidConnection,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  selectedEdgeId,
  nodeTypes,
  onAddNode,
  interactionMode,
  defaultZoom = 0.75,
  onZoomChange,
}: CanvasProps): ReactElement {
  const reactFlowInstance = useReactFlow();

  /**
   * Edges with selection styling
   *
   * Memoized to prevent unnecessary recalculations on every render.
   * Only recalculates when edges array or selected edge changes.
   * Applies visual feedback (thicker stroke + glow) to selected edge.
   */
  const styledEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        // Thicker stroke for selected edge (3px vs 2px)
        strokeWidth: edge.id === selectedEdgeId ? 3 : 2,
        // Glow effect for selected edge using CSS filter
        filter: edge.id === selectedEdgeId ? 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' : undefined,
      },
    }));
  }, [edges, selectedEdgeId]);

  /**
   * Handle viewport move end - report zoom changes
   */
  const onMoveEnd = useCallback(
    (_event: unknown, viewport: { zoom: number }) => {
      onZoomChange?.(viewport.zoom);
    },
    [onZoomChange]
  );

  /**
   * Handle drag over - allow drop
   */
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Handle drop - create new node at drop position
   *
   * Flow:
   * 1. Read node type from dataTransfer (set by DraggableNodeButton)
   * 2. Convert screen coordinates to flow coordinates (accounting for pan/zoom)
   * 3. Delegate to onAddNode which creates the node in workflow state
   */
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // Get the node type from drag data (e.g., 'text', 'llm', 'image')
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      // Convert screen position to flow position
      // This accounts for canvas pan offset and zoom level
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onAddNode(type, position);
    },
    [reactFlowInstance, onAddNode]
  );

  return (
    <div className={cn('flex-1 h-full bg-canvas')}>
      {/*
        React Flow Configuration:
        - panOnDrag: When 'pan' mode, dragging moves canvas; when 'select', dragging creates selection box
        - selectionOnDrag: Enables box selection in 'select' mode
        - zoomOnScroll: Mouse wheel zooms (panOnScroll disabled to avoid conflicts)
        - minZoom/maxZoom: Constrains zoom range (25% to 200%)
        - edgesUpdatable: Allows reconnecting edge endpoints by dragging
      */}
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        panOnDrag={interactionMode === 'pan'}
        selectionOnDrag={interactionMode === 'select'}
        panOnScroll={false}
        zoomOnScroll={true}
        defaultViewport={{ x: 0, y: 0, zoom: defaultZoom }}
        minZoom={0.25}
        maxZoom={2}
        edgesUpdatable
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#65616b"
        />
        {/*
          MiniMap: Shows bird's eye view of the canvas
          - nodeColor function returns colors matching each node type's theme
          - maskColor darkens areas outside the current viewport
          - pannable/zoomable allows navigation via minimap
        */}
        <MiniMap
          position="bottom-right"
          style={{
            background: '#212126',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
          maskColor="rgba(14, 14, 19, 0.8)"
          nodeColor={(node) => {
            // Return theme color matching each node type
            switch (node.type) {
              case 'system':
                return '#F5D547'; // Yellow for system prompts
              case 'text':
                return '#F1A0FA'; // Pink for text/prompts
              case 'image':
                return '#6EDDB3'; // Green for images
              case 'llm':
                return '#FFFFFF'; // White for LLM nodes
              default:
                return '#888888'; // Gray fallback
            }
          }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
