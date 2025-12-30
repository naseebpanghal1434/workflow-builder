/**
 * @fileoverview LLM API route handler
 * @module API/LLM
 *
 * @description
 * Handles POST requests for LLM execution using Google Gemini API.
 * Supports both text-only and multimodal (text + images) requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { genAI } from '@/lib/gemini';
import { LLMRequestSchema } from '@/lib/schemas/llm';
import { parseAPIError, createErrorResponse, ERROR_CODES } from '@/lib/utils/api-error';
import type { LLMResponse } from '@/types/api';

/**
 * Extracts MIME type and data from a base64 image string
 *
 * @param {string} base64String - Base64 encoded image (with or without data URI prefix)
 * @returns {{ mimeType: string; data: string }} Extracted MIME type and clean base64 data
 */
function parseBase64Image(base64String: string): { mimeType: string; data: string } {
  // Handle data URI format: data:image/jpeg;base64,/9j/4AAQ...
  if (base64String.startsWith('data:')) {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return {
        mimeType: matches[1],
        data: matches[2],
      };
    }
  }

  // Default to JPEG if no prefix
  return {
    mimeType: 'image/jpeg',
    data: base64String,
  };
}

/**
 * POST handler for LLM execution
 *
 * @param {NextRequest} request - Incoming request object
 * @returns {Promise<NextResponse<LLMResponse>>} JSON response with output or error
 *
 * @example
 * // Request body:
 * {
 *   "model": "gemini-2.0-flash-exp",
 *   "system_prompt": "You are a helpful assistant.",
 *   "user_message": "Hello, how are you?",
 *   "images": ["data:image/jpeg;base64,..."]
 * }
 *
 * // Success response:
 * { "success": true, "output": "I'm doing well, thank you!" }
 *
 * // Error response:
 * { "success": false, "error": "User message is required", "code": "VALIDATION_ERROR" }
 */
export async function POST(request: NextRequest): Promise<NextResponse<LLMResponse>> {
  try {
    // Step 1: Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        createErrorResponse('Gemini API key is not configured', ERROR_CODES.AUTH_ERROR),
        { status: 500 }
      );
    }

    // Step 2: Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse('Invalid JSON in request body', ERROR_CODES.VALIDATION_ERROR),
        { status: 400 }
      );
    }

    // Step 3: Validate with Zod schema
    const validationResult = LLMRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        createErrorResponse(
          firstError?.message || 'Invalid request data',
          ERROR_CODES.VALIDATION_ERROR
        ),
        { status: 400 }
      );
    }

    const { model, system_prompt, user_message, images } = validationResult.data;

    // Step 4: Initialize Gemini model with optional system instruction
    const generativeModel = genAI.getGenerativeModel({
      model,
      ...(system_prompt && { systemInstruction: system_prompt }),
    });

    // Step 5: Build content parts for the request
    type ContentPart =
      | { text: string }
      | { inlineData: { mimeType: string; data: string } };

    const parts: ContentPart[] = [];

    // Add user message as text
    parts.push({ text: user_message });

    // Add images if provided (multimodal request)
    if (images && images.length > 0) {
      for (const base64Image of images) {
        const { mimeType, data } = parseBase64Image(base64Image);
        parts.push({
          inlineData: {
            mimeType,
            data,
          },
        });
      }
    }

    // Step 6: Execute Gemini API call
    const result = await generativeModel.generateContent(parts);
    const response = await result.response;
    const output = response.text();

    // Step 7: Return success response
    return NextResponse.json({
      success: true,
      output,
    });

  } catch (error) {
    // Log error for debugging (server-side only)
    console.error('[LLM API Error]:', error);

    // Parse and return user-friendly error
    const { message, code } = parseAPIError(error);

    // Determine HTTP status based on error code
    const statusMap: Record<string, number> = {
      [ERROR_CODES.VALIDATION_ERROR]: 400,
      [ERROR_CODES.AUTH_ERROR]: 401,
      [ERROR_CODES.MODEL_NOT_FOUND]: 404,
      [ERROR_CODES.RATE_LIMIT]: 429,
      [ERROR_CODES.SAFETY_BLOCKED]: 400,
      [ERROR_CODES.INTERNAL_ERROR]: 500,
    };

    return NextResponse.json(
      createErrorResponse(message, code),
      { status: statusMap[code] || 500 }
    );
  }
}
