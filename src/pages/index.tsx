// src/pages/index.tsx (LandingPage) - Updated dengan sistem musik baru
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper";
import GameButton from "../components/GameButton";

const LandingPage = () => {
  const router = useRouter();
  const [buttonSize, setButtonSize] = useState({ width: 350, height: 152 });

  useEffect(() => {
    // Redirect semua user ke fullscreen-landing tanpa terkecuali
    router.replace('/fullscreen-landing');
  }, [router]);

  useEffect(() => {
    const updateButtonSize = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isLandscape = screenWidth > screenHeight;

        // More responsive sizing based on screen size and orientation
        if (screenWidth < 480) { // xs
          setButtonSize({ width: 200, height: 86 });
        } else if (screenWidth < 640) { // sm
          setButtonSize({
            width: isLandscape ? 280 : 250,
            height: isLandscape ? 120 : 108
          });
        } else if (screenWidth < 768) { // md
          setButtonSize({ width: 300, height: 130 });
        } else if (screenWidth < 1024) { // lg
          setButtonSize({ width: 320, height: 138 });
        } else { // xl
          setButtonSize({ width: 350, height: 152 });
        }
      }
    };

    updateButtonSize();
    window.addEventListener('resize', updateButtonSize);
    window.addEventListener('orientationchange', updateButtonSize);

    return () => {
      window.removeEventListener('resize', updateButtonSize);
      window.removeEventListener('orientationchange', updateButtonSize);
    };
  }, []);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to fullscreen mode...</p>
      </div>
    </div>
  );
};

export default LandingPage;