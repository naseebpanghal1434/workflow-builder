/**
 * @fileoverview Image upload node component
 * @module Components/Nodes/ImageNode
 */

'use client';

import { memo, useRef, type ReactElement, type ChangeEvent } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Upload, Trash2 } from 'lucide-react';
import { NodeWrapper } from './NodeWrapper';
import { NodeMenu, type NodeMenuItem } from './NodeMenu';
import type { ImageNodeData } from '@/types/nodes';
import { cn } from '@/lib/utils/cn';

/**
 * Extended ImageNodeData with handlers
 */
interface ImageNodeDataWithHandler extends ImageNodeData {
  onImageChange?: (imageData: string | null, fileName: string | null, mimeType: string | null) => void;
  onDelete?: () => void;
}

/**
 * ImageNode - Node for image upload with output handle
 *
 * @component
 * @param {NodeProps<ImageNodeData>} props - Node props from React Flow
 * @returns {ReactElement} Rendered image node
 *
 * @example
 * // Used internally by React Flow
 * nodeTypes={{ image: ImageNode }}
 */
function ImageNodeComponent({
  data,
  selected,
}: NodeProps<ImageNodeData>): ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extendedData = data as ImageNodeDataWithHandler;

  /**
   * Handle file selection
   */
  function handleFileChange(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file || !extendedData.onImageChange) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Extract base64 data (remove data URL prefix)
      const base64Data = result.split(',')[1];
      extendedData.onImageChange!(base64Data, file.name, file.type);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Handle upload click
   */
  function handleUploadClick(): void {
    fileInputRef.current?.click();
  }

  /**
   * Handle image removal
   */
  function handleRemove(): void {
    if (extendedData.onImageChange) {
      extendedData.onImageChange(null, null, null);
    }
  }

  /**
   * Menu items configuration
   */
  const menuItems: NodeMenuItem[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={14} />,
      onClick: () => extendedData.onDelete?.(),
      danger: true,
    },
  ];

  return (
    <NodeWrapper selected={selected}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-medium text-white/80">{data.label}</span>
        <NodeMenu items={menuItems} />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview or Upload Area */}
      {data.imageData ? (
        <div className="relative w-full h-40 rounded-sm overflow-hidden checkered-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:${data.mimeType};base64,${data.imageData}`}
            alt={data.fileName || 'Uploaded image'}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <button
          onClick={handleUploadClick}
          className={cn(
            'w-full h-40 flex flex-col items-center justify-center gap-2',
            'bg-canvas border border-dashed border-white/16 rounded-sm',
            'text-white/40 hover:text-white/60 hover:border-white/30',
            'transition-colors duration-fast'
          )}
        >
          <Upload size={24} />
          <span className="text-xs">Click to upload image</span>
        </button>
      )}

      {/* File name */}
      {data.fileName && (
        <p className="mt-2 text-xs text-white/40 truncate">{data.fileName}</p>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-[8px] !h-[8px] !border-0 !rounded-full"
        style={{ top: '50%', right: '-15px', background: '#6EDDB3' }}
      />
    </NodeWrapper>
  );
}

export const ImageNode = memo(ImageNodeComponent);
