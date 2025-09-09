// src/game/scenes/PapedaScene.ts - Enhanced with NasiLapola UI System
import Phaser from "phaser";

type BowlState = 'empty' | 'flour' | 'flour_water' | 'finished' | 'keras_with_water' | 'finished_second_stir' | 'keras_with_nipis' | 'keras_with_nipis_and_hot_water' | 'final_stir' | 'ready_to_serve' | 'served';

interface GameStep {
  id: number;
  text: string;
  character: string;
  isCompleted: boolean;
}

export default class PapedaScene extends Phaser.Scene {
  // Original game objects
  private mangkuk: Phaser.GameObjects.Image;
  private dropZone: Phaser.GameObjects.Zone;
  private bowlState: BowlState;
  private stirringTimer: Phaser.Time.TimerEvent | null = null;
  private finalPlate: Phaser.GameObjects.Image | null = null;

  // UI Components (from NasiLapola)
  private ingredientsPanel!: Phaser.GameObjects.Container;
  private dialogPanel!: Phaser.GameObjects.Container;
  private stagingArea!: Phaser.GameObjects.Container;
  private menuToggleButton!: Phaser.GameObjects.Image;
  private characterImage!: Phaser.GameObjects.Image;
  private stepText!: Phaser.GameObjects.Text;
  private isIngredientsPanelOpen = true;
  private currentStep = 0;
  private ingredientItems: Phaser.GameObjects.Image[] = [];
  private panelBg!: Phaser.GameObjects.Graphics;
  private panelTitle!: Phaser.GameObjects.Text;
  private hintPopup!: Phaser.GameObjects.Container;
  private infoContent: string = `Papeda adalah salah satu olahan sagu yang paling sering ditemukan pada meja makan masyarakat Maluku. Makanan yang seringkali disebut mirip dengan lem ini sebenarnya terbuat dari pati sagu yang dikeringkan, atau yang seringkali disebut Sagu Manta oleh orang Maluku. Papeda dibuat dengan cara mengaduk sagu manta yang sudah dibersihkan menggunakan air dengan air mendidih hingga mengental dan bening. Warna papeda dapat bervariasi dari kecoklatan hingga putih bening, tergantung dari jenis sagu manta yang digunakan. Papeda yang sudah matang memiliki tekstur yang lengket menyerupai lem dan rasa yang hambar, dan bahkan sering dideskripsikan sebagai tidak memiliki rasa khusus. Oleh karena itu, Papeda hampir selalu disajikan bersama makanan berkuah seperti Ikan Kuah Kuning.`;

  // Layout configuration
  private layoutConfig = {
    // Header bar
    headerHeight: 60,
    
    // Ingredients panel
    ingredientsPanelWidth: 375,
    ingredientsPanelX: 0, // Will be calculated
    ingredientsPanelY: 155,
    ingredientsPanelHeight: 600,
    
    // Cooking area
    cookingAreaLeft: 20,
    cookingAreaTop: 70,
    cookingAreaRight: 290,
    cookingAreaBottom: 180,
    
    // Dialog panel
    dialogPanelHeight: 90,
    dialogPanelY: 900, // Will be calculated
    dialogPanelLeft: 50,
    dialogPanelRight: 20,

    // Character
    characterX: 1000,
    characterY: 500,

    // Bowl settings
    bowlScale: 0.3,
    
    // Staging area
    stagingAreaX: 200,
    stagingAreaY: 300,
    stagingAreaWidth: 300,
    stagingAreaHeight: 225
  };

