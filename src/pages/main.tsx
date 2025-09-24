// src/pages/main.tsx - Main landing page after fullscreen
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper";
import GameButton from "../components/GameButton";

const MainPage = () => {
  const router = useRouter();
  const [buttonSize, setButtonSize] = useState({ width: 350, height: 152 });

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

  return (
    <MenuBackgroundWrapper>
      {/* MenuBackgroundWrapper sudah include MusicButton otomatis */}
      <div
        className="flex flex-col items-center justify-center h-full px-4 md:px-8"
        style={{ gap: 'clamp(20px, 6vw, 160px)' }}
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

        {/* Start Button */}
        <GameButton
          normal="/assets/ui/buttons/start/start_normal.png"
          hover="/assets/ui/buttons/start/start_hover.png"
          active="/assets/ui/buttons/start/start_active.png"
          alt="Start Button"
          onClick={() => router.push("/menu")}
          width={buttonSize.width}
          height={buttonSize.height}
        />
      </div>
    </MenuBackgroundWrapper>
  );
};

export default MainPage;