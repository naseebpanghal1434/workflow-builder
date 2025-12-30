/**
 * @fileoverview Empty state component for when no workflows exist
 * @module Components/Home/EmptyState
 */

'use client';

import { memo, type ReactElement } from 'react';
import { Workflow, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  /** Callback for create action */
  onCreate?: () => void;
}

/**
 * EmptyState - Shown when user has no workflows
 *
 * @component
 * @param {EmptyStateProps} props - Component props
 * @returns {ReactElement} Rendered empty state
 */
function EmptyStateComponent({ onCreate }: EmptyStateProps): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      {/* Icon */}
      <div
        className={cn(
          'w-20 h-20 flex items-center justify-center',
          'bg-[#212126] rounded-2xl mb-6'
        )}
      >
        <Workflow size={40} className="text-white/20" />
      </div>

      {/* Text */}
      <h3 className="text-lg font-medium text-white/80 mb-2">
        No workflows yet
      </h3>
      <p className="text-sm text-white/40 mb-6 text-center max-w-md">
        Create your first workflow to get started building AI-powered automations.
      </p>

      {/* Create Button */}
      <button
        onClick={onCreate}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5',
          'bg-[#F7FFA8] text-[#1a1a1a] rounded-lg',
          'text-sm font-medium',
          'hover:bg-[#E8F099] transition-colors'
        )}
      >
        <Plus size={18} />
        Create New Workflow
      </button>
    </div>
  );
}

export const EmptyState = memo(EmptyStateComponent);
