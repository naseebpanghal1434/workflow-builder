/**
 * @fileoverview Reusable dropdown component
 * @module Components/UI/Dropdown
 */

'use client';

import {
  useState,
  useRef,
  useEffect,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Dropdown option type
 */
export interface DropdownOption {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: ReactNode;
}

/**
 * Props for the Dropdown component
 */
interface DropdownProps {
  /** Array of options */
  options: DropdownOption[];
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Additional class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Open dropdown upward instead of downward */
  openUpward?: boolean;
  /** Minimal style - no border, just text and chevron */
  minimal?: boolean;
  /** Custom display label (overrides selected option label) */
  displayLabel?: string;
  /** Compact style with grey background */
  compact?: boolean;
}

/**
 * Dropdown - Reusable dropdown select component
 *
 * @component
 * @param {DropdownProps} props - Component props
 * @returns {ReactElement} Rendered dropdown
 *
 * @example
 * <Dropdown
 *   options={[{ value: 'a', label: 'Option A' }]}
 *   value={selected}
 *   onChange={setSelected}
 * />
 */
export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
  disabled = false,
  openUpward = false,
  minimal = false,
  displayLabel,
  compact = false,
}: DropdownProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handle option selection
   */
  function handleSelect(optionValue: string): void {
    onChange(optionValue);
    setIsOpen(false);
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-1',
          'text-sm transition-colors duration-fast',
          'focus:outline-none',
          minimal
            ? 'px-1.5 py-1 bg-transparent text-white/50 hover:text-white/80'
            : compact
              ? 'px-2 py-1 bg-[#2a2a2f] border border-white/8 rounded-md text-white hover:border-white/16'
              : 'px-2.5 py-1.5 bg-transparent border border-white/8 rounded-md text-white/70 hover:border-white/16 hover:text-white/90',
          disabled && 'opacity-40 cursor-not-allowed',
          !minimal && isOpen && 'border-white/30'
        )}
        disabled={disabled}
      >
        <span className={cn(!selectedOption && !displayLabel && 'text-white/40')}>
          {displayLabel || (selectedOption ? selectedOption.label : placeholder)}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-white/40 transition-transform duration-fast',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-dropdown w-full',
            'bg-[#212126] border border-white/8 rounded-md shadow-dropdown',
            'py-1 max-h-60 overflow-auto',
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-left text-white',
                'transition-colors duration-fast',
                'hover:bg-white/8',
                option.value === value && 'bg-white/8'
              )}
            >
              {option.icon && <span>{option.icon}</span>}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
