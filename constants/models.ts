/**
 * @fileoverview Available Gemini model configurations
 * @module Constants/Models
 */

/**
 * Gemini model configuration
 */
export interface GeminiModel {
  /** Model ID used in API calls */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Short description of the model */
  description: string;
  /** Whether the model supports image inputs */
  supportsVision: boolean;
}

/**
 * Available Gemini models for the workflow builder
 */
export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Fast and lightweight for simple tasks',
    supportsVision: true,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Balanced speed and capability',
    supportsVision: true,
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash (Preview)',
    description: 'Latest preview model with advanced capabilities',
    supportsVision: true,
  },
] as const;

/**
 * Default model ID for new LLM nodes
 */
export const DEFAULT_MODEL_ID = 'gemini-2.5-flash';

/**
 * Get a model by its ID
 *
 * @param {string} modelId - The model ID to look up
 * @returns {GeminiModel | undefined} The model configuration or undefined
 *
 * @example
 * const model = getModelById('gemini-1.5-flash');
 */
export function getModelById(modelId: string): GeminiModel | undefined {
  return GEMINI_MODELS.find((model) => model.id === modelId);
}
