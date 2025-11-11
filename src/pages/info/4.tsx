// src/pages/info/4.tsx
import React from 'react';
import { useRouter } from 'next/router';
import FoodInfoWrapper from '@/components/FoodInfoWrapper';

const IkanKuahKuningPage: React.FC = () => {
  const router = useRouter();

  const ikanKuahKuningContent = `Ikan kuah kuning adalah hidangan berkuah khas Maluku yang memiliki cita rasa gurih, segar, dan kaya rempah. Sesuai namanya, kuah dari hidangan ini berwarna kuning cerah yang berasal dari penggunaan kuning sebagai bumbu utama. Ikan yang digunakan biasanya adalah ikan laut segar seperti ikan cakalang, ikan komu, atau ikan garopa yang dipotong-potong. Bumbu kuah kuning terdiri dari kuning, halia, lengkuas, serai, daun jeruk, cabai, bawang merah, bawang putih, dan santan kelapa. Semua bumbu ditumis hingga harum kemudian ditambah air dan santan hingga mendidih. Ikan kemudian dimasukkan dan dimasak hingga matang sambil menyerap cita rasa kuah yang kaya rempah.`;

  const nutritionInfo = {
    title: 'INFORMASI GIZI',
    points: [
      'Protein',
      'Lemak sehat (termasuk omega-3)',
      'Karbohidrat dari bumbu (rempah seperti kunyit, bawang, jahe)',
      'Vitamin dan mineral (vitamin A, C, zat besi)',
    ],
  };

  return (
    <FoodInfoWrapper
      title="Ikan Kuah Kuning"
      imageSrc="/assets/makanan/ikankuahkuning.webp"
      imageAlt="Ikan Kuah Kuning"
      content={ikanKuahKuningContent}
      onBack={() => router.push('/info')}
      onHome={() => router.push('/menu')}
      nutritionInfo={nutritionInfo}
    />
  );
};

export default IkanKuahKuningPage;