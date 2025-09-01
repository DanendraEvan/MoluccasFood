// src/pages/info/index.tsx
"use client"; // opsional di Pages Router, tapi aman ditaruh

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import MusicButton from '../../components/MusicButton';

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
  const router = useRouter();

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
    <div className="p-4 bg-transparent">
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
        <img
          src={getImageSrc()}
          alt={`Button ${foodName}`}
          className="w-auto h-auto max-w-[180px] max-h-[180px] md:max-w-[240px] md:max-h-[240px] drop-shadow-lg block"
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
      <img
        src={getImageSrc()}
        alt="Home Button"
        className="w-auto h-auto max-w-[100px] max-h-[100px] md:max-w-[100px] md:max-h-[100px] drop-shadow-lg"
      />
    </button>
  );
};

const InfoIndexPage = () => {
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
          className="absolute top-4 left-4 z-30 flex items-center space-x-2"
          style={{
            top: '22px',
            left: '44px',
          }}
        >
          <HomeButton />
          <MusicButton 
            position="relative"
            top={0}
            left={0}
            size={100}
          />
        </div>
        
        {/* Title */}
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
          <div className="mb-16 md:mb-20">
            <h2 
              className="font-chewy font-bold leading-tight text-center"
              style={{ 
                color: '#2C1810',
                fontSize: '3rem',
              }}
            >
              INFORMASI MAKANAN
            </h2>
          </div>

          {/* Food Buttons */}
          <div className="flex flex-col items-center gap-8 md:gap-10 mb-16">
            <div className="flex flex-row gap-5 md:gap-11 justify-center items-center">
              <FoodButton foodName="kohukohu" route="/info/3" />
              <FoodButton foodName="nasilapola" route="/info/5" />
            </div>

            <div className="flex flex-row gap-8 md:gap-12 justify-center items-center">
              <FoodButton foodName="colocolo" route="/info/2" />
              <FoodButton foodName="ikankuahkuning" route="/info/4" />
              <FoodButton foodName="papeda" route="/info/1" />
            </div>
          </div>
        </div>
      </InfoBackgroundWrapper>
    </>
  );
};

export default InfoIndexPage;
