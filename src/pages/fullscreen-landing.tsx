import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const FullscreenLandingPage: React.FC = () => {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerWidth > window.innerHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    const checkFullscreen = () => {
      setIsFullscreen(
        !!(document.fullscreenElement ||
           (document as any).webkitFullscreenElement ||
           (document as any).mozFullScreenElement ||
           (document as any).msFullscreenElement)
      );
    };

    checkOrientation();
    checkFullscreen();

    const handleOrientationChange = () => {
      setTimeout(checkOrientation, 100);
    };

    const handleFullscreenChange = () => {
      checkFullscreen();
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const enterFullscreenAndLandscape = async () => {
    try {
      const docElement = document.documentElement;
      if (docElement.requestFullscreen) {
        await docElement.requestFullscreen();
      } else if ((docElement as any).webkitRequestFullscreen) {
        await (docElement as any).webkitRequestFullscreen();
      } else if ((docElement as any).mozRequestFullScreen) {
        await (docElement as any).mozRequestFullScreen();
      } else if ((docElement as any).msRequestFullscreen) {
        await (docElement as any).msRequestFullscreen();
      }

      if (screen.orientation && (screen.orientation as any).lock) {
        try {
          await (screen.orientation as any).lock('landscape');
        } catch (error) {
          console.log('Orientation lock not supported or failed:', error);
        }
      }

      setTimeout(() => {
        router.push('/main');
      }, 500);

    } catch (error) {
      console.error('Error entering fullscreen:', error);
      alert('Fullscreen tidak didukung di browser ini. Silakan putar layar ke landscape secara manual.');
      router.push('/main');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background Image with Blur Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/assets/backgrounds/menu.png")',
          filter: 'blur(8px) brightness(0.7)',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Dark Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Container */}
      <div className="relative z-10 max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 text-center transform transition-all duration-300 hover:shadow-3xl border border-white/20">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            TFM - Traditional Food of Mollucas
          </h1>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-medium">
            Untuk pengalaman terbaik, silakan masuk ke mode fullscreen dan landscape
          </p>
        </div>

        {/* Status Indicators */}
        <div className="mb-8 space-y-3">
          {/* Fullscreen Status */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-300 transition-all duration-200 hover:border-gray-400 shadow-sm">
            <span className="text-sm sm:text-base text-gray-900 font-semibold">Mode Fullscreen:</span>
            <span className={`text-sm sm:text-base font-bold flex items-center gap-1 ${
              isFullscreen ? 'text-green-700' : 'text-red-700'
            }`}>
              {isFullscreen ? (
                <>
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  ✓ Aktif
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                  ✗ Tidak Aktif
                </>
              )}
            </span>
          </div>

          {/* Orientation Status */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-300 transition-all duration-200 hover:border-gray-400 shadow-sm">
            <span className="text-sm sm:text-base text-gray-900 font-semibold">Orientasi:</span>
            <span className={`text-sm sm:text-base font-bold flex items-center gap-1 ${
              orientation === 'landscape' ? 'text-green-700' : 'text-orange-700'
            }`}>
              {orientation === 'landscape' ? (
                <>
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  ✓ Landscape
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-orange-600 rounded-full"></span>
                  📱 Portrait
                </>
              )}
            </span>
          </div>
        </div>

        {/* Main Action Button */}
        <button
          onClick={enterFullscreenAndLandscape}
          className="w-full bg-gradient-to-r from-orange-600 via-orange-700 to-yellow-600 hover:from-orange-700 hover:via-orange-800 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-400"
        >
          <span className="flex items-center justify-center gap-2 text-base sm:text-lg">
            🚀 <span>Masuk Fullscreen & Mulai Game</span>
          </span>
        </button>

        {/* Instructions */}
        <div className="mt-6 text-xs sm:text-sm text-gray-800 space-y-2 bg-gray-100/80 rounded-lg p-4 border border-gray-300">
          <p className="flex items-start gap-2">
            <span className="text-orange-600 font-bold">•</span>
            <span className="font-medium">Pastikan browser mendukung fullscreen</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-orange-600 font-bold">•</span>
            <span className="font-medium">Putar perangkat ke mode landscape</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-orange-600 font-bold">•</span>
            <span className="font-medium">Untuk mobile: aktifkan rotasi otomatis</span>
          </p>
        </div>
      </div>

      {/* Mobile-specific instructions */}
      <div className="relative z-10 mt-4 max-w-md w-full bg-blue-600/90 backdrop-blur-sm border-2 border-blue-400 rounded-xl p-4 text-center md:hidden shadow-lg">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center justify-center gap-2">
          📱 <span>Khusus Mobile:</span>
        </h3>
        <p className="text-xs sm:text-sm text-blue-50 leading-relaxed font-medium">
          Setelah menekan tombol di atas, putar perangkat Anda ke mode landscape untuk pengalaman optimal.
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-6 text-xs text-white font-semibold text-center bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg">
        <p>TFM Game © 2024 - Optimized for Landscape Mode</p>
      </div>
    </div>
  );
};

export default FullscreenLandingPage;