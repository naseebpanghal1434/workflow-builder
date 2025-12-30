/**
 * @fileoverview Reusable button component
 * @module Components/UI/Button
 */

'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactElement } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Button variant types
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * Button size types
 */
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

/**
 * Props for the Button component
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Icon to display before the label */
  leftIcon?: ReactElement;
  /** Icon to display after the label */
  rightIcon?: ReactElement;
}

/**
 * Base button styles
 */
const baseStyles =
  'inline-flex items-center justify-center font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-handle-text focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-40';

/**
 * Variant-specific styles
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-button-active text-canvas hover:brightness-95',
  secondary:
    'bg-node border border-white/16 text-white/80 hover:bg-node-selected hover:border-white/30',
  ghost: 'bg-transparent text-white/80 hover:bg-white/8',
};

/**
 * Size-specific styles
 */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-sm',
  md: 'h-10 px-4 text-sm rounded-sm',
  lg: 'h-12 px-6 text-base rounded-sm',
  icon: 'h-9 w-9 rounded-sm',
};

/**
 * Button - Reusable button component with multiple variants
 *
 * @component
 * @param {ButtonProps} props - Component props
 * @returns {ReactElement} Rendered button
 *
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Save
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ): ReactElement => {
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
