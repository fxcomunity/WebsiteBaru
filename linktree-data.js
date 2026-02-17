// Linktree Data for FX Community
function getLinktreeLinks() {
    return [
        {
            title: "Katalog PDF",
            icon: "fas fa-book",
            url: "#catalog",
            color: "#6366f1"
        },
        {
            title: "Musik Focus",
            icon: "fas fa-music",
            url: "#music",
            color: "#8b5cf6"
        },
        {
            title: "WhatsApp Community",
            icon: "fab fa-whatsapp",
            url: "https://chat.whatsapp.com/KnkESJgEUKT5PEki4SpDD0",
            color: "#25D366"
        },
        {
            title: "Admin Support",
            icon: "fas fa-headset",
            url: "https://wa.me/62895404147521",
            color: "#10b981"
        },
        {
            title: "Instagram",
            icon: "fab fa-instagram",
            url: "https://www.instagram.com/si.palingjack/",
            color: "#E4405F"
        },
        {
            title: "TikTok",
            icon: "fab fa-tiktok",
            url: "https://www.tiktok.com/@uciii0106",
            color: "#00f2ea"
        },
        {
            title: "Email",
            icon: "fas fa-envelope",
            url: "mailto:ajar0895404147521@gmail.com",
            color: "#6366f1"
        }
    ];
}

// Enhanced Linktree Styles
const linktreeStyles = `
<style>
/* Linktree Modal */
.linktree-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Linktree Card */
.linktree-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 40px 32px;
    max-width: 480px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.4s ease;
}

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

/* Custom Scrollbar */
.linktree-card::-webkit-scrollbar {
    width: 8px;
}

.linktree-card::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 10px;
}

.linktree-card::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 10px;
}

/* Close Button */
.lt-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--text-secondary);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 10;
}

.lt-close-btn:hover {
    background: var(--danger);
    border-color: var(--danger);
    color: white;
    transform: rotate(90deg);
}

/* Profile Section */
.lt-profile {
    text-align: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid var(--border);
}

.lt-avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto 20px;
    background: var(--gradient-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: white;
    box-shadow: 0 8px 24px var(--shadow-lg);
    animation: float 6s ease-in-out infinite;
    position: relative;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

.lt-avatar::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: var(--gradient-primary);
    z-index: -1;
    opacity: 0.3;
    filter: blur(8px);
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 0.5; }
}

.lt-profile h3 {
    font-family: 'Poppins', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.lt-profile p {
    color: var(--text-secondary);
    font-size: 1rem;
    font-weight: 500;
}

/* Links Container */
.lt-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Link Item */
.lt-link-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 20px;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 16px;
    color: var(--text-primary);
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.lt-link-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--link-color, var(--primary));
    transform: scaleY(0);
    transition: transform 0.3s ease;
}

.lt-link-item:hover {
    background: var(--bg-hover);
    border-color: var(--link-color, var(--primary));
    transform: translateX(8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.lt-link-item:hover::before {
    transform: scaleY(1);
}

.lt-link-item:active {
    transform: translateX(4px) scale(0.98);
}

/* Link Icon */
.lt-link-icon {
    width: 44px;
    height: 44px;
    min-width: 44px;
    background: var(--link-color, var(--primary));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    transition: all 0.3s ease;
}

.lt-link-item:hover .lt-link-icon {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Link Text */
.lt-link-text {
    flex: 1;
    font-family: 'Inter', sans-serif;
}

/* Link Arrow */
.lt-link-arrow {
    color: var(--text-muted);
    font-size: 18px;
    transition: all 0.3s ease;
}

.lt-link-item:hover .lt-link-arrow {
    color: var(--link-color, var(--primary));
    transform: translateX(4px);
}

/* Special Styling for Social Links */
.lt-link-item[href*="instagram"] {
    --link-color: #E4405F;
}

.lt-link-item[href*="tiktok"] {
    --link-color: #00f2ea;
}

.lt-link-item[href*="whatsapp"] {
    --link-color: #25D366;
}

.lt-link-item[href*="wa.me"] {
    --link-color: #10b981;
}

/* Staggered Animation */
.lt-link-item {
    animation: slideInRight 0.4s ease backwards;
}

.lt-link-item:nth-child(1) { animation-delay: 0.1s; }
.lt-link-item:nth-child(2) { animation-delay: 0.15s; }
.lt-link-item:nth-child(3) { animation-delay: 0.2s; }
.lt-link-item:nth-child(4) { animation-delay: 0.25s; }
.lt-link-item:nth-child(5) { animation-delay: 0.3s; }
.lt-link-item:nth-child(6) { animation-delay: 0.35s; }

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Footer in Linktree */
.lt-footer {
    text-align: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
    .linktree-card {
        padding: 32px 24px;
        max-width: 100%;
    }

    .lt-profile h3 {
        font-size: 1.5rem;
    }

    .lt-avatar {
        width: 80px;
        height: 80px;
        font-size: 40px;
    }

    .lt-link-item {
        padding: 16px 18px;
        font-size: 0.95rem;
    }

    .lt-link-icon {
        width: 40px;
        height: 40px;
        min-width: 40px;
        font-size: 18px;
    }
}

@media (max-width: 480px) {
    .linktree-modal {
        padding: 16px;
    }

    .linktree-card {
        padding: 28px 20px;
        border-radius: 20px;
    }

    .lt-close-btn {
        width: 36px;
        height: 36px;
        top: 16px;
        right: 16px;
        font-size: 16px;
    }

    .lt-profile {
        margin-bottom: 24px;
    }

    .lt-link-item {
        gap: 12px;
        padding: 14px 16px;
    }
}
</style>
`;

// Inject styles when script loads
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('div');
    styleElement.innerHTML = linktreeStyles;
    document.head.appendChild(styleElement.firstElementChild);
}