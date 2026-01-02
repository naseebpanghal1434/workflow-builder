import { ImageDescribeNodeData } from "@/types/nodes";
import { memo, ReactElement, useState } from "react";
import { Handle, NodeProps, Position, useStore } from "reactflow";
import { NodeMenu, NodeMenuItem } from "./NodeMenu";
import { AlertCircle, ArrowRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "../ui/Spinner";
import { NodeWrapper } from "./NodeWrapper";
import { useConnectionState } from "@/hooks/useConnectionState";

interface ImageDescriptionNodeDataWithHandler extends ImageDescribeNodeData {
    onRun?: () => void;
    onDelete?: () => void;
}


function ImageDescriptionNodeComponent({
    data,
    selected,
}: NodeProps<ImageDescribeNodeData>): ReactElement {
    const extendedData = data as ImageDescriptionNodeDataWithHandler;

    // Hover state for showing handle labels (improves UX by showing input/output names)
    const [isHovered, setIsHovered] = useState(false);

    // Detect when user is dragging an edge to connect nodes
    // useStore subscribes to React Flow's internal state - connectionNodeId is set during edge creation
    const isConnectingBasic = useStore((state) => !!state.connectionNodeId);

    // Get connection state for handle compatibility (fading incompatible handles)
    const { isConnecting, isHandleCompatible } = useConnectionState();

    // Show handle labels when:
    // 1. User hovers over the node (to see available inputs/outputs)
    // 2. User is connecting an edge (to help them find the right handle)
    const showLabels = isHovered || isConnectingBasic;

    /**
     * Get handle style with fading for incompatible connections
     */
    function getHandleStyle(handleId: string, baseColor: string, topPercent: string) {
        const isCompatible = isHandleCompatible(handleId);
        const shouldFade = isConnecting && !isCompatible;

        return {
            top: topPercent,
            left: '-15px',
            background: baseColor,
            opacity: shouldFade ? 0.3 : 1,
            transition: 'opacity 0.15s ease-in-out',
        };
    }

    /**
   * Handle run button click
   * stopPropagation prevents the click from triggering node selection
   * which would cause the Properties Panel to open/close unexpectedly
   */
    function handleRun(e: React.MouseEvent): void {
        e.stopPropagation();
        if (extendedData.onRun) {
            extendedData.onRun();
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
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative"
        >
            <NodeWrapper selected={selected}>
                {/*
          Input Handles (Left side)
          - 'image': Connected images are sent for description processing
          Colors match the corresponding node type themes for visual consistency
          Handles fade when incompatible with the connecting node type
        */}
                <Handle
                    type="target"
                    position={Position.Left}
                    id="image"
                    className="!w-[8px] !h-[8px] !border-0 !rounded-full"
                    style={getHandleStyle('image', '#6EDDB3', '25%')} // Green - matches ImageNode
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-white/80">Image Description</span>
                        {data.isLoading && <Spinner size="sm" className="text-handle-text" />}
                    </div>
                    <NodeMenu items={menuItems} />
                </div>

                {/* Error Message */}
                {data.error && (
                    <div className="flex items-start gap-2 p-2 mb-3 bg-red-500/10 border border-red-500/20 rounded-sm">
                        <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-400">{data.error}</p>
                    </div>
                )}

                {/* Output Area */}
                <div
                    className={cn(
                        'w-full p-3 bg-canvas border border-white/8 rounded-md',
                        'text-sm text-white/80 overflow-y-auto',
                        !data.output && 'flex items-center justify-center'
                    )}
                    style={{ height: '480px' }}
                >
                    {data.output ? (
                        <p className="whitespace-pre-wrap">{data.output}</p>
                    ) : (
                        <span className="text-white/40 text-sm">The generated text will appear here</span>
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end mt-3">
                    <button
                        onClick={handleRun}
                        disabled={data.isLoading}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-md',
                            'border border-white/20',
                            'text-sm text-white/70',
                            'hover:bg-white/10 transition-colors',
                            data.isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <ArrowRight size={14} />
                        <span>Run Model</span>
                    </button>
                </div>

                {/*
          Output Handle (Right side)
          The LLM output can be connected to another LLM node's text input,
          enabling chained workflows where one LLM's response feeds into another
        */}
                <Handle
                    type="source"
                    position={Position.Right}
                    id="output"
                    className="!w-[8px] !h-[8px] !border-0 !rounded-full"
                    style={{ top: '50%', right: '-15px', background: '#FFFFFF' }} // White - LLM theme color
                />
            </NodeWrapper>

            {/* External Labels - Show on hover or when connecting */}
            {showLabels && (
                <>
                    {/* Left side labels (inputs) */}
                    <div className="absolute right-full top-0 h-full mr-2 pointer-events-none">
                        {/* <div className="absolute top-[25%] -translate-y-1/2 right-0 flex items-center gap-1.5">
                            <span className="text-xs text-white/70 whitespace-nowrap bg-node/90 px-1.5 py-0.5 rounded">System</span>
                        </div>
                        <div className="absolute top-[45%] -translate-y-1/2 right-0 flex items-center gap-1.5">
                            <span className="text-xs text-white/70 whitespace-nowrap bg-node/90 px-1.5 py-0.5 rounded">Text</span>
                        </div> */}
                        <div className="absolute top-[25%] -translate-y-1/2 right-0 flex items-center gap-1.5">
                            <span className="text-xs text-white/70 whitespace-nowrap bg-node/90 px-1.5 py-0.5 rounded">Image</span>
                        </div>
                    </div>

                    {/* Right side label (output) */}
                    <div className="absolute left-full top-[50%] -translate-y-1/2 ml-2 pointer-events-none">
                        <span className="text-xs text-white/70 whitespace-nowrap bg-node/90 px-1.5 py-0.5 rounded">Text</span>
                    </div>
                </>
            )}
        </div>
    );
}
export const ImageDescriptionNode = memo(ImageDescriptionNodeComponent);

