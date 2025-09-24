// src/pages/info/colocolo.tsx
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

// Main Colo-Colo Page Component
const ColocoloPage: React.FC = () => {
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

  const colocoloContent = `Colo-colo adalah sambal khas Maluku yang memiliki cita rasa pedas dan segar. Sambal ini terbuat dari campuran cabai rawit merah, bawang merah, tomat, dan garam yang diulek kasar hingga tercampur rata. Yang membuat colo-colo unik adalah teksturnya yang tidak terlalu halus, sehingga masih terasa potongan-potongan kecil dari bahan-bahannya. Kadang-kadang ditambahkan perasan jeruk nipis atau jeruk lemon untuk memberikan rasa asam segar yang menyeimbangkan rasa pedasnya. Colo-colo biasanya disajikan sebagai pelengkap berbagai makanan khas Maluku seperti ikan bakar, papeda, atau nasi putih. Sambal ini sangat digemari karena kesegaran dan rasa pedasnya yang khas, serta kemudahan dalam pembuatannya yang tidak memerlukan proses memasak.`;

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
        title="Colo-Colo"
        content={colocoloContent}
        backgroundImage="/assets/backgrounds/menu.png"
        onBack={handleBackToInfoPage}
        uiConfig={UI_CONFIG}
      />
    </div>
  );
};

export default ColocoloPage;