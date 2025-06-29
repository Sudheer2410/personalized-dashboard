'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentDetailsModal } from '@/components/content/ContentDetailsModal';
import { useAppSelector } from '@/lib/hooks';
import { ContentItem } from '@/lib/slices/contentSlice';

export default function FavoritesPage() {
  const favorites = useAppSelector((state) => state.favorites.items);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (item: ContentItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your Favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {favorites.length === 0 
                ? "You haven't saved any content yet. Start exploring and save items you love!"
                : `You have ${favorites.length} saved ${favorites.length === 1 ? 'item' : 'items'}`
              }
            </p>
          </motion.div>

          {/* Empty State */}
          {favorites.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start exploring content and save your favorite articles, videos, and more.
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Content
              </a>
            </motion.div>
          )}

          {/* Favorites Grid */}
          {favorites.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((item, index) => (
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
        </div>
      </main>

      {/* Content Details Modal */}
      <ContentDetailsModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
} 