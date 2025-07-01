import { rssApi } from './rssApi';

// API configuration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

// Cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Cache helper functions
const getCacheKey = (endpoint: string, params: Record<string, unknown>) => {
  return `${endpoint}-${JSON.stringify(params)}`;
};

const getFromCache = (key: string) => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCache = (key: string, data: unknown) => {
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// TMDB Movie type
interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path?: string;
  release_date: string;
  vote_average: number;
}

// News API service (now using RSS feeds)
export const newsApi = {
  async fetchNews(categories: string[], page: number = 1) {
    try {
      // Check cache first
      const cacheKey = getCacheKey('rss-news', { categories, page });
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        console.log('Using cached RSS news data');
        return cachedData;
      }

      // Fetch news from RSS feeds
      const newsData = await rssApi.fetchNews(categories);
      
      // Cache the results
      setCache(cacheKey, newsData);
      console.log('RSS news data cached for 30 minutes');

      return newsData;
    } catch (error) {
      console.error('RSS API error:', error);
      // Fallback to mock data
      console.log('Falling back to mock data due to RSS error');
      return mockApi.fetchContent(categories, page);
    }
  },

  async searchNews(query: string, page: number = 1) {
    try {
      // Check cache first
      const cacheKey = getCacheKey('rss-search', { query, page });
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        console.log('Using cached RSS search results');
        return cachedData;
      }

      // Search RSS feeds
      const searchResults = await rssApi.searchNews(query);
      
      // Cache the results
      setCache(cacheKey, searchResults);
      console.log('RSS search results cached for 30 minutes');

      return searchResults;
    } catch (error) {
      console.error('RSS search error:', error);
      return mockApi.searchContent(query);
    }
  }
};

