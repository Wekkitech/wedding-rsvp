import { getAllRSVPs, isAdmin } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const format = searchParams.get('format');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(email);

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const rsvps = await getAllRSVPs();

    // If CSV export requested
    if (format === 'csv') {
      const csvRows = [
        ['Name', 'Email', 'Phone', 'Attending', 'Waitlisted', 'Hotel Choice', 'Pledge Amount', 'Dietary Needs', 'Note', 'Created At']
      ];

      rsvps.forEach((rsvp) => {
        csvRows.push([
          rsvp.guest.name || '',
          rsvp.guest.email,
          rsvp.guest.phone || '',
          rsvp.attending ? 'Yes' : 'No',
          rsvp.is_waitlisted ? 'Yes' : 'No',
          rsvp.hotel_choice || '',
          rsvp.pledge_amount ? rsvp.pledge_amount.toString() : '',
          rsvp.dietary_needs || '',
          rsvp.note || '',
          new Date(rsvp.created_at).toLocaleString()
        ]);
      });

      const csvContent = csvRows.map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=wedding-rsvps.csv'
        }
      });
    }

    // Return JSON
    return NextResponse.json({
      rsvps,
      stats: {
        total: rsvps.length,
        attending: rsvps.filter(r => r.attending && !r.is_waitlisted).length,
        declined: rsvps.filter(r => !r.attending).length,
        waitlisted: rsvps.filter(r => r.is_waitlisted).length,
        totalPledges: rsvps.reduce((sum, r) => sum + (r.pledge_amount || 0), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSVPs' },
      { status: 500 }
    );
  }
}
