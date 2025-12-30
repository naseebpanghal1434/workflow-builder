/**
 * @fileoverview Workflow editor page
 * @module App/Workflow/[id]/Page
 */

'use client';

import { useState, useCallback, useMemo, useEffect, type ReactElement, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Canvas } from '@/components/layout/Canvas';
import { BottomToolbar } from '@/components/layout/BottomToolbar';
import { PropertiesPanel } from '@/components/layout/PropertiesPanel';
import { SaveIndicator } from '@/components/layout/SaveIndicator';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAutoSave } from '@/hooks/useAutoSave';
import { nodeTypes } from '@/components/nodes';
import { executeLLMNode } from '@/lib/utils/input-chaining';
import { cn } from '@/lib/utils/cn';
import { getWorkflow } from '@/lib/db/workflows';
import type { Node } from 'reactflow';

/**
 * WorkflowEditor - Main workflow editor interface
 *
 * @component
 * @returns {ReactElement} Rendered workflow editor
 */
function WorkflowEditor(): ReactElement {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Interaction mode
  const [interactionMode, setInteractionMode] = useState<'select' | 'pan'>('select');

  // LLM running state
  const [isLLMRunning, setIsLLMRunning] = useState(false);

  // Zoom state (default 75%)
  const [zoom, setZoom] = useState(0.75);

  // React Flow instance
  const reactFlowInstance = useReactFlow();

  // Workflow state
  const {
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
  } = useWorkflow();

  // Undo/Redo
  const { undo, redo, canUndo, canRedo, saveState, pushToFuture } = useUndoRedo();

  // Auto-save
  const { saveStatus, lastSavedAt, error: saveError, triggerSave } = useAutoSave({
    workflowId,
    nodes,
    edges,
    flowName,
    enabled: !isLoading && !loadError,
  });

  /**
   * Load workflow on mount
   */
  useEffect(() => {
    async function loadWorkflow() {
      setIsLoading(true);
      setLoadError(null);

      const result = await getWorkflow(workflowId);

      if (result.success) {
        setFlowName(result.data.name);
        loadWorkflowData(result.data.data);
      } else {
        setLoadError(result.error);
      }

      setIsLoading(false);
    }

    loadWorkflow();
  }, [workflowId, setFlowName, loadWorkflowData]);

  /**
   * Handle undo action
   */
  const handleUndo = useCallback(() => {
    // Save current state to future for redo
    pushToFuture(nodes, edges);

    const state = undo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [undo, setNodes, setEdges, pushToFuture, nodes, edges]);

  /**
   * Handle redo action
   */
  const handleRedo = useCallback(() => {
    // Save current state to past for undo (don't clear future)
    saveState(nodes, edges, false);

    const state = redo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, [redo, setNodes, setEdges, saveState, nodes, edges]);

  /**
   * Handle node click
   */
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  /**
   * Handle pane click (deselect)
   */
  const handlePaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  /**
   * Handle edge click
   */
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: { id: string }) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  /**
   * Handle adding new node
   */
  const handleAddNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      saveState(nodes, edges);
      addNode(type, position);
    },
    [addNode, saveState, nodes, edges]
  );

  /**
   * Handle model change for LLM node
   */
  const handleModelChange = useCallback(
    (nodeId: string, model: string) => {
      updateNodeData(nodeId, { model });
    },
    [updateNodeData]
  );

  /**
   * Handle LLM run - collects inputs from connected nodes and executes
   */
  const handleLLMRun = useCallback(
    async (nodeId: string) => {
      setIsLLMRunning(true);
      updateNodeData(nodeId, { isLoading: true, error: null, output: '' });

      try {
        // Use input chaining to collect inputs and execute
        const result = await executeLLMNode(nodeId, nodes, edges);

        if (result.success && result.output) {
          updateNodeData(nodeId, { output: result.output, isLoading: false });
        } else {
          updateNodeData(nodeId, { error: result.error, isLoading: false });
        }
      } catch {
        updateNodeData(nodeId, {
          error: 'Failed to run LLM. Please try again.',
          isLoading: false,
        });
      } finally {
        setIsLLMRunning(false);
      }
    },
    [updateNodeData, nodes, edges]
  );

  /**
   * Handle text node content change
   */
  const handleTextChange = useCallback(
    (nodeId: string, content: string) => {
      updateNodeData(nodeId, { content });
    },
    [updateNodeData]
  );

  /**
   * Handle image node change
   */
  const handleImageChange = useCallback(
    (nodeId: string, imageData: string | null, fileName: string | null, mimeType: string | null) => {
      updateNodeData(nodeId, { imageData, fileName, mimeType });
    },
    [updateNodeData]
  );

  /**
   * Create delete handler for a node
   */
  const createDeleteHandler = useCallback(
    (nodeId: string) => () => {
      saveState(nodes, edges);
      deleteNode(nodeId);
    },
    [saveState, nodes, edges, deleteNode]
  );

  /**
   * Nodes with injected callbacks for interactive nodes
   */
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => {
      if (node.type === 'text' || node.type === 'system') {
        return {
          ...node,
          data: {
            ...node.data,
            onChange: (content: string) => handleTextChange(node.id, content),
            onDelete: createDeleteHandler(node.id),
          },
        };
      }
      if (node.type === 'image') {
        return {
          ...node,
          data: {
            ...node.data,
            onImageChange: (imageData: string | null, fileName: string | null, mimeType: string | null) =>
              handleImageChange(node.id, imageData, fileName, mimeType),
            onDelete: createDeleteHandler(node.id),
          },
        };
      }
      if (node.type === 'llm') {
        return {
          ...node,
          data: {
            ...node.data,
            onRun: () => handleLLMRun(node.id),
            onDelete: createDeleteHandler(node.id),
          },
        };
      }
      return node;
    });
  }, [nodes, edges, handleLLMRun, handleTextChange, handleImageChange, createDeleteHandler]);

  /**
   * Handle zoom change from toolbar dropdown
   */
  const handleZoomChange = useCallback(
    (newZoom: number) => {
      setZoom(newZoom);
      reactFlowInstance.setViewport(
        { ...reactFlowInstance.getViewport(), zoom: newZoom },
        { duration: 200 }
      );
    },
    [reactFlowInstance]
  );

  /**
   * Handle zoom change from canvas (pinch/scroll)
   */
  const handleCanvasZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  /**
   * Handle fit view
   */
  const handleFitView = useCallback(() => {
    if (nodes.length === 0) {
      // No nodes - reset to default center view
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 0.75 }, { duration: 200 });
      setZoom(0.75);
      return;
    }

    reactFlowInstance.fitView({ duration: 200, padding: 0.2 });
    // Update zoom state after animation completes
    setTimeout(() => {
      setZoom(reactFlowInstance.getViewport().zoom);
    }, 250);
  }, [reactFlowInstance, nodes.length]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onDelete: () => {
      if (selectedNodeId) {
        saveState(nodes, edges);
        deleteNode(selectedNodeId);
      } else if (selectedEdgeId) {
        saveState(nodes, edges);
        deleteEdge(selectedEdgeId);
      }
    },
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDeselect: () => {
      selectNode(null);
      selectEdge(null);
    },
  });

  /**
   * Handle flow name input change
   */
  function handleFlowNameChange(e: ChangeEvent<HTMLInputElement>): void {
    setFlowName(e.target.value);
  }

  /**
   * Navigate back to home
   */
  function handleBackClick(): void {
    router.push('/');
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-canvas items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
          <span className="text-white/60">Loading workflow...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex h-screen w-full bg-canvas items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-red-400">{loadError}</span>
          <button
            onClick={handleBackClick}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-canvas">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Floating Top Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          {/* Left section: Back button + Workflow Name */}
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Back Button */}
            <button
              onClick={handleBackClick}
              className={cn(
                'w-10 h-10 flex items-center justify-center',
                'bg-[#212126] border border-white/[0.04] rounded-[8px]',
                'text-white/60 hover:text-white/90 hover:bg-[#2a2a2f]',
                'transition-colors'
              )}
            >
              <ArrowLeft size={18} />
            </button>

            {/* Workflow Name Input */}
            <input
              type="text"
              value={flowName}
              onChange={handleFlowNameChange}
              placeholder="Untitled Workflow"
              className={cn(
                'w-[220px] h-10 pl-4 pr-2 py-1.5',
                'bg-[#212126] border border-white/[0.04] rounded-[8px]',
                'text-sm text-white/90 placeholder:text-white/40',
                'focus:outline-none focus:border-white/10'
              )}
            />
          </div>

          {/* Right section: Save Indicator */}
          <SaveIndicator
            status={saveStatus}
            lastSavedAt={lastSavedAt}
            error={saveError}
          />
        </div>

        {/* Canvas */}
        <Canvas
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          nodeTypes={nodeTypes}
          onAddNode={handleAddNode}
          interactionMode={interactionMode}
          defaultZoom={0.75}
          onZoomChange={handleCanvasZoomChange}
        />

        {/* Bottom Toolbar */}
        <BottomToolbar
          activeTool={interactionMode}
          onToolChange={setInteractionMode}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onFitView={handleFitView}
        />
      </div>

      {/* Properties Panel (only shows for LLM nodes) */}
      <PropertiesPanel
        selectedNode={getSelectedNode()}
        onModelChange={handleModelChange}
        onRun={handleLLMRun}
        isRunning={isLLMRunning}
      />
    </div>
  );
}

/**
 * WorkflowPage - Page wrapper with ReactFlowProvider
 *
 * @component
 * @returns {ReactElement} Rendered page
 */
export default function WorkflowPage(): ReactElement {
  return (
    <ReactFlowProvider>
      <WorkflowEditor />
    </ReactFlowProvider>
  );
}
