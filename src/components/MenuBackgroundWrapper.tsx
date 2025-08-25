import React from "react";

interface Props {
  children: React.ReactNode;
}

const MenuBackgroundWrapper: React.FC<Props> = ({ children }) => {
  return (
    <div
      className="w-screen h-screen flex flex-col justify-center items-center text-center relative"
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
