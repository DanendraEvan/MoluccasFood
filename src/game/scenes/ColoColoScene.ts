// src/game/scenes/ColoColoScene.ts - Enhanced with Modern UI System
import Phaser from 'phaser';

interface GameStep {
  id: number;
  text: string;
  character: string;
  isCompleted: boolean;
}

export default class ColoColoScene extends Phaser.Scene {
  private gameObjects: { [key: string]: Phaser.GameObjects.Image } = {};
  private pisauArea: Phaser.GameObjects.Rectangle;
  private isDragging: boolean = false;
  private dragTarget: Phaser.GameObjects.Image | null = null;
  private gameState: {
    telenanState: string;
    ulekanState: string;
    hasPisau: boolean;
    hasBawangPutih: boolean;
    hasCabai: boolean;
    hasDaunJeruk: boolean;
    hasJerukNipis: boolean;
    hasMunthu: boolean;
    hasKecap: boolean;
    hasPiring: boolean;
  };

  // UI Components
  private ingredientsPanel!: Phaser.GameObjects.Container;
  private dialogPanel!: Phaser.GameObjects.Container;
  private menuToggleButton!: Phaser.GameObjects.Image;
  private characterImage!: Phaser.GameObjects.Image;
  private stepText!: Phaser.GameObjects.Text;
  private isIngredientsPanelOpen = true;
  private currentStep = 0;
  private ingredientItems: Phaser.GameObjects.Image[] = [];
  private panelBg!: Phaser.GameObjects.Graphics;
  private panelTitle!: Phaser.GameObjects.Text;
  private stagingZone!: Phaser.GameObjects.Zone;

  // Layout configuration
  private layoutConfig = {
    // Header bar
    headerHeight: 60,
    
    // Ingredients panel
    ingredientsPanelWidth: 350,
    ingredientsPanelX: 0, // Will be calculated
    ingredientsPanelY: 155,
    ingredientsPanelHeight: 450,
    
    // Cooking area
    cookingAreaLeft: 20,
    cookingAreaTop: 70,
    cookingAreaRight: 290,
    cookingAreaBottom: 180,
    
    // Dialog panel
    dialogPanelHeight: 120,
    dialogPanelY: 0, // Will be calculated
    dialogPanelLeft: 15,
    dialogPanelRight: 290,

    // Character
    characterX: 1010,
    characterY: 500,
    
    // Staging area
    stagingAreaX: 200,
    stagingAreaY: 300,
    stagingAreaWidth: 300,
    stagingAreaHeight: 225
  };

  // Game steps for Colo-Colo
  private gameSteps: GameStep[] = [
    {
      id: 1,
      text: "Selamat datang kembali, Koki! Mari kita buat pendamping hidangan yang luar biasa: Sambal Colo-colo Kecap. Resep ini mudah, tapi hasilnya bisa membuat siapa pun ketagihan. Siap?",
      character: "karakter1",
      isCompleted: false
    },
    {
      id: 2,
      text: "Pertama, siapkan talenan dan bahan-bahan utama kita: cabai rawit dan bawang merah. Silakan iris keduanya, lalu satukan irisan di atas talenan.",
      character: "karakter2",
      isCompleted: false
    },
    {
      id: 3,
      text: "Selanjutnya, ambil mangkok dan tuangkan kecap manis ke dalamnya. Setelah itu, masukkan irisan cabai dan bawang merah tadi. Campurkan semuanya dengan baik.",
      character: "karakter3",
      isCompleted: false
    },
    {
      id: 4,
      text: "Untuk sentuhan terakhir, kita butuh sedikit rasa asam yang segar. Ambil jeruk nipis, peras airnya ke dalam mangkok, lalu aduk semua bahan hingga tercampur rata.",
      character: "karakter4",
      isCompleted: false
    },
    {
      id: 5,
      text: "Lihat! Sambal colo-colo kecapmu sudah jadi. Mudah, cepat, dan pastinya enak. Selamat menyajikan!",
      character: "karakter5",
      isCompleted: false
    }
  ];

  constructor() {
    super('ColoColoScene');
  }

