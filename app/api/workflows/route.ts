/**
 * @fileoverview API routes for workflow collection operations
 * @module API/Workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase-server';
import type { WorkflowData } from '@/types/workflow';

/**
 * GET /api/workflows - List all workflows
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const { data: workflows, error } = await supabase
      .from('workflows')
      .select('id, name, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[API] List workflows error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve workflows' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: workflows });
  } catch (error) {
    console.error('[API] List workflows exception:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows - Create a new workflow
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { name, data } = body as { name: string; data: WorkflowData };

    if (!name || !data) {
      return NextResponse.json(
        { success: false, error: 'Name and data are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: workflow, error } = await supabase
      .from('workflows')
      .insert({ name, data })
      .select()
      .single();

    if (error) {
      console.error('[API] Create workflow error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create workflow' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: workflow }, { status: 201 });
  } catch (error) {
    console.error('[API] Create workflow exception:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
