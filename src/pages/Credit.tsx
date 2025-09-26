// src/pages/Credit.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CreditInfoWrapper from '../components/CreditInfoWrapper';
import MusicButton from '../components/MusicButton';
import Image from 'next/image';

type ButtonState = 'normal' | 'hover' | 'active';

const UI_CONFIG = {
  homeButton: {
    size: 100, // Ukuran home button dalam pixel - diperbesar dari 100
    position: { top: 22, left: 2 }
  },
  titleBox: {
    fontSize: 'clamp(1.2rem, 3vw, 2rem)', // Smaller for landscape
    padding: { x: 'clamp(8px, 3vw, 20px)', y: 'clamp(4px, 1vw, 8px)' }, // Reduced padding
    maxWidth: 'min(90vw, 40rem)' // Smaller max width
  },
  cardContainer: {
    gap: 'clamp(8px, 2vw, 16px)', // Reduced gap
    maxWidth: 'min(95vw, 70rem)',
    padding: { x: 'clamp(8px, 2vw, 16px)', y: 'clamp(16px, 4vw, 32px)' } // Much reduced padding
  }
};

const CreditPage: React.FC = () => {
  const router = useRouter();
  const [homeButtonState, setHomeButtonState] = useState<ButtonState>('normal');
  const [screenSize, setScreenSize] = useState('lg');
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const updateLayout = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const height = window.innerHeight;

        setIsLandscape(width > height);

        if (width < 480) {
          setScreenSize('xs');
        } else if (width < 640) {
          setScreenSize('sm');
        } else if (width < 768) {
          setScreenSize('md');
        } else if (width < 1024) {
          setScreenSize('lg');
        } else {
          setScreenSize('xl');
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
      name: "Carlo Behan Matakena",
      description: "murid SMA Laboratorium Universitas Patimura. Carlo saat ini sedang menempuh pendidikan di kelas XII.",
      image: "/assets/credit/carlo.jpeg"
    },
    {
      name: "Jifdei Yunantin Mauwa",
      description: "murid SMA Laboratorium Universitas Patimura. Jidel saat ini sedang menempuh pendidikan di kelas XII.",
      image: "/assets/credit/jifdei.jpeg"
    },
    {
      name: "Ivandra Immanuela Latumakulita, M.Pd",
      description: "Merupakan guru SMA Laboratorium Universitas Patimura. Pak Ivan merupakan guru pembimbing kami.",
      image: "/assets/credit/ivandra.jpeg"
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
          top: 'clamp(12px, 3vw, 22px)',
          left: 'clamp(10px, 2.5vw, 20px)', // Space from left side of page
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
            width={screenSize === 'xs' ? 60 : screenSize === 'sm' ? 80 : 100}
            height={screenSize === 'xs' ? 60 : screenSize === 'sm' ? 80 : 100}
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