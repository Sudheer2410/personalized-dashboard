// RSS Feed URLs by category (reduced for better performance)
const RSS_FEEDS = {
  news: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://feeds.reuters.com/reuters/topNews',
  ],
  technology: [
    'https://feeds.feedburner.com/TechCrunch',
    'https://www.wired.com/feed/rss',
  ],
  sports: [
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://www.espn.com/espn/rss/news',
  ],
  entertainment: [
    'https://feeds.feedburner.com/EWcom',
    'https://www.hollywoodreporter.com/feed',
  ],
  business: [
    'https://feeds.reuters.com/reuters/businessNews',
    'https://feeds.bbci.co.uk/news/business/rss.xml',
  ],
};

// Mock RSS data for fallback when external feeds fail
const MOCK_RSS_DATA = {
  news: [
    {
      id: 'mock-news-1',
      title: 'Breaking: Major Tech Breakthrough Announced',
      description: 'Scientists have announced a revolutionary breakthrough in quantum computing technology.',
      imageUrl: 'https://picsum.photos/400/300?random=10',
      category: 'news',
      source: 'Mock News',
      publishedAt: new Date().toISOString(),
      url: '#',
      type: 'news' as const
    },
    {
      id: 'mock-news-2',
      title: 'Global Economic Summit Concludes',
      description: 'World leaders have reached consensus on new economic policies.',
      imageUrl: 'https://picsum.photos/400/300?random=11',
      category: 'news',
      source: 'Mock News',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      url: '#',
      type: 'news' as const
    }
  ],
  technology: [
    {
      id: 'mock-tech-1',
      title: 'AI Revolution: New Developments',
      description: 'Latest developments in artificial intelligence are reshaping industries.',
      imageUrl: 'https://picsum.photos/400/300?random=20',
      category: 'technology',
      source: 'Mock Tech',
      publishedAt: new Date().toISOString(),
      url: '#',
      type: 'news' as const
    },
    {
      id: 'mock-tech-2',
      title: 'Cybersecurity: New Threats Identified',
      description: 'Security experts warn about emerging cyber threats.',
      imageUrl: 'https://picsum.photos/400/300?random=21',
      category: 'technology',
      source: 'Mock Tech',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      url: '#',
      type: 'news' as const
    }
  ],
  sports: [
    {
      id: 'mock-sports-1',
      title: 'Championship Finals: Epic Showdown',
      description: 'The most anticipated sports event of the year is set to begin.',
      imageUrl: 'https://picsum.photos/400/300?random=30',
      category: 'sports',
      source: 'Mock Sports',
      publishedAt: new Date().toISOString(),
      url: '#',
      type: 'news' as const
    },
    {
      id: 'mock-sports-2',
      title: 'Olympic Preparations Underway',
      description: 'Countries prepare for the upcoming Olympic games.',
      imageUrl: 'https://picsum.photos/400/300?random=31',
      category: 'sports',
      source: 'Mock Sports',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      url: '#',
      type: 'news' as const
    }
  ],
  entertainment: [
    {
      id: 'mock-entertainment-1',
      title: 'Blockbuster Movie Breaks Records',
      description: 'The latest blockbuster has shattered box office records worldwide.',
      imageUrl: 'https://picsum.photos/400/300?random=40',
      category: 'entertainment',
      source: 'Mock Entertainment',
      publishedAt: new Date().toISOString(),
      url: '#',
      type: 'news' as const
    },
    {
      id: 'mock-entertainment-2',
      title: 'Music Industry: New Trends',
      description: 'Emerging trends are reshaping the music industry landscape.',
      imageUrl: 'https://picsum.photos/400/300?random=41',
      category: 'entertainment',
      source: 'Mock Entertainment',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      url: '#',
      type: 'news' as const
    }
  ],
  business: [
    {
      id: 'mock-business-1',
      title: 'Stock Market: Record Highs',
      description: 'Major indices reach new all-time highs amid economic optimism.',
      imageUrl: 'https://picsum.photos/400/300?random=50',
      category: 'business',
      source: 'Mock Business',
      publishedAt: new Date().toISOString(),
      url: '#',
      type: 'news' as const
    },
    {
      id: 'mock-business-2',
      title: 'Startup Ecosystem: Innovation Boom',
      description: 'The startup ecosystem is experiencing unprecedented growth.',
      imageUrl: 'https://picsum.photos/400/300?random=51',
      category: 'business',
      source: 'Mock Business',
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
      url: '#',
      type: 'news' as const
    }
  ]
};

