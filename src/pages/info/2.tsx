// src/pages/info/colocolo.tsx
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

// Main Colo-Colo Page Component
const ColocoloPage: React.FC = () => {
  const router = useRouter();

  // Function to navigate to info index page
  const handleBackToInfoPage = (): void => {
    router.push('/info');
  };

  const colocoloContent = `Colo-colo adalah sambal khas Maluku yang memiliki cita rasa pedas dan segar. Sambal ini terbuat dari campuran cabai rawit merah, bawang merah, tomat, dan garam yang diulek kasar hingga tercampur rata. Yang membuat colo-colo unik adalah teksturnya yang tidak terlalu halus, sehingga masih terasa potongan-potongan kecil dari bahan-bahannya. Kadang-kadang ditambahkan perasan jeruk nipis atau jeruk lemon untuk memberikan rasa asam segar yang menyeimbangkan rasa pedasnya. Colo-colo biasanya disajikan sebagai pelengkap berbagai makanan khas Maluku seperti ikan bakar, papeda, atau nasi putih. Sambal ini sangat digemari karena kesegaran dan rasa pedasnya yang khas, serta kemudahan dalam pembuatannya yang tidak memerlukan proses memasak.`;

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