// src/game/utils/ResponsiveUtils.ts
// Utility untuk mengatur responsifitas semua game scenes

export interface ResponsiveConfig {
  // Screen breakpoints
  xs: number;    // < 480px
  sm: number;    // 480px - 640px
  md: number;    // 640px - 768px
  lg: number;    // 768px - 1024px
  xl: number;    // > 1024px
}

export interface DialogConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  fontSize: number;
  padding: number;
}

export interface InfoPanelConfig {
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

export interface ResponsiveLayout {
  dialog: DialogConfig;
  infoPanel: InfoPanelConfig;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLandscape: boolean;
  gameWidth: number;
  gameHeight: number;
}

export class ResponsiveGameUtils {
  private static breakpoints: ResponsiveConfig = {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1920
  };

  /**
   * Deteksi ukuran layar dan orientasi
   */
  static detectScreenSize(width: number, height: number): { screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl', isLandscape: boolean } {
    const isLandscape = width > height;
    let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'lg';

    if (width < this.breakpoints.xs) {
      screenSize = 'xs';
    } else if (width < this.breakpoints.sm) {
      screenSize = 'sm';
    } else if (width < this.breakpoints.md) {
      screenSize = 'md';
    } else if (width < this.breakpoints.lg) {
      screenSize = 'lg';
    } else {
      screenSize = 'xl';
    }

    return { screenSize, isLandscape };
  }

  /**
   * Konfigurasi dialog responsif untuk semua scenes
   */
  static getDialogConfig(gameWidth: number, gameHeight: number): DialogConfig {
    const { screenSize, isLandscape } = this.detectScreenSize(gameWidth, gameHeight);

    let config: DialogConfig = {
      width: 600,
      height: 180,
      x: gameWidth / 2,
      y: gameHeight - 120,
      scale: 1,
      fontSize: 18,
      padding: 20
    };

    switch (screenSize) {
      case 'xs':
        config = {
          width: Math.min(gameWidth * 0.9, 320),
          height: isLandscape ? 100 : 140,
          x: gameWidth / 2,
          y: gameHeight - (isLandscape ? 60 : 80),
          scale: 0.7,
          fontSize: 12,
          padding: 10
        };
        break;

      case 'sm':
        config = {
          width: Math.min(gameWidth * 0.85, 400),
          height: isLandscape ? 120 : 160,
          x: gameWidth / 2,
          y: gameHeight - (isLandscape ? 70 : 90),
          scale: 0.8,
          fontSize: 14,
          padding: 15
        };
        break;

      case 'md':
        config = {
          width: Math.min(gameWidth * 0.8, 500),
          height: isLandscape ? 140 : 170,
          x: gameWidth / 2,
          y: gameHeight - (isLandscape ? 80 : 100),
          scale: 0.9,
          fontSize: 16,
          padding: 18
        };
        break;

      case 'lg':
        config = {
          width: Math.min(gameWidth * 0.75, 600),
          height: 180,
          x: gameWidth / 2,
          y: gameHeight - 120,
          scale: 1,
          fontSize: 18,
          padding: 20
        };
        break;

      case 'xl':
        config = {
          width: Math.min(gameWidth * 0.7, 700),
          height: 200,
          x: gameWidth / 2,
          y: gameHeight - 140,
          scale: 1.1,
          fontSize: 20,
          padding: 25
        };
        break;
    }

    return config;
  }

