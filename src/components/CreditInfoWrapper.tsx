// src/components/CreditInfoWrapper.tsx
import React, { useState } from 'react';

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
  cardContainer: {
    gap: number;
    maxWidth: string;
    padding: { x: number; y: number };
  };
}

interface Developer {
  name: string;
  description: string;
  image: string;
}

interface CreditInfoWrapperProps {
  title: string;
  developers: Developer[];
  backgroundImage?: string;
  onBack: () => void;
  uiConfig: UIConfig;
}

// Profile Card Component
interface ProfileCardProps {
  name: string;
  description: string;
  image: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, description, image }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 50%, rgba(79, 70, 229, 0.8) 100%)',
    borderRadius: '20px',
    padding: '24px',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: isHovered ? 
      '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' :
      '0 12px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
    transition: 'all 0.3s ease',
    width: '320px',
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const imageContainerStyle: React.CSSProperties = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Profile Image with Landscape Scene */}
      <div style={imageContainerStyle}>
        <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        margin: '0 0 16px 0',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        lineHeight: '1.3'
      }}>
        {name}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '0.95rem',
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: '1.6',
        margin: '0',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)'
      }}>
        {description}
      </p>
    </div>
  );
};

const CreditInfoWrapper: React.FC<CreditInfoWrapperProps> = ({ 
  title, 
  developers,
  backgroundImage = "/assets/backgrounds/menu.png", 
  onBack,
  uiConfig
}) => {
  // Background style
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
    padding: `${uiConfig.cardContainer.padding.y}px ${uiConfig.cardContainer.padding.x}px`
  };

  // Title style
  const titleBoxStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(124, 58, 237, 0.9) 50%, rgba(168, 85, 247, 0.9) 100%)',
    borderRadius: '25px',
    padding: `${uiConfig.titleBox.padding.y}px ${uiConfig.titleBox.padding.x}px`,
    marginBottom: '50px',
    backdropFilter: 'blur(15px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
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
            letterSpacing: '0.05em',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Developer Cards Container */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: `${uiConfig.cardContainer.gap}px`,
        maxWidth: uiConfig.cardContainer.maxWidth,
        width: '100%'
      }}>
        {developers.map((dev, index) => (
          <ProfileCard
            key={index}
            name={dev.name}
            description={dev.description}
            image={dev.image}
          />
        ))}
      </div>
    </div>
  );
};

export default CreditInfoWrapper;