  preload() {
    // Background
    this.load.image('background', '/assets/backgrounds/kitchen.png');
    
    // Preload Colo-Colo food images
    this.load.image('colo_colo_finished', '/assets/foods/colo_colo/ColoColo.png');
    this.load.image('piring_colo_colo', '/assets/foods/colo_colo/PiringColoColo.png');
    
    // Preload ingredient images
    this.load.image('munthu', '/assets/foods/colo_colo/Munthu.png');
    this.load.image('jeruk_nipis', '/assets/foods/colo_colo/JerukNipis.png');
    this.load.image('daun_jeruk', '/assets/foods/colo_colo/DaunJeruk.png');
    this.load.image('kecap', '/assets/foods/colo_colo/Kecap.png');
    this.load.image('cabai', '/assets/foods/colo_colo/Cabai.png');
    this.load.image('bawang_putih', '/assets/foods/colo_colo/BawangPutih2.png');
    
    // Preload tool images
    this.load.image('ulekan', '/assets/foods/colo_colo/Ulekan.png');
    this.load.image('ulekan_munthu', '/assets/foods/colo_colo/UlekanMunthu.png');
    this.load.image('ulekan_munthu2', '/assets/foods/colo_colo/UlekanMunthu2.png');
    this.load.image('ulekan_nipis', '/assets/foods/colo_colo/UlekanNipis.png');
    this.load.image('ulekan_daun', '/assets/foods/colo_colo/UlekanDaun.png');
    this.load.image('ulekan_cabe_bawang', '/assets/foods/colo_colo/UlekanCabeBawang.png');
    this.load.image('ulekan_kecap', '/assets/foods/colo_colo/UlekanKecap.png');
    
    // Preload cutting board images
    this.load.image('telenan', '/assets/foods/colo_colo/telenan.png');
    this.load.image('telenan_cabai', '/assets/foods/colo_colo/TelenanCabai.png');
    this.load.image('telenan_cabai_potong', '/assets/foods/colo_colo/TelenanCabaiPotong.png');
    this.load.image('telenan_cabai_bawang_putih', '/assets/foods/colo_colo/TelenanCabaiBawangPutih.png');
    this.load.image('telenan_cabai_bawang_potong', '/assets/foods/colo_colo/TelenanCabaiBawangPotong.png');
    
    // Preload additional assets
    this.load.image('Pisau', '/assets/foods/colo_colo/Pisau.png');

    // UI Elements
    this.load.image("menu_normal", "/assets/ui/buttons/menu/menu_normal.png");
    this.load.image("menu_hover", "/assets/ui/buttons/menu/menu_hover.png");
    this.load.image("menu_active", "/assets/ui/buttons/menu/menu_active.png");

    // Characters
    this.load.image("karakter1", "/assets/karakter/karakter1.png");
    this.load.image("karakter2", "/assets/karakter/karakter2.png");
    this.load.image("karakter3", "/assets/karakter/karakter3.png");
    this.load.image("karakter4", "/assets/karakter/karakter4.png");
    this.load.image("karakter5", "/assets/karakter/karakter5.png");
  }

  create() {
    // Set background
    this.add.image(0, 0, "background").setOrigin(0);
    
    // Calculate layout positions
    this.calculateLayout();

    // Initialize game state
    this.gameState = {
      telenanState: 'telenan',
      ulekanState: 'ulekan',
      hasPisau: false,
      hasBawangPutih: false,
      hasCabai: false,
      hasDaunJeruk: false,
      hasJerukNipis: false,
      hasMunthu: false,
      hasKecap: false,
      hasPiring: false
    };

    // Create game elements in the cooking area
    this.createCookingArea();

    // Create UI components
    this.createIngredientsPanel();
    this.createDialogPanel();

    // Update panel visuals
    this.updateIngredientsPanelVisuals();

    // Setup ingredient panel layout
    this.setupIngredientsPanelLayout(undefined, undefined, undefined, 1500, 230);

    // Set up drag and drop events
    this.setupDragAndDrop();

    // Update step display
    this.updateStepDisplay();

    // Add back button
    this.createBackButton();
  }

  private calculateLayout() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Calculate ingredients panel position
    this.layoutConfig.ingredientsPanelX = gameWidth - this.layoutConfig.ingredientsPanelWidth - 15;
    
    // Calculate dialog panel position
    this.layoutConfig.dialogPanelY = gameHeight - this.layoutConfig.dialogPanelHeight - 15;
    
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

