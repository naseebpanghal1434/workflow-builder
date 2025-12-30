/**
 * @fileoverview API error handling utilities
 * @module Lib/Utils/APIError
 */

/**
 * Error codes for API responses
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  AUTH_ERROR: 'AUTH_ERROR',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  SAFETY_BLOCKED: 'SAFETY_BLOCKED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

/**
 * User-friendly error messages mapped to error patterns
 */
const ERROR_MESSAGES: Record<string, { message: string; code: string }> = {
  '429': {
    message: 'API rate limit exceeded. Please wait a moment and try again.',
    code: ERROR_CODES.RATE_LIMIT,
  },
  'quota': {
    message: 'API quota exceeded. Please try again later.',
    code: ERROR_CODES.RATE_LIMIT,
  },
  '401': {
    message: 'Invalid API key. Please check your configuration.',
    code: ERROR_CODES.AUTH_ERROR,
  },
  'API key': {
    message: 'Invalid API key. Please check your configuration.',
    code: ERROR_CODES.AUTH_ERROR,
  },
  '404': {
    message: 'The selected model was not found. Please choose a different model.',
    code: ERROR_CODES.MODEL_NOT_FOUND,
  },
  'not found': {
    message: 'The selected model was not found. Please choose a different model.',
    code: ERROR_CODES.MODEL_NOT_FOUND,
  },
  'safety': {
    message: 'Your request was blocked by safety filters. Please modify your prompt.',
    code: ERROR_CODES.SAFETY_BLOCKED,
  },
  'blocked': {
    message: 'Your request was blocked by content filters. Please modify your prompt.',
    code: ERROR_CODES.SAFETY_BLOCKED,
  },
};

/**
 * Parses an error and returns a user-friendly message
 *
 * @param {unknown} error - The caught error
 * @returns {{ message: string; code: string }} User-friendly error info
 *
 * @example
 * try {
 *   await geminiCall();
 * } catch (error) {
 *   const { message, code } = parseAPIError(error);
 * }
 */
export function parseAPIError(error: unknown): { message: string; code: string } {
  if (error instanceof Error) {
    const errorString = error.message.toLowerCase();

    // Check for known error patterns
    for (const [pattern, errorInfo] of Object.entries(ERROR_MESSAGES)) {
      if (errorString.includes(pattern.toLowerCase())) {
        return errorInfo;
      }
    }
  }

  // Default error
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: ERROR_CODES.INTERNAL_ERROR,
  };
}

/**
 * Creates a standardized error response object
 *
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @returns {object} Error response object
 *
 * @example
 * return NextResponse.json(createErrorResponse('Invalid input', 'VALIDATION_ERROR'), { status: 400 });
 */
export function createErrorResponse(message: string, code: string): {
  success: false;
  error: string;
  code: string;
} {
  return {
    success: false as const,
    error: message,
    code,
  };
}
