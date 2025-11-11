// src/pages/info/2.tsx
import React from 'react';
import { useRouter } from 'next/router';
import FoodInfoWrapper from '@/components/FoodInfoWrapper';

const ColocoloPage: React.FC = () => {
  const router = useRouter();

  const colocoloContent = `Colo-colo adalah sambal khas Maluku yang memiliki cita rasa pedas dan segar. Sambal ini terbuat dari campuran cabai rawit merah, bawang merah, tomat, dan garam yang diulek kasar hingga tercampur rata. Yang membuat colo-colo unik adalah teksturnya yang tidak terlalu halus, sehingga masih terasa potongan-potongan kecil dari bahan-bahannya. Kadang-kadang ditambahkan perasan lemon cina untuk memberikan rasa asam segar yang menyeimbangkan rasa pedasnya. Colo-colo biasanya disajikan sebagai pelengkap berbagai makanan khas Maluku seperti ikan bakar, papeda, atau nasi putih. `;

  const nutritionInfo = {
    title: 'INFORMASI GIZI',
    points: [
      'Protein (ikan segar)',
      'Vitamin C (jeruk nipis, cabai)',
      'Mineral (dari bumbu dan ikan)',
    ],
  };

  return (
    <FoodInfoWrapper
      title="Colo-Colo"
      imageSrc="/assets/makanan/colocolo.webp"
      imageAlt="Colo-Colo"
      content={colocoloContent}
      onBack={() => router.push('/info')}
      onHome={() => router.push('/menu')}
      nutritionInfo={nutritionInfo}
    />
  );
};

export default ColocoloPage;