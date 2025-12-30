/**
 * @fileoverview Bottom toolbar with canvas controls
 * @module Components/Layout/BottomToolbar
 */

'use client';

import type { ReactElement } from 'react';
import { MousePointer2, Hand, Undo2, Redo2 } from 'lucide-react';
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown';
import { cn } from '@/lib/utils/cn';

/**
 * Props for the BottomToolbar component
 */
interface BottomToolbarProps {
  /** Current active tool */
  activeTool: 'select' | 'pan';
  /** Tool change handler */
  onToolChange: (tool: 'select' | 'pan') => void;
  /** Undo handler */
  onUndo: () => void;
  /** Redo handler */
  onRedo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Current zoom level (0-1 scale, 1 = 100%) */
  zoom: number;
  /** Zoom change handler */
  onZoomChange: (zoom: number) => void;
  /** Fit view handler */
  onFitView: () => void;
}

/**
 * Zoom options for dropdown
 */
const zoomOptions: DropdownOption[] = [
  { value: '0.5', label: '50%' },
  { value: '0.75', label: '75%' },
  { value: '1', label: '100%' },
  { value: '1.25', label: '125%' },
  { value: '1.5', label: '150%' },
  { value: 'fit', label: 'Fit View' },
];

/**
 * BottomToolbar - Canvas controls at bottom of screen
 *
 * @component
 * @param {BottomToolbarProps} props - Component props
 * @returns {ReactElement} Rendered toolbar
 *
 * @example
 * <BottomToolbar
 *   activeTool="select"
 *   onToolChange={setTool}
 *   onUndo={handleUndo}
 *   onRedo={handleRedo}
 *   canUndo={true}
 *   canRedo={false}
 *   zoom={1}
 *   onZoomChange={setZoom}
 *   onFitView={handleFitView}
 * />
 */
export function BottomToolbar({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomChange,
  onFitView,
}: BottomToolbarProps): ReactElement {
  /**
   * Handle zoom selection
   */
  function handleZoomSelect(value: string): void {
    if (value === 'fit') {
      onFitView();
    } else {
      onZoomChange(parseFloat(value));
    }
  }

  /**
   * Get current zoom display value
   */
  function getZoomValue(): string {
    return zoom.toString();
  }

  /**
   * Get current zoom display label
   */
  function getZoomLabel(): string {
    return `${Math.round(zoom * 100)}%`;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-toolbar',
        'flex items-center gap-0 px-1.5 py-1.5',
        'bg-[#212126] border border-white/[0.08] rounded-xl'
      )}
    >
      {/* Tool Selection */}
      <div className="flex items-center">
        <ToolButton
          icon={<MousePointer2 size={18} strokeWidth={1.5} />}
          isActive={activeTool === 'select'}
          onClick={() => onToolChange('select')}
          label="Select"
        />
        <ToolButton
          icon={<Hand size={18} strokeWidth={1.5} />}
          isActive={activeTool === 'pan'}
          onClick={() => onToolChange('pan')}
          label="Pan"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10 mx-2" />

      {/* Undo/Redo */}
      <div className="flex items-center">
        <ToolButton
          icon={<Undo2 size={18} strokeWidth={1.5} />}
          onClick={onUndo}
          disabled={!canUndo}
          label="Undo"
        />
        <ToolButton
          icon={<Redo2 size={18} strokeWidth={1.5} />}
          onClick={onRedo}
          disabled={!canRedo}
          label="Redo"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10 mx-2" />

      {/* Zoom Dropdown */}
      <Dropdown
        options={zoomOptions}
        value={getZoomValue()}
        onChange={handleZoomSelect}
        displayLabel={getZoomLabel()}
        className="min-w-[56px]"
        openUpward
        minimal
      />
    </div>
  );
}

/**
 * Props for ToolButton
 */
interface ToolButtonProps {
  /** Icon element */
  icon: ReactElement;
  /** Whether button is active */
  isActive?: boolean;
  /** Click handler */
  onClick: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Accessible label */
  label: string;
}

/**
 * ToolButton - Individual tool button in toolbar
 */
function ToolButton({
  icon,
  isActive = false,
  onClick,
  disabled = false,
  label,
}: ToolButtonProps): ReactElement {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-md',
        'transition-colors duration-fast',
        isActive
          ? 'bg-[#F7FFA8] text-[#1a1a1a]'
          : 'bg-transparent text-white/50 hover:text-white/80',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
    >
      {icon}
    </button>
  );
}
