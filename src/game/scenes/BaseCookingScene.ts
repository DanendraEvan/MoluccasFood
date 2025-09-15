// src/game/scenes/BaseCookingScene.ts
import * as Phaser from "phaser";

// Shared Types
export interface GameStep {
  id: number;
  text: string;
  character: string; // e.g., "karakter1", not "karakter1.png"
  isCompleted: boolean;
}

export type CookingState = string; // Generic state type, defined per recipe

export abstract class BaseCookingScene extends Phaser.Scene {
  // --- SHARED UI COMPONENTS (PROTECTED) ---
  protected ingredientsPanel!: Phaser.GameObjects.Container;
  protected dialogPanel!: Phaser.GameObjects.Container;
  protected menuToggleButton!: Phaser.GameObjects.Image;
  protected characterImage!: Phaser.GameObjects.Image;
  protected stepText!: Phaser.GameObjects.Text;
  protected isIngredientsPanelOpen: boolean = true;
  protected currentStep: number = 0;
  protected ingredientItems: Phaser.GameObjects.Image[] = [];
  protected panelBg!: Phaser.GameObjects.Graphics;
  protected panelTitle!: Phaser.GameObjects.Text;
  protected hintPopup!: Phaser.GameObjects.Container;

  // --- SHARED LAYOUT CONFIG ---
  protected layoutConfig = {
    headerHeight: 60,
    ingredientsPanelWidth: 400,
    ingredientsPanelX: 0,
    ingredientsPanelY: 155,
    ingredientsPanelHeight: 550,
    cookingAreaLeft: 20,
    cookingAreaTop: 70,
    cookingAreaRight: 290,
    cookingAreaBottom: 180,
    dialogPanelHeight: 90,
    dialogPanelY: 900,
    dialogPanelLeft: 50,
    dialogPanelRight: 20,
    characterX: 1000,
    characterY: 500,
    stagingAreaX: 200,
    stagingAreaY: 300,
    stagingAreaWidth: 300,
    stagingAreaHeight: 225
  };

  // --- SHARED GAME STATE ---
  protected gameState: Record<string, any> = {}; // Recipe-specific state goes here
  protected gameSteps: GameStep[] = []; // Must be defined by child class

  // --- ABSTRACT METHODS (MUST BE IMPLEMENTED BY CHILD) ---
  protected abstract preloadRecipeAssets(): void;
  protected abstract createRecipeSpecificElements(): void;
  protected abstract handleDropLogic(
    gameObject: Phaser.GameObjects.Image,
    dropZone: Phaser.GameObjects.Zone | null
  ): boolean; // Returns true if drop was handled successfully

  // --- CONSTRUCTOR ---
  constructor(sceneKey: string) {
    super(sceneKey);
  }

  // --- SHARED LIFECYCLE METHODS ---
  preload() {
    // Load shared assets
    this.load.image("background", "/assets/backgrounds/kitchen.png");
    this.load.image("Kompor", "/assets/foods/kohu_kohu/Kompor.png");
    this.load.image("menu_normal", "/assets/ui/buttons/menu/menu_normal.png");
    this.load.image("menu_hover", "/assets/ui/buttons/menu/menu_hover.png");
    this.load.image("menu_active", "/assets/ui/buttons/menu/menu_active.png");
    this.load.image("hint_normal", "/assets/ui/buttons/hint/hint_normal.png");
    this.load.image("hint_hover", "/assets/ui/buttons/hint/hint_hover.png");
    this.load.image("hint_active", "/assets/ui/buttons/hint/hint_active.png");
    this.load.image("karakter1", "/assets/karakter/karakter1.png");
    this.load.image("karakter2", "/assets/karakter/karakter2.png");
    this.load.image("karakter3", "/assets/karakter/karakter3.png");
    this.load.image("karakter4", "/assets/karakter/karakter4.png");
    this.load.image("karakter5", "/assets/karakter/karakter5.png");
    this.load.image("karakter6", "/assets/karakter/karakter6.png");

    // Load recipe-specific assets
    this.preloadRecipeAssets();
  }

