// src/pages/_app.tsx
import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import PageTracker from '../components/PageTracker';
import MusicDebug from '../components/MusicDebug';
import FullscreenExitDetector from '../components/FullscreenExitDetector';
import '../styles/globals.css';
import '../styles/responsive.css';
import { MusicProvider } from '../contexts/MusicContext';

function MyApp({ Component, pageProps }: AppProps) {
  const [showDebug, setShowDebug] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    if (process.env.NODE_ENV === 'development') {
      setShowDebug(true);
    }
  }, []);

  const shouldUseFullscreenDetector = router.pathname !== '/fullscreen-landing';

  return (
    <MusicProvider>
      <PageTracker />
      {shouldUseFullscreenDetector ? (
        <FullscreenExitDetector>
          <Component {...pageProps} />
        </FullscreenExitDetector>
      ) : (
        <Component {...pageProps} />
      )}

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