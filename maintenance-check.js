// Maintenance Mode Configuration
const MAINTENANCE_CONFIG = {
    enabled: false, // Set to true to enable maintenance mode
    allowedIPs: ['192.168.1.4', '127.0.0.1', 'localhost'],
    allowedMACs: ['d8:0e:29:fe:57:1f', '20-0B-74-94-EB-00'],
    adminPin: '1234',
    maintenancePage: 'maintenance.html'
};

// Check maintenance mode on page load
async function checkMaintenanceMode() {
    // Check if already authorized in this session
    const hasAccess = sessionStorage.getItem('maintenanceAccess') === 'true';
    if (hasAccess) {
        const accessTime = parseInt(sessionStorage.getItem('accessTime'));
        // Allow access for 24 hours
        if (Date.now() - accessTime < 24 * 60 * 60 * 1000) {
            return; // User has valid access, continue normally
        }
    }

    // If maintenance disabled, allow normal access
    if (!MAINTENANCE_CONFIG.enabled) {
        return;
    }

    // Check if user's IP is authorized
    try {
        const userIP = await getUserIP();
        const isLocalIP = isLocalIPAddress(userIP);
        
        if (MAINTENANCE_CONFIG.allowedIPs.includes(userIP) || isLocalIP) {
            // Authorized IP, allow access
            return;
        }
    } catch (error) {
        console.log('IP check error:', error);
    }

    // Not authorized, redirect to maintenance page
    window.location.href = MAINTENANCE_CONFIG.maintenancePage;
}

// Get user's IP address
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP:', error);
        // Try alternative service
        try {
            const response = await fetch('https://ip-api.com/json/');
            const data = await response.json();
            return data.query;
        } catch (err) {
            return 'unknown';
        }
    }
}

// Check if IP is a local/private IP
function isLocalIPAddress(ip) {
    if (!ip) return false;

    // Check for private IP ranges
    const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^127\./,
        /^169\.254\./,
        /::1$/,
        /^fc/,
        /^fe80:/, 
        /localhost/i
    ];

    for (let range of privateRanges) {
        if (range.test(ip)) {
            return true;
        }
    }

    return false;
}

// Initialize maintenance check when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkMaintenanceMode);
} else {
    checkMaintenanceMode();
}
