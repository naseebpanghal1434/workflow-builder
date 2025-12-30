/**
 * @fileoverview Home page with workflow listing
 * @module App/Page
 */

'use client';

import { useState, useEffect, useCallback, useRef, type ReactElement, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload } from 'lucide-react';
import { HomeSidebar } from '@/components/home/HomeSidebar';
import { WorkflowGrid } from '@/components/home/WorkflowGrid';
import { listWorkflows, deleteWorkflow, getWorkflow, createWorkflow } from '@/lib/db/workflows';
import { cn } from '@/lib/utils/cn';
import type { WorkflowSummary, WorkflowExport } from '@/types/workflow';

/**
 * Home - Main page with workflow listing
 *
 * @component
 * @returns {ReactElement} Rendered home page
 */
export default function Home(): ReactElement {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Load workflows on mount
   */
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);

      const result = await listWorkflows();

      if (result.success) {
        setWorkflows(result.data);
      } else {
        setError(result.error);
      }

      setIsLoading(false);
    }

    load();
  }, []);

  /**
   * Handle create new workflow
   */
  const handleCreate = useCallback(() => {
    router.push('/workflow/new');
  }, [router]);

  /**
   * Handle delete workflow
   */
  const handleDelete = useCallback(async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this workflow?');
    if (!confirmed) return;

    const result = await deleteWorkflow(id);

    if (result.success) {
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    } else {
      alert('Failed to delete workflow');
    }
  }, []);

  /**
   * Handle export workflow
   */
  const handleExport = useCallback(async (id: string) => {
    const result = await getWorkflow(id);

    if (!result.success) {
      alert('Failed to export workflow');
      return;
    }

    const workflow = result.data;
    const exportData: WorkflowExport = {
      version: '1.0',
      name: workflow.name,
      data: workflow.data,
      exportedAt: new Date().toISOString(),
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Handle import button click
   */
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle file selection for import
   */
  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text) as WorkflowExport;

      // Validate import data
      if (!importData.name || !importData.data || !importData.data.nodes || !importData.data.edges) {
        alert('Invalid workflow file format');
        return;
      }

      // Create new workflow from import
      const result = await createWorkflow(importData.name, importData.data);

      if (result.success) {
        // Navigate to the new workflow
        router.push(`/workflow/${result.data.id}`);
      } else {
        alert('Failed to import workflow');
      }
    } catch {
      alert('Failed to parse workflow file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full bg-canvas">
      {/* Sidebar */}
      <HomeSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className={cn(
            'h-16 flex items-center justify-between px-8',
            'border-b border-white/[0.04]'
          )}
        >
          <h1 className="text-xl font-semibold text-white">My Workspace</h1>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Import Button */}
            <button
              onClick={handleImportClick}
              className={cn(
                'flex items-center gap-2 px-4 py-2',
                'bg-transparent border border-white/[0.08] rounded-lg',
                'text-sm text-white/70 hover:text-white hover:border-white/16',
                'transition-colors'
              )}
            >
              <Upload size={16} />
              Import workflow
            </button>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              className={cn(
                'flex items-center gap-2 px-4 py-2',
                'bg-[#F7FFA8] text-[#1a1a1a] rounded-lg',
                'text-sm font-medium',
                'hover:bg-[#E8F099] transition-colors'
              )}
            >
              <Plus size={16} />
              Create New File
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="text-red-400 mb-4">{error}</span>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Grid */}
          {!error && (
            <WorkflowGrid
              workflows={workflows}
              isLoading={isLoading}
              onDelete={handleDelete}
              onExport={handleExport}
              onCreate={handleCreate}
            />
          )}
        </main>
      </div>
    </div>
  );
}
