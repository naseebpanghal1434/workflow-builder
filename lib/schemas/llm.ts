/**
 * @fileoverview Zod validation schemas for LLM API
 * @module Lib/Schemas/LLM
 */

import { z } from 'zod';

/**
 * Schema for validating LLM API request body
 *
 * @description Validates the request payload for LLM execution
 * - model: Required, non-empty string
 * - system_prompt: Optional string
 * - user_message: Required, non-empty string
 * - images: Optional array of base64 strings
 */
export const LLMRequestSchema = z.object({
  model: z
    .string()
    .min(1, 'Model is required'),

  system_prompt: z
    .string()
    .optional(),

  user_message: z
    .string()
    .min(1, 'User message is required')
    .max(32000, 'User message exceeds maximum length'),

  images: z
    .array(z.string())
    .optional(),
});

/**
 * Inferred type from LLMRequestSchema
 */
export type LLMRequestInput = z.infer<typeof LLMRequestSchema>;

/**
 * Schema for validating API response (internal use)
 */
export const LLMResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    output: z.string(),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
    code: z.string().optional(),
  }),
]);
