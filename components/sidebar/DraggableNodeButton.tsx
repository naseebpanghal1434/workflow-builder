/**
 * @fileoverview Draggable node button for sidebar
 * @module Components/Sidebar/DraggableNodeButton
 */

'use client';

import type { ReactElement, ReactNode, DragEvent } from 'react';
import { cn } from '@/lib/utils/cn';
import { NodeType } from '@/types/nodes';
import { log } from 'console';

/**
 * Props for the DraggableNodeButton component
 */
interface DraggableNodeButtonProps {
  /** Node type identifier */
  nodeType: NodeType;
  /** Display label */
  label: string;
  /** Icon component */
  icon: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * DraggableNodeButton - Draggable button that creates nodes on canvas
 *
 * @component
 * @param {DraggableNodeButtonProps} props - Component props
 * @returns {ReactElement} Rendered draggable button
 *
 * @example
 * <DraggableNodeButton
 *   nodeType="text"
 *   label="Prompt"
 *   icon={<FileText size={24} />}
 * />
 */
export function DraggableNodeButton({
  nodeType,
  label,
  icon,
  className,
}: DraggableNodeButtonProps): ReactElement {
  /**
   * Handle drag start - set data transfer
   */
  function handleDragStart(event: DragEvent<HTMLDivElement>): void {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'aspect-square',
        'flex flex-col items-center justify-center gap-2 p-3',
        'bg-transparent border border-white/[0.06] rounded-lg',
        'cursor-grab active:cursor-grabbing',
        'transition-all duration-fast',
        'hover:border-white/15 hover:bg-white/5',
        className
      )}
    >
      <span className="text-white">{icon}</span>
      <span className="text-xs text-white text-center leading-tight">{label}</span>
    </div>
  );
}
