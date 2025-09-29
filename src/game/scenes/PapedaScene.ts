// src/game/scenes/PapedaScene.ts - Enhanced with NasiLapola UI System
import Phaser from "phaser";

type BowlState = 'empty' | 'flour' | 'flour_water' | 'finished' | 'keras_with_water' | 'finished_second_stir' | 'keras_with_nipis' | 'keras_with_nipis_and_hot_water' | 'final_stir' | 'ready_to_serve' | 'served' | 'keras' | 'keras2' | 'hasil_aduk2' | 'jeruk_diatas' | 'cipratan_jeruk1' | 'cipratan_jeruk2' | 'cipratan_jeruk3' | 'adonan_jeruk' | 'aduk_jeruk1' | 'tambahan_air_panas' | 'hasil_jadi';

interface GameStep {
  id: number;
  isCompleted: boolean;
}

export default class PapedaScene extends Phaser.Scene {
  // Dialog bridge for React integration - Disabled
  public dialogBridge: any = null;
  private useReactDialog: boolean = false; // Disable React dialog

  // Original game objects
  private dropZone!: Phaser.GameObjects.Zone;
  private flourDropZone!: Phaser.GameObjects.Zone;
  private strainerDropZone!: Phaser.GameObjects.Zone;
  private bowlState: BowlState;
  private stirringTimer: Phaser.Time.TimerEvent | null = null;
  private finalPlate: Phaser.GameObjects.Image | null = null;
  private mangkuk: Phaser.GameObjects.Image | null = null;
  
  // Dialog 4-6 specific objects
  private stirCount: number = 0;
  private maxStirCount: number = 15;
  private isStirring: boolean = false;
  private currentStirTexture: string = 'Aduk3';
  private secondBowl: Phaser.GameObjects.Image | null = null;
  private strainerBowl: Phaser.GameObjects.Image | null = null;
  private countdownTimer: Phaser.Time.TimerEvent | null = null;
  private countdownText: Phaser.GameObjects.Text | null = null;
  private stagingTimer: Phaser.Time.TimerEvent | null = null;
  
  // Dialog 7-12 specific objects
  private kerasItem: Phaser.GameObjects.Image | null = null;
  private jerukClickCount: number = 0;
  private currentJerukStage: number = 0;
  private spoonItem: Phaser.GameObjects.Image | null = null;
  private finalKerasItem: Phaser.GameObjects.Image | null = null;
  
  // Swipe detection for Dialog 4
  private swipeStartX: number = 0;
  private swipeStartY: number = 0;
  private isSwipeActive: boolean = false;

  // --> STATE MANAGEMENT BARU UNTUK LOGIKA GAME
  private isBowlPlaced: boolean = false;
  private isWaterAdded: boolean = false;
  private flourDropZone: Phaser.GameObjects.Zone;
  private dropZoneGraphics: Phaser.GameObjects.Graphics | null = null;
  private stagingAreaGraphics: Phaser.GameObjects.Graphics | null = null;

  // UI Components (from NasiLapola)
  private ingredientsPanel!: Phaser.GameObjects.Container;
  // NOTE: dialogPanel removed - using React dialog system only
  private stagingArea!: Phaser.GameObjects.Container;
  private menuToggleButton!: Phaser.GameObjects.Image;
  // NOTE: characterImage and stepText removed - using React dialog system only
  private isIngredientsPanelOpen = true;
  private currentStep = 0;
  private ingredientItems: Phaser.GameObjects.Image[] = [];
  private panelBg!: Phaser.GameObjects.Graphics;
  private panelTitle!: Phaser.GameObjects.Text;
  // NOTE: Hint system removed - now handled by React components in KitchenBackgroundWrapper
  private infoContent: string = `Papeda adalah salah satu olahan sagu yang paling sering ditemukan pada meja makan masyarakat Maluku. Makanan yang seringkali disebut mirip dengan lem ini sebenarnya terbuat dari pati sagu yang dikeringkan, atau yang seringkali disebut Sagu Manta oleh orang Maluku. Papeda dibuat dengan cara mengaduk sagu manta yang sudah dibersihkan menggunakan air dengan air mendidih hingga mengental dan bening. Warna papeda dapat bervariasi dari kecoklatan hingga putih bening, tergantung dari jenis sagu manta yang digunakan. Papeda yang sudah matang memiliki tekstur yang lengket menyerupai lem dan rasa yang hambar, dan bahkan sering dideskripsikan sebagai tidak memiliki rasa khusus. Oleh karena itu, Papeda hampir selalu disajikan bersama makanan berkuah seperti Ikan Kuah Kuning.`;

  // Layout configuration
  private layoutConfig = {
    // Header bar
    headerHeight: 60,
    
    // Ingredients panel
    ingredientsPanelWidth: 375,
    ingredientsPanelX: 0, // Will be calculated
    ingredientsPanelY: 300, // Turun 150px lagi dari 755 ke 905
    ingredientsPanelHeight: 600,
    
    // Cooking area
    cookingAreaLeft: 20,
    cookingAreaTop: 70,
    cookingAreaRight: 290,
    cookingAreaBottom: 180, // Account for dialog panel

    // NOTE: Dialog panel config removed - using React dialog system

    // Character
    characterX: 1000,
    characterY: 500,

    // Bowl settings
    bowlScale: 0.3,
    
    // Staging area
    stagingAreaX: 180,
    stagingAreaY: 350, // Turun 100px dari 250 ke 350
    stagingAreaWidth: 300,
    stagingAreaHeight: 225
  };

  // Game steps for Papeda
  private gameSteps: GameStep[] = [
    { id: 1, isCompleted: false },
    { id: 2, isCompleted: false },
    { id: 3, isCompleted: false },
    { id: 4, isCompleted: false },
    { id: 5, isCompleted: false },
    { id: 6, isCompleted: false },
    { id: 7, isCompleted: false },
    { id: 8, isCompleted: false },
    { id: 9, isCompleted: false },
    { id: 10, isCompleted: false },
    { id: 11, isCompleted: false },
    { id: 12, isCompleted: false }
  ];
  


  constructor() {
    super("PapedaScene");
    this.bowlState = 'empty';
  }

