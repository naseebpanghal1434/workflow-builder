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
import { NODE_TYPES } from '@/types/nodes';

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
  // /** Prompt change handler */
  onPromptChange: (nodeId: string, prompt: string) => void;
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
  onPromptChange,
  isRunning,
}: PropertiesPanelProps): ReactElement {
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  // const [selectedPrompt, setSelectedPrompt] = useState<string>(selectedNode?.data?.prompt || '');

  // Check if we should show the panel
  const isVisible = selectedNode && (selectedNode.type === NODE_TYPES.LLM || selectedNode.type === NODE_TYPES.IMG_DESCRIBE);

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

  function onPromptValueChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    if (selectedNode) {
      const newPrompt = e.target.value;
      onPromptChange(selectedNode.id, newPrompt);
    }
  }

  const getLabel = () => {
    if (selectedNode?.type === NODE_TYPES.LLM) {
      return 'LLM Node Settings';
    } else if (selectedNode?.type === NODE_TYPES.IMG_DESCRIBE) {
      return 'Image Describe Node Settings';
    }
    return 'Node Settings';
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
        <h2 className="text-sm font-medium text-white/80">{getLabel()}</h2>
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

        {/* Prompt TextBox */}
        {
          selectedNode && selectedNode.type === NODE_TYPES.IMG_DESCRIBE && (
            <div className="flex flex-col gap-1.5 text-xs text-white/70 mb-1">
              <div className="flex items-center gap-1.5 mb-2">
                <label className="text-xs text-white">Model Instructions</label>
                <Info size={12} className="text-white/60" />
              </div>
              <div>
                <textarea id="prompt" name='prompt'
                  value={selectedNode.data.prompt || ''}
                  onChange={onPromptValueChange}
                  className="w-full h-32 p-3 bg-canvas border border-white/8 rounded-sm text-sm text-white/80 placeholder:text-white/40 resize-none focus:outline-none focus:border-white/16" />
              </div>
            </div>
          )
        }
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
