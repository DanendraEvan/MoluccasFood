// src/pages/info/papeda.tsx - Updated with corrected navigation
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

// Main Papeda Page Component
const PapedaPage: React.FC = () => {
  const router = useRouter();
  const [homeButtonState, setHomeButtonState] = useState<ButtonState>('normal');

  // Updated function to navigate to info index page
  const handleBackToInfoPage = (): void => {
    router.push('/info'); // Changed from '/menu' to '/info' to match the requested navigation
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

  const papedaContent = `Papeda adalah salah satu olahan sagu yang paling sering ditemukan pada meja makan masyarakat Maluku. Makanan yang seringkali disebut mirip dengan lem ini sebenarnya terbuat dari pati sagu yang dikeringkan, atau yang seringkali disebut Sagu Manta oleh orang Maluku. Papeda dibuat dengan cara mengaduk sagu manta yang sudah dibersihkan menggunakan air dengan air mendidih hingga mengental dan bening. Warna papeda dapat bervariasi dari kecoklatan hingga putih bening, tergantung dari jenis sagu manta yang digunakan. Papeda yang sudah matang memiliki tekstur yang lengket menyerupai lem dan rasa yang hambar, dan bahkan sering dideskripsikan sebagai tidak memiliki rasa khusus. Oleh karena itu, Papeda hampir selalu disajikan bersama makanan berkuah seperti Ikan Kuah Kuning.`;

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
        title="Papeda"
        content={papedaContent}
        backgroundImage="/assets/backgrounds/menu.png"
        onBack={handleBackToInfoPage} // Updated function name to reflect new navigation
        uiConfig={UI_CONFIG}
      />
    </div>
  );
};

export default PapedaPage;