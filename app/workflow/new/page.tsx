/**
 * @fileoverview Create new workflow and redirect to editor
 * @module App/Workflow/New/Page
 */

'use client';

import { useEffect, useState, useRef, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createWorkflow } from '@/lib/db/workflows';
import { DEFAULT_VIEWPORT } from '@/types/workflow';

/**
 * NewWorkflowPage - Creates a new workflow and redirects to editor
 *
 * @component
 * @returns {ReactElement} Loading state while creating workflow
 */
export default function NewWorkflowPage(): ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isCreatingRef = useRef(false);

  useEffect(() => {
    async function create() {
      // Prevent duplicate creation from StrictMode double-mount
      if (isCreatingRef.current) return;
      isCreatingRef.current = true;

      const result = await createWorkflow('Untitled Workflow', {
        nodes: [],
        edges: [],
        viewport: DEFAULT_VIEWPORT,
      });

      if (result.success) {
        router.replace(`/workflow/${result.data.id}`);
      } else {
        setError(result.error);
        isCreatingRef.current = false;
      }
    }

    create();
  }, [router]);

  if (error) {
    return (
      <div className="flex h-screen w-full bg-canvas items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-red-400">{error}</span>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-canvas items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
        <span className="text-white/60">Creating workflow...</span>
      </div>
    </div>
  );
}
