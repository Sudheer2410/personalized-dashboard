'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentDetailsModal } from '@/components/content/ContentDetailsModal';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { fetchSocialPosts, clearSocialPosts } from '@/lib/slices/contentSlice';
import { ContentItem } from '@/lib/slices/contentSlice';
import { 
  HashtagIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function SocialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const { socialPosts, loading, error } = useAppSelector((state) => state.content);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'all' | 'twitter' | 'instagram' | 'linkedin'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hashtagSearch, setHashtagSearch] = useState('');
  const [trendingHashtags] = useState([
    '#AI', '#TechNews', '#Travel', '#Food', '#Sports', '#Music', '#Fashion', '#Business'
  ]);

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Load social posts only if not already loaded (performance optimization)
  useEffect(() => {
    if (session && socialPosts.length === 0) {
      dispatch(fetchSocialPosts({}));
    }
  }, [dispatch, session, socialPosts.length]);

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
      dispatch(clearSocialPosts());
      dispatch(fetchSocialPosts({}));
    }
  };

  const handleHashtagSearch = (hashtag: string) => {
    setHashtagSearch(hashtag);
    dispatch(clearSocialPosts());
    dispatch(fetchSocialPosts({ hashtag }));
  };

  const handlePlatformFilter = (platform: 'all' | 'twitter' | 'instagram' | 'linkedin') => {
    setActivePlatform(platform);
    setActiveCategory('all');
    setHashtagSearch('');
    dispatch(clearSocialPosts());
    if (platform === 'all') {
      dispatch(fetchSocialPosts({}));
    } else {
      dispatch(fetchSocialPosts({ platform }));
    }
  };

  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category);
    setActivePlatform('all');
    setHashtagSearch('');
    dispatch(clearSocialPosts());
    if (category === 'all') {
      dispatch(fetchSocialPosts({}));
    } else {
      dispatch(fetchSocialPosts({ category }));
    }
  };

  // Filter posts by platform and category
  const filteredPosts = socialPosts.filter(item => {
    if (activePlatform !== 'all' && item.source.toLowerCase() !== activePlatform) return false;
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    return true;
  });

  // Get unique categories from posts
  const categories = Array.from(new Set(socialPosts.map(post => post.category)));

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <Topbar />
      <main className="ml-64 pt-16 p-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('social.title')}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('social.description')}
            </p>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 space-y-4"
          >
            {/* Platform Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <FunnelIcon className="w-4 h-4 mr-1" />
                {t('social.platforms')}:
              </span>
              {[
                { key: 'all', label: t('social.allPlatforms'), color: 'bg-gray-500' },
                { key: 'twitter', label: 'Twitter', color: 'bg-blue-500' },
                { key: 'instagram', label: 'Instagram', color: 'bg-pink-500' },
                { key: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700' }
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => handlePlatformFilter(key as 'all' | 'twitter' | 'instagram' | 'linkedin')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activePlatform === key
                      ? `${color} text-white`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('social.categories')}:
              </span>
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('social.allCategories')}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(`sidebar.${category}`)}
                </button>
              ))}
            </div>

            {/* Trending Hashtags */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <HashtagIcon className="w-4 h-4 mr-1" />
                {t('social.trending')}:
              </span>
              {trendingHashtags.map((hashtag) => (
                <button
                  key={hashtag}
                  onClick={() => handleHashtagSearch(hashtag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    hashtagSearch === hashtag
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {hashtag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Active Filters Display */}
          {(activePlatform !== 'all' || activeCategory !== 'all' || hashtagSearch) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t('social.activeFilters')}:
                  </span>
                  {activePlatform !== 'all' && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {activePlatform}
                    </span>
                  )}
                  {activeCategory !== 'all' && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                      {t(`sidebar.${activeCategory}`)}
                    </span>
                  )}
                  {hashtagSearch && (
                    <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                      {hashtagSearch}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setActivePlatform('all');
                    setActiveCategory('all');
                    setHashtagSearch('');
                    handleRefresh();
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                >
                  {t('social.clearFilters')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
            >
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-8"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </motion.div>
          )}

          {/* Social Posts Grid */}
          {filteredPosts.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('social.noPosts')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('social.noPostsDescription')}
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('social.refresh')}
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ContentCard 
                  item={item} 
                  onCardClick={handleCardClick}
                  showSocialStats={true}
                />
              </motion.div>
            ))}
          </div>

          {/* Social Stats */}
          {!loading && socialPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('social.stats')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {socialPosts.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('social.totalPosts')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {socialPosts.filter(p => p.source === 'Twitter').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Twitter
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-500">
                    {socialPosts.filter(p => p.source === 'Instagram').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Instagram
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {socialPosts.filter(p => p.source === 'LinkedIn').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    LinkedIn
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Content Details Modal */}
      {selectedItem && (
        <ContentDetailsModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
} 