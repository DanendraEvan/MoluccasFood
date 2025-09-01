// src/components/FoodInfoWrapper.tsx - Updated with Sample Colors
import React from 'react';

interface UIConfig {
  homeButton: {
    size: number;
    position: { top: number; left: number };
  };
  titleBox: {
    fontSize: string;
    padding: { x: number; y: number };
    maxWidth: string;
  };
  contentBox: {
    fontSize: string;
    padding: { x: number; y: number };
    maxWidth: string;
    lineHeight: string;
  };
  backButton: {
    fontSize: string;
    padding: { x: number; y: number };
  };
}

interface FoodInfoWrapperProps {
  title: string;
  content: string;
  backgroundImage?: string;
  onBack: () => void;
  uiConfig: UIConfig;
}

const FoodInfoWrapper: React.FC<FoodInfoWrapperProps> = ({ 
  title, 
  content, 
  backgroundImage = "/assets/backgrounds/menu.png", 
  onBack,
  uiConfig
}) => {
  // Inline styles untuk memastikan background bekerja
  const backgroundStyle: React.CSSProperties = {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: `url('${backgroundImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#f97316', // Orange fallback
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem'
  };

  // Updated colors to match sample - Brown/Gold theme
  const titleBoxStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.9) 0%, rgba(160, 82, 45, 0.9) 100%)', // Brown gradient
    borderRadius: '25px',
    padding: `${uiConfig.titleBox.padding.y}px ${uiConfig.titleBox.padding.x}px`,
    marginBottom: '1.5rem',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(218, 165, 32, 0.6)', // Golden border
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
  };

  const contentBoxStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(101, 67, 33, 0.85) 0%, rgba(139, 69, 19, 0.85) 100%)', // Darker brown gradient
    borderRadius: '20px',
    padding: `${uiConfig.contentBox.padding.y}px ${uiConfig.contentBox.padding.x}px`,
    marginBottom: '2rem',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(218, 165, 32, 0.5)', // Golden border
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    maxWidth: uiConfig.contentBox.maxWidth,
    width: '100%'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.9) 0%, rgba(146, 64, 14, 0.9) 100%)', // Golden-brown gradient
    color: 'white',
    padding: `${uiConfig.backButton.padding.y}px ${uiConfig.backButton.padding.x}px`,
    borderRadius: '25px',
    border: '2px solid rgba(218, 165, 32, 0.7)', // Golden border
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    fontSize: uiConfig.backButton.fontSize,
    fontWeight: '600',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
  };

  return (
    <div style={backgroundStyle}>
      
      {/* Title Section */}
      <div style={{ width: '100%', maxWidth: uiConfig.titleBox.maxWidth }}>
        <div style={titleBoxStyle}>
          <h1 style={{
            fontSize: uiConfig.titleBox.fontSize,
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'white',
            margin: 0,
            letterSpacing: '0.025em',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div style={contentBoxStyle}>
        <p style={{
          fontSize: uiConfig.contentBox.fontSize,
          lineHeight: uiConfig.contentBox.lineHeight,
          color: 'white',
          margin: 0,
          textAlign: 'justify',
          fontWeight: 'normal',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)'
        }}>
          {content}
        </p>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(202, 138, 4, 1) 0%, rgba(168, 85, 247, 0.8) 100%)';
          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(184, 134, 11, 0.9) 0%, rgba(146, 64, 14, 0.9) 100%)';
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
        }}
      >
        ← Kembali ke Page Info
      </button>
      
    </div>
  );
};

export default FoodInfoWrapper;