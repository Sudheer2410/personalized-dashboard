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
import { fetchRecommendations, clearRecommendations } from '@/lib/slices/contentSlice';
import { ContentItem } from '@/lib/slices/contentSlice';
import { 
  SparklesIcon, 
  FilmIcon, 
  MusicalNoteIcon, 
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const { recommendations, loading, error } = useAppSelector((state) => state.content);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movies' | 'music' | 'content'>('all');

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Load recommendations only if not already loaded (performance optimization)
  useEffect(() => {
    if (session && recommendations.length === 0) {
      dispatch(fetchRecommendations(1));
    }
  }, [dispatch, session, recommendations.length]);

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
      dispatch(clearRecommendations());
      dispatch(fetchRecommendations(1));
    }
  };

  // Filter recommendations by type
  const filteredRecommendations = recommendations.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'movies') return item.category === 'entertainment';
    if (activeFilter === 'music') return item.category === 'music';
    if (activeFilter === 'content') return item.category !== 'entertainment' && item.category !== 'music';
    return true;
  });

  // Group recommendations by type
  const movieRecommendations = recommendations.filter(item => item.category === 'entertainment');
  const musicRecommendations = recommendations.filter(item => item.category === 'music');
  const contentRecommendations = recommendations.filter(item => 
    item.category !== 'entertainment' && item.category !== 'music'
  );

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
      <div className="lg:pl-64">
        <Topbar />
        <main className="p-4 sm:p-6 pt-20 lg:pt-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <SparklesIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('recommendations.title')}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('recommendations.description')}
            </p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {[
                { key: 'all', label: t('recommendations.all'), icon: SparklesIcon, count: recommendations.length },
                { key: 'movies', label: t('recommendations.movies'), icon: FilmIcon, count: movieRecommendations.length },
                { key: 'music', label: t('recommendations.music'), icon: MusicalNoteIcon, count: musicRecommendations.length },
                { key: 'content', label: t('recommendations.content'), icon: BookOpenIcon, count: contentRecommendations.length }
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeFilter === key
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

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

          {/* Recommendations Grid */}
          {filteredRecommendations.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('recommendations.noRecommendations')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('recommendations.noRecommendationsDescription')}
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('recommendations.refresh')}
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecommendations.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ContentCard 
                  item={item} 
                  onCardClick={handleCardClick}
                  showRecommendationReason={true}
                />
              </motion.div>
            ))}
          </div>

          {/* Recommendation Stats */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('recommendations.stats')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {movieRecommendations.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('recommendations.movies')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {musicRecommendations.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('recommendations.music')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {contentRecommendations.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('recommendations.content')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {recommendations.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('recommendations.total')}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>

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