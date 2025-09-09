// src/pages/info/kohukohu.tsx
import React from 'react';
import { useRouter } from 'next/router';
import FoodInfoWrapper from '../../components/FoodInfoWrapper';
import Header from '../../components/Header';

// Configuration object untuk pengaturan ukuran
const UI_CONFIG = {
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

  // Function to navigate to info index page
  const handleBackToInfoPage = (): void => {
    router.push('/info');
  };

  const kohukohutContent = `Kohu-kohu adalah salah satu makanan khas Maluku yang sangat populer dan mudah ditemukan di berbagai daerah. Makanan ini merupakan sejenis salad segar yang terbuat dari campuran sayuran mentah seperti kacang panjang, tauge, kangkung, dan kemangi yang dipotong-potong kecil. Yang membuat kohu-kohu istimewa adalah bumbunya yang kaya rempah, terdiri dari kelapa parut, cabai rawit, bawang merah, bawang putih, garam, dan kadang ditambah ikan teri atau udang kering. Semua bahan dicampur dan diremas-remas hingga bumbu meresap sempurna. Kohu-kohu biasanya disajikan sebagai lalapan pendamping nasi atau makanan pokok lainnya, dan memberikan rasa segar yang menyegarkan dengan sensasi pedas dari cabai rawit.`;

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