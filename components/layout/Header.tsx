/**
 * @fileoverview Header component with flow name and save functionality
 * @module Components/Layout/Header
 */

'use client';

import { useState, type ReactElement, type ChangeEvent } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

/**
 * Props for the Header component
 */
interface HeaderProps {
  /** Current workflow name */
  flowName: string;
  /** Callback when flow name changes */
  onFlowNameChange: (name: string) => void;
  /** Callback when save button clicked */
  onSave: () => void;
  /** Whether save is in progress */
  isSaving: boolean;
}

/**
 * Header - Top bar with flow name and save functionality
 *
 * @component
 * @param {HeaderProps} props - Component props
 * @returns {ReactElement} Rendered header
 *
 * @example
 * <Header
 *   flowName="My Workflow"
 *   onFlowNameChange={setFlowName}
 *   onSave={handleSave}
 *   isSaving={false}
 * />
 */
export function Header({
  flowName,
  onFlowNameChange,
  onSave,
  isSaving,
}: HeaderProps): ReactElement {
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Handle input change
   */
  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    onFlowNameChange(e.target.value);
  }

  /**
   * Handle input blur - stop editing
   */
  function handleBlur(): void {
    setIsEditing(false);
    if (!flowName.trim()) {
      onFlowNameChange('Untitled Workflow');
    }
  }

  /**
   * Handle input keydown - submit on Enter
   */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }

  return (
    <header
      className={cn(
        'h-header-height flex items-center justify-between px-4',
        'bg-canvas border-b border-white/8'
      )}
    >
      {/* Logo / Title */}
      <div className="flex items-center gap-2">
        <span className="text-base font-medium text-white/80">
          Workflow Builder
        </span>
      </div>

      {/* Flow Name Input */}
      <div className="flex-1 flex justify-center">
        <input
          type="text"
          value={flowName}
          onChange={handleChange}
          onFocus={() => setIsEditing(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Untitled Workflow"
          className={cn(
            'max-w-[300px] px-3 py-1.5 text-sm text-center',
            'bg-transparent border border-transparent rounded-sm',
            'text-white/80 placeholder:text-white/40',
            'transition-colors duration-fast',
            'focus:outline-none focus:border-white/16 focus:bg-node',
            isEditing && 'border-white/16 bg-node'
          )}
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onSave}
          isLoading={isSaving}
          leftIcon={<Save size={16} />}
        >
          Save
        </Button>
      </div>
    </header>
  );
}
