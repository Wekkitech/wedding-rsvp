/**
 * Generate a Google Calendar link for the wedding event
 */

export function generateGoogleCalendarLink(): string {
  const eventDetails = {
    title: "Brill & Damaris Wedding",
    description: "Join us for our wedding celebration! Ceremony at 11:00 AM followed by reception. We can't wait to celebrate with you!",
    location: "Rusinga Island Lodge, Rusinga Island, Kenya",
    startDate: "20260123T080000Z", // Jan 23, 2026, 11:00 AM EAT (UTC+3 = 08:00 UTC)
    endDate: "20260123T133000Z",   // Jan 23, 2026, 4:30 PM EAT (13:30 UTC)
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventDetails.title,
    dates: `${eventDetails.startDate}/${eventDetails.endDate}`,
    details: eventDetails.description,
    location: eventDetails.location,
    trp: "true",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
