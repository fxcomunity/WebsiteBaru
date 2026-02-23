/**
 * Gempa BMKG Notification System
 * Fetches latest earthquake data from BMKG API
 */

const BMKG_API = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";

async function checkEarthquake(isInitial = false) {
    if (checkMuteStatus()) return; // Check if notifications are muted

    try {
        const response = await fetch(BMKG_API);
        const data = await response.json();
        const gempa = data.Infogempa.gempa;

        // Use sessionStorage instead of localStorage so it shows on every new visit/tab
        // But we still track if it's a new earthquake during the current session
        const lastGempaId = sessionStorage.getItem('last_gempa_id');

        if (isInitial || lastGempaId !== gempa.DateTime) {
            showGempaNotification(gempa);
            sessionStorage.setItem('last_gempa_id', gempa.DateTime);
        }
    } catch (error) {
        console.error("Failed to fetch BMKG data:", error);
    }
}

function checkMuteStatus() {
    const muteUntil = localStorage.getItem('gempa_mute_until');
    if (muteUntil && Date.now() < parseInt(muteUntil)) {
        return true;
    }
    // Clean up expired mute
    if (muteUntil) {
        localStorage.removeItem('gempa_mute_until');
    }
    return false;
}

function muteNotifications() {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const muteUntil = Date.now() + sevenDays;
    localStorage.setItem('gempa_mute_until', muteUntil.toString());
    closeGempaNotif();

    // Optional: Show a small toast or alert confirming mute
    alert("Notifikasi gempabumi dimatikan selama 7 hari.");
}

function showGempaNotification(gempa) {
    // Remove existing notification if any
    const existing = document.querySelector('.gempa-notif');
    if (existing) existing.remove();

    // Get correct path to gempa list
    const currentPath = window.location.pathname;
    let listPath = 'gempa-bmkg/index.html';

    if (currentPath.includes('/fitur/') || currentPath.includes('/admin/') || currentPath.includes('/gempa-bmkg/') || currentPath.includes('/404/') || currentPath.includes('/privacy/') || currentPath.includes('/terms/')) {
        listPath = '../gempa-bmkg/index.html';
    } else if (currentPath.includes('/favorit/') || currentPath.includes('/music/')) {
        listPath = '../../gempa-bmkg/index.html';
    }

    const notifHTML = `
        <div class="gempa-notif">
            <div class="gempa-header">
                <div class="gempa-title">
                    <i class="fas fa-exclamation-triangle"></i>
                    INFO GEMPABUMI TERKINI
                </div>
                <button class="gempa-close" onclick="closeGempaNotif()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="gempa-content">
                <div class="gempa-info">
                    <div class="gempa-mag">M ${gempa.Magnitude}</div>
                    <div class="gempa-loc">${gempa.Wilayah}</div>
                    <div class="gempa-meta">
                        <div><i class="far fa-calendar-alt"></i> ${gempa.Tanggal}</div>
                        <div><i class="far fa-clock"></i> ${gempa.Jam}</div>
                        <div><i class="fas fa-arrows-alt-v"></i> Kedalaman: ${gempa.Kedalaman}</div>
                        <div><i class="fas fa-bullseye"></i> Potensi: ${gempa.Potensi}</div>
                    </div>
                </div>
            </div>
            <div class="gempa-actions">
                <a href="${listPath}" class="gempa-btn">
                    LIHAT DAFTAR GEMPA
                </a>
                <button class="gempa-mute-btn" onclick="muteNotifications()">
                    <i class="fas fa-bell-slash"></i> Matikan 7 Hari
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', notifHTML);

    // Trigger animation
    setTimeout(() => {
        document.querySelector('.gempa-notif').classList.add('active');
    }, 100);

    // Auto-hide after 15 seconds
    setTimeout(() => {
        closeGempaNotif();
    }, 15000);
}

async function fetchGempaList() {
    const LIST_API = "https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json";
    const AUTOGEMPA_API = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";
    const DIRASAKAN_API = "https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json";

    try {
        // Fetch Main Gempa (Latest)
        const autoRes = await fetch(AUTOGEMPA_API);
        const autoData = await autoRes.json();
        const main = autoData.Infogempa.gempa;

        const mainContainer = document.getElementById('mainGempa');
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div class="main-gempa-layout">
                    <div class="main-gempa-map-wrapper">
                        <div id="gempaMap" style="height: 350px; width: 100%; border-radius: 12px; border: 1px solid var(--border);"></div>
                    </div>
                    <div class="main-gempa-details">
                        <div class="gempa-badge-latest">Gempabumi Terbaru</div>
                        <h2 class="main-gempa-title">${main.Wilayah}</h2>
                        
                        <div class="gempa-grid-details">
                            <div class="detail-item">
                                <span class="detail-label">Waktu Gempa</span>
                                <span class="detail-value">${main.Tanggal} ${main.Jam}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Magnitudo</span>
                                <span class="detail-value" style="color: #ef4444; font-size: 1.5rem; font-weight: 800;">${main.Magnitude}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Kedalaman</span>
                                <span class="detail-value">${main.Kedalaman}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Lokasi</span>
                                <span class="detail-value">${main.Coordinates}</span>
                            </div>
                            <div class="detail-item full">
                                <span class="detail-label">Potensi</span>
                                <span class="detail-value" style="color: #ef4444; font-weight: 700;">${main.Potensi}</span>
                            </div>
                            <div class="detail-item full">
                                <span class="detail-label">Dirasakan (Skala MMI)</span>
                                <span class="detail-value">${main.Dirasakan || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Init map after DOM update
            setTimeout(() => {
                const coords = main.Coordinates.split(',');
                initGempaMap(parseFloat(coords[0]), parseFloat(coords[1]), main.Wilayah);
            }, 100);
        }

        // Fetch List of 15 Gempa M 5.0+
        const listRes = await fetch(LIST_API);
        const listData = await listRes.json();
        const list = listData.Infogempa.gempa;

        const listBody = document.getElementById('gempaListBody');
        if (listBody) {
            listBody.innerHTML = list.map((g, index) => `
                <tr>
                    <td data-label="No">${index + 1}</td>
                    <td data-label="Waktu Gempa">${g.Tanggal}<br><small>${g.Jam}</small></td>
                    <td data-label="Lintang - Bujur">${g.Lintang}<br>${g.Bujur}</td>
                    <td data-label="Magnitudo"><span class="mag-badge">M ${g.Magnitude}</span></td>
                    <td data-label="Kedalaman">${g.Kedalaman}</td>
                    <td data-label="Wilayah">${g.Wilayah}<br><small style="color: #ef4444">${g.Potensi}</small></td>
                </tr>
            `).join('');
        }

        // Fetch List of 15 Gempa Dirasakan
        const dirasakanRes = await fetch(DIRASAKAN_API);
        const dirasakanData = await dirasakanRes.json();
        const listDirasakan = dirasakanData.Infogempa.gempa;

        const dirasakanBody = document.getElementById('gempaDirasakanBody');
        if (dirasakanBody) {
            dirasakanBody.innerHTML = listDirasakan.map((g, index) => `
                <tr>
                    <td data-label="No">${index + 1}</td>
                    <td data-label="Waktu Gempa">${g.Tanggal}<br><small>${g.Jam}</small></td>
                    <td data-label="Lintang - Bujur">${g.Lintang}<br>${g.Bujur}</td>
                    <td data-label="Magnitudo"><span class="mag-badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">M ${g.Magnitude}</span></td>
                    <td data-label="Kedalaman">${g.Kedalaman}</td>
                    <td data-label="Wilayah (Dirasakan)">${g.Wilayah}<br><small style="color: #6366f1">Dirasakan: ${g.Dirasakan}</small></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error("Failed to fetch earthquake list:", error);
        const mainContainer = document.getElementById('mainGempa');
        if (mainContainer) mainContainer.innerHTML = '<p>Gagal memuat data. Silakan coba lagi nanti.</p>';
    }
}

