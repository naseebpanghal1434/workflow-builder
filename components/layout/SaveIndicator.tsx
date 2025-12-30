/**
 * @fileoverview Save status indicator component
 * @module Components/Layout/SaveIndicator
 */

'use client';

import { memo, type ReactElement } from 'react';
import { Loader2, Check, AlertCircle, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { SaveStatus } from '@/hooks/useAutoSave';

/**
 * Props for SaveIndicator component
 */
interface SaveIndicatorProps {
  /** Current save status */
  status: SaveStatus;
  /** Last saved timestamp */
  lastSavedAt: Date | null;
  /** Error message if save failed */
  error: string | null;
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * SaveIndicator - Shows the current save status
 *
 * @component
 * @param {SaveIndicatorProps} props - Component props
 * @returns {ReactElement} Rendered save indicator
 */
function SaveIndicatorComponent({
  status,
  lastSavedAt,
  error,
}: SaveIndicatorProps): ReactElement {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2',
        'bg-[#212126] border border-white/[0.04] rounded-[8px]',
        'pointer-events-auto transition-all duration-200'
      )}
    >
      {/* Idle */}
      {status === 'idle' && (
        <>
          <Cloud size={16} className="text-white/40" />
          <span className="text-sm text-white/40">
            {lastSavedAt ? `Saved at ${formatTime(lastSavedAt)}` : 'All changes saved'}
          </span>
        </>
      )}

      {/* Saving */}
      {status === 'saving' && (
        <>
          <Loader2 size={16} className="text-white/60 animate-spin" />
          <span className="text-sm text-white/60">Saving...</span>
        </>
      )}

      {/* Saved */}
      {status === 'saved' && (
        <>
          <Check size={16} className="text-green-400" />
          <span className="text-sm text-green-400">Saved</span>
        </>
      )}

      {/* Error */}
      {status === 'error' && (
        <>
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-sm text-red-400" title={error || undefined}>
            Save failed
          </span>
        </>
      )}
    </div>
  );
}

export const SaveIndicator = memo(SaveIndicatorComponent);
