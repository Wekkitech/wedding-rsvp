import { verifyMagicLink } from '@/lib/auth';
import { getGuestByEmail } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const email = await verifyMagicLink(token);

    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const guest = await getGuestByEmail(email);

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        email: guest.email,
        name: guest.name,
        phone: guest.phone,
      }
    });
  } catch (error) {
    console.error('Error verifying magic link:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