  create() {
    this.add.image(0, 0, "background").setOrigin(0);
    this.calculateLayout();
    this.createSharedUI();
    this.createRecipeSpecificElements(); // Child class implements this
    this.setupInteractions();
    this.updateStepDisplay();
    this.createHintButton();
  }

  update() {
    // Shared update logic (if any) can go here.
    // Child classes can override and call super.update() if needed.
  }

  // --- SHARED PRIVATE METHODS ---
  private calculateLayout() {
    const { width, height } = this.cameras.main;
    this.layoutConfig.ingredientsPanelX = width - this.layoutConfig.ingredientsPanelWidth - 15;
    this.layoutConfig.dialogPanelY = height - this.layoutConfig.dialogPanelHeight - 100;
    this.layoutConfig.cookingAreaRight = width - this.layoutConfig.ingredientsPanelWidth - 40;
    this.layoutConfig.cookingAreaBottom = height - this.layoutConfig.dialogPanelHeight - 40;
  }

  private createSharedUI() {
    this.createIngredientsPanel();
    this.createDialogPanel();
    this.updateIngredientsPanelVisuals();
    this.setupIngredientsPanelLayout(undefined, undefined, undefined, 1500, 230);
  }

  private createIngredientsPanel() {
    this.ingredientsPanel = this.add.container(this.layoutConfig.ingredientsPanelX, this.layoutConfig.ingredientsPanelY);
    this.panelBg = this.add.graphics();
    this.panelTitle = this.add.text(0, 0, "BAHAN & ALAT", {
      fontSize: '24px',
      fontFamily: 'Chewy, cursive',
      color: '#FFE4B5',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.menuToggleButton = this.add.image(30, 30, "menu_normal").setScale(0.05).setInteractive();

    this.ingredientsPanel.add([this.panelBg, this.panelTitle, this.menuToggleButton]);
    this.setupMenuToggle();
    this.createIngredients(); // Child class can override this if needed for custom layouts
  }

  protected createIngredients() {
    // This is a default implementation. Child classes can override for custom grids.
    this.ingredientItems.forEach(item => item.destroy());
    this.ingredientItems = [];

    // Child class should define `this.recipeIngredients`
    const ingredients = (this as any).recipeIngredients || [];
    const { ingredientsPanelWidth } = this.layoutConfig;
    const startX = ingredientsPanelWidth / 4;
    const startY = 100;
    const spacingX = ingredientsPanelWidth / 2;
    const spacingY = 90;
    const itemsPerRow = 2;

    ingredients.forEach((ingredient: { key: string; name: string; scale: number }, i: number) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = startX + (col * spacingX);
      const y = startY + (row * spacingY);

      // Create item background, image, and label (same as before)
      const itemBg = this.createIngredientItemBackground(x, y);
      const item = this.add.image(x, y, ingredient.key)
        .setInteractive()
        .setScale(ingredient.scale)
        .setName(ingredient.key);
      const label = this.add.text(x, y + 40, ingredient.name, {
        fontSize: '14px',
        fontFamily: 'Chewy, cursive',
        color: '#FFE4B5',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      this.input.setDraggable(item);
      this.ingredientItems.push(item);
      this.ingredientsPanel.add([itemBg, item, label]);

      this.setupIngredientHoverEffects(item, label, itemBg, x, y, ingredient.scale);
    });
  }

  private createIngredientItemBackground(x: number, y: number): Phaser.GameObjects.Graphics {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.25).fillRoundedRect(x - 55, y - 37.5, 110, 75, 12);
    bg.lineStyle(1, 0x8B4513, 0.4).strokeRoundedRect(x - 55, y - 37.5, 110, 75, 12);
    return bg;
  }

  private setupIngredientHoverEffects(
    item: Phaser.GameObjects.Image,
    label: Phaser.GameObjects.Text,
    itemBg: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    scale: number
  ) {
    item.on('pointerover', () => {
      item.setScale(scale * 1.15);
      label.setColor('#FFFFFF');
      itemBg.clear().fillStyle(0xFFD700, 0.15).fillRoundedRect(x - 55, y - 37.5, 110, 75, 12);
      itemBg.lineStyle(1, 0xFFD700, 0.6).strokeRoundedRect(x - 55, y - 37.5, 110, 75, 12);
    });
    item.on('pointerout', () => {
      item.setScale(scale);
      label.setColor('#FFE4B5');
      itemBg.clear().fillStyle(0x000000, 0.25).fillRoundedRect(x - 55, y - 37.5, 110, 75, 12);
      itemBg.lineStyle(1, 0x8B4513, 0.4).strokeRoundedRect(x - 55, y - 37.5, 110, 75, 12);
    });
  }

  private createDialogPanel() {
    const dialogWidth = this.layoutConfig.cookingAreaRight - this.layoutConfig.dialogPanelLeft;
    this.dialogPanel = this.add.container(this.layoutConfig.dialogPanelLeft, this.layoutConfig.dialogPanelY);

    // Background, Character, Text, Progress Bar (identical to existing code)
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0xFFFFF0, 0.95).fillRoundedRect(0, 0, dialogWidth, this.layoutConfig.dialogPanelHeight, 20);
    dialogBg.lineStyle(2, 0x8B4513, 0.6).strokeRoundedRect(0, 0, dialogWidth, this.layoutConfig.dialogPanelHeight, 20);

    const charContainer = this.add.graphics();
    charContainer.fillStyle(0x8B4513, 0.1).fillCircle(50, this.layoutConfig.dialogPanelHeight/2, 32);
    charContainer.lineStyle(2, 0x8B4513, 0.4).strokeCircle(50, this.layoutConfig.dialogPanelHeight/2, 32);

    this.characterImage = this.add.image(55, this.layoutConfig.dialogPanelHeight/2, "karakter1")
      .setScale(0.36).setOrigin(0.5, 0.5);

    this.stepText = this.add.text(120, this.layoutConfig.dialogPanelHeight/2, "", {
      fontSize: '18px',
      fontFamily: 'Chewy, cursive',
      color: '#2C1810',
      wordWrap: { width: dialogWidth - 160, useAdvancedWrap: true },
      align: 'left',
      lineSpacing: 4
    }).setOrigin(0, 0.5);

    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x8B4513, 0.2).fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 18, dialogWidth - 40, 6, 3);

