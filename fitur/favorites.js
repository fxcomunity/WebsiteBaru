/* =========================
   FAVORITES MANAGEMENT
   FX Community PDF Favorites
========================= */

// Load favorites from localStorage
let favorites = JSON.parse(localStorage.getItem('pdfFavorites')) || [];

/* =========================
   TOGGLE FAVORITE
========================= */
function toggleFavorite(url, name, category) {
    const index = favorites.findIndex(fav => fav.url === url);
    
    if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        showNotification('Dihapus dari favorit');
    } else {
        // Add to favorites
        favorites.push({ url, name, category });
        showNotification('Ditambahkan ke favorit');
    }
    
    // Save to localStorage
    localStorage.setItem('pdfFavorites', JSON.stringify(favorites));
    
    // Refresh view if in favorites mode
    if (currentView === 'favorites') {
        showFavorites();
    } else {
        renderPDFs(getCurrentPDFs());
    }
}

/* =========================
   CHECK IF FAVORITE
========================= */
function isFavorite(url) {
    return favorites.some(fav => fav.url === url);
}

/* =========================
   GET FAVORITE COUNT
========================= */
function getFavoriteCount() {
    return favorites.length;
}

/* =========================
   CLEAR ALL FAVORITES
========================= */
function clearAllFavorites() {
    if (confirm('Yakin ingin menghapus semua favorit? Tindakan ini tidak bisa dibatalkan.')) {
        favorites = [];
        localStorage.setItem('pdfFavorites', JSON.stringify(favorites));
        showNotification('Semua favorit berhasil dihapus');
        showHome();
    }
}

/* =========================
   EXPORT FAVORITES
========================= */
function exportFavorites() {
    if (favorites.length === 0) {
        showNotification('Tidak ada favorit untuk diekspor', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `favorit-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Favorit berhasil diekspor');
}

/* =========================
   IMPORT FAVORITES
========================= */
function importFavorites(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedFavorites = JSON.parse(e.target.result);
            if (Array.isArray(importedFavorites)) {
                favorites = importedFavorites;
                localStorage.setItem('pdfFavorites', JSON.stringify(favorites));
                showNotification(`${importedFavorites.length} favorit berhasil diimpor`);
                showFavorites();
            } else {
                showNotification('Format file tidak valid', 'error');
            }
        } catch (error) {
            showNotification('Gagal mengimpor file', 'error');
        }
    };
    reader.readAsText(file);
}
