// src/pages/info/5.tsx
import React from 'react';
import { useRouter } from 'next/router';
import FoodInfoWrapper from '@/components/FoodInfoWrapper';

const NasiLapolaPage: React.FC = () => {
  const router = useRouter();

  const nasiLapolaContent = `Nasi Lapola adalah hidangan nasi khas Maluku yang memiliki keunikan tersendiri dalam penyajian dan rasanya. Lapola sendiri berasal dari bahasa lokal yang berarti "dicampur" atau "diaduk". Nasi lapola dibuat dari beras yang dimasak dengan santan kelapa dan rempah-rempah seperti pala, cengkeh, dan daong pandan yang memberikan aroma harum dan rasa yang khas. Yang membuat nasi lapola istimewa adalah cara penyajiannya yang dicampur dengan berbagai lauk pauk seperti ikan asin, sayuran, dan kacang merah, sehingga menjadi satu hidangan yang lengkap dan mengenyangkan. Biasanya nasi ini disajikan dalam porsi besar dan dimakan bersama-sama sebagai simbol kebersamaan dalam masyarakat Maluku.`;

  const nutritionInfo = {
    title: 'INFORMASI GIZI',
    points: [
      'Karbohidrat (beras)',
      'Protein (kacang tolo)',
      'Lemak (santan kelapa)',
      'Vitamin dan mineral dalam jumlah sedang',
    ],
  };

  return (
    <FoodInfoWrapper
      title="Nasi Lapola"
      imageSrc="/assets/makanan/nasilapola.webp"
      imageAlt="Nasi Lapola"
      content={nasiLapolaContent}
      onBack={() => router.push('/info')}
      onHome={() => router.push('/menu')}
      nutritionInfo={nutritionInfo}
    />
  );
};

export default NasiLapolaPage;