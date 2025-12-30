/**
 * @fileoverview Workflow card component for home grid
 * @module Components/Home/WorkflowCard
 */

'use client';

import { memo, useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { Workflow, MoreVertical, Trash2, Download } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatLastEdited } from '@/lib/utils/timeago';
import type { WorkflowSummary } from '@/types/workflow';

/**
 * Props for WorkflowCard component
 */
interface WorkflowCardProps {
  /** Workflow summary data */
  workflow: WorkflowSummary;
  /** Callback for delete action */
  onDelete?: (id: string) => void;
  /** Callback for export action */
  onExport?: (id: string) => void;
}

/**
 * WorkflowCard - Card for displaying a workflow in the grid
 *
 * @component
 * @param {WorkflowCardProps} props - Component props
 * @returns {ReactElement} Rendered workflow card
 */
function WorkflowCardComponent({ workflow, onDelete, onExport }: WorkflowCardProps): ReactElement {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  /**
   * Handle card click
   */
  function handleClick(): void {
    router.push(`/workflow/${workflow.id}`);
  }

  /**
   * Handle menu button click
   */
  function handleMenuClick(e: React.MouseEvent): void {
    e.stopPropagation();
    setShowMenu(!showMenu);
  }

  /**
   * Handle export click
   */
  function handleExportClick(e: React.MouseEvent): void {
    e.stopPropagation();
    setShowMenu(false);
    onExport?.(workflow.id);
  }

  /**
   * Handle delete click
   */
  function handleDeleteClick(e: React.MouseEvent): void {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(workflow.id);
  }

  return (
    <div className="relative group">
      {/* Card */}
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex flex-col items-center text-left',
          'focus:outline-none'
        )}
      >
        {/* Thumbnail */}
        <div
          className={cn(
            'w-full aspect-[4/3] flex items-center justify-center',
            'bg-[#212126] rounded-lg',
            'border border-white/[0.04]',
            'group-hover:border-white/[0.12] transition-colors'
          )}
        >
          <Workflow size={48} className="text-white/20" />
        </div>

        {/* Info */}
        <div className="w-full mt-3 px-1">
          <h3 className="text-sm font-medium text-white/90 truncate">
            {workflow.name}
          </h3>
          <p className="text-xs text-white/40 mt-1">
            {formatLastEdited(workflow.updated_at)}
          </p>
        </div>
      </button>

      {/* Menu Button */}
      <button
        onClick={handleMenuClick}
        className={cn(
          'absolute top-2 right-2 p-1.5 rounded-md',
          'bg-[#2a2a2f] border border-white/[0.08]',
          'text-white/60 hover:text-white',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          showMenu && 'opacity-100'
        )}
      >
        <MoreVertical size={16} />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div
            className={cn(
              'absolute top-10 right-2 z-50',
              'min-w-[140px] py-1',
              'bg-[#2a2a2f] rounded-md',
              'border border-white/[0.08]',
              'shadow-lg'
            )}
          >
            <button
              onClick={handleExportClick}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2',
                'text-sm text-white/70 hover:bg-white/[0.04]',
                'transition-colors'
              )}
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={handleDeleteClick}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2',
                'text-sm text-red-400 hover:bg-white/[0.04]',
                'transition-colors'
              )}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export const WorkflowCard = memo(WorkflowCardComponent);
