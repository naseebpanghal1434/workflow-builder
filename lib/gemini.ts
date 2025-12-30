/**
 * @fileoverview Google Gemini API client configuration
 * @module Lib/Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini API key from environment variables (server-side only)
 */
const apiKey = process.env.GEMINI_API_KEY;

/**
 * Validate that Gemini API key is set
 */
if (!apiKey) {
  console.warn(
    'GEMINI_API_KEY is not set. LLM features will be disabled.'
  );
}

/**
 * Google Generative AI client instance
 *
 * @example
 * import { genAI } from '@/lib/gemini';
 * const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
 */
export const genAI = new GoogleGenerativeAI(apiKey || '');

/**
 * Get a Gemini model instance by model ID
 *
 * @param {string} modelId - The Gemini model ID
 * @returns {import('@google/generative-ai').GenerativeModel} The model instance
 *
 * @example
 * const model = getModel('gemini-1.5-flash');
 * const result = await model.generateContent('Hello');
 */
export function getModel(modelId: string) {
  return genAI.getGenerativeModel({ model: modelId });
}
