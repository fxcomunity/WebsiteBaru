/* Clean music player script — uses shared `musicData` from /music-data.js */
let currentIndex = 0;

function audioElement() { return document.getElementById('audioPlayer'); }

function formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function setNowPlayingUI(index) {
    const data = musicData[index];
    if (!data) return;
    const titleEl = document.getElementById('nowPlayingTitle');
    const artistEl = document.getElementById('nowPlayingArtist');
    const albumEl = document.getElementById('albumArt');
    if (titleEl) titleEl.textContent = data.title;
    if (artistEl) artistEl.textContent = data.artist;
    if (albumEl) albumEl.textContent = '♪';
    document.querySelectorAll('.music-item').forEach((it, i) => it.classList.toggle('active', i === index));
}

function playMusic(index) {
    currentIndex = index;
    const a = audioElement();
    if (!a) return;
    a.src = musicData[index].file;
    a.play().catch(() => {});
    setNowPlayingUI(index);
}

function togglePlayPause() {
    const a = audioElement();
    if (!a) return;
    if (a.paused) a.play(); else a.pause();
}

function previousTrack() { currentIndex = (currentIndex - 1 + musicData.length) % musicData.length; playMusic(currentIndex); }
function nextTrack() { currentIndex = (currentIndex + 1) % musicData.length; playMusic(currentIndex); }

function updatePlayButtons(isPlaying) {
    const mainBtn = document.getElementById('mainPlayBtn');
    const smallBtn = document.getElementById('playPauseBtn');
    if (mainBtn) mainBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    if (smallBtn) smallBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

function initPlayerControls() {
    const mainBtn = document.getElementById('mainPlayBtn');
    const smallBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const vol = document.getElementById('volumeSlider');
    const progressBar = document.getElementById('progressBar');
    const a = audioElement();

    if (mainBtn) mainBtn.addEventListener('click', () => { togglePlayPause(); });
    if (smallBtn) smallBtn.addEventListener('click', () => { togglePlayPause(); });
    if (prevBtn) prevBtn.addEventListener('click', previousTrack);
    if (nextBtn) nextBtn.addEventListener('click', nextTrack);
    if (vol && a) vol.addEventListener('input', (e) => { a.volume = e.target.value; });

    if (progressBar && a) {
        progressBar.addEventListener('click', (e) => {
            if (!a.duration) return;
            const rect = progressBar.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            a.currentTime = pct * a.duration;
        });
    }

    if (a) {
        a.addEventListener('timeupdate', () => {
            const pct = (a.currentTime / (a.duration || 1)) * 100;
            const prog = document.getElementById('progress');
            if (prog) prog.style.width = pct + '%';
            const cur = document.getElementById('currentTime');
            if (cur) cur.textContent = formatTime(a.currentTime);
        });

        a.addEventListener('loadedmetadata', () => {
            const dur = document.getElementById('duration');
            if (dur) dur.textContent = formatTime(a.duration);
        });

        a.addEventListener('play', () => updatePlayButtons(true));
        a.addEventListener('pause', () => updatePlayButtons(false));
        a.addEventListener('ended', () => nextTrack());
    }
}

function renderMusicButtons() {
    const container = document.getElementById('musicList');
    if (!container) return;
    container.innerHTML = '';
    musicData.forEach((music, index) => {
        const item = document.createElement('div');
        item.className = 'music-item';
        item.tabIndex = 0;
        item.onclick = () => playMusic(index);
        item.innerHTML = `
            <div class="music-thumb"><i class="fas fa-music"></i></div>
            <div class="music-meta">
                <div class="music-title">${music.title}</div>
                <div class="music-artist">${music.artist}</div>
            </div>
            <button class="small-play" aria-label="Play"><i class="fas fa-play"></i></button>
        `;
        const smallPlay = item.querySelector('.small-play');
        if (smallPlay) smallPlay.addEventListener('click', (ev) => { ev.stopPropagation(); playMusic(index); });
        container.appendChild(item);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // detect platform (iOS / Android / desktop) and add class to root for CSS overrides
    (function detectPlatform() {
        try {
            const ua = navigator.userAgent || navigator.vendor || window.opera || '';
            let cls = 'platform-desktop';
            if (/android/i.test(ua)) cls = 'platform-android';
            else if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) cls = 'platform-ios';
            document.documentElement.classList.add(cls);
        } catch (e) {
            // noop
        }
    })();
    initPlayerControls();
    renderMusicButtons();
    setNowPlayingUI(0);
    const a = audioElement();
    const vol = document.getElementById('volumeSlider');
    if (a && vol) a.volume = parseFloat(vol.value || 0.8);
});
