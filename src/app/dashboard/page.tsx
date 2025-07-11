'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentDetailsModal } from '@/components/content/ContentDetailsModal';
import { RealTimeNotification } from '@/components/RealTimeNotification';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { fetchContent, clearContent, fetchRecommendations, fetchSocialPosts } from '@/lib/slices/contentSlice';
import { ContentItem } from '@/lib/slices/contentSlice';
import spotifyApi, { SpotifyTrack } from '@/lib/services/spotifyApi';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, loading, error, hasMore, page, recommendations, socialPosts, lastFetched, cacheDuration } = useAppSelector((state) => state.content);
  const categories = useAppSelector((state) => state.userPreferences.categories);
  const searchResults = useAppSelector((state) => state.search.results);
  const searchQuery = useAppSelector((state) => state.search.query);
  
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [teluguSongs, setTeluguSongs] = useState<ContentItem[]>([]);
  
  const observer = useRef<IntersectionObserver | null>(null);

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Optimized initial content loading with staggered approach
  useEffect(() => {
    if (session && !initialLoadComplete) {
      const now = Date.now();
      
      // Check if we need to fetch content (cache expired or empty)
      const shouldFetchContent = items.length === 0 || (now - lastFetched.content) > cacheDuration;
      const shouldFetchRecommendations = recommendations.length === 0 || (now - lastFetched.recommendations) > cacheDuration;
      const shouldFetchSocialPosts = socialPosts.length === 0 || (now - lastFetched.socialPosts) > cacheDuration;
      
      if (shouldFetchContent) {
        console.log('Loading initial content...');
        dispatch(clearContent());
        dispatch(fetchContent({ categories, page: 1 }));
      }
      
      // Stagger other API calls to improve perceived performance
      if (shouldFetchRecommendations) {
        setTimeout(() => {
          console.log('Loading recommendations...');
          dispatch(fetchRecommendations(1));
        }, 500);
      }
      
      if (shouldFetchSocialPosts) {
        setTimeout(() => {
          console.log('Loading social posts...');
          dispatch(fetchSocialPosts({}));
        }, 1000);
      }
      
      setInitialLoadComplete(true);
    }
  }, [categories, dispatch, session, initialLoadComplete, items.length, recommendations.length, socialPosts.length, lastFetched, cacheDuration]);

  // Fetch Telugu songs from Spotify after authentication
  useEffect(() => {
    async function fetchTeluguSongs() {
      if (status === 'authenticated') {
        try {
          const tracks: SpotifyTrack[] = await spotifyApi.getTeluguSongs(12);
          // Map SpotifyTrack to ContentItem for ContentCard
          const mapped = tracks.map((track, idx) => ({
            id: `spotify-telugu-${track.id}`,
            title: track.name,
            description: `By ${track.artist}`,
            imageUrl: track.albumArt,
            category: 'music',
            source: 'Spotify',
            publishedAt: '',
            url: track.spotifyUrl,
            type: 'recommendation',
            rating: undefined,
            releaseYear: undefined,
            recommendationReason: 'Hot Hits Telugu',
            author: track.artist,
          }));
          setTeluguSongs(mapped);
        } catch (e) {
          setTeluguSongs([]);
        }
      }
    }
    fetchTeluguSongs();
  }, [status]);

  // Infinite scroll setup
  const lastElementCallback = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        dispatch(fetchContent({ categories, page }));
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, categories, page, dispatch]);

  const handleCardClick = (item: ContentItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleRefresh = () => {
    if (session) {
      setInitialLoadComplete(false);
      dispatch(clearContent());
      dispatch(fetchContent({ categories, page: 1 }));
      dispatch(fetchRecommendations(1));
      dispatch(fetchSocialPosts({}));
    }
  };

  // Combine all content for display
  const allContent = [...items, ...recommendations, ...socialPosts, ...teluguSongs];
  const displayItems = searchQuery ? searchResults : allContent;

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onHamburgerClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="p-4 sm:p-6 pt-20 lg:pt-6">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {t('dashboard.title')}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <RealTimeNotification />
                
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  {loading ? t('common.loading') : t('common.refresh')}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">{error}</p>
            </motion.div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {displayItems.map((item, index) => {
              return (
                <div
                  key={item.id}
                  ref={index === displayItems.length - 1 ? lastElementCallback : null}
                >
                  <ContentCard 
                    item={item} 
                    onCardClick={handleCardClick}
                    showRecommendationReason={true}
                    showSocialStats={true}
                  />
                </div>
              );
            })}
          </div>

          {/* Loading Spinner */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-8"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </motion.div>
          )}

          {/* End of content */}
          {!hasMore && displayItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500 dark:text-gray-400"
            >
              <p className="text-sm sm:text-base">{t('dashboard.endOfContent')}</p>
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && displayItems.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('dashboard.noContent')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4">
                  {t('dashboard.noContentDescription')}
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                  {t('common.refresh')}
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Content Details Modal */}
      {isModalOpen && selectedItem && (
        <ContentDetailsModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
} 