// TMDB API service
export const tmdbApi = {
  async fetchMovies(page: number = 1) {
    if (!TMDB_API_KEY) {
      console.warn('TMDB API key not configured, using mock data');
      return mockApi.fetchContent(['entertainment'], page);
    }

    try {
      console.log('Fetching Telugu and English movies from TMDB...');
      // Fetch Telugu movies
      const teluguRes = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=te&page=${page}&language=te-IN`
      );
      // Fetch English movies
      const englishRes = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&page=${page}&language=en-US`
      );

      if (!teluguRes.ok && !englishRes.ok) {
        const errorText = await teluguRes.text() + ' | ' + await englishRes.text();
        console.error('TMDB API error:', teluguRes.status, englishRes.status, errorText);
        console.log('Falling back to mock data due to TMDB API error');
        return mockApi.fetchContent(['entertainment'], page);
      }

      const teluguData = teluguRes.ok ? await teluguRes.json() : { results: [] };
      const englishData = englishRes.ok ? await englishRes.json() : { results: [] };

      // Generate a unique batch timestamp for this movie fetch
      const batchTimestamp = Date.now();

      const teluguMovies = teluguData.results.map((movie: TMDBMovie, index: number) => ({
        id: `movie-te-${batchTimestamp}-${page}-${index}`,
        title: movie.title,
        description: movie.overview || 'No description available',
        imageUrl: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'https://images.unsplash.com/photo-1489599837791-8b0c4c0b0b0b?w=400',
        category: 'entertainment',
        source: 'TMDB',
        publishedAt: movie.release_date,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        type: 'recommendation' as const,
        rating: movie.vote_average,
        releaseYear: new Date(movie.release_date).getFullYear(),
      }));

      const englishMovies = englishData.results.map((movie: TMDBMovie, index: number) => ({
        id: `movie-en-${batchTimestamp}-${page}-${index}`,
        title: movie.title,
        description: movie.overview || 'No description available',
        imageUrl: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'https://images.unsplash.com/photo-1489599837791-8b0c4c0b0b0b?w=400',
        category: 'entertainment',
        source: 'TMDB',
        publishedAt: movie.release_date,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        type: 'recommendation' as const,
        rating: movie.vote_average,
        releaseYear: new Date(movie.release_date).getFullYear(),
      }));

      // Combine and return both
      const movies = [...teluguMovies, ...englishMovies];
      console.log('Processed Telugu and English movies:', movies);
      return movies;
    } catch (error) {
      console.error('TMDB API error:', error);
      return mockApi.fetchContent(['entertainment'], page);
    }
  },

  async searchMovies(query: string, page: number = 1) {
    if (!TMDB_API_KEY) {
      console.warn('TMDB API key not configured, using mock data');
      return mockApi.searchContent(query);
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`
      );
      
      if (!response.ok) {
        console.log('Falling back to mock data due to TMDB API error');
        return mockApi.searchContent(query);
      }
      
      const data = await response.json();
      
      // Generate a unique batch timestamp for this search
      const batchTimestamp = Date.now();
      
      return data.results.map((movie: TMDBMovie, index: number) => ({
        id: `movie-search-${batchTimestamp}-${page}-${index}`,
        title: movie.title,
        description: movie.overview || 'No description available',
        imageUrl: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'https://images.unsplash.com/photo-1489599837791-8b0c4c0b0b0b?w=400',
        category: 'entertainment',
        source: 'TMDB',
        publishedAt: movie.release_date,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        type: 'recommendation' as const,
        rating: movie.vote_average,
        releaseYear: new Date(movie.release_date).getFullYear(),
      }));
    } catch (error) {
      console.error('TMDB search error:', error);
      return mockApi.searchContent(query);
    }
  }
};

// Fallback mock data for when APIs are not configured
export const mockApi = {
  async fetchContent(categories: string[], page: number) {
    // Reduced delay for better performance
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const timestamp = Date.now();
    
    let mockData = [
      // Technology articles
      {
        id: `mock-tech-1`,
        title: 'Latest Tech Trends in 2024',
        description: 'Discover the most exciting technology trends that will shape the future.',
        imageUrl: 'https://picsum.photos/400/300?random=100',
        category: 'technology',
        source: 'Tech News',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-tech-2`,
        title: 'AI Breakthroughs This Week',
        description: 'Latest developments in artificial intelligence and machine learning.',
        imageUrl: 'https://picsum.photos/400/300?random=101',
        category: 'technology',
        source: 'AI Weekly',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-tech-3`,
        title: 'Cybersecurity Updates',
        description: 'Important security updates and cyber threat intelligence.',
        imageUrl: 'https://picsum.photos/400/300?random=102',
        category: 'technology',
        source: 'Security Daily',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      
      // Business articles
      {
        id: `mock-business-4`,
        title: 'Business Strategy Insights',
        description: 'Learn from successful business leaders and their strategic approaches.',
        imageUrl: 'https://picsum.photos/400/300?random=103',
        category: 'business',
        source: 'Business Weekly',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-business-5`,
        title: 'Market Analysis Report',
        description: 'Comprehensive analysis of current market trends and opportunities.',
        imageUrl: 'https://picsum.photos/400/300?random=104',
        category: 'business',
        source: 'Market Insights',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-business-6`,
        title: 'Startup Success Stories',
        description: 'Inspiring stories of successful startups and entrepreneurs.',
        imageUrl: 'https://picsum.photos/400/300?random=105',
        category: 'business',
        source: 'Startup Daily',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      
      // Sports articles
      {
        id: `mock-sports-7`,
        title: 'Sports Highlights This Week',
        description: 'Catch up on the latest sports news and highlights from around the world.',
        imageUrl: 'https://picsum.photos/400/300?random=106',
        category: 'sports',
        source: 'Sports Central',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-sports-8`,
        title: 'Championship Finals Preview',
        description: 'Everything you need to know about the upcoming championship matches.',
        imageUrl: 'https://picsum.photos/400/300?random=107',
        category: 'sports',
        source: 'Sports Weekly',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-sports-9`,
        title: 'Athlete of the Month',
        description: 'Meet the outstanding athlete who dominated this month\'s competitions.',
        imageUrl: 'https://picsum.photos/400/300?random=108',
        category: 'sports',
        source: 'Athlete Spotlight',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      
      // News articles
      {
        id: `mock-news-10`,
        title: 'Breaking News Update',
        description: 'Latest breaking news from around the world.',
        imageUrl: 'https://picsum.photos/400/300?random=109',
        category: 'news',
        source: 'World News',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-news-11`,
        title: 'Global Events Roundup',
        description: 'Comprehensive coverage of major global events and developments.',
        imageUrl: 'https://picsum.photos/400/300?random=110',
        category: 'news',
        source: 'Global News',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-news-12`,
        title: 'Weather and Climate News',
        description: 'Latest updates on weather patterns and climate change developments.',
        imageUrl: 'https://picsum.photos/400/300?random=111',
        category: 'news',
        source: 'Weather Central',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      
      // Entertainment articles
      {
        id: `mock-entertainment-13`,
        title: 'Entertainment Industry Updates',
        description: 'Stay updated with the latest news from the entertainment world.',
        imageUrl: 'https://picsum.photos/400/300?random=112',
        category: 'entertainment',
        source: 'Entertainment Daily',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-entertainment-14`,
        title: 'Movie Reviews and Previews',
        description: 'Latest movie reviews and upcoming film previews.',
        imageUrl: 'https://picsum.photos/400/300?random=113',
        category: 'entertainment',
        source: 'Movie Central',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `mock-entertainment-15`,
        title: 'Celebrity News and Gossip',
        description: 'Latest celebrity news, interviews, and behind-the-scenes stories.',
        imageUrl: 'https://picsum.photos/400/300?random=114',
        category: 'entertainment',
        source: 'Celebrity Weekly',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      }
    ];

    // Ensure all IDs are unique by appending timestamp and index
    mockData = mockData.map((item, idx) => ({
      ...item,
      id: `${item.id}-${timestamp}-${idx}`
    }));

    // Filter by requested categories
    const filteredData = mockData.filter(item => 
      categories.includes(item.category)
    );

    // Add some variety based on page number
    const pageOffset = (page - 1) * 8;
    return filteredData.slice(pageOffset, pageOffset + 8);
  },

  async searchContent(query: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const timestamp = Date.now();
    
    // All available mock data for searching
    const allMockData = [
      // Technology articles
      {
        id: `tech-${timestamp}-1`,
        title: 'Latest Tech Trends in 2024',
        description: 'Discover the most exciting technology trends that will shape the future.',
        imageUrl: 'https://picsum.photos/400/300?random=100',
        category: 'technology',
        source: 'Tech News',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `tech-${timestamp}-2`,
        title: 'AI Breakthroughs This Week',
        description: 'Latest developments in artificial intelligence and machine learning.',
        imageUrl: 'https://picsum.photos/400/300?random=101',
        category: 'technology',
        source: 'AI Weekly',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `tech-${timestamp}-3`,
        title: 'Cybersecurity Updates',
        description: 'Important security updates and cyber threat intelligence.',
        imageUrl: 'https://picsum.photos/400/300?random=102',
        category: 'technology',
        source: 'Security Daily',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `tech-${timestamp}-4`,
        title: 'Blockchain Technology Revolution',
        description: 'How blockchain is transforming various industries and creating new opportunities.',
        imageUrl: 'https://picsum.photos/400/300?random=115',
        category: 'technology',
        source: 'Blockchain Weekly',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `tech-${timestamp}-5`,
        title: 'Cloud Computing Solutions',
        description: 'Latest developments in cloud technology and infrastructure.',
        imageUrl: 'https://picsum.photos/400/300?random=116',
        category: 'technology',
        source: 'Cloud Tech',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      
      // Business articles
      {
        id: `business-${timestamp}-4`,
        title: 'Business Strategy Insights',
        description: 'Learn from successful business leaders and their strategic approaches.',
        imageUrl: 'https://picsum.photos/400/300?random=103',
        category: 'business',
        source: 'Business Weekly',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `business-${timestamp}-5`,
        title: 'Market Analysis Report',
        description: 'Comprehensive analysis of current market trends and opportunities.',
        imageUrl: 'https://picsum.photos/400/300?random=104',
        category: 'business',
        source: 'Market Insights',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `business-${timestamp}-6`,
        title: 'Startup Success Stories',
        description: 'Inspiring stories of successful startups and entrepreneurs.',
        imageUrl: 'https://picsum.photos/400/300?random=105',
        category: 'business',
        source: 'Startup Daily',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      
      // Sports articles
      {
        id: `sports-${timestamp}-7`,
        title: 'Sports Highlights This Week',
        description: 'Catch up on the latest sports news and highlights from around the world.',
        imageUrl: 'https://picsum.photos/400/300?random=106',
        category: 'sports',
        source: 'Sports Central',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `sports-${timestamp}-8`,
        title: 'Championship Finals Preview',
        description: 'Everything you need to know about the upcoming championship matches.',
        imageUrl: 'https://picsum.photos/400/300?random=107',
        category: 'sports',
        source: 'Sports Weekly',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `sports-${timestamp}-9`,
        title: 'Athlete of the Month',
        description: 'Meet the outstanding athlete who dominated this month\'s competitions.',
        imageUrl: 'https://picsum.photos/400/300?random=108',
        category: 'sports',
        source: 'Athlete Spotlight',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      
      // News articles
      {
        id: `news-${timestamp}-10`,
        title: 'Breaking News Update',
        description: 'Latest breaking news from around the world.',
        imageUrl: 'https://picsum.photos/400/300?random=109',
        category: 'news',
        source: 'World News',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `news-${timestamp}-11`,
        title: 'Global Events Roundup',
        description: 'Comprehensive coverage of major global events and developments.',
        imageUrl: 'https://picsum.photos/400/300?random=110',
        category: 'news',
        source: 'Global News',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `news-${timestamp}-12`,
        title: 'Weather and Climate News',
        description: 'Latest updates on weather patterns and climate change developments.',
        imageUrl: 'https://picsum.photos/400/300?random=111',
        category: 'news',
        source: 'Weather Central',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      
      // Entertainment articles
      {
        id: `entertainment-${timestamp}-13`,
        title: 'Entertainment Industry Updates',
        description: 'Stay updated with the latest news from the entertainment world.',
        imageUrl: 'https://picsum.photos/400/300?random=112',
        category: 'entertainment',
        source: 'Entertainment Daily',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `entertainment-${timestamp}-14`,
        title: 'Movie Reviews and Previews',
        description: 'Latest movie reviews and upcoming film previews.',
        imageUrl: 'https://picsum.photos/400/300?random=113',
        category: 'entertainment',
        source: 'Movie Central',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      },
      {
        id: `entertainment-${timestamp}-15`,
        title: 'Celebrity News and Gossip',
        description: 'Latest celebrity news, interviews, and behind-the-scenes stories.',
        imageUrl: 'https://picsum.photos/400/300?random=114',
        category: 'entertainment',
        source: 'Celebrity Weekly',
        publishedAt: new Date().toISOString(),
        url: '#',
        type: 'news' as const,
      }
    ];

    // Search through all mock data
    const searchResults = allMockData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.source.toLowerCase().includes(query.toLowerCase())
    );

    // If no results found, return some relevant content based on the query
    if (searchResults.length === 0) {
      const lowerQuery = query.toLowerCase();
      
      // Technology-related fallbacks
      if (lowerQuery.includes('tech') || lowerQuery.includes('ai') || lowerQuery.includes('cyber') || 
          lowerQuery.includes('blockchain') || lowerQuery.includes('cloud') || lowerQuery.includes('software')) {
        return allMockData.filter(item => item.category === 'technology').slice(0, 3);
      }
      
      // Business-related fallbacks
      if (lowerQuery.includes('business') || lowerQuery.includes('market') || lowerQuery.includes('startup')) {
        return allMockData.filter(item => item.category === 'business').slice(0, 3);
      }
      
      // Sports-related fallbacks
      if (lowerQuery.includes('sport') || lowerQuery.includes('athlete') || lowerQuery.includes('championship')) {
        return allMockData.filter(item => item.category === 'sports').slice(0, 3);
      }
      
      // Entertainment-related fallbacks
      if (lowerQuery.includes('movie') || lowerQuery.includes('celebrity') || lowerQuery.includes('entertainment')) {
        return allMockData.filter(item => item.category === 'entertainment').slice(0, 3);
      }
      
      // General fallback - return a mix of content
      return allMockData.slice(0, 3);
    }

    return searchResults.slice(0, 10); // Limit to 10 results
  }
}; 