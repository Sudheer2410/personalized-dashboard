'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, HeartIcon, ShareIcon, StarIcon, CalendarIcon, UserIcon, SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addToFavorites, removeFromFavorites } from '@/lib/slices/favoritesSlice';
import { ContentItem } from '@/lib/slices/contentSlice';

interface ContentDetailsModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ContentDetailsModal({ item, isOpen, onClose }: ContentDetailsModalProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);
  const isFavorite = item ? favorites.some(fav => fav.id === item.id) : false;

  const handleFavoriteToggle = () => {
    if (!item) return;
    if (isFavorite) {
      dispatch(removeFromFavorites(item.id));
    } else {
      dispatch(addToFavorites(item));
    }
  };

  const handleShare = () => {
    if (!item) return;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: item.url,
      });
    } else {
      navigator.clipboard.writeText(item.url);
    }
  };

  const handleExternalLink = () => {
    if (!item) return;
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return formatDate(dateString);
  };

  // Get fallback image based on category
  const getFallbackImage = (category: string) => {
    const fallbackImages = {
      technology: 'https://picsum.photos/800/400?random=1',
      business: 'https://picsum.photos/800/400?random=2',
      sports: 'https://picsum.photos/800/400?random=3',
      news: 'https://picsum.photos/800/400?random=4',
      entertainment: 'https://picsum.photos/800/400?random=5',
      music: 'https://picsum.photos/800/400?random=6',
      travel: 'https://picsum.photos/800/400?random=7',
      food: 'https://picsum.photos/800/400?random=8',
    };
    return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.news;
  };

  const handleImageError = () => {
    console.warn(`Modal image failed to load: ${item?.imageUrl}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const isMovie = item?.type === 'recommendation' && item?.category === 'entertainment';
  const isMusic = item?.type === 'recommendation' && item?.category === 'music';
  const isSocial = item?.type === 'social';
  const finalImageUrl = imageError ? getFallbackImage(item?.category || 'news') : item?.imageUrl;

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Image - Fixed height */}
            <div className={`relative overflow-hidden flex-shrink-0 ${
              isMovie ? 'h-48 sm:h-64 md:h-72' : 'h-40 sm:h-48 md:h-56'
            }`}>
              {/* Loading Skeleton */}
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              )}
              
              <img
                src={finalImageUrl}
                alt={item.title}
                className={`w-full h-full transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                } ${
                  isMovie 
                    ? 'object-contain bg-gray-100 dark:bg-gray-900' 
                    : 'object-cover'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              
              {/* Gradient overlay */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                isMovie 
                  ? 'bg-gradient-to-t from-black/40 via-transparent to-transparent' 
                  : 'bg-gradient-to-t from-black/60 via-black/20 to-transparent'
              }`} />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors z-10"
              >
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Category Badge */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
                <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full capitalize ${
                  isMovie 
                    ? 'bg-purple-600 text-white' 
                    : isMusic
                    ? 'bg-pink-600 text-white'
                    : isSocial
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {isMovie ? 'Movie' : isMusic ? 'Music' : isSocial ? item.source : item.category}
                </span>
              </div>

              {/* Recommendation Badge */}
              {item.type === 'recommendation' && (
                <div className="absolute top-2 sm:top-4 left-20 sm:left-32 z-10">
                  <div className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded-full">
                    <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">Recommended</span>
                  </div>
                </div>
              )}

              {/* Movie Rating */}
              {isMovie && item.rating && (
                <div className="absolute top-2 sm:top-4 left-36 sm:left-48 z-10">
                  <div className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded-full">
                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-medium">{item.rating.toFixed(1)}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex space-x-2 sm:space-x-3 z-10">
                <button
                  onClick={handleFavoriteToggle}
                  className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <ShareIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Title and Meta */}
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {item.title}
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{isSocial ? item.author : item.source}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {isMovie && item.releaseYear ? item.releaseYear : isSocial ? formatTimeAgo(item.publishedAt) : formatDate(item.publishedAt)}
                      </span>
                    </div>
                  </div>
                  
                  {isMovie && item.rating && (
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{item.rating.toFixed(1)}/10</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Recommendation Reason */}
              {item.recommendationReason && (
                <div className="mb-6 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start space-x-2">
                    <SparklesIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Why we recommend this:
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {item.recommendationReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media Stats */}
              {isSocial && (item.likes || item.retweets || item.comments) && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Engagement
                  </h3>
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                    {item.likes && (
                      <div className="flex items-center space-x-2">
                        <HeartIcon className="w-4 h-4" />
                        <span>{item.likes.toLocaleString()} likes</span>
                      </div>
                    )}
                    {item.retweets && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                        </svg>
                        <span>{item.retweets.toLocaleString()} retweets</span>
                      </div>
                    )}
                    {item.comments && (
                      <div className="flex items-center space-x-2">
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>{item.comments.toLocaleString()} comments</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {isSocial && item.hashtags && item.hashtags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {item.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Link Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleExternalLink}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  {isSocial ? 'View Original Post' : isMovie ? 'View on IMDB' : isMusic ? 'Listen on Spotify' : 'Read Full Article'}
                </button>
                
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 