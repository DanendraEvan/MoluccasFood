// src/pages/info/ikankuahkuning.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import FoodInfoWrapper from '../../components/FoodInfoWrapper';

type ButtonState = 'normal' | 'hover' | 'active';

// Configuration object untuk pengaturan ukuran - Responsive
const UI_CONFIG = {
  homeButton: {
    size: 'clamp(80px, 12vw, 120px)', // Responsive size
    position: {
      top: 'clamp(16px, 3vw, 24px)',
      left: 'clamp(16px, 3vw, 24px)'
    }
  },
  titleBox: {
    fontSize: 'clamp(1.25rem, 4vw, 1.875rem)', // Responsive font size
    padding: {
      x: 'clamp(16px, 4vw, 32px)',
      y: 'clamp(12px, 2vw, 16px)'
    },
    maxWidth: 'min(90vw, 28rem)' // Responsive max width
  },
  contentBox: {
    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', // Responsive font size
    padding: {
      x: 'clamp(16px, 4vw, 32px)',
      y: 'clamp(16px, 4vw, 32px)'
    },
    maxWidth: 'min(95vw, 56rem)', // Responsive max width
    lineHeight: 'clamp(1.5, 2vw, 1.75)' // Responsive line height
  },
  backButton: {
    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', // Responsive font size
    padding: {
      x: 'clamp(16px, 3vw, 24px)',
      y: 'clamp(6px, 1.5vw, 8px)'
    }
  }
};

// Main Ikan Kuah Kuning Page Component
const IkanKuahKuningPage: React.FC = () => {
  const router = useRouter();
  const [homeButtonState, setHomeButtonState] = useState<ButtonState>('normal');

  // Function to navigate to info index page
  const handleBackToInfoPage = (): void => {
    router.push('/info');
  };

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

  const ikanKuahKuningContent = `Ikan Kuah Kuning adalah hidangan berkuah khas Maluku yang memiliki cita rasa gurih, segar, dan kaya rempah. Sesuai namanya, kuah dari hidangan ini berwarna kuning cerah yang berasal dari penggunaan kunyit sebagai bumbu utama. Ikan yang digunakan biasanya adalah ikan laut segar seperti ikan cakalang, tongkol, atau ikan kerapu yang dipotong-potong. Bumbu kuah kuning terdiri dari kunyit, jahe, lengkuas, serai, daun jeruk, cabai, bawang merah, bawang putih, dan santan kelapa. Semua bumbu ditumis hingga harum kemudian ditambah air dan santan hingga mendidih. Ikan kemudian dimasukkan dan dimasak hingga matang sambil menyerap cita rasa kuah yang kaya rempah. Hidangan ini biasanya disajikan dengan nasi putih atau papeda, dan memberikan sensasi hangat serta menyegarkan dengan aroma rempah yang khas.`;

  return (
    <div className="relative">
      {/* Global CSS untuk menghilangkan semua background abu-abu */}
      <style jsx global>{`
        button, img, div {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        .next-image-wrapper, 
        .next-image, 
        [data-nimg], 
        img[data-nimg] {
          background: transparent !important;
          background-color: transparent !important;
        }
      `}</style>

      {/* Home Button - Top Left - Responsive */}
      <div
        className="fixed z-50"
        style={{
          top: UI_CONFIG.homeButton.position.top,
          left: UI_CONFIG.homeButton.position.left
        }}
      >
        <button
          onClick={handleHomeClick}
          onMouseEnter={() => setHomeButtonState('hover')}
          onMouseLeave={() => setHomeButtonState('normal')}
          onMouseDown={() => setHomeButtonState('active')}
          onMouseUp={() => setHomeButtonState('hover')}
          className="transition-transform duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            boxShadow: 'none'
          }}
        >
          <Image
            src={getHomeButtonImage()}
            alt="Home Button"
            width={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
            height={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
            className="w-auto h-auto object-contain"
            style={{
              background: 'transparent',
              backgroundColor: 'transparent',
              maxWidth: UI_CONFIG.homeButton.size,
              maxHeight: UI_CONFIG.homeButton.size
            }}
          />
        </button>
      </div>

      {/* Food Info Content */}
      <FoodInfoWrapper
        title="Ikan Kuah Kuning"
        content={ikanKuahKuningContent}
        backgroundImage="/assets/backgrounds/menu.png"
        onBack={handleBackToInfoPage}
        uiConfig={UI_CONFIG}
      />
    </div>
  );
};

export default IkanKuahKuningPage;