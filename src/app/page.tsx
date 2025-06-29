'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return;

    // Redirect based on authentication status with minimal delay
    const timer = setTimeout(() => {
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }, 300); // Reduced from 800ms to 300ms

    return () => clearTimeout(timer);
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }} // Reduced from 0.3s to 0.2s
        className="text-center"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.05 }} // Reduced from 0.1s to 0.05s
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Personalized Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Your curated content feed, tailored just for you
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }} // Reduced from 0.2s to 0.1s
          className="flex items-center justify-center space-x-2"
        >
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-300">
            {status === 'loading' 
              ? 'Checking authentication...' 
              : session 
                ? 'Loading your dashboard...' 
                : 'Redirecting to login...'
            }
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
