'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import webSocketService from '@/lib/services/websocket';

interface RealTimeNotificationProps {
  onRefresh?: () => void;
}

export function RealTimeNotification({ onRefresh }: RealTimeNotificationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [newContent, setNewContent] = useState<{ title: string; summary: string; publishedAt: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(webSocketService.getConnectionStatus());
  const [showApiWarning, setShowApiWarning] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Connect to WebSocket service
    webSocketService.connect();

    // Listen for new content
    const handleNewContent = (content: { title: string; summary: string; publishedAt: string }) => {
      setNewContent(content);
      setShowNotification(true);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 10000);
    };

    // Listen for connection status changes
    const handleConnectionStatus = (status: typeof connectionStatus) => {
      setConnectionStatus(status);
    };

    // Check for API rate limit warnings in console
    const originalWarn = console.warn;
    console.warn = (...args) => {
      originalWarn.apply(console, args);
      if (args[0]?.includes('rate limit') || args[0]?.includes('API key not configured')) {
        setShowApiWarning(true);
        setTimeout(() => setShowApiWarning(false), 8000);
      }
    };

    webSocketService.on('new_content', handleNewContent);
    webSocketService.on('connection_status', handleConnectionStatus);

    return () => {
      webSocketService.off('new_content', handleNewContent);
      webSocketService.off('connection_status', handleConnectionStatus);
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Check if we're using cached data
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.usingCachedData) {
          setShowNotification(true);
        }
      } catch {
        console.log('Could not check API status');
      }
    };

    checkApiStatus();
  }, []);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    setShowNotification(false);
  };

  const handleClose = () => {
    setShowNotification(false);
  };

  const handleManualRefresh = () => {
    webSocketService.triggerContentRefresh();
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 left-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium shadow-lg ${
            connectionStatus.connected
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus.connected
                ? 'bg-green-500 animate-pulse'
                : 'bg-red-500'
            }`}
          />
          <span>
            {connectionStatus.connected
              ? t('realTime.connected')
              : connectionStatus.reconnecting
              ? t('realTime.reconnecting')
              : t('realTime.disconnected')
            }
          </span>
        </motion.div>
      </div>

      {/* API Warning Notification */}
      <AnimatePresence>
        {showApiWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Using Demo Data
                  </span>
                </div>
                <button
                  onClick={() => setShowApiWarning(false)}
                  className="text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-200 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 pb-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  API rate limit reached. Showing demo content. Configure API keys for real data.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Content Notification */}
      <AnimatePresence>
        {showNotification && newContent && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 z-50 max-w-sm"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t('realTime.newContent')}
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {newContent.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {newContent.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(newContent.publishedAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>{t('common.refresh')}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Refresh Button */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={handleManualRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
          title={t('realTime.newContent')}
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{t('common.refresh')}</span>
        </button>
      </div>
    </>
  );
} 