// src/components/KitchenBackgroundWrapper.tsx - Enhanced with Centralized Dialog System
import React, { ReactNode, useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import MusicButton from './MusicButton';
import Image from 'next/image';
import { useResponsiveDialog, getDialogStyles, getInfoPanelStyles } from '../hooks/useResponsiveDialog';

// Dialog step interface
interface DialogStep {
  id: number;
  text: string;
  character?: string;
  requiredAction?: string;
  onStepComplete?: () => void;
}

// Food hint information interface
interface FoodHintInfo {
  title: string;
  content: string;
  image?: string;
}

// Food information data
const FOOD_HINTS: Record<string, FoodHintInfo> = {
  kohukohu: {
    title: 'Kohu-Kohu',
    content: 'Kohu-kohu adalah salah satu makanan khas Maluku yang sangat populer dan mudah ditemukan di berbagai daerah. Makanan ini merupakan sejenis salad segar yang terbuat dari campuran sayuran mentah seperti kacang panjang, tauge, kangkung, dan kemangi yang dipotong-potong kecil. Yang membuat kohu-kohu istimewa adalah bumbunya yang kaya rempah, terdiri dari kelapa parut, cabai rawit, bawang merah, bawang putih, garam, dan kadang ditambah ikan teri atau udang kering. Semua bahan dicampur dan diremas-remas hingga bumbu meresap sempurna. Kohu-kohu biasanya disajikan sebagai lalapan pendamping nasi atau makanan pokok lainnya, dan memberikan rasa segar yang menyegarkan dengan sensasi pedas dari cabai rawit.'
  },
  colocolo: {
    title: 'Sambal Colo-Colo',
    content: 'Sambal Colo-Colo adalah sambal khas dari daerah Maluku yang terkenal dengan rasa segar, pedas, dan sedikit asam. Sambal ini tidak diulek sampai halus, melainkan hanya berupa irisan bahan-bahan mentah yang dicampur menjadi satu. Bahan utamanya adalah cabai rawit, bawang merah, tomat, dan perasan jeruk nipis yang memberikan kesegaran. Biasanya, sambal ini disiram dengan sedikit kecap manis dan minyak kelapa panas. Colo-colo sangat cocok disajikan sebagai pendamping ikan bakar atau hidangan laut lainnya.'
  },
  nasilapola: {
    title: 'Nasi Lapola',
    content: 'Nasi Lapola adalah hidangan nasi khas Maluku yang memiliki keunikan tersendiri dalam penyajian dan rasanya. Lapola sendiri berasal dari bahasa lokal yang berarti "dicampur" atau "diaduk". Nasi lapola dibuat dari beras yang dimasak dengan santan kelapa dan rempah-rempah seperti pala, cengkeh, dan daun pandan yang memberikan aroma harum dan rasa yang khas. Yang membuat nasi lapola istimewa adalah cara penyajiannya yang dicampur dengan berbagai lauk pauk seperti ayam suwir, ikan asin, sayuran, dan kerupuk, sehingga menjadi satu hidangan yang lengkap dan mengenyangkan. Biasanya nasi ini disajikan dalam porsi besar dan dimakan bersama-sama sebagai simbol kebersamaan dalam masyarakat Maluku. Cita rasanya yang gurih dari santan dan harum dari rempah-rempah membuat nasi lapola menjadi makanan yang sangat digemari, terutama saat acara-acara adat atau perayaan keluarga.'
  },
  papeda: {
    title: 'Papeda',
    content: 'Papeda adalah salah satu olahan sagu yang paling sering ditemukan pada meja makan masyarakat Maluku. Makanan yang seringkali disebut mirip dengan lem ini sebenarnya terbuat dari pati sagu yang dikeringkan, atau yang seringkali disebut Sagu Manta oleh orang Maluku. Papeda dibuat dengan cara mengaduk sagu manta yang sudah dibersihkan menggunakan air dengan air mendidih hingga mengental dan bening. Warna papeda dapat bervariasi dari kecoklatan hingga putih bening, tergantung dari jenis sagu manta yang digunakan. Papeda yang sudah matang memiliki tekstur yang lengket menyerupai lem dan rasa yang hambar, dan bahkan sering dideskripsikan sebagai tidak memiliki rasa khusus. Oleh karena itu, Papeda hampir selalu disajikan bersama makanan berkuah seperti Ikan Kuah Kuning.'
  },
  ikankuahkuning: {
    title: 'Ikan Kuah Kuning',
    content: 'Ikan Kuah Kuning adalah masakan khas Maluku dan Papua yang terkenal dengan kuah berwarna kuning cerah yang berasal dari penggunaan kunyit sebagai bumbu utama. Ikan yang digunakan biasanya adalah ikan laut segar seperti ikan cakalang, tongkol, atau ikan kerapu yang dipotong-potong. Bumbu kuah kuning terdiri dari kunyit, jahe, lengkuas, serai, daun jeruk, cabai, bawang merah, bawang putih, dan santan kelapa. Semua bumbu ditumis hingga harum kemudian ditambah air dan santan hingga mendidih. Ikan kemudian dimasukkan dan dimasak hingga matang sambil menyerap cita rasa kuah yang kaya rempah. Hidangan ini biasanya disajikan dengan nasi putih atau papeda, dan memberikan sensasi hangat serta menyegarkan dengan aroma rempah yang khas.'
  }
};

// Dialog system props
interface DialogSystemProps {
  steps: DialogStep[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  onDialogToggle?: (isOpen: boolean) => void;
  sceneName?: string;
}

interface KitchenBackgroundWrapperProps {
  children: ReactNode;
  sceneTitle?: string;
  sceneDescription?: string;
  backgroundColor?: string;
  isGameActive?: boolean;
  onStartGame?: () => void;
  showStartButton?: boolean;
  gameStatus?: 'loading' | 'ready' | 'playing' | 'demo';
  homeButtonSize?: number;
  onHomeButtonSizeChange?: (size: number) => void;
  // New dialog system props
  dialogSteps?: DialogStep[];
  currentDialogStep?: number;
  onDialogStepChange?: (step: number) => void;
  onDialogToggle?: (isOpen: boolean) => void;
  showDialog?: boolean;
  sceneName?: string;
  // Hint system props
  foodType?: 'kohukohu' | 'colocolo' | 'nasilapola' | 'papeda' | 'ikankuahkuning';
  showHintButton?: boolean;
}

const KitchenBackgroundWrapper: React.FC<KitchenBackgroundWrapperProps> = ({
  children,
  sceneTitle = "Game Scene",
  sceneDescription = "Pelajari cara memasak makanan tradisional Maluku",
  backgroundColor = "transparent",
  isGameActive = false,
  onStartGame,
  showStartButton = true,
  gameStatus = 'ready',
  homeButtonSize = 108,
  onHomeButtonSizeChange,
  // Dialog system props
  dialogSteps = [],
  currentDialogStep = 0,
  onDialogStepChange,
  onDialogToggle,
  showDialog = true,
  sceneName = "unknown",
  // Hint system props
  foodType,
  showHintButton = true
}) => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [currentHomeButtonSize, setCurrentHomeButtonSize] = useState(homeButtonSize);

  // Responsive layout hook
  const responsiveLayout = useResponsiveDialog();

  // Dialog system state
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(currentDialogStep);

  // Hint system state
  const [isHintPopupOpen, setIsHintPopupOpen] = useState(false);

  // Update current step when prop changes
  useEffect(() => {
    setCurrentStep(currentDialogStep);
  }, [currentDialogStep]);

  // Dialog toggle handler
  const handleDialogToggle = useCallback(() => {
    const newIsOpen = !isDialogOpen;
    setIsDialogOpen(newIsOpen);
    onDialogToggle?.(newIsOpen);
  }, [isDialogOpen, onDialogToggle]);

  // Step navigation
  const handleStepChange = useCallback((step: number) => {
    if (step >= 0 && step < dialogSteps.length) {
      setCurrentStep(step);
      onDialogStepChange?.(step);
    }
  }, [dialogSteps.length, onDialogStepChange]);

  // Hint popup handlers
  const handleHintToggle = useCallback(() => {
    setIsHintPopupOpen(!isHintPopupOpen);
  }, [isHintPopupOpen]);

  const handleHintClose = useCallback(() => {
    setIsHintPopupOpen(false);
  }, []);

  // Get current food info
  const currentFoodInfo = foodType ? FOOD_HINTS[foodType] : null;

  // Function untuk mengubah ukuran home button
  const changeHomeButtonSize = (newSize: number) => {
    setCurrentHomeButtonSize(newSize);
    if (onHomeButtonSizeChange) {
      onHomeButtonSizeChange(newSize);
    }
  };

  // Function untuk mendapatkan ukuran home button yang optimal berdasarkan screen size
  const getOptimalHomeButtonSize = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        return 80; // Mobile
      } else if (screenWidth < 1024) {
        return 100; // Tablet
      } else {
        return 120; // Desktop
      }
    }
    return currentHomeButtonSize;
  };

  // Function untuk reset ukuran home button ke default
  const resetHomeButtonSize = () => {
    const optimalSize = getOptimalHomeButtonSize();
    changeHomeButtonSize(optimalSize);
  };

  // Simple Home Button Component
  const HomeButton: React.FC = () => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);

    const handleClick = async () => {
      try {
        setIsActive(true);
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
        className="home-button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsActive(false);
        }}
        onMouseDown={() => setIsActive(true)}
        onMouseUp={() => setIsActive(false)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
      >
        <Image
          src={getImageSrc()}
          alt="Home Button"
          width={currentHomeButtonSize}
          height={currentHomeButtonSize}
          style={{
            width: `${currentHomeButtonSize}px`,
            height: `${currentHomeButtonSize}px`,
            objectFit: 'contain'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.innerHTML = '🏠';
            parent.style.color = '#FFD700';
            parent.style.fontSize = `${currentHomeButtonSize * 0.22}px`;
          }}
        />
      </button>
    );
  };

  // Loading Screen Component
  const LoadingScreen: React.FC = () => (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 style={{ 
          fontSize: '24px',
          fontFamily: 'Chewy, cursive',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#FFD700'
        }}>
          Memuat Game...
        </h2>
        <p style={{ fontSize: '16px', marginBottom: '16px', opacity: 0.9 }}>
          {sceneTitle}
        </p>
      </div>
    </div>
  );

  // Game Start Screen Component
  const GameStartScreen: React.FC = () => (
    <div className="start-game-overlay">
      <div className="start-game-content">
        <h2 className="start-game-title">{sceneTitle}</h2>
        <p className="start-game-description">{sceneDescription}</p>

        {showStartButton && onStartGame && (
          <button className="start-game-button" onClick={onStartGame}>
            Mulai Game
          </button>
        )}

        {gameStatus === 'demo' && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(255, 193, 7, 0.2))',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.5)'
          }}>
            <p style={{ fontSize: '14px', color: '#FCD34D' }}>
              Game scene belum dimuat. Mode demo akan aktif.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Dialog Toggle Button Component
  const DialogToggleButton: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const getButtonSrc = () => {
      const buttonType = isDialogOpen ? 'down' : 'up';
      if (isPressed) return `/assets/ui/buttons/${buttonType}/${buttonType}_active.png`;
      if (isHovered) return `/assets/ui/buttons/${buttonType}/${buttonType}_hover.png`;
      return `/assets/ui/buttons/${buttonType}/${buttonType}_normal.png`;
    };

    return (
      <button
        onClick={handleDialogToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        style={{
          position: 'absolute',
          top: isDialogOpen
            ? `${responsiveLayout.dialog.y + responsiveLayout.dialog.height + 5}px`
            : `${responsiveLayout.dialog.y + (responsiveLayout.dialog.collapsedHeight || responsiveLayout.dialog.height * 0.3) + 5}px`,
          right: '50%',
          transform: `translateX(50%) scale(${isPressed ? 0.95 : 1})`,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'top 0.3s ease, transform 0.1s ease',
          padding: 0,
          margin: 0,
          outline: 'none'
        }}
        aria-label={isDialogOpen ? "Tutup Dialog" : "Buka Dialog"}
      >
        <Image
          src={getButtonSrc()}
          alt={isDialogOpen ? "Close Dialog" : "Open Dialog"}
          width={responsiveLayout.isMobile ? 40 : 62}
          height={responsiveLayout.isMobile ? 40 : 62}
          style={{
            objectFit: 'contain',
            display: 'block'
          }}
          onError={(e) => {
            // Fallback to arrow symbols if images not found
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement!;
            parent.innerHTML = isDialogOpen ? '▼' : '▲';
            parent.style.fontSize = '43px'; // Increased by 15px (28 + 15)
            parent.style.color = '#8B4513';
            parent.style.fontWeight = 'bold';
            parent.style.display = 'flex';
            parent.style.alignItems = 'center';
            parent.style.justifyContent = 'center';
            parent.style.width = '62px'; // Match new button size
            parent.style.height = '62px'; // Match new button size
            parent.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            parent.style.borderRadius = '31px'; // Half of width/height for perfect circle
            parent.style.border = '2px solid #8B4513';
          }}
        />
      </button>
    );
  };

  // Dialog Panel Component
  const DialogPanel: React.FC = () => {
    if (!showDialog || dialogSteps.length === 0) return null;

    const currentStepData = dialogSteps[currentStep];
    if (!currentStepData) return null;

    // Get responsive dialog styles
    const dialogStyles = getDialogStyles(responsiveLayout.dialog, isDialogOpen, true);

    return (
      <div style={dialogStyles}>
        {/* Collapsed view */}
        {!isDialogOpen && (
          <div style={{
            padding: `${responsiveLayout.isMobile ? responsiveLayout.dialog.padding * 0.3 : responsiveLayout.dialog.padding * 0.5}px ${responsiveLayout.dialog.padding}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <span style={{
              fontSize: `${responsiveLayout.dialog.titleFontSize || responsiveLayout.dialog.fontSize}px`,
              color: '#8B4513',
              fontFamily: 'Chewy, cursive',
              fontWeight: 'bold'
            }}>
              {sceneTitle} - Step {currentStep + 1}/{dialogSteps.length}
            </span>
          </div>
        )}

        {/* Expanded view */}
        {isDialogOpen && (
          <div style={{
            padding: `${responsiveLayout.isMobile ? responsiveLayout.dialog.padding * 0.8 : responsiveLayout.dialog.padding}px`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Step indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: `${responsiveLayout.isMobile ? responsiveLayout.dialog.padding * 0.3 : responsiveLayout.dialog.padding * 0.5}px`
            }}>
              <span style={{
                fontSize: `${responsiveLayout.dialog.stepFontSize || responsiveLayout.dialog.fontSize * 0.8}px`,
                color: '#8B4513',
                fontFamily: 'Chewy, cursive',
                fontWeight: 'bold'
              }}>
                Step {currentStep + 1} of {dialogSteps.length}
              </span>

              {/* Progress bar */}
              <div style={{
                width: `${Math.max(responsiveLayout.isMobile ? 80 : 100, responsiveLayout.dialog.width * 0.25)}px`,
                height: `${Math.max(responsiveLayout.isMobile ? 2 : 3, responsiveLayout.dialog.padding * 0.3)}px`,
                background: 'rgba(139, 69, 19, 0.2)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((currentStep + 1) / dialogSteps.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Dialog text */}
            <div style={{
              flex: 1,
              fontSize: `${responsiveLayout.dialog.fontSize}px`,
              color: '#2C1810',
              fontFamily: 'Chewy, cursive',
              lineHeight: responsiveLayout.isMobile ? '1.2' : '1.3',
              overflow: 'auto',
              textAlign: 'center'
            }}>
              {currentStepData.text}
            </div>

            {/* Navigation buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: responsiveLayout.isMobile ? '4px' : '8px' // Lebih kecil untuk mobile
            }}>
              <button
                onClick={() => handleStepChange(currentStep - 1)}
                disabled={currentStep === 0}
                style={{
                  padding: responsiveLayout.isMobile ? '2px 6px' : '4px 8px', // Lebih kecil untuk mobile
                  background: currentStep === 0 ? 'rgba(139, 69, 19, 0.3)' : '#8B4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  fontSize: responsiveLayout.isMobile ? '10px' : '12px', // Lebih kecil untuk mobile
                  fontFamily: 'Chewy, cursive'
                }}
              >
                ← Previous
              </button>


              <button
                onClick={() => handleStepChange(currentStep + 1)}
                disabled={currentStep === dialogSteps.length - 1}
                style={{
                  padding: responsiveLayout.isMobile ? '2px 6px' : '4px 8px', // Lebih kecil untuk mobile
                  background: currentStep === dialogSteps.length - 1 ? 'rgba(139, 69, 19, 0.3)' : '#8B4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentStep === dialogSteps.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: responsiveLayout.isMobile ? '10px' : '12px', // Lebih kecil untuk mobile
                  fontFamily: 'Chewy, cursive'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Hint Button Component
  const HintButton: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        onClick={handleHintToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          bottom: '20px', // 20px from bottom as requested
          left: '20px',   // 20px from left as requested
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          background: isHovered ? 'rgba(139, 69, 19, 0.9)' : 'rgba(139, 69, 19, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          zIndex: 1500
        }}
        title="Informasi Makanan"
      >
        ℹ️
      </button>
    );
  };

  // Hint Popup Component
  const HintPopup: React.FC = () => {
    if (!currentFoodInfo) return null;

    return (
      <>
        {/* Overlay */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleHintClose}
        >
          {/* Popup Container */}
          <div
            style={{
              width: responsiveLayout.isMobile ? '90vw' : '800px',
              maxWidth: '90vw',
              height: responsiveLayout.isMobile ? '80vh' : '550px',
              maxHeight: '90vh',
              background: 'linear-gradient(135deg, #8B4513, #A0522D, #CD853F, #DEB887)',
              borderRadius: responsiveLayout.isMobile ? '15px' : '20px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Inner Content Background */}
            <div
              style={{
                position: 'absolute',
                top: responsiveLayout.isMobile ? '10px' : '15px',
                left: responsiveLayout.isMobile ? '10px' : '15px',
                right: responsiveLayout.isMobile ? '10px' : '15px',
                bottom: responsiveLayout.isMobile ? '10px' : '15px',
                background: 'rgba(255, 253, 208, 0.95)',
                borderRadius: responsiveLayout.isMobile ? '10px' : '15px',
                padding: responsiveLayout.isMobile ? '20px' : '40px',
                overflow: 'auto'
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleHintClose}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(139, 69, 19, 0.8)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>

              {/* Title */}
              <h2
                style={{
                  fontSize: responsiveLayout.isMobile ? '24px' : '36px',
                  fontFamily: 'Chewy, cursive',
                  color: '#5D4037',
                  textAlign: 'center',
                  marginBottom: responsiveLayout.isMobile ? '15px' : '20px',
                  fontWeight: 'bold'
                }}
              >
                {currentFoodInfo.title}
              </h2>

              {/* Divider */}
              <div
                style={{
                  width: '100%',
                  height: '3px',
                  background: '#8B4513',
                  marginBottom: '30px',
                  borderRadius: '2px'
                }}
              />

              {/* Content */}
              <p
                style={{
                  fontSize: responsiveLayout.isMobile ? '14px' : '20px',
                  fontFamily: 'Chewy, cursive',
                  color: '#3E2723',
                  lineHeight: responsiveLayout.isMobile ? '1.4' : '1.6',
                  textAlign: 'left',
                  margin: 0
                }}
              >
                {currentFoodInfo.content}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      ref={wrapperRef}
      className="kitchen-wrapper"
      style={{
        backgroundImage: "url('/assets/backgrounds/kitchen.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: backgroundColor
      }}
    >
      {/* Top Header Bar - Always visible */}
      <div className="game-header-bar" style={{ paddingTop: '35px', paddingBottom: '35px' }}>
        {/* Left side - Home button */}
        <div className="game-header-left">
          <HomeButton />
        </div>

        {/* Center - Scene Title */}
        <div className="game-header-center">
          <h1 className="game-header-title">{sceneTitle}</h1>
        </div>

        {/* Right side - Music Button */}
        <div className="game-header-right">
          <MusicButton />
        </div>
      </div>

      {/* Loading Screen */}
      {gameStatus === 'loading' && <LoadingScreen />}

      {/* Game Start Screen */}
      {gameStatus === 'ready' && !isGameActive && <GameStartScreen />}

      {/* Dialog System - Only show when game is active */}
      {gameStatus === 'playing' && isGameActive && (
        <>
          <DialogPanel />
          <DialogToggleButton />
        </>
      )}

      {/* Hint System - Only show when game is active and food type is provided */}
      {gameStatus === 'playing' && isGameActive && showHintButton && currentFoodInfo && (
        <>
          <HintButton />
          {isHintPopupOpen && <HintPopup />}
        </>
      )}

      {/* Main Game Content Container */}
      <div className="game-container">
        {children}
      </div>
    </div>
  );
};

// Export dialog step interface for use in scenes
export type { DialogStep };

// Export dialog hook for scenes to manage dialog state
export const useDialogSystem = (initialSteps: DialogStep[] = []) => {
  const [dialogSteps, setDialogSteps] = useState<DialogStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const updateSteps = useCallback((newSteps: DialogStep[]) => {
    setDialogSteps(newSteps);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    console.log(`🎯 React Dialog: nextStep called - current: ${currentStep}, total: ${dialogSteps.length}`);
    if (currentStep < dialogSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      console.log(`✅ React Dialog: Advanced to step ${newStep + 1}`);

      // Call step completion callback if exists
      dialogSteps[currentStep]?.onStepComplete?.();
    } else {
      console.log(`⚠️ React Dialog: Already at last step (${currentStep + 1}/${dialogSteps.length})`);
    }
  }, [currentStep, dialogSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < dialogSteps.length) {
      setCurrentStep(step);
    }
  }, [dialogSteps.length]);

  return {
    dialogSteps,
    currentStep,
    isDialogOpen,
    updateSteps,
    nextStep,
    prevStep,
    goToStep,
    setIsDialogOpen,
    setCurrentStep: useCallback((step: number) => {
      console.log(`🎯 React Dialog: setCurrentStep called - from ${currentStep} to ${step}`);
      setCurrentStep(step);
      console.log(`✅ React Dialog: setCurrentStep complete`);
    }, [currentStep])
  };
};

// Export functions untuk digunakan di luar komponen
export const useHomeButtonSize = () => {
  const [size, setSize] = useState(108);

  const changeSize = (newSize: number) => {
    setSize(Math.max(60, Math.min(200, newSize))); // Batasi ukuran antara 60-200px
  };

  const resetToDefault = () => setSize(108);
  const setToSmall = () => setSize(80);
  const setToMedium = () => setSize(108);
  const setToLarge = () => setSize(120);

  return {
    size,
    changeSize,
    resetToDefault,
    setToSmall,
    setToMedium,
    setToLarge
  };
};

export default KitchenBackgroundWrapper;