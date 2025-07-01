'use client';

import { motion } from 'framer-motion';
import { ContentCard } from '@/components/content/ContentCard';
import { useAppSelector } from '@/lib/hooks';
import { ContentItem } from '@/lib/slices/contentSlice';
import { FireIcon } from '@heroicons/react/24/outline';

export default function TrendingPage() {
  const contentItems = useAppSelector((state) => state.content.items);
  const favorites = useAppSelector((state) => state.favorites.items);

  const handleCardClick = (item: ContentItem) => {
    console.log('Card clicked:', item);
  };

  // For now, show all content as "trending"
  // In a real app, this would fetch trending content from APIs
  const trendingItems = contentItems.length > 0 ? contentItems : [];

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 lg:mb-8"
      >
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <FireIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Trending Now
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          {trendingItems.length === 0 
            ? "Discover what's trending across all categories"
            : `Showing ${trendingItems.length} trending ${trendingItems.length === 1 ? 'item' : 'items'}`
          }
        </p>
      </motion.div>

      {/* Empty State */}
      {trendingItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 sm:py-12"
        >
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FireIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No trending content yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
            Add some categories to your preferences to see trending content.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Manage Categories
          </a>
        </motion.div>
      )}

      {/* Trending Grid */}
      {trendingItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {trendingItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ContentCard item={item} onCardClick={handleCardClick} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Coming Soon Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 sm:mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Coming Soon
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2 text-sm sm:text-base">
              Trending Topics
            </h3>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
              Real-time trending topics and hashtags
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-900 dark:text-green-300 mb-2 text-sm sm:text-base">
              Viral Content
            </h3>
            <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">
              Most shared and viral content across platforms
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg sm:col-span-2 lg:col-span-1">
            <h3 className="font-medium text-purple-900 dark:text-purple-300 mb-2 text-sm sm:text-base">
              Personalized Trends
            </h3>
            <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400">
              Trending content based on your interests
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
} 