// Cache for RSS data (5 minutes cache)
const RSS_CACHE = new Map<string, { data: RSSItem[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// RSS Item type definition
type RSSItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  source: string;
  publishedAt: string;
  url: string;
  type: 'news';
};

// Helper function to extract image URL from RSS item
const extractImageUrl = (item: Element): string | null => {
  // 1. Try to extract from media:content
  const mediaContent = item.querySelector('media\\:content, content');
  if (mediaContent) {
    const url = mediaContent.getAttribute('url');
    if (url && url.startsWith('http')) {
      return url;
    }
  }
  
  // 2. Try to extract from media:thumbnail
  const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
  if (mediaThumbnail) {
    const url = mediaThumbnail.getAttribute('url');
    if (url && url.startsWith('http')) {
      return url;
    }
  }
  
  // 3. Try to extract from enclosure
  const enclosure = item.querySelector('enclosure');
  if (enclosure) {
    const url = enclosure.getAttribute('url');
    const type = enclosure.getAttribute('type');
    if (url && type && type.startsWith('image/') && url.startsWith('http')) {
      return url;
    }
  }
  
  // 4. Try to extract from content (HTML parsing)
  const content = item.querySelector('content\\:encoded, content, description');
  if (content && content.textContent) {
    const imgMatch = content.textContent.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch && imgMatch[1] && imgMatch[1].startsWith('http')) {
      return imgMatch[1];
    }
  }
  
  // 5. Try to extract from description
  const description = item.querySelector('description');
  if (description && description.textContent) {
    const imgMatch = description.textContent.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch && imgMatch[1] && imgMatch[1].startsWith('http')) {
      return imgMatch[1];
    }
  }
  
  // 6. Try to extract from link (some feeds use image URLs as links)
  const link = item.querySelector('link');
  if (link && link.textContent) {
    const url = link.textContent;
    if ((url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg')) && url.startsWith('http')) {
      return url;
    }
  }
  
  return null;
};

// Helper function to get category-specific placeholder images with variety
const getCategoryImage = (category: string, index: number): string => {
  const categoryImages = {
    news: [
      'https://picsum.photos/400/300?random=10',
      'https://picsum.photos/400/300?random=11',
      'https://picsum.photos/400/300?random=12',
      'https://picsum.photos/400/300?random=13',
      'https://picsum.photos/400/300?random=14',
    ],
    technology: [
      'https://picsum.photos/400/300?random=20',
      'https://picsum.photos/400/300?random=21',
      'https://picsum.photos/400/300?random=22',
      'https://picsum.photos/400/300?random=23',
      'https://picsum.photos/400/300?random=24',
    ],
    sports: [
      'https://picsum.photos/400/300?random=30',
      'https://picsum.photos/400/300?random=31',
      'https://picsum.photos/400/300?random=32',
      'https://picsum.photos/400/300?random=33',
      'https://picsum.photos/400/300?random=34',
    ],
    entertainment: [
      'https://picsum.photos/400/300?random=40',
      'https://picsum.photos/400/300?random=41',
      'https://picsum.photos/400/300?random=42',
      'https://picsum.photos/400/300?random=43',
      'https://picsum.photos/400/300?random=44',
    ],
    business: [
      'https://picsum.photos/400/300?random=50',
      'https://picsum.photos/400/300?random=51',
      'https://picsum.photos/400/300?random=52',
      'https://picsum.photos/400/300?random=53',
      'https://picsum.photos/400/300?random=54',
    ],
  };
  
  const images = categoryImages[category as keyof typeof categoryImages] || categoryImages.news;
  return images[index % images.length];
};

