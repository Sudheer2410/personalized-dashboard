'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SessionProvider } from 'next-auth/react';
import { store, persistor } from '@/lib/store';
import { ThemeProvider } from './ThemeProvider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import '@/lib/i18n'; // Initialize i18n

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Reduce hydration time by setting mounted immediately
    setMounted(true);
  }, []);

  // Show a minimal loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
} 