// Remote maintenance JSON file (publicly readable) - update this file on your host to toggle global maintenance
const REMOTE_MAINTENANCE_URL = '/maintenance.json';

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

// Show admin login modal for maintenance mode
function showMaintenanceAdminLogin(cfg) {
    // Remove any existing overlay first
    const existing = document.getElementById('maintenance-admin-login');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'maintenance-admin-login';
    modal.style.cssText = `
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

    const loginBox = document.createElement('div');
    loginBox.style.cssText = `
        background: linear-gradient(135deg, rgba(35, 35, 71, 0.95) 0%, rgba(45, 45, 85, 0.95) 100%);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 24px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        max-width: 420px;
        width: 90%;
        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    loginBox.innerHTML = `
        <style>
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(30px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            .maintenance-input {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 10px;
                background: rgba(99, 102, 241, 0.1);
                color: #fff;
                font-size: 1rem;
                font-family: 'Poppins', sans-serif;
                margin-bottom: 16px;
                outline: none;
                transition: all 0.3s ease;
            }
            .maintenance-input:focus {
                border-color: #6366f1;
                background: rgba(99, 102, 241, 0.2);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
            }
            .maintenance-input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }
            .maintenance-btn {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
            }
            .maintenance-btn-login {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                margin-bottom: 10px;
            }
            .maintenance-btn-login:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
            }
            .maintenance-btn-login:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .maintenance-btn-exit {
                background: transparent;
                color: #a8a8d8;
                border: 1px solid rgba(168, 168, 216, 0.3);
            }
            .maintenance-btn-exit:hover {
                background: rgba(168, 168, 216, 0.1);
                border-color: rgba(168, 168, 216, 0.6);
            }
            .maintenance-error {
                display: none;
                background: rgba(239, 68, 68, 0.15);
                border: 1px solid rgba(239, 68, 68, 0.5);
                color: #fca5a5;
                padding: 12px;
                border-radius: 8px;
                font-size: 0.9rem;
                margin-bottom: 16px;
                animation: shake 0.5s ease;
            }
            .maintenance-error.show {
                display: block;
            }
        </style>

        <div style="text-align: center; margin-bottom: 24px;">
            <div style="
                font-size: 40px;
                margin-bottom: 12px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            ">
                🔒
            </div>
            <h2 style="
                font-family: 'Poppins', sans-serif;
                font-size: 1.5rem;
                font-weight: 700;
                color: #fff;
                margin: 0 0 8px 0;
            ">Maintenance Mode</h2>
            <p style="
                color: #a8a8d8;
                margin: 0;
                font-size: 0.95rem;
            ">Admin login to continue</p>
        </div>

        <form id="maintenance-login-form" style="margin-bottom: 16px;">
            <div class="maintenance-error" id="maintenance-error-msg"></div>
            
            <input 
                type="text" 
                class="maintenance-input" 
                id="maintenance-admin-email" 
                placeholder="Admin Email"
                autocomplete="off"
                required
            >
            
            <input 
                type="password" 
                class="maintenance-input" 
                id="maintenance-admin-password" 
                placeholder="Admin Password"
                autocomplete="off"
                required
            >
            
            <button 
                type="submit" 
                class="maintenance-btn maintenance-btn-login"
                id="maintenance-login-btn"
            >
                Masuk
            </button>
        </form>

        <button 
            type="button" 
            class="maintenance-btn maintenance-btn-exit"
            id="maintenance-exit-btn"
        >
            Keluar
        </button>

        <p style="
            text-align: center;
            color: #767a9e;
            font-size: 0.85rem;
            margin-top: 16px;
        ">
            Hanya admin yang dapat login
        </p>
    `;

    modal.appendChild(loginBox);
    document.body.appendChild(modal);

    // Form submission
    const form = document.getElementById('maintenance-login-form');
    const emailInput = document.getElementById('maintenance-admin-email');
    const passwordInput = document.getElementById('maintenance-admin-password');
    const loginBtn = document.getElementById('maintenance-login-btn');
    const exitBtn = document.getElementById('maintenance-exit-btn');
    const errorMsg = document.getElementById('maintenance-error-msg');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        loginBtn.disabled = true;
        loginBtn.textContent = 'Memverifikasi...';
        errorMsg.classList.remove('show');

        try {
            // Check against admin credentials (you can customize this)
            // For security, you should use a real backend API
            const adminEmail = 'admin@fxcommunity.com'; // Change this
            const adminPassword = 'admin123'; // Change this to match your admin panel

            if (email === adminEmail && password === adminPassword) {
                // Set admin session
                sessionStorage.setItem('fx_isAdmin', '1');
                sessionStorage.setItem('fx_adminName', 'Administrator');
                sessionStorage.setItem('maintenanceAccess', 'true');
                sessionStorage.setItem('accessTime', Date.now().toString());

                // Smooth transition
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    modal.remove();
                    // Reload page with access granted
                    window.location.reload();
                }, 300);
            } else {
                throw new Error('Email atau password salah');
            }
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.classList.add('show');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Masuk';
            passwordInput.value = '';
        }
    });

    // Exit button
    exitBtn.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            // Redirect to maintenance page
            setTimeout(() => {
                window.location.href = cfg.maintenancePage || DEFAULT_MAINTENANCE_CONFIG.maintenancePage;
            }, 300);
        }, 300);
    });

    // Focus on email input
    emailInput.focus();
}


// Check maintenance mode on page load
async function checkMaintenanceMode() {
    // Load local config first (Admin panel updates this)
    let cfg = getMaintenanceConfig();

    // If locally enabled, we don't need to check remote
    if (cfg.enabled) {
        processMaintenance(cfg);
        return;
    }

    // Try remote config if local is disabled
    try {
        const remoteCfg = await fetchRemoteMaintenanceConfig();
        if (remoteCfg && remoteCfg.enabled) {
            console.log('🌐 Using remote maintenance config', remoteCfg);
            cfg = Object.assign({}, cfg, remoteCfg);
        }
    } catch (e) {
        console.warn('Remote maintenance config check failed', e && e.message);
    }

    processMaintenance(cfg);
}

// Separate processing logic
async function processMaintenance(cfg) {
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

        // Not authorized, show admin login option
        console.log('🚫 Access denied - Showing admin login option');
        
        hideMaintenanceCheckProgress(progressOverlay);
        showMaintenanceAdminLogin(cfg);

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
    // If the user is already authenticated as admin (admin login), allow access without PIN
    try {
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('fx_isAdmin') === '1') {
            sessionStorage.setItem('maintenanceAccess', 'true');
            sessionStorage.setItem('accessTime', Date.now().toString());
            console.log('✅ Admin session detected - access granted without PIN');
            return true;
        }
    } catch (e) {
        // ignore sessionStorage errors
    }

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

// Try to fetch remote maintenance config (public JSON). Returns object or null.
async function fetchRemoteMaintenanceConfig() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(REMOTE_MAINTENANCE_URL + '?_=' + Date.now(), { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);

        if (!res.ok) {
            console.warn('Remote maintenance JSON not available:', res.status);
            return null;
        }

        const data = await res.json();
        if (data && typeof data === 'object') return data;
        return null;
    } catch (err) {
        console.warn('Failed to fetch remote maintenance config:', err && err.message);
        return null;
    }
}