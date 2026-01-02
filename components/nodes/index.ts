/**
 * @fileoverview Node type exports and registration
 * @module Components/Nodes
 */

import type { NodeTypes } from 'reactflow';
import { TextNode } from './TextNode';
import { ImageNode } from './ImageNode';
import { LLMNode } from './LLMNode';
import { SystemPromptNode } from './SystemPromptNode';
import { ImageDescriptionNode } from './ImageDescriptionNode';

/**
 * Custom node types for React Flow
 *
 * @description
 * Maps node type strings to their React components.
 * Used by React Flow to render custom nodes.
 *
 * @example
 * <ReactFlow nodeTypes={nodeTypes} />
 */
export const nodeTypes: NodeTypes = {
  text: TextNode,
  image: ImageNode,
  llm: LLMNode,
  system: SystemPromptNode,
  imgDescribe: ImageDescriptionNode,
};

export { TextNode } from './TextNode';
export { ImageNode } from './ImageNode';
export { LLMNode } from './LLMNode';
export { SystemPromptNode } from './SystemPromptNode';
export { ImageDescriptionNode } from './ImageDescriptionNode';
export { NodeWrapper } from './NodeWrapper';
export { NodeMenu, type NodeMenuItem } from './NodeMenu';
