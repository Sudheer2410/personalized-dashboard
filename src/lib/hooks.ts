import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Performance optimization hook for preloading pages
export const usePreloadPage = () => {
  const router = useRouter();
  
  const preloadPage = useCallback((href: string) => {
    router.prefetch(href);
  }, [router]);
  
  return preloadPage;
};

// Hook for optimizing image loading
export const useImagePreload = () => {
  const preloadImage = useCallback((src: string) => {
    const img = new Image();
    img.src = src;
  }, []);
  
  return preloadImage;
};

// Hook for optimizing API calls with caching
export const useOptimizedFetch = () => {
  const cache = new Map();
  
  const fetchWithCache = useCallback(async (url: string, options?: RequestInit) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      // Cache for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }, []);
  
  return fetchWithCache;
}; 