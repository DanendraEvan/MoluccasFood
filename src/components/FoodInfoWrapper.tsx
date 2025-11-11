// src/components/FoodInfoWrapper.tsx
import React, { useState } from 'react';
import Image from 'next/image';

type ButtonState = 'normal' | 'hover' | 'active';

interface FoodInfoWrapperProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
  content: string;
  onBack: () => void;
  onHome: () => void;
  nutritionInfo?: {
    title: string;
    points: string[];
  };
}

const FoodInfoWrapper: React.FC<FoodInfoWrapperProps> = ({
  title,
  imageSrc,
  imageAlt,
  content,
  onBack,
  onHome,
  nutritionInfo,
}) => {
  const [homeButtonState, setHomeButtonState] = useState<ButtonState>('normal');
  const [hintButtonState, setHintButtonState] = useState<ButtonState>('normal');
  const [isHintVisible, setIsHintVisible] = useState(false);

  const getHomeButtonImage = (): string => {
    switch (homeButtonState) {
      case 'hover':
        return '/assets/ui/buttons/home/home_hover.webp';
      case 'active':
        return '/assets/ui/buttons/home/home_active.webp';
      default:
        return '/assets/ui/buttons/home/home_normal.webp';
    }
  };

  const getHintButtonImage = (): string => {
    switch (hintButtonState) {
      case 'hover':
        return '/assets/ui/buttons/hint/hint_hover.webp';
      case 'active':
        return '/assets/ui/buttons/hint/hint_active.webp';
      default:
        return '/assets/ui/buttons/hint/hint_normal.webp';
    }
  };

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
      {/* Home Button - Top Left */}
      <button
        onClick={onHome}
        onMouseEnter={() => setHomeButtonState('hover')}
        onMouseLeave={() => setHomeButtonState('normal')}
        onMouseDown={() => setHomeButtonState('active')}
        onMouseUp={() => setHomeButtonState('hover')}
        className="fixed z-50 transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          top: '16px',
          left: '16px',
          width: '72px', // Increased size
          height: '72px', // Increased size
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
        }}
      >
        <Image
          src={getHomeButtonImage()}
          alt="Home Button"
          layout="fill"
          objectFit="contain"
        />
      </button>

      {/* Hint Button - Top Right (conditional) */}
      {nutritionInfo && (
        <button
          onClick={() => setIsHintVisible(true)}
          onMouseEnter={() => setHintButtonState('hover')}
          onMouseLeave={() => setHintButtonState('normal')}
          onMouseDown={() => setHintButtonState('active')}
          onMouseUp={() => setHintButtonState('hover')}
          className="fixed z-50 transition-transform duration-200 hover:scale-105 active:scale-95"
          style={{
            top: '16px',
            right: '16px',
            width: '72px', // Increased size
            height: '72px', // Increased size
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
          }}
        >
          <Image
            src={getHintButtonImage()}
            alt="Hint Button"
            layout="fill"
            objectFit="contain"
          />
        </button>
      )}

      {/* Nutrition Info Popup */}
      {isHintVisible && nutritionInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => setIsHintVisible(false)} // Close on backdrop click
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            style={{
              width: 'clamp(300px, 90vw, 450px)',
              background: '#2D2D2D', // Solid background color
              borderRadius: '24px',
              border: '3px solid #D4AF37', // Restored border
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              color: 'white',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <button
              onClick={() => setIsHintVisible(false)}
              className="absolute transition-transform duration-200 hover:scale-110"
              style={{
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                lineHeight: '1',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
            <h2
              className="text-center font-bold"
              style={{
                fontSize: '1.5rem',
                marginBottom: '16px',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              {nutritionInfo.title}
            </h2>
            <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: 0 }}>
              {nutritionInfo.points.map((point, index) => (
                <li
                  key={index}
                  style={{
                    fontSize: '1rem',
                    marginBottom: '8px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                  }}
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center" style={{ gap: '14px' }}>

        {/* Title Box */}
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
            {title}
          </h1>
        </div>

        {/* Content Box with Image and Text */}
        <div
          className="w-full"
          style={{
            background: 'linear-gradient(135deg, rgba(123, 104, 238, 0.9) 0%, rgba(147, 51, 234, 0.85) 100%)',
            borderRadius: '18px',
            padding: '16px',
            border: '2px solid rgba(218, 165, 32, 0.4)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          <div className="flex flex-row items-center" style={{ gap: '16px' }}>
            <div className="flex-shrink-0">
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
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
                {content}
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
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

export default FoodInfoWrapper;
