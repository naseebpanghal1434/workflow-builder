/**
 * @fileoverview Workflow grid component for home page
 * @module Components/Home/WorkflowGrid
 */

'use client';

import { memo, type ReactElement } from 'react';
import { WorkflowCard } from './WorkflowCard';
import { EmptyState } from './EmptyState';
import type { WorkflowSummary } from '@/types/workflow';

/**
 * Props for WorkflowGrid component
 */
interface WorkflowGridProps {
  /** List of workflow summaries */
  workflows: WorkflowSummary[];
  /** Whether workflows are loading */
  isLoading?: boolean;
  /** Callback for delete action */
  onDelete?: (id: string) => void;
  /** Callback for export action */
  onExport?: (id: string) => void;
  /** Callback for create action */
  onCreate?: () => void;
}

/**
 * WorkflowGrid - Grid layout for displaying workflow cards
 *
 * @component
 * @param {WorkflowGridProps} props - Component props
 * @returns {ReactElement} Rendered workflow grid
 */
function WorkflowGridComponent({
  workflows,
  isLoading,
  onDelete,
  onExport,
  onCreate,
}: WorkflowGridProps): ReactElement {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="w-full aspect-[4/3] bg-[#212126] rounded-lg" />
            <div className="mt-3 px-1">
              <div className="h-4 bg-[#212126] rounded w-3/4" />
              <div className="h-3 bg-[#212126] rounded w-1/2 mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (workflows.length === 0) {
    return <EmptyState onCreate={onCreate} />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {workflows.map((workflow) => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          onDelete={onDelete}
          onExport={onExport}
        />
      ))}
    </div>
  );
}

export const WorkflowGrid = memo(WorkflowGridComponent);
