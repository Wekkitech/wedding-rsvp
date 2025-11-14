export function generateICalendar(): string {
  const event = {
    start: '20260123T080000Z', // 11 AM EAT = 8 AM UTC
    end: '20260123T133000Z',   // 4:30 PM EAT = 1:30 PM UTC
    summary: 'Brill & Damaris Wedding',
    location: 'Rusinga Island Lodge, Rusinga Island, Kenya',
    description: 'Join us for our special day! Ceremony: 11AM-1PM | Reception: 1:30-4:30PM',
  };

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Brill & Damaris Wedding//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@brilldamariswedding.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${event.start}
DTEND:${event.end}
SUMMARY:${event.summary}
LOCATION:${event.location}
DESCRIPTION:${event.description}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P1D
DESCRIPTION:Wedding Reminder - Tomorrow!
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

export function getMagicLinkEmailTemplate(name: string, loginUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #f6f8f6 0%, #fdfdfb 100%); border-radius: 8px; }
    .content { background: white; padding: 30px; border: 1px solid #e3e9e3; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: #5f7a5f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #7d947d; font-size: 12px; padding: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #5f7a5f; margin: 0;">Brill & Damaris</h1>
      <p style="color: #7d947d; margin: 10px 0 0 0;">January 23, 2026</p>
    </div>
    
    <div class="content">
      <p>Hello${name ? ' ' + name : ''},</p>
      
      <p>Click the button below to access your RSVP for our wedding:</p>
      
      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">Access Your RSVP</a>
      </div>
      
      <p style="font-size: 14px; color: #666;">This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.</p>
      
      <p style="margin-top: 30px;">With love,<br><strong>Brill & Damaris</strong></p>
    </div>
    
    <div class="footer">
      <p>Rusinga Island Lodge | January 23, 2026</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getRSVPConfirmationEmailTemplate(
  name: string,
  attending: boolean,
  isWaitlisted: boolean
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #f6f8f6 0%, #fdfdfb 100%); border-radius: 8px; }
    .content { background: white; padding: 30px; border: 1px solid #e3e9e3; border-radius: 8px; margin: 20px 0; }
    .info-box { background: #f6f8f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .footer { text-align: center; color: #7d947d; font-size: 12px; padding: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #5f7a5f; margin: 0;">Brill & Damaris</h1>
      <p style="color: #7d947d; margin: 10px 0 0 0;">January 23, 2026</p>
    </div>
    
    <div class="content">
      <p>Dear ${name},</p>
      
      ${attending ? `
        ${isWaitlisted ? `
          <p>Thank you for your interest in attending our wedding! We've received your RSVP, and you've been placed on our <strong>waitlist</strong> as we've reached our guest capacity.</p>
          <p>We'll notify you via email if a spot becomes available. We truly appreciate your understanding!</p>
        ` : `
          <p><strong>Thank you for confirming your attendance!</strong> We're thrilled you'll be joining us on our special day.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #5f7a5f;">Event Details</h3>
            <p><strong>Date:</strong> Friday, January 23, 2026</p>
            <p><strong>Ceremony:</strong> 11:00 AM - 1:00 PM</p>
            <p><strong>Reception:</strong> 1:30 PM - 4:30 PM</p>
            <p><strong>Location:</strong> Rusinga Island Lodge, Rusinga Island</p>
            <p><strong>Distance from Nakuru:</strong> ~290 KM</p>
          </div>
          
          <p><strong>What's Next:</strong></p>
          <ul>
            <li>Add the event to your calendar (download link in your dashboard)</li>
            <li>Review travel and accommodation options on our website</li>
            <li>Share your gift contribution via M-Pesa to KCB Till</li>
          </ul>
        `}
      ` : `
        <p>Thank you for letting us know you won't be able to attend. We'll miss you, but we understand!</p>
        <p>We hope to celebrate with you another time.</p>
      `}
      
      <p style="margin-top: 30px;">With love,<br><strong>Brill & Damaris</strong></p>
    </div>
    
    <div class="footer">
      <p>Rusinga Island Lodge | January 23, 2026</p>
    </div>
  </div>
</body>
</html>
  `;
}