  // Game steps for Papeda
  private gameSteps: GameStep[] = [
    {
      id: 1,
      text: "Ambil mangkuk. Ini adalah wadah ajaib kita. Masukkan tepung sagu ke dalamnya.",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 2,
      text: "Tuangkan 200 ml air. Aduk adonan sampai mengental. Rasanya seperti membuat lumpur, tapi versi yang lebih lezat!",
      character: "karakter2.png",
      isCompleted: false
    },
    {
      id: 3,
      text: "Buang air yang pertama. Setelah itu, tuangkan lagi 100 ml air yang baru. Aduk hingga kental dan buang airnya kembali.",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 4,
      text: "Peras jeruk nipis. Masukkan airnya. Sedikit sentuhan asam akan membuat rasanya lebih segar.",
      character: "karakter4.png",
      isCompleted: false
    },
    {
      id: 5,
      text: "Tuangkan 1400 ml air matang. Aduk terus sampai adonan berubah jadi kental. Perhatikan baik-baik, ya!",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 6,
      text: "Papeda siap disajikan. Selamat menikmati!",
      character: "karakter6.png",
      isCompleted: false
    }
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
    this.load.image("Tepung", "/assets/foods/papeda/flour.png");
    this.load.image("Water", "/assets/foods/papeda/water.png");
    this.load.image("Spoon", "/assets/foods/papeda/spoon.png");
    this.load.image("Mangkuk", "/assets/foods/papeda/bowl.png");
    this.load.image("AirPanas", "/assets/foods/papeda/AirPanas.png");
    this.load.image("Air100ml", "/assets/foods/papeda/Air-100-ml.png");
    this.load.image("Nipis", "/assets/foods/papeda/nipis.png");
    this.load.image("Piring", "/assets/foods/papeda/Piring.png");

    // Papeda process images
    this.load.image("DenganTepung", "/assets/foods/papeda/DenganTepung.png");
    this.load.image("DenganAir", "/assets/foods/papeda/DenganAir.png");
    this.load.image("DenganEndok", "/assets/foods/papeda/Denganendok.png");
    this.load.image("PapedaAduk1", "/assets/foods/papeda/PapedaAduk1.png");
    this.load.image("PapedaAduk2", "/assets/foods/papeda/PapedaAduk2.png");
    this.load.image("HasilAduk1", "/assets/foods/papeda/hasilAduk1.png");
    this.load.image("Keras", "/assets/foods/papeda/Keras.png");
    this.load.image("Keras2", "/assets/foods/papeda/Keras2.png");
    this.load.image("TambahanAir100Ml", "/assets/foods/papeda/Tambahan-Air-100-Ml.png");
    this.load.image("Tambahan-Nipis", "/assets/foods/papeda/Tambahan-Nipis.png");
    this.load.image("Tambahan-Air-Panas", "/assets/foods/papeda/Tambahan-Air-Panas.png");
    this.load.image("Hasil-Jadi", "/assets/foods/papeda/Hasil-Jadi.png");
    this.load.image("Papeda", "/assets/foods/papeda/Papeda.png");

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
    this.createDialogPanel();
    this.createStagingArea();

    // Update panel visuals
    this.updateIngredientsPanelVisuals();

    // Setup ingredient panel layout
    this.setupIngredientsPanelLayout(undefined, undefined, undefined, 1500, 230);

    // Initialize drag and drop
    this.initDragAndDrop();

    // Update step display
    this.updateStepDisplay();
    this.createHintButton();
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
    this.layoutConfig.cookingAreaBottom = gameHeight - this.layoutConfig.dialogPanelHeight - 40;
  }

  private createCookingArea() {
    // Atur posisi mangkuk untuk mengolah papeda secara manual di sini
    const mangkukX = 800; // Ganti nilai ini untuk posisi horizontal (sumbu X)
    const mangkukY = 550; // Ganti nilai ini untuk posisi vertikal (sumbu Y)

    // Create drop zone for the bowl, matching the bowl's new position
    this.dropZone = this.add.zone(mangkukX, mangkukY, 200, 200).setRectangleDropZone(200, 200);
    
    // Create the main bowl
    this.mangkuk = this.add.image(mangkukX, mangkukY, "Mangkuk").setScale(this.layoutConfig.bowlScale);
  }

  private createStagingArea() {
    // Create staging area container
    this.stagingArea = this.add.container(
      this.layoutConfig.cookingAreaLeft + this.layoutConfig.stagingAreaX,
      this.layoutConfig.cookingAreaTop + this.layoutConfig.stagingAreaY
    );

    // Visual indicator for staging area
    const stagingGraphics = this.add.graphics();
    stagingGraphics.fillStyle(0x2A1810, 0.95);
    stagingGraphics.fillRoundedRect(
      -this.layoutConfig.stagingAreaWidth/2,
      -this.layoutConfig.stagingAreaHeight/2,
      this.layoutConfig.stagingAreaWidth,
      this.layoutConfig.stagingAreaHeight,
      20
    );
    stagingGraphics.lineStyle(2, 0x8B4513, 0.8);
    stagingGraphics.strokeRoundedRect(
      -this.layoutConfig.stagingAreaWidth/2,
      -this.layoutConfig.stagingAreaHeight/2,
      this.layoutConfig.stagingAreaWidth,
      this.layoutConfig.stagingAreaHeight,
      20
    );
    this.stagingArea.add(stagingGraphics);
    
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
      { key: "Tepung", name: "Tepung Sagu", scale: 0.12 },
      { key: "Water", name: "Air 200ml", scale: 0.2 },
      { key: "Spoon", name: "Sendok", scale: 0.15 },
      { key: "Air100ml", name: "Air 100ml", scale: 0.12 },
      { key: "Nipis", name: "Jeruk Nipis", scale: 0.2 },
      { key: "AirPanas", name: "Air Panas", scale: 0.2 },
      { key: "Piring", name: "Piring", scale: 0.15 }
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
      fontSize: '25px',
      fontFamily: 'Chewy, cursive',
      color: '#000000',
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
    progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 15, (dialogWidth - 40) * (1/6), 6, 3);
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