  preload() {
    // Background and UI
    this.load.image("background", "/assets/backgrounds/kitchen.png");
    this.load.image("menu_normal", "/assets/ui/buttons/menu/menu_normal.png");
    
    // Load food image for hint popup
    this.load.image('papeda_food', '/assets/makanan/papeda.png');
    this.load.image("menu_hover", "/assets/ui/buttons/menu/menu_hover.png");
    this.load.image("menu_active", "/assets/ui/buttons/menu/menu_active.png");
    this.load.image("hint_normal", "/assets/ui/buttons/hint/hint_normal.png");
    this.load.image("hint_hover", "/assets/ui/buttons/hint/hint_hover.png");
    this.load.image("hint_active", "/assets/ui/buttons/hint/hint_active.png");

    // Characters
    this.load.image("karakter1", "/assets/karakter/karakter1.png");
    this.load.image("karakter2", "/assets/karakter/karakter2.png");
    this.load.image("karakter3", "/assets/karakter/karakter3.png");
    this.load.image("karakter4", "/assets/karakter/karakter4.png");
    this.load.image("karakter5", "/assets/karakter/karakter5.png");
    this.load.image("karakter6", "/assets/karakter/karakter6.png");

    // Papeda ingredients and tools
    // this.load.image("Tepung", "/assets/foods/papeda/flour.png");
    this.load.image("Water", "/assets/foods/papeda/water.png");
    this.load.image("Spoon", "/assets/foods/papeda/spoon.png");
    this.load.image("Mangkuk", "/assets/foods/papeda/bowl.png");
    this.load.image("AirPanas", "/assets/foods/papeda/AirPanas.png");
    this.load.image("Air100ml", "/assets/foods/papeda/Air-100-ml.png");
    this.load.image("Nipis", "/assets/foods/papeda/nipis.png");
    this.load.image("Piring", "/assets/foods/papeda/Piring.png");
    this.load.image("SaguManta", "/assets/foods/papeda/SaguManta.png");

    // Papeda process images
    this.load.image('Saring', '/assets/foods/papeda/Saring.png');
    this.load.image('Saring1', '/assets/foods/papeda/Saring1.png');
    this.load.image('Saring2', '/assets/foods/papeda/Saring2.png');
    this.load.image('SaringKosong1', '/assets/foods/papeda/SaringKosong1.png');
    this.load.image('SaringKosong2', '/assets/foods/papeda/SaringKosong2.png');
    this.load.image('TepungSaring', '/assets/foods/papeda/TepungSaring.png');
    this.load.image("TepungBuangAir", '/assets/foods/papeda/TepungBuangAir.png');
    this.load.image("Air200ml1", "/assets/foods/papeda/Air200ml1.png");
    this.load.image("Air200ml2", "/assets/foods/papeda/Air200ml2.png");
    this.load.image("Air200ml3", "/assets/foods/papeda/Air200ml3.png");
    // this.load.image("TuangTepung1", "/assets/foods/papeda/TuangTepung1.png");
    // this.load.image("TuangTepung2", "/assets/foods/papeda/TuangTepung2.png");
    // this.load.image("TuangTepung3", "/assets/foods/papeda/TuangTepung3.png");
    // this.load.image("TepungPotong", "/assets/foods/papeda/TepungPotong.png");
    this.load.image("DenganTepung", "/assets/foods/papeda/DenganTepung.png");
    this.load.image("DenganAir", "/assets/foods/papeda/DenganAir.png");
    this.load.image("DenganEndok", "/assets/foods/papeda/Denganendok.png");
    this.load.image("PapedaAduk1", "/assets/foods/papeda/PapedaAduk1.png");
    this.load.image("PapedaAduk2", "/assets/foods/papeda/PapedaAduk2.png");
    this.load.image("HasilAduk1", "/assets/foods/papeda/hasilAduk1.png");
    this.load.image("HasilAduk2", "/assets/foods/papeda/hasilAduk2.png");
    this.load.image("Keras", "/assets/foods/papeda/Keras.png");
    this.load.image("Keras2", "/assets/foods/papeda/Keras2.png");
    this.load.image("TambahanAir100Ml", "/assets/foods/papeda/Tambahan-Air-100-Ml.png");
    this.load.image("Tambahan-Nipis", "/assets/foods/papeda/Tambahan-Nipis.png");
    this.load.image("Tambahan-Air-Panas", "/assets/foods/papeda/Tambahan-Air-Panas.png");
    this.load.image("Hasil-Jadi", "/assets/foods/papeda/Hasil-Jadi.png");
    this.load.image("Papeda", "/assets/foods/papeda/Papeda.png");
    
    // Additional assets for steps 7-12
    this.load.image("Air100ml1", "/assets/foods/papeda/Air100ml1.png");
    this.load.image("Air100ml2", "/assets/foods/papeda/Air100ml2.png");
    this.load.image("Air1400ml1", "/assets/foods/papeda/Air1400ml1.png");
    this.load.image("Air1400ml2", "/assets/foods/papeda/Air1400ml2.png");
    this.load.image("Air1400ml3", "/assets/foods/papeda/Air1400ml3.png");
    this.load.image("JerukDiatas", "/assets/foods/papeda/JerukDiatas.png");
    this.load.image("CipratanJeruk1", "/assets/foods/papeda/CipratanJeruk1.png");
    this.load.image("CipratanJeruk2", "/assets/foods/papeda/CipratanJeruk2.png");
    this.load.image("CipratanJeruk3", "/assets/foods/papeda/CipratanJeruk3.png");
    this.load.image("AdonanJeruk", "/assets/foods/papeda/AdonanJeruk.png");
    this.load.image("AdukJeruk1", "/assets/foods/papeda/AdukJeruk1.png");
    this.load.image("AdukJeruk2", "/assets/foods/papeda/AdukJeruk2.png");
    this.load.image("SebelumPapeda", "/assets/foods/papeda/SebelumPapeda.png");

    // Stirring animation images
    this.load.image("Aduk3", "/assets/foods/papeda/Aduk3.png");
    this.load.image("Aduk4", "/assets/foods/papeda/Aduk4.png");
    this.load.image("Aduk5", "/assets/foods/papeda/Aduk5.png");
    this.load.image("Aduk6", "/assets/foods/papeda/Aduk6.png");
    this.load.image("Aduk7", "/assets/foods/papeda/Aduk7.png");
    this.load.image("Aduk8", "/assets/foods/papeda/Aduk8.png");
  }

  create() {
    this.add.image(0, 0, "background").setOrigin(0);
    
    // Calculate layout positions
    this.calculateLayout();

    // Create game elements
    this.createCookingArea();
    this.createIngredientsPanel();
    // NOTE: Phaser dialog removed completely - using React dialog system only
    this.createStagingArea();

    // Update panel visuals
    this.updateIngredientsPanelVisuals();

    // Setup ingredient panel layout
    this.setupIngredientsPanelLayout(undefined, undefined, undefined, 1500, this.layoutConfig.ingredientsPanelY);

    // Initialize drag and drop
    this.initDragAndDrop();

    // NOTE: updateStepDisplay removed - using React dialog system only
    // NOTE: createHintButton removed - hint system now handled by React components in KitchenBackgroundWrapper

    // Setup dialog bridge integration
    // this.setupDialogBridge();
  }

  private calculateLayout() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Calculate ingredients panel position
    this.layoutConfig.ingredientsPanelX = gameWidth - this.layoutConfig.ingredientsPanelWidth - 15;
    
    // Calculate dialog panel position - use the configured value instead of calculating
    // this.layoutConfig.dialogPanelY = gameHeight - this.layoutConfig.dialogPanelHeight - 15;
    
