// src/components/KitchenBackgroundWrapper.tsx - Enhanced with Centralized Dialog System
import React, { ReactNode, useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import MusicButton from './MusicButton';
import Image from 'next/image';

// Dialog step interface
interface DialogStep {
  id: number;
  text: string;
  character?: string;
  requiredAction?: string;
  onStepComplete?: () => void;
}

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
  sceneName = "unknown"
}) => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [currentHomeButtonSize, setCurrentHomeButtonSize] = useState(homeButtonSize);

  // Dialog system state
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(currentDialogStep);

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
          top: isDialogOpen ? '195px' : '135px', // Turun 25px lagi dari posisi sebelumnya
          right: '50%',
          transform: `translateX(50%) scale(${isPressed ? 0.95 : 1})`, // Centered horizontally
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
          width={62} // Increased by 30px (32 + 30)
          height={62} // Increased by 30px (32 + 30)
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

    return (
      <div
        style={{
          position: 'absolute',
          top: '110px', // Turun 50px, sekarang dibawah header (60px) + spacing
          left: '50%',
          transform: 'translateX(-50%)', // Centered horizontally
          width: isDialogOpen ? '600px' : '400px', // Lebih kecil dari sebelumnya
          height: isDialogOpen ? '120px' : '35px', // Lebih kecil dari sebelumnya
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px', // Sedikit lebih kecil border radius
          border: '2px solid rgba(139, 69, 19, 0.3)',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Collapsed view */}
        {!isDialogOpen && (
          <div style={{
            padding: '6px 15px', // Reduced padding
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // Center text
            height: '100%'
          }}>
            <span style={{
              fontSize: '14px', // Reduced font size
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
            padding: '12px 15px', // Reduced padding
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Step indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px' // Reduced margin
            }}>
              <span style={{
                fontSize: '12px', // Reduced font size
                color: '#8B4513',
                fontFamily: 'Chewy, cursive',
                fontWeight: 'bold'
              }}>
                Step {currentStep + 1} of {dialogSteps.length}
              </span>

              {/* Progress bar */}
              <div style={{
                width: '150px', // Reduced width
                height: '4px', // Reduced height
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
              fontSize: '14px', // Reduced font size
              color: '#2C1810',
              fontFamily: 'Chewy, cursive',
              lineHeight: '1.3', // Tighter line height
              overflow: 'auto',
              textAlign: 'center' // Center text
            }}>
              {currentStepData.text}
            </div>

            {/* Navigation buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px' // Reduced margin
            }}>
              <button
                onClick={() => handleStepChange(currentStep - 1)}
                disabled={currentStep === 0}
                style={{
                  padding: '4px 8px', // Reduced padding
                  background: currentStep === 0 ? 'rgba(139, 69, 19, 0.3)' : '#8B4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '12px', // Reduced font size
                  fontFamily: 'Chewy, cursive'
                }}
              >
                ← Previous
              </button>


              <button
                onClick={() => handleStepChange(currentStep + 1)}
                disabled={currentStep === dialogSteps.length - 1}
                style={{
                  padding: '4px 8px', // Reduced padding
                  background: currentStep === dialogSteps.length - 1 ? 'rgba(139, 69, 19, 0.3)' : '#8B4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentStep === dialogSteps.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px', // Reduced font size
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