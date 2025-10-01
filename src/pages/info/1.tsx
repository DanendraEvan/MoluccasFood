// src/pages/info/1.tsx - Papeda Page with Clean Mobile Design
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

type ButtonState = 'normal' | 'hover' | 'active';

const PapedaPage: React.FC = () => {
  const router = useRouter();
  const [homeButtonState, setHomeButtonState] = useState<ButtonState>('normal');

  const handleBackToInfoPage = (): void => {
    router.push('/info');
  };

  const handleHomeClick = (): void => {
    router.push('/menu');
  };

  const getHomeButtonImage = (): string => {
    switch (homeButtonState) {
      case 'hover':
        return '/assets/ui/buttons/home/home_hover.png';
      case 'active':
        return '/assets/ui/buttons/home/home_active.png';
      default:
        return '/assets/ui/buttons/home/home_normal.png';
    }
  };

  const papedaContent = `Papeda adalah salah satu olahan sagu yang paling sering ditemukan pada meja makan masyarakat Maluku. Makanan yang seringkali disebut mirip dengan lem ini sebenarnya terbuat dari pati sagu yang dikeringkan, atau yang seringkali disebut Sagu Manta oleh orang Maluku. Papeda dibuat dengan cara mengaduk sagu manta yang sudah dibersihkan menggunakan air dengan air mendidih hingga mengental dan bening. Warna papeda dapat bervariasi dari kecoklatan hingga putih bening, tergantung dari jenis sagu manta yang digunakan. Papeda yang sudah matang memiliki tekstur yang lengket menyerupai lem dan rasa yang hambar, dan bahkan sering dideskripsikan sebagai tidak memiliki rasa khusus. `;

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/assets/backgrounds/menu.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f97316',
        padding: '20px 16px',
      }}
    >
      {/* Global CSS */}
      <style jsx global>{`
        button, img, div {
          background-color: transparent !important;
        }
      `}</style>

      {/* Home Button - Top Left */}
      <div
        className="fixed z-50"
        style={{
          top: '16px',
          left: '16px'
        }}
      >
        <button
          onClick={handleHomeClick}
          onMouseEnter={() => setHomeButtonState('hover')}
          onMouseLeave={() => setHomeButtonState('normal')}
          onMouseDown={() => setHomeButtonState('active')}
          onMouseUp={() => setHomeButtonState('hover')}
          className="transition-transform duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          <Image
            src={getHomeButtonImage()}
            alt="Home Button"
            width={56}
            height={56}
            className="w-auto h-auto object-contain"
          />
        </button>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center" style={{ gap: '14px' }}>

        {/* Title Box - Narrower width */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.92) 0%, rgba(160, 82, 45, 0.92) 50%, rgba(123, 104, 238, 0.88) 100%)',
            borderRadius: '18px',
            padding: '12px 20px',
            border: '2px solid rgba(218, 165, 32, 0.5)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            maxWidth: '420px',
            width: '90%',
          }}
        >
          <h1
            className="font-bold text-center text-white m-0"
            style={{
              fontSize: '1.6rem',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
              letterSpacing: '0.02em',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Papeda
          </h1>
        </div>

        {/* Content Box with Image and Text */}
        <div
          className="w-full"
          style={{
            background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.9) 0%, rgba(147, 51, 234, 0.85) 100%)',
            borderRadius: '18px',
            padding: '0',
            border: '2px solid rgba(218, 165, 32, 0.4)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          {/* Container for image and text in horizontal layout with more gap */}
          <div className="flex flex-row items-center" style={{ gap: '0' }}>

            {/* Food Image - Left side with padding wrapper */}
            <div className="flex-shrink-0" style={{ paddingLeft: '1px', paddingRight: '1px' }}>
              <div
                style={{
                  width: '220px',
                  height: '220px',
                  position: 'relative',
                }}
              >
                <Image
                  src="/assets/makanan/papeda.png"
                  alt="Papeda"
                  fill
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                />
              </div>
            </div>

            {/* Text Content - Right side */}
            <div className="flex-1" style={{ padding: '16px 16px 16px 0' }}>
              <p
                className="text-white m-0"
                style={{
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
                  textAlign: 'left',
                  fontWeight: 'normal',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {papedaContent}
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBackToInfoPage}
          className="transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.92) 0%, rgba(184, 134, 11, 0.92) 100%)',
            color: 'white',
            padding: '10px 28px',
            borderRadius: '18px',
            border: '2px solid rgba(218, 165, 32, 0.5)',
            fontSize: '0.9rem',
            fontWeight: '600',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            cursor: 'pointer',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
          }}
        >
          ← Kembali ke Page Info
        </button>
      </div>
    </div>
  );
};

export default PapedaPage;
