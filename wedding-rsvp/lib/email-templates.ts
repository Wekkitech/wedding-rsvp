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
UID:${Date.now()}@wedding.brukhministries.co.ke
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
  const displayName = name || 'Guest';
  const safeLoginUrl = loginUrl || '#';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your RSVP Login Link</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container { 
      max-width: 600px; 
      margin: 20px auto; 
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header { 
      text-align: center; 
      padding: 40px 20px; 
      background: linear-gradient(135deg, #f6f8f6 0%, #fdfdfb 100%);
    }
    .header h1 {
      color: #5f7a5f;
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      color: #7d947d;
      margin: 0;
      font-size: 16px;
    }
    .content { 
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: #333;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button { 
      display: inline-block; 
      background: #5f7a5f; 
      color: #ffffff !important;
      padding: 14px 40px; 
      text-decoration: none; 
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }
    .button:hover {
      background: #4a6150;
    }
    .link-box {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      word-break: break-all;
    }
    .link-box p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    .link-box a {
      color: #5f7a5f;
      text-decoration: none;
    }
    .footer { 
      text-align: center; 
      color: #7d947d; 
      font-size: 12px; 
      padding: 20px;
      background: #f9f9f9;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Brill & Damaris</h1>
      <p>January 23, 2026</p>
    </div>
    
    <div class="content">
      <p>Hello ${displayName},</p>
      
      <p>You requested access to view and manage your RSVP for our wedding celebration.</p>
      
      <p>Click the button below to securely access your RSVP:</p>
      
      <div class="button-container">
        <a href="${safeLoginUrl}" class="button">Access Your RSVP</a>
      </div>
      
      <div class="link-box">
        <p><strong>Or copy and paste this link:</strong></p>
        <p><a href="${safeLoginUrl}">${safeLoginUrl}</a></p>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        <strong>🔒 Security Notice:</strong><br>
        • This link will expire in 24 hours<br>
        • Only use this link if you requested it<br>
        • If you didn't request this, you can safely ignore this email
      </p>
      
      <p style="margin-top: 30px;">
        With love,<br>
        <strong>Brill & Damaris</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Rusinga Island Lodge | January 23, 2026</strong></p>
      <p>We can't wait to celebrate with you!</p>
    </div>
  </div>
</body>
</html>`;
}

export function getRSVPConfirmationEmailTemplate(
  name: string,
  attending: boolean,
  isWaitlisted: boolean,
  hotelChoice?: string,
  dietaryRestrictions?: string,
  pledgeAmount?: number
): string {
  const displayName = name || 'Guest';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Confirmation</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f1f0;
    }
    .container { 
      max-width: 600px; 
      margin: 20px auto; 
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header { 
      text-align: center; 
      padding: 40px 20px; 
      background: linear-gradient(135deg, #8B7355 0%, #A68B6A 100%);
      color: white;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header h2 {
      margin: 0 0 10px 0;
      font-size: 20px;
      font-weight: 500;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content { 
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .info-box { 
      background: #f6f8f6; 
      padding: 20px; 
      border-radius: 6px; 
      margin: 20px 0;
      border-left: 4px solid #5f7a5f;
    }
    .info-box h3 {
      margin-top: 0;
      color: #5f7a5f;
      font-size: 18px;
    }
    .info-box p {
      margin: 8px 0;
    }
    .card {
      border: 2px solid #D4A574;
      border-radius: 8px;
      padding: 30px;
      background-color: #FEF9F7;
      margin: 30px 0;
      text-align: center;
    }
    .card-label {
      color: #B8956A;
      font-size: 12px;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: bold;
    }
    .card h3 {
      font-size: 24px;
      font-family: Georgia, serif;
      color: #8B7355;
      margin: 0 0 20px 0;
    }
    .card-detail {
      background-color: white;
      padding: 15px;
      border-radius: 6px;
      margin: 10px 0;
    }
    .card-detail-label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .card-detail-value {
      font-size: 16px;
      font-weight: bold;
      color: #8B7355;
    }
    .details-box {
      background-color: #F9F7F6;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .details-box h4 {
      margin: 0 0 15px 0;
      color: #8B7355;
      font-size: 14px;
      text-transform: uppercase;
      font-weight: bold;
    }
    .detail-item {
      font-size: 14px;
      color: #333;
      margin: 10px 0;
      line-height: 1.6;
    }
    .detail-item strong {
      color: #8B7355;
    }
    .success-badge {
      color: #27AE60;
      font-weight: bold;
    }
    .next-steps {
      background-color: #E8F4F8;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #27AE60;
    }
    .next-steps h4 {
      margin: 0 0 10px 0;
      color: #27AE60;
      font-size: 14px;
      font-weight: bold;
    }
    .next-steps ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #666;
    }
    .next-steps li {
      margin-bottom: 8px;
    }
    .footer { 
      text-align: center; 
      color: #999; 
      font-size: 12px; 
      padding: 20px;
      background: #f9f9f9;
      border-top: 1px solid #E0D5CF;
    }
    .footer p {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉</h1>
      <h2>${attending ? 'Your RSVP is Confirmed!' : 'Thank You for Letting Us Know'}</h2>
      <p>${attending ? "We're excited to celebrate with you" : 'We hope to celebrate another time'}</p>
    </div>

    <div class="content">
      <p class="greeting">
        Dear <strong>${displayName}</strong>,
      </p>

      ${attending ? `
        ${isWaitlisted ? `
          <p>Thank you for your interest in attending our wedding! We've received your RSVP, and you've been placed on our <strong>waitlist</strong> as we've reached our guest capacity.</p>
          <p>We'll notify you via email if a spot becomes available. We truly appreciate your understanding!</p>
        ` : `
          <p><strong>Thank you for confirming your attendance!</strong> We're thrilled you'll be joining us on our special day.</p>
          
          <div class="card">
            <p class="card-label">Wedding Celebration</p>
            <h3>Brill & Damaris</h3>

            <div class="card-detail">
              <span class="card-detail-label">Date</span>
              <span class="card-detail-value">Friday, January 23, 2026</span>
            </div>

            <div class="card-detail">
              <span class="card-detail-label">Ceremony</span>
              <span class="card-detail-value">11:00 AM - 1:00 PM</span>
            </div>

            <div class="card-detail">
              <span class="card-detail-label">Reception</span>
              <span class="card-detail-value">1:30 PM - 4:30 PM</span>
            </div>

            <div class="card-detail">
              <span class="card-detail-label">Venue</span>
              <span class="card-detail-value">Rusinga Island Lodge</span>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #999;">Rusinga Island, Kenya</p>
            </div>
          </div>

          ${hotelChoice || dietaryRestrictions || pledgeAmount ? `
            <div class="details-box">
              <h4>Your RSVP Details</h4>
              
              <div class="detail-item">
                <strong>Status:</strong> <span class="success-badge">✓ Attending</span>
              </div>

              ${hotelChoice ? `
                <div class="detail-item">
                  <strong>Accommodation:</strong> ${hotelChoice}
                </div>
              ` : ''}

              ${dietaryRestrictions ? `
                <div class="detail-item">
                  <strong>Dietary Restrictions:</strong> ${dietaryRestrictions}
                </div>
              ` : ''}

              ${pledgeAmount ? `
                <div class="detail-item">
                  <strong>Pledge Amount:</strong> KES ${pledgeAmount.toLocaleString()}
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          <div class="next-steps">
            <h4>What's Next?</h4>
            <ul>
              <li>Review travel and accommodation options on our website</li>
              <li>Share your gift contribution via M-Pesa to KCB Till: 227116</li>
              <li>Update your RSVP anytime before December 20th, 2025</li>
            </ul>
          </div>
        `}
      ` : `
        <p>Thank you for letting us know you won't be able to attend. We'll miss you, but we understand!</p>
        <p>We hope to celebrate with you another time.</p>
      `}
      
      <p style="margin-top: 30px;">
        With love,<br>
        <strong>Brill & Damaris</strong>
      </p>
    </div>

    <div class="footer">
      <p><strong>Rusinga Island Lodge | January 23, 2026</strong></p>
      <p>Questions? Contact us at owinobrill@gmail.com</p>
    </div>
  </div>
</body>
</html>`;
}