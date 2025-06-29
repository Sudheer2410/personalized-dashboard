'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/dashboard');
    } else {
      setError(t('auth.invalidCredentials'));
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
          {t('auth.signIn')}
        </h1>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 mb-2">
            {t('auth.username')}
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-200 mb-2">
            {t('auth.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? t('auth.signingIn') : t('auth.signIn')}
        </button>
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          {t('auth.demoCredentials')}
        </div>
      </form>
    </div>
  );
} 