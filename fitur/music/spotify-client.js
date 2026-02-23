class SpotifyClient {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.accessToken = null;
        this.tokenExpiration = 0;
    }

    async getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiration) {
            return this.accessToken;
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        if (data.access_token) {
            this.accessToken = data.access_token;
            this.tokenExpiration = Date.now() + (data.expires_in * 1000);
            return this.accessToken;
        } else {
            console.error('Failed to get Spotify access token', data);
            return null;
        }
    }

    async searchTracks(query, limit = 20) {
        const token = await this.getAccessToken();
        if (!token) return [];

        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.tracks && data.tracks.items) {
            return data.tracks.items.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(a => a.name).join(', '),
                file: track.preview_url, // Only 30s preview available via API
                image: track.album.images[0]?.url || '',
                duration: '0:30', // Previews are usually 30s
                spotifyUrl: track.external_urls.spotify
            })).filter(track => track.file); // Filter out tracks without preview_url
        }
        return [];
    }

    async getFeaturedPlaylists(limit = 10) {
        const token = await this.getAccessToken();
        if (!token) return [];

        // For now, let's just search for a generic term like "Trending" or "Top Hits" to simulate a playlist
        // because getting specific featured playlists might require more complex logic 
        // regarding locale/country codes which might fail if not set correctly.
        // Let's search for "Trading Motivation" or similar since this is a trading site.
        return this.searchTracks('Trading Motivation', limit);
    }
}
