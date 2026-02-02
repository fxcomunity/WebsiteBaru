// Global variables
let currentCategory = 'all';
let allPDFs = [...pdfData];
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

// Fungsi untuk toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

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
    modal.style.display = 'block';
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
    modal.style.display = 'block';
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
    let pdfs = allPDFs;
    
    if (currentView === 'favorites') {
        pdfs = favorites;
    }
    
    if (currentCategory !== 'all') {
        pdfs = pdfs.filter(pdf => pdf.category === currentCategory);
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
    const pills = document.querySelectorAll('.category-pill:not(.coming-soon)');
    pills.forEach(pill => {
        pill.classList.remove('active');
        if (pill.textContent.toLowerCase().includes(category) || 
            (category === 'all' && pill.textContent === 'Semua') ||
            (category === 'fx-basic' && pill.textContent === 'Trading FX')) {
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
        filteredPDFs = filteredPDFs.filter(pdf => 
            pdf.name.toLowerCase().includes(searchTerm)
        );
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

// Fungsi untuk show about
function showAbout() {
    currentView = 'about';
    
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('musicContent').style.display = 'none';
    document.getElementById('aboutContent').style.display = 'block';
    
    const deviceInfo = getDeviceInfo();
    
    const aboutContent = document.getElementById('aboutContent');
    aboutContent.innerHTML = `
        <div class="about-container">
            <div class="about-header">
                <i class="fas fa-info-circle"></i>
                <h2>FX Community - Koleksi PDF Trading</h2>
            </div>
            
            <div class="about-section">
                <h3><i class="fas fa-star"></i> Tentang Kami</h3>
                <p>FX Community adalah platform pembelajaran trading yang komprehensif dan terpercaya. Kami menyediakan koleksi materi trading berkualitas tinggi dari berbagai sumber terbaik. Misi kami adalah memberdayakan trader pemula hingga profesional dengan pengetahuan dan alat yang diperlukan untuk sukses di pasar forex.</p>
                <p>Bergabunglah dengan ribuan trader yang telah mempercayai kami sebagai sumber pembelajaran utama mereka!</p>
            </div>
            
            <div class="about-section">
                <h3><i class="fas fa-rocket"></i> Fitur Unggulan</h3>
                <ul class="feature-list">
                    <li><i class="fas fa-check-circle"></i> Viewer PDF langsung tanpa redirect</li>
                    <li><i class="fas fa-check-circle"></i> Fitur share dengan QR Code resmi</li>
                    <li><i class="fas fa-check-circle"></i> Koleksi PDF Trading FX yang lengkap</li>
                    <li><i class="fas fa-check-circle"></i> Fitur favorit untuk menyimpan materi penting</li>
                    <li><i class="fas fa-check-circle"></i> Pencarian cepat dan mudah</li>
                    <li><i class="fas fa-check-circle"></i> Music Player dengan koleksi lagu inspiratif</li>
                    <li><i class="fas fa-check-circle"></i> Responsive design di semua device</li>
                    <li><i class="fas fa-check-circle"></i> Linktree dengan link penting & cepat</li>
                </ul>
            </div>
            
            <div class="about-section device-specific">
                <h3><i class="fas ${deviceInfo.deviceIcon}"></i> Informasi Perangkat Anda</h3>
                <div class="device-info">
                    <div class="info-item">
                        <span class="info-label">📱 Tipe Device:</span>
                        <span class="info-value"><strong>${deviceInfo.deviceType}</strong></span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">🖥️ Sistem Operasi:</span>
                        <span class="info-value"><strong>${deviceInfo.deviceOS}</strong></span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">🌐 Browser:</span>
                        <span class="info-value"><strong>${deviceInfo.browserName}</strong></span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">📚 Total PDF Tersedia:</span>
                        <span class="info-value"><strong>${allPDFs.length} dokumen</strong></span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">❤️ PDF Favorit Anda:</span>
                        <span class="info-value"><strong>${favorites.length} dokumen</strong></span>
                    </div>
                </div>
            </div>
            
            <div class="about-section">
                <h3><i class="fas fa-book"></i> Materi Pembelajaran</h3>
                <p>Kami menyediakan materi pembelajaran dalam berbagai kategori:</p>
                <ul class="feature-list">
                    <li><i class="fas fa-chart-line"></i> <strong>Trading FX Basic</strong> - Dasar-dasar forex untuk pemula</li>
                    <li><i class="fas fa-chart-area"></i> <strong>Analisa Teknikal</strong> - Strategi dan pattern trading</li>
                    <li><i class="fas fa-brain"></i> <strong>Psikologi Trading</strong> - Mindset dan emotional control</li>
                    <li><i class="fas fa-graduation-cap"></i> <strong>Trading Lanjutan</strong> - Strategi profesional dan advanced concepts</li>
                </ul>
            </div>
            
            <div class="about-section">
                <h3><i class="fas fa-question-circle"></i> Cara Menggunakan Platform</h3>
                <ol class="usage-list">
                    <li><strong>Jelajahi Kategori</strong> - Pilih kategori PDF yang ingin Anda pelajari</li>
                    <li><strong>Cari Materi</strong> - Gunakan fitur pencarian untuk menemukan topik spesifik</li>
                    <li><strong>Baca PDF</strong> - Klik tombol "Lihat" untuk membaca PDF langsung di aplikasi</li>
                    <li><strong>Bagikan</strong> - Gunakan tombol share untuk membagikan dengan QR Code resmi</li>
                    <li><strong>Simpan Favorit</strong> - Klik ikon hati untuk menyimpan materi penting</li>
                    <li><strong>Akses Linktree</strong> - Gunakan tombol link untuk akses ke link penting lainnya</li>
                </ol>
            </div>
            
            <div class="about-section">
                <h3><i class="fas fa-community"></i> Komunitas FX</h3>
                <p>Jadilah bagian dari komunitas trader FX yang aktif dan saling mendukung. Berbagi pengalaman, strategi, dan tips dengan trader lainnya.</p>
                <p>Ikuti komunitas kami untuk mendapatkan update terbaru, webinar, dan event eksklusif!</p>
            </div>
            
            <div class="about-section contact-section">
                <h3><i class="fas fa-comments"></i> Hubungi Kami</h3>
                <p>Punya pertanyaan, saran, atau ingin bergabung dengan komunitas kami? Hubungi kami sekarang!</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 15px;">
                    <a href="https://wa.me/62895404147521" target="_blank" class="contact-btn" style="flex: 1; min-width: 150px;">
                        <i class="fab fa-whatsapp"></i> Admin Support
                    </a>
                    <a href="https://chat.whatsapp.com/KnkESJgEUKT5PEki4SpDD0" target="_blank" class="contact-btn" style="flex: 1; min-width: 150px;">
                        <i class="fab fa-whatsapp"></i> Join Komunitas
                    </a>
                </div>
            </div>
            
            <div class="about-footer">
                <p>&copy; 2025 FX Community | Koleksi PDF Trading</p>
                <p style="font-size: 12px; color: #888; margin-top: 8px;">Platform pembelajaran trading untuk semua level</p>
            </div>
        </div>
    `;
    
    toggleSidebar();
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
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
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePDFViewer();
        closeShareModal();
    }
});

// Initialize saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    applyDeviceStyles();
    renderPDFs(allPDFs);
    
    document.addEventListener('click', function(event) {
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
function toggleContactWidget() {
    const widget = document.getElementById('floatingContactWidget');
    const widgetBody = document.getElementById('widgetBody');
    const header = widget.querySelector('.widget-header');
    
    if (widgetBody.style.display === 'none') {
        widgetBody.style.display = 'block';
        header.classList.remove('collapsed');
        document.getElementById('floatingContactForm').reset();
    } else {
        widgetBody.style.display = 'none';
        header.classList.add('collapsed');
    }
}

function submitFloatingContact(event) {
    event.preventDefault();
    
    const name = document.getElementById('fcName').value;
    const category = document.getElementById('fcCategory').value;
    const message = document.getElementById('fcMessage').value;
    
    const categoryMap = {
        'pertanyaan': '❓ Pertanyaan',
        'bug': '🐛 Bug Report',
        'saran': '💡 Saran',
        'partnership': '🤝 Kerjasama',
        'lainnya': '📋 Lainnya'
    };
    
    const whatsappMessage = `*HUBUNGI KAMI - TRADING PDF*\n\n` +
        `*Nama:* ${name}\n` +
        `*Kategori:* ${categoryMap[category] || category}\n\n` +
        `*Pesan:*\n${message}`;
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/62895404147521?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
    
    // Reset form
    document.getElementById('floatingContactForm').reset();
    
    // Collapse widget after submit
    const widgetBody = document.getElementById('widgetBody');
    const header = document.querySelector('.widget-header');
    widgetBody.style.display = 'none';
    header.classList.add('collapsed');
}

// Close widget when clicking outside
document.addEventListener('click', function(event) {
    const widget = document.getElementById('floatingContactWidget');
    if (widget && !widget.contains(event.target)) {
        const widgetBody = document.getElementById('widgetBody');
        if (widgetBody.style.display === 'block') {
            // Optionally close on outside click
            // widgetBody.style.display = 'none';
        }
    }
});

/* Linktree feature */
function openLinktree() {
    const modal = document.getElementById('linktreeModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderLinktree();
}

function closeLinktree() {
    const modal = document.getElementById('linktreeModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function renderLinktree() {
    const list = document.getElementById('linktreeList');
    if (!list || typeof getLinktreeLinks !== 'function') return;
    const items = getLinktreeLinks();
    list.innerHTML = '';

    items.forEach(item => {
        const a = document.createElement('a');
        a.className = 'lt-link-btn';
        a.href = item.url;
        a.title = item.title;

        const icon = document.createElement('i');
        if (item.icon) icon.className = item.icon;
        a.appendChild(icon);

        const span = document.createElement('span');
        span.textContent = item.title;
        a.appendChild(span);

        a.addEventListener('click', function(e) {
            // Internal anchors: handle in-page actions
            if (item.url && item.url.startsWith('#')) {
                e.preventDefault();
                closeLinktree();
                if (item.url === '#music') showMusic();
                else if (item.url === '#catalog') showHome();
                const targetId = item.url.replace('#', '');
                const el = document.getElementById(targetId);
                if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 200);
            } else if (item.url && item.url.startsWith('http')) {
                // external link - open new tab
                // allow default behavior but ensure new tab
                window.open(item.url, '_blank');
                closeLinktree();
                e.preventDefault();
            }
        });

        list.appendChild(a);
    });
}

// Close Linktree on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('linktreeModal');
    const btn = document.getElementById('linktreeFloatingBtn');
    if (!modal || modal.style.display !== 'flex') return;
    if (modal.contains(e.target) || (btn && btn.contains(e.target))) return;
    closeLinktree();
});

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