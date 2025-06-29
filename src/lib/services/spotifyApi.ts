import { ContentItem } from '../slices/contentSlice';

// Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string;
  spotifyUrl: string;
  duration: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; width: number; height: number }>;
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  images: Array<{ url: string; width: number; height: number }>;
  release_date: string;
  total_tracks: number;
  external_urls: { spotify: string };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: Array<{ url: string; width: number; height: number }>;
  external_urls: { spotify: string };
}

export interface SpotifySearchResult {
  tracks: SpotifyTrack[];
  total: number;
}

class SpotifyApi {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // Initialize Spotify authentication
  async initialize() {
    if (!SPOTIFY_CLIENT_ID) {
      console.warn('Spotify Client ID not configured');
      return false;
    }

    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return true;
    }

    // Try to get token from localStorage
    const storedToken = localStorage.getItem('spotify_access_token');
    const storedExpiry = localStorage.getItem('spotify_token_expiry');
    
    if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
      this.accessToken = storedToken;
      this.tokenExpiry = parseInt(storedExpiry);
      return true;
    }

    // If no valid token, redirect to Spotify auth
    this.redirectToSpotifyAuth();
    return false;
  }

  // Redirect to Spotify authorization
  private redirectToSpotifyAuth() {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(scopes.join(' '))}&show_dialog=true`;

    window.location.href = authUrl;
  }

  // Handle Spotify callback and get access token
  async handleCallback(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      // Store token in localStorage
      if (this.accessToken) {
        localStorage.setItem('spotify_access_token', this.accessToken);
      }
      localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());

      return true;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      return false;
    }
  }

  // Make authenticated request to Spotify API
  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, re-authenticate
        this.accessToken = null;
        this.tokenExpiry = 0;
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
        this.redirectToSpotifyAuth();
        throw new Error('Token expired, please re-authenticate');
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  }

  // Get user's top tracks
  async getTopTracks(limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const data = await this.makeRequest<{ items: SpotifyTrack[] }>(`/me/top/tracks?limit=${limit}&time_range=short_term`);
      return data.items;
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      return [];
    }
  }

  // Get user's recently played tracks
  async getRecentlyPlayed(limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const data = await this.makeRequest<{ items: Array<{ track: SpotifyTrack }> }>(`/me/player/recently-played?limit=${limit}`);
      return data.items.map(item => item.track);
    } catch (error) {
      console.error('Error fetching recently played:', error);
      return [];
    }
  }

  // Get recommendations based on seed tracks
  async getRecommendations(seedTracks: string[], limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const seedTracksParam = seedTracks.slice(0, 5).join(',');
      const data = await this.makeRequest<{ tracks: SpotifyTrack[] }>(`/recommendations?seed_tracks=${seedTracksParam}&limit=${limit}`);
      return data.tracks;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  // Search for tracks
  async searchTracks(query: string, limit: number = 20): Promise<SpotifySearchResult> {
    try {
      const data = await this.makeRequest<{ tracks: { items: SpotifyTrack[]; total: number } }>(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
      const tracks = data.tracks.items;
      return {
        tracks,
        total: data.tracks.total,
      };
    } catch (error) {
      console.error('Error searching tracks:', error);
      return this.getMockTracks(query);
    }
  }

  // Get track details
  async getTrack(trackId: string): Promise<SpotifyTrack | null> {
    try {
      return await this.makeRequest<SpotifyTrack>(`/tracks/${trackId}`);
    } catch (error) {
      console.error('Error fetching track:', error);
      return null;
    }
  }

  // Get artist details
  async getArtist(artistId: string): Promise<SpotifyArtist | null> {
    try {
      return await this.makeRequest<SpotifyArtist>(`/artists/${artistId}`);
    } catch (error) {
      console.error('Error fetching artist:', error);
      return null;
    }
  }

  // Get artist's top tracks
  async getArtistTopTracks(artistId: string): Promise<SpotifyTrack[]> {
    try {
      const data = await this.makeRequest<{ tracks: SpotifyTrack[] }>(`/artists/${artistId}/top-tracks?market=US`);
      return data.tracks;
    } catch (error) {
      console.error('Error fetching artist top tracks:', error);
      return [];
    }
  }

  // Get new releases
  async getNewReleases(limit: number = 20): Promise<SpotifyAlbum[]> {
    try {
      const data = await this.makeRequest<{ albums: { items: SpotifyAlbum[] } }>(`/browse/new-releases?limit=${limit}`);
      return data.albums.items;
    } catch (error) {
      console.error('Error fetching new releases:', error);
      return [];
    }
  }

  // Get featured playlists
  async getFeaturedPlaylists(limit: number = 20): Promise<SpotifyPlaylist[]> {
    try {
      const data = await this.makeRequest<{ playlists: { items: SpotifyPlaylist[] } }>(`/browse/featured-playlists?limit=${limit}`);
      return data.playlists.items;
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
      return [];
    }
  }

  // Convert Spotify track to ContentItem
  private convertTrackToContentItem(track: SpotifyTrack): ContentItem {
    const imageUrl = track.albumArt || '/placeholder-music.jpg';
    const duration = Math.floor(track.duration / 1000 / 60);
    const seconds = Math.floor((track.duration / 1000) % 60);
    const durationFormatted = `${duration}:${seconds.toString().padStart(2, '0')}`;

    return {
      id: `spotify-${track.id}`,
      title: track.name,
      description: `${track.artist} • ${track.album} • ${durationFormatted}`,
      imageUrl,
      category: 'music',
      source: 'Spotify',
      publishedAt: new Date().toISOString(),
      url: track.spotifyUrl,
      type: 'recommendation',
      rating: 8.5, // Default rating
      recommendationReason: `Based on your music preferences`,
      author: track.artist,
      releaseYear: new Date().getFullYear(),
    };
  }

  // Get personalized music recommendations
  async getMusicRecommendations(): Promise<ContentItem[]> {
    try {
      // Try to get user's top tracks first
      let seedTracks: string[] = [];
      
      try {
        const topTracks = await this.getTopTracks(5);
        seedTracks = topTracks.map(track => track.id);
      } catch {
        // If user hasn't authenticated, use popular tracks as seeds
        console.log('User not authenticated, using popular tracks as seeds');
        seedTracks = ['4iV5W9uYEdYUVa79Axb7Rh', '1uNFoZAHBGtllmzznpCI3s', '0V3wPSX9ygBnCm8psDIegu'];
      }

      // Get recommendations based on seed tracks
      const recommendedTracks = await this.getRecommendations(seedTracks, 10);
      
      // Convert to ContentItem format
      return recommendedTracks.map(track => this.convertTrackToContentItem(track));
      
    } catch (error) {
      console.error('Error getting music recommendations:', error);
      return this.getMockMusicRecommendations();
    }
  }

  // Get recently played music
  async getRecentlyPlayedMusic(): Promise<ContentItem[]> {
    try {
      const recentTracks = await this.getRecentlyPlayed(10);
      return recentTracks.map(track => this.convertTrackToContentItem(track));
    } catch (error) {
      console.error('Error getting recently played music:', error);
      return [];
    }
  }

  // Search music
  async searchMusic(query: string): Promise<ContentItem[]> {
    try {
      const searchResult = await this.searchTracks(query, 10);
      return searchResult.tracks.map(track => this.convertTrackToContentItem(track));
    } catch (error) {
      console.error('Error searching music:', error);
      return [];
    }
  }

  // Get new releases as ContentItems
  async getNewReleasesMusic(): Promise<ContentItem[]> {
    try {
      const albums = await this.getNewReleases(10);
      return albums.map(album => ({
        id: `spotify-album-${album.id}`,
        title: album.name,
        description: `${album.artists.map(artist => artist.name).join(', ')} • ${album.total_tracks} tracks • Released ${album.release_date}`,
        imageUrl: album.images.length > 0 ? album.images[0].url : '/placeholder-music.jpg',
        category: 'music',
        source: 'Spotify',
        publishedAt: album.release_date,
        url: album.external_urls.spotify,
        type: 'recommendation',
        recommendationReason: 'New Release',
        author: album.artists.map(artist => artist.name).join(', '),
        releaseYear: new Date(album.release_date).getFullYear(),
      }));
    } catch (error) {
      console.error('Error getting new releases:', error);
      return [];
    }
  }

  // Mock music recommendations fallback
  private getMockMusicRecommendations(): ContentItem[] {
    return [
      // Hindi Songs
      {
        id: 'hindi-1',
        title: 'Tum Hi Ho',
        description: 'Arijit Singh - Aashiqui 2 • 3:53',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2013-04-26',
        url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        type: 'recommendation',
        rating: 9.5,
        recommendationReason: 'Based on your love for romantic songs',
        author: 'Arijit Singh',
        releaseYear: 2013,
      },
      {
        id: 'hindi-2',
        title: 'Kesariya',
        description: 'Arijit Singh, Pritam - Brahmastra • 3:20',
        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2022-07-17',
        url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
        type: 'recommendation',
        rating: 9.2,
        recommendationReason: 'Similar to your Bollywood music taste',
        author: 'Arijit Singh, Pritam',
        releaseYear: 2022,
      },
      {
        id: 'hindi-3',
        title: 'Raataan Lambiyan',
        description: 'Jubin Nautiyal, Asees Kaur - Shershaah • 3:29',
        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2021-08-13',
        url: 'https://open.spotify.com/track/2XU0oxnq2qxCpomAAuJY8K',
        type: 'recommendation',
        rating: 9.0,
        recommendationReason: 'From your patriotic songs playlist',
        author: 'Jubin Nautiyal, Asees Kaur',
        releaseYear: 2021,
      },
      
      // Telugu Songs
      {
        id: 'telugu-1',
        title: 'Naatu Naatu',
        description: 'A high-energy Telugu song from the movie RRR that became a global sensation. Known for its infectious rhythm and dance moves, it won the Oscar for Best Original Song in 2023. The song celebrates friendship and freedom, and its music video features stunning choreography and vibrant visuals.',
        imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2022-03-24',
        url: 'https://open.spotify.com/track/3ZFTkvIE7kyPt6Nu3PEa7V',
        type: 'recommendation',
        rating: 9.8,
        recommendationReason: 'Trending Indian song',
        author: 'M.M. Keeravani, Rahul Sipligunj - RRR',
        releaseYear: 2023,
      },
      {
        id: 'telugu-2',
        title: 'Saami Saami',
        description: 'A vibrant and energetic Telugu song from the movie Pushpa: The Rise, sung by Mounika Yadav. The song is known for its catchy beats and dance moves, and it became a viral sensation on social media. The music video features colorful visuals and dynamic choreography.',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2021-12-17',
        url: 'https://open.spotify.com/track/6L89mwZXSOwYl76YXfX13s',
        type: 'recommendation',
        rating: 9.1,
        recommendationReason: 'Viral Telugu song',
        author: 'Mounika Yadav - Pushpa: The Rise',
        releaseYear: 2021,
      },
      
      // Tamil Songs
      {
        id: 'tamil-1',
        title: 'Kaavaalaa',
        description: 'Shilpa Rao, Anirudh Ravichander - Jailer • 3:10',
        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2023-07-28',
        url: 'https://open.spotify.com/track/32OlwWuMpZ6b0aN2RZOeMS',
        type: 'recommendation',
        rating: 9.4,
        recommendationReason: 'Viral Tamil dance number',
        author: 'Shilpa Rao, Anirudh Ravichander',
        releaseYear: 2023,
      },
      {
        id: 'tamil-2',
        title: 'Hukum - Thalaivar',
        description: 'Anirudh Ravichander - Jailer • 3:28',
        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2023-07-28',
        url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        type: 'recommendation',
        rating: 9.6,
        recommendationReason: 'Rajinikanth tribute song',
        author: 'Anirudh Ravichander',
        releaseYear: 2023,
      },
      
      // English Songs (for variety)
      {
        id: 'english-1',
        title: 'Blinding Lights',
        description: 'The Weeknd - After Hours • 3:20',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2020-03-20',
        url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
        type: 'recommendation',
        rating: 9.2,
        recommendationReason: 'Based on your love for The Weeknd',
        author: 'The Weeknd',
        releaseYear: 2020,
      },
      {
        id: 'english-2',
        title: 'Shape of You',
        description: 'A chart-topping pop song by Ed Sheeran from his album ÷ (Divide). The song blends tropical house and pop, and its catchy melody and relatable lyrics made it a global hit. It spent weeks at the top of the charts and is one of the most-streamed songs on Spotify. The music video features a boxing love story.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2017-01-06',
        url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        type: 'recommendation',
        rating: 9.0,
        recommendationReason: 'Popular global hit',
        author: 'Ed Sheeran - ÷ (Divide)',
        releaseYear: 2017,
      }
    ];
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.accessToken && Date.now() < this.tokenExpiry);
  }

  // Logout (clear tokens)
  logout(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
  }

  // Mock data for when Spotify API is not available
  private getMockTracks(query: string): SpotifySearchResult {
    const mockTracks: SpotifyTrack[] = [
      // Hindi Songs
      {
        id: 'hindi-1',
        name: 'Tum Hi Ho',
        artist: 'Arijit Singh',
        album: 'Aashiqui 2',
        albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        previewUrl: '',
        spotifyUrl: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        duration: 233000,
      },
      {
        id: 'hindi-2',
        name: 'Kesariya',
        artist: 'Arijit Singh, Pritam',
        album: 'Brahmastra',
        albumArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop&crop=center',
        previewUrl: '',
        spotifyUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
        duration: 200000,
      },
      {
        id: 'hindi-3',
        name: 'Raataan Lambiyan',
        artist: 'Jubin Nautiyal, Asees Kaur',
        album: 'Shershaah',
        albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        previewUrl: '',
        spotifyUrl: 'https://open.spotify.com/track/2XU0oxnq2qxCpomAAuJY8K',
        duration: 209000,
      },
      
      // Telugu Songs
      {
        id: 'telugu-1',
        name: 'Naatu Naatu',
        artist: 'M.M. Keeravani, Rahul Sipligunj',
        album: 'RRR',
        albumArt: 'https://images.unsplash.com/photo-1489599839928-6735c77f5536?w=400&h=400&fit=crop&crop=center',
        previewUrl: '',
        spotifyUrl: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        duration: 233000,
      },
      {
        id: 'telugu-2',
        name: 'Saami Saami',
        artist: 'Mounika Yadav',
        album: 'Pushpa: The Rise',
        albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        previewUrl: '',
        spotifyUrl: 'https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m',
        duration: 194000,
      },
      
      // Tamil Songs
      {
        id: 'tamil-1',
        name: 'Kaavaalaa',
        artist: 'Shilpa Rao, Anirudh Ravichander',
        album: 'Jailer',
        albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        previewUrl: '',
        spotifyUrl: 'https://open.spotify.com/track/32OlwWuMpZ6b0aN2RZOeMS',
        duration: 270000,
      },
      {
        id: 'tamil-2',
        name: 'Hukum - Thalaivar',
        artist: 'Anirudh Ravichander',
        album: 'Jailer',
        albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        previewUrl: '',
        spotifyUrl: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        duration: 233000,
      },
      
      // English Songs (for variety)
      {
        id: 'english-1',
        name: 'Shape of You',
        artist: 'Ed Sheeran',
        album: '÷ (Divide)',
        albumArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop&crop=center',
        previewUrl: '',
        spotifyUrl: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        duration: 233000,
      },
      {
        id: 'english-2',
        name: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        previewUrl: '',
        spotifyUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
        duration: 200000,
      },
    ];

    // Filter mock tracks based on query
    const filteredTracks = mockTracks.filter(track =>
      track.name.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase()) ||
      track.album.toLowerCase().includes(query.toLowerCase())
    );

    return {
      tracks: filteredTracks.slice(0, 5),
      total: filteredTracks.length,
    };
  }
}

export const spotifyApi = new SpotifyApi(); 