import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface FullscreenExitDetectorProps {
  children: React.ReactNode;
}

const FullscreenExitDetector: React.FC<FullscreenExitDetectorProps> = ({ children }) => {
  const router = useRouter();
  const backButtonCount = useRef(0);
  const lastBackTime = useRef(0);
  const isListening = useRef(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      // If user exits fullscreen, revert to portrait and redirect to landing page
      if (!isFullscreen) {
        // Unlock orientation if possible
        if (screen.orientation && screen.orientation.unlock) {
          try {
            screen.orientation.unlock();
          } catch (error) {
            console.log('Orientation unlock not supported:', error);
          }
        }

        // Redirect to fullscreen landing page
        router.push('/fullscreen-landing');
      }
    };

    const handleVisibilityChange = () => {
      // When user switches tabs or apps, consider it as exiting fullscreen
      if (document.hidden) {
        setTimeout(() => {
          if (document.hidden) {
            // Still hidden after timeout, user likely switched apps
            handleFullscreenChange();
          }
        }, 1000);
      }
    };

    const handleOrientationChange = () => {
      // If orientation changes to portrait, redirect to landing page
      setTimeout(() => {
        if (window.innerHeight > window.innerWidth) {
          router.push('/fullscreen-landing');
        }
      }, 100);
    };

    const handlePopState = () => {
      const currentTime = Date.now();

      // Reset counter if more than 3 seconds have passed
      if (currentTime - lastBackTime.current > 3000) {
        backButtonCount.current = 0;
      }

      backButtonCount.current++;
      lastBackTime.current = currentTime;

      // If back button pressed twice within 3 seconds, exit fullscreen
      if (backButtonCount.current >= 2) {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
        backButtonCount.current = 0;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle hardware back button on Android (maps to Escape key in some browsers)
      if (event.key === 'Escape' || event.keyCode === 27) {
        handlePopState();
      }

      // Handle home button simulation (usually Ctrl+Home or similar combinations)
      if ((event.ctrlKey && event.key === 'Home') || event.key === 'Home') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
      }
    };

    // Mobile-specific event handling
    const handleTouchStart = (event: TouchEvent) => {
      // Detect if user is trying to access browser UI
      if (event.touches.length > 1) {
        // Multi-touch gesture, might be trying to exit fullscreen
        isListening.current = true;
      }
    };

    const handleBeforeUnload = () => {
      // User is leaving the page
      if (screen.orientation && screen.orientation.unlock) {
        try {
          screen.orientation.unlock();
        } catch (error) {
          console.log('Orientation unlock failed:', error);
        }
      }
    };

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router]);

  return <>{children}</>;
};

export default FullscreenExitDetector;