// src/components/KitchenBackgroundWrapper.tsx - Simplified with Fixed Imports
import React, { ReactNode, useRef } from 'react';
import { useRouter } from 'next/router';

interface KitchenBackgroundWrapperProps {
  children: ReactNode;
  sceneTitle?: string;
  sceneDescription?: string;
  backgroundColor?: string;
  isGameActive?: boolean;
  onStartGame?: () => void;
  showStartButton?: boolean;
  gameStatus?: 'loading' | 'ready' | 'playing' | 'demo';
}

const KitchenBackgroundWrapper: React.FC<KitchenBackgroundWrapperProps> = ({
  children,
  sceneTitle = "Game Scene",
  sceneDescription = "Pelajari cara memasak makanan tradisional Maluku",
  backgroundColor = "transparent",
  isGameActive = false,
  onStartGame,
  showStartButton = true,
  gameStatus = 'ready'
}) => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

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
      >
        <img
          src={getImageSrc()}
          alt="Home Button"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.innerHTML = '🏠';
            parent.style.color = '#FFD700';
            parent.style.fontSize = '24px';
          }}
        />
      </button>
    );
  };

  // Simple Music Button Component (fallback without context)
  const SimpleMusicButton: React.FC = () => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);

    const handleClick = () => {
      setIsActive(true);
      setIsPlaying(!isPlaying);
      setTimeout(() => setIsActive(false), 150);
    };

    const getImageSrc = () => {
      const prefix = isPlaying ? 'music' : 'nomusic';
      if (isActive) return `/assets/ui/buttons/music/${prefix}_active.png`;
      if (isHovered) return `/assets/ui/buttons/music/${prefix}_hover.png`;
      return `/assets/ui/buttons/music/${prefix}_normal.png`;
    };

    return (
      <button
        className="music-button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        title={isPlaying ? "Matikan Musik" : "Nyalakan Musik"}
      >
        <img
          src={getImageSrc()}
          alt={isPlaying ? "Music On" : "Music Off"}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.innerHTML = isPlaying ? '🔊' : '🔇';
            parent.style.color = '#FFD700';
            parent.style.fontSize = '24px';
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
      <div className="game-header-bar">
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
          <SimpleMusicButton />
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

export default KitchenBackgroundWrapper;