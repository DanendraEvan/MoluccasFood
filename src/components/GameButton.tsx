// src/components/GameButton.tsx
import React, { useState } from "react";

interface GameButtonProps {
  normal: string;
  hover: string;
  active: string;
  onClick: () => void;
  alt?: string;
  width?: number;
  height?: number;
  disabled?: boolean;
}

const GameButton: React.FC<GameButtonProps> = ({
  normal,
  hover,
  active,
  onClick,
  alt = "button",
  width = 128,
  height = 64,
  disabled = false,
}) => {
  const [currentSrc, setCurrentSrc] = useState(normal);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = () => {
    if (!disabled && !isPressed) {
      setCurrentSrc(hover);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setCurrentSrc(normal);
      setIsPressed(false);
    }
  };

  const handleMouseDown = () => {
    if (!disabled) {
      setCurrentSrc(active);
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    if (!disabled) {
      setCurrentSrc(hover);
      setIsPressed(false);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      className={`select-none transition-all duration-200 ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:scale-105 active:scale-95'
      }`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'contain',
        filter: disabled ? 'grayscale(50%)' : 'none',
        transition: 'all 0.2s ease',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
      draggable={false}
      onError={(e) => {
        // Fallback jika gambar tidak bisa dimuat
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = alt;
          parent.style.display = 'flex';
          parent.style.alignItems = 'center';
          parent.style.justifyContent = 'center';
          parent.style.backgroundColor = '#666';
          parent.style.color = 'white';
          parent.style.fontSize = '12px';
          parent.style.borderRadius = '4px';
          parent.style.width = `${width}px`;
          parent.style.height = `${height}px`;
        }
      }}
    />
  );
};

export default GameButton;