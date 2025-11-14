# 🚀 Quick Setup Guide for Beginners

This guide will help you get the wedding RSVP app running in **15 minutes**!

## ✅ What You Need

1. A computer with internet
2. That's it! We'll help you get everything else.

---

## Step 1: Install Node.js (5 minutes)

Node.js is required to run the app.

1. Go to: https://nodejs.org
2. Click the big green button that says "Download" (get the LTS version)
3. Open the downloaded file and follow the installation wizard
4. Click "Next" → "Next" → "Install"
5. **Verify it worked:**
   - Open Terminal (Mac) or Command Prompt (Windows)
   - Type: `node --version`
   - You should see something like: `v20.10.0`

---

## Step 2: Get the Code (1 minute)

You should have received a `wedding-rsvp` folder. If it's a ZIP file:
1. Unzip it
2. Remember where you saved it!

---

## Step 3: Install App Dependencies (3 minutes)

1. **Open Terminal/Command Prompt**
2. **Navigate to the project folder:**
   ```bash
   cd path/to/wedding-rsvp
   ```
   (Replace `path/to/wedding-rsvp` with the actual path)
   
   **Mac example:** `cd /Users/yourname/Downloads/wedding-rsvp`
   **Windows example:** `cd C:\Users\yourname\Downloads\wedding-rsvp`

3. **Install dependencies:**
   ```bash
   npm install
   ```
   Wait 2-3 minutes while it downloads everything needed.

---

## Step 4: Set Up Your Supabase Database (5 minutes)

Already done! ✅ You set this up earlier:
- Created Supabase account
- Created project
- Ran the SQL script
- Got your credentials

---

## Step 5: Create Environment File (2 minutes)

1. In the `wedding-rsvp` folder, create a new file called `.env.local`
   
   **Mac:**
   ```bash
   touch .env.local
   open .env.local
   ```
   
   **Windows:**
   - Right-click in folder → New → Text Document
   - Name it `.env.local` (remove the .txt extension)
   - Open it in Notepad

2. **Copy this template and paste it into the file:**

```env
# Replace with YOUR Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Email - leave empty for now (magic links will show in console)
RESEND_API_KEY=

# App settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_GUESTS=70
NEXT_PUBLIC_KCB_TILL_NUMBER=5834561

# Your admin email
ADMIN_EMAILS=your-email@example.com
```

3. **Replace the values:**
   - Go to Supabase → Settings → API
   - Copy Project URL → paste after `NEXT_PUBLIC_SUPABASE_URL=`
   - Copy anon key → paste after `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
   - Copy service_role key → paste after `SUPABASE_SERVICE_ROLE_KEY=`
   - Change the admin email to yours
   - Change the KCB till number to your actual till

4. **Save the file**

---

## Step 6: Run the App! (30 seconds)

In Terminal/Command Prompt, type:

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

**Open your browser and go to:** http://localhost:3000

🎉 **Your wedding app is now running!**

---

## Step 7: Test It (3 minutes)

1. **Click "RSVP Now"** or **"Login"**
2. **Enter your email** and click "Send Login Link"
3. **Check the Terminal/Console** - you'll see the magic link printed there
4. **Copy the entire URL** (it will look like: `http://localhost:3000/auth/verify?token=abc123...`)
5. **Open it in a new tab**
6. **Fill out the RSVP form** and submit
7. **Go to** http://localhost:3000/admin to see your RSVP!

---

## 🎯 What to Do Next

### For Development (Testing)
- Keep running `npm run dev`
- Magic links appear in console (Terminal)
- Make changes and test thoroughly
- Invite a few friends to test

### For Production (Going Live)
1. **Set up email sending:**
   - Sign up at https://resend.com (free)
   - Get API key
   - Add to `.env.local`
   - Uncomment email code in `/app/api/auth/send-link/route.ts`

2. **Deploy to Vercel:**
   - Push code to GitHub
   - Sign up at https://vercel.com
   - Import your GitHub repo
   - Add all environment variables
   - Deploy!

---

## 🐛 Common Issues

### "npm: command not found"
**Fix:** Node.js isn't installed properly. Restart Terminal and try `node --version`

### "Cannot find module"
**Fix:** Run `npm install` again

### "Failed to fetch"
**Fix:** Check your Supabase credentials in `.env.local`

### Magic link doesn't work
**Fix:** 
1. Check Terminal - the link should be there
2. Copy the ENTIRE URL including the token
3. Token expires in 24 hours

### Styles look broken
**Fix:**
```bash
rm -rf .next
npm run dev
```

### Port 3000 already in use
**Fix:** Kill the process:
**Mac:** `lsof -ti:3000 | xargs kill`
**Windows:** `netstat -ano | findstr :3000` then `taskkill /PID <number> /F`

---

## 📞 Quick Help Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Stop the server
Press Ctrl + C

# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version
```

---

## ✨ Tips for Beginners

1. **Don't edit files while the server is running** - stop it first (Ctrl+C), make changes, then start again
2. **Save your files** after editing (Ctrl+S or Cmd+S)
3. **Refresh your browser** after making changes
4. **Check the Terminal** for error messages
5. **Keep `.env.local` secret** - never share it or commit to GitHub

---

## 🎓 Learning Resources

Want to understand how it works?

- **Next.js Tutorial**: https://nextjs.org/learn
- **React Basics**: https://react.dev/learn
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## 🎉 You're Done!

Your wedding RSVP app is ready! Here's what you can do:

- ✅ Guests can RSVP via magic link login
- ✅ Automatic waitlist after 70 guests
- ✅ Beautiful home page with countdown
- ✅ Travel and accommodation info
- ✅ Admin panel to view responses
- ✅ CSV export of all RSVPs
- ✅ Mobile responsive

**Next Steps:**
1. Test everything thoroughly
2. Customize colors/text if needed
3. Set up email sending (Resend)
4. Deploy to Vercel
5. Share the link with guests!

---

**Need more help?** Check the main README.md for detailed documentation.

**Good luck with your wedding! 💒💕**
