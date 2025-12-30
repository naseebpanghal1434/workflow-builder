/**
 * @fileoverview Type definitions for workflow nodes
 * @module Types/Nodes
 */

import type { Node } from 'reactflow';

/**
 * Supported node types in the workflow builder
 */
export type NodeType = 'text' | 'image' | 'llm' | 'system';

/**
 * Handle types for node connections
 */
export type HandleType = 'text' | 'image' | 'system';

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
 * Union type for all node data types
 */
export type WorkflowNodeData = TextNodeData | ImageNodeData | LLMNodeData | SystemPromptNodeData;

/**
 * Text node with proper typing
 */
export type TextNode = Node<TextNodeData, 'text'>;

/**
 * Image node with proper typing
 */
export type ImageNode = Node<ImageNodeData, 'image'>;

/**
 * LLM node with proper typing
 */
export type LLMNode = Node<LLMNodeData, 'llm'>;

/**
 * System prompt node with proper typing
 */
export type SystemNode = Node<SystemPromptNodeData, 'system'>;

/**
 * Union type for all workflow nodes
 */
export type WorkflowNode = TextNode | ImageNode | LLMNode | SystemNode;

/**
 * Handle position configuration
 */
export interface HandleConfig {
  /** Unique handle ID */
  id: string;
  /** Handle type determining color */
  type: HandleType;
  /** Position ('left' or 'right') */
  position: 'left' | 'right';
  /** Label text displayed next to handle */
  label: string;
}
