// src/game/scenes/ColoColoScene.ts - Rewritten with a fresh approach
import Phaser from 'phaser';
import ResponsiveGameUtils, { ResponsiveLayout } from "../utils/ResponsiveUtils";

// Define the structure for each step in the cooking process
interface GameStep {
  id: number;
  text: string;
  character: string;
  isCompleted: boolean;
}

export default class ColoColoScene extends Phaser.Scene {
  // Dialog bridge for React integration
  public dialogBridge: any = null;
  private useReactDialog: boolean = true; // Flag to use React dialog instead of Phaser dialog (ALWAYS true now)

  // Responsive system
  private responsiveLayout!: ResponsiveLayout;
  private originalLayoutConfig: any = null;

  // Game state and objects
  private currentStep = 0;
  private subStepCounter = 0;
  private gameState: { telenanState: string; ulekanState: string; };
  private gameObjects: { [key: string]: Phaser.GameObjects.Image } = {};
  private ingredientItems: Phaser.GameObjects.Image[] = [];

  // Interactive states
  private telenanSelected = false;
  private isGrinding = false;
  private grindAccumulator = 0;
  private munthuObject: Phaser.GameObjects.Image | null = null;
  private grindPath: { x: number, y: number }[] = [];
  private grindCenter: { x: number, y: number } | null = null;
  private telenanDraggable = false;
  private telenanOriginalPos: { x: number, y: number } | null = null;
  // Super simple tap-based munthu variables
  private tapGrindingActive = false;
  private tapCount = 0;
  private maxTaps = 8; // Total taps needed
  private currentGrindFrame = 0; // 0 = ulekan, 1 = ulekan1, 2 = ulekan2

  // Interactive kecap pouring variables
  private kecapPouringActive = false;
  private kecapTapCount = 0;
  private maxKecapTaps = 3; // Total taps needed for kecap
  private kecapNearUlekan = false;
  private kecapObject: Phaser.GameObjects.Image | null = null;

  // Interactive nipis (lime) pouring variables
  private nipisPouringActive = false;
  private nipisTapCount = 0;
  private maxNipisTaps = 2; // Total taps needed for nipis
  private nipisObject: Phaser.GameObjects.Image | null = null;
  
  private sliceAccumulator = 0;
  private lastSlicePosition: { x: number, y: number } | null = null;
  private requiredSlices = 0;
  private sliceDirection = 0; // -1 = left, 1 = right, 0 = no direction
  private sliceStrokes = 0;
  private isSlicing = false;
  private cuttingCompleted = false; // Flag to track if current cutting is done

  // UI and layout configuration
  private ingredientsPanel!: Phaser.GameObjects.Container;
  // NOTE: dialogPanel removed - using React dialog system only
  private menuToggleButton!: Phaser.GameObjects.Image;
  // NOTE: characterImage and stepText removed - using React dialog system only
  private isIngredientsPanelOpen = true;
  private panelBg!: Phaser.GameObjects.Graphics;
  private panelTitle!: Phaser.GameObjects.Text;
  private layoutConfig = {
    // Header bar
    headerHeight: 60,
    
    // Ingredients panel
    ingredientsPanelWidth: 375,
    ingredientsPanelX: 0, // Will be calculated
    ingredientsPanelY: 300, // Turun 150px lagi dari 755 ke 905
    ingredientsPanelHeight: 450,
    
    // Cooking area
    cookingAreaLeft: 20,
    cookingAreaTop: 70,
    cookingAreaRight: 290,
    cookingAreaBottom: 180, // Account for dialog panel

    // NOTE: Dialog panel config removed - using React dialog system

    // Character
    characterX: 1000,
    characterY: 500,
  };

  // Definitive game flow
  private readonly gameSteps: GameStep[] = [
    { id: 0, text: "Mari kita mulai! Pertama, letakkan cabai di atas talenan.", character: "karakter1.png", isCompleted: false },
    { id: 1, text: "Ambil pisau lalu gesekkan pada cabai untuk memotongnya.", character: "karakter1.png", isCompleted: false },
    { id: 2, text: "Bagus! Klik talenan berisi cabai, lalu klik mangkok untuk memindahkannya.", character: "karakter2.png", isCompleted: false },
    { id: 3, text: "Sekarang, letakkan bawang putih di talenan yang kosong.", character: "karakter2.png", isCompleted: false },
    { id: 4, text: "Sama seperti cabai, potong bawang putih hingga halus.", character: "karakter2.png", isCompleted: false },
    { id: 5, text: "Kerja bagus! Pindahkan bawang putih ke dalam mangkok.", character: "karakter3.png", isCompleted: false },
    { id: 6, text: "Saatnya menambahkan kecap. Seret dan letakkan kecap ke dalam mangkok.", character: "karakter3.png", isCompleted: false },
    { id: 7, text: "Sekarang, tambahkan daun jeruk untuk memberi aroma segar.", character: "karakter4.png", isCompleted: false },
    { id: 8, text: "Kita perlu talenan lagi. Aku akan siapkan untukmu.", character: "karakter1.png", isCompleted: false },
    { id: 9, text: "Letakkan jeruk nipis di atas talenan yang bersih.", character: "karakter5.png", isCompleted: false },
    { id: 10, text: "Potong jeruk nipis menjadi dua bagian dengan pisau.", character: "karakter5.png", isCompleted: false },
    { id: 11, text: "Pindahkan potongan jeruk nipis ke dalam mangkok.", character: "karakter5.png", isCompleted: false },
    { id: 12, text: "Ambil munthu untuk mengulek semua bahan di dalam mangkok.", character: "karakter1.png", isCompleted: false },
    { id: 13, text: "Hampir selesai! Ambil piring dan sajikan sambalmu.", character: "karakter2.png", isCompleted: false },
    { id: 14, text: "Luar biasa! Sambal Colo-colo khas Maluku buatanmu sudah jadi!", character: "karakter2.png", isCompleted: false },
  ];

  constructor() {
    super('ColoColoScene');
    this.gameState = { telenanState: 'colo_telenan', ulekanState: 'colo_ulekan' };
  }

