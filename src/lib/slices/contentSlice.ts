import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { newsApi, tmdbApi, mockApi } from '../services/api';
import { recommendationsApi } from '../services/recommendationsApi';
import { socialMediaApi } from '../services/socialMediaApi';

// Define the root state type for proper typing
interface RootState {
  content: ContentState;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  source: string;
  publishedAt: string;
  url: string;
  type: 'news' | 'recommendation' | 'social';
  rating?: number;
  releaseYear?: number;
  recommendationReason?: string;
  author?: string;
  likes?: number;
  retweets?: number;
  comments?: number;
  hashtags?: string[];
}

export interface ContentState {
  items: ContentItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  recommendations: ContentItem[];
  socialPosts: ContentItem[];
  // Cache timestamps to prevent unnecessary API calls
  lastFetched: {
    content: number;
    recommendations: number;
    socialPosts: number;
  };
  // Cache duration in milliseconds (5 minutes)
  cacheDuration: number;
}

const initialState: ContentState = {
  items: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
  recommendations: [],
  socialPosts: [],
  lastFetched: {
    content: 0,
    recommendations: 0,
    socialPosts: 0,
  },
  cacheDuration: 5 * 60 * 1000, // 5 minutes
};

// Smart content fetching with API fallback
export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async ({ categories, page }: { categories: string[]; page: number }) => {
    console.log('Fetching content for categories:', categories, 'page:', page);
    
    try {
      const allContent: ContentItem[] = [];
      
      // Fetch news for non-entertainment categories (RSS feeds - no rate limits)
      const newsCategories = categories.filter(cat => cat !== 'entertainment');
      if (newsCategories.length > 0) {
        try {
          const newsData = await newsApi.fetchNews(newsCategories, page);
          allContent.push(...newsData);
          console.log('RSS news data fetched:', newsData.length, 'articles');
          
          // If RSS returned no data, use mock data for those categories
          if (newsData.length === 0) {
            console.log('RSS returned no data, using mock data for news categories');
            const mockNews = await mockApi.fetchContent(newsCategories, page);
            allContent.push(...mockNews);
          }
        } catch (error) {
          console.warn('RSS API failed, using mock news:', error);
          const mockNews = await mockApi.fetchContent(newsCategories, page);
          allContent.push(...mockNews);
        }
      }
      
      // Fetch movies for entertainment category (TMDB is unlimited)
      if (categories.includes('entertainment')) {
        try {
          console.log('Fetching movies for entertainment category...');
          const movieData = await tmdbApi.fetchMovies(page);
          allContent.push(...movieData);
          console.log('Movie data fetched:', movieData.length, 'movies');
        } catch (error) {
          console.warn('TMDB API failed, using mock movies:', error);
          const mockMovies = await mockApi.fetchContent(['entertainment'], page);
          allContent.push(...mockMovies);
        }
      }
      
      // If we have any content, return it
      if (allContent.length > 0) {
        console.log('Total content fetched:', allContent.length, 'items');
        return allContent;
      }
      
      // Fallback to mock data
      console.log('No content fetched, using mock data as fallback');
      return await mockApi.fetchContent(categories, page);
      
    } catch (error) {
      console.error('Content fetch error:', error);
      return await mockApi.fetchContent(categories, page);
    }
  }
);

// Fetch personalized recommendations with caching
export const fetchRecommendations = createAsyncThunk<
  ContentItem[],
  number | undefined,
  { state: RootState }
>(
  'content/fetchRecommendations',
  async (page = 1, { getState }) => {
    const state = getState();
    const { lastFetched, cacheDuration, recommendations } = state.content;
    
    // Check if we have cached data and it's still valid
    const now = Date.now();
    if (recommendations.length > 0 && (now - lastFetched.recommendations) < cacheDuration) {
      console.log('Using cached recommendations data');
      return recommendations;
    }
    
    console.log('Fetching personalized recommendations, page:', page);
    
    try {
      const recommendations = await recommendationsApi.fetchAllRecommendations(page);
      console.log('Recommendations fetched:', recommendations.length, 'items');
      return recommendations;
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      return [];
    }
  }
);

// Fetch social media posts with caching
export const fetchSocialPosts = createAsyncThunk<
  ContentItem[],
  { hashtag?: string; platform?: 'twitter' | 'instagram' | 'linkedin'; category?: string } | undefined,
  { state: RootState }
>(
  'content/fetchSocialPosts',
  async (params = {}, { getState }) => {
    const { hashtag, platform, category } = params;
    const state = getState();
    const { lastFetched, cacheDuration, socialPosts } = state.content;
    
    // Check if we have cached data and it's still valid (only if no filters applied)
    const now = Date.now();
    if (!hashtag && !platform && !category && socialPosts.length > 0 && (now - lastFetched.socialPosts) < cacheDuration) {
      console.log('Using cached social posts data');
      return socialPosts;
    }
    
    console.log('Fetching social media posts:', { hashtag, platform, category });
    
    try {
      let socialPosts: ContentItem[] = [];
      
      if (hashtag) {
        // Fetch posts by hashtag
        socialPosts = await socialMediaApi.fetchPostsByHashtag(hashtag, platform);
      } else if (category) {
        // Fetch trending posts by category
        socialPosts = await socialMediaApi.fetchTrendingPosts(category);
      } else {
        // Fetch all trending posts
        socialPosts = await socialMediaApi.fetchTrendingPosts();
      }
      
      console.log('Social posts fetched:', socialPosts.length, 'items');
      return socialPosts;
    } catch (error) {
      console.error('Failed to fetch social posts:', error);
      return [];
    }
  }
);

// Search content with API fallback
export const searchContent = createAsyncThunk(
  'content/searchContent',
  async ({ query, page }: { query: string; page: number }) => {
    try {
      // Try to search news
      const newsResults = await newsApi.searchNews(query, page);
      
      // Try to search movies
      let movieResults: ContentItem[] = [];
      try {
        movieResults = await tmdbApi.searchMovies(query, page);
      } catch {
        console.warn('TMDB search not available');
      }
      
      // Try to search social media
      const socialResults = await socialMediaApi.searchPosts(query);
      
      // Combine results
      const allResults = [...newsResults, ...movieResults, ...socialResults];
      
      if (allResults.length > 0) {
        return allResults;
      }
      
      // Fallback to mock search
      return await mockApi.searchContent(query);
      
    } catch (error) {
      console.log('Search API error, falling back to mock data:', error);
      return await mockApi.searchContent(query);
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    clearContent: (state) => {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
    },
    clearRecommendations: (state) => {
      state.recommendations = [];
    },
    clearSocialPosts: (state) => {
      state.socialPosts = [];
    },
    addToFavorites: () => {
      // This will be handled by favorites slice
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch content
      .addCase(fetchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.loading = false;
        if (state.page === 1) {
          state.items = action.payload;
        } else {
          state.items.push(...action.payload);
        }
        state.hasMore = action.payload.length > 0;
        state.page += 1;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch content';
      })
      
      // Fetch recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
        state.lastFetched.recommendations = Date.now();
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recommendations';
      })
      
      // Fetch social posts
      .addCase(fetchSocialPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocialPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.socialPosts = action.payload;
        state.lastFetched.socialPosts = Date.now();
      })
      .addCase(fetchSocialPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch social posts';
      })
      
      // Search content
      .addCase(searchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hasMore = false; // Search results don't support infinite scroll
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search content';
      });
  },
});

export const { clearContent, clearRecommendations, clearSocialPosts, addToFavorites } = contentSlice.actions;
export default contentSlice.reducer; 