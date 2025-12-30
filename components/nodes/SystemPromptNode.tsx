/**
 * @fileoverview System prompt node component
 * @module Components/Nodes/SystemPromptNode
 */

'use client';

import { memo, type ReactElement, type ChangeEvent } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { NodeWrapper } from './NodeWrapper';
import { NodeMenu, type NodeMenuItem } from './NodeMenu';
import type { TextNodeData } from '@/types/nodes';

/**
 * Extended TextNodeData with optional handlers
 */
interface SystemPromptNodeDataWithHandler extends TextNodeData {
  /** Optional callback for content changes */
  onChange?: (content: string) => void;
  /** Optional callback for delete action */
  onDelete?: () => void;
}

/**
 * SystemPromptNode - Node for system prompt input with output handle
 *
 * @component
 * @param {NodeProps<SystemPromptNodeDataWithHandler>} props - Node props from React Flow
 * @returns {ReactElement} Rendered system prompt node
 *
 * @example
 * // Used internally by React Flow
 * nodeTypes={{ system: SystemPromptNode }}
 */
function SystemPromptNodeComponent({
  data,
  selected,
}: NodeProps<SystemPromptNodeDataWithHandler>): ReactElement {
  /**
   * Handle text change
   */
  function handleChange(e: ChangeEvent<HTMLTextAreaElement>): void {
    if (data.onChange) {
      data.onChange(e.target.value);
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
      onClick: () => data.onDelete?.(),
      danger: true,
    },
  ];

  return (
    <NodeWrapper selected={selected}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-medium text-white/80">System Prompt</span>
        <NodeMenu items={menuItems} />
      </div>

      {/* Text Area */}
      <textarea
        value={data.content}
        onChange={handleChange}
        placeholder="Enter system prompt here..."
        className="w-full h-32 p-3 bg-canvas border border-white/8 rounded-sm text-sm text-white/80 placeholder:text-white/40 resize-none focus:outline-none focus:border-white/16"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-[8px] !h-[8px] !border-0 !rounded-full"
        style={{ top: '50%', right: '-15px', background: '#F5D547' }}
      />
    </NodeWrapper>
  );
}

export const SystemPromptNode = memo(SystemPromptNodeComponent);
