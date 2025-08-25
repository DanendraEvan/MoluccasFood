import React, { useState } from "react";

interface GameButtonProps {
  normal: string;
  hover: string;
  active: string;
  onClick: () => void;
  alt?: string;
  width?: number;
  height?: number;
}

const GameButton: React.FC<GameButtonProps> = ({
  normal,
  hover,
  active,
  onClick,
  alt,
  width = 128,
  height = 64,
}) => {
  const [currentSrc, setCurrentSrc] = useState(normal);

  return (
    <img
      src={currentSrc}
      alt={alt || "button"}
      onMouseEnter={() => setCurrentSrc(hover)}
      onMouseLeave={() => setCurrentSrc(normal)}
      onMouseDown={() => setCurrentSrc(active)}
      onMouseUp={() => setCurrentSrc(hover)}
      onClick={onClick}
      className="cursor-pointer select-none transition-all duration-200"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'contain'
      }}
    />
  );
};

export default GameButton;
