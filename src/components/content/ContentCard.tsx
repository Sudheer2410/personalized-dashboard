'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ShareIcon, StarIcon, SparklesIcon, ChatBubbleLeftRightIcon, HeartIcon as HeartSolidIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addToFavorites, removeFromFavorites } from '@/lib/slices/favoritesSlice';
import { ContentItem } from '@/lib/slices/contentSlice';

interface ContentCardProps {
  item: ContentItem;
  onCardClick?: (item: ContentItem) => void;
  showRecommendationReason?: boolean;
  showSocialStats?: boolean;
}

export function ContentCard({ item, onCardClick, showRecommendationReason = false, showSocialStats = false }: ContentCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isPlayLoading, setIsPlayLoading] = useState(false);
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);
  const isFavorite = favorites.some(fav => fav.id === item.id);

  // Get fallback image based on category
  const getFallbackImage = (category: string) => {
    const fallbackImages = {
      technology: 'https://picsum.photos/400/300?random=1',
      business: 'https://picsum.photos/400/300?random=2',
      sports: 'https://picsum.photos/400/300?random=3',
      news: 'https://picsum.photos/400/300?random=4',
      entertainment: 'https://picsum.photos/400/300?random=5',
      music: 'https://picsum.photos/400/300?random=6',
      travel: 'https://picsum.photos/400/300?random=7',
      food: 'https://picsum.photos/400/300?random=8',
    };
    return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.news;
  };

  const handleImageError = () => {
    console.warn(`Image failed to load: ${item.imageUrl}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      dispatch(removeFromFavorites(item.id));
    } else {
      dispatch(addToFavorites(item));
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCardClick?.(item);
  };

  const handlePlayNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMusic) {
      setIsPlayLoading(true);
      try {
        // First try to use the item's URL directly if it's a valid Spotify URL
        if (item.url && item.url.includes('spotify.com')) {
          window.open(item.url, '_blank');
          return;
        }
        
        // If not a direct Spotify URL, try to open the original URL or show a message
        if (item.url && item.url !== '#') {
          window.open(item.url, '_blank');
        } else {
          // Show a fallback message
          alert(`Could not find "${item.title}" on Spotify. Please search manually.`);
        }
      } catch (error) {
        console.error('Error playing music:', error);
        // Fallback to original URL or show error
        if (item.url && item.url !== '#') {
          window.open(item.url, '_blank');
        } else {
          alert('Unable to play music. Please try again later.');
        }
      } finally {
        setIsPlayLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const isMovie = item.type === 'recommendation' && item.category === 'entertainment';
  const isMusic = item.type === 'recommendation' && item.category === 'music';
  const isSocial = item.type === 'social';
  const finalImageUrl = imageError ? getFallbackImage(item.category) : item.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col h-full"
      onClick={() => onCardClick?.(item)}
    >
      {/* Image Container */}
      <div className={`relative ${isMovie ? 'aspect-[2/3]' : 'aspect-video'} w-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden`}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        <img
          src={finalImageUrl}
          alt={item.title}
          className={`w-full h-full transition-opacity duration-300 rounded-t-lg ${isMovie ? 'object-contain bg-gray-100 dark:bg-gray-900' : 'object-cover'}`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
            {item.category}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleFavoriteToggle}
            className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            {isFavorite ? (
              <HeartSolidIcon className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          <button
            onClick={handleShare}
            className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <ShareIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {isSocial ? item.author : item.source}
          </span>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {isMovie && item.releaseYear ? item.releaseYear : isSocial ? formatTimeAgo(item.publishedAt) : formatDate(item.publishedAt)}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-base sm:text-lg">
          {item.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-3 mb-4 flex-1">
          {item.description}
        </p>

        {/* Recommendation Reason */}
        {showRecommendationReason && item.recommendationReason && (
          <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-1">
              <SparklesIcon className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                {item.recommendationReason}
              </span>
            </div>
          </div>
        )}

        {/* Social Media Stats */}
        {showSocialStats && isSocial && (item.likes || item.retweets || item.comments) && (
          <div className="mb-3 flex items-center space-x-3 sm:space-x-4 text-xs text-gray-500 dark:text-gray-400">
            {item.likes && (
              <div className="flex items-center space-x-1">
                <HeartIcon className="w-3 h-3" />
                <span>{item.likes.toLocaleString()}</span>
              </div>
            )}
            {item.retweets && (
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                </svg>
                <span>{item.retweets.toLocaleString()}</span>
              </div>
            )}
            {item.comments && (
              <div className="flex items-center space-x-1">
                <ChatBubbleLeftRightIcon className="w-3 h-3" />
                <span>{item.comments.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Hashtags */}
        {isSocial && item.hashtags && item.hashtags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {item.hashtags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {item.hashtags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{item.hashtags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Movie-specific info */}
        {isMovie && item.rating && (
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <StarIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.rating.toFixed(1)}/10
              </span>
            </div>
            {item.releaseYear && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.releaseYear}
              </span>
            )}
          </div>
        )}

        {/* Read More Button */}
        <button
          onClick={isMusic ? handlePlayNow : handleReadMore}
          disabled={isPlayLoading}
          className={`mt-auto w-full py-2.5 sm:py-2 px-4 rounded-lg transition-colors font-medium text-sm flex items-center justify-center space-x-2 ${
            isMusic 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${isPlayLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isPlayLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Loading...</span>
            </>
          ) : isMusic ? (
            <>
              <PlayIcon className="w-4 h-4" />
              <span>Play Now</span>
            </>
          ) : (
            <span>{isSocial ? 'View Post' : isMovie ? 'View Details' : 'Read More'}</span>
          )}
        </button>
      </div>
    </motion.div>
  );
} 