// src/pages/Credit.tsx
import React from 'react';
import { useRouter } from 'next/router';
import CreditInfoWrapper from '../components/CreditInfoWrapper';
import Header from '../components/Header';

const UI_CONFIG = {
  homeButton: {
    size: 64,
    position: { top: 24, left: 24 }
  },
  titleBox: {
    fontSize: '2.5rem',
    padding: { x: 40, y: 16 },
    maxWidth: '50rem'
  },
  cardContainer: {
    gap: 32,
    maxWidth: '80rem',
    padding: { x: 24, y: 64 }
  }
};

const CreditPage: React.FC = () => {
  const router = useRouter();

  const handleHomeClick = (): void => {
    router.push('/menu');
  };

  const developers = [
    {
      name: "Carlo Bohan Matakena",
      description: "murid SMA Laboratorium Universitas Patimura. Carlo saat ini sedang menempuh pendidikan di kelas XII.",
      image: "/assets/credit/carlo.jpeg"
    },
    {
      name: "Jidel Yunantin Mauwa",
      description: "murid SMA Laboratorium Universitas Patimura. Jidel saat ini sedang menempuh pendidikan di kelas XII.",
      image: "/assets/credit/jifdei.jpeg"
    },
    {
      name: "Ivandra Immanuela Latumahulita",
      description: "M.Pd merupakan guru SMA Laboratorium Universitas Patimura. Pak Ivan merupakan guru pembimbing kami.",
      image: "/assets/credit/ivandra.jpeg"
    }
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Header />
      <CreditInfoWrapper
        title="INFO PENGEMBANG"
        developers={developers}
        backgroundImage="/assets/backgrounds/menu.png"
        onBack={handleHomeClick}
        uiConfig={UI_CONFIG}
      />
    </div>
  );
};

export default CreditPage;