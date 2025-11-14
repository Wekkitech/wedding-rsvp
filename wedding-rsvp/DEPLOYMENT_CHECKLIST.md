# 🚀 Deployment Checklist

Use this checklist before sharing your wedding RSVP app with guests!

## ✅ Pre-Deployment Checklist

### Database Setup
- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Your email added to `admins` table
- [ ] Test data created and visible in Supabase Table Editor

### Environment Variables
- [ ] `.env.local` file created
- [ ] Supabase URL added
- [ ] Supabase anon key added
- [ ] Supabase service role key added
- [ ] Admin email configured
- [ ] KCB Till number updated
- [ ] Max guests set to 70 (or your preferred number)

### Application Testing
- [ ] App runs locally (`npm run dev`)
- [ ] Home page loads correctly
- [ ] Navigation works (all links)
- [ ] Magic link generated (check console)
- [ ] Magic link login works
- [ ] RSVP form submission works
- [ ] "Yes" response saves correctly
- [ ] "No" response saves correctly
- [ ] Dietary needs field saves
- [ ] Hotel selection saves
- [ ] Pledge amount saves
- [ ] Success page appears after submission
- [ ] Calendar .ics file downloads
- [ ] Google Maps link opens
- [ ] Admin panel accessible
- [ ] Admin can view RSVPs
- [ ] CSV export works

### Content Customization
- [ ] Event date is correct
- [ ] Event times are correct
- [ ] Venue name is correct
- [ ] Distance information is accurate
- [ ] Hotel options are up-to-date with prices
- [ ] KCB Till number is YOUR actual till
- [ ] Google Maps link points to correct location
- [ ] Dress code reflects your preferences
- [ ] FAQ answers are customized
- [ ] Contact information is current

### Waitlist Testing
- [ ] First RSVP "yes" is confirmed (not waitlisted)
- [ ] After 70 confirmed, new "yes" is waitlisted
- [ ] Admin can see waitlist status
- [ ] Waitlist message shows correctly

### Mobile Responsiveness
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test on iPad
- [ ] Navigation menu works on mobile
- [ ] Forms are easy to fill on mobile
- [ ] Buttons are tappable on mobile

---

## 🌐 Production Deployment Checklist

### Email Configuration (Required for Production)
- [ ] Resend account created
- [ ] Domain verified (or using Resend test domain)
- [ ] API key generated
- [ ] API key added to environment variables
- [ ] Email sending code uncommented in `/app/api/auth/send-link/route.ts`
- [ ] `from` email address updated
- [ ] Test email sent successfully
- [ ] Email received in inbox (check spam folder)
- [ ] Magic link in email works

### GitHub Setup
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] `.env.local` NOT committed (check .gitignore)
- [ ] README.md included

### Vercel Deployment
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] All environment variables added:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `RESEND_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` (your Vercel URL)
  - [ ] `NEXT_PUBLIC_MAX_GUESTS`
  - [ ] `NEXT_PUBLIC_KCB_TILL_NUMBER`
  - [ ] `ADMIN_EMAILS`
- [ ] Deployment successful
- [ ] Production URL works
- [ ] No build errors

### Production Testing
- [ ] Home page loads on production URL
- [ ] All images load
- [ ] All links work
- [ ] Magic link email received
- [ ] Magic link from email works
- [ ] RSVP submission works
- [ ] Admin panel works
- [ ] SSL certificate active (https://)
- [ ] Mobile version works
- [ ] No console errors

### Domain Setup (Optional)
- [ ] Custom domain purchased
- [ ] Domain connected to Vercel
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] `NEXT_PUBLIC_APP_URL` updated to custom domain

---

## 🎯 Launch Day Checklist

### Before Sharing Link
- [ ] All testing complete
- [ ] Backup of database taken
- [ ] Admin access tested
- [ ] Sample RSVP submitted and visible
- [ ] Email notifications working
- [ ] Mobile version tested on real devices

### Communication Prep
- [ ] Save the app URL
- [ ] Prepare announcement message
- [ ] Test URL in message apps (WhatsApp, SMS)
- [ ] Create short URL if desired (bit.ly)

### Share With Guests
- [ ] Announce via WhatsApp
- [ ] Send via Email
- [ ] Post on social media (if applicable)
- [ ] Physical invitations include URL

### Monitor
- [ ] Check Supabase usage
- [ ] Monitor Vercel analytics
- [ ] Watch for error emails
- [ ] Respond to guest questions
- [ ] Check RSVP count regularly

---

## 📊 Ongoing Monitoring

### Daily Checks (Until Wedding)
- [ ] Check new RSVPs in admin panel
- [ ] Verify email notifications sent
- [ ] Monitor Supabase database size
- [ ] Check Vercel bandwidth usage
- [ ] Respond to guest questions

### Weekly Tasks
- [ ] Export CSV backup
- [ ] Review dietary needs
- [ ] Check hotel preferences
- [ ] Update waitlist if spots open
- [ ] Send reminders to non-responders

### One Week Before Wedding
- [ ] Final RSVP count
- [ ] Contact waitlisted guests
- [ ] Share final count with caterer
- [ ] Share hotel preferences with venues
- [ ] Export final CSV with all data

---

## 🆘 Emergency Contacts

### If Something Goes Wrong

**App is down:**
1. Check Vercel status page
2. Check Supabase status
3. Review deployment logs in Vercel
4. Redeploy if necessary

**Emails not sending:**
1. Check Resend dashboard
2. Verify API key is correct
3. Check domain verification
4. Review email sending logs

**Database issues:**
1. Check Supabase dashboard
2. Review database logs
3. Check connection strings
4. Verify service role key

**Can't access admin panel:**
1. Verify email in `admins` table
2. Clear browser cache
3. Try incognito mode
4. Check admin verification logic

---

## 📈 Success Metrics

Track these to ensure everything is working:

- **Total RSVPs Received:** _____
- **Confirmed Guests:** _____
- **Declined:** _____
- **Waitlisted:** _____
- **Email Delivery Rate:** _____%
- **Mobile vs Desktop Access:** _____%
- **Average Response Time:** _____ days

---

## 💡 Pro Tips

1. **Test with real guests** - Ask 2-3 friends to RSVP before full launch
2. **Monitor first 24 hours** - Most issues appear early
3. **Have backup plan** - Keep phone numbers for important guests
4. **Set reminders** - Follow up with guests who haven't responded
5. **Keep it simple** - Don't add features last minute
6. **Backup everything** - Export CSV weekly
7. **Stay calm** - Technical issues are normal and fixable!

---

## 🎉 Launch Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to Vercel (after pushing to GitHub)
# Vercel auto-deploys on push to main branch

# View production logs
# Check Vercel dashboard → Deployments → View Logs
```

---

## ✅ Final Pre-Launch Verification

Run through this ONE MORE TIME before sharing:

1. Visit your production URL
2. Request a magic link
3. Check your email
4. Click the link
5. Fill out RSVP
6. Submit
7. Check admin panel
8. Verify data is correct
9. Export CSV
10. Check CSV has correct data

**If all 10 steps work perfectly → YOU'RE READY TO LAUNCH! 🚀**

---

**Remember:** It's normal to feel nervous, but you've built something amazing! 

Good luck! 💒💕
