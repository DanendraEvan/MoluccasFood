// src/pages/info/index.tsx
"use client"; // opsional di Pages Router, tapi aman ditaruh

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MusicButton from '../../components/MusicButton';
import Image from 'next/image';

// Background Wrapper Component
interface BackgroundWrapperProps {
  children: React.ReactNode;
}

const InfoBackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  return (
    <div
      className="w-screen h-screen relative"
      style={{
        backgroundImage: "url('/assets/backgrounds/menu.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {children}
    </div>
  );
};

interface FoodButtonProps {
  foodName: string;
  route: string;
}

const FoodButton: React.FC<FoodButtonProps> = ({ foodName, route }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [buttonSize, setButtonSize] = useState({ width: 240, height: 240 });
  const router = useRouter();

  useEffect(() => {
    const updateButtonSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = width > height;

        // Landscape mode: smaller buttons to fit horizontally
        if (isLandscape) {
          if (width < 640) {
            setButtonSize({ width: 80, height: 80 });
          } else if (width < 768) {
            setButtonSize({ width: 100, height: 100 });
          } else if (width < 1024) {
            setButtonSize({ width: 120, height: 120 });
          } else {
            setButtonSize({ width: 140, height: 140 });
          }
        } else {
          // Portrait mode: larger buttons
          if (width < 480) {
            setButtonSize({ width: 120, height: 120 });
          } else if (width < 640) {
            setButtonSize({ width: 140, height: 140 });
          } else if (width < 768) {
            setButtonSize({ width: 180, height: 180 });
          } else if (width < 1024) {
            setButtonSize({ width: 200, height: 200 });
          } else {
            setButtonSize({ width: 240, height: 240 });
          }
        }
      }
    };

    updateButtonSize();
    window.addEventListener('resize', updateButtonSize);
    return () => window.removeEventListener('resize', updateButtonSize);
  }, []);

  const handleClick = () => {
    setIsActive(true);
    setTimeout(() => {
      router.push(route);
    }, 150);
  };

  const getImageSrc = () => {
    if (isActive) return `/assets/ui/buttons/${foodName}/${foodName}_active.png`;
    if (isHovered) return `/assets/ui/buttons/${foodName}/${foodName}_hover.png`;
    return `/assets/ui/buttons/${foodName}/${foodName}_normal.png`;
  };

  return (
    <div className="bg-transparent" style={{ padding: '0px', margin: '0px' }}>
      <button
        className="transition-transform duration-200 hover:scale-105 focus:outline-none bg-transparent border-none p-0 m-0 block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        onClick={handleClick}
      >
        <Image
          src={getImageSrc()}
          alt={`Button ${foodName}`}
          width={buttonSize.width}
          height={buttonSize.height}
          className="drop-shadow-lg block object-contain"
          style={{
            maxWidth: `${buttonSize.width}px`,
            maxHeight: `${buttonSize.height}px`
          }}
          onError={() => {
            console.log(`Error loading image: ${getImageSrc()}`);
          }}
        />
      </button>
    </div>
  );
};

const HomeButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsActive(true);
    setTimeout(() => {
      router.push('/menu');
    }, 150);
  };

  const getImageSrc = () => {
    if (isActive) return '/assets/ui/buttons/home/home_active.png';
    if (isHovered) return '/assets/ui/buttons/home/home_hover.png';
    return '/assets/ui/buttons/home/home_normal.png';
  };

  return (
    <button
      className="transition-transform duration-200 hover:scale-105 focus:outline-none bg-transparent border-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onClick={handleClick}
    >
      <Image
        src={getImageSrc()}
        alt="Home Button"
        width={80}
        height={80}
        className="w-auto h-auto max-w-[80px] max-h-[80px] drop-shadow-lg"
        style={{
          width: '80px',
          height: '80px',
          objectFit: 'contain'
        }}
      />
    </button>
  );
};

