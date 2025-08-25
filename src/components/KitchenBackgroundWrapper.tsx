import React from "react";

interface Props {
  children: React.ReactNode;
}

const KitchenBackgroundWrapper: React.FC<Props> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

export default KitchenBackgroundWrapper;
