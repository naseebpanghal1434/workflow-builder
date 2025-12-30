/**
 * @fileoverview Reusable node menu component with configurable options
 * @module Components/Nodes/NodeMenu
 */

'use client';

import { useState, useRef, useEffect, type ReactElement, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Menu item configuration
 */
export interface NodeMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label */
  label: string;
  /** Icon to display */
  icon: ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Whether this is a danger action (shows in red) */
  danger?: boolean;
}

/**
 * Props for the NodeMenu component
 */
interface NodeMenuProps {
  /** Array of menu items to display */
  items: NodeMenuItem[];
  /** Additional class names */
  className?: string;
}

/**
 * NodeMenu - Reusable three-dots menu for nodes
 *
 * @component
 * @param {NodeMenuProps} props - Component props
 * @returns {ReactElement} Rendered menu
 *
 * @example
 * <NodeMenu
 *   items={[
 *     { id: 'delete', label: 'Delete', icon: <Trash2 size={14} />, onClick: handleDelete, danger: true }
 *   ]}
 * />
 */
export function NodeMenu({ items, className }: NodeMenuProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handle menu item click
   */
  function handleItemClick(item: NodeMenuItem): void {
    setIsOpen(false);
    item.onClick();
  }

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 text-white/40 hover:text-white/70 transition-colors rounded"
      >
        <MoreHorizontal size={18} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-[#212126] border border-white/10 rounded-md shadow-lg z-50 overflow-hidden">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(item);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                item.danger
                  ? 'text-red-400 hover:bg-white/8 hover:text-red-300'
                  : 'text-white/70 hover:bg-white/8 hover:text-white/90'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
