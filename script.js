// Global variables
let currentCategory = 'all';
let tradingFxPDFs = typeof tradingFxData !== 'undefined' ? tradingFxData : [];
let sahamPDFs = typeof sahamData !== 'undefined' ? sahamData : [];
let allPDFs = [...tradingFxPDFs, ...sahamPDFs];
let currentView = 'all'; // 'all', 'favorites', 'about'
let currentPDFShareData = null;
let backgroundAudio = null;
let isAudioPlaying = false;
let audioVolume = 30;

// Fungsi untuk deteksi device detail
function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const isTablet = /(iPad|Android(?!.*mobile))/i.test(userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));

    let deviceType = 'Desktop';
    let deviceIcon = 'fa-desktop';
    let deviceOS = 'Unknown';
    let deviceClass = 'desktop';

    // Deteksi OS dan Device Type
    if (/iPhone/.test(userAgent)) {
        deviceType = 'iPhone';
        deviceIcon = 'fa-mobile-alt';
        deviceOS = 'iOS';
        deviceClass = 'ios-mobile';
    } else if (/iPad/.test(userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform))) {
        deviceType = 'iPad';
        deviceIcon = 'fa-tablet-alt';
        deviceOS = 'iPadOS';
        deviceClass = 'ios-tablet';
    } else if (/Android/.test(userAgent)) {
        if (isTablet) {
            deviceType = 'Android Tablet';
            deviceIcon = 'fa-tablet-alt';
            deviceOS = 'Android';
            deviceClass = 'android-tablet';
        } else {
            deviceType = 'Android Phone';
            deviceIcon = 'fa-mobile-alt';
            deviceOS = 'Android';
            deviceClass = 'android-mobile';
        }
    } else if (/Windows/.test(userAgent)) {
        deviceType = 'Windows PC';
        deviceIcon = 'fa-desktop';
        deviceOS = 'Windows';
        deviceClass = 'windows-desktop';
    } else if (/Mac/.test(userAgent)) {
        deviceType = 'MacBook/iMac';
        deviceIcon = 'fa-laptop';
        deviceOS = 'macOS';
        deviceClass = 'mac-desktop';
    } else if (/Linux/.test(userAgent)) {
        deviceType = 'Linux PC';
        deviceIcon = 'fa-desktop';
        deviceOS = 'Linux';
        deviceClass = 'linux-desktop';
    }

    // Get browser info
    let browserName = 'Unknown';
    if (userAgent.indexOf('Firefox') > -1) browserName = 'Firefox';
    else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) browserName = 'Chrome';
    else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) browserName = 'Safari';
    else if (userAgent.indexOf('Edg') > -1) browserName = 'Edge';
    else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) browserName = 'Opera';

    return {
        deviceType,
        deviceIcon,
        deviceOS,
        deviceClass,
        browserName,
        isMobile,
        isTablet
    };
}

// Apply device-specific styling
function applyDeviceStyles() {
    const deviceInfo = getDeviceInfo();
    document.body.className = deviceInfo.deviceClass;
}

// Fungsi untuk toggle sidebar (hamburger menu mobile)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const icon = document.getElementById('mobileNavIcon');
    const btn = document.getElementById('mobileNavBtn');

    if (!sidebar) return;

    const isActive = sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');

    // Update icon if exists
    if (icon) {
        icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
    }
    // Update aria-expanded if btn exists
    if (btn) {
        btn.setAttribute('aria-expanded', isActive);
    }
}

// Fungsi untuk toggle mobile nav dropdown
function toggleMobileNav() {
    const menu = document.getElementById('mobileNavMenu');
    const icon = document.getElementById('mobileNavIcon');
    const btn = document.getElementById('mobileNavBtn');

    if (!menu) return;

    const isOpen = menu.classList.toggle('open');
    if (icon) {
        icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    }
    if (btn) {
        btn.setAttribute('aria-expanded', isOpen);
    }
}

// Fungsi untuk toggle dropdown di mobile nav
function toggleMobileDropdown(event) {
    event.stopPropagation();
    const trigger = event.currentTarget;
    const content = trigger.nextElementSibling;
    const icon = trigger.querySelector('.dropdown-icon');

    if (content) {
        content.classList.toggle('active');
    }
    if (icon) {
        icon.classList.toggle('rotate');
    }
}

