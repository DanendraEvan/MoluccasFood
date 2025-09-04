// src/components/HomeButtonSizeController.tsx
import React from 'react';
import { useHomeButtonSize } from './KitchenBackgroundWrapper';

interface HomeButtonSizeControllerProps {
  onSizeChange?: (size: number) => void;
  showControls?: boolean;
}

const HomeButtonSizeController: React.FC<HomeButtonSizeControllerProps> = ({
  onSizeChange,
  showControls = true
}) => {
  const { size, changeSize, resetToDefault, setToSmall, setToMedium, setToLarge } = useHomeButtonSize();

  const handleSizeChange = (newSize: number) => {
    changeSize(newSize);
    if (onSizeChange) {
      onSizeChange(newSize);
    }
  };

  if (!showControls) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 1000,
      color: 'white',
      fontSize: '12px'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        Home Button Size: {size}px
      </div>
      
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        <button
          onClick={() => handleSizeChange(60)}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Small
        </button>
        <button
          onClick={() => handleSizeChange(80)}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Medium
        </button>
        <button
          onClick={() => handleSizeChange(120)}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Large
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '4px' }}>
        <input
          type="range"
          min="60"
          max="200"
          value={size}
          onChange={(e) => handleSizeChange(parseInt(e.target.value))}
          style={{ width: '80px' }}
        />
        <button
          onClick={() => handleSizeChange(108)}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default HomeButtonSizeController;
