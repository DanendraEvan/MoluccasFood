// src/pages/_app.tsx
import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import PageTracker from '../components/PageTracker';
import MusicDebug from '../components/MusicDebug';
import '../styles/globals.css';
import { MusicProvider } from '../contexts/MusicContext';

function MyApp({ Component, pageProps }: AppProps) {
  const [showDebug, setShowDebug] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (process.env.NODE_ENV === 'development') {
      setShowDebug(true);
    }
  }, []);

  return (
    <MusicProvider>
      <PageTracker />
      <Component {...pageProps} />

      {/* ✅ Music Debugger */}
      {isClient && showDebug && <MusicDebug />}

      {/* ✅ Toggle Debug Button */}
      {isClient && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg text-sm"
          >
            {showDebug ? '🔍 Hide' : '🔍 Debug'}
          </button>
        </div>
      )}
    </MusicProvider>
  );
}

export default MyApp;