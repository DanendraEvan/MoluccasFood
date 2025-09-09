// src/components/MenuBackgroundWrapper.tsx - Updated dengan posisi button yang tepat
import React from "react";

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
      {children}
    </div>
  );
};

export default MenuBackgroundWrapper;