    // Update cooking area bounds
    this.layoutConfig.cookingAreaRight = gameWidth - this.layoutConfig.ingredientsPanelWidth - 40;
    // NOTE: Dialog panel height removed - using React dialog system only
  }

  private createCookingArea() {
    // Atur posisi mangkuk untuk mengolah papeda secara manual di sini
    const gameHeight = this.cameras.main.height;
    const mangkukX = 800; // Ganti nilai ini untuk posisi horizontal (sumbu X)
    const mangkukY = gameHeight - 280; // 280px dari dasar halaman

    // Create much larger drop zone for easier dropping - covers most of the cooking area
    const dropZoneWidth = 600; // Much wider
    const dropZoneHeight = 400; // Much taller
    const dropZoneX = 750; // Center the larger zone
    const dropZoneY = mangkukY; // Gunakan posisi yang sama dengan mangkuk

    this.dropZone = this.add.zone(dropZoneX, dropZoneY, dropZoneWidth, dropZoneHeight).setRectangleDropZone(dropZoneWidth, dropZoneHeight);

    // Add graphics for drop zone highlight
    this.dropZoneGraphics = this.add.graphics({ x: dropZoneX, y: dropZoneY });
    
    // Create the main bowl - DIHAPUS AGAR TIDAK SPAWN DI AWAL
    // this.mangkuk = this.add.image(mangkukX, mangkukY, "Mangkuk").setScale(this.layoutConfig.bowlScale);
  }

  private createStagingArea() {
    // Create staging area container
    this.stagingArea = this.add.container(
      this.layoutConfig.cookingAreaLeft + this.layoutConfig.stagingAreaX,
      this.layoutConfig.cookingAreaTop + this.layoutConfig.stagingAreaY
    );

    // --> MEMBUAT STAGING AREA MENJADI DROP ZONE
    this.flourDropZone = this.add.zone(0, 0, this.layoutConfig.stagingAreaWidth, this.layoutConfig.stagingAreaHeight).setRectangleDropZone(this.layoutConfig.stagingAreaWidth, this.layoutConfig.stagingAreaHeight);
    this.stagingArea.add(this.flourDropZone);

    // Visual indicator for staging area
    this.stagingAreaGraphics = this.add.graphics();
    this.stagingAreaGraphics.fillStyle(0x2A1810, 0.95);
    this.stagingAreaGraphics.fillRoundedRect(
      -this.layoutConfig.stagingAreaWidth/2,
      -this.layoutConfig.stagingAreaHeight/2,
      this.layoutConfig.stagingAreaWidth,
      this.layoutConfig.stagingAreaHeight,
      20
    );
    this.stagingAreaGraphics.lineStyle(2, 0x8B4513, 0.8);
    this.stagingAreaGraphics.strokeRoundedRect(
      -this.layoutConfig.stagingAreaWidth/2,
      -this.layoutConfig.stagingAreaHeight/2,
      this.layoutConfig.stagingAreaWidth,
      this.layoutConfig.stagingAreaHeight,
      20
    );
    this.stagingArea.add(this.stagingAreaGraphics);
    
    const stagingLabel = this.add.text(0, 0, "Area Persiapan", {
      fontSize: '24px',
      fontFamily: 'Chewy, cursive',
      color: '#FFE4B5',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.stagingArea.add(stagingLabel);
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
  { key: "Mangkuk", name: "Mangko", scale: 0.15 },
  { key: "Mangkuk", name: "Mangko", scale: 0.15 },
  { key: "SaguManta", name: "Sagu Manta", scale: 0.12 },
  { key: "Water", name: "Aer 200ml", scale: 0.2 },
  { key: "Spoon", name: "Sendok", scale: 0.15 },
  { key: "Saring", name: "Saringan", scale: 0.15 },
  { key: "Air100ml", name: "Aer 100ml", scale: 0.12 },
  { key: "Nipis", name: "Jeruk Nipis", scale: 0.2 },
  { key: "AirPanas", name: "Aer Panas", scale: 0.12 },
  { key: "SebelumPapeda", name: "Ikan Kuah Kuning", scale: 0.08 },
];


    // --- PENGATURAN LAYOUT GRID ---
    const itemsPerRow = 2;
    const horizontalPadding = 40; // Jarak total dari tepi kiri & kanan panel
    const verticalPadding = 20;   // Jarak total dari tepi atas & bawah (di bawah judul)

    // --- Perhitungan Otomatis ---
    const panelWidth = this.layoutConfig.ingredientsPanelWidth;
    const panelHeight = this.layoutConfig.ingredientsPanelHeight;
    const titleAreaHeight = 80; // Area untuk judul "ALAT DAN BAHAN"

    // Perhitungan Horizontal
    const availableWidth = panelWidth - horizontalPadding;
    const spacingX = availableWidth / itemsPerRow;
    const startX = (horizontalPadding / 2) + (spacingX / 2);

    // Perhitungan Vertikal
    const numRows = Math.ceil(ingredients.length / itemsPerRow);
    const availableHeight = panelHeight - titleAreaHeight - verticalPadding;
    const spacingY = availableHeight / numRows;
    const startY = titleAreaHeight + (verticalPadding / 2) + (spacingY / 2);

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

  // NOTE: createDialogPanel removed - using React dialog system only

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
    this.setupMenuToggleEvents();
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

  private setupMenuToggleEvents() {
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

  // NOTE: updateStepDisplay removed - using React dialog system only

  private nextStep() {
    if (this.gameSteps[this.currentStep].isCompleted) return;

    this.gameSteps[this.currentStep].isCompleted = true;
    this.cameras.main.flash(100, 255, 255, 255, false);

    if (this.currentStep < this.gameSteps.length - 1) {
      this.currentStep++;
      // Dialog functionality removed
    }
  }

  private handleStirring() {
    if (this.currentStep !== 2 || !this.isWaterAdded || !this.mangkuk) return;

    if (this.mangkuk) {
      this.mangkuk.off('pointerdown', this.handleStirring, this);
    }

    // Mainkan animasi aduk
    const stirAnim = this.add.sprite(this.mangkuk.x, this.mangkuk.y, 'PapedaAduk1').setScale(0.5);
    this.mangkuk.setVisible(false);

    this.anims.create({
        key: 'stir_anim',
        frames: [
            { key: 'PapedaAduk1' },
            { key: 'PapedaAduk2' },
        ],
        frameRate: 3,
        repeat: 2
    });

    stirAnim.play('stir_anim');
    stirAnim.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        stirAnim.destroy();
        this.mangkuk!.setTexture('HasilAduk1').setVisible(true);
        this.nextStep();
    });
  }

  private initDragAndDrop() {
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      this.children.bringToTop(gameObject);
      gameObject.setData('dragStartX', gameObject.x);
      gameObject.setData('dragStartY', gameObject.y);
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
      if (!dropped) {
        gameObject.x = gameObject.getData('dragStartX');
        gameObject.y = gameObject.getData('dragStartY');
      }
      // Clear all highlights
      this.clearDropZoneHighlight();
      this.clearStagingAreaHighlight();
    });

    this.input.on('dragenter', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
        if (dropZone === this.dropZone) {
            this.highlightDropZone();
        } else if (dropZone === this.flourDropZone) {
            // Visual feedback for staging area
            this.highlightStagingArea();
        }
    });

    this.input.on('dragleave', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
        if (dropZone === this.dropZone) {
            this.clearDropZoneHighlight();
        } else if (dropZone === this.flourDropZone) {
            this.clearStagingAreaHighlight();
        }
    });

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedItemKey = gameObject.name;
      this.clearDropZoneHighlight();

      // STEP 1 & 2 Combined: Letakkan mangkuk dan tuang tepung
      if (this.currentStep === 0) {
        // Action 1: Place the bowl
        if (droppedItemKey === 'Mangkuk' && dropZone === this.dropZone && !this.isBowlPlaced) {
          const gameHeight = this.cameras.main.height;
          const fixedBowlX = 650;
          const fixedBowlY = gameHeight - 280;
          
          const fixedBowl = this.add.image(fixedBowlX, fixedBowlY, 'Mangkuk')
            .setScale(0.6)
            .setDepth(10)
            .setData('isFixed', true);
          
          gameObject.destroy();
          this.mangkuk = fixedBowl;
          this.isBowlPlaced = true;
          
          this.showPlacementSuccess(fixedBowl.x, fixedBowl.y, "Mangkuk Ditempatkan!");

        // Action 2: Drop flour into the bowl
        } else if (droppedItemKey === 'SaguManta' && dropZone === this.dropZone && this.isBowlPlaced) {
          this.executeSuccessfulDrop(gameObject, () => {
            if (this.mangkuk) {
              this.mangkuk.setTexture('DenganTepung');
              this.nextStep(); // Flour is in, advance to next step
            }
          });

        } else {
          this.executeInvalidDrop(gameObject);
        }
        return;
      }

      // STEP 3: Tuang air 200ml ke mangkuk
      if (this.currentStep === 1) {
        if (droppedItemKey === 'Water' && dropZone === this.dropZone) {
            this.executeSuccessfulDrop(gameObject, () => {
                // Hide DenganTepung during animation
                this.mangkuk.setVisible(false);
                
                // Center animation on the bowl
                const gameHeight = this.cameras.main.height;
                const centerX = 650;
                const centerY = gameHeight - 350;
                const pourWaterAnim = this.add.sprite(centerX, centerY, 'Air200ml1').setScale(0.6);
                
                this.anims.create({
                    key: 'pour_water_anim',
                    frames: [
                        { key: 'Air200ml1' },
                        { key: 'Air200ml2' },
                        { key: 'Air200ml3' },
                    ],
                    frameRate: 0.43, // 7 seconds total
                });
                
                pourWaterAnim.play('pour_water_anim');
                
                // Complete after 7 seconds
                this.time.delayedCall(7000, () => {
                    pourWaterAnim.destroy();
                    this.mangkuk.setVisible(true);
                    this.mangkuk.setTexture('HasilAduk1').setScale(0.6);
                    this.isWaterAdded = true;
                    this.nextStep();
                });
            });
        } else {
          this.executeInvalidDrop(gameObject);
        }
        return;
      }

      // STEP 3: Dialog 3 - Spoon drop and stirring mechanism (after water poured)
      if (this.currentStep === 2) {
        if (droppedItemKey === 'Spoon' && dropZone === this.dropZone) {
          // Check if bowl texture is HasilAduk1 (after water was added)
          if (this.mangkuk && this.mangkuk.texture && this.mangkuk.texture.key === 'HasilAduk1') {
            // Keep spoon instance for returning to its original place later
            this.spoonItem = gameObject;
            this.executeSuccessfulDropKeepItem(gameObject, () => {
              // Change bowl texture to show spoon dropped on HasilAduk1
              this.mangkuk!.setTexture('Aduk3');
              this.mangkuk!.setScale(0.6);
              // Make bowl fixed in position - remove from draggable objects
              this.mangkuk!.setData('isFixed', true);
              // Start interactive stirring mechanism
              this.startInteractiveStirring();
            });
          } else {
            this.executeInvalidDrop(gameObject);
          }
        } else {
          this.executeInvalidDrop(gameObject);
        }
        return;
      }

      // STEP 4: Dialog 4 - Bowl placement, strainer, and pouring
      if (this.currentStep === 3) {
        // Place second bowl directly in CookingArea (any drop zone)
        if (droppedItemKey === 'Mangkuk' && (dropZone === this.dropZone || dropZone === this.flourDropZone)) {
          // Fixed position for second bowl (much further right from DenganTepung)
          const gameHeight = this.cameras.main.height;
          const secondBowlX = 1200; // Much further right to prevent overlap
          const secondBowlY = gameHeight - 300; // 280px dari dasar halaman
          
          const fixedSecondBowl = this.add.image(secondBowlX, secondBowlY, 'Mangkuk')
            .setScale(0.6)
            .setDepth(10)
            .setData('isFixed', true);
          
          gameObject.destroy();
          this.secondBowl = fixedSecondBowl;
          this.showPlacementSuccess(fixedSecondBowl.x, fixedSecondBowl.y, "Mangkuk Kedua Ditempatkan!");
          return;
        }
        
        // Place strainer on second bowl - check distance from any dropped position
        if (droppedItemKey === 'Saring') {
          // Check if second bowl exists and calculate distance
          if (this.secondBowl) {
            const distance = Phaser.Math.Distance.Between(
              gameObject.x, gameObject.y,
              this.secondBowl.x, this.secondBowl.y
            );
            
            // Allow drop if within reasonable distance OR if dropped in cooking area
            if (distance < 150 || dropZone === this.dropZone) {
              this.executeSuccessfulDrop(gameObject, () => {
                // Change second bowl to show strainer placed on it
                this.secondBowl!.setTexture('SaringKosong1');
                // Set explicit position for SaringKosong1
                const saringX = 1200;
                const saringY = this.cameras.main.height - 500;
                this.secondBowl!.setPosition(saringX, saringY);
                this.secondBowl!.setData('isFixed', true);
                this.strainerBowl = this.secondBowl;
                
                // Create invisible hitbox zone for the strainer bowl
                this.strainerDropZone = this.add.zone(this.secondBowl!.x, this.secondBowl!.y, 150, 150)
                  .setRectangleDropZone(150, 150)
                  .setName('StrainerZone');
                
                this.showPlacementSuccess(this.secondBowl!.x, this.secondBowl!.y, "Saringan Ditempatkan!");
              });
              return;
            }
          }
        }
        
        // Pour mixed flour (DenganTepung) onto strainer
        if (droppedItemKey === 'DenganTepung' && this.strainerBowl) {
          // Check if dropped on strainer zone, cooking area, or within distance
          const distance = Phaser.Math.Distance.Between(
            gameObject.x, gameObject.y,
            this.strainerBowl.x, this.strainerBowl.y
          );
          
          // Allow drop if on strainer zone, cooking area, or within distance
          if (dropZone === this.strainerDropZone || dropZone === this.dropZone || distance < 200) {
            this.executeSuccessfulDrop(gameObject, () => {
              // Change to SaringKosong2 and start 6-second animation
              this.strainerBowl!.setTexture('SaringKosong2');
              this.strainerBowl!.setData('isFixed', true);
              this.startStrainerAnimation();
            });
            return;
          }
        }
        
        this.executeInvalidDrop(gameObject);
        return;
      }

      // STEP 5: Dialog 5 - Move TepungBuangAir to staging area
      if (this.currentStep === 4) {
        if (droppedItemKey === 'TepungBuangAir' && dropZone === this.flourDropZone) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.startStagingAreaProcess();
          });
        } else {
          this.executeInvalidDrop(gameObject);
        }
        return;
      }

      // STEP 6: Dialog 6 - Air 100ml to Keras
      if (this.currentStep === 5) {
        if ((droppedItemKey === 'Air100ml' || droppedItemKey === 'Air-100-ml') && this.kerasItem) {
          const distance = Phaser.Math.Distance.Between(
            gameObject.x, gameObject.y,
            this.kerasItem.x, this.kerasItem.y
          );
          
          if (distance < 150 || dropZone === this.dropZone) {
            this.executeSuccessfulDrop(gameObject, () => {
              this.startAir100mlAnimation();
            });
            return;
          }
        }
        
        if (droppedItemKey === 'Spoon' && this.kerasItem && this.kerasItem.texture.key === 'HasilAduk2') {
          // Keep spoon instance for returning to its original place later
          this.spoonItem = gameObject;
          this.executeSuccessfulDropKeepItem(gameObject, () => {
            this.kerasItem!.setTexture('Aduk3');
            // Make kerasItem fixed in position - remove from draggable objects
            this.kerasItem!.setData('isFixed', true);
            // Start interactive stirring mechanism
            this.startStep7Stirring();
          });
          return;
        }
        
        this.executeInvalidDrop(gameObject);
        return;
      }

      // STEP 7: Dialog 7 - Nipis to Keras2
      if (this.currentStep === 6) {
        if (droppedItemKey === 'Nipis' && this.kerasItem && this.kerasItem.texture.key === 'Keras2') {
          this.executeSuccessfulDrop(gameObject, () => {
            this.kerasItem!.setTexture('JerukDiatas').setScale(0.7);
            this.startJerukClickingSystem();
          });
          return;
        }
        
        this.executeInvalidDrop(gameObject);
        return;
      }

      // STEP 8: Dialog 8 - Spoon to AdonanJeruk
      if (this.currentStep === 7) {
        if (droppedItemKey === 'Spoon' && this.kerasItem && this.kerasItem.texture.key === 'AdonanJeruk') {
          // Keep spoon instance for returning to its original place later
          this.spoonItem = gameObject;
          this.executeSuccessfulDropKeepItem(gameObject, () => {
            this.kerasItem!.setTexture('AdukJeruk1').setScale(0.5);
            // Make kerasItem fixed in position - remove from draggable objects
            this.kerasItem!.setData('isFixed', true);
            // Start interactive stirring mechanism
            this.startStep9Stirring();
          });
          return;
        }
        
        this.executeInvalidDrop(gameObject);
        return;
      }

      // STEP 9: Dialog 9 - AirPanas to Keras
      if (this.currentStep === 8) {
        if (droppedItemKey === 'AirPanas' && this.kerasItem && this.kerasItem.texture.key === 'Keras') {
          this.executeSuccessfulDrop(gameObject, () => {
            this.startAirPanasAnimation();
          });
          return;
        }
        
        this.executeInvalidDrop(gameObject);
        return;
      }

      // STEP 10: Dialog 10 - Spoon to Tambahan-Air-Panas
      if (this.currentStep === 9) {
        if (droppedItemKey === 'Spoon' && this.kerasItem && this.kerasItem.texture.key === 'Tambahan-Air-Panas') {
          // Keep spoon instance for returning to its original place later
          this.spoonItem = gameObject;
          this.executeSuccessfulDropKeepItem(gameObject, () => {
            this.kerasItem!.setTexture('Aduk3');
            // Make kerasItem fixed in position - remove from draggable objects
            this.kerasItem!.setData('isFixed', true);
            // Start interactive stirring mechanism
            this.startStep11Stirring();
          });
          return;
        }
        
        this.executeInvalidDrop(gameObject);
        return;
      }

      // STEP 11: Dialog 11 - Final assembly
      if (this.currentStep === 10) {
        // First, place SebelumPapeda in staging area
        if (droppedItemKey === 'SebelumPapeda' && dropZone === this.flourDropZone) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.placeSebelumPapedaInStaging();
          });
          return;
        }
        
        // Then, allow SebelumPapeda to be dragged from staging area and dropped on Hasil-Jadi in cooking area
        if (droppedItemKey === 'SebelumPapeda' && this.kerasItem && this.kerasItem.texture.key === 'Hasil-Jadi') {
          // Check if dropped in cooking area (dropZone) OR directly on Hasil-Jadi
          if (dropZone === this.dropZone) {
            this.executeSuccessfulDrop(gameObject, () => {
              this.completeFinalAssembly();
            });
            return;
          }
          
          // Also check distance for direct drop on Hasil-Jadi
          const distance = Phaser.Math.Distance.Between(
            gameObject.x, gameObject.y,
            this.kerasItem.x, this.kerasItem.y
          );
          
          if (distance < 150) {
            this.executeSuccessfulDrop(gameObject, () => {
              this.completeFinalAssembly();
            });
            return;
          }
        }
        
        this.executeInvalidDrop(gameObject);
        return;
      }

      this.executeInvalidDrop(gameObject);
    });
  }

  // Helper methods
  private executeSuccessfulDrop(gameObject: Phaser.GameObjects.Image, callback: () => void) {
    this.tweens.add({
      targets: gameObject,
      alpha: 0,
      scale: 0,
      duration: 400,
      ease: 'Power2.easeOut',
      onComplete: () => {
        gameObject.destroy();
        callback();
      }
    });
  }

  // Variant of successful drop that KEEPS the item (not destroy), hides it during action
  private executeSuccessfulDropKeepItem(gameObject: Phaser.GameObjects.Image, callback: () => void) {
    // Store drag start positions if missing
    if (gameObject.getData('dragStartX') === undefined) {
      gameObject.setData('dragStartX', gameObject.x);
      gameObject.setData('dragStartY', gameObject.y);
    }
    this.tweens.add({
      targets: gameObject,
      alpha: 0,
      scale: gameObject.scale * 0.8,
      duration: 300,
      ease: 'Power2.easeOut',
      onComplete: () => {
        gameObject.setVisible(false);
        callback();
      }
    });
  }

  private executeStirringAnimation(spatula: Phaser.GameObjects.Image | null, texture1: string, texture2: string, finalTexture: string, callback: () => void) {
    if (spatula) {
      // Return spatula to original position
      this.tweens.add({
        targets: spatula,
        x: spatula.getData('dragStartX'),
        y: spatula.getData('dragStartY'),
        duration: 300,
        ease: 'Back.easeOut'
      });
    }
    
    let isTexture1 = true;
    this.stirringTimer = this.time.addEvent({
      delay: 250,
      callback: () => {
        if (isTexture1) {
          this.mangkuk.setTexture(texture2);
          this.mangkuk.setScale(this.layoutConfig.bowlScale);
        } else {
          this.mangkuk.setTexture(texture1);
          this.mangkuk.setScale(this.layoutConfig.bowlScale);
        }
        isTexture1 = !isTexture1;
        
        this.createSteamEffect(this.mangkuk.x, this.mangkuk.y - 50);
      },
      loop: true
    });

    this.time.delayedCall(2000, () => {
      if (this.stirringTimer) {
        this.stirringTimer.destroy();
        this.stirringTimer = null;
      }
      this.mangkuk.setTexture(finalTexture);
      this.mangkuk.setScale(this.layoutConfig.bowlScale);
      callback();
    });
  }

  private executeInvalidDrop(gameObject: Phaser.GameObjects.Image) {
    this.tweens.add({
      targets: gameObject,
      x: gameObject.getData('dragStartX'),
      y: gameObject.getData('dragStartY'),
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    this.cameras.main.shake(150, 0.008);
    
    const errorText = this.add.text(gameObject.x, gameObject.y - 50, "✗", {
      fontSize: '24px',
      color: '#FF6B6B'
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

  private createSteamEffect(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const particle = this.add.circle(
        x + (Math.random() - 0.5) * 30,
        y,
        2 + Math.random() * 3,
        0xFFFFFF,
        0.6
      );
      
      this.tweens.add({
        targets: particle,
        y: particle.y - 40,
        x: particle.x + (Math.random() - 0.5) * 20,
        alpha: 0,
        scale: 1.5,
        duration: 1000 + Math.random() * 500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  private showSuccessFeedback() {
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

  private showCompletionCelebration() {
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

  private highlightStagingArea() {
    if (this.stagingAreaGraphics) {
      this.stagingAreaGraphics.clear();
      this.stagingAreaGraphics.fillStyle(0x00FF00, 0.3);
      this.stagingAreaGraphics.fillRoundedRect(
        -this.layoutConfig.stagingAreaWidth/2,
        -this.layoutConfig.stagingAreaHeight/2,
        this.layoutConfig.stagingAreaWidth,
        this.layoutConfig.stagingAreaHeight,
        20
      );
      this.stagingAreaGraphics.lineStyle(3, 0x00FF00, 0.8);
      this.stagingAreaGraphics.strokeRoundedRect(
        -this.layoutConfig.stagingAreaWidth/2,
        -this.layoutConfig.stagingAreaHeight/2,
        this.layoutConfig.stagingAreaWidth,
        this.layoutConfig.stagingAreaHeight,
        20
      );
    }
  }

  private clearStagingAreaHighlight() {
    if (this.stagingAreaGraphics) {
      this.stagingAreaGraphics.clear();
      this.stagingAreaGraphics.fillStyle(0x2A1810, 0.95);
      this.stagingAreaGraphics.fillRoundedRect(
        -this.layoutConfig.stagingAreaWidth/2,
        -this.layoutConfig.stagingAreaHeight/2,
        this.layoutConfig.stagingAreaWidth,
        this.layoutConfig.stagingAreaHeight,
        20
      );
      this.stagingAreaGraphics.lineStyle(2, 0x8B4513, 0.8);
      this.stagingAreaGraphics.strokeRoundedRect(
        -this.layoutConfig.stagingAreaWidth/2,
        -this.layoutConfig.stagingAreaHeight/2,
        this.layoutConfig.stagingAreaWidth,
        this.layoutConfig.stagingAreaHeight,
        20
      );
    }
  }

  private highlightDropZone() {
    if (this.dropZoneGraphics) {
      const dropZoneWidth = 600;
      const dropZoneHeight = 400;
      this.dropZoneGraphics.clear();
      this.dropZoneGraphics.fillStyle(0x00FF00, 0.25);
      this.dropZoneGraphics.fillRoundedRect(-dropZoneWidth / 2, -dropZoneHeight / 2, dropZoneWidth, dropZoneHeight, 20);
      this.dropZoneGraphics.lineStyle(2, 0x00FF00, 0.7);
      this.dropZoneGraphics.strokeRoundedRect(-dropZoneWidth / 2, -dropZoneHeight / 2, dropZoneWidth, dropZoneHeight, 20);
    }
  }

  private clearDropZoneHighlight() {
    if (this.dropZoneGraphics) {
      this.dropZoneGraphics.clear();
    }
  }

  private showPlacementSuccess(x: number, y: number, message: string) {
    // Create success text
    const successText = this.add.text(x, y - 60, message, {
      fontSize: '20px',
      fontFamily: 'Chewy, cursive',
      color: '#00FF00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    // Create success checkmark
    const checkmark = this.add.text(x, y - 80, "✓", {
      fontSize: '24px',
      color: '#00FF00'
    }).setOrigin(0.5).setDepth(100);
    
    // Animate success feedback
    this.tweens.add({
      targets: [successText, checkmark],
      y: "-=30",
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        successText.destroy();
        checkmark.destroy();
      }
    });
    
    // Add placement effect
    const placementEffect = this.add.circle(x, y, 5, 0x00FF00, 0.6).setDepth(99);
    this.tweens.add({
      targets: placementEffect,
      radius: 30,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => placementEffect.destroy()
    });
  }

  // Dialog 4: Interactive stirring mechanism with tap-based interactions
  private startInteractiveStirring() {
    this.isStirring = true;
    this.stirCount = 0;
    this.currentStirTexture = 'Aduk3';
    
    // Add tap instruction text
    const instructionText = this.add.text(this.mangkuk.x, this.mangkuk.y - 100, 
      `Tap untuk mengaduk! (${this.stirCount}/${this.maxStirCount})`, {
      fontSize: '20px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    // Make bowl interactive for tap-based stirring
    this.mangkuk.setInteractive();
    this.mangkuk.on('pointerdown', this.onTapStir, this);
    
    // Store instruction text for updates
    this.mangkuk.setData('instructionText', instructionText);

  }

  // Tap-based handler for bowl stirring (Dialog 4)
  private onTapStir() {
    if (!this.isStirring || this.stirCount >= this.maxStirCount) return;
    this.handleStirSwipe();
  }

  private handleStirSwipe() {
    this.stirCount++;
    const instructionText = this.mangkuk.getData('instructionText') as Phaser.GameObjects.Text;
    
    // Update instruction text
    if (instructionText) {
      instructionText.setText(`Tap untuk mengaduk! (${this.stirCount}/${this.maxStirCount})`);
    }
    
    // Cycle through stirring textures: Aduk3 -> Aduk4 -> Aduk5 -> Aduk4 -> repeat
    if (this.currentStirTexture === 'Aduk3') {
      this.mangkuk.setTexture('Aduk4');
      this.currentStirTexture = 'Aduk4';
    } else if (this.currentStirTexture === 'Aduk4') {
      this.mangkuk.setTexture('Aduk5');
      this.currentStirTexture = 'Aduk5';
    } else if (this.currentStirTexture === 'Aduk5') {
      this.mangkuk.setTexture('Aduk4');
      this.currentStirTexture = 'Aduk4';
    }
    this.mangkuk.setScale(0.6);
  
    // Visual feedback for stirring motion
    this.tweens.add({
      targets: this.mangkuk,
      scaleX: 0.6 * 1.08,
      scaleY: 0.6 * 1.08,
      duration: 120,
      yoyo: true,
      ease: 'Power2'
    });
    
    // Check if 15 stirs completed
    if (this.stirCount >= this.maxStirCount) {
      this.completeStirringProcess(instructionText);
    }
  }

  private completeStirringProcess(instructionText: Phaser.GameObjects.Text) {
    this.isStirring = false;
    
    // Remove instruction text
    if (instructionText) {
      instructionText.destroy();
    }
    
    // Return the spoon to its original position
    if (this.spoonItem) {
      this.returnSpoonToDragStart();
    }
    
    // Change to final mixed texture - DenganTepung.png
    this.mangkuk.setTexture('DenganTepung').setScale(0.6);
    this.mangkuk.setName('DenganTepung');
    
    // Keep it fixed in CookingArea but make it draggable for next step
    this.mangkuk.setData('isFixed', false); // Allow dragging for strainer step
    
    // Remove old event listeners first
    this.mangkuk.off('pointerdown');
    this.mangkuk.off('pointermove');
    this.mangkuk.off('pointerup');
    
    // Make it properly draggable using the input system
    this.mangkuk.setInteractive({ draggable: true });
    this.input.setDraggable(this.mangkuk!);
    
    // Return spoon back to its original drag position
    this.returnSpoonToDragStart();
    
    // Show completion feedback
    this.showPlacementSuccess(this.mangkuk.x, this.mangkuk.y, "15x Adukan Selesai!");
    
    // Move to Dialog 5
    this.nextStep();
  }

  // Tween the kept spoon back to its drag start position
  private returnSpoonToDragStart() {
    if (this.spoonItem) {
      const targetX = this.spoonItem.getData('dragStartX') ?? this.spoonItem.x;
      const targetY = this.spoonItem.getData('dragStartY') ?? this.spoonItem.y;
      this.spoonItem.setVisible(true);
      this.tweens.add({
        targets: this.spoonItem,
        x: targetX,
        y: targetY,
        alpha: 1,
        scale: 0.15,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Clear reference
          this.spoonItem = null;
        }
      });
    }
  }

  private returnSpoonToPanel() {
    if (this.spoonItem) {
      const originalX = this.spoonItem.getData('dragStartX');
      const originalY = this.spoonItem.getData('dragStartY');

      this.spoonItem.setVisible(true);
      this.tweens.add({
        targets: this.spoonItem,
        x: originalX,
        y: originalY,
        alpha: 1,
        scale: 0.15, // Reset scale to original
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.spoonItem = null;
        }
      });
    }
  }
  
  // Dialog 5: Complete strainer system - 6 second single-run animation
  private startStrainerAnimation() {
    // Single-run animation: SaringKosong2 -> Saring1 -> Saring2 (6 seconds total)
    
    // Start with SaringKosong2 (already set when called)
    
    // After 2 seconds, change to Saring1
    this.time.delayedCall(2000, () => {
      if (this.strainerBowl) {
        this.strainerBowl.setTexture('Saring1');
      }
    });
    
    // After 4 seconds, change to Saring2
    this.time.delayedCall(4000, () => {
      if (this.strainerBowl) {
        this.strainerBowl.setTexture('Saring2');
      }
    });
    
    // After 6 seconds, change to final texture
    this.time.delayedCall(6000, () => {
      if (this.strainerBowl) {
        // Change to final strained texture and set position
        this.strainerBowl.setTexture('TepungSaring');
        this.strainerBowl.setPosition(650, this.cameras.main.height - 280);
        this.strainerBowl.setName('TepungSaring');
        this.strainerBowl.setData('isFixed', true);
        
        // Show completion and automatically start Dialog 6 countdown
        this.showPlacementSuccess(650, this.cameras.main.height - 280, "Penyaringan Selesai!");
        this.nextStep();
        
        // Automatically start 12-second countdown for Dialog 6
        this.time.delayedCall(1000, () => {
          this.startStep6CountdownSystem();
        });
      }
    });
  }
  
  // Dialog 6: Complete countdown and staging system
  private startStep6CountdownSystem() {
    const gameHeight = this.cameras.main.height;

    // Move the strainer bowl to the correct position for the countdown
    if (this.strainerBowl) {
      this.strainerBowl.setPosition(650, gameHeight - 280);
    }

    // Automatic 12-second countdown for drying process
    let countdown = 12;
    this.countdownText = this.add.text(650, (gameHeight - 280) - 80, 
      `Menunggu adonan mengering... ${countdown}s`, {
      fontSize: '18px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        if (this.countdownText) {
          this.countdownText.setText(`Menunggu adonan mengering... ${countdown}s`);
        }
        
        if (countdown <= 0) {
          this.completeCountdownAndEnableDragging();
        }
      },
      repeat: 11
    });
  }
  
  private completeCountdownAndEnableDragging() {
    // Remove countdown text
    if (this.countdownText) {
      this.countdownText.destroy();
    }
    
    // Change texture to TepungBuangAir after 12 seconds
    if (this.strainerBowl) {
      this.strainerBowl.setTexture('TepungBuangAir');
      this.strainerBowl.setName('TepungBuangAir');
      
      // Make it draggable to staging area
      this.strainerBowl.setInteractive({ draggable: true });
      
      // Show drag instruction
      const instructionText = this.add.text(this.strainerBowl.x, this.strainerBowl.y - 60, 
        "Tarik ke Area Persiapan!", {
        fontSize: '16px',
        fontFamily: 'Chewy, cursive',
        color: '#00FF00',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(100);
      
      this.time.delayedCall(3000, () => instructionText.destroy());
    }
  }
  
  private startStagingAreaProcess() {
    // Place TepungBuangAir in staging area for 8 seconds
    const stagedItem = this.add.image(this.stagingArea.x, this.stagingArea.y, 'TepungBuangAir')
      .setScale(0.2)
      .setDepth(10);
    
    // 8-second staging timer for water removal
    let stagingCountdown = 8;
    const stagingText = this.add.text(this.stagingArea.x, this.stagingArea.y - 60, 
      `Membuang air sisa... ${stagingCountdown}s`, {
      fontSize: '16px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.stagingTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        stagingCountdown--;
        stagingText.setText(`Membuang air sisa... ${stagingCountdown}s`);
        
        if (stagingCountdown <= 0) {
          this.completeStagingAndReturnToCookingArea(stagedItem, stagingText);
        }
      },
      repeat: 7
    });
  }
  
  private completeStagingAndReturnToCookingArea(stagedItem: Phaser.GameObjects.Image, stagingText: Phaser.GameObjects.Text) {
    // Remove staging text and staged item
    stagingText.destroy();
    stagedItem.destroy();
    
    // Auto-return to cooking area as Keras.png - fixed position
    const gameHeight = this.cameras.main.height;
    const fixedKerasX = 950;
    const fixedKerasY = gameHeight - 400;
    
    this.kerasItem = this.add.image(fixedKerasX, fixedKerasY, 'Keras')
      .setScale(0.6)
      .setDepth(10)
      .setData('isFixed', true)
      .setName('Keras');
    
    // Show completion feedback
    this.showPlacementSuccess(this.kerasItem.x, this.kerasItem.y, "Air Berhasil Dibuang! Keras Siap!");
    
    // Complete Dialog 6 and move to Dialog 7
    this.nextStep();
  }

  private showCompletionDialog() {
    // Geser piring papeda agar tidak tertumpuk popup
    if (this.finalPlate) {
      this.tweens.add({
        targets: this.finalPlate,
        y: this.cameras.main.height - 150, // Bergerak ke area bawah
        x: 250,                            // Bergerak ke area kiri
        scale: 0.3,                        // Sedikit diperkecil
        duration: 600,
        ease: 'Power2'
      });
    }

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
    
    const completionText = this.add.text(centerX, centerY, "Papeda Berhasil Dibuat!", {
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

  update() {
    // Update method can be used for any per-frame logic if needed
  }

  // NOTE: Hint system removed - now handled by React components in KitchenBackgroundWrapper

  // Step 7: Air 100ml animation and stirring
  private startAir100mlAnimation() {
    if (!this.kerasItem) return;
    
    // Hide keras during animation
    this.kerasItem.setVisible(false);
    
    // Center animation in CookingArea
    const gameHeight = this.cameras.main.height;
    const centerX = this.kerasItem.x;
    const centerY = gameHeight - 400;
    const pourAnim = this.add.sprite(centerX, centerY, 'Air100ml1').setScale(0.6);
    
    this.anims.create({
      key: 'pour_air100ml_anim',
      frames: [
        { key: 'Air100ml1' },
        { key: 'Air100ml2' },
        { key: 'Air100ml1' },
        { key: 'Air100ml2' }
      ],
      frameRate: 0.67, // 6 seconds total (4 frames / 0.67 = ~6s)
    });
    
    pourAnim.play('pour_air100ml_anim');
    
    // Complete after 6 seconds
    this.time.delayedCall(6000, () => {
      pourAnim.destroy();
      this.kerasItem!.setVisible(true);
      this.kerasItem!.setTexture('HasilAduk2').setScale(0.6);
    });
  }

  private startStep7Stirring() {
    this.isStirring = true;
    this.stirCount = 0;
    this.maxStirCount = 15;
    this.currentStirTexture = 'Aduk3';
    
    // Add tap instruction text
    const instructionText = this.add.text(this.kerasItem!.x, this.kerasItem!.y - 100, 
      `Tap untuk mengaduk! (${this.stirCount}/${this.maxStirCount})`, {
      fontSize: '20px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    // Make keras interactive for tap-based stirring
    this.kerasItem!.setInteractive();
    this.kerasItem!.on('pointerdown', this.onStep7TapStir, this);
    
    // Store instruction text for updates
    this.kerasItem!.setData('instructionText', instructionText);
    
    // Ensure fixed larger scale during Step 7 stirring
    this.kerasItem!.setScale(0.6);
  }

  private onStep7TapStir() {
    if (!this.isStirring || this.stirCount >= this.maxStirCount) return;
    this.handleStep7StirSwipe();
  }

  private handleStep7StirSwipe() {
    this.stirCount++;
    const instructionText = this.kerasItem!.getData('instructionText') as Phaser.GameObjects.Text;
    
    if (instructionText) {
      instructionText.setText(`Tap untuk mengaduk! (${this.stirCount}/${this.maxStirCount})`);
    }
    
    // Cycle through stirring textures: PapedaAduk1 -> PapedaAduk2
    if (this.currentStirTexture === 'Aduk3' || this.currentStirTexture === 'PapedaAduk2') {
      this.kerasItem!.setTexture('PapedaAduk1');
      this.currentStirTexture = 'PapedaAduk1';
    } else {
      this.kerasItem!.setTexture('PapedaAduk2');
      this.currentStirTexture = 'PapedaAduk2';
    }
    
    // Visual feedback
    this.tweens.add({
      targets: this.kerasItem,
      scaleX: 0.6 * 1.08,
      scaleY: 0.6 * 1.08,
      duration: 120,
      yoyo: true,
      ease: 'Power2'
    });
    
    if (this.stirCount >= this.maxStirCount) {
      this.completeStep7Stirring(instructionText);
    }
  }

  private completeStep7Stirring(instructionText: Phaser.GameObjects.Text) {
    this.isStirring = false;
    
    if (instructionText) {
      instructionText.destroy();
    }
    
    // Change to Keras2
    this.kerasItem!.setTexture('Keras2').setScale(0.6);
    
    // Remove event listeners
    this.kerasItem!.off('pointerdown');
    this.kerasItem!.off('pointermove');
    this.kerasItem!.off('pointerup');
    
    console.log("spoonItem before returnSpoonToDragStart in completeStep7Stirring", this.spoonItem);
    // Return spoon back to its original drag position
    this.returnSpoonToDragStart();
    
    this.showPlacementSuccess(this.kerasItem!.x, this.kerasItem!.y, "15x Adukan Selesai!");
    this.nextStep();
  }

  // Step 8: Jeruk clicking system
  private startJerukClickingSystem() {
    this.jerukClickCount = 0;
    this.currentJerukStage = 0;
    
    // Add instruction text
    const instructionText = this.add.text(this.kerasItem!.x, this.kerasItem!.y - 100, 
      'Klik 3 kali pada jeruk untuk memeras!', {
      fontSize: '20px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    // Make keras interactive for clicking
    this.kerasItem!.setInteractive();
    this.kerasItem!.on('pointerdown', this.onJerukClick, this);
    
    this.kerasItem!.setData('instructionText', instructionText);
  }

  private onJerukClick() {
    this.jerukClickCount++;
    
    // Visual feedback
    this.tweens.add({
      targets: this.kerasItem,
      scaleX: 0.6 * 1.1,
      scaleY: 0.6 * 1.1,
      duration: 100,
      yoyo: true
    });
    
    // Show click count
    const clickText = this.add.text(this.kerasItem!.x, this.kerasItem!.y - 50, `${this.jerukClickCount}/3`, {
      fontSize: '18px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: clickText,
      y: clickText.y - 20,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => clickText.destroy()
    });
    
    if (this.jerukClickCount >= 3) {
      this.advanceJerukStage();
    }
  }

  private advanceJerukStage() {
    this.jerukClickCount = 0;
    this.currentJerukStage++;
    
    const instructionText = this.kerasItem!.getData('instructionText') as Phaser.GameObjects.Text;
    
    switch (this.currentJerukStage) {
      case 1:
        this.kerasItem!.setTexture('CipratanJeruk1').setScale(0.6);
        if (instructionText) {
          instructionText.setText('Klik 3 kali lagi!');
        }
        break;
      case 2:
        this.kerasItem!.setTexture('CipratanJeruk2').setScale(0.6);
        if (instructionText) {
          instructionText.setText('Klik 3 kali lagi!');
        }
        break;
      case 3:
        this.kerasItem!.setTexture('CipratanJeruk3').setScale(0.6);
        if (instructionText) {
          instructionText.setText('Klik 3 kali terakhir!');
        }
        break;
      case 4:
        this.kerasItem!.setTexture('AdonanJeruk').setScale(0.5);
        this.completeJerukClicking(instructionText);
        break;
    }
  }

  private completeJerukClicking(instructionText: Phaser.GameObjects.Text) {
    if (instructionText) {
      instructionText.destroy();
    }
    
    this.kerasItem!.off('pointerdown');
    
    this.showPlacementSuccess(this.kerasItem!.x, this.kerasItem!.y, "Jeruk Berhasil Diperas!");
    this.nextStep();
  }

  // Step 9: Jeruk stirring
  private startStep9Stirring() {
    this.isStirring = true;
    this.stirCount = 0;
    this.maxStirCount = 15;
    this.currentStirTexture = 'AdukJeruk1';
    
    const instructionText = this.add.text(this.kerasItem!.x, this.kerasItem!.y - 100, 
      `Tap untuk mengaduk! (${this.stirCount}/${this.maxStirCount})`, {
      fontSize: '20px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.kerasItem!.setInteractive();
    this.kerasItem!.on('pointerdown', this.onStep9TapStir, this);
    
    this.kerasItem!.setData('instructionText', instructionText);
    this.kerasItem!.setScale(0.5);
  }

  private onStep9TapStir() {
    if (!this.isStirring || this.stirCount >= this.maxStirCount) return;
    this.handleStep9StirSwipe();
  }
  
  private handleStep9StirSwipe() {
    this.stirCount++;
    const instructionText = this.kerasItem!.getData('instructionText') as Phaser.GameObjects.Text;
    
    if (instructionText) {
      instructionText.setText(`Tap untuk mengaduk! (${this.stirCount}/${this.maxStirCount})`);
    }
    
    // Cycle between AdukJeruk1 and AdukJeruk2
    if (this.currentStirTexture === 'AdukJeruk1') {
      this.kerasItem!.setTexture('AdukJeruk2').setScale(0.5);
      this.currentStirTexture = 'AdukJeruk2';
    } else {
      this.kerasItem!.setTexture('AdukJeruk1').setScale(0.5);
      this.currentStirTexture = 'AdukJeruk1';
    }
    
    this.tweens.add({
      targets: this.kerasItem,
      scaleX: 0.5 * 1.08,
      scaleY: 0.5 * 1.08,
      duration: 120,
      yoyo: true,
      ease: 'Power2'
    });
    
    if (this.stirCount >= this.maxStirCount) {
      this.completeStep9Stirring(instructionText);
    }
  }
  
  private completeStep9Stirring(instructionText: Phaser.GameObjects.Text) {
    this.isStirring = false;
    
    if (instructionText) {
      instructionText.destroy();
    }
    
    this.kerasItem!.setTexture('Keras').setScale(0.6);
    
    // Remove all event listeners
    this.kerasItem!.off('pointerdown');
    this.kerasItem!.off('pointermove');
    this.kerasItem!.off('pointerup');
    
    // Return spoon to the panel instead of drag start position
    if (this.spoonItem) {
      // If spoon is still being tracked, return it to panel
      this.returnSpoonToDragStart();
    }
    
    this.showPlacementSuccess(this.kerasItem!.x, this.kerasItem!.y, "15x Adukan Selesai!");
    this.nextStep();
  }

  // Step 10: Air Panas animation
  private startAirPanasAnimation() {
    if (!this.kerasItem) return;
    
    // Return spoon to panel before starting the animation
    this.returnSpoonToDragStart();
    
    this.kerasItem.setVisible(false);
    
    const gameHeight = this.cameras.main.height;
    const centerX = this.kerasItem.x;
    const centerY = gameHeight - 500;
    const pourAnim = this.add.sprite(centerX, centerY, 'Air1400ml1').setScale(0.3);
    
    this.anims.create({
      key: 'pour_air_panas_anim',
      frames: [
        { key: 'Air1400ml1' },
        { key: 'Air1400ml2' },
        { key: 'Air1400ml3' }
      ],
      frameRate: 0.5, // 6 seconds total
    });
    
    pourAnim.play('pour_air_panas_anim');
    
    this.time.delayedCall(6000, () => {
      pourAnim.destroy();
      this.kerasItem!.setVisible(true);
      this.kerasItem!.setTexture('Tambahan-Air-Panas').setScale(0.6);
      this.nextStep();
    });
  }

  // Step 11: Final stirring (25 times)
  private startStep11Stirring() {
    this.isStirring = true;
    this.stirCount = 0;
    this.maxStirCount = 25;
    this.currentStirTexture = 'Aduk3';
    
    const instructionText = this.add.text(this.kerasItem!.x, this.kerasItem!.y - 100, 
      `Tap untuk mengaduk! (${this.stirCount}/${this.maxStirCount})`, {
      fontSize: '20px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);
    
    this.kerasItem!.setInteractive();
    this.kerasItem!.on('pointerdown', this.onStep11TapStir, this);
    
    this.kerasItem!.setData('instructionText', instructionText);
    this.kerasItem!.setScale(0.6);
  }

  private onStep11TapStir() {
    if (!this.isStirring || this.stirCount >= this.maxStirCount) return;
    this.handleStep11StirSwipe();
  }
  
  private handleStep11StirSwipe() {
    this.stirCount++;
    const instructionText = this.kerasItem!.getData('instructionText') as Phaser.GameObjects.Text;
    
    if (instructionText) {
      instructionText.setText(`Tap untuk mengaduk! (${this.stirCount}/${this.maxStirCount})`);
    }
    
    // Cycle between PapedaAduk1 and PapedaAduk2
    if (this.currentStirTexture === 'Aduk3' || this.currentStirTexture === 'PapedaAduk2') {
      this.kerasItem!.setTexture('PapedaAduk1');
      this.currentStirTexture = 'PapedaAduk1';
    } else {
      this.kerasItem!.setTexture('PapedaAduk2');
      this.currentStirTexture = 'PapedaAduk2';
    }
    
    this.tweens.add({
      targets: this.kerasItem,
      scaleX: 0.6 * 1.08,
      scaleY: 0.6 * 1.08,
      duration: 120,
      yoyo: true,
      ease: 'Power2'
    });
    
    if (this.stirCount >= this.maxStirCount) {
      this.completeStep11Stirring(instructionText);
    }
  }
  
  private completeStep11Stirring(instructionText: Phaser.GameObjects.Text) {
    this.isStirring = false;
    
    if (instructionText) {
      instructionText.destroy();
    }
    
    this.kerasItem!.setTexture('Hasil-Jadi').setScale(0.6);
    
    this.kerasItem!.off('pointerdown');
    this.kerasItem!.off('pointermove');
    this.kerasItem!.off('pointerup');
    
    // Make Hasil-Jadi draggable for final assembly
    this.input.setDraggable(this.kerasItem!);
    
    // Return spoon back to its original drag position (consistent behavior)
    this.returnSpoonToDragStart();
    
    this.showPlacementSuccess(this.kerasItem!.x, this.kerasItem!.y, "25x Adukan Selesai!");
    this.nextStep();
  }

  // Step 12: Final assembly
  private placeSebelumPapedaInStaging() {
    this.finalKerasItem = this.add.image(this.stagingArea.x, this.stagingArea.y, 'SebelumPapeda')
      .setScale(0.2)
      .setDepth(10)
      .setName('SebelumPapeda')
      .setInteractive({ draggable: true });
    
    // Make it draggable so user can drag it to Hasil-Jadi
    this.input.setDraggable(this.finalKerasItem);
    
    this.showPlacementSuccess(this.finalKerasItem.x, this.finalKerasItem.y, "Ikan Kuah Kuning Ditempatkan!");
  }

  private completeFinalAssembly() {
    // Remove the dragged SebelumPapeda from staging area
    if (this.finalKerasItem) {
      this.finalKerasItem.destroy();
      this.finalKerasItem = null;
    }
    
    // Change Hasil-Jadi to Papeda in the cooking area
    if (this.kerasItem) {
      this.kerasItem.setTexture('Papeda').setScale(0.6);
      
      // Add visual effect for the transformation
      this.tweens.add({
        targets: this.kerasItem,
        scaleX: 0.6 * 1.2,
        scaleY: 0.6 * 1.2,
        duration: 300,
        ease: 'Back.easeOut',
        yoyo: true,
        onComplete: () => {
          this.kerasItem!.setScale(0.6);
        }
      });
      
      this.showPlacementSuccess(this.kerasItem.x, this.kerasItem.y, "Papeda Selesai!");
    }
    
    // Complete the game and show celebration
    this.nextStep();
    this.time.delayedCall(1500, () => {
      this.showGameCompletionMessage();
    });
  }

  // Helper method to return spoon to panel
  private returnSpoonToPanel() {
    // Check if spoon already exists in panel and remove it first
    const existingSpoons = this.ingredientItems.filter(item => item.name === 'Spoon');
    existingSpoons.forEach(spoon => {
      const index = this.ingredientItems.indexOf(spoon);
      if (index > -1) {
        this.ingredientItems.splice(index, 1);
      }
      spoon.destroy();
    });
    
    // Use the exact same ingredients array as in createIngredients
    const ingredients = [
      { key: "Mangkuk", name: "Mangkuk", scale: 0.15 },
      { key: "Mangkuk", name: "Mangkuk", scale: 0.15 },
      { key: "Tepung", name: "Sagu Manta", scale: 0.12 },
      { key: "Water", name: "Air 200ml", scale: 0.2 },
      { key: "Spoon", name: "Sendok", scale: 0.15 },
      { key: "Saring", name: "Saringan", scale: 0.15 },
      { key: "Air100ml", name: "Air 100ml", scale: 0.12 },
      { key: "Nipis", name: "Jeruk Nipis", scale: 0.2 },
      { key: "AirPanas", name: "Air Panas", scale: 0.2 },
      { key: "SebelumPapeda", name: "Ikan Kuah Kuning", scale: 0.15 },
      { key: "Piring", name: "Piring", scale: 0.15 }
    ];
    
    // Calculate spoon's position using the exact same layout logic as createIngredients
    const itemsPerRow = 2;
    const horizontalPadding = 40;
    const verticalPadding = 20;
    const panelWidth = this.layoutConfig.ingredientsPanelWidth;
    const panelHeight = this.layoutConfig.ingredientsPanelHeight;
    const titleAreaHeight = 80;
    
    const availableWidth = panelWidth - horizontalPadding;
    const spacingX = availableWidth / itemsPerRow;
    const startX = (horizontalPadding / 2) + (spacingX / 2);
    
    const numRows = Math.ceil(ingredients.length / itemsPerRow);
    const availableHeight = panelHeight - titleAreaHeight - verticalPadding;
    const spacingY = availableHeight / numRows;
    const startY = titleAreaHeight + (verticalPadding / 2) + (spacingY / 2);
    
    // Spoon is at index 4, so row 2, col 0
    const spoonIndex = 4;
    const row = Math.floor(spoonIndex / itemsPerRow);
    const col = spoonIndex % itemsPerRow;
    const spoonX = startX + (col * spacingX);
    const spoonY = startY + (row * spacingY);
    
    // Create item background first (same as in createIngredients)
    const itemBg = this.add.graphics();
    itemBg.fillStyle(0x000000, 0.25);
    itemBg.fillRoundedRect(spoonX - 55, spoonY - 37.5, 110, 75, 12);
    itemBg.lineStyle(1, 0x8B4513, 0.4);
    itemBg.strokeRoundedRect(spoonX - 55, spoonY - 37.5, 110, 75, 12);
    this.ingredientsPanel.add(itemBg);
    
    // Create a new spoon in the ingredients panel
    const spoonInPanel = this.add.image(spoonX, spoonY, 'Spoon')
      .setInteractive()
      .setScale(0.15)
      .setName('Spoon');
    
    // Add to ingredients panel and make draggable
    this.ingredientsPanel.add(spoonInPanel);
    this.input.setDraggable(spoonInPanel);
    this.ingredientItems.push(spoonInPanel);
    
    // Item label
    const label = this.add.text(spoonX, spoonY + 40, "Sendok", {
      fontSize: '18px',
      fontFamily: 'Chewy, cursive',
      color: '#FFFFFF',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.ingredientsPanel.add(label);
    
    // Add hover effects like other ingredients
    spoonInPanel.on('pointerover', () => {
      spoonInPanel.setScale(0.15 * 1.15);
      label.setColor('#FFFFFF');
      itemBg.clear();
      itemBg.fillStyle(0xFFD700, 0.15);
      itemBg.fillRoundedRect(spoonX - 55, spoonY - 37.5, 110, 75, 12);
      itemBg.lineStyle(1, 0xFFD700, 0.6);
      itemBg.strokeRoundedRect(spoonX - 55, spoonY - 37.5, 110, 75, 12);
    });
    
    spoonInPanel.on('pointerout', () => {
      spoonInPanel.setScale(0.15);
      label.setColor('#FFE4B5');
      itemBg.clear();
      itemBg.fillStyle(0x000000, 0.25);
      itemBg.fillRoundedRect(spoonX - 55, spoonY - 37.5, 110, 75, 12);
      itemBg.lineStyle(1, 0x8B4513, 0.4);
      itemBg.strokeRoundedRect(spoonX - 55, spoonY - 37.5, 110, 75, 12);
    });
  }

  private showGameCompletionMessage() {
    // Create completion overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    overlay.setDepth(1000);

    // Create completion message container
    const messageContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
    messageContainer.setDepth(1001);

    // Background for message
    const messageBg = this.add.graphics();
    messageBg.fillStyle(0xFFD700, 1);
    messageBg.fillRoundedRect(-300, -150, 600, 300, 20);
    messageBg.lineStyle(5, 0xFF6B35, 1);
    messageBg.strokeRoundedRect(-300, -150, 600, 300, 20);
    messageContainer.add(messageBg);

    // Completion title
    const completionTitle = this.add.text(0, -80, '🎉 SELAMAT! 🎉', {
      fontSize: '48px',
      fontFamily: 'Chewy, cursive',
      color: '#FF6B35',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    messageContainer.add(completionTitle);

    // Completion message
    const completionMessage = this.add.text(0, -20, 'Anda Telah Berhasil\nMembuat Papeda!', {
      fontSize: '28px',
      fontFamily: 'Chewy, cursive',
      color: '#8B4513',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    messageContainer.add(completionMessage);

    // Success message
    const successMessage = this.add.text(0, 40, 'Permainan Selesai!', {
      fontSize: '24px',
      fontFamily: 'Chewy, cursive',
      color: '#2E8B57',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    messageContainer.add(successMessage);

    // Continue button
    const continueButton = this.add.text(0, 100, 'Kembali ke Menu', {
      fontSize: '20px',
      fontFamily: 'Chewy, cursive',
      color: '#FFFFFF',
      backgroundColor: '#FF6B35',
      padding: { x: 20, y: 10 },
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive();
    
    continueButton.on('pointerover', () => {
      continueButton.setScale(1.1);
      continueButton.setStyle({ backgroundColor: '#FF8C42' });
    });
    
    continueButton.on('pointerout', () => {
      continueButton.setScale(1);
      continueButton.setStyle({ backgroundColor: '#FF6B35' });
    });
    
    continueButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
    
    messageContainer.add(continueButton);

    // Animate the completion message
    messageContainer.setScale(0);
    this.tweens.add({
      targets: messageContainer,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Add floating particles effect
    this.createCelebrationParticles();
  }

  private createCelebrationParticles() {
    const colors = [0xFFD700, 0xFF6B35, 0x32CD32, 0xFF69B4, 0x00CED1];
    
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, this.cameras.main.width),
        Phaser.Math.Between(0, this.cameras.main.height),
        Phaser.Math.Between(5, 15),
        colors[Phaser.Math.Between(0, colors.length - 1)]
      );
      particle.setDepth(999);
      
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(100, 300),
        x: particle.x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(1000, 2000),
        ease: 'Power2',
        delay: Phaser.Math.Between(0, 1000),
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  private setupDialogBridge() {
    console.log('🔧 Papeda: Setting up dialog bridge...');

    // Wait for dialog bridge to be attached by React
    const checkForBridge = () => {
      console.log('🔍 Papeda: Checking for dialog bridge...');
      if (this.dialogBridge) {
        console.log('✅ Papeda: Dialog bridge connected!');
        console.log('🎯 Papeda: Current game step:', this.currentStep);

        // Test the bridge
        try {
          const currentDialogStep = this.dialogBridge.getCurrentStep();
          console.log('📊 Papeda: Current dialog step:', currentDialogStep);

          // Sync initial step
          this.syncDialogWithGameStep();
        } catch (error) {
          console.error('❌ Papeda: Bridge test failed:', error);
        }
      } else {
        console.log('⏳ Papeda: Bridge not ready, checking again in 500ms...');
        // Try again in 500ms
        this.time.delayedCall(500, checkForBridge);
      }
    };

    // Start checking for bridge
    this.time.delayedCall(100, checkForBridge);
  }

  private syncDialogWithGameStep() {
    if (this.dialogBridge) {
      console.log('🔄 Papeda: Syncing dialog with game step...');

      try {
        // Make sure dialog is at the correct step
        const currentDialogStep = this.dialogBridge.getCurrentStep();
        console.log(`📊 Papeda: Game step: ${this.currentStep}, Dialog step: ${currentDialogStep}`);

        if (this.currentStep !== currentDialogStep) {
          console.log(`🔄 Papeda: Syncing dialog step from ${currentDialogStep} to ${this.currentStep}`);
          this.dialogBridge.setStep(this.currentStep);
          console.log('✅ Papeda: Dialog sync complete');
        } else {
          console.log('✅ Papeda: Dialog already in sync');
        }
      } catch (error) {
        console.error('❌ Papeda: Dialog sync failed:', error);
      }
    }
  }
}