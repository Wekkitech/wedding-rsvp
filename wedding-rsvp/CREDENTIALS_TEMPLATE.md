# 🔐 Credentials Template

Use this template to organize all your credentials. **KEEP THIS FILE SECURE!**

---

## 📊 Supabase Credentials

**Project Name:** brill-damaris-wedding

**Project URL:**
```
https://_____________________.supabase.co
```

**Anon Public Key:**
```
eyJhbGc_____________________________________________________
________________________________________________________________
________________________________________________________________
```

**Service Role Key:**
```
eyJhbGc_____________________________________________________
________________________________________________________________
________________________________________________________________
```

**Database Password:**
```
________________________
```

**Where to find these:**
1. Go to https://supabase.com
2. Click on your project
3. Settings (gear icon) → API
4. Copy each value

---

## 📧 Resend Credentials

**Account Email:**
```
________________________@____________
```

**API Key:**
```
re_____________________________________________
```

**Verified Domain:**
```
________________________
```

**From Email Address:**
```
wedding@________________________
```

**Where to get these:**
1. Sign up at https://resend.com
2. Verify your domain (or use test domain)
3. API Keys → Create API Key
4. Copy the key

---

## 💳 Payment Information

**KCB Bank Till Number:**
```
________________________
```

**Till Name:**
```
________________________
```

**Bank Account (for reference):**
```
Account Name: ________________________
Account Number: ________________________
Bank: ________________________
Branch: ________________________
```

---

## 🌐 Deployment

**GitHub Repository:**
```
https://github.com/____________/wedding-rsvp
```

**Vercel Project URL:**
```
https://________________________.vercel.app
```

**Custom Domain (if any):**
```
https://________________________
```

**Vercel Account Email:**
```
________________________@____________
```

---

## 👤 Admin Credentials

**Admin Email(s):**
```
1. ________________________@____________
2. ________________________@____________
3. ________________________@____________
```

**Note:** These emails must be added to the `admins` table in Supabase.

---

## 📱 Contact Information

**Technical Contact:**
```
Name: ________________________
Email: ________________________
Phone: ________________________
```

**Wedding Coordinator:**
```
Name: ________________________
Email: ________________________
Phone: ________________________
```

---

## 🔒 Security Notes

- ✅ Never commit credentials to GitHub
- ✅ Keep this file in a secure location (password manager recommended)
- ✅ Don't share service role key publicly
- ✅ Change API keys if accidentally exposed
- ✅ Use strong passwords for all accounts
- ✅ Enable 2FA where available

---

## 📋 Quick Copy-Paste for .env.local

Once you fill in the values above, copy this to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://_____________________.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc_____________________
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc_____________________

# Resend
RESEND_API_KEY=re_____________________________________________

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAX_GUESTS=70
NEXT_PUBLIC_KCB_TILL_NUMBER=________________________

# Admin
ADMIN_EMAILS=________________________@____________
```

---

## 🆘 If Credentials Are Lost

### Supabase
- Go to Settings → API to view keys again
- Reset database password in Settings → Database

### Resend
- Create a new API key in dashboard
- Old keys can be revoked

### Vercel
- Check Environment Variables in project settings
- Can add/update anytime

---

## ✅ Checklist

- [ ] All Supabase credentials filled in
- [ ] Resend credentials filled in (if using)
- [ ] KCB Till number correct
- [ ] Admin emails added
- [ ] This file saved securely
- [ ] .env.local file created with these values
- [ ] Vercel environment variables configured

---

**Last Updated:** ___________

**Notes:**
________________________________________________________________
________________________________________________________________
________________________________________________________________
