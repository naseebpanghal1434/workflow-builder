/**
 * @fileoverview Home page sidebar component
 * @module Components/Home/HomeSidebar
 */

'use client';

import { memo, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Props for HomeSidebar component
 */
interface HomeSidebarProps {
  /** Currently active nav item */
  activeItem?: 'my-files';
}

/**
 * HomeSidebar - Left sidebar for home page
 *
 * @component
 * @param {HomeSidebarProps} props - Component props
 * @returns {ReactElement} Rendered sidebar
 */
function HomeSidebarComponent({ activeItem = 'my-files' }: HomeSidebarProps): ReactElement {
  const router = useRouter();

  /**
   * Handle create new workflow
   */
  function handleCreateNew(): void {
    router.push('/workflow/new');
  }

  return (
    <aside
      className={cn(
        'w-[240px] h-full flex-shrink-0',
        'bg-[#212126] border-r border-white/[0.04]',
        'flex flex-col'
      )}
    >
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.04]">
        <div
          className={cn(
            'w-10 h-10 flex items-center justify-center',
            'bg-[#F7FFA8] rounded-lg',
            'text-[#1a1a1a] font-bold text-lg'
          )}
        >
          W
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Create New Button */}
        <button
          onClick={handleCreateNew}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-3',
            'bg-[#F7FFA8] text-[#1a1a1a] rounded-lg',
            'text-sm font-medium',
            'hover:bg-[#E8F099] transition-colors'
          )}
        >
          <Plus size={18} />
          Create New File
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mt-2">
          <button
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-sm transition-colors',
              activeItem === 'my-files'
                ? 'bg-white/[0.08] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            <FolderOpen size={18} />
            My Files
          </button>
        </nav>
      </div>
    </aside>
  );
}

export const HomeSidebar = memo(HomeSidebarComponent);
