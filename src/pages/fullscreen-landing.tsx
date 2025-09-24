import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const FullscreenLandingPage: React.FC = () => {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    // Check initial orientation
    const checkOrientation = () => {
      if (window.innerWidth > window.innerHeight) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    // Check initial fullscreen state
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

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(checkOrientation, 100); // Small delay to ensure accurate dimensions
    };

    // Listen for fullscreen changes
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
      // Request fullscreen
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

      // Lock orientation to landscape if available
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock('landscape');
        } catch (error) {
          console.log('Orientation lock not supported or failed:', error);
        }
      }

      // Wait a bit for fullscreen to take effect, then navigate
      setTimeout(() => {
        router.push('/main');
      }, 500);

    } catch (error) {
      console.error('Error entering fullscreen:', error);
      // If fullscreen fails, still navigate but show a message
      alert('Fullscreen tidak didukung di browser ini. Silakan putar layar ke landscape secara manual.');
      router.push('/main');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            TFM - Traditional Food of Mollucas
          </h1>
          <p className="text-gray-600 text-sm">
            Untuk pengalaman terbaik, silakan masuk ke mode fullscreen dan landscape
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Mode Fullscreen:</span>
            <span className={`text-sm font-medium ${isFullscreen ? 'text-green-600' : 'text-red-600'}`}>
              {isFullscreen ? '✓ Aktif' : '✗ Tidak Aktif'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Orientasi:</span>
            <span className={`text-sm font-medium ${orientation === 'landscape' ? 'text-green-600' : 'text-orange-600'}`}>
              {orientation === 'landscape' ? '✓ Landscape' : '📱 Portrait'}
            </span>
          </div>
        </div>

        <button
          onClick={enterFullscreenAndLandscape}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          🚀 Masuk Fullscreen & Mulai Game
        </button>

        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>• Pastikan browser mendukung fullscreen</p>
          <p>• Putar perangkat ke mode landscape</p>
          <p>• Untuk mobile: aktifkan rotasi otomatis</p>
        </div>
      </div>

      {/* Mobile-specific instructions */}
      <div className="mt-4 max-w-md w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-center md:hidden">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Khusus Mobile:</h3>
        <p className="text-xs text-blue-700">
          Setelah menekan tombol di atas, putar perangkat Anda ke mode landscape untuk pengalaman optimal.
        </p>
      </div>
    </div>
  );
};

export default FullscreenLandingPage;