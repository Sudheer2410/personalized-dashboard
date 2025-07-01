'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { 
  setTheme, 
  setCategories, 
  toggleNotifications,
  setLanguage 
} from '@/lib/slices/userPreferencesSlice';
import { 
  SunIcon, 
  MoonIcon, 
  BellIcon, 
  GlobeAltIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const availableCategories = [
  'technology', 'business', 'sports', 'entertainment', 
  'science', 'health', 'politics', 'world', 'education',
  'environment', 'travel', 'food', 'fashion', 'automotive'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
];

export default function SettingsPage() {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  const dispatch = useAppDispatch();
  const { theme, categories, language, notifications } = useAppSelector((state) => state.userPreferences);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      dispatch(setCategories([...categories, newCategory.trim()]));
      setNewCategory('');
      setShowCategoryModal(false);
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    dispatch(setCategories(categories.filter(cat => cat !== categoryToRemove)));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar />
        
        <main className="p-4 sm:p-6 pt-20 lg:pt-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your dashboard experience and preferences
            </p>
            {/* Debug info */}
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Debug Info:</strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Redux Theme: {theme}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                HTML Class: {typeof window !== 'undefined' ? document.documentElement.className : 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Has Dark Class: {typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') ? 'Yes' : 'No' : 'N/A'}
              </p>
            </div>
          </motion.div>

          <div className="space-y-8">
            {/* Theme Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Appearance
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Theme
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => dispatch(setTheme('light'))}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <SunIcon className="w-5 h-5" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => dispatch(setTheme('dark'))}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <MoonIcon className="w-5 h-5" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Categories Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Content Categories
                </h2>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-gray-900 dark:text-white capitalize">{category}</span>
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No categories selected. Add some to personalize your feed!
                  </p>
                )}
              </div>
            </motion.div>

            {/* Language Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Language
              </h2>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Display Language
                </label>
                <select
                  value={language}
                  onChange={(e) => dispatch(setLanguage(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white">
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Notifications Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Notifications
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive updates about new content and trending topics
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(toggleNotifications())}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add Category
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              <div className="flex flex-wrap gap-2">
                {availableCategories
                  .filter(cat => !categories.includes(cat))
                  .map((category) => (
                    <button
                      key={category}
                      onClick={() => setNewCategory(category)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {category}
                    </button>
                  ))}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 