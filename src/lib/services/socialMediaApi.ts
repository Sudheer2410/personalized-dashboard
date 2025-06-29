import { ContentItem } from '../slices/contentSlice';

// Mock social media data
const mockTwitterData = [
  {
    id: 'twitter-1',
    title: 'Breaking: New AI breakthrough in quantum computing',
    description: 'Scientists at @MIT have achieved a major breakthrough in quantum computing that could revolutionize the field. #AI #QuantumComputing #TechNews',
    imageUrl: 'https://via.placeholder.com/400x250/1da1f2/ffffff?text=AI+Breakthrough',
    category: 'technology',
    source: 'Twitter',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    url: '#',
    type: 'social' as const,
    author: '@TechNews',
    likes: 1247,
    retweets: 892,
    hashtags: ['#AI', '#QuantumComputing', '#TechNews']
  },
  {
    id: 'twitter-2',
    title: 'Amazing sunset at the Grand Canyon! 🌅',
    description: 'Just witnessed the most incredible sunset at the Grand Canyon. Nature never ceases to amaze! #GrandCanyon #Sunset #Travel #Nature',
    imageUrl: 'https://via.placeholder.com/400x250/ff6b35/ffffff?text=Grand+Canyon',
    category: 'travel',
    source: 'Twitter',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    url: '#',
    type: 'social' as const,
    author: '@TravelLover',
    likes: 2156,
    retweets: 1342,
    hashtags: ['#GrandCanyon', '#Sunset', '#Travel', '#Nature']
  },
  {
    id: 'twitter-3',
    title: 'New recipe: Homemade Sourdough Bread 🍞',
    description: 'Finally perfected my sourdough recipe! Here\'s the step-by-step process. The crust is perfectly crispy! #Baking #Sourdough #Foodie',
    imageUrl: 'https://via.placeholder.com/400x250/d4a574/ffffff?text=Sourdough',
    category: 'food',
    source: 'Twitter',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    url: '#',
    type: 'social' as const,
    author: '@BakingPro',
    likes: 892,
    retweets: 445,
    hashtags: ['#Baking', '#Sourdough', '#Foodie']
  },
  {
    id: 'twitter-4',
    title: 'Incredible goal by Messi! ⚽',
    description: 'What a finish! Messi scores an absolute worldie in the 89th minute! This is why he\'s the GOAT! #Messi #Football #GOAT',
    imageUrl: 'https://via.placeholder.com/400x250/00ff00/000000?text=Messi+Goal',
    category: 'sports',
    source: 'Twitter',
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    url: '#',
    type: 'social' as const,
    author: '@FootballFan',
    likes: 5678,
    retweets: 2345,
    hashtags: ['#Messi', '#Football', '#GOAT']
  }
];

const mockInstagramData = [
  {
    id: 'instagram-1',
    title: 'Morning coffee and coding ☕💻',
    description: 'Perfect start to the day with a fresh cup of coffee and some React development. #Coding #Coffee #DeveloperLife #React',
    imageUrl: 'https://via.placeholder.com/400x400/e4405f/ffffff?text=Coffee+Coding',
    category: 'technology',
    source: 'Instagram',
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    url: '#',
    type: 'social' as const,
    author: '@DevLife',
    likes: 1234,
    comments: 89,
    hashtags: ['#Coding', '#Coffee', '#DeveloperLife', '#React']
  },
  {
    id: 'instagram-2',
    title: 'Street art in Berlin 🎨',
    description: 'Amazing street art found in Kreuzberg, Berlin. The creativity in this city is incredible! #StreetArt #Berlin #Art #Travel',
    imageUrl: 'https://via.placeholder.com/400x400/833ab4/ffffff?text=Street+Art',
    category: 'travel',
    source: 'Instagram',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    url: '#',
    type: 'social' as const,
    author: '@ArtExplorer',
    likes: 2156,
    comments: 156,
    hashtags: ['#StreetArt', '#Berlin', '#Art', '#Travel']
  },
  {
    id: 'instagram-3',
    title: 'Homemade pasta making 🍝',
    description: 'Nothing beats fresh homemade pasta! The texture and taste are incomparable. #Pasta #Homemade #Cooking #Italian',
    imageUrl: 'https://via.placeholder.com/400x400/f77737/ffffff?text=Homemade+Pasta',
    category: 'food',
    source: 'Instagram',
    publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
    url: '#',
    type: 'social' as const,
    author: '@ChefLife',
    likes: 3456,
    comments: 234,
    hashtags: ['#Pasta', '#Homemade', '#Cooking', '#Italian']
  }
];

const mockLinkedInData = [
  {
    id: 'linkedin-1',
    title: 'The Future of Remote Work in 2024',
    description: 'As we move into 2024, remote work continues to evolve. Here are the key trends and insights from industry leaders. #RemoteWork #FutureOfWork #Leadership',
    imageUrl: 'https://via.placeholder.com/400x250/0077b5/ffffff?text=Remote+Work',
    category: 'business',
    source: 'LinkedIn',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    url: '#',
    type: 'social' as const,
    author: 'Sarah Johnson',
    likes: 456,
    comments: 78,
    hashtags: ['#RemoteWork', '#FutureOfWork', '#Leadership']
  },
  {
    id: 'linkedin-2',
    title: 'Building a Sustainable Business Model',
    description: 'Sustainability isn\'t just a trend—it\'s the future of business. Here\'s how we\'re implementing eco-friendly practices. #Sustainability #Business #Innovation',
    imageUrl: 'https://via.placeholder.com/400x250/00a651/ffffff?text=Sustainability',
    category: 'business',
    source: 'LinkedIn',
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    url: '#',
    type: 'social' as const,
    author: 'Michael Chen',
    likes: 789,
    comments: 123,
    hashtags: ['#Sustainability', '#Business', '#Innovation']
  }
];

