import { ContentItem } from '../slices/contentSlice';
import { spotifyApi } from './spotifyApi';

// Mock user preferences for recommendations
const userPreferences = {
  genres: ['action', 'drama', 'comedy', 'sci-fi'],
  musicGenres: ['pop', 'rock', 'electronic', 'hip-hop'],
  interests: ['technology', 'sports', 'travel', 'food'],
  watchHistory: ['The Matrix', 'Inception', 'Interstellar', 'Mad Max'],
  listenHistory: ['Dua Lipa', 'The Weeknd', 'Daft Punk', 'Kendrick Lamar']
};

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export interface MovieRecommendation {
  id: string;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  type: 'movie';
}

export interface MusicRecommendation {
  id: string;
  name: string;
  artist: string;
  album: string;
  album_cover: string;
  duration: number;
  popularity: number;
  genres: string[];
  type: 'music';
}

export interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  source: string;
  publishedAt: string;
  url: string;
  type: 'recommendation';
  rating?: number;
  recommendationReason: string;
}

class RecommendationsApi {
  // Movie Recommendations using TMDB
  async fetchMovieRecommendations(page: number = 1): Promise<ContentItem[]> {
    try {
      if (!TMDB_API_KEY) {
        throw new Error('TMDB API key not configured');
      }

      // Get user's preferred genres
      const genreIds = await this.getGenreIds(userPreferences.genres);
      
      // Fetch recommendations based on user's watch history (limit to 2 movies for performance)
      const recommendations: ContentItem[] = [];
      
      for (const movieTitle of userPreferences.watchHistory.slice(0, 2)) {
        try {
          // Search for the movie to get its ID
          const searchResponse = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}&page=1`
          );
          
          if (!searchResponse.ok) continue;
          
          const searchData = await searchResponse.json();
          if (searchData.results && searchData.results.length > 0) {
            const movieId = searchData.results[0].id;
            
            // Get recommendations based on this movie
            const recResponse = await fetch(
              `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`
            );
            
            if (recResponse.ok) {
              const recData = await recResponse.json();
              const movieRecs = recData.results.slice(0, 3).map((movie: MovieRecommendation, index: number) => ({
                id: `movie-${movie.id}-${Date.now()}-${index}`,
                title: movie.title,
                description: movie.overview,
                imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.jpg',
                category: 'entertainment',
                source: 'TMDB',
                publishedAt: movie.release_date,
                url: `https://www.themoviedb.org/movie/${movie.id}`,
                type: 'recommendation' as const,
                rating: movie.vote_average,
                releaseYear: new Date(movie.release_date).getFullYear(),
                recommendationReason: `Because you liked ${movieTitle}`
              }));
              
