# 🔧 Website Maintenance Mode - Quick Start

## What's New?
Your website now has a professional maintenance mode system that allows you to take the site offline while keeping it accessible to authorized devices.

## Files Added

### 1. `maintenance.html`
- Professional maintenance page with animations
- Admin PIN access form (Default PIN: **1234**)
- Displays maintenance status and estimated time
- Beautiful gradient UI

### 2. `maintenance-check.js`
- Core system that checks if user is authorized
- Automatically redirects to maintenance page if needed
- Integrated into all main pages:
  - ✅ index.html
  - ✅ fitur/about.html
  - ✅ fitur/faq.html
  - ✅ fitur/music/music.html
  - ✅ fitur/favorit/index.html

### 3. `admin-maintenance.html`
- Admin control panel for easy management
- Toggle maintenance mode on/off
- Manage authorized IPs and MACs
- Change admin PIN
- Customize maintenance messages
- Save configuration to browser storage

### 4. `maintenance.json` (Optional - Global)
- Public JSON file placed at the site root (`/maintenance.json`). If present, the site will fetch this file and honor its `enabled` value globally. Update or replace this file on your hosting to toggle maintenance for all users.

### 4. `MAINTENANCE_GUIDE.md`
- Complete documentation
- Configuration instructions
- Troubleshooting guide
- Backend integration tips

---

## 🚀 How to Use

### Method 1: Quick Toggle (Easiest)
1. Open `admin-maintenance.html` in browser
2. Click the toggle switch to enable/disable maintenance
3. Click "Simpan Semua Perubahan" to save

### Method 2: Code Configuration (Advanced)
1. Open `maintenance-check.js`
2. Change line 2: `enabled: false` → `enabled: true`
3. Save the file

### Method 3: Global JSON (Recommended for all devices)
1. Place or update `maintenance.json` at your site root (e.g., `https://your-site.com/maintenance.json`).
2. Edit the `enabled` property to `true` or `false` and save/deploy the file.
3. The site will fetch this file and apply maintenance mode site-wide (clients may cache; deploy with cache-control or use file replace).

---

## 🔑 Default Access Credentials

| Item | Value |
|------|-------|
| **Authorized IP** | 192.168.1.4 |
| **Admin PIN** | 1234 |
| **Maintenance Page** | maintenance.html |

---

## 💡 Authorized Devices

### IP Addresses
- **192.168.1.4** - Main admin device (change to your IP)
- **127.0.0.1** - Localhost (local development)
- All private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)

### MAC Addresses
- **d8:0e:29:fe:57:1f** - Device 1
- **20-0B-74-94-EB-00** - Device 2

---

## 🎯 When Maintenance is ON

### For Authorized Users (from 192.168.1.4 or local):
✅ Website displays normally
✅ No action needed
✅ Full access to all features

### For Other Users:
❌ Maintenance page displayed
❌ Cannot access main site
✅ Can enter admin PIN to bypass (if provided)

---

## 📝 Configuration Steps

### Step 1: Find Your IP
```
Windows: Open Command Prompt, type: ipconfig
Mac/Linux: Open Terminal, type: ifconfig
Look for IPv4 Address (e.g., 192.168.1.X)
```

### Step 2: Update authorized IP
In `admin-maintenance.html`:
1. Click "Tambah IP" button
2. Enter your IP: `192.168.1.4` → change 4 to your device's number
3. Click "Simpan Semua Perubahan"

### Step 3: Change Admin PIN
1. In `admin-maintenance.html`, scroll to "Admin PIN" section
2. Enter new PIN (must be secure!)
3. Click "Simpan Semua Perubahan"

### Step 4: Customize Message
1. In `admin-maintenance.html`, find "Pesan Maintenance"
2. Edit the message and estimated time
3. Click "Simpan Semua Perubahan"

### Step 5: Enable Maintenance
1. In `admin-maintenance.html`, toggle "Mode Maintenance" ON
2. Click "Simpan Semua Perubahan"
3. **Website is now in maintenance mode!**

---

## ✅ Testing the Maintenance Mode

### From Your Device (192.168.1.4):
1. Open website URL
2. You should see the site normally
3. ✅ Access granted!

### From Another Device:
1. Open website URL
2. You should see maintenance page
3. Try entering admin PIN: `1234`
4. After PIN, you get 24-hour access
5. ✅ Test successful!

### Alternative: Admin Account Verification
- If you forget the maintenance PIN, log in to the admin panel (`/admin/index.html`). The admin session will act as a verification factor and allow you to grant access or change the PIN from the admin control panel.

---

## 🔒 Security Notes

⚠️ **IMPORTANT:** Change default PIN before going live!

```javascript
// In maintenance-check.js, line 7:
adminPin: '1234',  // ← Change this!
```

Better PIN examples:
- ❌ Avoid: 1234, 0000, your birth year
- ✅ Use: Random like 8374, x9Kp, etc.

---

## 🆘 Common Issues

### Issue: Still seeing maintenance page from authorized IP
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Check IP matches exactly in allowed list
- Restart browser

### Issue: PIN not working
**Solution:**
- Verify PIN in maintenance-check.js
- Check browser console for errors (F12)
- Make sure maintenance.html is in root folder

### Issue: Want to disable maintenance
**Solution:**
- In admin-maintenance.html, toggle OFF
- Or change `enabled: false` in maintenance-check.js
- Website will be accessible to all

---

## 📱 Access Admin Panel

| Device/Location | Access | URL |
|-----------------|--------|-----|
| Local Network | ✅ Yes | `http://192.168.1.X/admin-maintenance.html` |
| From Home | ✅ Yes | `http://your-domain.com/admin-maintenance.html` |
| Maintenance On | ✅ Yes (with PIN) | Same - shows maintenance page first |

---

## 🔄 Session Management

After entering correct PIN:
- **Duration:** 24 hours
- **Storage:** Browser session
- **Auto-clear:** When browser closes (session data cleared)
- **Multiple devices:** Each device tracks separately

---

## 📞 Next Steps

1. **Test it out:** Enable maintenance and verify IP access works
2. **Change default PIN:** Update to your secure PIN
3. **Add your IP:** Make sure your device is in authorized list
4. **Customize message:** Update maintenance message
5. **Deploy:** When ready, enable maintenance mode

---

## 💻 For Developers

See **MAINTENANCE_GUIDE.md** for:
- Backend integration
- Database implementation
- Rate limiting setup
- Security best practices
- API endpoints

---

**Last Updated:** February 15, 2026
**Status:** ✅ Production Ready

