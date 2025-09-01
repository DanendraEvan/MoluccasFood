// src/components/MenuBackgroundWrapper.tsx - Updated dengan posisi button yang tepat
import React from "react";
import MusicButton from "./MusicButton";

interface Props {
  children: React.ReactNode;
}

const MenuBackgroundWrapper: React.FC<Props> = ({ children }) => {
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
      {/* Music Button - positioned next to home button */}
      <div 
        className="absolute z-30"
        style={{
          top: '44px', // Same as home button
          left: '44px', // Next to home button (home button left: 2px + width ~100px + gap)
        }}
      >
        <MusicButton />
      </div>
      {children}
    </div>
  );
};

export default MenuBackgroundWrapper;