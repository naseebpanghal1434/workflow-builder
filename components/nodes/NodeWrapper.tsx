/**
 * @fileoverview Shared node wrapper component for consistent styling
 * @module Components/Nodes/NodeWrapper
 */

'use client';

import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Props for the NodeWrapper component
 */
interface NodeWrapperProps {
  /** Child content */
  children: ReactNode;
  /** Whether node is selected */
  selected?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * NodeWrapper - Shared wrapper for consistent node styling
 *
 * @component
 * @param {NodeWrapperProps} props - Component props
 * @returns {ReactElement} Rendered wrapper
 *
 * @example
 * <NodeWrapper selected={selected}>
 *   <NodeContent />
 * </NodeWrapper>
 */
export function NodeWrapper({
  children,
  selected = false,
  className,
}: NodeWrapperProps): ReactElement {
  return (
    <div
      className={cn(
        'w-node-width p-4 rounded-node',
        'bg-node border-node',
        'transition-colors duration-fast',
        selected
          ? 'bg-node-selected border-white/4'
          : 'border-transparent',
        className
      )}
    >
      {children}
    </div>
  );
}
