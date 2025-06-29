'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { spotifyApi } from '@/lib/services/spotifyApi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SpotifyCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setError(`Spotify authorization failed: ${error}`);
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setIsProcessing(false);
          return;
        }

        // Exchange code for access token
        const success = await spotifyApi.handleCallback(code);
        
        if (success) {
          // Redirect back to recommendations page
          router.push('/recommendations?tab=music');
        } else {
          setError('Failed to authenticate with Spotify');
        }
      } catch (err) {
        console.error('Error handling Spotify callback:', err);
        setError('An error occurred during authentication');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-white text-lg">Connecting to Spotify...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-400 to-red-600">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => router.push('/recommendations')}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 