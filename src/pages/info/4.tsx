// src/pages/info/ikankuahkuning.tsx
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

// Main Ikan Kuah Kuning Page Component
const IkanKuahKuningPage: React.FC = () => {
  const router = useRouter();

  // Function to navigate to info index page
  const handleBackToInfoPage = (): void => {
    router.push('/info');
  };

  const ikanKuahKuningContent = `Ikan Kuah Kuning adalah hidangan berkuah khas Maluku yang memiliki cita rasa gurih, segar, dan kaya rempah. Sesuai namanya, kuah dari hidangan ini berwarna kuning cerah yang berasal dari penggunaan kunyit sebagai bumbu utama. Ikan yang digunakan biasanya adalah ikan laut segar seperti ikan cakalang, tongkol, atau ikan kerapu yang dipotong-potong. Bumbu kuah kuning terdiri dari kunyit, jahe, lengkuas, serai, daun jeruk, cabai, bawang merah, bawang putih, dan santan kelapa. Semua bumbu ditumis hingga harum kemudian ditambah air dan santan hingga mendidih. Ikan kemudian dimasukkan dan dimasak hingga matang sambil menyerap cita rasa kuah yang kaya rempah. Hidangan ini biasanya disajikan dengan nasi putih atau papeda, dan memberikan sensasi hangat serta menyegarkan dengan aroma rempah yang khas.`;

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