/**
 * @fileoverview Properties panel for LLM node configuration
 * @module Components/Layout/PropertiesPanel
 */

'use client';

import { useState, useEffect, type ReactElement } from 'react';
import type { Node } from 'reactflow';
import { Info, Play, AlertTriangle } from 'lucide-react';
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { GEMINI_MODELS } from '@/constants/models';

/**
 * Props for the PropertiesPanel component
 */
interface PropertiesPanelProps {
  /** Selected LLM node (null if none or non-LLM selected) */
  selectedNode: Node | null;
  /** Model change handler */
  onModelChange: (nodeId: string, model: string) => void;
  /** Run handler */
  onRun: (nodeId: string) => void;
  /** Whether LLM is currently running */
  isRunning: boolean;
}

/**
 * Model options for dropdown
 */
const modelOptions: DropdownOption[] = GEMINI_MODELS.map((model) => ({
  value: model.id,
  label: model.name,
}));

/**
 * PropertiesPanel - Right side panel for LLM node configuration
 *
 * @component
 * @param {PropertiesPanelProps} props - Component props
 * @returns {ReactElement | null} Rendered panel or null if no LLM selected
 *
 * @example
 * <PropertiesPanel
 *   selectedNode={selectedLLMNode}
 *   onModelChange={handleModelChange}
 *   onRun={handleRun}
 *   isRunning={false}
 * />
 */
export function PropertiesPanel({
  selectedNode,
  onModelChange,
  onRun,
  isRunning,
}: PropertiesPanelProps): ReactElement {
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);

  // Check if we should show the panel
  const isVisible = selectedNode && selectedNode.type === 'llm';

  // Extract nodeId for use in handlers
  const nodeId = selectedNode?.id || '';
  const currentModel = selectedNode?.data?.model || GEMINI_MODELS[0].id;

  // Check API configuration status
  useEffect(() => {
    async function checkApiStatus() {
      try {
        const response = await fetch('/api/llm/status');
        const data = await response.json();
        setApiConfigured(data.configured);
      } catch {
        setApiConfigured(false);
      }
    }
    checkApiStatus();
  }, []);

  /**
   * Handle model selection change
   */
  function handleModelChange(model: string): void {
    if (nodeId) {
      onModelChange(nodeId, model);
    }
  }

  /**
   * Handle run button click
   */
  function handleRun(): void {
    if (nodeId) {
      onRun(nodeId);
    }
  }

  return (
    <aside
      className={cn(
        'fixed top-0 right-0 bottom-0 w-panel-width z-50',
        'bg-[#212126] border-l border-white/[0.04]',
        'flex flex-col',
        'transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.04]">
        <h2 className="text-sm font-medium text-white/80">Any LLM</h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* API Warning */}
        {apiConfigured === false && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-yellow-400 font-medium">API Not Configured</p>
              <p className="text-xs text-yellow-400/70 mt-1">
                Add GEMINI_API_KEY to your environment variables.
              </p>
            </div>
          </div>
        )}

        {/* Model Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <label className="text-xs text-white">Model Name</label>
            <Info size={12} className="text-white/60" />
          </div>
          <Dropdown
            options={modelOptions}
            value={currentModel}
            onChange={handleModelChange}
            className="w-full"
            compact
          />
        </div>
      </div>

      {/* Footer with Run Button */}
      <div className="px-4 py-3 border-t border-white/[0.04]">
        <Button
          variant="primary"
          size="sm"
          className="w-full bg-[#DCDCC2] hover:bg-[#d0d0b8]"
          onClick={handleRun}
          isLoading={isRunning}
          disabled={apiConfigured === false}
          leftIcon={!isRunning ? <Play size={14} /> : undefined}
        >
          {apiConfigured === false ? 'API Not Configured' : 'Run Selected'}
        </Button>
      </div>
    </aside>
  );
}
