// src/pages/menu.tsx - Updated dengan sistem musik baru
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import GameButton from "../components/GameButton";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper";

const MenuPage: React.FC = () => {
  const router = useRouter();
  const [isExitHovered, setIsExitHovered] = useState(false);
  const [buttonSize, setButtonSize] = useState(140);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const landscape = width > height;

        setIsLandscape(landscape);

        // Dynamic button sizing based on screen size and orientation
        if (width < 480) {
          setButtonSize(100); // Mobile portrait
        } else if (width < 640) {
          setButtonSize(120); // Mobile landscape / small tablet
        } else if (width < 768) {
          setButtonSize(140); // Tablet
        } else if (width < 1024) {
          setButtonSize(160); // Small desktop
        } else {
          setButtonSize(180); // Large desktop
        }
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  // Handler untuk navigasi ke halaman game
  const handleGameNavigation = () => {
    // Navigasi ke src/pages/game/index_game.tsx
    router.push("/game/index_game");
  };

  // Handler untuk exit button
  const handleExit = () => {
    // Close the current tab/window
    if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      window.close();
      // Fallback if window.close() doesn't work
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 100);
    }
  };

  return (
    <MenuBackgroundWrapper>
      {/* MenuBackgroundWrapper sudah include MusicButton otomatis */}

      {/* Exit Button - Top Right Corner */}
      <button
        onClick={handleExit}
        onMouseEnter={() => setIsExitHovered(true)}
        onMouseLeave={() => setIsExitHovered(false)}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
        style={{
          background: isExitHovered
            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          boxShadow: isExitHovered
            ? '0 8px 20px rgba(220, 38, 38, 0.4)'
            : '0 4px 12px rgba(239, 68, 68, 0.3)'
        }}
      >
        ✕ Exit
      </button>

      <div
        className="flex flex-col items-center justify-center h-full px-4 md:px-8"
        style={{
          gap: isLandscape
            ? 'clamp(12px, 3vw, 96px)'
            : 'clamp(20px, 6vw, 192px)'
        }}
      >
        {/* Judul */}
        <div className="text-center">
          <h1
            className="font-chewy font-bold drop-shadow-lg leading-tight mb-2"
            style={{
              color: 'black',
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)'
            }}
          >
            TFM
          </h1>
          <h2
            className="font-chewy font-bold drop-shadow-lg leading-tight"
            style={{
              color: 'black',
              fontSize: 'clamp(1.2rem, 4vw, 3.2rem)'
            }}
          >
            TRADISIONAL FOOD OF MOLLUCAS
          </h2>
        </div>

        {/* Tombol Menu - Dynamic layout based on screen size */}
        <div
          className={`flex ${isLandscape && typeof window !== 'undefined' && window.innerWidth >= 640 ? 'flex-row' : 'flex-col'} items-center justify-center`}
          style={{
            gap: isLandscape
              ? 'clamp(6px, 2vw, 64px)'
              : 'clamp(12px, 3vw, 64px)'
          }}
        >
          <GameButton
            normal="/assets/ui/buttons/credit/credit_normal.png"
            hover="/assets/ui/buttons/credit/credit_hover.png"
            active="/assets/ui/buttons/credit/credit_active.png"
            onClick={() => router.push("/Credit")}
            alt="Credit Button"
            width={buttonSize}
            height={buttonSize}
          />
          <GameButton
            normal="/assets/ui/buttons/play/play_normal.png"
            hover="/assets/ui/buttons/play/play_hover.png"
            active="/assets/ui/buttons/play/play_active.png"
            onClick={() => router.push("/game/index_game")}
            alt="Play Button"
            width={buttonSize}
            height={buttonSize}
          />
          <GameButton
            normal="/assets/ui/buttons/info/info_normal.png"
            hover="/assets/ui/buttons/info/info_hover.png"
            active="/assets/ui/buttons/info/info_active.png"
            onClick={() => router.push("/info")}
            alt="Info Button"
            width={buttonSize}
            height={buttonSize}
          />
        </div>
      </div>
    </MenuBackgroundWrapper>
  );
};

export default MenuPage;