  preload() {
    this.load.image('background', '/assets/backgrounds/kitchen.png');
    const basePath = '/assets/foods/colo_colo/';
    
    // Load all assets with proper naming
    const assets = [
      { file: 'Cabai.png', key: 'cabai' },
      { file: 'BawangPutih2.png', key: 'bawangputih2' },
      { file: 'DaunJeruk.png', key: 'daunjeruk' },
      { file: 'JerukNipis.png', key: 'jeruknipis' },
      { file: 'Kecap.png', key: 'kecap' },
      { file: 'Munthu.png', key: 'munthu' },
      { file: 'Pisau.png', key: 'pisau' },
      { file: 'PiringColoColo.png', key: 'piringcolocolo' }, // Fixed key name
      { file: 'telenan.png', key: 'telenan' },
      { file: 'Ulekan.png', key: 'ulekan' },
      { file: 'ColoColo.png', key: 'colocolo' }
    ];
    assets.forEach(asset => {
      this.load.image(`colo_${asset.key}`, `${basePath}${asset.file}`);
    });

    // Add error handling for missing images
    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load: ${file.src}`);
    });

    // Load animation frames
    for (let i = 0; i <= 4; i++) this.load.image(`telenan_chili_${i}`, `${basePath}step-1/TelenanCabaiPotong${i === 0 ? '' : i}.png`);
    this.load.image('telenan_garlic_0', `${basePath}step-2/TelenanBawangPutih.png`);
    for (let i = 1; i <= 6; i++) this.load.image(`telenan_garlic_${i}`, `${basePath}step-2/TelenanBawangPutih${i}.png`);
    this.load.image('ulekan_chili', `${basePath}step-3/UlekanKecap4.png`);
    this.load.image('ulekan_chili_garlic', `${basePath}step-3/UlekanKecap5.png`);
    this.load.image('ulekan_chili_garlic_kecap_0', `${basePath}step-3/UlekanKecap.png`);
    this.load.image('ulekan_chili_garlic_kecap_1', `${basePath}step-3/UlekanKecap1.png`);
    this.load.image('ulekan_chili_garlic_kecap_2', `${basePath}step-3/UlekanKecap3.png`);
    for (let i = 6; i <= 11; i++) this.load.image(`ulekan_daun_${i-6}`, `${basePath}step-5/UlekanKecap${i}.png`);
    this.load.image('telenan_lime_0', `${basePath}step-4/TelenanNipis.png`);
    this.load.image('telenan_lime_1', `${basePath}step-4/TelenanNipis1.png`);
    this.load.image('telenan_lime_2', `${basePath}step-4/TelenanNipis2.png`);
    this.load.image('ulekan_lime_0', `${basePath}step-4/UlekanNipis.png`);
    this.load.image('ulekan_lime_1', `${basePath}step-4/UlekanNipis1.png`);
    this.load.image('ulekan_grind_0', `${basePath}step-6/Ulekan.png`);
    this.load.image('ulekan_grind_1', `${basePath}step-6/Ulekan1.png`);
    this.load.image('ulekan_grind_2', `${basePath}step-6/Ulekan2.png`);
    
    // UI Elements from KohuKohu
    this.load.image("menu_normal", "/assets/ui/buttons/menu/menu_normal.png");
    this.load.image("menu_hover", "/assets/ui/buttons/menu/menu_hover.png");
    this.load.image("menu_active", "/assets/ui/buttons/menu/menu_active.png");
    this.load.image("hint_normal", "/assets/ui/buttons/hint/hint_normal.png");
    this.load.image("hint_hover", "/assets/ui/buttons/hint/hint_hover.png");
    this.load.image("hint_active", "/assets/ui/buttons/hint/hint_active.png");

    // Characters
    for (let i = 1; i <= 5; i++) this.load.image(`karakter${i}`, `/assets/karakter/karakter${i}.png`);
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0);

    this.calculateLayout();
    this.createCookingArea();
    this.createIngredientsPanel();
    // NOTE: Phaser dialog removed completely - using React dialog system only
    this.updateIngredientsPanelVisuals();
    this.setupIngredientsPanelLayout(undefined, undefined, undefined, 1500, this.layoutConfig.ingredientsPanelY);
    this.setupInputHandlers();
    // NOTE: updateStepDisplay removed - using React dialog system only

    // Setup dialog bridge integration
    this.setupDialogBridge();
  }

  private calculateLayout() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Calculate ingredients panel position
    this.layoutConfig.ingredientsPanelX = gameWidth - this.layoutConfig.ingredientsPanelWidth - 15;
    
    // Update cooking area bounds
    this.layoutConfig.cookingAreaRight = gameWidth - this.layoutConfig.ingredientsPanelWidth - 40;
    this.layoutConfig.cookingAreaBottom = gameHeight - this.layoutConfig.dialogPanelHeight - 40;
  }

  private setupIngredientsPanelLayout(hAlign?: string, vAlign?: string, padding?: number, x?: number, y?: number) {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    const panelWidth = this.layoutConfig.ingredientsPanelWidth;
    const panelHeight = this.layoutConfig.ingredientsPanelHeight;

    let targetX, targetY;

    if (x !== undefined && y !== undefined) {
      targetX = x;
      targetY = y;
    } else {
      // Horizontal alignment
      switch (hAlign) {
        case 'left':
          targetX = padding || 0;
          break;
        case 'center':
          targetX = (gameWidth - panelWidth) / 2;
          break;
        default: // right
          targetX = gameWidth - panelWidth - (padding || 0);
          break;
      }

      // Vertical alignment
      switch (vAlign) {
        case 'top':
          targetY = padding || 0;
          break;
        case 'middle':
          targetY = (gameHeight - panelHeight) / 2;
          break;
        default: // bottom
          targetY = gameHeight - panelHeight - (padding || 0);
          break;
      }
    }

    this.ingredientsPanel.setPosition(targetX, targetY);
  }

  // Centralized input handling
  private setupInputHandlers() {
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      // EXACT COPY of KohuKohuScene - NO bringToTop here
      // Store original position
      gameObject.setData('dragStartX', gameObject.x);
      gameObject.setData('dragStartY', gameObject.y);

      // Store original scale if not already set
      if (!gameObject.getData('originalScale')) {
        gameObject.setData('originalScale', gameObject.scale);
      }

      // Initialize interaction states
      this.lastSlicePosition = { x: pointer.x, y: pointer.y };
      this.sliceAccumulator = 0;

      // Special handling for talenan dragging
      if (gameObject.name === 'telenan' && this.telenanDraggable) {
        console.log('ColoColo: Posisikan talenan di atas ulekan dan lepaskan!');
      }

      // Special handling for kecap with tilt preview
      if (gameObject.name === 'ingredient_kecap' && this.currentStep === 6) {
        console.log('ColoColo: Seret kecap ke atas ulekan untuk menuangkannya!');
      }
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      // EXACT COPY of KohuKohuScene approach
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.setTint(0xFFFFAA); // Use same tint as KohuKohuScene

      // Visual feedback for telenan when dragging
      if (gameObject.name === 'telenan' && this.telenanDraggable) {
        this.handleTelenanDragFeedback(gameObject, dragX, dragY);
      }

      // Visual feedback for kecap when near ulekan
      if (gameObject.name === 'ingredient_kecap' && this.currentStep === 6) {
        this.handleKecapTilt(gameObject, dragX, dragY);
      }

      // Handle real-time interactions during drag
      this.handleSlicing(pointer, gameObject);
      // Note: Tap grinding is handled separately via pointerdown
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
      // Don't clear tint for tap objects
      if (!(this.tapGrindingActive && gameObject === this.munthuObject) &&
          !(this.kecapPouringActive && gameObject === this.kecapObject) &&
          !this.nipisPouringActive) {
        gameObject.clearTint();
      }

      this.lastSlicePosition = null;

      // TAP MUNTHU: No special handling needed since it's not draggable
      if (this.tapGrindingActive && gameObject === this.munthuObject) {
        return; // Munthu is not draggable in tap mode
      }

      // TAP KECAP: No special handling needed since it's not draggable in pour mode
      if (this.kecapPouringActive && gameObject === this.kecapObject) {
        return; // Kecap is not draggable in tap pour mode
      }

      // TAP NIPIS: No special handling during pouring mode
      if (this.nipisPouringActive) {
        return; // Nothing is draggable during nipis tap mode
      }

      if (!dropped) {
        // Restore original scale based on object type
        let originalScale = gameObject.getData('originalScale') || 0.25;

        gameObject.setScale(originalScale);

        this.tweens.add({
          targets: gameObject,
          x: gameObject.getData('dragStartX'),
          y: gameObject.getData('dragStartY'),
          duration: 400,
          ease: 'Back.easeOut'
        });
      }

      // Special handling for talenan with improved detection
      if (gameObject.name === 'telenan' && this.telenanDraggable) {
        // Always try to pour regardless of 'dropped' state for better UX
        this.handleTelenanPour();
        return;
      }

      // If not dropped on a valid zone, or if it's the knife, reset position
      if (!dropped || gameObject.name === 'ingredient_pisau') {
        // Reset any visual effects for kecap
        if (gameObject.name === 'ingredient_kecap') {
          gameObject.setRotation(0);
          gameObject.clearTint();
        }
        this.resetIngredientPosition(gameObject);
      }
    });

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Image) => {
      // Special handling for talenan pouring
      if (gameObject.name === 'telenan' && this.telenanDraggable && dropZone.name === 'ulekan') {
        this.handleTelenanPour();
        return;
      }

      this.handleDrop(gameObject, dropZone);
    });

    // Click handlers for transferring ingredients
    this.gameObjects.telenan.on('pointerdown', () => this.handleTelenanClick());
    this.gameObjects.ulekan.on('pointerdown', () => this.handleUlekanClick());

    // Add global tap handler for grinding, kecap, and nipis pouring
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.tapGrindingActive) {
        this.handleTapGrinding();
      } else if (this.kecapPouringActive) {
        this.handleKecapTapPouring(pointer);
      } else if (this.nipisPouringActive) {
        this.handleNipisTapPouring(pointer);
      }
    });
  }

  // Main drop logic - rewritten for clarity
  private handleDrop(ingredientObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Image) {
    const ingredient = ingredientObject.name;
    const target = dropZone.name;

    // *** INTERACTIVE KECAP POURING SYSTEM ***
    // When kecap is dropped on ulekan, enable tap pouring mode
    if (this.currentStep === 6 && ingredient === 'ingredient_kecap' && target === 'ulekan') {
      // Position kecap near ulekan for pouring
      ingredientObject.x = dropZone.x - 50;
      ingredientObject.y = dropZone.y - 50;

      // Set up tap pouring mode
      this.kecapPouringActive = true;
      this.kecapTapCount = 0;
      this.kecapObject = ingredientObject;
      this.kecapNearUlekan = true;

      // Make kecap non-draggable but interactive for tapping
      this.input.setDraggable(ingredientObject, false);
      ingredientObject.setInteractive(true);
      ingredientObject.setTint(0xFFDD44); // Golden tint to show it's ready

      this.hideIngredientFromPanel(ingredient);
      console.log(`ColoColo: Tap kecap ${this.maxKecapTaps} kali untuk menuangkannya! (${this.kecapTapCount}/${this.maxKecapTaps})`);
      return;
    }

    // *** SUPER SIMPLE TAP APPROACH ***
    // Just position munthu and enable tap mode
    if (this.currentStep === 12 && ingredient === 'ingredient_munthu' && target === 'ulekan') {
      // Position munthu in ulekan
      ingredientObject.x = dropZone.x;
      ingredientObject.y = dropZone.y - 30;

      // Remove draggable, make it static
      this.input.setDraggable(ingredientObject, false);
      ingredientObject.setInteractive(true);
      ingredientObject.setTint(0xFFDD44); // Golden tint

      // Set up tap grinding
      this.tapGrindingActive = true;
      this.tapCount = 0;
      this.currentGrindFrame = 0;
      this.munthuObject = ingredientObject;

      this.hideIngredientFromPanel(ingredient);
      console.log(`ColoColo: Tap layar ${this.maxTaps} kali untuk mengulek bumbu! (${this.tapCount}/${this.maxTaps})`);
      return;
    }

    let correctDrop = false;
    let manualNextStep = false;

    // Standard drop logic for all other steps
    switch (this.currentStep) {
      case 0: // Drop Chili
        if (ingredient === 'ingredient_cabai' && target === 'telenan') {
          this.transformTelenan('telenan_chili_0');
          correctDrop = true;
        }
        break;
      case 3: // Drop Garlic
        if (ingredient === 'ingredient_bawang_putih' && target === 'telenan') {
          this.transformTelenan('telenan_garlic_0');
          correctDrop = true;
        }
        break;
      case 6: // Add Kecap with enhanced pouring animation
        if (ingredient === 'ingredient_kecap' && target === 'ulekan') {
          this.performKecapPouring(ingredientObject, () => {
            this.playAnimation(['ulekan_chili_garlic_kecap_0', 'ulekan_chili_garlic_kecap_1', 'ulekan_chili_garlic_kecap_2'], 'ulekan', 300, () => this.nextStep());
          });
          correctDrop = true; manualNextStep = true;
        }
        break;
      case 7: // Add Daun Jeruk
        if (ingredient === 'ingredient_daun_jeruk' && target === 'ulekan') {
          const frames = Array.from({length: 6}, (_, i) => `ulekan_daun_${i}`);
          this.playAnimation(frames, 'ulekan', 200, () => this.nextStep());
          correctDrop = true; manualNextStep = true;
        }
        break;
      case 9: // Drop Lime
        if (ingredient === 'ingredient_jeruk_nipis' && target === 'telenan') {
          this.transformTelenan('telenan_lime_0');
          correctDrop = true;
        }
        break;
      case 13: // Serve
        if (ingredient === 'ingredient_piring' && target === 'ulekan') {
          this.gameObjects.ulekan.setVisible(false);
          this.add.image(this.gameObjects.ulekan.x, this.gameObjects.ulekan.y, 'colo_colocolo').setScale(0.6);
          correctDrop = true;
        }
        break;
    }

    // If the drop was correct for any non-grinding step, destroy the ingredient
    if (correctDrop) {
      this.hideIngredientFromPanel(ingredient);
      ingredientObject.destroy();
      if (!manualNextStep) {
        this.nextStep();
      }
    } else {
      // Incorrect drop, reset position
      this.resetIngredientPosition(ingredientObject);
    }
  }

  // Enhanced slicing mechanic with left-right gestures
  private handleSlicing(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) {
    if (gameObject.name !== 'ingredient_pisau' || !this.lastSlicePosition) return;

    // Don't allow slicing if telenan is draggable (transfer mode) or cutting is already completed
    if (this.telenanDraggable || this.cuttingCompleted) return;

    const telenanBounds = this.gameObjects.telenan.getBounds();
    if (!this.gameObjects.telenan.visible || !Phaser.Geom.Rectangle.Contains(telenanBounds, pointer.x, pointer.y)) return;

    const isCuttingStep = (this.currentStep === 1 && this.gameState.telenanState.startsWith('telenan_chili')) ||
                          (this.currentStep === 4 && this.gameState.telenanState.startsWith('telenan_garlic')) ||
                          (this.currentStep === 10 && this.gameState.telenanState.startsWith('telenan_lime'));
    if (!isCuttingStep) return;

    const deltaX = pointer.x - this.lastSlicePosition.x;
    const deltaY = pointer.y - this.lastSlicePosition.y;
    const horizontalMovement = Math.abs(deltaX);
    const verticalMovement = Math.abs(deltaY);

    // Only count horizontal movement (slicing motion)
    if (horizontalMovement > verticalMovement && horizontalMovement > 5) {
      const currentDirection = deltaX > 0 ? 1 : -1;

      // Detect direction change (completing a slice stroke)
      if (this.sliceDirection !== 0 && this.sliceDirection !== currentDirection) {
        this.sliceStrokes++;
        this.sliceDirection = currentDirection;

        // Add visual feedback for each stroke
        gameObject.setTint(0x00ff00);
        this.time.delayedCall(100, () => gameObject.clearTint());

        // Progress cutting animation every 2-3 strokes
        const STROKES_PER_FRAME = this.currentStep === 10 ? 2 : 3; // Lime needs fewer strokes

        if (this.sliceStrokes >= STROKES_PER_FRAME) {
          this.sliceStrokes = 0;
          this.subStepCounter++;

          let cuttingComplete = false;
          if (this.currentStep === 1) { // Chili
            const max = 4;
            this.transformTelenan(`telenan_chili_${Math.min(this.subStepCounter, max)}`);
            if (this.subStepCounter >= max) cuttingComplete = true;
          } else if (this.currentStep === 4) { // Garlic
            const max = 6;
            this.transformTelenan(`telenan_garlic_${Math.min(this.subStepCounter, max)}`);
            if (this.subStepCounter >= max) cuttingComplete = true;
          } else if (this.currentStep === 10) { // Lime
            const max = 2;
            this.transformTelenan(`telenan_lime_${Math.min(this.subStepCounter, max)}`);
            if (this.subStepCounter >= max) cuttingComplete = true;
          }

          if (cuttingComplete) {
            this.cuttingCompleted = true; // Mark cutting as completed
            console.log('ColoColo: Bagus! Selesai memotong!');
            this.time.delayedCall(1000, () => this.nextStep());
          }
        }
      } else {
        this.sliceDirection = currentDirection;
      }
    }

    this.lastSlicePosition = { x: pointer.x, y: pointer.y };
  }

  // ULTRA SIMPLE: Just tap anywhere to grind
  private handleTapGrinding() {
    if (!this.tapGrindingActive) return;

    this.tapCount++;

    // Animate munthu slightly
    if (this.munthuObject) {
      this.munthuObject.angle += (Math.random() - 0.5) * 20;
      this.tweens.add({
        targets: this.munthuObject,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
    }

    // Cycle through grinding animations: ulekan -> ulekan1 -> ulekan -> ulekan1 -> ulekan2
    if (this.tapCount === 2) {
      this.transformUlekan('ulekan_grind_1');
      this.currentGrindFrame = 1;
    } else if (this.tapCount === 4) {
      this.transformUlekan('ulekan_grind_0');
      this.currentGrindFrame = 0;
    } else if (this.tapCount === 6) {
      this.transformUlekan('ulekan_grind_1');
      this.currentGrindFrame = 1;
    } else if (this.tapCount === 8) {
      this.transformUlekan('ulekan_grind_2');
      this.currentGrindFrame = 2;
      this.completeTapGrinding();
      return;
    }

    // Update progress text
    console.log(`ColoColo: Tap layar untuk mengulek! (${this.tapCount}/${this.maxTaps})`);
  }

  // Complete tap grinding
  private completeTapGrinding() {
    this.tapGrindingActive = false;

    // Simple fade out
    if (this.munthuObject) {
      this.tweens.add({
        targets: this.munthuObject,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.munthuObject?.destroy();
          this.munthuObject = null;
        }
      });
    }

    console.log('ColoColo: Sempurna! Bumbu sudah halus!');
    this.time.delayedCall(1500, () => this.nextStep());
  }

  // Handle kecap tap pouring
  private handleKecapTapPouring(pointer: Phaser.Input.Pointer) {
    if (!this.kecapPouringActive || !this.kecapObject) return;

    // Check if tap is near kecap or ulekan area
    const kecapBounds = this.kecapObject.getBounds();
    const ulekanBounds = this.gameObjects.ulekan.getBounds();
    const tapNearKecap = Phaser.Geom.Rectangle.Contains(kecapBounds, pointer.x, pointer.y);
    const tapNearUlekan = Phaser.Geom.Rectangle.Contains(ulekanBounds, pointer.x, pointer.y);

    if (tapNearKecap || tapNearUlekan) {
      this.kecapTapCount++;

      // Animate kecap tilting for pouring effect
      this.tweens.add({
        targets: this.kecapObject,
        angle: 45,
        duration: 200,
        ease: 'Power2',
        yoyo: true,
        onComplete: () => {
          this.kecapObject!.angle = 0;
        }
      });

      // Progress through kecap pouring stages
      if (this.kecapTapCount === 1) {
        // First tap: Show kecap tuang animation
        this.transformUlekan('ulekan_chili_garlic_kecap_0');
        console.log(`ColoColo: Bagus! Tap lagi untuk menuangkan lebih banyak! (${this.kecapTapCount}/${this.maxKecapTaps})`);
      } else if (this.kecapTapCount === 2) {
        // Second tap: More kecap poured
        this.transformUlekan('ulekan_chili_garlic_kecap_1');
        console.log(`ColoColo: Sip! Satu kali lagi untuk menyelesaikan! (${this.kecapTapCount}/${this.maxKecapTaps})`);
      } else if (this.kecapTapCount === 3) {
        // Third tap: Complete kecap pouring
        this.transformUlekan('ulekan_chili_garlic_kecap_2');
        this.completeKecapPouring();
      }
    }
  }

  // Complete kecap pouring
  private completeKecapPouring() {
    this.kecapPouringActive = false;
    this.kecapNearUlekan = false;

    // Animate kecap disappearing
    if (this.kecapObject) {
      this.tweens.add({
        targets: this.kecapObject,
        alpha: 0,
        scale: 0.1,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.kecapObject?.destroy();
          this.kecapObject = null;
        }
      });
    }

    console.log('ColoColo: Sempurna! Kecap berhasil ditambahkan!');
    this.time.delayedCall(1000, () => this.nextStep());
  }

  // Handle nipis tap pouring
  private handleNipisTapPouring(pointer: Phaser.Input.Pointer) {
    if (!this.nipisPouringActive) return;

    // Accept tap anywhere on screen for nipis
    this.nipisTapCount++;

    // Visual feedback - brief flash effect
    this.cameras.main.flash(100, 255, 255, 0, false);

    // Progress through nipis pouring stages
    if (this.nipisTapCount === 1) {
      // First tap: Squeeze lime - show ulekannipis1
      this.transformUlekan('ulekan_lime_1');
      console.log(`ColoColo: Bagus! Peras sekali lagi! (${this.nipisTapCount}/${this.maxNipisTaps})`);
    } else if (this.nipisTapCount === 2) {
      // Second tap: Complete squeezing - back to state with all ingredients combined
      // After nipis is squeezed, should show ulekan with all ingredients ready for grinding
      const frames = Array.from({length: 6}, (_, i) => `ulekan_daun_${i}`);
      if (this.textures.exists('ulekan_daun_5')) {
        this.transformUlekan('ulekan_daun_5'); // Final state with all ingredients
      } else {
        this.transformUlekan('ulekan_lime_1'); // Fallback to lime state
      }
      this.completeNipisPouring();
    }
  }

  // Complete nipis pouring
  private completeNipisPouring() {
    this.nipisPouringActive = false;

    // Hide telenan since nipis is now squeezed
    this.gameObjects.telenan.setVisible(false).setActive(false);

    console.log('ColoColo: Sempurna! Jeruk nipis berhasil diperas!');
    this.time.delayedCall(1000, () => this.nextStep());
  }

  // Detect if the grinding motion is circular
  private detectCircularMotion(): boolean {
    if (this.grindPath.length < 8 || !this.grindCenter) return false;

    let angleChanges = 0;
    let totalAngleChange = 0;

    for (let i = 1; i < this.grindPath.length - 1; i++) {
      const prev = this.grindPath[i - 1];
      const curr = this.grindPath[i];
      const next = this.grindPath[i + 1];

      const angle1 = Phaser.Math.Angle.Between(this.grindCenter.x, this.grindCenter.y, prev.x, prev.y);
      const angle2 = Phaser.Math.Angle.Between(this.grindCenter.x, this.grindCenter.y, curr.x, curr.y);
      const angle3 = Phaser.Math.Angle.Between(this.grindCenter.x, this.grindCenter.y, next.x, next.y);

      const angleChange1 = Phaser.Math.Angle.ShortestBetween(angle1, angle2);
      const angleChange2 = Phaser.Math.Angle.ShortestBetween(angle2, angle3);

      // Check if angles are consistently changing in the same direction
      if (Math.sign(angleChange1) === Math.sign(angleChange2)) {
        angleChanges++;
        totalAngleChange += Math.abs(angleChange1);
      }
    }

    // Consider it circular if most angle changes are consistent and cover significant arc
    return angleChanges >= 4 && totalAngleChange > Math.PI / 2;
  }

  // Enhanced click handlers for transferring with draggable talenan
  private handleTelenanClick() {
    // Prevent accidental clicks during slicing
    if (this.isSlicing) return;

    const canSelect = (this.currentStep === 2 && this.gameState.telenanState === 'telenan_chili_4') ||
                      (this.currentStep === 5 && this.gameState.telenanState === 'telenan_garlic_6') ||
                      (this.currentStep === 11 && this.gameState.telenanState === 'telenan_lime_2');
    if (canSelect) {
      this.makeTelenanDraggable();
    }
  }

  // Make talenan draggable for pouring with enhanced feedback
  private makeTelenanDraggable() {
    if (!this.telenanOriginalPos) {
      this.telenanOriginalPos = { x: this.gameObjects.telenan.x, y: this.gameObjects.telenan.y };
    }

    this.telenanDraggable = true;
    this.gameObjects.telenan.setTint(0x00ff00);
    this.input.setDraggable(this.gameObjects.telenan);
    this.children.bringToTop(this.gameObjects.telenan); // Bring to front

    // Add pulsing animation to make it more obvious
    this.tweens.add({
      targets: this.gameObjects.telenan,
      scaleX: 0.65,
      scaleY: 0.65,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log('ColoColo: Seret talenan ke area ulekan untuk menuangkan isinya!');
  }

  private handleUlekanClick() {
    if (!this.telenanSelected) return;

    let transferred = false;
    if (this.currentStep === 2) {
      this.transformUlekan('ulekan_chili');
      this.transformTelenan('colo_telenan');
      transferred = true;
    } else if (this.currentStep === 5) {
      this.transformUlekan('ulekan_chili_garlic');
      this.gameObjects.telenan.setVisible(false).setActive(false);
      transferred = true;
    } else if (this.currentStep === 11) {
      this.transformUlekan('ulekan_lime_0');
      this.time.delayedCall(500, () => this.transformUlekan('ulekan_lime_1'));
      this.gameObjects.telenan.setVisible(false).setActive(false);
      transferred = true;
    }

    if (transferred) {
      this.telenanSelected = false;
      this.gameObjects.telenan.clearTint();
      this.nextStep();
    }
  }

  // --- HELPER AND UI FUNCTIONS ---

  private nextStep() {
    if (this.currentStep >= this.gameSteps.length - 1) return;

    this.gameSteps[this.currentStep].isCompleted = true;
    this.currentStep++;
    this.subStepCounter = 0;
    this.cuttingCompleted = false; // Reset cutting completed flag for new step

    // NOTE: updateStepDisplay removed - using React dialog system only

    // Update React dialog system if bridge is available
    if (this.dialogBridge) {
      console.log(`🚀 ColoColo: Game advancing to step ${this.currentStep + 1}`);
      console.log(`🎯 ColoColo: Updating dialog to step index ${this.currentStep}`);

      try {
        this.dialogBridge.setStep(this.currentStep);
        console.log('✅ ColoColo: Dialog update successful');

        // Verify the update
        const verifyStep = this.dialogBridge.getCurrentStep();
        console.log(`🔍 ColoColo: Verification - dialog is now at step ${verifyStep}`);
      } catch (error) {
        console.error('❌ ColoColo: Dialog update failed:', error);
      }
    } else {
      console.warn('⚠️ ColoColo: Dialog bridge not available for step update');
    }

    this.showSuccessFeedback();

    if (this.currentStep === 8) { // Special step to bring back telenan
      this.time.delayedCall(1000, () => {
        const { width, height } = this.cameras.main;
        const cookingAreaCenterX = (width - this.layoutConfig.ingredientsPanelWidth) / 2;
        const cookingAreaCenterY = height / 2;

        this.transformTelenan('colo_telenan');
        this.gameObjects.telenan.setPosition(cookingAreaCenterX - 200, cookingAreaCenterY);
        this.gameObjects.telenan.setAngle(0); // Explicitly set angle to 0
        this.gameObjects.telenan.setVisible(true).setActive(true);
        this.children.bringToTop(this.gameObjects.telenan); // Bring to front
        this.nextStep();
      });
      return; // prevent fall-through
    }

    if (this.currentStep === this.gameSteps.length - 1) { // Last step
        this.showCompletionCelebration();
    }
  }

  // NOTE: updateStepDisplay removed - using React dialog system only

  // NOTE: updateStepText removed - using React dialog system only

  private transformTelenan(newState: string) { this.gameState.telenanState = newState; this.gameObjects.telenan.setTexture(newState); }
  private transformUlekan(newState: string) { 
    this.gameState.ulekanState = newState; 
    
    const ulekan = this.gameObjects.ulekan;
    const targetWidth = ulekan.getData('targetWidth');

    ulekan.setTexture(newState);
    
    if (!targetWidth) {
      console.warn('targetWidth not set on ulekan, size may be inconsistent.');
      return;
    }

    const newTexture = this.textures.get(newState);
    if (!newTexture || !newTexture.source || !newTexture.source[0]) return;

    const newBaseWidth = newTexture.source[0].width;

    if (newBaseWidth > 0) {
      const newScale = targetWidth / newBaseWidth;
      ulekan.setScale(newScale);
    }
  }
  
  private playAnimation(frames: string[], target: 'ulekan' | 'telenan', frameRate: number, onComplete: () => void) {
    let frameIndex = 0;
    const animEvent = this.time.addEvent({
      delay: frameRate,
      callback: () => {
        const frame = frames[frameIndex];
        if (target === 'ulekan') this.transformUlekan(frame);
        else this.transformTelenan(frame);
        frameIndex++;
      },
      repeat: frames.length - 1,
    });
    this.time.delayedCall(frames.length * frameRate, () => {
      animEvent.destroy();
      onComplete();
    });
  }

  private hideIngredientFromPanel(ingredientName: string) {
    const item = this.ingredientItems.find(i => i.name === ingredientName);
    if (item) item.setVisible(false).setActive(false);
  }

  private resetIngredientPosition(gameObject: Phaser.GameObjects.Image) {
    this.tweens.add({
      targets: gameObject,
      x: gameObject.getData('dragStartX'),
      y: gameObject.getData('dragStartY'),
      duration: 300,
      ease: 'Power2'
    });
  }

  // Reset talenan to original position and clear effects
  private resetTelenanPosition() {
    if (!this.telenanOriginalPos) return;

    // Stop any existing tweens on telenan
    this.tweens.killTweensOf(this.gameObjects.telenan);

    this.tweens.add({
      targets: this.gameObjects.telenan,
      x: this.telenanOriginalPos.x,
      y: this.telenanOriginalPos.y,
      angle: 0,
      scaleX: 0.6,
      scaleY: 0.6,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.gameObjects.telenan.clearTint();
      }
    });
  }

  // Enhanced talenan pouring with better detection
  private handleTelenanPour() {
    if (!this.telenanDraggable || !this.telenanOriginalPos) return;

    // Check if telenan is near ulekan for pouring
    const distance = Phaser.Math.Distance.Between(
      this.gameObjects.telenan.x, this.gameObjects.telenan.y,
      this.gameObjects.ulekan.x, this.gameObjects.ulekan.y
    );

    // More generous distance threshold for easier interaction
    if (distance > 200) {
      console.log('ColoColo: Seret talenan lebih dekat ke ulekan!');
      this.resetTelenanPosition();
      return;
    }

    // Tilt animation to simulate pouring
    this.tweens.add({
      targets: this.gameObjects.telenan,
      angle: -30,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Transfer logic based on current step
        let transferred = false;

        if (this.currentStep === 2) {
          this.transformUlekan('ulekan_chili');
          this.transformTelenan('colo_telenan');
          transferred = true;
        } else if (this.currentStep === 5) {
          this.transformUlekan('ulekan_chili_garlic');
          this.gameObjects.telenan.setVisible(false).setActive(false);
          transferred = true;
        } else if (this.currentStep === 11) {
          this.transformUlekan('ulekan_lime_0');
          this.time.delayedCall(500, () => this.transformUlekan('ulekan_lime_1'));
          this.gameObjects.telenan.setVisible(false).setActive(false);
          transferred = true;
        }

        if (transferred) {
          this.telenanDraggable = false;
          this.input.setDraggable(this.gameObjects.telenan, false);

          // Stop pulsing animation
          this.tweens.killTweensOf(this.gameObjects.telenan);

          // Special handling for nipis (step 11) - enable tap pouring
          if (this.currentStep === 11) {
            this.transformUlekan('ulekan_lime_0');
            this.nipisPouringActive = true;
            this.nipisTapCount = 0;
            console.log(`ColoColo: Tap layar ${this.maxNipisTaps} kali untuk memeras jeruk nipis! (${this.nipisTapCount}/${this.maxNipisTaps})`);
            // Don't advance step yet, wait for tapping to complete
            return;
          }

          // Return to original position if still visible
          if (this.gameObjects.telenan.visible) {
            this.resetTelenanPosition();
          }

          console.log('ColoColo: Bagus! Bahan berhasil dipindahkan!');
          this.time.delayedCall(1000, () => this.nextStep());
        } else {
          this.resetTelenanPosition();
        }
      }
    });
  }

  // Handle kecap tilt visual feedback
  private handleKecapTilt(kecapObject: Phaser.GameObjects.Image, dragX: number, dragY: number) {
    const ulekanBounds = this.gameObjects.ulekan.getBounds();
    const distanceToUlekan = Phaser.Math.Distance.Between(
      dragX, dragY,
      this.gameObjects.ulekan.x, this.gameObjects.ulekan.y
    );

    // Tilt kecap when getting close to ulekan
    if (distanceToUlekan < 150) {
      const tiltAmount = Math.max(0, (150 - distanceToUlekan) / 150);
      const tiltAngle = tiltAmount * 25; // Max 25 degrees tilt

      kecapObject.setRotation(Phaser.Math.DegToRad(tiltAngle));
      kecapObject.setTint(0xFFFFAA); // Slight yellow tint to show readiness

      // Show pour-ready indicator
      if (distanceToUlekan < 80) {
        console.log('ColoColo: Lepaskan untuk menuangkan kecap!');
      }
    } else {
      kecapObject.setRotation(0);
      kecapObject.clearTint();
    }
  }

  // Visual feedback for telenan dragging
  private handleTelenanDragFeedback(telenanObject: Phaser.GameObjects.Image, dragX: number, dragY: number) {
    const distance = Phaser.Math.Distance.Between(
      dragX, dragY,
      this.gameObjects.ulekan.x, this.gameObjects.ulekan.y
    );

    // Provide visual feedback based on distance to ulekan
    if (distance < 200) {
      telenanObject.setTint(0x00AA00); // Green when close enough
      console.log('ColoColo: Lepaskan untuk menuangkan!');
    } else if (distance < 300) {
      telenanObject.setTint(0xFFFF00); // Yellow when getting close
      console.log('ColoColo: Seret lebih dekat ke ulekan!');
    } else {
      telenanObject.setTint(0x00ff00); // Light green when far
    }
  }

  // Enhanced kecap pouring animation
  private performKecapPouring(kecapObject: Phaser.GameObjects.Image, onComplete: () => void) {
    // Dramatic tilt for pouring effect
    this.tweens.add({
      targets: kecapObject,
      angle: 45,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Hold the pour position briefly
        this.time.delayedCall(500, () => {
          // Return to normal position
          this.tweens.add({
            targets: kecapObject,
            angle: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
              console.log('ColoColo: Kecap berhasil ditambahkan!');
              onComplete();
            }
          });
        });
      }
    });
  }

  private showSuccessFeedback() { this.cameras.main.flash(100, 144, 238, 144); }

  // --- INITIAL SETUP FUNCTIONS ---

  private createCookingArea() {
    const { width, height } = this.cameras.main;
    const cookingAreaCenterX = (width - this.layoutConfig.ingredientsPanelWidth) / 2;
    const cookingAreaCenterY = height - 280; // 280px dari dasar halaman

    // NO setDepth like KohuKohuScene - let Phaser handle naturally
    this.gameObjects.telenan = this.add.image(cookingAreaCenterX - 200, cookingAreaCenterY, 'colo_telenan')
      .setInteractive({ dropZone: true })
      .setName('telenan')
      .setScale(0.6);

    this.gameObjects.ulekan = this.add.image(cookingAreaCenterX + 200, cookingAreaCenterY, 'colo_ulekan')
      .setInteractive({ dropZone: true })
      .setName('ulekan')
      .setScale(0.5);
      
    // Store original width to maintain consistent size
    this.gameObjects.ulekan.setData('targetWidth', this.gameObjects.ulekan.displayWidth);
  }

  private createIngredientsPanel() {
    // Create ingredients panel container
    this.ingredientsPanel = this.add.container(
      this.layoutConfig.ingredientsPanelX,
      this.layoutConfig.ingredientsPanelY
    );

    // Panel background
    this.panelBg = this.add.graphics();
    this.ingredientsPanel.add(this.panelBg);

    // Panel title
    this.panelTitle = this.add.text(0, 0, "", {});
    this.ingredientsPanel.add(this.panelTitle);

    // Menu toggle button
    this.menuToggleButton = this.add.image(0, 0, "menu_normal");
    this.ingredientsPanel.add(this.menuToggleButton);

    this.createIngredients();
  }

  private createIngredients() {
    // Destroy existing ingredient items to prevent duplicates
    this.ingredientItems.forEach(item => item.destroy());
    this.ingredientItems = [];

    const ingredients = [
        { key: "cabai", name: "Cabai", scale: 0.25 }, 
        { key: "bawangputih2", name: "Bawang", scale: 0.25 }, 
        { key: "daunjeruk", name: "Daun Jeruk", scale: 0.25 },
        { key: "jeruknipis", name: "Jeruk Nipis", scale: 0.25 }, 
        { key: "kecap", name: "Kecap", scale: 0.25 }, 
        { key: "munthu", name: "Munthu", scale: 0.25 },
        { key: "pisau", name: "Pisau", scale: 0.25 }, 
        { key: "piringcolocolo", name: "Piring", scale: 0.25 }
    ];

    // Manual grid layout
    const panelWidth = this.layoutConfig.ingredientsPanelWidth;
    const startX = panelWidth / 4;
    const startY = 100;
    const spacingX = panelWidth / 2;
    const spacingY = 90;
    const itemsPerRow = 2;

    ingredients.forEach((ingredient, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = startX + (col * spacingX);
      const y = startY + (row * spacingY);
      const itemKey = `colo_${ingredient.key}`;
      const ingredientName = `ingredient_${ingredient.key.replace('bawangputih2', 'bawang_putih').replace('daunjeruk', 'daun_jeruk').replace('jeruknipis', 'jeruk_nipis').replace('piringcolocolo', 'piring')}`;

      // Item background
      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x000000, 0.25);
      itemBg.fillRoundedRect(x - 55, y - 37.5, 110, 75, 12);
      itemBg.lineStyle(1, 0x8B4513, 0.4);
      itemBg.strokeRoundedRect(x - 55, y - 37.5, 110, 75, 12);
      this.ingredientsPanel.add(itemBg);

      // Item image
      const item = this.add.image(x, y, itemKey)
        .setInteractive()
        .setScale(ingredient.scale)
        .setName(ingredientName);

      this.ingredientItems.push(item);
      this.input.setDraggable(item);
      this.ingredientsPanel.add(item);

      // Store original scale for reset
      item.setData('originalScale', ingredient.scale);

      // Item label
      const label = this.add.text(x, y + 40, ingredient.name, {
        fontSize: '18px',
        fontFamily: 'Chewy, cursive',
        color: '#FFFFFF',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      this.ingredientsPanel.add(label);

      // Hover effects
      item.on('pointerover', () => {
        item.setScale(ingredient.scale * 1.15);
        label.setColor('#FFFFFF');
        itemBg.clear();
        itemBg.fillStyle(0xFFD700, 0.15);
        itemBg.fillRoundedRect(x - 55, y - 37.5, 110, 75, 12);
        itemBg.lineStyle(1, 0xFFD700, 0.6);
        itemBg.strokeRoundedRect(x - 55, y - 37.5, 110, 75, 12);
      });

      item.on('pointerout', () => {
        item.setScale(ingredient.scale);
        label.setColor('#FFE4B5');
        itemBg.clear();
        itemBg.fillStyle(0x000000, 0.25);
        itemBg.fillRoundedRect(x - 55, y - 37.5, 110, 75, 12);
        itemBg.lineStyle(1, 0x8B4513, 0.4);
        itemBg.strokeRoundedRect(x - 55, y - 37.5, 110, 75, 12);
      });
    });
  }

  private updateIngredientsPanelVisuals() {
    // Clear and redraw panel background
    this.panelBg.clear();
    this.panelBg.fillStyle(0x2A1810, 0.95);
    this.panelBg.fillRoundedRect(0, 0, this.layoutConfig.ingredientsPanelWidth, this.layoutConfig.ingredientsPanelHeight, 20);
    this.panelBg.lineStyle(2, 0x8B4513, 0.8);
    this.panelBg.strokeRoundedRect(0, 0, this.layoutConfig.ingredientsPanelWidth, this.layoutConfig.ingredientsPanelHeight, 20);

    // Redraw panel header
    this.panelBg.fillStyle(0x4A3428, 0.9);
    this.panelBg.fillRoundedRect(10, 10, this.layoutConfig.ingredientsPanelWidth - 20, 40, 8);

    // Update panel title
    this.panelTitle.setText("BAHAN & ALAT");
    this.panelTitle.setStyle({
      fontSize: '24px',
      fontFamily: 'Chewy, cursive',
      color: '#FFE4B5',
      align: 'center',
      fontStyle: 'bold'
    });
    this.panelTitle.setPosition(this.layoutConfig.ingredientsPanelWidth/2, 30);
    this.panelTitle.setOrigin(0.5, 0.5);

    // Update menu toggle button
    this.menuToggleButton.setPosition(30, 30);
    this.menuToggleButton.setScale(0.05);
    this.menuToggleButton.setInteractive();
    this.menuToggleButton.off('pointerover');
    this.menuToggleButton.off('pointerout');
    this.menuToggleButton.off('pointerdown');
    this.menuToggleButton.off('pointerup');
    this.menuToggleButton.on('pointerover', () => {
      this.menuToggleButton.setTexture("menu_hover");
    });
    this.menuToggleButton.on('pointerout', () => {
      this.menuToggleButton.setTexture("menu_normal");
    });
    this.menuToggleButton.on('pointerdown', () => {
      this.menuToggleButton.setTexture("menu_active");
      this.toggleIngredientsPanel();
    });
    this.menuToggleButton.on('pointerup', () => {
      this.menuToggleButton.setTexture("menu_hover");
    });
  }

  private toggleIngredientsPanel() {
    this.isIngredientsPanelOpen = !this.isIngredientsPanelOpen;
    
    // Animate panel visibility
    const targetAlpha = this.isIngredientsPanelOpen ? 1 : 0.3;
    const targetX = this.isIngredientsPanelOpen ? 
      this.layoutConfig.ingredientsPanelX : 
      this.cameras.main.width - 50;

    this.tweens.add({
      targets: this.ingredientsPanel,
      alpha: targetAlpha,
      x: targetX,
      duration: 300,
      ease: 'Power2'
    });

    // Hide/show ingredients
    this.ingredientItems.forEach(item => {
      item.setVisible(this.isIngredientsPanelOpen);
      item.setActive(this.isIngredientsPanelOpen);
    });
  }

  // NOTE: createDialogPanel removed - using React dialog system only

  // Enhanced serving animation with sambal transfer effect
  private performServingAnimation(piringObject: Phaser.GameObjects.Image) {
    // Position the plate near the ulekan
    const plateTargetX = this.gameObjects.ulekan.x - 80;
    const plateTargetY = this.gameObjects.ulekan.y + 20;

    // Move plate to serving position
    this.tweens.add({
      targets: piringObject,
      x: plateTargetX,
      y: plateTargetY,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        console.log('ColoColo: Menuangkan sambal ke piring...');

        // Create sambal transfer effect
        this.createSambalTransferEffect(() => {
          // Hide original ulekan and ingredient
          this.gameObjects.ulekan.setVisible(false);
          piringObject.setVisible(false);

          // Show final plated sambal
          // Show final plated sambal - use the correct plated dish image
          let textureKey = 'colo_piringcolocolo';
          if (!this.textures.exists(textureKey)) {
            console.warn('PiringColoColo texture not found, using colocolo as fallback');
            textureKey = 'colo_colocolo';
          }
          const finalDish = this.add.image(plateTargetX, plateTargetY, textureKey).setScale(0.6);

          // Final presentation effect
          finalDish.setAlpha(0);
          this.tweens.add({
            targets: finalDish,
            alpha: 1,
            scaleX: 0.7,
            scaleY: 0.7,
            duration: 800,
            ease: 'Back.easeOut',
            onComplete: () => {
              this.updateStepText("Sambal Colo-colo siap disajikan! Selamat!");
              this.showSuccessFeedback();
              this.time.delayedCall(2000, () => this.nextStep());
            }
          });
        });
      }
    });
  }

  // Create visual effect of sambal transferring from ulekan to plate
  private createSambalTransferEffect(onComplete: () => void) {
    const startX = this.gameObjects.ulekan.x;
    const startY = this.gameObjects.ulekan.y - 20;
    const endX = this.gameObjects.ulekan.x - 80;
    const endY = this.gameObjects.ulekan.y + 20;

    // Create multiple small sambal particles for transfer effect
    const particles: Phaser.GameObjects.Image[] = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.image(startX, startY, 'colo_colocolo')
        .setScale(0.1)
        .setTint(Math.random() > 0.5 ? 0xFF6B6B : 0xFF8E53);

      particles.push(particle);

      // Stagger the animation for each particle
      this.time.delayedCall(i * 100, () => {
        this.tweens.add({
          targets: particle,
          x: endX + (Math.random() - 0.5) * 40,
          y: endY + (Math.random() - 0.5) * 20,
          scaleX: 0.15 + Math.random() * 0.1,
          scaleY: 0.15 + Math.random() * 0.1,
          rotation: Math.random() * Math.PI * 2,
          duration: 600 + Math.random() * 200,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            // Fade out particle
            this.tweens.add({
              targets: particle,
              alpha: 0,
              duration: 300,
              onComplete: () => particle.destroy()
            });
          }
        });
      });
    }

    // Call completion after all particles have been launched
    this.time.delayedCall(particleCount * 100 + 800, onComplete);
  }
  
  private showCompletionCelebration() {
    this.time.delayedCall(1000, () => {
      // Enhanced celebration effects
      this.cameras.main.flash(500, 255, 215, 0, false);
      
      // Create celebration particles
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
      
      // Show completion dialog
      this.showCompletionDialog();
    });
  }

  private showCompletionDialog() {
    const dialogWidth = 500;
    const dialogHeight = 200;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Dialog background
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x2A1810, 0.95);
    dialogBg.fillRoundedRect(centerX - dialogWidth/2, centerY - dialogHeight/2, dialogWidth, dialogHeight, 25);
    dialogBg.lineStyle(4, 0xFFD700, 1);
    dialogBg.strokeRoundedRect(centerX - dialogWidth/2, centerY - dialogHeight/2, dialogWidth, dialogHeight, 25);
    
    // Completion text
    const completionTitle = this.add.text(centerX, centerY - 40, "🎉 SELAMAT! 🎉", {
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
    
    // Animate dialog appearance
    const dialogElements = [overlay, dialogBg, completionTitle, completionText, completionSubtext];
    dialogElements.forEach(el => {
      if (el && typeof el.setAlpha === 'function') {
        el.setAlpha(0);
      }
    });

    dialogElements.forEach((element, index) => {
      if (element) {
        this.tweens.add({
          targets: element,
          alpha: 1,
          duration: 500,
          ease: 'Power2',
          delay: index * 100
        });
      }
    });
  }

  // NOTE: Hint system removed - now handled by React components in KitchenBackgroundWrapper

  private setupDialogBridge() {
    console.log('🔧 ColoColo: Setting up dialog bridge...');

    // Wait for dialog bridge to be attached by React
    const checkForBridge = () => {
      console.log('🔍 ColoColo: Checking for dialog bridge...');
      if (this.dialogBridge) {
        console.log('✅ ColoColo: Dialog bridge connected!');
        console.log('🎯 ColoColo: Current game step:', this.currentStep);

        // Test the bridge
        try {
          const currentDialogStep = this.dialogBridge.getCurrentStep();
          console.log('📊 ColoColo: Current dialog step:', currentDialogStep);

          // Sync initial step
          this.syncDialogWithGameStep();
        } catch (error) {
          console.error('❌ ColoColo: Bridge test failed:', error);
        }
      } else {
        console.log('⏳ ColoColo: Bridge not ready, checking again in 500ms...');
        // Try again in 500ms
        this.time.delayedCall(500, checkForBridge);
      }
    };

    // Start checking for bridge
    this.time.delayedCall(100, checkForBridge);
  }

  private syncDialogWithGameStep() {
    if (this.dialogBridge) {
      console.log('🔄 ColoColo: Syncing dialog with game step...');

      try {
        // Make sure dialog is at the correct step
        const currentDialogStep = this.dialogBridge.getCurrentStep();
        console.log(`📊 ColoColo: Game step: ${this.currentStep}, Dialog step: ${currentDialogStep}`);

        if (this.currentStep !== currentDialogStep) {
          console.log(`🔄 ColoColo: Syncing dialog step from ${currentDialogStep} to ${this.currentStep}`);
          this.dialogBridge.setStep(this.currentStep);
          console.log('✅ ColoColo: Dialog sync complete');
        } else {
          console.log('✅ ColoColo: Dialog already in sync');
        }
      } catch (error) {
        console.error('❌ ColoColo: Dialog sync failed:', error);
      }
    }
  }
}