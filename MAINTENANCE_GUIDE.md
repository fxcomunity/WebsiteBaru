# 🔧 Website Maintenance Mode Guide

## Overview
The website now has a built-in maintenance mode system that allows you to temporarily take the site offline while keeping it accessible to authorized devices (admin/developers).

## Features
- ✅ Maintenance page with professional UI
- ✅ IP-based access control
- ✅ MAC address support (MAC address checking requires backend implementation)
- ✅ Admin PIN verification
- ✅ Session-based access (24-hour duration)
- ✅ Automatic maintenance page redirect

## Files

### `maintenance.html`
- Professional maintenance page shown to unauthorized visitors
- Features admin PIN access form
- Shows maintenance status and estimated time
- Beautiful gradient design with animations

### `maintenance-check.js`
- Core maintenance mode checker
- IP validation logic
- Session management
- Automatically redirects when maintenance is enabled
- Added to all main pages: index.html, about.html, faq.html, music.html, favorites.html

## How to Enable Maintenance Mode

### Step 1: Edit maintenance-check.js
Find line 2 and change:
```javascript
const MAINTENANCE_CONFIG = {
    enabled: false,  // Change this to: true
    ...
}
```

### Step 2: Configuration
```javascript
MAINTENANCE_CONFIG = {
    enabled: true,                          // Enable/disable maintenance
    allowedIPs: [
        '192.168.1.4',                      // Local network IP
        '127.0.0.1',                        // Localhost
        'localhost'
    ],
    allowedMACs: [
        'd8:0e:29:fe:57:1f',               // Device 1 MAC
        '20-0B-74-94-EB-00'                // Device 2 MAC
    ],
    adminPin: '1234',                       // Admin access PIN
    maintenancePage: 'maintenance.html'     // Maintenance page path
};
```

## Access Methods

### Method 1: Authorized IP
- Only users from `192.168.1.4` or local network can access normally
- Other IPs see the maintenance page
- No additional action needed

### Method 2: Admin PIN
- On maintenance page, click "Verifikasi Akses"
- Enter admin PIN: **1234**
- Access granted for 24 hours via session storage

### Method 3: Session Access
- After entering correct PIN once, user has 24-hour access
- Access stored in `sessionStorage.maintenanceAccess`
- Clears when browser closes (session ends)

## Authorized Devices

### IP Addresses
- `192.168.1.4` - Main admin device
- `127.0.0.1` - Localhost (local development)
- Any private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)

### MAC Addresses (for future use)
Currently supported:
- `d8:0e:29:fe:57:1f` - Device 1
- `20-0B-74-94-EB-00` - Device 2

**Note:** Direct MAC address checking from browser is not possible due to security restrictions. 
For production use, implement MAC address verification on your backend server.

## Important Notes

### Security Considerations
1. **PIN Security**: The PIN (1234) is just a demo. Change it in `maintenance-check.js`
2. **Session Storage**: Browser-based, clears on browser close
3. **For Production**: 
   - Use a backend server for IP/MAC validation
   - Implement proper authentication
   - Use HTTPS for all requests
   - Store access tokens securely

### IP Detection
The system uses:
1. Primary service: `https://api.ipify.org?format=json`
2. Fallback service: `https://ip-api.com/json/`

### Testing
To test maintenance mode locally:
1. Enable maintenance mode in `maintenance-check.js`
2. Open the site in your browser
3. You should see the maintenance page
4. Enter PIN "1234" to gain access

## Disabling Maintenance Mode
Simply change `enabled: false` in `maintenance-check.js`:
```javascript
MAINTENANCE_CONFIG = {
    enabled: false,  // Site is live again
    ...
}
```

## Troubleshooting

### Users Can't Access Despite Authorized IP
- Check IP in maintenance.html with browser console
- Verify IP format matches exactly in allowed list
- Try adding their IP range (e.g., 192.168.1.* → 192.168.1.0/24)

### PIN Not Working
- Verify correct PIN in `maintenance-check.js`
- Check browser console for errors
- Ensure `maintenance.html` is in root directory

### Still Seeing Maintenance Page After PIN
- Clear browser cache and cookies
- Try different browser
- Check session storage: `sessionStorage.getItem('maintenanceAccess')`

## Customization

### Change Maintenance Message
Edit `maintenance.html` line 61-64:
```html
<p class="maintenance-text">
    [Your custom message here]
</p>
```

### Change Estimated Time
Edit `maintenance.html` line 69:
```html
<strong>Waktu Perkiraan:</strong> ~ [X jam]
```

### Change Admin PIN
Edit `maintenance-check.js` line 7:
```javascript
adminPin: '1234',  // Change to your PIN
```

## Advanced: Backend Integration

For production systems, consider:

1. **Database Storage**: Store authorized IPs/MACs in database
2. **Authentication**: Implement OAuth, JWT, or session tokens
3. **Rate Limiting**: Prevent brute force PIN attempts
4. **Logging**: Log all maintenance mode access attempts
5. **Notifications**: Alert admins of maintenance page access

Example backend endpoints:
- `POST /api/maintenance-check` - Verify IP/MAC
- `POST /api/maintenance-pin` - Validate PIN
- `GET /api/maintenance-status` - Get current status

---

**Last Updated:** February 15, 2026
**Version:** 1.0
