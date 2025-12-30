/**
 * @fileoverview Type definitions for API requests and responses
 * @module Types/API
 */

/**
 * LLM API request body
 */
export interface LLMRequest {
  /** Selected Gemini model ID */
  model: string;
  /** Optional system prompt */
  system_prompt?: string;
  /** User message (required) */
  user_message: string;
  /** Optional array of base64 image strings */
  images?: string[];
}

/**
 * Successful LLM API response
 */
export interface LLMSuccessResponse {
  /** Success indicator */
  success: true;
  /** Generated text output */
  output: string;
}

/**
 * Failed LLM API response
 */
export interface LLMErrorResponse {
  /** Failure indicator */
  success: false;
  /** Error message */
  error: string;
  /** Error code for categorization */
  code?: string;
}

/**
 * Union type for LLM API response
 */
export type LLMResponse = LLMSuccessResponse | LLMErrorResponse;
