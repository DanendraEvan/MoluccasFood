// src/components/MusicButton.tsx - FIXED: With loading state indicator
import React, { useState } from 'react';
import { useMusic } from '../contexts/MusicContext';

interface MusicButtonProps {
  className?: string;
  style?: React.CSSProperties;
  position?: 'fixed' | 'absolute' | 'relative';
  top?: number;
  left?: number;
  size?: number;
}

const MusicButton: React.FC<MusicButtonProps> = ({ 
  className = '', 
  style = {},
  position, 
  top, 
  left, 
  size = 100
}) => {
  const { isPlaying, toggleMusic, currentTrack, isLoading, hasUserInteracted } = useMusic();
  const [buttonState, setButtonState] = useState<'normal' | 'hover' | 'active'>('normal');

  const getButtonImage = (): string => {
    const prefix = isPlaying ? 'music' : 'nomusic';
    return `/assets/ui/buttons/music/${prefix}_${buttonState}.png`;
  };

  const buttonStyle: React.CSSProperties = {
    zIndex: 1000,
    background: 'transparent',
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    boxShadow: 'none',
    outline: 'none',
    cursor: isLoading ? 'wait' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    ...style
  };

  const getTitle = (): string => {
    if (!hasUserInteracted) {
      return 'Klik untuk memulai musik';
    }
    if (isLoading) {
      return `Loading BGM${currentTrack}...`;
    }
    return `${isPlaying ? 'Matikan' : 'Nyalakan'} Musik - BGM${currentTrack}`;
  };

  return (
    <button
      onClick={toggleMusic}
      onMouseEnter={() => !isLoading && setButtonState('hover')}
      onMouseLeave={() => !isLoading && setButtonState('normal')}
      onMouseDown={() => !isLoading && setButtonState('active')}
      onMouseUp={() => !isLoading && setButtonState('hover')}
      className={`transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none ${className}`}
      style={buttonStyle}
      title={getTitle()}
      disabled={isLoading}
    >
      <div className="relative">
        <img
          src={getButtonImage()}
          alt={`${isPlaying ? 'Music On' : 'Music Off'} Button`}
          className="w-auto h-auto max-w-[100px] max-h-[100px] md:max-w-[100px] md:max-h-[100px] drop-shadow-lg"
          style={{ 
            background: 'transparent',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none'
          }}
          onError={(e) => {
            console.log(`❌ Error loading music button image: ${getButtonImage()}`);
          }}
        />
        {/* User interaction indicator */}
        {!hasUserInteracted && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
            !
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </button>
  );
};

export default MusicButton;