const InfoIndexPage = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [screenSize, setScreenSize] = useState('lg');

  useEffect(() => {
    const updateLayout = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const height = window.innerHeight;

        setIsLandscape(width > height);

        if (width < 480) {
          setScreenSize('xs');
        } else if (width < 640) {
          setScreenSize('sm');
        } else if (width < 768) {
          setScreenSize('md');
        } else if (width < 1024) {
          setScreenSize('lg');
        } else {
          setScreenSize('xl');
        }
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  const foodButtons = [
    { foodName: "kohukohu", route: "/info/3" },
    { foodName: "nasilapola", route: "/info/5" },
    { foodName: "colocolo", route: "/info/2" },
    { foodName: "ikankuahkuning", route: "/info/4" },
    { foodName: "papeda", route: "/info/1" }
  ];

  return (
    <>
      {/* CSS Override */}
      <style jsx global>{`
        button, img, div {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>

      <InfoBackgroundWrapper>
        {/* Home & Music Buttons side by side */}
        <div
          className="absolute z-30 flex items-center space-x-2"
          style={{
            top: 'clamp(16px, 3vw, 22px)',
            left: 'clamp(20px, 5vw, 44px)',
          }}
        >
          <HomeButton />
          <MusicButton
            position="relative"
            top={0}
            left={0}
            size={screenSize === 'xs' ? 60 : 80}
          />
        </div>

        {/* Main Content */}
        <div
          className="flex flex-col items-center justify-center h-full px-4 md:px-8"
          style={{
            gap: isLandscape
              ? 'clamp(12px, 3vw, 96px)'
              : 'clamp(20px, 6vw, 192px)'
          }}
        >

          {/* Title */}
          <div className="text-center">
            <h2
              className="font-chewy font-bold leading-tight"
              style={{
                color: '#2C1810',
                fontSize: isLandscape
                  ? (screenSize === 'xs' ? '1.2rem' : screenSize === 'sm' ? '1.5rem' : '2rem')
                  : (screenSize === 'xs' ? '1.5rem' : screenSize === 'sm' ? '2rem' : screenSize === 'md' ? '2.5rem' : '3rem'),
              }}
            >
              INFORMASI MAKANAN
            </h2>
          </div>

          {/* Food Buttons - Responsive Layout */}
          <div className="flex flex-col items-center">
            {screenSize === 'xs' ? (
              // Mobile: Grid layout 2x3
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                {foodButtons.slice(0, 2).map((button, index) => (
                  <FoodButton key={index} foodName={button.foodName} route={button.route} />
                ))}
                <div className="col-span-2 flex justify-center">
                  <FoodButton foodName={foodButtons[2].foodName} route={foodButtons[2].route} />
                </div>
                {foodButtons.slice(3).map((button, index) => (
                  <FoodButton key={index + 3} foodName={button.foodName} route={button.route} />
                ))}
              </div>
            ) : isLandscape ? (
              // Landscape: horizontal layout for all sizes
              <div className="flex flex-row gap-2 md:gap-4 justify-center items-center flex-wrap max-w-full">
                {foodButtons.map((button, index) => (
                  <FoodButton key={index} foodName={button.foodName} route={button.route} />
                ))}
              </div>
            ) : (
              // Default: 2-3 layout
              <div className="flex flex-col items-center" style={{ gap: '5px' }}>
                <div className="flex flex-row justify-center items-center" style={{ gap: 'clamp(8px, 3vw, 20px)' }}>
                  <FoodButton foodName="kohukohu" route="/info/3" />
                  <FoodButton foodName="nasilapola" route="/info/5" />
                </div>

                <div className="flex flex-row justify-center items-center" style={{ gap: 'clamp(6px, 2vw, 16px)' }}>
                  <FoodButton foodName="colocolo" route="/info/2" />
                  <FoodButton foodName="ikankuahkuning" route="/info/4" />
                  <FoodButton foodName="papeda" route="/info/1" />
                </div>
              </div>
            )}
          </div>
        </div>
      </InfoBackgroundWrapper>
    </>
  );
};

export default InfoIndexPage;
