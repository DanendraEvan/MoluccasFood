// src/pages/_app.tsx - FINAL MERGED VERSION
import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import PageTracker from '../components/PageTracker';
import MusicDebug from '../components/MusicDebug';
import '../styles/globals.css';

// Import MusicProvider only if it exists, otherwise use fallback
let MusicProvider: React.FC<{ children: React.ReactNode }> | null = null;

try {
  const musicContext = require('../contexts/MusicContext');
  MusicProvider = musicContext.MusicProvider;
} catch (error) {
  console.warn('MusicContext not found, using fallback provider');
  MusicProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
}

function MyApp({ Component, pageProps }: AppProps) {
  const [showDebug, setShowDebug] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (process.env.NODE_ENV === 'development') {
      setShowDebug(true);
    }
  }, []);

  const Provider = MusicProvider || (({ children }: { children: React.ReactNode }) => <>{children}</>);

  return (
    <Provider>
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
    </Provider>
  );
}

export default MyApp;
