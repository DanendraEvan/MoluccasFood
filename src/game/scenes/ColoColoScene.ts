
// src/game/scenes/ColoColoScene.ts - Final version with PapedaScene UI and Corrected Logic
import Phaser from 'phaser';

interface GameStep {
  id: number;
  text: string;
  character: string;
  isCompleted: boolean;
}

export default class ColoColoScene extends Phaser.Scene {
  public dialogBridge: any = null;
  private currentStep = 0;
  private subStepCounter = 0;
  private gameState: { telenanState: string; mangkukState: string; };
  private gameObjects: { [key: string]: Phaser.GameObjects.Image } = {};
  private ingredientItems: Phaser.GameObjects.Image[] = [];
  private telenanDraggable = false;
  private telenanOriginalPos: { x: number, y: number } | null = null;
  private lastSlicePosition: { x: number, y: number } | null = null;
  private sliceStrokes = 0;
  private cuttingCompleted = false;
  private spoonInBowl = false;
  private ingredientsPanel!: Phaser.GameObjects.Container;
  private menuToggleButton!: Phaser.GameObjects.Image;
  private isIngredientsPanelOpen = true;
  private panelBg!: Phaser.GameObjects.Graphics;
  private panelTitle!: Phaser.GameObjects.Text;
  private ingredientsContentContainer!: Phaser.GameObjects.Container;
  private scrollbar!: Phaser.GameObjects.Graphics;
  private scrollableArea!: Phaser.GameObjects.Zone;
  private scrollContentHeight: number = 0;
  private ingredientsContentMask: Phaser.Display.Masks.GeometryMask | null = null;
  private scrollbarThumb!: Phaser.GameObjects.Graphics;
  private isScrollbarDragging: boolean = false;
  private scrollbarDragStartY: number = 0;
  private instructionText: Phaser.GameObjects.Text | null = null;

  // Mobile swipe scroll variables
  private isSwipeScrolling: boolean = false;
  private swipeStartY: number = 0;
  private swipeStartScrollY: number = 0;
  private layoutConfig = {
    headerHeight: 60,
    ingredientsPanelWidth: 400,
    ingredientsPanelX: 0,
    ingredientsPanelY: 300,
    ingredientsPanelHeight: 550,
    cookingAreaRight: 290,
    dialogPanelHeight: 180,
  };

  private readonly gameSteps: GameStep[] = [
    { id: 0, text: "Mari kita mulai! Pertama, letakkan cili di atas talenan.", character: "karakter1.png", isCompleted: false },
    { id: 1, text: "Ambil piso lalu gesekkan pada cili untuk memotongnya.", character: "karakter1.png", isCompleted: false },
    { id: 2, text: "Bagus! Seret talenan berisi cili ke area mangkok untuk memindahkannya.", character: "karakter2.png", isCompleted: false },
    { id: 3, text: "Saatnya menambahkan kecap. Seret dan letakkan kecap ke dalam mangkok.", character: "karakter3.png", isCompleted: false },
    { id: 4, text: "Sekarang, letakkan bawang putih di talenan yang kosong.", character: "karakter2.png", isCompleted: false },
    { id: 5, text: "Sama seperti cili, potong bawang putih hingga halus.", character: "karakter2.png", isCompleted: false },
    { id: 6, text: "Kerja bagus! Seret talenan berisi bawang ke area mangkok.", character: "karakter3.png", isCompleted: false },
    { id: 7, text: "Sekarang, tambahkan daong lemon untuk memberi aroma segar.", character: "karakter4.png", isCompleted: false },
    { id: 8, text: "Sekarang, tambahkan daong lemon untuk memberi aroma segar.", character: "karakter4.png", isCompleted: false },
    { id: 9, text: "Letakkan lemon cina di atas talenan yang bersih.", character: "karakter5.png", isCompleted: false },
    { id: 10, text: "Potong lemon cina menjadi dua bagian dengan piso.", character: "karakter5.png", isCompleted: false },
    { id: 11, text: "Pindahkan potongan lemon cina ke dalam mangkok.", character: "karakter5.png", isCompleted: false },
    { id: 12, text: "Ambil sendok untuk mengaduk semua bahan di dalam mangkok.", character: "karakter1.png", isCompleted: false },
    { id: 13, text: "Hampir selesai! Ambil mangko dan sajikan sambalmu.", character: "karakter2.png", isCompleted: false },
    { id: 14, text: "Luar biasa! Sambal Colo-colo khas Maluku buatanmu sudah jadi!", character: "karakter2.png", isCompleted: false },
  ];

  constructor() {
    super('ColoColoScene');
    this.gameState = { telenanState: 'colo_telenan', mangkukState: 'colo_mangkuk' };
  }

