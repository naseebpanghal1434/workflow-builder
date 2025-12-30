/**
 * @fileoverview Search input component for sidebar
 * @module Components/Sidebar/SearchInput
 */

'use client';

import type { ReactElement, ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Props for the SearchInput component
 */
interface SearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional class names */
  className?: string;
}

/**
 * SearchInput - Search input for sidebar filtering
 *
 * @component
 * @param {SearchInputProps} props - Component props
 * @returns {ReactElement} Rendered search input
 *
 * @example
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search nodes..."
 * />
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  className,
}: SearchInputProps): ReactElement {
  /**
   * Handle input change
   */
  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    onChange(e.target.value);
  }

  return (
    <div className={cn('relative', className)}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full pl-9 pr-3 py-2 h-9',
          'bg-[#2a2a2e] border border-white/10 rounded-md',
          'text-sm text-white/80 placeholder:text-white/40',
          'transition-colors duration-fast',
          'focus:outline-none focus:border-white/20'
        )}
      />
    </div>
  );
}