// Tutup sidebar atau mobile nav saat klik di luar
document.addEventListener('click', function (e) {
    const sidebar = document.getElementById('sidebar');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const btn = document.getElementById('mobileNavBtn');
    const overlay = document.getElementById('overlay');

    // Handle Sidebar
    if (sidebar && sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        btn && !btn.contains(e.target) &&
        (!overlay || e.target === overlay)) {
        toggleSidebar();
    }

    // Handle Mobile Nav Menu
    if (mobileNavMenu && mobileNavMenu.classList.contains('open') &&
        !mobileNavMenu.contains(e.target) &&
        btn && !btn.contains(e.target)) {
        toggleMobileNav();
    }
});

// Fungsi untuk mendapatkan ID dari URL Google Drive
function getGoogleDriveId(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

// Fungsi untuk mendapatkan URL view, download, dan share
function getGoogleDriveUrls(url) {
    const fileId = getGoogleDriveId(url);
    if (!fileId) return { view: url, download: url, share: url, embed: url };

    return {
        view: `https://drive.google.com/file/d/${fileId}/view`,
        download: `https://drive.google.com/uc?export=download&id=${fileId}`,
        share: url,
        embed: `https://drive.google.com/file/d/${fileId}/preview`
    };
}

// Fungsi untuk display PDF (baru)
function viewPDF(url, name) {
    const urls = getGoogleDriveUrls(url);
    const modal = document.getElementById('pdfViewerModal');
    const iframe = document.getElementById('pdfFrame');
    const title = document.getElementById('pdfViewerTitle');

    title.textContent = name;
    iframe.src = urls.embed;
    modal.style.display = 'flex'; // Changed to flex to match CSS
    document.body.style.overflow = 'hidden';
}

// Fungsi untuk close PDF viewer
function closePDFViewer() {
    const modal = document.getElementById('pdfViewerModal');
    const iframe = document.getElementById('pdfFrame');

    iframe.src = '';
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Fungsi untuk download PDF
function downloadPDF(url) {
    const urls = getGoogleDriveUrls(url);
    window.open(urls.download, '_blank');
}

// Fungsi untuk share PDF
function sharePDF(url, name) {
    currentPDFShareData = { url, name };
    openShareModal();
}

// Fungsi untuk open share modal
function openShareModal() {
    const modal = document.getElementById('shareModal');
    modal.style.display = 'flex'; // Changed to flex
    document.body.style.overflow = 'hidden';
}

// Fungsi untuk close share modal
function closeShareModal() {
    const modal = document.getElementById('shareModal');
    const qrContainer = document.getElementById('qrCodeContainer');
    const qrCode = document.getElementById('qrCode');

    qrCode.innerHTML = '';
    qrContainer.style.display = 'none';
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentPDFShareData = null;
}

// Fungsi untuk share via QR Code
function shareViaQRCode() {
    if (!currentPDFShareData) return;

    const qrContainer = document.getElementById('qrCodeContainer');
    const qrCode = document.getElementById('qrCode');

    // Clear previous QR code
    qrCode.innerHTML = '';
    qrCode.style.display = 'flex';

    // Delay sedikit untuk memastikan HTML sudah clear
    setTimeout(() => {
        try {
            // Generate QR Code dengan link fxcommunity
            new QRCode(document.getElementById('qrCode'), {
                text: 'https://fxcommunity.vercel.app/',
                width: 256,
                height: 256,
                colorDark: '#1F4788',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            qrContainer.style.display = 'block';
        } catch (error) {
            console.error('Error generating QR code:', error);
            showNotification('Gagal membuat QR Code', 'error');
        }
    }, 100);
}

// Fungsi untuk share via link
function shareViaLink() {
    if (!currentPDFShareData) return;

    copyToClipboard('https://fxcommunity.vercel.app/');
    showNotification('Link berhasil disalin ke clipboard!');
}

// Fungsi untuk share via WhatsApp
function shareViaWhatsApp() {
    if (!currentPDFShareData) return;

    const text = `Lihat PDF: ${currentPDFShareData.name}\n${currentPDFShareData.url}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    closeShareModal();
}

// Fungsi untuk share via web share API
function shareViaWeb() {
    if (!currentPDFShareData) return;

    if (navigator.share) {
        navigator.share({
            title: currentPDFShareData.name,
            text: `Lihat PDF ini: ${currentPDFShareData.name}`,
            url: currentPDFShareData.url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        showNotification('Web Share API tidak tersedia');
    }
    closeShareModal();
}

// Fungsi untuk download QR Code
function downloadQRCode() {
    const canvas = document.querySelector('#qrCode canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${currentPDFShareData.name.replace(/\.pdf/i, '')}-qrcode.png`;
    link.click();
}

// Fungsi untuk copy ke clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
    } catch (err) {
        showNotification('Gagal menyalin link', 'error');
    }

    document.body.removeChild(textarea);
}

// Fungsi untuk show notification
function showNotification(message, type = 'success') {
    const oldNotif = document.querySelector('.notification');
    if (oldNotif) oldNotif.remove();

    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => notif.classList.add('show'), 10);

    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Fungsi untuk mendapatkan PDFs sesuai view saat ini
function getCurrentPDFs() {
    let pdfs = [];

    // Combine PDFs based on current category
    if (currentCategory === 'all') {
        pdfs = [...tradingFxPDFs, ...sahamPDFs];
    } else if (currentCategory === 'trading-fx') {
        pdfs = [...tradingFxPDFs];
    } else if (currentCategory === 'saham') {
        pdfs = [...sahamPDFs];
    } else {
        pdfs = allPDFs;
    }

    if (currentView === 'favorites') {
        pdfs = favorites;
    }

    return pdfs;
}

// Fungsi untuk render PDF cards (seperti Shopee)
function renderPDFs(pdfs) {
    const pdfGrid = document.getElementById('pdfGrid');
    const emptyState = document.getElementById('emptyState');

    if (pdfs.length === 0) {
        pdfGrid.style.display = 'none';
        emptyState.style.display = 'block';

        if (currentView === 'favorites') {
            emptyState.innerHTML = `
                <i class="fas fa-heart-broken"></i>
                <p>Belum ada PDF favorit</p>
                <p style="font-size: 14px; margin-top: 10px; opacity: 0.8;">Klik ikon hati pada PDF untuk menambahkannya ke favorit</p>
            `;
        } else {
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <p>Tidak ada PDF yang ditemukan</p>
            `;
            // Show notification when no PDFs found
            showNotification('Tidak ada PDF yang cocok dengan pencarian Anda', 'info');
        }
        return;
    }

    pdfGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    pdfGrid.innerHTML = '';

    pdfs.forEach(pdf => {
        const card = document.createElement('div');
        card.className = 'pdf-card';
        const isFav = isFavorite(pdf.url);

        // Extract category display name
        const categoryMap = {
            'fx-basic': 'Basic FX',
            'fx-advanced': 'Advanced FX',
            'fx-technical': 'Technical FX',
            'fx-psychology': 'Psychology'
        };

        const categoryDisplay = categoryMap[pdf.category] || pdf.category;

        card.innerHTML = `
            <div class="pdf-thumbnail">
                <div class="thumbnail-content">
                    ${pdf.thumbnail ? `<span class="thumbnail-emoji">${pdf.thumbnail}</span>` : '<i class="fas fa-file-pdf"></i>'}
                </div>
                <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${pdf.url}', '${pdf.name.replace(/'/g, "\\'")}', '${pdf.category}')">
                    <i class="fas fa-heart"></i>
                </button>
                <span class="category-badge">${categoryDisplay}</span>
            </div>
            <div class="pdf-info">
                <div class="pdf-title" title="${pdf.name}">${pdf.name}</div>
                <div class="pdf-actions">
                    <button class="action-btn btn-view" onclick="viewPDF('${pdf.url}', '${pdf.name.replace(/'/g, "\\'")}')" title="Lihat PDF">
                        <i class="fas fa-eye"></i> Lihat
                    </button>
                    <button class="action-btn btn-download" onclick="downloadPDF('${pdf.url}')" title="Unduh PDF">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn btn-share" onclick="sharePDF('${pdf.url}', '${pdf.name.replace(/'/g, "\\'")}')" title="Bagikan PDF">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;

        pdfGrid.appendChild(card);
    });
}

// Fungsi untuk filter berdasarkan kategori
function filterByCategory(category) {
    currentCategory = category;

    // Update active pill
    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(pill => {
        pill.classList.remove('active');
        const pillText = pill.textContent.trim();

        if ((category === 'all' && pillText === 'Semua') ||
            (category === 'trading-fx' && pillText === 'Trading FX') ||
            (category === 'saham' && pillText === 'Saham')) {
            pill.classList.add('active');
        }
    });

    renderPDFs(getCurrentPDFs());
}

// Fungsi untuk show coming soon
function showComingSoon() {
    showNotification('Kategori Saham segera hadir!');
}

// Fungsi untuk filter berdasarkan pencarian
function filterPDFs() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    let filteredPDFs = getCurrentPDFs();

    if (searchTerm) {
        const beforeFilterCount = filteredPDFs.length;
        filteredPDFs = filteredPDFs.filter(pdf =>
            pdf.name.toLowerCase().includes(searchTerm)
        );

        // Show notification if search returned no results
        if (beforeFilterCount > 0 && filteredPDFs.length === 0) {
            showNotification(`Pencarian "${searchTerm}" tidak menemukan PDF`, 'info');
        }
    }

    renderPDFs(filteredPDFs);
}

// Fungsi untuk show home
function showHome() {
    currentView = 'all';
    currentCategory = 'all';

    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('musicContent').style.display = 'none';
    document.getElementById('aboutContent').style.display = 'none';
    document.getElementById('searchInput').value = '';

    filterByCategory('all');

    toggleSidebar();
}

// Fungsi untuk show favorites
function showFavorites() {
    currentView = 'favorites';
    currentCategory = 'all';

    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('aboutContent').style.display = 'none';
    document.getElementById('searchInput').value = '';

    const pills = document.querySelectorAll('.category-pill');
    pills.forEach(pill => {
        pill.classList.remove('active');
        if (pill.textContent === 'Semua') {
            pill.classList.add('active');
        }
    });

    renderPDFs(favorites);
    toggleSidebar();
}

// showAbout function removed - About page moved to fitur/about.html

// Close modals when clicking outside
document.addEventListener('click', function (event) {
    const pdfModal = document.getElementById('pdfViewerModal');
    const shareModal = document.getElementById('shareModal');

    if (pdfModal && event.target === pdfModal) {
        closePDFViewer();
    }

    if (shareModal && event.target === shareModal) {
        closeShareModal();
    }
});

// Close modals on escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closePDFViewer();
        closeShareModal();
    }
});