  preload() {
    this.load.image('background', '/assets/backgrounds/kitchen.png');
    const basePath = '/assets/foods/colo_colo/';
    const assets = [
      { file: 'Cabai.png', key: 'cabai' },
      { file: 'BawangPutih2.png', key: 'bawangputih2' },
      { file: 'DaunJeruk.png', key: 'daunjeruk' },
      { file: 'JerukNipis.png', key: 'jeruknipis' },
      { file: 'Kecap.png', key: 'kecap' },
      { file: 'Sendok.png', key: 'sendok' },
      { file: 'Pisau.png', key: 'pisau' },
      { file: 'PiringColoColo.png', key: 'piringcolocolo' },
      { file: 'telenan.png', key: 'telenan' },
      { file: 'Mangkuk.png', key: 'mangkuk' },
      { file: 'ColoColo.png', key: 'colocolo' }
    ];
    assets.forEach(asset => this.load.image(`colo_${asset.key}`, `${basePath}${asset.file}`));
    this.load.on('loaderror', (file: any) => console.warn(`Failed to load: ${file.src}`));
    for (let i = 0; i <= 3; i++) this.load.image(`telenan_chili_${i}`, `${basePath}TelenanCabaiPotong${i === 0 ? '' : i}.png`);
    this.load.image('telenan_garlic_0', `${basePath}TelenanBawangPutih.png`);
    for (let i = 1; i <= 5; i++) this.load.image(`telenan_garlic_${i}`, `${basePath}TelenanBawangPutih${i}.png`);
    this.load.image('kecap1', `${basePath}kecap1.png`);
    this.load.image('kecap2', `${basePath}kecap2.png`);
    this.load.image('Mangkukcabe', `${basePath}Mangkukcabe.png`);
    this.load.image('tambahancabe', `${basePath}tambahancabe.png`);
    this.load.image('tambahanbawang', `${basePath}tambahanbawang.png`);
    this.load.image('jeruk1', `${basePath}jeruk1.png`);
    this.load.image('jeruk2', `${basePath}jeruk2.png`);
    this.load.image('tambahandaun', `${basePath}tambahandaun.png`);
    this.load.image('daun1', `${basePath}daun1.png`);
    this.load.image('daun2', `${basePath}daun2.png`);
    this.load.image('daun3', `${basePath}daun3.png`);
    this.load.image('daunmangkuk', `${basePath}daunmangkuk.png`);
    this.load.image('sendok1', `${basePath}sendok1.png`);
    this.load.image('sendok2', `${basePath}sendok2.png`);
    this.load.image('jerukmangkuk', `${basePath}jerukmangkuk.png`);
    this.load.image('telenan_lime_0', `${basePath}TelenanNipis.png`);
    this.load.image('telenan_lime_1', `${basePath}TelenanNipis1.png`);
    this.load.image('telenan_lime_2', `${basePath}TelenanNipis2.png`);
    this.load.image("menu_normal", "/assets/ui/buttons/menu/menu_normal.png");
    this.load.image("menu_hover", "/assets/ui/buttons/menu/menu_hover.png");
    this.load.image("menu_active", "/assets/ui/buttons/menu/menu_active.png");
    for (let i = 1; i <= 5; i++) this.load.image(`karakter${i}`, `/assets/karakter/karakter${i}.png`);
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0);
    this.calculateLayout();
    this.createCookingArea();
    this.createIngredientsPanel();
    this.updateIngredientsPanelVisuals();
    this.setupIngredientsPanelLayout(undefined, undefined, undefined, 1500, this.layoutConfig.ingredientsPanelY);
    this.setupInputHandlers();
    this.setupDialogBridge();
  }

  private setupInputHandlers() {
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      const worldPos = this.ingredientsContentContainer.getWorldTransformMatrix();
      const isFromPanel = this.ingredientsContentContainer.getAll().includes(gameObject);

      if (isFromPanel) {
        gameObject.setData('originalParent', this.ingredientsContentContainer);
        gameObject.setData('dragStartX', gameObject.x);
        gameObject.setData('dragStartY', gameObject.y);

        const worldX = worldPos.tx + gameObject.x;
        const worldY = worldPos.ty + gameObject.y;

        const offsetX = pointer.x - worldX;
        const offsetY = pointer.y - worldY;
        gameObject.setData('dragOffsetX', offsetX);
        gameObject.setData('dragOffsetY', offsetY);

        this.ingredientsContentContainer.remove(gameObject, false);
        gameObject.setPosition(pointer.x - offsetX, pointer.y - offsetY);
      } else {
        gameObject.setData({ dragStartX: gameObject.x, dragStartY: gameObject.y });
        const offsetX = pointer.x - gameObject.x;
        const offsetY = pointer.y - gameObject.y;
        gameObject.setData('dragOffsetX', offsetX);
        gameObject.setData('dragOffsetY', offsetY);
      }

      this.children.bringToTop(gameObject);
      this.lastSlicePosition = { x: pointer.x, y: pointer.y };
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      const offsetX = gameObject.getData('dragOffsetX') || 0;
      const offsetY = gameObject.getData('dragOffsetY') || 0;

      gameObject.x = pointer.x - offsetX;
      gameObject.y = pointer.y - offsetY;
      this.handleSlicing(pointer, gameObject);
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
      if (!dropped) {
        this.resetIngredientPosition(gameObject);
      }
      if (gameObject.name === 'telenan' && this.telenanDraggable) this.handleTelenanPour();
    });

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Image) => {
      this.handleDrop(gameObject, dropZone);
    });

    this.gameObjects.telenan.on('pointerdown', () => this.handleTelenanClick());
    this.gameObjects.mangkuk.on('pointerdown', () => this.handleMangkukClick());
  }

  private handleDrop(ingredientObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Image) {
    const ingredientName = ingredientObject.name;
    const targetName = dropZone.name;
    let correctDrop = false;

    switch (this.currentStep) {
      case 0: // Drag Cabai to Telenan
        if (ingredientName === 'ingredient_cabai' && targetName === 'telenan') {
          this.transformTelenan('telenan_chili_0');
          correctDrop = true;
          this.nextStep();
        }
        break;
      case 3: // Drag Kecap to Mangkuk
        if (ingredientName === 'ingredient_kecap' && targetName === 'mangkuk') {
          this.transformMangkuk('kecap1');
          this.displayInstruction("Klik Mangko untuk menuangkan Kecap");
          correctDrop = true;
        }
        break;
      case 4: // Drag Bawang to Telenan
        if (ingredientName === 'ingredient_bawangputih2' && targetName === 'telenan') {
          this.transformTelenan('telenan_garlic_0');
          correctDrop = true;
          this.nextStep();
        }
        break;
      case 7: // Drag Daun Jeruk to Mangkuk
        if (ingredientName === 'ingredient_daunjeruk' && targetName === 'mangkuk') {
          this.transformMangkuk('tambahandaun');
          this.displayInstruction("Klik Mangko untuk memotong Daong Lemon");
          correctDrop = true;
        }
        break;
      case 9: // Drag Jeruk Nipis to Telenan
        if (ingredientName === 'ingredient_jeruknipis' && targetName === 'telenan') {
          this.transformTelenan('telenan_lime_0');
          correctDrop = true;
          this.nextStep();
        }
        break;
      case 12: // Drag Sendok to Mangkuk
        if (ingredientName === 'ingredient_sendok' && targetName === 'mangkuk') {
            this.transformMangkuk('sendok1');
            ingredientObject.setVisible(false);
            this.spoonInBowl = true;
            correctDrop = true;
        }
        break;
      case 13: // Drag Piring to Mangkuk
        if (ingredientName === 'ingredient_piringcolocolo' && targetName === 'mangkuk') {
          this.gameObjects.mangkuk.setVisible(false);
          this.add.image(this.gameObjects.mangkuk.x, this.gameObjects.mangkuk.y, 'colo_colocolo').setScale(0.6);
          correctDrop = true;
          this.nextStep();
        }
        break;
    }

    if (correctDrop) {
      this.hideIngredientFromPanel(ingredientName);
      if(ingredientName !== 'ingredient_sendok') ingredientObject.destroy();
    } else {
      this.resetIngredientPosition(ingredientObject);
    }
  }

  private handleMangkukClick() {
    switch (this.currentStep) {
      case 3: // Clicking for Kecap
        this.subStepCounter++;
        if (this.subStepCounter === 1) this.transformMangkuk('kecap2');
        else if (this.subStepCounter === 2) {
          this.transformMangkuk('tambahancabe');
          this.nextStep();
        }
        break;
      case 7: // Clicking for Daun Jeruk
        this.subStepCounter++;
        if (this.subStepCounter === 1) this.transformMangkuk('daun1');
        else if (this.subStepCounter === 2) this.transformMangkuk('daun2');
        else if (this.subStepCounter === 3) this.transformMangkuk('daun3');
        else if (this.subStepCounter === 4) {
            this.transformMangkuk('daunmangkuk');
            this.nextStep();
        }
        break;
      case 11: // Clicking for Jeruk Nipis
        this.subStepCounter++;
        if (this.subStepCounter === 1) {
            this.transformMangkuk('jeruk2');
            this.displayInstruction("Klik Mangko untuk memeras Lemon Cina");
        }
        else if (this.subStepCounter === 2) {
            this.transformMangkuk('jerukmangkuk');
            this.nextStep();
        }
        break;
      case 12: // Clicking for Sendok
        if (!this.spoonInBowl) return;
        this.subStepCounter++;
        if(this.subStepCounter <= 6){
            const texture = (this.subStepCounter % 2 === 0) ? 'sendok1' : 'sendok2';
            this.transformMangkuk(texture);
        }
        if (this.subStepCounter === 6) {
            this.transformMangkuk('jerukmangkuk');
            this.nextStep();
        }
        break;
    }
  }

  private handleSlicing(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) {
    if (gameObject.name !== 'ingredient_pisau' || !this.lastSlicePosition || this.cuttingCompleted) return;
    const telenanBounds = this.gameObjects.telenan.getBounds();
    if (!this.gameObjects.telenan.visible || !Phaser.Geom.Rectangle.Contains(telenanBounds, pointer.x, pointer.y)) return;

    // Ensure the slicing motion starts and stays within the cutting board
    if (!Phaser.Geom.Rectangle.Contains(telenanBounds, this.lastSlicePosition.x, this.lastSlicePosition.y)) {
      this.lastSlicePosition = { x: pointer.x, y: pointer.y };
      return;
    }

    const isCuttingStep = this.currentStep === 1 || this.currentStep === 5 || this.currentStep === 10;
    if (!isCuttingStep) return;
    const deltaX = pointer.x - this.lastSlicePosition.x;
    if (Math.abs(deltaX) > 5) {
        this.sliceStrokes++;
        this.lastSlicePosition = { x: pointer.x, y: pointer.y };
        const STROKES_PER_FRAME = 8;
        if (this.sliceStrokes >= STROKES_PER_FRAME) {
            this.sliceStrokes = 0;
            this.subStepCounter++;
            let cuttingComplete = false;
            if (this.currentStep === 1) {
                const max = 3;
                this.transformTelenan(`telenan_chili_${Math.min(this.subStepCounter, max)}`);
                if (this.subStepCounter >= max) cuttingComplete = true;
            } else if (this.currentStep === 5) {
                const max = 5;
                this.transformTelenan(`telenan_garlic_${Math.min(this.subStepCounter, max)}`);
                if (this.subStepCounter >= max) cuttingComplete = true;
            } else if (this.currentStep === 10) {
                const max = 2;
                this.transformTelenan(`telenan_lime_${Math.min(this.subStepCounter, max)}`);
                if (this.subStepCounter >= max) cuttingComplete = true;
            }
            if (cuttingComplete) {
                this.cuttingCompleted = true;
                this.time.delayedCall(500, () => this.nextStep());
            }
        }
    }
  }

  private handleTelenanClick() {
    const canSelect = (this.currentStep === 2 && this.gameState.telenanState === 'telenan_chili_3') ||
                      (this.currentStep === 6 && this.gameState.telenanState === 'telenan_garlic_5') ||
                      (this.currentStep === 11 && this.gameState.telenanState === 'telenan_lime_2');
    if (canSelect) this.makeTelenanDraggable();
  }

  private makeTelenanDraggable() {
    if (!this.telenanOriginalPos) this.telenanOriginalPos = { x: this.gameObjects.telenan.x, y: this.gameObjects.telenan.y };
    this.telenanDraggable = true;
    this.input.setDraggable(this.gameObjects.telenan, true);
    this.children.bringToTop(this.gameObjects.telenan);
  }

  private handleTelenanPour() {
    if (!this.telenanDraggable) return;
    const distance = Phaser.Math.Distance.Between(this.gameObjects.telenan.x, this.gameObjects.telenan.y, this.gameObjects.mangkuk.x, this.gameObjects.mangkuk.y);
    if (distance > 200) {
      this.resetTelenanPosition();
      return;
    }
    let transferred = false;
    if (this.currentStep === 2) {
      this.transformMangkuk('Mangkukcabe');
      this.transformTelenan('colo_telenan');
      transferred = true;
    } else if (this.currentStep === 6) {
      this.transformMangkuk('tambahanbawang');
      this.gameObjects.telenan.setVisible(false).setActive(false);
      transferred = true;
    } else if (this.currentStep === 11) {
      this.transformMangkuk('jeruk1');
      this.gameObjects.telenan.setVisible(false).setActive(false);
      transferred = true;
    }
    if (transferred) {
      this.telenanDraggable = false;
      this.input.setDraggable(this.gameObjects.telenan, false);
      if (this.gameObjects.telenan.visible) this.resetTelenanPosition();
      if(this.currentStep !== 11) this.nextStep();
    } else {
      this.resetTelenanPosition();
    }
  }

  private nextStep() {
    if (this.instructionText) {
        this.instructionText.destroy();
        this.instructionText = null;
    }
    if (this.currentStep >= this.gameSteps.length - 1) return;
    this.gameSteps[this.currentStep].isCompleted = true;
    this.currentStep++;
    this.subStepCounter = 0;
    this.cuttingCompleted = false;
    if (this.dialogBridge) this.dialogBridge.setStep(this.currentStep);
    this.showSuccessFeedback();
    if (this.currentStep === 8) {
      this.time.delayedCall(1000, () => {
        this.transformTelenan('colo_telenan');
        this.gameObjects.telenan.setPosition(this.telenanOriginalPos?.x || 0, this.telenanOriginalPos?.y || 0).setVisible(true).setActive(true);
        this.nextStep();
      });
      return;
    }
    if (this.currentStep === this.gameSteps.length - 1) this.showCompletionCelebration();
  }
  
  private transformTelenan(newState: string) { this.gameState.telenanState = newState; this.gameObjects.telenan.setTexture(newState); }
  private transformMangkuk(newState: string) { 
    this.gameState.mangkukState = newState; 
    const mangkuk = this.gameObjects.mangkuk;
    mangkuk.setTexture(newState).setScale(0.8);
  }

  private resetIngredientPosition(gameObject: Phaser.GameObjects.Image) {
    const originalParent = gameObject.getData('originalParent');
    const dragStartX = gameObject.getData('dragStartX');
    const dragStartY = gameObject.getData('dragStartY');

    if (originalParent === this.ingredientsContentContainer) {
        const worldPos = this.ingredientsContentContainer.getWorldTransformMatrix();
        this.tweens.add({
            targets: gameObject,
            x: worldPos.tx + dragStartX,
            y: worldPos.ty + dragStartY,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                gameObject.setPosition(dragStartX, dragStartY);
                this.ingredientsContentContainer.add(gameObject);
            }
        });
    } else {
        this.tweens.add({ targets: gameObject, x: dragStartX, y: dragStartY, duration: 300, ease: 'Power2' });
    }

    this.cameras.main.shake(150, 0.008);
    
    const errorText = this.add.text(gameObject.x, gameObject.y - 50, "✗", {
      fontSize: '24px',
      color: '#FF6B6B',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: errorText,
      y: errorText.y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => errorText.destroy()
    });
  }

  private resetTelenanPosition() {
    if (!this.telenanOriginalPos) return;
    this.tweens.add({ targets: this.gameObjects.telenan, x: this.telenanOriginalPos.x, y: this.telenanOriginalPos.y, duration: 500, ease: 'Power2' });
  }

  private hideIngredientFromPanel(ingredientName: string) {
    const item = this.ingredientItems.find(i => i.name === ingredientName);
    if (item) item.setVisible(false).setActive(false);
  }

  private showSuccessFeedback() { this.cameras.main.flash(100, 144, 238, 144); }

  private displayInstruction(message: string) {
    if (this.instructionText) {
        this.instructionText.destroy();
    }

    const { width, height } = this.cameras.main;
    const cookingAreaCenterX = (width - this.layoutConfig.ingredientsPanelWidth) / 2;
    const cookingAreaCenterY = height / 2;

    this.instructionText = this.add.text(cookingAreaCenterX, cookingAreaCenterY - 100, message, {
        fontSize: '32px',
        fontFamily: 'Chewy, cursive',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 20, y: 10 },
        align: 'center',
    }).setOrigin(0.5).setDepth(1000);

    this.time.delayedCall(3000, () => {
        if (this.instructionText) {
            this.instructionText.destroy();
            this.instructionText = null;
        }
    });
  }

  private calculateLayout() {
    const gameWidth = this.cameras.main.width;
    this.layoutConfig.ingredientsPanelX = gameWidth - this.layoutConfig.ingredientsPanelWidth - 15;
    this.layoutConfig.cookingAreaRight = gameWidth - this.layoutConfig.ingredientsPanelWidth - 40;
  }

  private createCookingArea() {
    const { width, height } = this.cameras.main;
    const cookingAreaCenterX = (width - this.layoutConfig.ingredientsPanelWidth) / 2;
    const cookingAreaCenterY = height - 320;
    this.gameObjects.telenan = this.add.image(cookingAreaCenterX - 200, cookingAreaCenterY, 'colo_telenan').setInteractive({ dropZone: true }).setName('telenan').setScale(0.6);
    this.gameObjects.mangkuk = this.add.image(cookingAreaCenterX + 200, cookingAreaCenterY, 'colo_mangkuk').setInteractive({ dropZone: true }).setName('mangkuk').setScale(0.8);
    this.telenanOriginalPos = { x: this.gameObjects.telenan.x, y: this.gameObjects.telenan.y };
  }

  private createIngredientsPanel() {
    this.ingredientsPanel = this.add.container(this.layoutConfig.ingredientsPanelX, this.layoutConfig.ingredientsPanelY);
    this.panelBg = this.add.graphics();
    this.ingredientsPanel.add(this.panelBg);
    this.panelTitle = this.add.text(0, 0, "", {});
    this.ingredientsPanel.add(this.panelTitle);
    this.menuToggleButton = this.add.image(0, 0, "menu_normal");
    this.ingredientsPanel.add(this.menuToggleButton);

    const scrollableAreaX = 12;
    const scrollableAreaY = 60;
    const scrollableAreaWidth = this.layoutConfig.ingredientsPanelWidth - 36;
    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - scrollableAreaY - 12;

    this.scrollableArea = this.add.zone(
      scrollableAreaX + scrollableAreaWidth / 2,
      scrollableAreaY + scrollableAreaHeight / 2,
      scrollableAreaWidth,
      scrollableAreaHeight
    ).setOrigin(0.5, 0.5);
    this.ingredientsPanel.add(this.scrollableArea);

    this.ingredientsContentContainer = this.add.container(scrollableAreaX, scrollableAreaY);
    this.ingredientsPanel.add(this.ingredientsContentContainer);

    const maskGraphics = this.make.graphics();
    maskGraphics.fillRect(0, 0, scrollableAreaWidth, scrollableAreaHeight);
    this.ingredientsContentMask = maskGraphics.createGeometryMask();

    maskGraphics.x = this.ingredientsPanel.x + scrollableAreaX;
    maskGraphics.y = this.ingredientsPanel.y + scrollableAreaY;

    this.ingredientsContentContainer.setMask(this.ingredientsContentMask);

    this.scrollbar = this.add.graphics();
    this.ingredientsPanel.add(this.scrollbar);

    this.scrollbarThumb = this.add.graphics();
    this.ingredientsPanel.add(this.scrollbarThumb);

    this.createIngredients();

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
      const panelBounds = new Phaser.Geom.Rectangle(
        this.ingredientsPanel.x + scrollableAreaX,
        this.ingredientsPanel.y + scrollableAreaY,
        scrollableAreaWidth,
        scrollableAreaHeight
      );

      if (Phaser.Geom.Rectangle.Contains(panelBounds, pointer.x, pointer.y)) {
        this.handleScroll(deltaY);
      }
    });

    this.setupSwipeScrolling(scrollableAreaX, scrollableAreaY, scrollableAreaWidth, scrollableAreaHeight);
    this.updateMaskPosition();
  }

  private createIngredients() {
    this.ingredientItems.forEach(item => item.destroy());
    this.ingredientItems = [];
    this.ingredientsContentContainer.removeAll(true);

    const ingredients = [
        { key: "cabai", name: "Cili", scale: 0.25 },
        { key: "bawangputih2", name: "Bawang Putih", scale: 0.25 },
        { key: "daunjeruk", name: "Daong Lemon", scale: 0.25 },
        { key: "jeruknipis", name: "Lemon Cina", scale: 0.25 },
        { key: "kecap", name: "Kecap", scale: 0.25 },
        { key: "sendok", name: "Sendok", scale: 0.25 },
        { key: "pisau", name: "Piso", scale: 0.25 },
        { key: "piringcolocolo", name: "Mangko", scale: 0.25 }
    ];

    const itemWidth = 160;
    const itemHeight = 110;
    const horizontalGap = 20;
    const leftMargin = 30;
    const startX = leftMargin + (itemWidth / 2);
    const topPadding = 100;
    const startY = 20 + topPadding;
    const spacingX = itemWidth + horizontalGap;
    const spacingY = 120;
    const itemsPerRow = 2;

    let maxContentY = 0;

    ingredients.forEach((ingredient, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = startX + (col * spacingX);
      const y = startY + (row * spacingY);

      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x000000, 0.25);
      itemBg.fillRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
      itemBg.lineStyle(1, 0x8B4513, 0.4);
      itemBg.strokeRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
      this.ingredientsContentContainer.add(itemBg);

      const itemKey = `colo_${ingredient.key}`;
      const ingredientName = `ingredient_${ingredient.key}`;

      const item = this.add.image(x, y, itemKey)
        .setInteractive()
        .setScale(ingredient.scale * 1.5)
        .setName(ingredientName)
        .setData('originalScale', ingredient.scale * 1.5)
        .setData('ingredientType', ingredient.key);

      this.ingredientItems.push(item);
      this.input.setDraggable(item);
      this.ingredientsContentContainer.add(item);

      const label = this.add.text(x, y + 50, ingredient.name, {
        fontSize: '22px',
        fontFamily: 'Chewy, cursive',
        color: '#FFFF00',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      this.ingredientsContentContainer.add(label);

      item.on('pointerover', () => {});

      item.on('pointerout', () => {
        item.setScale(ingredient.scale * 1.5);
        label.setColor('#FFFF00');
        itemBg.clear();
        itemBg.fillStyle(0x000000, 0.25);
        itemBg.fillRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
        itemBg.lineStyle(1, 0x8B4513, 0.4);
        itemBg.strokeRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
      });

      maxContentY = Math.max(maxContentY, y + 40);
    });

    const bottomPadding = 15;
    this.scrollContentHeight = maxContentY + bottomPadding;
    this.updateScrollbar();
  }

  private setupIngredientsPanelLayout(hAlign?: string, vAlign?: string, padding?: number, x?: number, y?: number) {
    const { width, height } = this.cameras.main;
    const { ingredientsPanelWidth, ingredientsPanelHeight } = this.layoutConfig;
    this.ingredientsPanel.setPosition(x !== undefined ? x : width - ingredientsPanelWidth - (padding || 0), y !== undefined ? y : height - ingredientsPanelHeight - (padding || 0));
    this.updateMaskPosition();
  }

  private updateMaskPosition() {
    if (this.ingredientsContentMask && this.ingredientsContentMask.geometryMask) {
      const maskGraphics = this.ingredientsContentMask.geometryMask as Phaser.GameObjects.Graphics;
      const scrollableAreaX = 12;
      const scrollableAreaY = 60;

      maskGraphics.x = this.ingredientsPanel.x + scrollableAreaX;
      maskGraphics.y = this.ingredientsPanel.y + scrollableAreaY;
    }
  }

  private updateIngredientsPanelVisuals() {
    const { ingredientsPanelWidth, ingredientsPanelHeight } = this.layoutConfig;
    this.panelBg.clear();
    this.panelBg.fillStyle(0x2A1810, 0.95).fillRoundedRect(0, 0, ingredientsPanelWidth, ingredientsPanelHeight, 20);
    this.panelBg.lineStyle(2, 0x8B4513, 0.8).strokeRoundedRect(0, 0, ingredientsPanelWidth, ingredientsPanelHeight, 20);
    this.panelBg.fillStyle(0x4A3428, 0.9).fillRoundedRect(10, 10, ingredientsPanelWidth - 20, 40, 8);
    this.panelTitle.setText("BAHAN & ALAT").setStyle({ fontSize: '28px', fontFamily: 'Chewy, cursive', color: '#FFE4B5', align: 'center', fontStyle: 'bold' }).setPosition(ingredientsPanelWidth/2, 30).setOrigin(0.5, 0.5);
    this.menuToggleButton.setPosition(30, 30).setScale(0.12).setInteractive()
      .on('pointerover', () => this.menuToggleButton.setTexture("menu_hover"))
      .on('pointerout', () => this.menuToggleButton.setTexture("menu_normal"))
      .on('pointerdown', () => {
        this.menuToggleButton.setTexture("menu_active");
        this.toggleIngredientsPanel();
      })
      .on('pointerup', () => this.menuToggleButton.setTexture("menu_hover"));
    this.updateScrollbar();
    this.updateMaskPosition();
  }

  private toggleIngredientsPanel() {
    this.isIngredientsPanelOpen = !this.isIngredientsPanelOpen;
    const targetX = this.isIngredientsPanelOpen ? this.layoutConfig.ingredientsPanelX : this.cameras.main.width - 50;
    this.tweens.add({
      targets: this.ingredientsPanel,
      alpha: this.isIngredientsPanelOpen ? 1 : 0.3,
      x: targetX,
      duration: 300,
      ease: 'Power2',
      onUpdate: () => {
        this.updateMaskPosition();
      }
    });
  }

  private handleScroll(deltaY: number) {
    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 60 - 12;
    const maxScroll = Math.max(0, this.scrollContentHeight - scrollableAreaHeight);

    const scrollSpeed = 0.5;
    let newY = this.ingredientsContentContainer.y - (deltaY * scrollSpeed);

    newY = Math.max(-maxScroll, newY);
    newY = Math.min(0, newY);

    this.ingredientsContentContainer.y = newY;
    this.updateScrollbar();
  }

  private setupSwipeScrolling(scrollableAreaX: number, scrollableAreaY: number, scrollableAreaWidth: number, scrollableAreaHeight: number) {
    const panelBounds = new Phaser.Geom.Rectangle(
      this.ingredientsPanel.x + scrollableAreaX,
      this.ingredientsPanel.y + scrollableAreaY,
      scrollableAreaWidth,
      scrollableAreaHeight
    );

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!Phaser.Geom.Rectangle.Contains(panelBounds, pointer.x, pointer.y)) {
        return;
      }

      const gameObjectsUnderPointer = this.input.hitTestPointer(pointer);
      const clickedIngredient = gameObjectsUnderPointer.find((obj: any) =>
        this.ingredientItems.includes(obj)
      );

      if (!clickedIngredient) {
        this.isSwipeScrolling = true;
        this.swipeStartY = pointer.y;
        this.swipeStartScrollY = this.ingredientsContentContainer.y;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isSwipeScrolling || !pointer.isDown) return;

      const deltaY = this.swipeStartY - pointer.y;
      const scrollSpeed = 1;
      let newY = this.swipeStartScrollY - (deltaY * scrollSpeed);

      const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 60 - 12;
      const maxScroll = Math.max(0, this.scrollContentHeight - scrollableAreaHeight);

      newY = Math.max(-maxScroll, newY);
      newY = Math.min(0, newY);

      this.ingredientsContentContainer.y = newY;
      this.updateScrollbar();
    });

    this.input.on('pointerup', () => {
      this.isSwipeScrolling = false;
    });
  }

  private updateScrollbar() {
    this.scrollbar.clear();
    this.scrollbarThumb.clear();

    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 60 - 12;
    const scrollbarWidth = 12;
    const scrollbarX = this.layoutConfig.ingredientsPanelWidth - scrollbarWidth - 12;
    const scrollbarYOffset = 60;

    if (this.scrollContentHeight > scrollableAreaHeight) {
      this.scrollbar.fillStyle(0x4A3428, 0.6);
      this.scrollbar.fillRoundedRect(scrollbarX, scrollbarYOffset, scrollbarWidth, scrollableAreaHeight, 6);
      this.scrollbar.lineStyle(1, 0x8B4513, 0.8);
      this.scrollbar.strokeRoundedRect(scrollbarX, scrollbarYOffset, scrollbarWidth, scrollableAreaHeight, 6);

      const thumbHeight = Math.max(20, (scrollableAreaHeight / this.scrollContentHeight) * scrollableAreaHeight);

      const maxScroll = this.scrollContentHeight - scrollableAreaHeight;
      const scrollPercentage = maxScroll > 0 ? Math.abs(this.ingredientsContentContainer.y) / maxScroll : 0;
      const thumbY = scrollbarYOffset + (scrollableAreaHeight - thumbHeight) * scrollPercentage;

      this.scrollbarThumb.fillStyle(0x8B4513, 0.9);
      this.scrollbarThumb.fillRoundedRect(scrollbarX + 1, thumbY, scrollbarWidth - 2, thumbHeight, 5);
      this.scrollbarThumb.lineStyle(1, 0xFFD700, 0.6);
      this.scrollbarThumb.strokeRoundedRect(scrollbarX + 1, thumbY, scrollbarWidth - 2, thumbHeight, 5);

      this.scrollbarThumb.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(scrollbarX, thumbY, scrollbarWidth, thumbHeight),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains
      });
      this.input.setDraggable(this.scrollbarThumb);

      this.scrollbarThumb.off('dragstart');
      this.scrollbarThumb.off('drag');
      this.scrollbarThumb.off('dragend');

      this.scrollbarThumb.on('dragstart', () => {
        this.isScrollbarDragging = true;
        this.scrollbarDragStartY = thumbY;
        this.contentStartY = this.ingredientsContentContainer.y;
      });

      this.scrollbarThumb.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (this.isScrollbarDragging) {
          const deltaY = dragY - this.scrollbarDragStartY;
          const scrollRatio = deltaY / (scrollableAreaHeight - thumbHeight);
          const newContentY = this.contentStartY - (scrollRatio * maxScroll);

          this.ingredientsContentContainer.y = Phaser.Math.Clamp(newContentY, -maxScroll, 0);
          this.updateScrollbar();
        }
      });

      this.scrollbarThumb.on('dragend', () => {
        this.isScrollbarDragging = false;
      });

    } else {
      this.scrollbar.setVisible(false);
      this.scrollbarThumb.setVisible(false);
      this.scrollbar.disableInteractive();
      this.scrollbarThumb.disableInteractive();
    }
  }

  private showCompletionCelebration() {
    this.time.delayedCall(1000, () => {
      this.cameras.main.flash(500, 255, 215, 0, false);
      this.showCompletionDialog();
    });
  }

  private showCompletionDialog() {
    const dialogWidth = 500;
    const dialogHeight = 200;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x2A1810, 0.95);
    dialogBg.fillRoundedRect(centerX - dialogWidth/2, centerY - dialogHeight/2, dialogWidth, dialogHeight, 25);
    dialogBg.lineStyle(4, 0xFFD700, 1);
    dialogBg.strokeRoundedRect(centerX - dialogWidth/2, centerY - dialogHeight/2, dialogWidth, dialogHeight, 25);
    
    const completionTitle = this.add.text(centerX, centerY - 40, "SELAMAT!", {
      fontSize: '32px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const completionText = this.add.text(centerX, centerY, "Sambal Colo-Colo Berhasil Dibuat!", {
      fontSize: '24px',
      fontFamily: 'Chewy, cursive',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5);
    
    const completionSubtext = this.add.text(centerX, centerY + 35, "Anda telah menyelesaikan semua langkah dengan sempurna!", {
      fontSize: '16px',
      fontFamily: 'Chewy, cursive',
      color: '#CCCCCC',
      align: 'center'
    }).setOrigin(0.5);
    
    const dialogElements = [overlay, dialogBg, completionTitle, completionText, completionSubtext];
    dialogElements.forEach(el => {
      if (el && typeof el.setAlpha === 'function') {
        el.setAlpha(0);
      }
    });

    this.tweens.add({
      targets: dialogElements,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      stagger: 100
    });
  }

  private setupDialogBridge() {
    const checkForBridge = () => {
      if (this.dialogBridge) this.syncDialogWithGameStep();
      else this.time.delayedCall(500, checkForBridge);
    };
    this.time.delayedCall(100, checkForBridge);
  }

  private syncDialogWithGameStep() {
    if (!this.dialogBridge) return;
    const currentDialogStep = this.dialogBridge.getCurrentStep();
    if (this.currentStep !== currentDialogStep) this.dialogBridge.setStep(this.currentStep);
  }
}