              recommendations.push(...movieRecs);
            }
          }
        } catch (error) {
          console.warn(`Failed to get recommendations for ${movieTitle}:`, error);
        }
      }
      
      // Also fetch popular movies in user's preferred genres (limit to 1 genre for performance)
      for (const genreId of genreIds.slice(0, 1)) {
        try {
          const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&language=en-US`
          );
          
          if (response.ok) {
            const data = await response.json();
            const genreRecs = data.results.slice(0, 2).map((movie: MovieRecommendation, index: number) => ({
              id: `movie-genre-${movie.id}-${Date.now()}-${index}`,
              title: movie.title,
              description: movie.overview,
              imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.jpg',
              category: 'entertainment',
              source: 'TMDB',
              publishedAt: movie.release_date,
              url: `https://www.themoviedb.org/movie/${movie.id}`,
              type: 'recommendation' as const,
              rating: movie.vote_average,
              releaseYear: new Date(movie.release_date).getFullYear(),
              recommendationReason: `Popular in your favorite genres`
            }));
            
            recommendations.push(...genreRecs);
          }
        } catch (error) {
          console.warn(`Failed to get genre recommendations for ${genreId}:`, error);
        }
      }
      
      return recommendations;
      
    } catch (error) {
      console.error('Failed to fetch movie recommendations:', error);
      return this.getMockMovieRecommendations();
    }
  }

  // Music Recommendations using Real Spotify API
  async fetchMusicRecommendations(): Promise<ContentItem[]> {
    try {
      // Initialize Spotify API
      const isInitialized = await spotifyApi.initialize();
      
      if (!isInitialized) {
        console.log('Spotify not authenticated, returning mock data');
        return this.getMockMusicRecommendations();
      }

      // Get personalized music recommendations from Spotify
      const spotifyRecommendations = await spotifyApi.getMusicRecommendations();
      
      if (spotifyRecommendations.length > 0) {
        return spotifyRecommendations;
      }

      // Fallback to new releases if no personalized recommendations
      const newReleases = await spotifyApi.getNewReleasesMusic();
      if (newReleases.length > 0) {
        return newReleases;
      }

      // Final fallback to mock data
      return this.getMockMusicRecommendations();
      
    } catch (error) {
      console.error('Failed to fetch music recommendations:', error);
      return this.getMockMusicRecommendations();
    }
  }

  // Get recently played music from Spotify
  async fetchRecentlyPlayedMusic(): Promise<ContentItem[]> {
    try {
      const isInitialized = await spotifyApi.initialize();
      
      if (!isInitialized) {
        return [];
      }

      return await spotifyApi.getRecentlyPlayedMusic();
    } catch (error) {
      console.error('Failed to fetch recently played music:', error);
      return [];
    }
  }

  // Search music using Spotify API
  async searchMusic(query: string): Promise<ContentItem[]> {
    try {
      const isInitialized = await spotifyApi.initialize();
      
      if (!isInitialized) {
        return [];
      }

      return await spotifyApi.searchMusic(query);
    } catch (error) {
      console.error('Failed to search music:', error);
      return [];
    }
  }

  // Check if Spotify is authenticated
  isSpotifyAuthenticated(): boolean {
    return spotifyApi.isAuthenticated();
  }

  // Initialize Spotify authentication
  async initializeSpotify(): Promise<boolean> {
    return await spotifyApi.initialize();
  }

  // Content Recommendations based on user interests
  async fetchContentRecommendations(): Promise<ContentItem[]> {
    try {
      const mockContentData = [
        {
          id: `content-1-${Date.now()}`,
          title: 'The Future of AI in 2024',
          description: 'Exploring the latest developments in artificial intelligence and machine learning.',
          imageUrl: 'https://via.placeholder.com/400x250/667eea/ffffff?text=AI+Future',
          category: 'technology',
          source: 'Tech Insights',
          publishedAt: new Date().toISOString(),
          url: '#',
          type: 'recommendation' as const,
          recommendationReason: 'Based on your technology interests'
        },
        {
          id: `content-2-${Date.now()}`,
          title: 'Best Travel Destinations for 2024',
          description: 'Discover the most exciting travel destinations and hidden gems around the world.',
          imageUrl: 'https://via.placeholder.com/400x250/764ba2/ffffff?text=Travel',
          category: 'travel',
          source: 'Travel Weekly',
          publishedAt: new Date().toISOString(),
          url: '#',
          type: 'recommendation' as const,
          recommendationReason: 'Matches your travel interests'
        },
        {
          id: `content-3-${Date.now()}`,
          title: 'Ultimate Food Guide: Street Food Around the World',
          description: 'A comprehensive guide to the best street food experiences globally.',
          imageUrl: 'https://via.placeholder.com/400x250/f093fb/ffffff?text=Food',
          category: 'food',
          source: 'Culinary Adventures',
          publishedAt: new Date().toISOString(),
          url: '#',
          type: 'recommendation' as const,
          recommendationReason: 'Based on your food preferences'
        }
      ];

      return mockContentData;
      
    } catch (error) {
      console.error('Failed to fetch content recommendations:', error);
      return [];
    }
  }

  // Get all recommendations
  async fetchAllRecommendations(page: number = 1): Promise<ContentItem[]> {
    // Reduced delay for better performance
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const timestamp = Date.now();
    const allRecommendations = [];

    try {
      const [movies, music, content] = await Promise.all([
        this.fetchMovieRecommendations(page),
        this.fetchMusicRecommendations(),
        this.fetchContentRecommendations()
      ]);

      // Combine and shuffle recommendations
      allRecommendations.push(...movies, ...music, ...content);
      return this.shuffleArray(allRecommendations);
      
    } catch (error) {
      console.error('Failed to fetch all recommendations:', error);
      return [];
    }
  }

  // Helper method to get genre IDs from genre names
  private async getGenreIds(genreNames: string[]): Promise<number[]> {
    try {
      if (!TMDB_API_KEY) return [];
      
      const response = await fetch(
        `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
      );
      
      if (response.ok) {
        const data = await response.json();
        const genreMap = new Map(data.genres.map((genre: { name: string; id: number }) => [genre.name.toLowerCase(), genre.id]));
        
        return genreNames
          .map(name => genreMap.get(name))
          .filter((id): id is number => id !== undefined);
      }
      
      return [];
    } catch (error) {
      console.warn('Failed to get genre IDs:', error);
      return [];
    }
  }

  // Mock movie recommendations fallback
  private getMockMovieRecommendations(): ContentItem[] {
    return [
      {
        id: `mock-movie-1-${Date.now()}`,
        title: 'The Matrix Resurrections',
        description: 'Return to the world of The Matrix in this thrilling sequel.',
        imageUrl: 'https://via.placeholder.com/400x250/000000/00ff00?text=Matrix',
        category: 'entertainment',
        source: 'Mock TMDB',
        publishedAt: '2021-12-22',
        url: '#',
        type: 'recommendation',
        rating: 8.5,
        releaseYear: 2021,
        recommendationReason: 'Because you liked The Matrix'
      },
      {
        id: `mock-movie-2-${Date.now()}`,
        title: 'Dune: Part Two',
        description: 'The epic conclusion to Denis Villeneuve\'s adaptation of Frank Herbert\'s classic.',
        imageUrl: 'https://via.placeholder.com/400x250/8b4513/ffffff?text=Dune',
        category: 'entertainment',
        source: 'Mock TMDB',
        publishedAt: '2024-03-01',
        url: '#',
        type: 'recommendation',
        rating: 9.0,
        releaseYear: 2024,
        recommendationReason: 'Similar to your sci-fi preferences'
      }
    ];
  }

  // Mock music recommendations fallback
  private getMockMusicRecommendations(): ContentItem[] {
    return [
      // Hindi Songs
      {
        id: `hindi-1-${Date.now()}`,
        title: 'Tum Hi Ho',
        description: 'Arijit Singh - Aashiqui 2',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2013-04-26',
        url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        type: 'recommendation' as const,
        rating: 9.5,
        recommendationReason: 'Based on your love for romantic songs'
      },
      {
        id: `hindi-2-${Date.now()}`,
        title: 'Kesariya',
        description: 'Arijit Singh, Pritam - Brahmastra',
        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2022-07-17',
        url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
        type: 'recommendation' as const,
        rating: 9.2,
        recommendationReason: 'Similar to your Bollywood music taste'
      },
      {
        id: `hindi-3-${Date.now()}`,
        title: 'Raataan Lambiyan',
        description: 'Jubin Nautiyal, Asees Kaur - Shershaah',
        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2021-08-13',
        url: 'https://open.spotify.com/track/2XU0oxnq2qxCpomAAuJY8K',
        type: 'recommendation' as const,
        rating: 9.0,
        recommendationReason: 'From your patriotic songs playlist'
      },
      {
        id: `hindi-4-${Date.now()}`,
        title: 'Chaleya',
        description: 'Arijit Singh, Shilpa Rao - Jawan',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2023-09-07',
        url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        type: 'recommendation' as const,
        rating: 9.3,
        recommendationReason: 'Latest Bollywood romantic track'
      },
      
      // Telugu Songs
      {
        id: `telugu-1-${Date.now()}`,
        title: 'Naatu Naatu',
        description: 'M.M. Keeravani, Rahul Sipligunj - RRR',
        imageUrl: 'https://images.unsplash.com/photo-1489599839928-6735c77f5536?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2022-03-24',
        url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        type: 'recommendation' as const,
        rating: 9.8,
        recommendationReason: 'Oscar-winning Telugu folk song'
      },
      {
        id: `telugu-2-${Date.now()}`,
        title: 'Saami Saami',
        description: 'Mounika Yadav - Pushpa: The Rise',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2021-12-17',
        url: 'https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m',
        type: 'recommendation' as const,
        rating: 9.1,
        recommendationReason: 'Trending Telugu folk fusion'
      },
      {
        id: `telugu-3-${Date.now()}`,
        title: 'Srivalli',
        description: 'Sid Sriram - Pushpa: The Rise',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2021-12-17',
        url: 'https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m',
        type: 'recommendation' as const,
        rating: 9.3,
        recommendationReason: 'Melodious Telugu romantic song'
      },
      
      // Tamil Songs
      {
        id: `tamil-1-${Date.now()}`,
        title: 'Kaavaalaa',
        description: 'Shilpa Rao, Anirudh Ravichander - Jailer',
        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2023-07-28',
        url: 'https://open.spotify.com/track/32OlwWuMpZ6b0aN2RZOeMS',
        type: 'recommendation' as const,
        rating: 9.4,
        recommendationReason: 'Viral Tamil dance number'
      },
      {
        id: `tamil-2-${Date.now()}`,
        title: 'Pathala Pathala',
        description: 'Kamal Haasan, Shankar Mahadevan - Vikram',
        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2022-05-16',
        url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
        type: 'recommendation' as const,
        rating: 9.0,
        recommendationReason: 'Action-packed Tamil thriller song'
      },
      {
        id: `tamil-3-${Date.now()}`,
        title: 'Hukum - Thalaivar',
        description: 'Anirudh Ravichander - Jailer',
        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2023-07-28',
        url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        type: 'recommendation' as const,
        rating: 9.6,
        recommendationReason: 'Rajinikanth tribute song'
      },
      
      // English Songs (for variety)
      {
        id: `english-1-${Date.now()}`,
        title: 'Blinding Lights',
        description: 'The Weeknd - After Hours',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2020-03-20',
        url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
        type: 'recommendation' as const,
        rating: 9.2,
        recommendationReason: 'Based on your love for The Weeknd'
      },
      {
        id: `english-2-${Date.now()}`,
        title: 'Shape of You',
        description: 'Ed Sheeran - ÷ (Divide)',
        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop&crop=center',
        category: 'music',
        source: 'Spotify',
        publishedAt: '2017-01-06',
        url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
        type: 'recommendation' as const,
        rating: 9.0,
        recommendationReason: 'Global pop sensation'
      }
    ];
  }

  // Helper method to shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const recommendationsApi = new RecommendationsApi(); 