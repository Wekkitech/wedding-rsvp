import { NextRequest, NextResponse } from 'next/server';
import { deleteAdmin } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestorEmail = searchParams.get('requestorEmail');
    const targetEmail = searchParams.get('targetEmail');

    if (!requestorEmail || !targetEmail) {
      return NextResponse.json(
        { error: 'Requestor email and target email are required' },
        { status: 400 }
      );
    }

    await deleteAdmin(requestorEmail, targetEmail);

    return NextResponse.json({
      success: true,
      message: `Admin ${targetEmail} deleted successfully`,
    });
  } catch (error: any) {
    console.error('Error deleting admin:', error);

    if (error.message.includes('Only super admins') || 
        error.message.includes('Cannot delete')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}