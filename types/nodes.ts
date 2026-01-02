/**
 * @fileoverview Type definitions for workflow nodes
 * @module Types/Nodes
 */

import type { Node } from 'reactflow';

export const NODE_TYPES = {
  LLM: 'llm',
  TEXT_INPUT: 'text',
  IMAGE_INPUT: 'image',
  SYSTEM_PROMPT: 'system',
  IMG_DESCRIBE: 'imgDescribe',
} as const;

export const NODE_TYPES_LABELS: Record<string, string> = {
  [NODE_TYPES.LLM]: 'Any LLM',
  [NODE_TYPES.TEXT_INPUT]: 'Prompt',
  [NODE_TYPES.IMAGE_INPUT]: 'Image Input',
  [NODE_TYPES.SYSTEM_PROMPT]: 'System Prompt',
  [NODE_TYPES.IMG_DESCRIBE]: 'Image Describe',
};

export const HANDLE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SYSTEM: 'system',
} as const;

export const POSITION_LEFT = 'left';
export const POSITION_RIGHT = 'right';


/**
 * Supported node types in the workflow builder
//  */
// export type NodeType = 'text' | 'image' | 'llm' | 'system'| 'imgDescribe';
export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];

/**
 * Handle types for node connections
 */
// export type HandleType = 'text' | 'image' | 'system';
export type HandleType = typeof HANDLE_TYPES[keyof typeof HANDLE_TYPES];

/**
 * Base data structure shared by all node types
 */
export interface BaseNodeData {
  /** Display label for the node */
  label: string;
}

/**
 * Data structure for text input nodes
 */
export interface TextNodeData extends BaseNodeData {
  /** Text content entered by the user */
  content: string;
}

/**
 * Data structure for image input nodes
 */
export interface ImageNodeData extends BaseNodeData {
  /** Base64 encoded image data */
  imageData: string | null;
  /** Original filename of the uploaded image */
  fileName: string | null;
  /** MIME type of the image */
  mimeType: string | null;
}

/**
 * Data structure for LLM processing nodes
 */
export interface LLMNodeData extends BaseNodeData {
  /** Selected Gemini model ID */
  model: string;
  /** Output text from LLM processing */
  output: string;
  /** Whether the node is currently processing */
  isLoading: boolean;
  /** Error message if processing failed */
  error: string | null;
}

/**
 * Data structure for system prompt nodes
 */
export interface SystemPromptNodeData extends BaseNodeData {
  /** System prompt content entered by the user */
  content: string;
}

/**
 * Data structure for image description nodes
 */
export interface ImageDescribeNodeData extends BaseNodeData {
  /** Description generated for the image */
  model: string;
  /** Predefined prompt used for image description */
  prompt: string;
  /** Output text from LLM processing */
  output: string;
  /** Whether the node is currently processing */
  isLoading: boolean;
  /** Error message if processing failed */
  error: string | null;
}

/**
 * Union type for all node data types
 */
export type WorkflowNodeData = TextNodeData | ImageNodeData | LLMNodeData | SystemPromptNodeData | ImageDescribeNodeData;

/**
 * Text node with proper typing
 */
// export type TextNode = Node<TextNodeData, 'text'>;
export type TextNode = Node<TextNodeData, typeof NODE_TYPES.TEXT_INPUT>;

/**
 * Image node with proper typing
 */
// export type ImageNode = Node<ImageNodeData, 'image'>;
export type ImageNode = Node<ImageNodeData, typeof NODE_TYPES.IMAGE_INPUT>;

/**
 * LLM node with proper typing
 */
// export type LLMNode = Node<LLMNodeData, 'llm'>;
export type LLMNode = Node<LLMNodeData, typeof NODE_TYPES.LLM>;

/**
 * System prompt node with proper typing
 */
// export type SystemNode = Node<SystemPromptNodeData, 'system'>;
export type SystemNode = Node<SystemPromptNodeData, typeof NODE_TYPES.SYSTEM_PROMPT>;

/**
 * Image description node with proper typing
 */
// export type ImageDescribeNode = Node<ImageDescribeNodeData, 'imgDescribe'>;
export type ImageDescribeNode = Node<ImageDescribeNodeData, typeof NODE_TYPES.IMG_DESCRIBE>;

/**
 * Union type for all workflow nodes
 */
export type WorkflowNode = TextNode | ImageNode | LLMNode | SystemNode | ImageDescribeNode;

/**
 * Handle position configuration
 */
export interface HandleConfig {
  /** Unique handle ID */
  id: string;
  /** Handle type determining color */
  type: HandleType;
  /** Position ('left' or 'right') */
  position: typeof POSITION_LEFT | typeof POSITION_RIGHT;
  /** Label text displayed next to handle */
  label: string;
}
