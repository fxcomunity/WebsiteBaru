/* =========================
   MUSIC DATA (GitHub Release)
   FX Community DJ Collection
========================= */
const musicData = [
    {
        id: 1,
        title: "DJ EEE AAA",
        artist: "DJ Remix",
        file: "https://github.com/fxcomunity/WebsiteBaru/releases/download/v1/DJ.EEE.AAA.mp3"
    },
    {
        id: 2,
        title: "DJ ENGGA DULU",
        artist: "Slowed & Reverb",
        file: "https://github.com/fxcomunity/WebsiteBaru/releases/download/v1/DJ.ENGGAK.DULU.Slowed.Reverb.mp3"
    },
    {
        id: 3,
        title: "DJ SO ASU",
        artist: "Pelukan Yang Hangat",
        file: "https://github.com/fxcomunity/WebsiteBaru/releases/download/v1/DJ.SO.ASU.-.Pelukan.Yang.Hangat.mp3"
    },
    {
        id: 4,
        title: "DJ Lemon Nipis",
        artist: "2025 Remix",
        file: "https://github.com/fxcomunity/WebsiteBaru/releases/download/v1/DJ.LEMON.NIPIS.2025.mp3"
    }
];

/* =========================
   MUSIC PLAYER LOGIC
========================= */
function playMusic(index) {
    const audioEl = document.getElementById("audioPlayer");
    if (!audioEl) return;
    audioEl.src = musicData[index].file;
    audioEl.play();
}

/* =========================
   MUSIC UI RENDERER
========================= */
function renderMusicButtons() {
    const container = document.getElementById('musicList') || document.body;
    
    // Clear existing items
    if (container.id === 'musicList') {
        container.innerHTML = '';
    }
    
    musicData.forEach((music, index) => {
        const item = document.createElement('div');
        item.className = 'music-list-item';
        item.setAttribute('role', 'button');
        item.tabIndex = 0;
        item.onclick = () => playMusic(index);
        item.onkeypress = (e) => { if (e.key === 'Enter') playMusic(index); };

        item.innerHTML = `
            <div class="music-left">
                <div class="music-thumb"><i class="fas fa-compact-disc"></i></div>
                <div class="music-meta">
                    <div class="music-title">${music.title}</div>
                    <div class="music-artist">${music.artist}</div>
                </div>
            </div>
            <div class="music-right">
                <button class="music-play-small" aria-label="Play">▶</button>
            </div>
        `;

        // Play when clicking the small play button as well
        item.querySelector('.music-play-small').onclick = (ev) => { 
            ev.stopPropagation(); 
            playMusic(index); 
        };

        container.appendChild(item);
    });
}

/* =========================
   Initialize Music UI
========================= */
document.addEventListener('DOMContentLoaded', function() {
    renderMusicButtons();
});