  /**
   * Konfigurasi info panel responsif untuk semua scenes
   */
  static getInfoPanelConfig(gameWidth: number, gameHeight: number, customY?: number): InfoPanelConfig {
    const { screenSize, isLandscape } = this.detectScreenSize(gameWidth, gameHeight);

    let config: InfoPanelConfig = {
      width: 375,
      height: 600,
      x: gameWidth - 375 - 15,
      y: customY !== undefined ? customY : 155, // Gunakan customY jika tersedia
      scale: 1,
      fontSize: 14,
      titleFontSize: 20,
      itemSize: 80,
      spacing: 10
    };

    switch (screenSize) {
      case 'xs':
        config = {
          width: Math.min(gameWidth * 0.4, 200),
          height: Math.min(gameHeight * 0.7, 400),
          x: gameWidth - Math.min(gameWidth * 0.4, 200) - 10,
          y: isLandscape ? 80 : 100,
          scale: 0.6,
          fontSize: 10,
          titleFontSize: 14,
          itemSize: 50,
          spacing: 5
        };
        break;

      case 'sm':
        config = {
          width: Math.min(gameWidth * 0.35, 250),
          height: Math.min(gameHeight * 0.75, 480),
          x: gameWidth - Math.min(gameWidth * 0.35, 250) - 12,
          y: isLandscape ? 90 : 120,
          scale: 0.7,
          fontSize: 11,
          titleFontSize: 16,
          itemSize: 60,
          spacing: 6
        };
        break;

      case 'md':
        config = {
          width: Math.min(gameWidth * 0.32, 300),
          height: Math.min(gameHeight * 0.8, 520),
          x: gameWidth - Math.min(gameWidth * 0.32, 300) - 13,
          y: isLandscape ? 100 : 135,
          scale: 0.8,
          fontSize: 12,
          titleFontSize: 18,
          itemSize: 65,
          spacing: 8
        };
        break;

      case 'lg':
        config = {
          width: 375,
          height: 600,
          x: gameWidth - 375 - 15,
          y: 155,
          scale: 1,
          fontSize: 14,
          titleFontSize: 20,
          itemSize: 80,
          spacing: 10
        };
        break;

      case 'xl':
        config = {
          width: 400,
          height: 650,
          x: gameWidth - 400 - 20,
          y: 180,
          scale: 1.1,
          fontSize: 16,
          titleFontSize: 22,
          itemSize: 90,
          spacing: 12
        };
        break;
    }

    // Preserve custom Y if provided
    if (customY !== undefined) {
      config.y = customY;
    }

    return config;
  }

  /**
   * Mendapatkan layout responsif lengkap
   */
  static getResponsiveLayout(gameWidth: number, gameHeight: number, customInfoPanelY?: number): ResponsiveLayout {
    const { screenSize, isLandscape } = this.detectScreenSize(gameWidth, gameHeight);
    const dialog = this.getDialogConfig(gameWidth, gameHeight);
    const infoPanel = this.getInfoPanelConfig(gameWidth, gameHeight, customInfoPanelY);

    return {
      dialog,
      infoPanel,
      screenSize,
      isLandscape,
      gameWidth,
      gameHeight
    };
  }

  /**
   * Utility untuk mengupdate posisi dialog secara dinamis
   */
  static updateDialogPosition(
    gameObject: Phaser.GameObjects.Container | Phaser.GameObjects.Graphics,
    config: DialogConfig
  ): void {
    if (gameObject && gameObject.setPosition) {
      gameObject.setPosition(config.x - config.width / 2, config.y - config.height / 2);
    }

    if (gameObject && gameObject.setScale) {
      gameObject.setScale(config.scale);
    }
  }

  /**
   * Utility untuk mengupdate posisi info panel secara dinamis
   */
  static updateInfoPanelPosition(
    gameObject: Phaser.GameObjects.Container,
    config: InfoPanelConfig
  ): void {
    if (gameObject && gameObject.setPosition) {
      gameObject.setPosition(config.x, config.y);
    }

    if (gameObject && gameObject.setScale) {
      gameObject.setScale(config.scale);
    }
  }

  /**
   * Setup responsive listener untuk scene
   */
  static setupResponsiveListener(
    scene: Phaser.Scene,
    onResize: (layout: ResponsiveLayout) => void
  ): void {
    const handleResize = () => {
      const gameWidth = scene.cameras.main.width;
      const gameHeight = scene.cameras.main.height;
      const layout = this.getResponsiveLayout(gameWidth, gameHeight);
      onResize(layout);
    };

    // Listen untuk resize events
    scene.scale.on('resize', handleResize);

    // Initial setup
    handleResize();
  }

  /**
   * Helper untuk mendapatkan font size responsif
   */
  static getResponsiveFontSize(baseSize: number, screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): number {
    const multipliers = {
      xs: 0.7,
      sm: 0.8,
      md: 0.9,
      lg: 1.0,
      xl: 1.2
    };

    return Math.round(baseSize * multipliers[screenSize]);
  }

  /**
   * Helper untuk mendapatkan spacing responsif
   */
  static getResponsiveSpacing(baseSpacing: number, screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): number {
    const multipliers = {
      xs: 0.5,
      sm: 0.7,
      md: 0.8,
      lg: 1.0,
      xl: 1.2
    };

    return Math.round(baseSpacing * multipliers[screenSize]);
  }
}

export default ResponsiveGameUtils;