  private createCookingArea() {
    // Create initial telenan (cutting board) in cooking area
    this.gameObjects.telenan = this.add.image(400, 400, 'telenan');
    this.gameObjects.telenan.setInteractive({ draggable: true });
    this.gameObjects.telenan.setScale(0.6);
    this.gameObjects.telenan.setData('type', 'telenan');
    this.gameObjects.telenan.setData('currentState', 'telenan');

    // Create ulekan (mortar and pestle) in cooking area
    this.gameObjects.ulekan = this.add.image(700, 400, 'ulekan');
    this.gameObjects.ulekan.setInteractive({ draggable: true });
    this.gameObjects.ulekan.setScale(0.6);

    // Create staging zone
    this.stagingZone = this.add.zone(
      this.layoutConfig.cookingAreaLeft + this.layoutConfig.stagingAreaX,
      this.layoutConfig.cookingAreaTop + this.layoutConfig.stagingAreaY,
      this.layoutConfig.stagingAreaWidth,
      this.layoutConfig.stagingAreaHeight
    ).setRectangleDropZone(this.layoutConfig.stagingAreaWidth, this.layoutConfig.stagingAreaHeight);
    this.stagingZone.name = "staging";

    // Visual indicator for staging area
    const stagingGraphics = this.add.graphics();
    stagingGraphics.fillStyle(0x2A1810, 0.95);
    stagingGraphics.fillRoundedRect(
      this.stagingZone.x - this.stagingZone.width/2,
      this.stagingZone.y - this.stagingZone.height/2,
      this.stagingZone.width,
      this.stagingZone.height,
      20
    );
    stagingGraphics.lineStyle(2, 0x8B4513, 0.8);
    stagingGraphics.strokeRoundedRect(
      this.stagingZone.x - this.stagingZone.width/2,
      this.stagingZone.y - this.stagingZone.height/2,
      this.stagingZone.width,
      this.stagingZone.height,
      20
    );
    
    const stagingLabel = this.add.text(
      this.stagingZone.x,
      this.stagingZone.y,
      "Area Persiapan",
      {
        fontSize: '14px',
        fontFamily: 'Chewy, cursive',
        color: '#FFE4B5',
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0.5);
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
      { key: "cabai", name: "Cabai", scale: 0.4 },
      { key: "bawang_putih", name: "Bawang Putih", scale: 0.4 },
      { key: "daun_jeruk", name: "Daun Jeruk", scale: 0.4 },
      { key: "jeruk_nipis", name: "Jeruk Nipis", scale: 0.4 },
      { key: "kecap", name: "Kecap", scale: 0.4 },
      { key: "munthu", name: "Munthu", scale: 0.4 },
      { key: "Pisau", name: "Pisau", scale: 0.4 },
      { key: "piring_colo_colo", name: "Piring", scale: 0.4 }
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

      // Item background
      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x000000, 0.25);
      itemBg.fillRoundedRect(x - 55, y - 37.5, 110, 75, 12);
      itemBg.lineStyle(1, 0x8B4513, 0.4);
      itemBg.strokeRoundedRect(x - 55, y - 37.5, 110, 75, 12);
      this.ingredientsPanel.add(itemBg);

      // Item image
      const item = this.add.image(x, y, ingredient.key)
        .setInteractive()
        .setScale(ingredient.scale)
        .setName(ingredient.key);

      this.ingredientItems.push(item);
      this.input.setDraggable(item);
      this.ingredientsPanel.add(item);

      // Item label
      const label = this.add.text(x, y + 40, ingredient.name, {
        fontSize: '14px',
        fontFamily: 'Chewy, cursive',
        color: '#FFE4B5',
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

  private createDialogPanel() {
    // Create dialog panel container
    this.dialogPanel = this.add.container(
      this.layoutConfig.dialogPanelLeft,
      this.layoutConfig.dialogPanelY
    );

    const dialogWidth = this.layoutConfig.cookingAreaRight - this.layoutConfig.dialogPanelLeft;

    // Panel background
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0xFFFFF0, 0.95);
    dialogBg.fillRoundedRect(0, 0, dialogWidth, this.layoutConfig.dialogPanelHeight, 20);
    dialogBg.lineStyle(2, 0x8B4513, 0.6);
    dialogBg.strokeRoundedRect(0, 0, dialogWidth, this.layoutConfig.dialogPanelHeight, 20);
    this.dialogPanel.add(dialogBg);

    // Character container
    const characterContainer = this.add.graphics();
    characterContainer.fillStyle(0x8B4513, 0.1);
    characterContainer.fillCircle(50, this.layoutConfig.dialogPanelHeight/2, 35);
    characterContainer.lineStyle(2, 0x8B4513, 0.4);
    characterContainer.strokeCircle(50, this.layoutConfig.dialogPanelHeight/2, 35);
    this.dialogPanel.add(characterContainer);

    // Character image
    this.characterImage = this.add.image(50, this.layoutConfig.dialogPanelHeight/2, "karakter1")
      .setScale(0.4)
      .setOrigin(0.5, 0.5);
    this.dialogPanel.add(this.characterImage);

    // Step text
    this.stepText = this.add.text(110, this.layoutConfig.dialogPanelHeight/2, "", {
      fontSize: '15px',
      fontFamily: 'Chewy, cursive',
      color: '#2C1810',
      wordWrap: { width: dialogWidth - 140, useAdvancedWrap: true },
      align: 'left',
      lineSpacing: 4
    }).setOrigin(0, 0.5);
    this.dialogPanel.add(this.stepText);

    // Progress bar
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x8B4513, 0.2);
    progressBg.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 15, dialogWidth - 40, 6, 3);
    this.dialogPanel.add(progressBg);

    const progressBar = this.add.graphics();
    progressBar.fillStyle(0xFFD700, 1);
    progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 15, (dialogWidth - 40) * 0.2, 6, 3);
    this.dialogPanel.add(progressBar);
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
      fontSize: '14px',
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
    this.setupMenuButtonEvents();
  }

  private setupMenuButtonEvents() {
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

    this.ingredientItems.forEach(item => {
      item.setVisible(this.isIngredientsPanelOpen);
      item.setActive(this.isIngredientsPanelOpen);
    });
  }

  private updateStepDisplay() {
    if (this.currentStep < this.gameSteps.length) {
      const step = this.gameSteps[this.currentStep];
      this.stepText.setText(`${step.text}`);
      this.characterImage.setTexture(step.character);
      
      // Animate text appearance
      this.stepText.setAlpha(0);
      this.tweens.add({
        targets: this.stepText,
        alpha: 1,
        duration: 500,
        ease: 'Power2'
      });

      // Update progress bar
      const progressPercentage = (this.currentStep + 1) / this.gameSteps.length;
      const dialogWidth = this.layoutConfig.cookingAreaRight - this.layoutConfig.dialogPanelLeft;
      
      const progressBar = this.dialogPanel.list[this.dialogPanel.list.length - 1] as Phaser.GameObjects.Graphics;
      progressBar.clear();
      progressBar.fillStyle(0xFFD700, 1);
      progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 15, (dialogWidth - 40) * progressPercentage, 6, 3);
    }
  }

  private nextStep() {
    if (this.currentStep < this.gameSteps.length - 1) {
      this.gameSteps[this.currentStep].isCompleted = true;
      this.currentStep++;
      this.updateStepDisplay();
      this.showSuccessFeedback();
    } else if (this.currentStep === this.gameSteps.length - 1) {
      this.gameSteps[this.currentStep].isCompleted = true;
      this.showCompletionCelebration();
    }
  }

  private setupDragAndDrop() {
    this.input.on('dragstart', (pointer: any, gameObject: Phaser.GameObjects.Image) => {
      this.isDragging = true;
      this.dragTarget = gameObject;
      gameObject.setTint(0x00ff00);
    });

    this.input.on('drag', (pointer: any, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer: any, gameObject: Phaser.GameObjects.Image) => {
      this.isDragging = false;
      gameObject.clearTint();
      
      this.checkDropTarget(gameObject);
      
      if (!this.isValidDrop(gameObject)) {
        this.resetIngredientPosition(gameObject);
      }
    });
  }

  private checkDropTarget(gameObject: Phaser.GameObjects.Image) {
    const type = gameObject.getData('type') || gameObject.name;
    const currentState = gameObject.getData('currentState');
    
    // Check if dropped on telenan
    if (this.isNear(gameObject, this.gameObjects.telenan, 100)) {
      this.handleTelenanDrop(type);
    }
    
    // Check if dropped on ulekan
    if (this.isNear(gameObject, this.gameObjects.ulekan, 100)) {
      const dropType = currentState || type;
      this.handleUlekanDrop(dropType);
    }
  }

  private handleTelenanDrop(ingredientType: string) {
    console.log(`handleTelenanDrop called with: ${ingredientType}, current state: ${this.gameState.telenanState}`);
    
    if (ingredientType === 'cabai' && this.gameState.telenanState === 'telenan' && this.currentStep === 1) {
      console.log('Cabai ditambahkan ke telenan');
      this.transformTelenan('telenan_cabai');
      this.gameState.hasCabai = true;
      this.hideIngredient('cabai');
    } else if (ingredientType === 'bawang_putih' && this.gameState.telenanState === 'telenan_cabai_potong' && this.currentStep === 1) {
      console.log('Bawang putih ditambahkan ke telenan_cabai_potong');
      this.transformTelenan('telenan_cabai_bawang_putih');
      this.gameState.hasBawangPutih = true;
      this.hideIngredient('bawang_putih');
    } else if (ingredientType === 'Pisau' && this.gameState.telenanState === 'telenan_cabai' && this.currentStep === 1) {
      console.log('Pisau memotong telenan_cabai!');
      this.transformTelenan('telenan_cabai_potong');
      this.gameState.hasPisau = true;
      this.animatePisauCut();
      this.showCuttingFeedback();
    } else if (ingredientType === 'Pisau' && this.gameState.telenanState === 'telenan_cabai_bawang_putih' && this.currentStep === 1) {
      console.log('Pisau memotong telenan_cabai_bawang_putih!');
      this.transformTelenan('telenan_cabai_bawang_potong');
      this.gameState.hasPisau = true;
      this.animatePisauCut();
      this.showCuttingFeedback();
      this.nextStep(); // Move to step 2 after cutting is complete
    } else {
      console.log(`Invalid combination: ${ingredientType} with state ${this.gameState.telenanState}`);
    }
  }

  private handleUlekanDrop(ingredientType: string) {
    console.log(`handleUlekanDrop called with: ${ingredientType}, current ulekan state: ${this.gameState.ulekanState}`);
    
    if (ingredientType === 'kecap' && this.gameState.ulekanState === 'ulekan' && this.currentStep === 2) {
      console.log('Kecap ditambahkan ke ulekan');
      this.transformUlekan('ulekan_kecap');
      this.gameState.hasKecap = true;
      this.hideIngredient('kecap');
    } else if (ingredientType === 'telenan_cabai_bawang_potong' && this.gameState.ulekanState === 'ulekan_kecap' && this.currentStep === 2) {
      console.log('Telenan_cabai_bawang_potong di-drop ke ulekan_kecap!');
      this.transformUlekan('ulekan_cabe_bawang');
      this.hideTelenan();
      this.showUlekanTransformationFeedback('ulekan_cabe_bawang');
      this.nextStep(); // Move to step 3 after combining ingredients
    } else if (ingredientType === 'jeruk_nipis' && this.gameState.ulekanState === 'ulekan_cabe_bawang' && this.currentStep === 3) {
      console.log('Jeruk nipis ditambahkan ke ulekan');
      this.transformUlekan('ulekan_nipis');
      this.gameState.hasJerukNipis = true;
      this.hideIngredient('jeruk_nipis');
      this.nextStep(); // Move to final step
    } else if (ingredientType === 'piring_colo_colo' && this.gameState.ulekanState === 'ulekan_nipis' && this.currentStep === 4) {
      console.log('Piring colo-colo ditambahkan untuk penyajian');
      this.completeColoColo();
      this.gameState.hasPiring = true;
      this.hideIngredient('piring_colo_colo');
      this.nextStep(); // Complete the recipe
    } else {
      console.log(`Invalid combination for ulekan: ${ingredientType} with state ${this.gameState.ulekanState}`);
    }
  }

  private transformTelenan(newState: string) {
    console.log(`Transforming telenan from ${this.gameState.telenanState} to ${newState}`);
    this.gameObjects.telenan.setTexture(newState);
    this.gameState.telenanState = newState;
    
    this.gameObjects.telenan.setData('currentState', newState);
    this.showTransformationFeedback(newState);
  }

  private transformUlekan(newState: string) {
    console.log(`Transforming ulekan from ${this.gameState.ulekanState} to ${newState}`);
    this.gameObjects.ulekan.setTexture(newState);
    this.gameState.ulekanState = newState;
    this.showUlekanTransformationFeedback(newState);
  }

  private completeColoColo() {
    this.add.text(400, 300, 'Colo-Colo Selesai!', {
      font: '48px Chewy',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    this.gameObjects.ulekan.setTexture('colo_colo_finished');
    this.gameState.ulekanState = 'colo_colo_finished';
  }

  private hideIngredient(ingredientType: string) {
    this.ingredientItems.forEach(item => {
      if (item.name === ingredientType) {
        item.setVisible(false);
        item.setActive(false);
      }
    });
  }

  private hideTelenan() {
    if (this.gameObjects.telenan) {
      this.gameObjects.telenan.setVisible(false);
    }
  }

  private isNear(obj1: Phaser.GameObjects.Image, obj2: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle, distance: number): boolean {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy) < distance;
  }

  private isValidDrop(gameObject: Phaser.GameObjects.Image): boolean {
    return this.isNear(gameObject, this.gameObjects.telenan, 100) ||
           this.isNear(gameObject, this.gameObjects.ulekan, 100);
  }

  private resetIngredientPosition(gameObject: Phaser.GameObjects.Image) {
    this.tweens.add({
      targets: gameObject,
      x: gameObject.input.dragStartX,
      y: gameObject.input.dragStartY,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  private animatePisauCut() {
    const pisauItem = this.ingredientItems.find(item => item.name === 'Pisau');
    if (pisauItem) {
      this.tweens.add({
        targets: pisauItem,
        angle: 15,
        duration: 100,
        ease: 'Power2',
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          pisauItem.setAngle(0);
        }
      });
    }
  }

  private showCuttingFeedback() {
    const feedbackText = this.add.text(400, 350, '✓ Berhasil Dipotong!', {
      font: '24px Chewy',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      feedbackText.destroy();
    });
  }

  private showTransformationFeedback(newState: string) {
    let message = '';
    let color = '#00ff00';
    
    switch (newState) {
      case 'telenan_cabai':
        message = 'Cabai ditambahkan ke telenan';
        break;
      case 'telenan_cabai_potong':
        message = 'Cabai berhasil dipotong!';
        color = '#ff6600';
        break;
      case 'telenan_cabai_bawang_putih':
        message = 'Bawang putih ditambahkan';
        break;
      case 'telenan_cabai_bawang_potong':
        message = 'Bawang putih berhasil dipotong!';
        color = '#ff6600';
        break;
      default:
        message = 'Telenan berubah';
    }
    
    const feedbackText = this.add.text(400, 380, message, {
      font: '20px Chewy',
      color: color,
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      feedbackText.destroy();
    });
  }

  private showUlekanTransformationFeedback(newState: string) {
    let message = '';
    let color = '#00ff00';
    
    switch (newState) {
      case 'ulekan_kecap':
        message = 'Kecap ditambahkan ke mangkok!';
        color = '#8B4513';
        break;
      case 'ulekan_cabe_bawang':
        message = 'Cabai dan bawang putih dicampur dengan kecap!';
        color = '#ff6600';
        break;
      case 'ulekan_nipis':
        message = 'Jeruk nipis ditambahkan ke sambal!';
        color = '#FFA500';
        break;
      default:
        message = 'Mangkok berubah';
    }
    
    const feedbackText = this.add.text(400, 420, message, {
      font: '20px Chewy',
      color: color,
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      feedbackText.destroy();
    });
  }

  private showSuccessFeedback() {
    this.cameras.main.flash(150, 144, 238, 144, false);
    
    // Success particle burst
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

  private showCompletionCelebration() {
    this.time.delayedCall(1000, () => {
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
    
    const completionSubtext = this.add.text(centerX, centerY + 35, "Resep tradisional telah selesai dengan sempurna!", {
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

    this.tweens.add({
      targets: dialogElements,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      delay: this.tweens.stagger(100)
    });
  }

  private createBackButton() {
    const backButton = this.add.text(50, 50, '← Back', {
      font: '24px Chewy',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    });
    
    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/SelectFood';
      }
    });
    
    backButton.on('pointerover', () => {
      backButton.setStyle({ backgroundColor: '#333333' });
    });
    
    backButton.on('pointerout', () => {
      backButton.setStyle({ backgroundColor: '#000000' });
    });
  }

  update() {
    // Game logic updates
  }
}