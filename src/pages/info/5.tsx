// src/pages/info/nasilapola.tsx
import React from 'react';
import { useRouter } from 'next/router';
import FoodInfoWrapper from '../../components/FoodInfoWrapper';
import Header from '../../components/Header';

// Configuration object untuk pengaturan ukuran
const UI_CONFIG = {
  homeButton: {
    size: 60,
    position: { top: 16, left: 16 }
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

// Main Nasi Lapola Page Component
const NasiLapolaPage: React.FC = () => {
  const router = useRouter();

  // Function to navigate to info index page
  const handleBackToInfoPage = (): void => {
    router.push('/info');
  };

  const nasiLapolaContent = `Nasi Lapola adalah hidangan nasi khas Maluku yang memiliki keunikan tersendiri dalam penyajian dan rasanya. Lapola sendiri berasal dari bahasa lokal yang berarti "dicampur" atau "diaduk". Nasi lapola dibuat dari beras yang dimasak dengan santan kelapa dan rempah-rempah seperti pala, cengkeh, dan daun pandan yang memberikan aroma harum dan rasa yang khas. Yang membuat nasi lapola istimewa adalah cara penyajiannya yang dicampur dengan berbagai lauk pauk seperti ayam suwir, ikan asin, sayuran, dan kerupuk, sehingga menjadi satu hidangan yang lengkap dan mengenyangkan. Biasanya nasi ini disajikan dalam porsi besar dan dimakan bersama-sama sebagai simbol kebersamaan dalam masyarakat Maluku. Cita rasanya yang gurih dari santan dan harum dari rempah-rempah membuat nasi lapola menjadi makanan yang sangat digemari, terutama saat acara-acara adat atau perayaan keluarga.`;

  return (
    <div className="relative">
      <Header />
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

      {/* Food Info Content */}
      <FoodInfoWrapper
        title="Nasi Lapola"
        content={nasiLapolaContent}
        backgroundImage="/assets/backgrounds/menu.png"
        onBack={handleBackToInfoPage}
        uiConfig={UI_CONFIG}
      />
    </div>
  );
};

export default NasiLapolaPage;