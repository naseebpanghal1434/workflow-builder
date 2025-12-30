/**
 * @fileoverview LLM processing node component
 * @module Components/Nodes/LLMNode
 */

'use client';

import { memo, useState, type ReactElement } from 'react';
import { Handle, Position, useStore, type NodeProps } from 'reactflow';
import { ArrowRight, Trash2, AlertCircle } from 'lucide-react';
import { NodeWrapper } from './NodeWrapper';
import { NodeMenu, type NodeMenuItem } from './NodeMenu';
import { Spinner } from '@/components/ui/Spinner';
import type { LLMNodeData } from '@/types/nodes';
import { cn } from '@/lib/utils/cn';

/**
 * Extended LLMNodeData with handlers
 */
interface LLMNodeDataWithHandler extends LLMNodeData {
  onRun?: () => void;
  onDelete?: () => void;
}

/**
 * LLMNode - Node for LLM processing with input/output handles
 *
 * @component
 * @param {NodeProps<LLMNodeData>} props - Node props from React Flow
 * @returns {ReactElement} Rendered LLM node
 *
 * @example
 * // Used internally by React Flow
 * nodeTypes={{ llm: LLMNode }}
 */
function LLMNodeComponent({
  data,
  selected,
}: NodeProps<LLMNodeData>): ReactElement {
  const extendedData = data as LLMNodeDataWithHandler;

  // Hover state for showing handle labels (improves UX by showing input/output names)
  const [isHovered, setIsHovered] = useState(false);

  // Detect when user is dragging an edge to connect nodes
  // useStore subscribes to React Flow's internal state - connectionNodeId is set during edge creation
  const isConnecting = useStore((state) => !!state.connectionNodeId);

  // Show handle labels when:
  // 1. User hovers over the node (to see available inputs/outputs)
  // 2. User is connecting an edge (to help them find the right handle)
  const showLabels = isHovered || isConnecting;

  /**
   * Handle run button click
   * stopPropagation prevents the click from triggering node selection
   * which would cause the Properties Panel to open/close unexpectedly
   */
  function handleRun(e: React.MouseEvent): void {
    e.stopPropagation();
    if (extendedData.onRun) {
      extendedData.onRun();
    }
  }

  /**
   * Menu items configuration
   */
  const menuItems: NodeMenuItem[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={14} />,
      onClick: () => extendedData.onDelete?.(),
      danger: true,
    },
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <NodeWrapper selected={selected}>
        {/*
          Input Handles (Left side)
          Each handle has a unique ID that determines how the input is processed:
          - 'system': Connected text becomes the system prompt (AI persona/instructions)
          - 'text': Connected text becomes the user message (main prompt)
          - 'image': Connected images are sent for multimodal processing
          Colors match the corresponding node type themes for visual consistency
        */}
        <Handle
          type="target"
          position={Position.Left}
          id="system"
          className="!w-[8px] !h-[8px] !border-0 !rounded-full"
          style={{ top: '25%', left: '-15px', background: '#F5D547' }} // Yellow - matches SystemPromptNode
        />
        <Handle
          type="target"
          position={Position.Left}
          id="text"
          className="!w-[8px] !h-[8px] !border-0 !rounded-full"
          style={{ top: '45%', left: '-15px', background: '#F1A0FA' }} // Pink - matches TextNode
        />
        <Handle
          type="target"
          position={Position.Left}
          id="image"
          className="!w-[8px] !h-[8px] !border-0 !rounded-full"
          style={{ top: '65%', left: '-15px', background: '#6EDDB3' }} // Green - matches ImageNode
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-white/80">Any LLM</span>
            {data.isLoading && <Spinner size="sm" className="text-handle-text" />}
          </div>
          <NodeMenu items={menuItems} />
        </div>

        {/* Error Message */}
        {data.error && (
          <div className="flex items-start gap-2 p-2 mb-3 bg-red-500/10 border border-red-500/20 rounded-sm">
            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-400">{data.error}</p>
          </div>
        )}

        {/* Output Area */}
        <div
          className={cn(
            'w-full p-3 bg-canvas border border-white/8 rounded-md',
            'text-sm text-white/80 overflow-y-auto',
            !data.output && 'flex items-center justify-center'
          )}
          style={{ height: '480px' }}
        >
          {data.output ? (
            <p className="whitespace-pre-wrap">{data.output}</p>
          ) : (
            <span className="text-white/40 text-sm">The generated text will appear here</span>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end mt-3">
          <button
            onClick={handleRun}
            disabled={data.isLoading}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md',
              'border border-white/20',
              'text-sm text-white/70',
              'hover:bg-white/10 transition-colors',
              data.isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <ArrowRight size={14} />
            <span>Run Model</span>
          </button>
        </div>

        {/*
          Output Handle (Right side)
          The LLM output can be connected to another LLM node's text input,
          enabling chained workflows where one LLM's response feeds into another
        */}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-[8px] !h-[8px] !border-0 !rounded-full"
          style={{ top: '50%', right: '-15px', background: '#FFFFFF' }} // White - LLM theme color
        />
      </NodeWrapper>

      {/* External Labels - Show on hover or when connecting */}
      {showLabels && (
        <>
          {/* Left side labels (inputs) */}
          <div className="absolute right-full top-0 h-full mr-2 pointer-events-none">
            <div className="absolute top-[25%] -translate-y-1/2 right-0 flex items-center gap-1.5">
              <span className="text-xs text-white/70 whitespace-nowrap bg-node/90 px-1.5 py-0.5 rounded">System</span>
            </div>
            <div className="absolute top-[45%] -translate-y-1/2 right-0 flex items-center gap-1.5">
              <span className="text-xs text-white/70 whitespace-nowrap bg-node/90 px-1.5 py-0.5 rounded">Text</span>
            </div>
            <div className="absolute top-[65%] -translate-y-1/2 right-0 flex items-center gap-1.5">
              <span className="text-xs text-white/70 whitespace-nowrap bg-node/90 px-1.5 py-0.5 rounded">Image</span>
            </div>
          </div>

          {/* Right side label (output) */}
          <div className="absolute left-full top-[50%] -translate-y-1/2 ml-2 pointer-events-none">
            <span className="text-xs text-white/70 whitespace-nowrap bg-node/90 px-1.5 py-0.5 rounded">Text</span>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Memoized LLMNode component
 *
 * Performance optimization: memo() prevents re-renders when parent re-renders
 * but this node's props (data, selected) haven't changed. This is important
 * because the canvas may have many nodes, and we don't want to re-render all
 * of them when only one node's data changes.
 */
export const LLMNode = memo(LLMNodeComponent);