// Helper function to fetch RSS with timeout (reduced timeout for better performance)
const fetchWithTimeout = async (url: string, timeout: number = 3000): Promise<{ items: RSSItem[] }> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSSReader/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('XML parsing error');
    }

    const items = xmlDoc.querySelectorAll('item');
    const rssItems: RSSItem[] = [];

    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const description = item.querySelector('description')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '#';
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || new Date().toISOString();
      
      // Extract image URL
      const imageUrl = extractImageUrl(item) || getCategoryImage(category, index);
      
      if (title && description) {
        rssItems.push({
          id: `rss-${Date.now()}-${index}`,
          title,
          description,
          imageUrl,
          category,
          source: 'RSS Feed',
          publishedAt: pubDate,
          url: link,
          type: 'news'
        });
      }
    });

    return { items: rssItems };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Failed to fetch RSS from ${url}:`, error);
    throw error;
  }
};

// Utility to ensure unique IDs for all mock RSS data items
function getUniqueMockRssData(category: string): RSSItem[] {
  const timestamp = Date.now();
  const baseData = MOCK_RSS_DATA[category as keyof typeof MOCK_RSS_DATA] || [];
  return baseData.map((item: RSSItem, idx: number) => ({
    ...item,
    id: `${item.id}-${timestamp}-${idx}`
  }));
}

// RSS API service
export const rssApi = {
  async fetchNews(categories: string[]): Promise<RSSItem[]> {
    try {
      // Check cache first
      const cacheKey = `news-${categories.sort().join('-')}`;
      const cached = RSS_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached RSS data');
        return cached.data;
      }

      const allNews: RSSItem[] = [];
      let hasSuccessfulFeeds = false;
      
      // Try to fetch from external feeds first
      const feedPromises: Promise<void>[] = [];
      
      for (const category of categories) {
        const feeds = RSS_FEEDS[category as keyof typeof RSS_FEEDS] || [];
        
        for (const feed of feeds) {
          const promise = fetchWithTimeout(feed)
            .then(items => {
              if (items.items.length > 0) {
                hasSuccessfulFeeds = true;
                const categoryItems = items.items.map((item: RSSItem) => ({
                  ...item,
                  category: category
                }));
                allNews.push(...categoryItems);
              }
            })
            .catch(error => {
              console.warn(`Failed to fetch RSS feed ${feed}:`, error);
            });
          
          feedPromises.push(promise);
        }
      }
      
      // Wait for all feeds to complete (with timeout)
      await Promise.allSettled(feedPromises);
      
      // If no external feeds worked, use mock data
      if (!hasSuccessfulFeeds) {
        console.log('All external RSS feeds failed, using mock data');
        for (const category of categories) {
          const mockData = getUniqueMockRssData(category);
          allNews.push(...mockData);
        }
      }
      
      // Sort by date and return unique items
      const result = rssApi.removeDuplicates(allNews)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 20); // Limit to 20 items for better performance
      
      // Cache the result
      RSS_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
        
    } catch (error) {
      console.error('Failed to fetch RSS news, using mock data:', error);
      // Return mock data as final fallback
      const mockNews: RSSItem[] = [];
      for (const category of categories) {
        const mockData = getUniqueMockRssData(category);
        mockNews.push(...mockData);
      }
      return mockNews.slice(0, 20);
    }
  },

  async searchNews(query: string): Promise<RSSItem[]> {
    try {
      // Check cache first
      const cacheKey = `search-${query}`;
      const cached = RSS_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached search results');
        return cached.data;
      }

      const allFeeds = Object.values(RSS_FEEDS).flat();
      const allNews: RSSItem[] = [];
      let hasSuccessfulFeeds = false;
      
      // Try to fetch from external feeds first
      const feedPromises = allFeeds.map(feed => 
        fetchWithTimeout(feed)
          .then(items => {
            if (items.items.length > 0) {
              hasSuccessfulFeeds = true;
              const matchingItems = items.items.filter((item: RSSItem) => 
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
              );
              const categoryItems = matchingItems.map((item: RSSItem) => ({
                ...item,
                category: Object.keys(RSS_FEEDS).find(category => RSS_FEEDS[category as keyof typeof RSS_FEEDS].includes(feed)) || 'Unknown'
              }));
              allNews.push(...categoryItems);
            }
          })
          .catch(error => {
            console.warn(`Failed to search RSS feed ${feed}:`, error);
          })
      );
      
      await Promise.allSettled(feedPromises);
      
      // If no external feeds worked, search in mock data
      if (!hasSuccessfulFeeds) {
        console.log('All external RSS feeds failed, searching mock data');
        const allMockData = Object.keys(MOCK_RSS_DATA)
          .map(category => getUniqueMockRssData(category))
          .flat();
        const matchingMockItems = allMockData.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        );
        allNews.push(...matchingMockItems);
      }
      
      const result = rssApi.removeDuplicates(allNews)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 15); // Limit search results
      
      // Cache the result
      RSS_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
        
    } catch (error) {
      console.error('Failed to search RSS news, using mock data:', error);
      // Return mock data as final fallback
      const allMockData = Object.keys(MOCK_RSS_DATA)
        .map(category => getUniqueMockRssData(category))
        .flat();
      const matchingMockItems = allMockData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );
      return matchingMockItems.slice(0, 15);
    }
  },

  removeDuplicates(items: RSSItem[]): RSSItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = `${item.title}-${item.publishedAt}`;
      if (seen.has(key)) {
        return false;
      } else {
        seen.add(key);
        return true;
      }
    });
  }
};

// Export the type for use in other files
export type { RSSItem }; 