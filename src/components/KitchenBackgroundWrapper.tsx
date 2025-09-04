// src/components/KitchenBackgroundWrapper.tsx - Simplified with Fixed Imports
import React, { ReactNode, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import MusicButton from './MusicButton';
import Image from 'next/image';

interface KitchenBackgroundWrapperProps {
  children: ReactNode;
  sceneTitle?: string;
  sceneDescription?: string;
  backgroundColor?: string;
  isGameActive?: boolean;
  onStartGame?: () => void;
  showStartButton?: boolean;
  gameStatus?: 'loading' | 'ready' | 'playing' | 'demo';
  homeButtonSize?: number; // Prop untuk mengatur ukuran home button
  onHomeButtonSizeChange?: (size: number) => void; // Callback untuk mengubah ukuran
}

const KitchenBackgroundWrapper: React.FC<KitchenBackgroundWrapperProps> = ({
  children,
  sceneTitle = "Game Scene",
  sceneDescription = "Pelajari cara memasak makanan tradisional Maluku",
  backgroundColor = "transparent",
  isGameActive = false,
  onStartGame,
  showStartButton = true,
  gameStatus = 'ready',
  homeButtonSize = 108, // Default size
  onHomeButtonSizeChange
}) => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [currentHomeButtonSize, setCurrentHomeButtonSize] = useState(homeButtonSize);

  // Function untuk mengubah ukuran home button
  const changeHomeButtonSize = (newSize: number) => {
    setCurrentHomeButtonSize(newSize);
    if (onHomeButtonSizeChange) {
      onHomeButtonSizeChange(newSize);
    }
  };

  // Function untuk mendapatkan ukuran home button yang optimal berdasarkan screen size
  const getOptimalHomeButtonSize = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        return 80; // Mobile
      } else if (screenWidth < 1024) {
        return 100; // Tablet
      } else {
        return 120; // Desktop
      }
    }
    return currentHomeButtonSize;
  };

  // Function untuk reset ukuran home button ke default
  const resetHomeButtonSize = () => {
    const optimalSize = getOptimalHomeButtonSize();
    changeHomeButtonSize(optimalSize);
  };

  // Simple Home Button Component
  const HomeButton: React.FC = () => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);

    const handleClick = async () => {
      try {
        setIsActive(true);
        setTimeout(async () => {
          await router.push('/menu');
        }, 150);
      } catch (error) {
        console.error('Navigation error:', error);
        setIsActive(false);
      }
    };

    const getImageSrc = () => {
      if (isActive) return '/assets/ui/buttons/home/home_active.png';
      if (isHovered) return '/assets/ui/buttons/home/home_hover.png';
      return '/assets/ui/buttons/home/home_normal.png';
    };

    return (
      <button
        className="home-button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
      >
        <Image
          src={getImageSrc()}
          alt="Home Button"
          width={currentHomeButtonSize}
          height={currentHomeButtonSize}
          style={{
            width: `${currentHomeButtonSize}px`,
            height: `${currentHomeButtonSize}px`,
            objectFit: 'contain'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.innerHTML = '🏠';
            parent.style.color = '#FFD700';
            parent.style.fontSize = `${currentHomeButtonSize * 0.22}px`;
          }}
        />
      </button>
    );
  };

  // Loading Screen Component
  const LoadingScreen: React.FC = () => (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 style={{ 
          fontSize: '24px',
          fontFamily: 'Chewy, cursive',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#FFD700'
        }}>
          Memuat Game...
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '16px', opacity: 0.9 }}>
          {sceneTitle}
        </p>
      </div>
    </div>
  );

  // Game Start Screen Component
  const GameStartScreen: React.FC = () => (
    <div className="start-game-overlay">
      <div className="start-game-content">
        <h2 className="start-game-title">{sceneTitle}</h2>
        <p className="start-game-description">{sceneDescription}</p>
        
        {showStartButton && onStartGame && (
          <button className="start-game-button" onClick={onStartGame}>
            Mulai Game
          </button>
        )}
        
        {gameStatus === 'demo' && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(255, 193, 7, 0.2))',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.5)'
          }}>
            <p style={{ fontSize: '14px', color: '#FCD34D' }}>
              Game scene belum dimuat. Mode demo akan aktif.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      className="kitchen-wrapper"
      style={{
        backgroundImage: "url('/assets/backgrounds/kitchen.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: backgroundColor
      }}
    >
      {/* Top Header Bar - Always visible */}
      <div className="game-header-bar" style={{ paddingTop: '35px', paddingBottom: '35px' }}>
        {/* Left side - Home button */}
        <div className="game-header-left">
          <HomeButton />
        </div>

        {/* Center - Scene Title */}
        <div className="game-header-center">
          <h1 className="game-header-title">{sceneTitle}</h1>
        </div>

        {/* Right side - Music Button */}
        <div className="game-header-right">
          <MusicButton />
        </div>
      </div>

      {/* Loading Screen */}
      {gameStatus === 'loading' && <LoadingScreen />}

      {/* Game Start Screen */}
      {gameStatus === 'ready' && !isGameActive && <GameStartScreen />}

      {/* Main Game Content Container */}
      <div className="game-container">
        {children}
      </div>
    </div>
  );
};

// Export functions untuk digunakan di luar komponen
export const useHomeButtonSize = () => {
  const [size, setSize] = useState(108);
  
  const changeSize = (newSize: number) => {
    setSize(Math.max(60, Math.min(200, newSize))); // Batasi ukuran antara 60-200px
  };
  
  const resetToDefault = () => setSize(108);
  const setToSmall = () => setSize(80);
  const setToMedium = () => setSize(108);
  const setToLarge = () => setSize(120);
  
  return {
    size,
    changeSize,
    resetToDefault,
    setToSmall,
    setToMedium,
    setToLarge
  };
};

export default KitchenBackgroundWrapper;