/**
 * @fileoverview API routes for individual workflow operations
 * @module API/Workflows/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase-server';
import type { WorkflowData } from '@/types/workflow';

/**
 * Route context with params
 */
interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/workflows/[id] - Get a single workflow
 */
export async function GET(request: NextRequest, context: RouteContext) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await context.params;
    const supabase = createServerSupabaseClient();

    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Workflow not found' },
          { status: 404 }
        );
      }
      console.error('[API] Get workflow error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve workflow' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: workflow });
  } catch (error) {
    console.error('[API] Get workflow exception:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/[id] - Update a workflow
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const updates = body as Partial<{ name: string; data: WorkflowData }>;

    if (!updates.name && !updates.data) {
      return NextResponse.json(
        { success: false, error: 'At least one field to update is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: workflow, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Workflow not found' },
          { status: 404 }
        );
      }
      console.error('[API] Update workflow error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update workflow' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: workflow });
  } catch (error) {
    console.error('[API] Update workflow exception:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/[id] - Delete a workflow
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await context.params;
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[API] Delete workflow error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete workflow' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Delete workflow exception:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