// Initialize saat halaman dimuat
document.addEventListener('DOMContentLoaded', function () {
    applyDeviceStyles();
    renderPDFs(allPDFs);

    document.addEventListener('click', function (event) {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.querySelector('.menu-btn');

        if (sidebar && sidebar.classList.contains('active') &&
            !sidebar.contains(event.target) &&
            !menuBtn.contains(event.target)) {
            toggleSidebar();
        }
    });
});

function updateMusicProgress() {
    const audio = document.getElementById('musicAudio');
    if (!audio) return;

    const progress = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progress').style.width = progress + '%';

    // Update time display
    document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
    document.getElementById('duration').textContent = formatTime(audio.duration);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function togglePlayPause() {
    const audio = document.getElementById('musicAudio');
    const playBtn = document.getElementById('playPauseBtn');

    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function nextTrack() {
    currentMusicIndex = (currentMusicIndex + 1) % musicData.length;
    playTrack(currentMusicIndex);
}

function previousTrack() {
    currentMusicIndex = (currentMusicIndex - 1 + musicData.length) % musicData.length;
    playTrack(currentMusicIndex);
}

function closeMusicPlayer() {
    const audio = document.getElementById('musicAudio');
    if (audio && audio.paused) {
        // Floating control akan tetap visible karena musik masih jalan di background
    }

    document.getElementById('musicPlayerModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function toggleMusicFavorite(index) {
    musicData[index].favorite = !musicData[index].favorite;
    renderMusicGrid();
    if (currentView === 'music') {
        renderMusicGrid();
    }
}

// Contact Modal Functions




// Music modal open/close
function openMusicModal() {
    const modal = document.getElementById('musicModal');
    if (!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeMusicModal() {
    const modal = document.getElementById('musicModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Admin Profile Logic
document.addEventListener('DOMContentLoaded', function () {
    const adminBtn = document.getElementById('adminLoginBtn');
    const adminDropdown = document.getElementById('adminDropdown');
    const adminNameDisplay = document.getElementById('adminNameDisplay');

    if (adminBtn && adminDropdown) {
        adminBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isAdmin = sessionStorage.getItem('fx_isAdmin') === '1';

            if (isAdmin) {
                adminDropdown.classList.toggle('active');
                // Update name from session storage
                const userData = sessionStorage.getItem('fx_user');
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        if (adminNameDisplay) adminNameDisplay.textContent = user.nama || 'Admin';
                    } catch (e) {
                        if (adminNameDisplay) adminNameDisplay.textContent = 'Admin';
                    }
                }
            } else {
                window.location.href = 'auth.html';
            }
        });

        document.addEventListener('click', function (e) {
            if (!adminDropdown.contains(e.target) && !adminBtn.contains(e.target)) {
                adminDropdown.classList.remove('active');
            }
        });
    }
});

function adminLogout() {
    sessionStorage.removeItem('fx_isAdmin');
    sessionStorage.removeItem('fx_user');
    localStorage.removeItem('fx_adminName');
    window.location.href = 'auth.html';
}