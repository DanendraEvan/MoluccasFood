// src/game/utils/ResponsiveMixin.ts
// Mixin untuk menambahkan responsifitas ke semua game scenes dengan mudah

import * as Phaser from "phaser";
import ResponsiveGameUtils, { ResponsiveLayout } from "./ResponsiveUtils";

export interface ResponsiveScene extends Phaser.Scene {
  responsiveLayout?: ResponsiveLayout;
  originalLayoutConfig?: any;
  ingredientsPanel?: Phaser.GameObjects.Container;
  layoutConfig?: any;
  panelTitle?: Phaser.GameObjects.Text;
}

export class ResponsiveMixin {
  /**
   * Setup responsive system untuk scene
   * Panggil ini di method create() setelah membuat background
   */
  static setupResponsiveSystem(scene: ResponsiveScene): void {
    // Get initial responsive layout
    const gameWidth = scene.cameras.main.width;
    const gameHeight = scene.cameras.main.height;
    const customY = scene.layoutConfig?.ingredientsPanelY; // Gunakan nilai dari scene jika ada
    scene.responsiveLayout = ResponsiveGameUtils.getResponsiveLayout(gameWidth, gameHeight, customY);

    // Save original config if exists
    if (scene.layoutConfig) {
      scene.originalLayoutConfig = { ...scene.layoutConfig };
    }

    // Setup responsive listener
    ResponsiveGameUtils.setupResponsiveListener(scene, (layout: ResponsiveLayout) => {
      // Preserve custom Y from original config
      const originalCustomY = scene.originalLayoutConfig?.ingredientsPanelY;
      scene.responsiveLayout = ResponsiveGameUtils.getResponsiveLayout(layout.gameWidth, layout.gameHeight, originalCustomY);
      this.updateResponsiveLayout(scene);
    });

    console.log(`🎮 ${scene.scene.key}: Responsive system initialized`, scene.responsiveLayout);
  }

  /**
   * Update layout saat layar berubah ukuran
   */
  static updateResponsiveLayout(scene: ResponsiveScene): void {
    if (!scene.responsiveLayout) return;

    // Update ingredients panel dengan responsive config
    const infoPanelConfig = scene.responsiveLayout.infoPanel;

    // Update layout config jika ada
    if (scene.layoutConfig) {
      scene.layoutConfig.ingredientsPanelWidth = infoPanelConfig.width;
      scene.layoutConfig.ingredientsPanelHeight = infoPanelConfig.height;
      scene.layoutConfig.ingredientsPanelX = infoPanelConfig.x;
      scene.layoutConfig.ingredientsPanelY = infoPanelConfig.y;
    }

    // Update ingredients panel position jika ada
    if (scene.ingredientsPanel) {
      ResponsiveGameUtils.updateInfoPanelPosition(scene.ingredientsPanel, infoPanelConfig);

      // Update panel visuals jika method ada
      if ((scene as any).updateIngredientsPanelVisuals) {
        (scene as any).updateIngredientsPanelVisuals();
      }
    }

    // Update panel title font size jika ada
    if (scene.panelTitle && scene.responsiveLayout) {
      const titleFontSize = scene.responsiveLayout.infoPanel.titleFontSize;
      scene.panelTitle.setStyle({
        fontSize: `${titleFontSize}px`,
        fontFamily: 'Chewy, cursive',
        color: '#FFE4B5',
        align: 'center',
        fontStyle: 'bold'
      });
    }

    // Recalculate layout jika method ada
    if ((scene as any).calculateLayout) {
      (scene as any).calculateLayout();
    }

    console.log(`🔄 ${scene.scene.key}: Layout updated for ${scene.responsiveLayout.screenSize}`);
  }

  /**
   * Get responsive dialog config untuk React dialog
   * Gunakan ini untuk mengupdate dialog dari React component
   */
  static getDialogConfig(scene: ResponsiveScene) {
    if (!scene.responsiveLayout) {
      const gameWidth = scene.cameras.main.width;
      const gameHeight = scene.cameras.main.height;
      return ResponsiveGameUtils.getDialogConfig(gameWidth, gameHeight);
    }
    return scene.responsiveLayout.dialog;
  }

  /**
   * Get responsive info panel config
   */
  static getInfoPanelConfig(scene: ResponsiveScene) {
    if (!scene.responsiveLayout) {
      const gameWidth = scene.cameras.main.width;
      const gameHeight = scene.cameras.main.height;
      return ResponsiveGameUtils.getInfoPanelConfig(gameWidth, gameHeight);
    }
    return scene.responsiveLayout.infoPanel;
  }

  /**
   * Helper untuk membuat ingredients panel yang responsif
   */
  static createResponsiveIngredientsPanel(
    scene: ResponsiveScene,
    items: Array<{ key: string; name: string; x?: number; y?: number }>
  ): Phaser.GameObjects.Container {
    const config = this.getInfoPanelConfig(scene);

    // Create container
    const panel = scene.add.container(config.x, config.y);

    // Panel background
    const panelBg = scene.add.graphics();
    panelBg.fillStyle(0x2A1810, 0.95);
    panelBg.fillRoundedRect(0, 0, config.width, config.height, 20);
    panelBg.lineStyle(2, 0x8B4513, 0.8);
    panelBg.strokeRoundedRect(0, 0, config.width, config.height, 20);
    panel.add(panelBg);

    // Panel header
    panelBg.fillStyle(0x4A3428, 0.9);
    panelBg.fillRoundedRect(10, 10, config.width - 20, 40, 8);

    // Panel title
    const title = scene.add.text(config.width/2, 30, "BAHAN & ALAT", {
      fontSize: `${config.titleFontSize}px`,
      fontFamily: 'Chewy, cursive',
      color: '#FFE4B5',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    panel.add(title);

    // Store reference untuk update nanti
    scene.panelTitle = title;

    // Add items
    items.forEach((item, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const itemX = 60 + col * (config.itemSize + config.spacing);
      const itemY = 80 + row * (config.itemSize + config.spacing);

      // Item background
      const itemBg = scene.add.graphics();
      itemBg.fillStyle(0x1A1A1A, 0.7);
      itemBg.lineStyle(2, 0x666666, 0.8);
      itemBg.fillRoundedRect(itemX - config.itemSize/2, itemY - config.itemSize/2, config.itemSize, config.itemSize, 8);
      itemBg.strokeRoundedRect(itemX - config.itemSize/2, itemY - config.itemSize/2, config.itemSize, config.itemSize, 8);
      panel.add(itemBg);

      // Item image
      const itemImage = scene.add.image(itemX, itemY, item.key)
        .setDisplaySize(config.itemSize * 0.8, config.itemSize * 0.8);
      panel.add(itemImage);

      // Item label
      const label = scene.add.text(itemX, itemY + config.itemSize/2 + 10, item.name, {
        fontSize: `${config.fontSize}px`,
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      }).setOrigin(0.5, 0.5);
      panel.add(label);
    });

    return panel;
  }

  /**
   * Utility untuk expose dialog config ke React component
   * Panggil ini dalam scene untuk memberikan config ke dialog system
   */
  static exposeDialogConfigToReact(scene: ResponsiveScene): void {
    // Buat function yang bisa dipanggil dari React
    (scene as any).getResponsiveDialogConfig = () => {
      return this.getDialogConfig(scene);
    };

    console.log(`📱 ${scene.scene.key}: Dialog config exposed to React`);
  }
}

export default ResponsiveMixin;