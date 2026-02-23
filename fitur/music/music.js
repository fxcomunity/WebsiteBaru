/* Premium Music Player Script */
let currentIndex = 0;
let isPlaying = false;
const audio = document.getElementById('audioPlayer');

// DOM Elements
const elements = {
    albumArt: document.getElementById('albumArtDisplay'),
    title: document.getElementById('nowPlayingTitle'),
    artist: document.getElementById('nowPlayingArtist'),
    progressContainer: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    currentTime: document.getElementById('currentTime'),
    duration: document.getElementById('duration'),
    playBtn: document.getElementById('playPauseBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    songList: document.getElementById('musicList'),
    songCount: document.getElementById('songCount')
};

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Spotify Config
const SPOTIFY_CLIENT_ID = '7e4648cbaae14f629bb7e655f914baf1';
const SPOTIFY_CLIENT_SECRET = '54043c9bb240453fa45ea9bd3f9cb4cd';
let spotifyClient = null;

async function initSpotify() {
    try {
        spotifyClient = new SpotifyClient(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
        const tracks = await spotifyClient.searchTracks('Trading Motivation', 20);

        if (tracks && tracks.length > 0) {
            // Replace local musicData with Spotify data
            // We need to match the structure expected by the player
            // musicData is a const in music-data.js, so we might need to override it or use a local variable
            // Since musicData is loaded via script tag, we can try to re-assign if it was let, but it is const.
            // Let's create a working playlist variable.

            // To make it compatible without changing music-data.js everywhere, we will use a global override if possible
            // or just update our local reference if we change the player to use a variable.
            // For now, let's just make musicData mutable in our scope if possible, or create a 'playlist' variable.
            // Since musicData is const in the other file, we can't reassign it. 
            // We will create a local 'playlist' variable and use that instead of musicData.

            playlist = tracks;
            currentIndex = 0;
            renderPlaylist();
            updatePlayerUI();

            // Update badge or title to show Spotify is active
            const badge = document.querySelector('.page-badge');
            if (badge) badge.innerHTML = '<i class="fab fa-spotify"></i> Spotify Preview';
        }
    } catch (e) {
        console.error("Spotify Init Error:", e);
        // Fallback to local musicData is automatic if we don't update 'playlist'
    }
}

// Initialize playlist with local data first
let playlist = [...musicData];

function renderPlaylist() {
    if (!elements.songList) return;
    elements.songList.innerHTML = '';
    if (elements.songCount) elements.songCount.textContent = `${playlist.length} Songs`;

    playlist.forEach((song, index) => {
        const div = document.createElement('div');
        div.className = `song-item ${index === currentIndex ? 'active' : ''}`;
        div.onclick = () => playTrack(index);

        div.innerHTML = `
            <div class="song-index">${index + 1}</div>
            <div class="playing-indicator">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </div>
            <div class="song-details">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-duration">${song.duration || ''}</div>
        `;
        elements.songList.appendChild(div);
    });
}

function updatePlayerUI() {
    if (playlist.length === 0) return;
    const song = playlist[currentIndex];

    // Update Text
    if (elements.title) elements.title.textContent = song.title;
    if (elements.artist) elements.artist.textContent = song.artist;

    // Update Album Art (if image exists in data, otherwise default icon)
    if (elements.albumArt) {
        if (song.image) {
            elements.albumArt.innerHTML = `<img src="${song.image}" alt="${song.title}">`;
        } else {
            elements.albumArt.innerHTML = `<i class="fas fa-music"></i>`;
        }
    }

    // Update active class in playlist
    const items = document.querySelectorAll('.song-item');
    items.forEach((item, index) => {
        if (index === currentIndex) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });

    updatePlayButton();
}

function playTrack(index) {
    if (playlist.length === 0) return;
    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;

    currentIndex = index;
    audio.src = playlist[currentIndex].file;
    audio.play()
        .then(() => {
            isPlaying = true;
            updatePlayerUI();
        })
        .catch(err => console.error("Playback error:", err));

    updatePlayerUI();
}

function togglePlay() {
    if (audio.paused) {
        if (!audio.src && playlist.length > 0) playTrack(currentIndex);
        else audio.play().then(() => { isPlaying = true; updatePlayButton(); });
    } else {
        audio.pause();
        isPlaying = false;
        updatePlayButton();
    }
}

function initPlayer() {
    // Event Listeners
    if (elements.playBtn) elements.playBtn.onclick = togglePlay;
    if (elements.prevBtn) elements.prevBtn.onclick = () => playTrack(currentIndex - 1);
    if (elements.nextBtn) elements.nextBtn.onclick = () => playTrack(currentIndex + 1);

    // Progress Bar
    if (audio) {
        audio.addEventListener('timeupdate', () => {
            const percent = (audio.currentTime / audio.duration) * 100;
            if (elements.progressFill) elements.progressFill.style.width = `${percent}%`;
            if (elements.currentTime) elements.currentTime.textContent = formatTime(audio.currentTime);
            if (elements.duration && !isNaN(audio.duration)) elements.duration.textContent = formatTime(audio.duration);
        });

        audio.addEventListener('ended', () => playTrack(currentIndex + 1));

        audio.addEventListener('loadedmetadata', () => {
            if (elements.duration) elements.duration.textContent = formatTime(audio.duration);
        });

        // Error handling for playback
        audio.addEventListener('error', (e) => {
            console.error("Audio Error:", e);
            // Auto skip if error (e.g. 403 or 404 on preview url)
            setTimeout(() => playTrack(currentIndex + 1), 1000);
        });
    }

    if (elements.progressContainer) {
        elements.progressContainer.onclick = (e) => {
            const width = elements.progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            audio.currentTime = (clickX / width) * duration;
        };
    }

    // Volume
    if (elements.volumeSlider) {
        elements.volumeSlider.oninput = (e) => {
            audio.volume = e.target.value;
        };
    }

    // Initial Render with Local Data
    renderPlaylist();
    updatePlayerUI();

    // Set initial volume
    if (audio && elements.volumeSlider) audio.volume = elements.volumeSlider.value;

    // Try to load Spotify
    initSpotify();
}

// Auto-init
document.addEventListener('DOMContentLoaded', initPlayer);
