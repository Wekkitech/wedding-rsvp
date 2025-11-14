# 🎯 Quick Reference Card

## 🔗 Important URLs

**Development**: http://localhost:3000
**After Deploy**: https://your-app.vercel.app

### Key Pages
- Home: `/`
- Login: `/login`
- RSVP Form: `/rsvp`
- Success: `/success`
- Travel Info: `/travel`
- FAQ: `/faq`
- Admin Dashboard: `/admin`

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel
```

## 📧 Resend Setup (5 mins)

1. Go to: https://resend.com
2. Sign up (free)
3. Get API key
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_your_key_here
   ```
5. Uncomment lines 35-43 in `app/api/auth/send-link/route.ts`

## 🔐 Add Admin User

```sql
-- In Supabase SQL Editor
INSERT INTO admins (email) VALUES ('your-email@example.com');
```

## 🎨 Quick Customizations

### Change Colors
**File**: `tailwind.config.ts`
- Line 33-48: Sage green shades
- Line 49-60: Blush pink shades
- Line 61-72: Cream neutral shades

### Update Event Details
**File**: `app/page.tsx`
- Line 13: Wedding date
- Line 102-106: Ceremony time
- Line 126-130: Reception time

### Edit Hotel List
**File**: `app/travel/page.tsx`
- Line 8-33: Hotel information array

### Modify FAQ
**File**: `app/faq/page.tsx`
- Line 7-68: FAQ questions and answers

### Change Max Guests
**File**: `.env.local`
```
MAX_GUESTS=70
```

## 🗄️ Database Quick Reference

### Check RSVP Count
```sql
SELECT COUNT(*) FROM rsvps WHERE attending = true AND is_waitlisted = false;
```

### View All RSVPs
```sql
SELECT g.name, g.email, r.attending, r.is_waitlisted, r.hotel_choice
FROM rsvps r
JOIN guests g ON g.id = r.guest_id
ORDER BY r.created_at DESC;
```

### Add Admin
```sql
INSERT INTO admins (email) VALUES ('email@example.com');
```

### Remove Waitlist Status
```sql
UPDATE rsvps SET is_waitlisted = false WHERE id = 'rsvp-id-here';
```

## 🐛 Common Issues & Fixes

### Issue: Magic link not working
**Fix**: 
- Check token hasn't expired (24 hours)
- In development, use the displayed link
- Set up Resend for email delivery

### Issue: Can't access admin
**Fix**:
```sql
-- Add your email to admins table
INSERT INTO admins (email) VALUES ('your-email@example.com');
```

### Issue: Database connection error
**Fix**: 
- Check `.env.local` credentials match Supabase
- Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: Styles not loading
**Fix**:
```bash
# Delete .next folder and rebuild
rm -rf .next
npm run dev
```

### Issue: Cannot update RSVP
**Fix**: Login again with same email, form will show existing data

## 📊 Admin Dashboard Features

**Location**: `/admin`
**Access**: Requires email in `admins` table

**Features**:
- ✅ View all RSVPs
- ✅ Filter by status
- ✅ See pledge totals
- ✅ Export to CSV
- ✅ Real-time stats

## 🎯 Testing Checklist

Before going live:

- [ ] Test login flow with your email
- [ ] Submit a test RSVP
- [ ] Check success page loads
- [ ] Download calendar file works
- [ ] Google Maps link opens correctly
- [ ] Admin dashboard accessible
- [ ] CSV export works
- [ ] Test on mobile device
- [ ] Test all navigation links
- [ ] Verify M-Pesa till number is correct

## 📱 Share with Guests

Once deployed, share these links:
- **Main site**: `https://your-app.vercel.app`
- **Direct RSVP**: `https://your-app.vercel.app/rsvp`
- **FAQ**: `https://your-app.vercel.app/faq`

## 🆘 Need Help?

1. Check `README.md` for full docs
2. Check `DEPLOYMENT-GUIDE.md` for setup steps
3. Check `PROJECT-SUMMARY.md` for overview
4. Check Supabase logs for errors
5. Check browser console (F12) for errors

## 💡 Pro Tips

- Export CSV weekly for backups
- Test email flow before sharing with guests
- Keep admin credentials secure
- Monitor RSVP count to track toward 70 limit
- Update FAQ based on guest questions
- Share direct links via WhatsApp for easy access

## 🎊 After the Wedding

**Archive the data**:
```bash
# From admin dashboard
1. Export CSV
2. Download and save
3. Optional: Back up Supabase database
```

**Thank your guests**:
- Use email list from CSV
- Send thank you notes
- Share wedding photos

---

**Everything you need at a glance!** 📋✨
