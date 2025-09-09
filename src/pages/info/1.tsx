// src/pages/info/papeda.tsx - Updated with corrected navigation
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

// Main Papeda Page Component
const PapedaPage: React.FC = () => {
  const router = useRouter();

  // Updated function to navigate to info index page
  const handleBackToInfoPage = (): void => {
    router.push('/info'); // Changed from '/menu' to '/info' to match the requested navigation
  };

  const papedaContent = `Papeda adalah salah satu olahan sagu yang paling sering ditemukan pada meja makan masyarakat Maluku. Makanan yang seringkali disebut mirip dengan lem ini sebenarnya terbuat dari pati sagu yang dikeringkan, atau yang seringkali disebut Sagu Manta oleh orang Maluku. Papeda dibuat dengan cara mengaduk sagu manta yang sudah dibersihkan menggunakan air dengan air mendidih hingga mengental dan bening. Warna papeda dapat bervariasi dari kecoklatan hingga putih bening, tergantung dari jenis sagu manta yang digunakan. Papeda yang sudah matang memiliki tekstur yang lengket menyerupai lem dan rasa yang hambar, dan bahkan sering dideskripsikan sebagai tidak memiliki rasa khusus. Oleh karena itu, Papeda hampir selalu disajikan bersama makanan berkuah seperti Ikan Kuah Kuning.`;

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