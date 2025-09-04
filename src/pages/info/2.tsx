// src/pages/info/colocolo.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import FoodInfoWrapper from '../../components/FoodInfoWrapper';

type ButtonState = 'normal' | 'hover' | 'active';

// Configuration object untuk pengaturan ukuran
const UI_CONFIG = {
  homeButton: {
    size: 10, // Ukuran home button dalam pixel - diperbesar dari 100
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