  private updateStepDisplay() {
    if (this.currentStep < this.gameSteps.length) {
      const step = this.gameSteps[this.currentStep];
      this.stepText.setText(`${step.id}. ${step.text}`);
      this.characterImage.setTexture(step.character.replace('.png', ''));
      
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
      
      this.cameras.main.flash(200, 144, 238, 144, false);
      this.showSuccessFeedback();
    }
  }

  private initDragAndDrop() {
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.setTint(0xFFFFAA);
    });

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      gameObject.setTint(0x00ff00);
      this.children.bringToTop(gameObject);
      // Store original position
      gameObject.setData('dragStartX', gameObject.x);
      gameObject.setData('dragStartY', gameObject.y);
    });

    this.input.on('dragenter', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      this.mangkuk.setTint(0x00ff00);
    });

    this.input.on('dragleave', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      this.mangkuk.clearTint();
    });

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedItemKey = gameObject.texture.key;

      // Step 1: Add flour to empty bowl
      if (this.bowlState === 'empty' && droppedItemKey === 'Tepung' && this.currentStep === 0) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.mangkuk.setTexture('DenganTepung');
          this.mangkuk.setScale(this.layoutConfig.bowlScale);
          this.bowlState = 'flour';
          this.nextStep();
        });
      }
      // Step 2: Add water and stir
      else if (this.bowlState === 'flour' && droppedItemKey === 'Water' && this.currentStep === 1) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.mangkuk.setTexture('DenganAir');
          this.mangkuk.setScale(this.layoutConfig.bowlScale);
          this.bowlState = 'flour_water';
        });
      }
      else if (this.bowlState === 'flour_water' && droppedItemKey === 'Spoon' && this.currentStep === 1) {
        this.executeStirringAnimation(gameObject, 'PapedaAduk1', 'PapedaAduk2', 'HasilAduk1', () => {
          this.bowlState = 'finished';
          this.time.delayedCall(2000, () => {
            this.mangkuk.setTexture('Keras');
            this.mangkuk.setScale(this.layoutConfig.bowlScale);
            this.nextStep();
          });
        });
      }
      // Step 3: Add 100ml water
      else if (this.bowlState === 'finished' && droppedItemKey === 'Air100ml' && this.currentStep === 2) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.mangkuk.setTexture('TambahanAir100Ml');
          this.mangkuk.setScale(this.layoutConfig.bowlScale);
          this.bowlState = 'keras_with_water';
          
          this.time.delayedCall(1000, () => {
            this.executeStirringAnimation(null, 'Aduk3', 'Aduk5', 'Keras2', () => {
              this.bowlState = 'finished_second_stir';
              this.nextStep();
            });
          });
        });
      }
      // Step 4: Add lime
      else if (this.bowlState === 'finished_second_stir' && droppedItemKey === 'Nipis' && this.currentStep === 3) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.mangkuk.setTexture('Tambahan-Nipis');
          this.mangkuk.setScale(this.layoutConfig.bowlScale);
          this.bowlState = 'keras_with_nipis';
          this.nextStep();
        });
      }
      // Step 5: Add hot water and final stir
      else if (this.bowlState === 'keras_with_nipis' && droppedItemKey === 'AirPanas' && this.currentStep === 4) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.mangkuk.setTexture('Tambahan-Air-Panas');
          this.mangkuk.setScale(this.layoutConfig.bowlScale);
          this.bowlState = 'keras_with_nipis_and_hot_water';

          // Geser mangkuk ke atas
          this.tweens.add({
            targets: this.mangkuk,
            y: this.mangkuk.y - 50, // Geser 50 piksel ke atas
            duration: 500,
            ease: 'Power2'
          });
          
          this.executeStirringAnimation(null, 'Aduk6', 'Aduk8', 'Hasil-Jadi', () => {
            this.bowlState = 'ready_to_serve';
            this.nextStep();
          });
        });
      }
      // Step 6: Serve on plate
      else if (this.bowlState === 'ready_to_serve' && droppedItemKey === 'Piring' && this.currentStep === 5) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.mangkuk.setVisible(false);
          if (this.dropZone) {
            this.dropZone.destroy(); // Hapus drop zone agar tidak mengganggu
          }

          // Atur posisi piring saji (final) secara manual di sini.
          const plateX = this.cameras.main.centerX; // Ganti nilai untuk posisi horizontal
          const plateY = this.cameras.main.centerY; // Ganti nilai untuk posisi vertikal

          if (this.finalPlate) {
            this.finalPlate.destroy();
          }

          this.finalPlate = this.add.image(plateX, plateY, 'Papeda');
          this.finalPlate.setScale(0.4); 
          this.finalPlate.setDepth(100); 

          this.bowlState = 'served';
          this.nextStep();
          this.showCompletionCelebration();
        });
      }
      // Invalid drop
      else {
        this.executeInvalidDrop(gameObject);
      }
      
      this.mangkuk.clearTint();
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
      if (!dropped) {
        // Return to original position if not dropped on a valid zone
        const startX = gameObject.getData('dragStartX');
        const startY = gameObject.getData('dragStartY');
        if (startX !== undefined && startY !== undefined) {
          gameObject.x = startX;
          gameObject.y = startY;
        }
      }
      gameObject.clearTint();
      this.mangkuk.clearTint();
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

  private createHintButton() {
    const hintButton = this.add.image(this.layoutConfig.ingredientsPanelX + this.layoutConfig.ingredientsPanelWidth / 2, this.layoutConfig.ingredientsPanelY + this.layoutConfig.ingredientsPanelHeight + 120, 'hint_normal').setInteractive();
    hintButton.setScale(0.1);

    hintButton.on('pointerover', () => hintButton.setTexture('hint_hover'));
    hintButton.on('pointerout', () => hintButton.setTexture('hint_normal'));
    hintButton.on('pointerdown', () => {
      hintButton.setTexture('hint_active');
      this.showHintPopup();
    });
  }

  private showHintPopup() {
    if (!this.hintPopup) {
      this.createHintPopup();
    }
    // Toggle popup visibility
    this.hintPopup.setVisible(!this.hintPopup.visible);
  }

  private createHintPopup() {
    const popupWidth = 650;
    const popupHeight = 450;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.hintPopup = this.add.container(centerX, centerY);
    this.hintPopup.setDepth(100);

    // Modern brown gradient background
    const background = this.add.graphics();
    background.fillGradientStyle(0x8B4513, 0xA0522D, 0xCD853F, 0xDEB887, 1);
    background.fillRoundedRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    this.hintPopup.add(background);

    // Inner content area with cream background
    const contentBg = this.add.graphics();
    contentBg.fillStyle(0xFFFDD0, 0.95);
    contentBg.fillRoundedRect(-popupWidth / 2 + 15, -popupHeight / 2 + 15, popupWidth - 30, popupHeight - 30, 15);
    this.hintPopup.add(contentBg);

    // Title header
    const title = this.add.text(0, -popupHeight / 2 + 45, 'Papeda', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#5D4037',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.hintPopup.add(title);

    // Divider line
    const divider = this.add.graphics();
    divider.lineStyle(2, 0x8B4513, 0.8);
    divider.lineBetween(-popupWidth / 2 + 40, -popupHeight / 2 + 70, popupWidth / 2 - 40, -popupHeight / 2 + 70);
    this.hintPopup.add(divider);

    // Text content - simplified without masking
    const textAreaWidth = popupWidth - 80;
    const textStartX = -popupWidth / 2 + 40;
    const textStartY = -popupHeight / 2 + 90;
    
    // Food information content
    const papedaContent = `Papeda adalah salah satu olahan sagu yang paling sering ditemukan pada meja makan masyarakat Maluku. Makanan yang seringkali disebut mirip dengan lem ini sebenarnya terbuat dari pati sagu yang dikeringkan, atau yang seringkali disebut Sagu Manta oleh orang Maluku. Papeda dibuat dengan cara mengaduk sagu manta yang sudah dibersihkan menggunakan air dengan air mendidih hingga mengental dan bening. Warna papeda dapat bervariasi dari kecoklatan hingga putih bening, tergantung dari jenis sagu manta yang digunakan. Papeda yang sudah matang memiliki tekstur yang lengket menyerupai lem dan rasa yang hambar, dan bahkan sering dideskripsikan sebagai tidak memiliki rasa khusus. Oleh karena itu, Papeda hampir selalu disajikan bersama makanan berkuah seperti Ikan Kuah Kuning.`;
    
    // Add the main text directly to popup
    const text = this.add.text(textStartX, textStartY, papedaContent, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#3E2723',
      wordWrap: { width: textAreaWidth, useAdvancedWrap: true },
      align: 'left',
      lineSpacing: 6
    }).setOrigin(0, 0);
    
    this.hintPopup.add(text);
    this.hintPopup.setVisible(false);
  }
}