/**
 * @fileoverview Reusable input component
 * @module Components/UI/Input
 */

'use client';

import { forwardRef, type InputHTMLAttributes, type ReactElement } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Props for the Input component
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Left icon element */
  leftIcon?: ReactElement;
  /** Right icon element */
  rightIcon?: ReactElement;
  /** Error state */
  hasError?: boolean;
}

/**
 * Input - Reusable input component
 *
 * @component
 * @param {InputProps} props - Component props
 * @returns {ReactElement} Rendered input
 *
 * @example
 * <Input
 *   placeholder="Enter text..."
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, leftIcon, rightIcon, hasError, ...props },
    ref
  ): ReactElement => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-white/40">{leftIcon}</span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-node border border-white/8 rounded-sm px-3 py-2 text-sm text-white/80 placeholder:text-white/40',
            'transition-colors duration-fast',
            'focus:outline-none focus:border-white/30',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            hasError && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 text-white/40">{rightIcon}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
