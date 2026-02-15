// Default Maintenance Mode Configuration (can be overridden by localStorage)
const DEFAULT_MAINTENANCE_CONFIG = {
    enabled: false, // Set to true to enable maintenance mode
    allowedIPs: ['192.168.1.4', '127.0.0.1', 'localhost'],
    allowedMACs: ['d8:0e:29:fe:57:1f', '20-0B-74-94-EB-00'],
    adminPin: '1234',
    maintenancePage: 'maintenance.html'
};

// Local storage key for maintenance config so admin panel can update it
const MAINTENANCE_STORAGE_KEY = 'fx_maintenance_config';

function getMaintenanceConfig(){
    try{
        const raw = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
        if(raw){
            const parsed = JSON.parse(raw);
            return Object.assign({}, DEFAULT_MAINTENANCE_CONFIG, parsed);
        }
    }catch(e){ console.warn('Invalid maintenance config in localStorage', e); }
    return Object.assign({}, DEFAULT_MAINTENANCE_CONFIG);
}

// Show maintenance check progress (visual feedback)
function showMaintenanceCheckProgress() {
    // Only show if body is available
    if (!document.body) return null;
    
    const overlay = document.createElement('div');
    overlay.id = 'maintenance-check-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 15, 35, 0.95);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        animation: fadeIn 0.3s ease;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        text-align: center;
        color: #fff;
        max-width: 400px;
        padding: 40px;
        background: rgba(35, 35, 71, 0.9);
        border-radius: 20px;
        border: 1px solid rgba(99, 102, 241, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    `;

    content.innerHTML = `
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
        <div style="
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            border: 4px solid rgba(99, 102, 241, 0.2);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
        <h3 style="
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        ">Verifying Access...</h3>
        <p style="
            color: #a8a8d8;
            font-size: 0.95rem;
            animation: pulse 2s ease-in-out infinite;
        ">Checking maintenance status</p>
    `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    return overlay;
}

// Hide maintenance check progress
function hideMaintenanceCheckProgress(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

// Add fadeOut animation style
if (document.head) {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Check maintenance mode on page load
async function checkMaintenanceMode() {
    const cfg = getMaintenanceConfig();

    // If maintenance disabled, allow normal access immediately
    if (!cfg.enabled) {
        return;
    }

    // Show loading indicator
    const progressOverlay = showMaintenanceCheckProgress();

    try {
        // Check if already authorized in this session
        const hasAccess = sessionStorage.getItem('maintenanceAccess') === 'true';
        if (hasAccess) {
            const accessTime = parseInt(sessionStorage.getItem('accessTime'));
            // Allow access for 24 hours
            if (Date.now() - accessTime < 24 * 60 * 60 * 1000) {
                hideMaintenanceCheckProgress(progressOverlay);
                return; // User has valid access, continue normally
            } else {
                // Access expired, clear session
                sessionStorage.removeItem('maintenanceAccess');
                sessionStorage.removeItem('accessTime');
            }
        }

        // Check if user's IP is authorized
        try {
            const userIP = await getUserIP();
            const isLocalIP = isLocalIPAddress(userIP);
            
            console.log('🔍 Maintenance Check:', {
                userIP,
                isLocalIP,
                allowedIPs: cfg.allowedIPs,
                maintenanceEnabled: cfg.enabled
            });

            if ((Array.isArray(cfg.allowedIPs) && cfg.allowedIPs.includes(userIP)) || isLocalIP) {
                // Authorized IP, allow access
                console.log('✅ Access granted - Authorized IP');
                
                // Store access in session
                sessionStorage.setItem('maintenanceAccess', 'true');
                sessionStorage.setItem('accessTime', Date.now().toString());
                
                hideMaintenanceCheckProgress(progressOverlay);
                return;
            }
        } catch (error) {
            console.error('❌ IP check error:', error);
            // On error, be conservative and redirect to maintenance
        }

        // Not authorized, redirect to maintenance page with transition
        console.log('🚫 Access denied - Redirecting to maintenance page');
        
        // Add smooth transition before redirect
        if (progressOverlay && progressOverlay.querySelector('div > div')) {
            const content = progressOverlay.querySelector('div > div');
            content.innerHTML = `
                <div style="
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 20px;
                    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    animation: pulse 1s ease-in-out infinite;
                ">
                    <i class="fas fa-tools" style="color: white;"></i>
                </div>
                <h3 style="
                    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 12px;
                    color: #fff;
                ">Maintenance Mode</h3>
                <p style="
                    color: #a8a8d8;
                    font-size: 0.95rem;
                ">Redirecting to maintenance page...</p>
            `;
        }

        // Delay redirect for smooth transition
        setTimeout(() => {
            window.location.href = cfg.maintenancePage || DEFAULT_MAINTENANCE_CONFIG.maintenancePage;
        }, 1500);

    } catch (error) {
        console.error('❌ Maintenance check failed:', error);
        hideMaintenanceCheckProgress(progressOverlay);
        // On critical error, allow access (fail-open for better UX)
    }
}

// Get user's IP address
async function getUserIP() {
    try {
        // Try primary service with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('https://api.ipify.org?format=json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📍 IP detected (ipify):', data.ip);
        return data.ip;
    } catch (error) {
        console.warn('⚠️ Primary IP service failed:', error.message);
        
        // Try alternative service
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch('https://ip-api.com/json/', {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📍 IP detected (ip-api):', data.query);
            return data.query;
        } catch (err) {
            console.error('❌ All IP services failed:', err.message);
            return 'unknown';
        }
    }
}

// Check if IP is a local/private IP
function isLocalIPAddress(ip) {
    if (!ip || ip === 'unknown') return false;

    // Check for localhost string
    if (ip.toLowerCase().includes('localhost')) return true;

    // Check for private IP ranges
    const privateRanges = [
        /^10\./,                          // Class A private
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Class B private
        /^192\.168\./,                    // Class C private
        /^127\./,                         // Loopback
        /^169\.254\./,                    // Link-local
        /^::1$/,                          // IPv6 loopback
        /^fc/,                            // IPv6 unique local
        /^fe80:/,                         // IPv6 link-local
    ];

    for (let range of privateRanges) {
        if (range.test(ip)) {
            console.log('🏠 Local IP detected:', ip);
            return true;
        }
    }

    return false;
}

// Grant temporary access (for admin override)
function grantMaintenanceAccess(pin) {
    const cfg = getMaintenanceConfig();
    
    if (pin === cfg.adminPin) {
        sessionStorage.setItem('maintenanceAccess', 'true');
        sessionStorage.setItem('accessTime', Date.now().toString());
        console.log('✅ Admin access granted');
        return true;
    }
    
    console.log('❌ Invalid admin PIN');
    return false;
}

// Revoke maintenance access
function revokeMaintenanceAccess() {
    sessionStorage.removeItem('maintenanceAccess');
    sessionStorage.removeItem('accessTime');
    console.log('🚫 Maintenance access revoked');
}

// Update maintenance configuration
function updateMaintenanceConfig(config) {
    try {
        const updatedConfig = Object.assign({}, getMaintenanceConfig(), config);
        localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(updatedConfig));
        console.log('✅ Maintenance config updated:', updatedConfig);
        return true;
    } catch (error) {
        console.error('❌ Failed to update maintenance config:', error);
        return false;
    }
}

// Get maintenance status info
function getMaintenanceStatus() {
    const cfg = getMaintenanceConfig();
    const hasAccess = sessionStorage.getItem('maintenanceAccess') === 'true';
    const accessTime = parseInt(sessionStorage.getItem('accessTime')) || null;
    
    return {
        enabled: cfg.enabled,
        hasAccess: hasAccess,
        accessTime: accessTime,
        accessExpiry: accessTime ? new Date(accessTime + 24 * 60 * 60 * 1000) : null,
        allowedIPs: cfg.allowedIPs,
        config: cfg
    };
}

// Export functions for admin panel use
if (typeof window !== 'undefined') {
    window.MaintenanceMode = {
        check: checkMaintenanceMode,
        grant: grantMaintenanceAccess,
        revoke: revokeMaintenanceAccess,
        update: updateMaintenanceConfig,
        status: getMaintenanceStatus,
        getConfig: getMaintenanceConfig
    };
}

// Initialize maintenance check when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkMaintenanceMode);
} else {
    checkMaintenanceMode();
}