// src/pages/Credit.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import CreditInfoWrapper from '../components/CreditInfoWrapper';
import MusicButton from '../components/MusicButton';
import Image from 'next/image';

type ButtonState = 'normal' | 'hover' | 'active';

const UI_CONFIG = {
  homeButton: {
    size: 100,
    position: { top: 22, left: 2 }
  },
  titleBox: {
    fontSize: '2.5rem',
    padding: { x: 40, y: 16 },
    maxWidth: '50rem'
  },
  cardContainer: {
    gap: 32,
    maxWidth: '80rem',
    padding: { x: 24, y: 64 }
  }
};

const CreditPage: React.FC = () => {
  const router = useRouter();
  const [homeButtonState, setHomeButtonState] = useState<ButtonState>('normal');

  const handleHomeClick = (): void => {
    router.push('/menu');
  };

  const getHomeButtonImage = (): string => {
    switch (homeButtonState) {
      case 'hover':
        return '/assets/ui/buttons/home/home_hover.png';
      case 'active':
        return '/assets/ui/buttons/home/home_active.png';
      default:
        return '/assets/ui/buttons/home/home_normal.png';
    }
  };

  const developers = [
    {
      name: "Carlo Bohan Matakena",
      description: "murid SMA Laboratorium Universitas Patimura. Carlo saat ini sedang menempuh pendidikan di kelas XII."
    },
    {
      name: "Jidel Yunantin Mauwa",
      description: "murid SMA Laboratorium Universitas Patimura. Jidel saat ini sedang menempuh pendidikan di kelas XII."
    },
    {
      name: "Ivandra Immanuela Latumahulita",
      description: "M.Pd merupakan guru SMA Laboratorium Universitas Patimura. Pak Ivan merupakan guru pembimbing kami."
    }
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <CreditInfoWrapper
        title="INFO PENGEMBANG"
        developers={developers}
        backgroundImage="/assets/backgrounds/menu.png"
        onBack={handleHomeClick}
        uiConfig={UI_CONFIG}
      />

      {/* Button Container - No gap and proper left margin */}
      <div 
        className="absolute z-50 flex items-center"
        style={{
          top: '22px',
          left: '20px', // Space from left side of page
        }}
      >
        {/* Home Button */}
        <button
          onClick={handleHomeClick}
          onMouseEnter={() => setHomeButtonState('hover')}
          onMouseLeave={() => setHomeButtonState('normal')}
          onMouseDown={() => setHomeButtonState('active')}
          onMouseUp={() => setHomeButtonState('hover')}
          className="transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            marginRight: '-15px', // Negative margin to pull music button closer
            zIndex: 51 // Higher z-index to ensure home button is on top
          }}
        >
          <Image
            src={getHomeButtonImage()}
            alt="Home Button"
            width={100}
            height={100}
            style={{ 
              objectFit: 'contain'
            }}
          />
        </button>

        {/* Music Button - No additional spacing */}
        <div style={{ zIndex: 50 }}>
          <MusicButton />
        </div>
      </div>
    </div>
  );
};

export default CreditPage;