function switchGempaTab(tab) {
    const m5Btn = document.querySelector('.gempa-tab[onclick*="m5"]');
    const dirasakanBtn = document.querySelector('.gempa-tab[onclick*="dirasakan"]');
    const m5Content = document.getElementById('m5Content');
    const dirasakanContent = document.getElementById('dirasakanContent');

    if (tab === 'm5') {
        m5Btn.classList.add('active');
        dirasakanBtn.classList.remove('active');
        m5Content.style.display = 'block';
        dirasakanContent.style.display = 'none';
    } else {
        dirasakanBtn.classList.add('active');
        m5Btn.classList.remove('active');
        m5Content.style.display = 'none';
        dirasakanContent.style.display = 'block';
    }
}

function initGempaMap(lat, lon, wilayah) {
    if (typeof L === 'undefined') return;

    // Create map
    const map = L.map('gempaMap').setView([lat, lon], 7);

    // Add dark theme tile layer (matching the site)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Custom pulse icon for earthquake
    const icon = L.divIcon({
        className: 'gempa-map-marker',
        html: '<div class="marker-pulse"></div><div class="marker-dot"></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    L.marker([lat, lon], { icon }).addTo(map)
        .bindPopup(`<b>Gempabumi Terbaru</b><br>${wilayah}`)
        .openPopup();
}

function closeGempaNotif() {
    const notif = document.querySelector('.gempa-notif');
    if (notif) {
        notif.classList.remove('active');
        setTimeout(() => notif.remove(), 600);
    }
}

// Initial check
document.addEventListener('DOMContentLoaded', () => {
    // Load footer if container exists
    if (document.getElementById('footer-container')) {
        loadFooter();
    }

    // Delay first check and set isInitial=true to show it on every page load/visit
    if (!window.location.pathname.includes('/gempa-bmkg/')) {
        setTimeout(() => checkEarthquake(true), 3000);
    }

    // Check periodically for changes
    setInterval(checkEarthquake, 5 * 60 * 1000);
});

function loadFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    fetch('../footer/main.html')
        .then(r => r.text())
        .then(html => {
            footerContainer.innerHTML = html;
            // Adjust links for nested directory
            const links = footerContainer.querySelectorAll('a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#')) {
                    if (href === 'index.html') {
                        link.href = '../index.html';
                    } else {
                        link.href = '../' + href;
                    }
                }
            });

            // Set current year
            const yearEl = document.getElementById('currentYear');
            if (yearEl) yearEl.textContent = new Date().getFullYear();
        })
        .catch(err => console.log('Footer load error:', err));
}
