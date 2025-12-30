/**
 * @fileoverview LLM API status endpoint
 * @module API/LLM/Status
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/llm/status - Check if LLM API is configured
 */
export async function GET() {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY);

  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured
      ? 'Gemini API is configured'
      : 'Gemini API key is not configured. Add GEMINI_API_KEY to your environment variables.',
  });
}