    const progressBar = this.add.graphics();
    progressBar.fillStyle(0xFFD700, 1).fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 18, (dialogWidth - 40) * 0.1, 6, 3);

    this.dialogPanel.add([dialogBg, charContainer, this.characterImage, this.stepText, progressBg, progressBar]);
  }

  private updateIngredientsPanelVisuals() {
    const { ingredientsPanelWidth, ingredientsPanelHeight } = this.layoutConfig;
    this.panelBg.clear()
      .fillStyle(0x2A1810, 0.95).fillRoundedRect(0, 0, ingredientsPanelWidth, ingredientsPanelHeight, 20)
      .lineStyle(2, 0x8B4513, 0.8).strokeRoundedRect(0, 0, ingredientsPanelWidth, ingredientsPanelHeight, 20)
      .fillStyle(0x4A3428, 0.9).fillRoundedRect(10, 10, ingredientsPanelWidth - 20, 40, 8);

    this.panelTitle.setPosition(ingredientsPanelWidth/2, 30);
    this.setupMenuToggle(); // Re-apply listeners
  }

  private setupMenuToggle() {
    this.menuToggleButton
      .off('pointerover').on('pointerover', () => this.menuToggleButton.setTexture("menu_hover"))
      .off('pointerout').on('pointerout', () => this.menuToggleButton.setTexture("menu_normal"))
      .off('pointerdown').on('pointerdown', () => {
        this.menuToggleButton.setTexture("menu_active");
        this.toggleIngredientsPanel();
      })
      .off('pointerup').on('pointerup', () => this.menuToggleButton.setTexture("menu_hover"));
  }

  private toggleIngredientsPanel() {
    this.isIngredientsPanelOpen = !this.isIngredientsPanelOpen;
    const targetAlpha = this.isIngredientsPanelOpen ? 1 : 0.3;
    const targetX = this.isIngredientsPanelOpen ? this.layoutConfig.ingredientsPanelX : this.cameras.main.width - 50;

    this.tweens.add({
      targets: this.ingredientsPanel,
      alpha: targetAlpha,
      x: targetX,
      duration: 300,
      ease: 'Power2'
    });

    this.ingredientItems.forEach(item => {
      item.setVisible(this.isIngredientsPanelOpen).setActive(this.isIngredientsPanelOpen);
    });
  }

  private updateStepDisplay() {
    if (this.currentStep < this.gameSteps.length) {
      const step = this.gameSteps[this.currentStep];
      this.stepText.setText(step.text);
      this.characterImage.setTexture(step.character);

      this.stepText.setAlpha(0);
      this.tweens.add({
        targets: this.stepText,
        alpha: 1,
        duration: 500,
        ease: 'Power2'
      });

      const progress = (this.currentStep + 1) / this.gameSteps.length;
      const dialogWidth = this.layoutConfig.cookingAreaRight - this.layoutConfig.dialogPanelLeft;
      const progressBar = this.dialogPanel.list[this.dialogPanel.list.length - 1] as Phaser.GameObjects.Graphics;
      progressBar.clear().fillStyle(0xFFD700, 1).fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 18, (dialogWidth - 40) * progress, 6, 3);
    }
  }

  protected nextStep() {
    if (this.currentStep < this.gameSteps.length - 1) {
      this.gameSteps[this.currentStep].isCompleted = true;
      this.currentStep++;
      this.updateStepDisplay();
      this.showSuccessFeedback();
    } else {
      this.onRecipeCompleted();
    }
  }

  protected onRecipeCompleted() {
    this.time.delayedCall(1000, () => {
      this.cameras.main.flash(500, 255, 215, 0, false);
      for (let i = 0; i < 15; i++) {
        const particle = this.add.circle(
          this.cameras.main.width / 2 + (Math.random() - 0.5) * 300,
          this.cameras.main.height / 2 + (Math.random() - 0.5) * 200,
          4 + Math.random() * 4,
          Math.random() > 0.5 ? 0xFFD700 : 0xFF6B6B
        );
        this.tweens.add({
          targets: particle,
          y: particle.y - 120,
          x: particle.x + (Math.random() - 0.5) * 100,
          alpha: 0,
          scale: 2.5,
          duration: 2000 + Math.random() * 1000,
          ease: 'Power2',
          onComplete: () => particle.destroy()
        });
      }
      this.showCompletionDialog();
    });
  }

  protected showCompletionDialog() {
    const { width, height } = this.cameras.main;
    const overlay = this.add.graphics().fillStyle(0x000000, 0.8).fillRect(0, 0, width, height);
    const dialogBg = this.add.graphics()
      .fillStyle(0x2A1810, 0.95).fillRoundedRect(width/2 - 250, height/2 - 100, 500, 200, 25)
      .lineStyle(4, 0xFFD700, 1).strokeRoundedRect(width/2 - 250, height/2 - 100, 500, 200, 25);

    const title = this.add.text(width/2, height/2 - 40, "🎉 SELAMAT! 🎉", {
      fontSize: '32px', fontFamily: 'Chewy, cursive', color: '#FFD700', align: 'center', fontStyle: 'bold'
    }).setOrigin(0.5);
    const text = this.add.text(width/2, height/2, "Resep Berhasil Dibuat!", {
      fontSize: '24px', fontFamily: 'Chewy, cursive', color: '#FFFFFF', align: 'center'
    }).setOrigin(0.5);

    [overlay, dialogBg, title, text].forEach(el => el.setAlpha(0));
    this.tweens.add({
      targets: [overlay, dialogBg, title, text],
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      delay: (_: any, __: any, ___: any, index: number) => index * 100
    });
  }

  private setupInteractions() {
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      this.children.bringToTop(gameObject);
      gameObject.setTint(0x00ff00);
      gameObject.setData('dragStartX', gameObject.x);
      gameObject.setData('dragStartY', gameObject.y);
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
      gameObject.clearTint();
      if (!dropped) {
        this.resetIngredientPosition(gameObject);
      }
    });

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const wasHandled = this.handleDropLogic(gameObject, dropZone);
      if (!wasHandled) {
        this.handleIncorrectDrop(gameObject);
      }
    });
  }

  protected resetIngredientPosition(gameObject: Phaser.GameObjects.Image) {
    const x = gameObject.getData('dragStartX') || gameObject.x;
    const y = gameObject.getData('dragStartY') || gameObject.y;
    this.tweens.add({
      targets: gameObject,
      x, y,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  protected hideIngredient(key: string): boolean {
    // Removes a single ingredient (image + associated label and background) from the ingredients panel.
    if (!this.ingredientsPanel) return false;
    const recipe = (this as any).recipeIngredients || [];
    const entry = recipe.find((r: any) => r.key === key);
    const labelText = entry ? entry.name : null;

    const list = this.ingredientsPanel.list || [];
    const toDestroy = new Set<Phaser.GameObjects.GameObject>();

    for (let i = 0; i < list.length; i++) {
      const child = list[i] as Phaser.GameObjects.GameObject & any;
      // Match by image texture key or by name (for image)
      if (child && child.texture && (child.texture.key === key || child.name === key)) {
        toDestroy.add(child);
        if (i - 1 >= 0) toDestroy.add(list[i - 1]);
        if (i + 1 < list.length) toDestroy.add(list[i + 1]);
      }
      // Match label text (if available)
      if (labelText && child instanceof Phaser.GameObjects.Text && child.text === labelText) {
        toDestroy.add(child);
      }
    }

    // Also remove from ingredientItems array
    this.ingredientItems = this.ingredientItems.filter(it => !(it.name === key || (it.texture && it.texture.key === key)));

    toDestroy.forEach(c => {
      try { c.destroy(); } catch (e) { /* swallow */ }
    });

    return true;
  }

  protected hideIngredients(keyOrPrefix: string): void {
    // Remove any ingredient whose key or texture contains the given prefix or matches exactly.
    if (!this.ingredientsPanel) return;
    const list = this.ingredientsPanel.list || [];
    const toDestroy = new Set<Phaser.GameObjects.GameObject>();
    for (let i = 0; i < list.length; i++) {
      const child = list[i] as any;
      if (child && child.texture && (child.texture.key === keyOrPrefix || String(child.texture.key).includes(keyOrPrefix))) {
        toDestroy.add(child);
        if (i - 1 >= 0) toDestroy.add(list[i - 1]);
        if (i + 1 < list.length) toDestroy.add(list[i + 1]);
      }
      // Also match labels by checking recipe data
      const recipe = (this as any).recipeIngredients || [];
      const entry = recipe.find((r: any) => String(r.key).includes(keyOrPrefix) || r.key === keyOrPrefix);
      if (entry) {
        // destroy any text whose text equals entry.name
        if (child instanceof Phaser.GameObjects.Text && child.text === entry.name) {
          toDestroy.add(child);
        }
      }
    }

    // Update ingredientItems array to remove matching items
    this.ingredientItems = this.ingredientItems.filter(it => {
      const tex = it && (it.texture && it.texture.key);
      return !(tex && (tex === keyOrPrefix || String(tex).includes(keyOrPrefix)));
    });

    toDestroy.forEach(c => {
      try { c.destroy(); } catch (e) {}
    });
  }

  private handleIncorrectDrop(gameObject: Phaser.GameObjects.Image) {
    this.cameras.main.shake(200, 0.01);
    this.tweens.add({
      targets: gameObject,
      x: gameObject.x + 10,
      yoyo: true,
      repeat: 5,
      duration: 30,
      ease: 'Sine.easeInOut',
      onComplete: () => this.resetIngredientPosition(gameObject)
    });
  }

  protected showSuccessFeedback() {
    this.cameras.main.flash(150, 144, 238, 144, false);
    for (let i = 0; i < 5; i++) {
      const particle = this.add.circle(
        this.cameras.main.width / 2 + (Math.random() - 0.5) * 100,
        this.cameras.main.height / 2 + (Math.random() - 0.5) * 100,
        3 + Math.random() * 3,
        0xFFD700
      );
      this.tweens.add({
        targets: particle,
        y: particle.y - 60,
        alpha: 0,
        scale: 2,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  private createHintButton() {
    const btn = this.add.image(
      this.layoutConfig.ingredientsPanelX + this.layoutConfig.ingredientsPanelWidth / 2,
      this.layoutConfig.ingredientsPanelY + this.layoutConfig.ingredientsPanelHeight + 120,
      'hint_normal'
    ).setInteractive().setScale(0.1);

    btn.on('pointerover', () => btn.setTexture('hint_hover'));
    btn.on('pointerout', () => btn.setTexture('hint_normal'));
    btn.on('pointerdown', () => {
      btn.setTexture('hint_active');
      this.showHintPopup();
    });
  }

  private showHintPopup() {
    if (!this.hintPopup) this.createHintPopup();
    this.hintPopup.setVisible(!this.hintPopup.visible);
  }

  private createHintPopup() {
    const w = 650, h = 450, cx = this.cameras.main.width / 2, cy = this.cameras.main.height / 2;
    this.hintPopup = this.add.container(cx, cy).setDepth(100).setVisible(false);

    const bg = this.add.graphics().fillGradientStyle(0x8B4513, 0xA0522D, 0xCD853F, 0xDEB887, 1).fillRoundedRect(-w/2, -h/2, w, h, 20);
    const contentBg = this.add.graphics().fillStyle(0xFFFDD0, 0.95).fillRoundedRect(-w/2 + 15, -h/2 + 15, w - 30, h - 30, 15);
    const title = this.add.text(0, -h/2 + 45, (this as any).recipeName || 'Resep', {
      fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#5D4037', fontStyle: 'bold'
    }).setOrigin(0.5);
    const divider = this.add.graphics().lineStyle(2, 0x8B4513, 0.8).lineBetween(-w/2 + 40, -h/2 + 70, w/2 - 40, -h/2 + 70);
    const text = this.add.text(-w/2 + 40, -h/2 + 90, (this as any).infoContent || 'Informasi resep akan muncul di sini.', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#3E2723',
      wordWrap: { width: w - 80, useAdvancedWrap: true }, align: 'left', lineSpacing: 6
    }).setOrigin(0, 0);

    this.hintPopup.add([bg, contentBg, title, divider, text]);
  }

  private setupIngredientsPanelLayout(hAlign?: string, vAlign?: string, padding?: number, x?: number, y?: number) {
    const { width, height } = this.cameras.main;
    const { ingredientsPanelWidth, ingredientsPanelHeight } = this.layoutConfig;
    let targetX = x ?? (hAlign === 'left' ? (padding || 0) : hAlign === 'center' ? (width - ingredientsPanelWidth) / 2 : width - ingredientsPanelWidth - (padding || 0));
    let targetY = y ?? (vAlign === 'top' ? (padding || 0) : vAlign === 'middle' ? (height - ingredientsPanelHeight) / 2 : height - ingredientsPanelHeight - (padding || 0));
    this.ingredientsPanel.setPosition(targetX, targetY);
  }
}