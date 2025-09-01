// src/pages/game/index_game.tsx - Fixed Navigation
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
  displayName?: string;
}

const FoodButton: React.FC<FoodButtonProps> = ({ foodName, route, displayName }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    try {
      setIsActive(true);
      console.log(`Navigating to: ${route}`); // Debug log
      
      // Menggunakan setTimeout untuk efek visual, kemudian navigate
      setTimeout(async () => {
        await router.push(route);
      }, 150);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsActive(false);
    }
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
        style={{ 
          background: 'transparent',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          outline: 'none'
        }}
      >
        <img
          src={getImageSrc()}
          alt={`Button ${displayName || foodName}`}
          className="w-auto h-auto max-w-[180px] max-h-[180px] md:max-w-[240px] md:max-h-[240px] drop-shadow-lg block"
          style={{ 
            background: 'transparent',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none'
          }}
          onError={(e) => {
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

  const handleClick = async () => {
    try {
      setIsActive(true);
      console.log('Navigating to: /menu'); // Debug log
      
      setTimeout(async () => {
        await router.push('/menu');
      }, 150);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsActive(false);
    }
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
      style={{ 
        background: 'transparent',
        backgroundColor: 'transparent'
      }}
    >
      <img
        src={getImageSrc()}
        alt="Home Button"
        className="w-auto h-auto max-w-[100px] max-h-[100px] md:max-w-[100px] md:max-h-[100px] drop-shadow-lg"
        style={{ 
          background: 'transparent',
          backgroundColor: 'transparent'
        }}
      />
    </button>
  );
};

const InfoIndexPage = () => {
  const router = useRouter();

  // Food button data for easier management
  // Route ke halaman game dengan parameter scene
  const foodButtons = [
    {
      foodName: "kohukohu",
      route: "/game?scene=kohukohu",
      displayName: "Kohu-Kohu"
    },
    {
      foodName: "nasilapola", 
      route: "/game?scene=nasilapola",
      displayName: "Nasi Lapola"
    },
    {
      foodName: "colocolo",
      route: "/game?scene=colocolo", 
      displayName: "Colo-Colo"
    },
    {
      foodName: "ikankuahkuning",
      route: "/game?scene=ikankuahkuning",
      displayName: "Ikan Kuah Kuning"
    },
    {
      foodName: "papeda",
      route: "/game?scene=papeda",
      displayName: "Papeda"
    }
  ];

  return (
    <>
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
      
      <InfoBackgroundWrapper>
        {/* Button Container - Home and Music buttons close together */}
        <div 
          className="absolute z-30 flex items-center"
          style={{
            top: '22px',
            left: '20px',
            gap: '0px'
          }}
        >
          {/* Home Button with negative margin to pull music button closer */}
          <div style={{ marginRight: '-10px', zIndex: 31 }}>
            <HomeButton />
          </div>

          {/* Music Button */}
          <div style={{ zIndex: 30 }}>
            <MusicButton />
          </div>
        </div>
        
        {/* Main Content Container */}
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
          
          {/* Title dengan ukuran custom dan padding yang dapat diatur */}
          <div 
            className="mb-16 md:mb-20"
            style={{
              marginBottom: '20px', // Ganti nilai ini untuk padding bawah judul (dalam px)
            }}
          >
            <h2 
              className="font-chewy font-bold leading-tight text-center"
              style={{ 
                color: '#2C1810',
                background: 'transparent',
                fontSize: '3rem', // Ganti nilai ini untuk ukuran teks (misal: 3rem, 5rem, 6rem, dll)
                paddingLeft: '16px', // Ganti nilai ini untuk padding kiri teks
                paddingRight: '16px', // Ganti nilai ini untuk padding kanan teks
              }}
            >
              MULAI GAME
            </h2>
          </div>

          {/* Food Buttons Grid dalam formasi 2-3 */}
          <div className="flex flex-col items-center gap-8 md:gap-10 mb-16">
            
            {/* Row 1 - Top 2 buttons (Kohu-Kohu dan Nasi Lapola) */}
            <div className="flex flex-row gap-5 md:gap-11 justify-center items-center">
              <FoodButton 
                foodName={foodButtons[0].foodName}
                route={foodButtons[0].route}
                displayName={foodButtons[0].displayName}
              />
              <FoodButton 
                foodName={foodButtons[1].foodName}
                route={foodButtons[1].route}
                displayName={foodButtons[1].displayName}
              />
            </div>

            {/* Row 2 - Bottom 3 buttons (Colo-Colo, Ikan Kuah Kuning, dan Papeda) */}
            <div className="flex flex-row gap-8 md:gap-12 justify-center items-center">
              <FoodButton 
                foodName={foodButtons[2].foodName}
                route={foodButtons[2].route}
                displayName={foodButtons[2].displayName}
              />
              <FoodButton 
                foodName={foodButtons[3].foodName}
                route={foodButtons[3].route}
                displayName={foodButtons[3].displayName}
              />
              <FoodButton 
                foodName={foodButtons[4].foodName}
                route={foodButtons[4].route}
                displayName={foodButtons[4].displayName}
              />
            </div>
          </div>
        </div>
      </InfoBackgroundWrapper>
    </>
  );
};

export default InfoIndexPage;