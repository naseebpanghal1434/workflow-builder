/**
 * @fileoverview Input chaining logic for collecting data from connected nodes
 * @module Lib/Utils/InputChaining
 */

import type { Node, Edge } from "reactflow";
import {
  type TextNodeData,
  type ImageNodeData,
  type LLMNodeData,
  NODE_TYPES,
  ImageDescribeNodeData,
} from "@/types/nodes";

/**
 * Collected inputs from connected nodes for LLM execution
 */
export interface CollectedInputs {
  /** System prompt from connected Text node (optional) */
  systemPrompt: string | undefined;
  /** User message from connected Text node (required) */
  userMessage: string | undefined;
  /** Array of base64 images from connected Image nodes */
  images: string[];
  /** Validation errors */
  errors: string[];
}

/**
 * Collects input data from all nodes connected to an LLM node
 *
 * @param {string} llmNodeId - ID of the LLM node to collect inputs for
 * @param {Node[]} nodes - All nodes in the workflow
 * @param {Edge[]} edges - All edges in the workflow
 * @returns {CollectedInputs} Collected inputs and any validation errors
 *
 * @example
 * const inputs = collectLLMInputs('llm-123', nodes, edges);
 * if (inputs.errors.length > 0) {
 *   showError(inputs.errors[0]);
 *   return;
 * }
 * // Proceed with API call
 */
export function collectLLMInputs(
  llmNodeId: string,
  nodes: Node[],
  edges: Edge[]
): CollectedInputs {
  const result: CollectedInputs = {
    systemPrompt: undefined,
    userMessage: undefined,
    images: [],
    errors: [],
  };
  const node = nodes.find((n) => n.id === llmNodeId);
  // Find all edges targeting this LLM node
  const incomingEdges = edges.filter((edge) => edge.target === llmNodeId);

  // If no edges, provide helpful error
  if (incomingEdges.length === 0) {
    result.errors.push(
      node && node.type === NODE_TYPES.IMG_DESCRIBE
        ? "No inputs connected. Connect Image nodes to provide description."
        : "No inputs connected. Connect a Text node to provide a prompt."
    );
    return result;
  }

  // Process each connection
  for (const edge of incomingEdges) {
    const sourceNode = nodes.find((node) => node.id === edge.source);

    if (!sourceNode) {
      console.warn(`Source node not found for edge: ${edge.id}`);
      continue;
    }

    const targetHandle = edge.targetHandle;

    switch (targetHandle) {
      case NODE_TYPES.SYSTEM_PROMPT: {
        // System prompt input - from System Prompt node or Text node
        if (sourceNode.type === "system" || sourceNode.type === "text") {
          const data = sourceNode.data as TextNodeData;
          if (data.content && data.content.trim()) {
            // If we already have a system prompt, combine them
            if (result.systemPrompt) {
              result.systemPrompt = `${
                result.systemPrompt
              }\n\n${data.content.trim()}`;
            } else {
              result.systemPrompt = data.content.trim();
            }
          }
        }
        break;
      }

      case NODE_TYPES.TEXT_INPUT: {
        // Text input - can be used as user_message or combined
        if (
          sourceNode.type === NODE_TYPES.TEXT_INPUT ||
          sourceNode.type === NODE_TYPES.SYSTEM_PROMPT
        ) {
          const data = sourceNode.data as TextNodeData;
          if (data.content && data.content.trim()) {
            // If we already have a user message, combine them
            if (result.userMessage) {
              result.userMessage = `${
                result.userMessage
              }\n\n${data.content.trim()}`;
            } else {
              result.userMessage = data.content.trim();
            }
          }
        } else if (sourceNode.type === NODE_TYPES.LLM) {
          // LLM output connected to another LLM's input
          const data = sourceNode.data as LLMNodeData;
          if (data.output && data.output.trim()) {
            if (result.userMessage) {
              result.userMessage = `${
                result.userMessage
              }\n\n${data.output.trim()}`;
            } else {
              result.userMessage = data.output.trim();
            }
          }
        }
        break;
      }

      case NODE_TYPES.IMAGE_INPUT: {
        // Image input
        if (sourceNode.type === NODE_TYPES.IMAGE_INPUT) {
          const data = sourceNode.data as ImageNodeData;
          if (data.imageData) {
            // Add the base64 image with proper data URI prefix
            const imageWithPrefix = data.mimeType
              ? `data:${data.mimeType};base64,${data.imageData}`
              : `data:image/jpeg;base64,${data.imageData}`;
            result.images.push(imageWithPrefix);
          }
        }
        break;
      }
      default:
        console.warn(`Unknown target handle: ${targetHandle}`);
    }
  }

  if (node && node.type === NODE_TYPES.IMG_DESCRIBE) {
    const data = node.data as ImageDescribeNodeData;
    if (data.prompt && data.prompt.trim().length > 0) {
      // If we already have a user message, combine them
      if (result.userMessage) {
        result.userMessage = `${result.userMessage}\n\n${data.prompt.trim()}`;
      } else {
        result.userMessage = data.prompt.trim();
      }
    } else if (!data.prompt || data.prompt.trim().length === 0) {
      result.errors.push(
        "Image Describe node requires a Model instruction. You can set it in the node's properties panel."
      );
    }

    if (result.images.length === 0) {
      result.errors.push(
        "No images connected. Connect an Image node to provide an image for description."
      );
    }
  }

  // Validate required inputs
  if (
    !result.userMessage ||
    (result.userMessage.trim().length === 0 &&
      (!node || node.type !== NODE_TYPES.IMG_DESCRIBE))
  ) {
    result.errors.push(
      "No text input provided. Connect a Text node to the text input handle."
    );
  }

  return result;
}

/**
 * Executes an LLM node by collecting inputs and calling the API
 *
 * @param {string} llmNodeId - ID of the LLM node to execute
 * @param {Node[]} nodes - All nodes in the workflow
 * @param {Edge[]} edges - All edges in the workflow
 * @returns {Promise<{ success: boolean; output?: string; error?: string }>} Result
 *
 * @example
 * const result = await executeLLMNode('llm-123', nodes, edges);
 * if (result.success) {
 *   updateNodeData(llmNodeId, { output: result.output });
 * } else {
 *   updateNodeData(llmNodeId, { error: result.error });
 * }
 */
export async function executeLLMNode(
  llmNodeId: string,
  nodes: Node[],
  edges: Edge[]
): Promise<{ success: boolean; output?: string; error?: string }> {
  // Get LLM node to read model selection
  const llmNode = nodes.find((node) => node.id === llmNodeId);
  if (
    !llmNode ||
    (llmNode.type !== "llm" && llmNode.type !== NODE_TYPES.IMG_DESCRIBE)
  ) {
    return { success: false, error: "LLM node not found" };
  }

  const llmData = llmNode.data as LLMNodeData;
  const model = llmData.model || "gemini-1.5-flash";

  // Collect inputs from connected nodes
  const inputs = collectLLMInputs(llmNodeId, nodes, edges);

  // Check for validation errors
  if (inputs.errors.length > 0) {
    return { success: false, error: inputs.errors[0] };
  }

  try {
    // Make API call
    const response = await fetch("/api/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        system_prompt: inputs.systemPrompt,
        user_message: inputs.userMessage,
        images: inputs.images.length > 0 ? inputs.images : undefined,
      }),
    });
    const data = await response.json();
    if (data.success) {
      return { success: true, output: data.output };
    } else {
      return { success: false, error: data.error || "An error occurred" };
    }
  } catch (error) {
    console.error("LLM execution error:", error);
    return {
      success: false,
      error: "Failed to connect to the server. Please try again.",
    };
  }
}
