/**
 * @fileoverview Sidebar with icon bar and expandable panel
 * @module Components/Layout/Sidebar
 */

'use client';

import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Image as ImageIcon, Sparkles, Settings2, ImagePlus } from 'lucide-react';
import { SearchInput } from '@/components/sidebar/SearchInput';
import { DraggableNodeButton } from '@/components/sidebar/DraggableNodeButton';
import { cn } from '@/lib/utils/cn';
import { NODE_TYPES } from '../../types/nodes';

/**
 * Props for the Sidebar component
 */
interface SidebarProps {
  /** Whether sidebar panel is expanded */
  isCollapsed: boolean;
  /** Toggle collapse state */
  onToggleCollapse: () => void;
}

/**
 * Sidebar - Icon bar with expandable panel for node selection
 *
 * @component
 * @param {SidebarProps} props - Component props
 * @returns {ReactElement} Rendered sidebar
 *
 * @example
 * <Sidebar
 *   isCollapsed={false}
 *   onToggleCollapse={() => setCollapsed(!collapsed)}
 * />
 */
export function Sidebar({
  isCollapsed,
  onToggleCollapse,
}: SidebarProps): ReactElement {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(true);

  /**
   * Handle home click - navigate to home page
   */
  function handleHomeClick(): void {
    router.push('/');
  }

  /**
   * Handle search icon click - toggle panel
   */
  function handleSearchClick(): void {
    if (isSearchActive && !isCollapsed) {
      // Clicking same icon closes panel
      onToggleCollapse();
    } else {
      setIsSearchActive(true);
      if (isCollapsed) {
        onToggleCollapse();
      }
    }
  }

  /**
   * Node buttons configuration
   */
  const nodeButtons = [
    { nodeType: NODE_TYPES.SYSTEM_PROMPT, label: 'System Prompt', icon: <Settings2 size={24} strokeWidth={1.5} /> },
    { nodeType: NODE_TYPES.TEXT_INPUT, label: 'Prompt', icon: <FileText size={24} strokeWidth={1.5} /> },
    { nodeType: NODE_TYPES.IMAGE_INPUT, label: 'Image', icon: <ImageIcon size={24} strokeWidth={1.5} /> },
    { nodeType: NODE_TYPES.LLM, label: 'Run Any LLM', icon: <Sparkles size={24} strokeWidth={1.5} /> },
    { nodeType: NODE_TYPES.IMG_DESCRIBE, label: 'Image Describe', icon: <ImagePlus size={24} strokeWidth={1.5} /> },
  ];

  const filteredNodes = searchValue
    ? nodeButtons.filter((node) =>
        node.label.toLowerCase().includes(searchValue.toLowerCase())
      )
    : nodeButtons;

  return (
    <div className="flex h-full">
      {/* Icon Bar - Always Visible */}
      <div className="w-14 h-full bg-[#212126] border-r border-white/[0.04] flex flex-col items-center py-3 gap-1">
        {/* Logo */}
        <button
          onClick={handleHomeClick}
          className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-2 hover:bg-white/15 transition-colors"
          aria-label="Home"
        >
          <span className="text-white font-bold text-lg">W</span>
        </button>

        {/* Search Icon */}
        <button
          onClick={handleSearchClick}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            'transition-colors duration-fast',
            isSearchActive && !isCollapsed
              ? 'bg-[#F7FFA8] text-[#1a1a1a]'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          )}
          aria-label="Search nodes"
        >
          <Search size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Expandable Panel */}
      <aside
        className={cn(
          'h-full bg-[#212126] border-r border-white/[0.04]',
          'transition-all duration-normal overflow-hidden',
          isCollapsed ? 'w-0' : 'w-56'
        )}
      >
        {!isCollapsed && (
          <div className="w-56 h-full flex flex-col p-4">
            {/* Search Input */}
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search"
              className="mb-4"
            />

            {/* Section Header */}
            <span className="text-sm text-white mb-3 font-medium">Quick access</span>

            {/* Node Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              {filteredNodes.map((node) => (
                <DraggableNodeButton
                  key={node.nodeType}
                  nodeType={node.nodeType}
                  label={node.label}
                  icon={node.icon}
                />
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
