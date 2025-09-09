// src/components/Header.tsx
import React from 'react';
import { useRouter } from 'next/router';
import GameButton from './GameButton';
import MusicButton from './MusicButton';

interface HeaderProps {
  showHomeButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showHomeButton = true }) => {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push('/menu');
  };

  return (
    <div
      className="absolute z-50 flex items-center"
      style={{
        top: '22px',
        left: '20px',
      }}
    >
      {/* Home Button */}
      {showHomeButton && (
        <GameButton
          normal="/assets/ui/buttons/home/home_normal.png"
          hover="/assets/ui/buttons/home/home_hover.png"
          active="/assets/ui/buttons/home/home_active.png"
          alt="Home Button"
          onClick={handleHomeClick}
          width={100}
          height={100}
        />
      )}
      
      {/* Music Button */}
      <div style={{ marginLeft: showHomeButton ? '-15px' : '0' }}>
        <MusicButton size={100} />
      </div>
    </div>
  );
};

export default Header;