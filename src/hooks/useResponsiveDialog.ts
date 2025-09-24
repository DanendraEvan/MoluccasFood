// src/hooks/useResponsiveDialog.ts
// Hook untuk mendapatkan responsive config dari Phaser scene

import { useState, useEffect } from 'react';

export interface ResponsiveDialogConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  fontSize: number;
  padding: number;
  collapsedHeight?: number;
  collapsedWidth?: number;
  titleFontSize?: number;
  stepFontSize?: number;
}

export interface ResponsiveInfoConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  fontSize: number;
  titleFontSize: number;
  itemSize: number;
  spacing: number;
}

export interface ResponsiveLayoutHook {
  dialog: ResponsiveDialogConfig;
  info: ResponsiveInfoConfig;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLandscape: boolean;
  isMobile: boolean;
}

// Default configurations untuk berbagai screen size
const defaultConfigs = {
  xs: {
    dialog: {
      width: 250,
      height: 65, // Dikurangi dari 80 ke 65
      x: 50,
      y: 75, // 60px header + 15px gap
      scale: 0.6,
      fontSize: 10,
      padding: 4, // Dikurangi dari 6 ke 4
      collapsedHeight: 18, // Dikurangi dari 20 ke 18
      collapsedWidth: 180,
      titleFontSize: 9,
      stepFontSize: 8
    },
    info: {
      width: 120,
      height: 280,
      x: -120,
      y: 60,
      scale: 0.5,
      fontSize: 8,
      titleFontSize: 11,
      itemSize: 30,
      spacing: 3
    }
  },
  sm: {
    dialog: {
      width: 280,
      height: 75, // Dikurangi dari 90 ke 75
      x: 50,
      y: 75, // 60px header + 15px gap
      scale: 0.7,
      fontSize: 11,
      padding: 6, // Dikurangi dari 8 ke 6
      collapsedHeight: 20, // Dikurangi dari 22 ke 20
      collapsedWidth: 200,
      titleFontSize: 10,
      stepFontSize: 9
    },
    info: {
      width: 140,
      height: 320,
      x: -140,
      y: 70,
      scale: 0.6,
      fontSize: 9,
      titleFontSize: 13,
      itemSize: 35,
      spacing: 4
    }
  },
  md: {
    dialog: {
      width: 400,
      height: 85, // Dikurangi dari 100 ke 85
      x: 50,
      y: 75, // 60px header + 15px gap
      scale: 0.8,
      fontSize: 12,
      padding: 8, // Dikurangi dari 10 ke 8
      collapsedHeight: 22, // Dikurangi dari 25 ke 22
      collapsedWidth: 280,
      titleFontSize: 11,
      stepFontSize: 10
    },
    info: {
      width: 180,
      height: 400,
      x: -180,
      y: 80,
      scale: 0.8,
      fontSize: 11,
      titleFontSize: 16,
      itemSize: 45,
      spacing: 6
    }
  },
  lg: {
    dialog: {
      width: 500,
      height: 110,
      x: 50,
      y: 75, // 60px header + 15px gap
      scale: 0.9,
      fontSize: 13,
      padding: 12,
      collapsedHeight: 28,
      collapsedWidth: 350,
      titleFontSize: 13,
      stepFontSize: 11
    },
    info: {
      width: 300,
      height: 500,
      x: -300,
      y: 120,
      scale: 0.9,
      fontSize: 13,
      titleFontSize: 18,
      itemSize: 70,
      spacing: 8
    }
  },
  xl: {
    dialog: {
      width: 600,
      height: 120,
      x: 50,
      y: 75, // 60px header + 15px gap
      scale: 1,
      fontSize: 14,
      padding: 15,
      collapsedHeight: 35,
      collapsedWidth: 400,
      titleFontSize: 14,
      stepFontSize: 12
    },
    info: {
      width: 375,
      height: 600,
      x: -375,
      y: 155,
      scale: 1,
      fontSize: 14,
      titleFontSize: 20,
      itemSize: 80,
      spacing: 10
    }
  }
};

// Helper function untuk detect screen size
function detectScreenSize(): { screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl', isLandscape: boolean, isMobile: boolean } {
  if (typeof window === 'undefined') {
    return { screenSize: 'lg', isLandscape: false, isMobile: false };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;
  const isMobile = width < 768;

  let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'lg';

  if (width < 480) {
    screenSize = 'xs';
  } else if (width < 640) {
    screenSize = 'sm';
  } else if (width < 768) {
    screenSize = 'md';
  } else if (width < 1024) {
    screenSize = 'lg';
  } else {
    screenSize = 'xl';
  }

  return { screenSize, isLandscape, isMobile };
}

export function useResponsiveDialog(): ResponsiveLayoutHook {
  const [layout, setLayout] = useState<ResponsiveLayoutHook>(() => {
    const { screenSize, isLandscape, isMobile } = detectScreenSize();
    const config = defaultConfigs[screenSize];

    return {
      dialog: config.dialog,
      info: config.info,
      screenSize,
      isLandscape,
      isMobile
    };
  });

  useEffect(() => {
    function updateLayout() {
      const { screenSize, isLandscape, isMobile } = detectScreenSize();
      const config = defaultConfigs[screenSize];

      // Adjust untuk landscape pada mobile
      const dialogConfig = { ...config.dialog };
      const infoConfig = { ...config.info };

      if (isMobile && isLandscape) {
        // Dalam landscape mode, buat dialog lebih kecil dan tetap 15px dari header
        dialogConfig.height = dialogConfig.height * 0.6; // Dikurangi lebih drastis dari 0.7 ke 0.6
        dialogConfig.y = 75; // Tetap 15px dari header
        dialogConfig.collapsedHeight = (dialogConfig.collapsedHeight || 20) * 0.6; // Dikurangi dari 0.7 ke 0.6
        dialogConfig.width = dialogConfig.width * 0.85; // Dikurangi dari 0.9 ke 0.85
        dialogConfig.padding = dialogConfig.padding * 0.7; // Kurangi padding juga

        // Info panel juga lebih kecil dalam landscape
        infoConfig.width = infoConfig.width * 0.8;
        infoConfig.height = infoConfig.height * 0.7;
        infoConfig.y = 60; // Posisi tetap konsisten
      }

      setLayout({
        dialog: dialogConfig,
        info: infoConfig,
        screenSize,
        isLandscape,
        isMobile
      });
    }

    updateLayout();

    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  return layout;
}

// Helper function untuk mengconvert config ke CSS styles
export function getDialogStyles(config: ResponsiveDialogConfig, isOpen: boolean, centerX: boolean = true): React.CSSProperties {
  return {
    position: 'absolute',
    top: `${config.y}px`,
    left: centerX ? '50%' : `${config.x}px`,
    transform: centerX ? 'translateX(-50%)' : 'none',
    width: `${isOpen ? config.width : (config.collapsedWidth || config.width * 0.7)}px`,
    height: `${isOpen ? config.height : (config.collapsedHeight || config.height * 0.3)}px`,
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '12px',
    border: '2px solid rgba(139, 69, 19, 0.3)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    zIndex: 999,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  };
}

export function getInfoPanelStyles(config: ResponsiveInfoConfig): React.CSSProperties {
  return {
    position: 'absolute',
    top: `${config.y}px`,
    right: '15px',
    width: `${config.width}px`,
    height: `${config.height}px`,
    background: 'rgba(42, 24, 16, 0.95)',
    borderRadius: '20px',
    border: '2px solid rgba(139, 69, 19, 0.8)',
    zIndex: 998
  };
}

export default useResponsiveDialog;