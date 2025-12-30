/**
 * @fileoverview Loading spinner component
 * @module Components/UI/Spinner
 */

'use client';

import type { ReactElement } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Spinner size types
 */
type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Spinner component
 */
interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Additional class names */
  className?: string;
}

/**
 * Size-specific styles
 */
const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

/**
 * Spinner - Animated loading spinner
 *
 * @component
 * @param {SpinnerProps} props - Component props
 * @returns {ReactElement} Rendered spinner
 *
 * @example
 * <Spinner size="md" />
 */
export function Spinner({
  size = 'md',
  className,
}: SpinnerProps): ReactElement {
  return (
    <svg
      className={cn('animate-spin text-current', sizeStyles[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
