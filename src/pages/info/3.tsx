// src/pages/info/kohukohu.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import FoodInfoWrapper from '../../components/FoodInfoWrapper';

type ButtonState = 'normal' | 'hover' | 'active';

// Configuration object untuk pengaturan ukuran
const UI_CONFIG = {
  homeButton: {
    size: 100, // Ukuran home button dalam pixel
    position: { top: 24, left: 24 } // Posisi dari top dan left dalam pixel
  },
  titleBox: {
    fontSize: '1.875rem', // text-3xl equivalent (30px)
    padding: { x: 32, y: 16 }, // padding horizontal dan vertical
    maxWidth: '28rem' // max width container
  },
  contentBox: {
    fontSize: '1rem', // text-base equivalent (16px)
    padding: { x: 32, y: 32 }, // padding horizontal dan vertical  
    maxWidth: '56rem', // max width container
    lineHeight: '1.75' // leading-relaxed equivalent
  },
  backButton: {
    fontSize: '1rem', // ukuran font button
    padding: { x: 24, y: 8 } // padding horizontal dan vertical
  }
};

// Main Kohu-Kohu Page Component
const KohukohutPage: React.FC = () => {
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

  const kohukohutContent = `Kohu-kohu adalah salah satu makanan khas Maluku yang sangat populer dan mudah ditemukan di berbagai daerah. Makanan ini merupakan sejenis salad segar yang terbuat dari campuran sayuran mentah seperti kacang panjang, tauge, kangkung, dan kemangi yang dipotong-potong kecil. Yang membuat kohu-kohu istimewa adalah bumbunya yang kaya rempah, terdiri dari kelapa parut, cabai rawit, bawang merah, bawang putih, garam, dan kadang ditambah ikan teri atau udang kering. Semua bahan dicampur dan diremas-remas hingga bumbu meresap sempurna. Kohu-kohu biasanya disajikan sebagai lalapan pendamping nasi atau makanan pokok lainnya, dan memberikan rasa segar yang menyegarkan dengan sensasi pedas dari cabai rawit.`;

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

      {/* Home Button - Top Left */}
      <div 
        className="fixed z-50"
        style={{ 
          top: `${UI_CONFIG.homeButton.position.top}px`, 
          left: `${UI_CONFIG.homeButton.position.left}px` 
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
            width={UI_CONFIG.homeButton.size}
            height={UI_CONFIG.homeButton.size}
            className="w-auto h-auto"
            style={{
              background: 'transparent',
              backgroundColor: 'transparent'
            }}
          />
        </button>
      </div>

      {/* Food Info Content */}
      <FoodInfoWrapper
        title="Kohu-Kohu"
        content={kohukohutContent}
        backgroundImage="/assets/backgrounds/menu.png"
        onBack={handleBackToInfoPage}
        uiConfig={UI_CONFIG}
      />
    </div>
  );
};

export default KohukohutPage;