export interface SocialMediaPost extends ContentItem {
  author: string;
  likes: number;
  retweets?: number;
  comments?: number;
  hashtags: string[];
}

class SocialMediaApi {
  // Fetch posts from specific hashtags
  async fetchPostsByHashtag(hashtag: string, platform: 'twitter' | 'instagram' | 'linkedin' = 'twitter'): Promise<SocialMediaPost[]> {
    try {
      // Reduced delay for better performance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allPosts = [...mockTwitterData, ...mockInstagramData, ...mockLinkedInData];
      
      // Filter posts by hashtag (case insensitive)
      const filteredPosts = allPosts.filter(post => 
        post.hashtags.some(tag => 
          tag.toLowerCase().includes(hashtag.toLowerCase().replace('#', ''))
        )
      );
      
      // Filter by platform if specified
      if (platform !== 'all') {
        return filteredPosts.filter(post => post.source.toLowerCase() === platform);
      }
      
      return filteredPosts;
      
    } catch (error) {
      console.error(`Failed to fetch posts for hashtag ${hashtag}:`, error);
      return [];
    }
  }

  // Fetch posts from specific user profiles
  async fetchPostsByUser(username: string, platform: 'twitter' | 'instagram' | 'linkedin' = 'twitter'): Promise<SocialMediaPost[]> {
    try {
      // Reduced delay for better performance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allPosts = [...mockTwitterData, ...mockInstagramData, ...mockLinkedInData];
      
      // Filter posts by author
      const userPosts = allPosts.filter(post => 
        post.author.toLowerCase().includes(username.toLowerCase())
      );
      
      // Filter by platform if specified
      if (platform !== 'all') {
        return userPosts.filter(post => post.source.toLowerCase() === platform);
      }
      
      return userPosts;
      
    } catch (error) {
      console.error(`Failed to fetch posts for user ${username}:`, error);
      return [];
    }
  }

  // Fetch trending posts across all platforms
  async fetchTrendingPosts(category?: string): Promise<SocialMediaPost[]> {
    try {
      // Reduced delay for better performance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allPosts = [...mockTwitterData, ...mockInstagramData, ...mockLinkedInData];
      
      // Filter by category if specified
      if (category) {
        return allPosts.filter(post => post.category === category);
      }
      
      // Return posts sorted by engagement (likes + retweets + comments)
      return allPosts.sort((a, b) => {
        const engagementA = a.likes + (a.retweets || 0) + (a.comments || 0);
        const engagementB = b.likes + (b.retweets || 0) + (b.comments || 0);
        return engagementB - engagementA;
      });
      
    } catch (error) {
      console.error('Failed to fetch trending posts:', error);
      return [];
    }
  }

  // Fetch posts by platform
  async fetchPostsByPlatform(platform: 'twitter' | 'instagram' | 'linkedin'): Promise<SocialMediaPost[]> {
    try {
      // Reduced delay for better performance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      switch (platform) {
        case 'twitter':
          return mockTwitterData;
        case 'instagram':
          return mockInstagramData;
        case 'linkedin':
          return mockLinkedInData;
        default:
          return [];
      }
      
    } catch (error) {
      console.error(`Failed to fetch ${platform} posts:`, error);
      return [];
    }
  }

  // Search posts across all platforms
  async searchPosts(query: string): Promise<SocialMediaPost[]> {
    try {
      // Reduced delay for better performance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allPosts = [...mockTwitterData, ...mockInstagramData, ...mockLinkedInData];
      
      // Search in title, description, and hashtags
      return allPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase()) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      
    } catch (error) {
      console.error(`Failed to search posts for "${query}":`, error);
      return [];
    }
  }

  // Get trending hashtags
  async getTrendingHashtags(): Promise<string[]> {
    try {
      // Reduced delay for better performance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allPosts = [...mockTwitterData, ...mockInstagramData, ...mockLinkedInData];
      const hashtagCount: { [key: string]: number } = {};
      
      // Count hashtag occurrences
      allPosts.forEach(post => {
        post.hashtags.forEach(tag => {
          hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
        });
      });
      
      // Return top 10 trending hashtags
      return Object.entries(hashtagCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);
      
    } catch (error) {
      console.error('Failed to fetch trending hashtags:', error);
      return [];
    }
  }

  // Get user suggestions based on interests
  async getUserSuggestions(interests: string[]): Promise<string[]> {
    try {
      // Reduced delay for better performance
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const allPosts = [...mockTwitterData, ...mockInstagramData, ...mockLinkedInData];
      const userSuggestions = new Set<string>();
      
      // Find users who post about similar interests
      allPosts.forEach(post => {
        if (interests.some(interest => 
          post.category === interest || 
          post.hashtags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
        )) {
          userSuggestions.add(post.author);
        }
      });
      
      return Array.from(userSuggestions).slice(0, 10);
      
    } catch (error) {
      console.error('Failed to fetch user suggestions:', error);
      return [];
    }
  }
}

export const socialMediaApi = new SocialMediaApi(); 