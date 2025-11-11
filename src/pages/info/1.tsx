// src/pages/info/1.tsx
import React from 'react';
import { useRouter } from 'next/router';
import FoodInfoWrapper from '@/components/FoodInfoWrapper';

const PapedaPage: React.FC = () => {
  const router = useRouter();

  const papedaContent = `Papeda adalah salah satu olahan sagu yang paling sering ditemukan pada meja makan masyarakat Maluku. Makanan yang seringkali disebut mirip dengan lem ini sebenarnya terbuat dari pati sagu yang dikeringkan, atau yang seringkali disebut Sagu Manta oleh orang Maluku. Papeda dibuat dengan cara mengaduk sagu manta yang sudah dibersihkan menggunakan air dengan air mendidih hingga mengental dan bening. Warna papeda dapat bervariasi dari kecoklatan hingga putih bening, tergantung dari jenis sagu manta yang digunakan. Papeda yang sudah matang memiliki tekstur yang lengket menyerupai lem dan rasa yang hambar, dan bahkan sering dideskripsikan sebagai tidak memiliki rasa khusus. `;

  const nutritionInfo = {
    title: 'INFORMASI GIZI',
    points: [
      'Karbohidrat (sagu)',
      'Serat pangan',
      'Mineral (tembaga, vitamin B1, kalsium, fosfor)',
      'Sangat rendah protein dan lemak',
    ],
  };

  return (
    <FoodInfoWrapper
      title="Papeda"
      imageSrc="/assets/makanan/papeda.webp"
      imageAlt="Papeda"
      content={papedaContent}
      onBack={() => router.push('/info')}
      onHome={() => router.push('/menu')}
      nutritionInfo={nutritionInfo}
    />
  );
};

export default PapedaPage;
