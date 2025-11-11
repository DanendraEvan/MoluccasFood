// src/pages/info/3.tsx
import React from 'react';
import { useRouter } from 'next/router';
import FoodInfoWrapper from '@/components/FoodInfoWrapper';

const KohukohuPage: React.FC = () => {
  const router = useRouter();

  const kohukohuContent = `Koho-kohu adalah salah satu makanan khas Maluku yang sangat populer dan mudah ditemukan di berbagai daerah. Makanan ini merupakan sejenis salad segar yang terbuat dari campuran sayuran mentah seperti kacang panjang, kacang tumbu, kangkung, dan kemangi. Yang membuat kohu-kohu istimewa adalah bumbunya yang kaya rempah, terdiri dari kelapa parut. cabai rawit, bawang merah, bawang putih, garam, dan kadang ditambah ikan cakalang. Halo! Mari katong bikin kohu-kohu.`;

  const nutritionInfo = {
    title: 'INFORMASI GIZI',
    points: [
      'Protein (dari ikan tongkol dan sayuran)',
      'Lemak (termasuk omega-3)',
      'Karbohidrat (sayuran dan bumbu)',
      'Vitamin B1, B2, C, A',
      'Mineral (fosfor, kalsium)',
    ],
  };

  return (
    <FoodInfoWrapper
      title="Kohu-Kohu"
      imageSrc="/assets/makanan/kohukohu.webp"
      imageAlt="Kohu-Kohu"
      content={kohukohuContent}
      onBack={() => router.push('/info')}
      onHome={() => router.push('/menu')}
      nutritionInfo={nutritionInfo}
    />
  );
};

export default KohukohuPage;