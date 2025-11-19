// app/api/admin/budget/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllCategories, 
  getCategorySummary,
  createCategory, 
  updateCategory 
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-otp';

export const dynamic = 'force-dynamic';

// GET - Fetch all categories with spending summary
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role } = await verifyAdminSession(sessionToken);
    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const withSummary = searchParams.get('summary') === 'true';

    if (withSummary) {
      const summary = await getCategorySummary();
      return NextResponse.json({ categories: summary });
    } else {
      const categories = await getAllCategories();
      return NextResponse.json({ categories });
    }

  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role } = await verifyAdminSession(sessionToken);
    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const category = await createCategory({
      name: body.name,
      description: body.description || null,
      allocated_amount: parseFloat(body.allocated_amount),
      color: body.color || '#8B7355'
    });

    return NextResponse.json({ category }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, role } = await verifyAdminSession(sessionToken);
    if (!valid || role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    // Convert allocated_amount to number if present
    if (updates.allocated_amount) {
      updates.allocated_amount = parseFloat(updates.allocated_amount);
    }

    const category = await updateCategory(id, updates);
    return NextResponse.json({ category });

  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}