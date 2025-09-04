// src/game/scenes/KohuKohuScene.ts - Enhanced with UI Components from NasiLapola
import * as Phaser from "phaser";

// State untuk wajan dan teflon
type BowlState =
  | "empty"
  | "teflonKelapa"
  | "sangrai"
  | "tambahanSepatula"
  | "aduk"
  | "piringKelapa"
  | "piring_on_plating"
  | "piring_with_kelapa"
  | "finished";

type WajanState =
  | "empty"
  | "kemangi"
  | "kol"
  | "bawangPutih"
  | "cabeBawangMerah"
  | "daging"
  | "minyak"
  | "sepatulaDanSayur"
  | "ready_to_plate"
  | "kohukohu";

interface GameStep {
  id: number;
  text: string;
  character: string;
  isCompleted: boolean;
}

export default class KohuKohuScene extends Phaser.Scene {
  // Definisikan semua objek game
  private Teflon!: Phaser.GameObjects.Image;
  private Wajan!: Phaser.GameObjects.Image;
  private KomporWajan!: Phaser.GameObjects.Image;
  private KomporTeflon!: Phaser.GameObjects.Image;

  // Drop zones
  private wajanZone!: Phaser.GameObjects.Zone;
  private teflonZone!: Phaser.GameObjects.Zone;
  private platingZone!: Phaser.GameObjects.Zone;
  private plateZone: Phaser.GameObjects.Zone | null = null;

  // State untuk setiap cooking vessel
  private bowlState: BowlState = "empty";
  private wajanState: WajanState = "empty";
  private stirringTimer: Phaser.Time.TimerEvent | null = null;

  // Tracking variables
  private hasCabe = false;
  private hasBawangMerah = false;

  private finalPlate: Phaser.GameObjects.Image | null = null;

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
    dialogPanelHeight: 120,
    dialogPanelY: 900, // Will be calculated
    dialogPanelLeft: 50,
    dialogPanelRight: 20,

    // Character
    characterX: 1000,
    characterY: 500,

    // Stoves & cooking vessels
    stoveSpacing: 500,
    stoveScale: 0.35,
    vesselScale: 0.35,
    
    // Plating area (renamed from staging)
    platingAreaX: 200,
    platingAreaY: 300,
    platingAreaWidth: 300,
    platingAreaHeight: 225
  }

  // Game steps for Kohu Kohu
  private gameSteps: GameStep[] = [
    {
      id: 1,
      text: "Oke, pertama-tama coba kamu siapkan wajan teflon di depanmu. Sudah? Bagus. Nah, sekarang ambil parutan kelapa kita. Masukkan semuanya ke dalam wajan itu.",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 2,
      text: "Setelah itu, kita akan sangrai kelapa ini sampai warnanya berubah jadi cokelat dan aromanya harum semerbak. Aduk terus, ya! Jangan sampai gosong.",
      character: "karakter2.png",
      isCompleted: false
    },
    {
      id: 3,
      text: "Sip! Sekarang, kita ganti wajan, ya. Ambil wajan yang baru untuk bahan-bahan selanjutnya. Sekarang, masukkan bahan pertama kita, yaitu kemangi. Setelah kemangi, giliran selada yang masuk wajan. Lalu, tambahkan sawi ke dalam wajan. Jangan lupa, masukkan juga tauge yang renyah!",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 4,
      text: "Supaya ada sensasi pedasnya, coba masukkan potongan cabe dan irisan bawang merah. Setelah itu, ambil suwiran daging ikan cakalang kita dan masukkan ke wajan. Ini yang bikin rasanya makin gurih.",
      character: "karakter4.png",
      isCompleted: false
    },
    {
      id: 5,
      text: "Terakhir, tuangkan sedikit minyak ikan untuk sentuhan akhir yang sempurna.",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 6,
      text: "Bagus! Sekarang ambil piring dari panel bahan dan letakkan di area plating di sebelah kiri.",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 7,
      text: "Letakkan kelapa sangrai dari teflon ke atas piring.",
      character: "karakter6.png",
      isCompleted: false
    },
    {
      id: 8,
      text: "Hampir selesai! Ambil sayuran dari wajan menggunakan spatula dan taruh di atas piring.",
      character: "karakter6.png",
      isCompleted: false
    },
    {
      id: 9,
      text: "Wah, kamu luar biasa! Kohu Kohu kita sudah siap disajikan!",
      character: "karakter6.png",
      isCompleted: false
    }
  ];

  constructor() {
    super("KohuKohuScene");
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/kitchen.png");
    this.load.image("Kompor", "/assets/foods/kohu_kohu/Kompor.png");

    // Tools
    this.load.image("Teflon", "/assets/foods/kohu_kohu/Teflon.png");
    this.load.image("Wajan", "/assets/foods/kohu_kohu/wajan.png");
    this.load.image("Sepatula", "/assets/foods/kohu_kohu/sepatula.png");
    this.load.image("Piring", "/assets/foods/kohu_kohu/Piring Kohu.png");

    // Ingredients
    this.load.image("Kelapa", "/assets/foods/kohu_kohu/Kelapa.png");
    this.load.image("Kol", "/assets/foods/kohu_kohu/kol.png");
    this.load.image("Kemangi", "/assets/foods/kohu_kohu/Kemangi.png");
    this.load.image("BawangPutih", "/assets/foods/kohu_kohu/bawangPutih.png");
    this.load.image("Cabe", "/assets/foods/kohu_kohu/Cabe.png");
    this.load.image("BawangMerah", "/assets/foods/kohu_kohu/Bawang Merah.png");
    this.load.image("Daging", "/assets/foods/kohu_kohu/Daging.png");
    this.load.image("MinyakIkan", "/assets/foods/kohu_kohu/MinyakIkan.png");

    // Steps / hasil
    this.load.image("TeflonKelapa", "/assets/foods/kohu_kohu/TeflonKelapa.png");
    this.load.image("Sangrai", "/assets/foods/kohu_kohu/sangrai.png");
    this.load.image("TambahanSepatula", "/assets/foods/kohu_kohu/TambahanSepatula.png");
    this.load.image("AdukKohu1", "/assets/foods/kohu_kohu/adukKohu1.png");
    this.load.image("AdukKohu2", "/assets/foods/kohu_kohu/AdukKohu2.png");
    this.load.image("PiringKelapa", "/assets/foods/kohu_kohu/PiringKelapa.png");
    this.load.image("SepatuladanSayur", "/assets/foods/kohu_kohu/SepatuladanSayur.png");
    this.load.image("KohuKohu", "/assets/foods/kohu_kohu/KohuKohu.png");
    this.load.image("Tambahankemangi", "/assets/foods/kohu_kohu/Tambahankemangi.png");
    this.load.image("tambahanKol", "/assets/foods/kohu_kohu/tambahanKol.png");
    this.load.image("tambahanBawangPutih", "/assets/foods/kohu_kohu/tambahanBawangPutih.png");
    this.load.image("tambahanCabeBawangMerah", "/assets/foods/kohu_kohu/tambahanCabeBawangMerah.png");
    this.load.image("tambahanDaging", "/assets/foods/kohu_kohu/TambahanDaging.png");
    this.load.image("tambahanMinyak", "/assets/foods/kohu_kohu/tambahanMinyak.png");

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
    this.load.image("karakter6", "/assets/karakter/karakter6.png");
  }

  create() {
    this.add.image(0, 0, "background").setOrigin(0);
    
    // Calculate layout positions
    this.calculateLayout();

    // Create game elements in the cooking area
    this.createCookingArea();

    // Create UI components
    this.createIngredientsPanel();
    this.createDialogPanel();

    // Initial update of panel visuals
    this.updateIngredientsPanelVisuals();

    // Setup ingredient panel layout
    this.setupIngredientsPanelLayout(undefined, undefined, undefined, 1500, 230);

    // Initialize drag and drop
    this.initDragAndDrop();

    // Update step display
    this.updateStepDisplay();
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
    // Kompor positioning
    const komporY = this.layoutConfig.cookingAreaBottom - 100;
    
    // --- Kompor kiri untuk WAJAN - Fixed position ---
    this.KomporWajan = this.add.image(650, 600, "Kompor").setScale(this.layoutConfig.stoveScale);
    this.wajanZone = this.add.zone(650, 540, 120, 120).setRectangleDropZone(120, 120);
    this.wajanZone.name = "wajanZone";
    this.Wajan = this.add.image(this.wajanZone.x, this.wajanZone.y, "Wajan").setScale(this.layoutConfig.vesselScale);
    this.Wajan.setData('initialScale', this.layoutConfig.vesselScale);
    this.Wajan.setData('targetWidth', this.Wajan.displayWidth);

    // --- Kompor kanan untuk TEFLON - Fixed position ---
    this.KomporTeflon = this.add.image(1150, 600, "Kompor").setScale(this.layoutConfig.stoveScale);
    this.teflonZone = this.add.zone(1150, 540, 120, 120).setRectangleDropZone(120, 120);
    this.teflonZone.name = "teflonZone";
    this.Teflon = this.add.image(this.teflonZone.x, this.teflonZone.y, "Teflon").setScale(this.layoutConfig.vesselScale);
    this.Teflon.setInteractive();
    this.input.setDraggable(this.Teflon);
    this.Teflon.name = "Teflon";
    this.Teflon.setData('targetWidth', this.Teflon.displayWidth);
    this.Teflon.setData('initialScale', this.layoutConfig.vesselScale);
    
    // Plating zone
    this.platingZone = this.add.zone(
      this.layoutConfig.cookingAreaLeft + this.layoutConfig.platingAreaX,
      this.layoutConfig.cookingAreaTop + this.layoutConfig.platingAreaY,
      this.layoutConfig.platingAreaWidth,
      this.layoutConfig.platingAreaHeight
    ).setRectangleDropZone(this.layoutConfig.platingAreaWidth, this.layoutConfig.platingAreaHeight);
    this.platingZone.name = "plating";

    // Visual indicator untuk plating area
    const platingGraphics = this.add.graphics();
    platingGraphics.fillStyle(0x2A1810, 0.95);
    platingGraphics.fillRoundedRect(
      this.platingZone.x - this.platingZone.width/2,
      this.platingZone.y - this.platingZone.height/2,
      this.platingZone.width,
      this.platingZone.height,
      20
    );
    platingGraphics.lineStyle(2, 0x8B4513, 0.8);
    platingGraphics.strokeRoundedRect(
      this.platingZone.x - this.platingZone.width/2,
      this.platingZone.y - this.platingZone.height/2,
      this.platingZone.width,
      this.platingZone.height,
      20
    );
    
    const platingLabel = this.add.text(
      this.platingZone.x,
      this.platingZone.y,
      "Area Plating",
      {
        fontSize: '24px',
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
      { key: "Kelapa", name: "Kelapa", scale: 0.2 },
      { key: "Kemangi", name: "Kemangi", scale: 0.18 },
      { key: "Kol", name: "Sawi", scale: 0.15 },
      { key: "BawangPutih", name: "Tauge", scale: 0.18 },
      { key: "Cabe", name: "Cabai", scale: 0.2 },
      { key: "BawangMerah", name: "Bawang Merah", scale: 0.16 },
      { key: "Daging", name: "Daging Cakalang", scale: 0.18 },
      { key: "MinyakIkan", name: "Minyak Ikan", scale: 0.16 },
      { key: "Sepatula", name: "Spatula", scale: 0.12 }, // Ukuran spatula diperkecil
      { key: "Piring", name: "Piring", scale: 0.17 }
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
    characterContainer.fillCircle(50, this.layoutConfig.dialogPanelHeight/2, 32);
    characterContainer.lineStyle(2, 0x8B4513, 0.4);
    characterContainer.strokeCircle(50, this.layoutConfig.dialogPanelHeight/2, 32);
    this.dialogPanel.add(characterContainer);

    // Character image
    this.characterImage = this.add.image(55, this.layoutConfig.dialogPanelHeight/2, "karakter1")
      .setScale(0.36)
      .setOrigin(0.5, 0.5);
    this.dialogPanel.add(this.characterImage);

    // Step text
    this.stepText = this.add.text(120, this.layoutConfig.dialogPanelHeight/2, "", {
      fontSize: '25px',
      fontFamily: 'Chewy, cursive',
      color: '#2C1810',
      wordWrap: { width: dialogWidth - 160, useAdvancedWrap: true },
      align: 'left',
      lineSpacing: 4
    }).setOrigin(0, 0.5);
    this.dialogPanel.add(this.stepText);

    // Progress bar
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x8B4513, 0.2);
    progressBg.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 18, dialogWidth - 40, 6, 3);
    this.dialogPanel.add(progressBg);

    const progressBar = this.add.graphics();
    progressBar.fillStyle(0xFFD700, 1);
    progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 18, (dialogWidth - 40) * (1/6), 6, 3);
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

  private updateStepDisplay() {
    if (this.currentStep < this.gameSteps.length) {
      const step = this.gameSteps[this.currentStep];
      this.stepText.setText(step.text); // Hilangkan angka, langsung tampilkan dialog
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
      
      // Find and update progress bar
      const progressBar = this.dialogPanel.list[this.dialogPanel.list.length - 1] as Phaser.GameObjects.Graphics;
      progressBar.clear();
      progressBar.fillStyle(0xFFD700, 1);
      progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 18, (dialogWidth - 40) * progressPercentage, 6, 3);
    }
  }

  private nextStep() {
    if (this.currentStep < this.gameSteps.length - 1) {
      this.gameSteps[this.currentStep].isCompleted = true;
      this.currentStep++;
      this.updateStepDisplay();
      
      // Success feedback
      this.cameras.main.flash(200, 144, 238, 144, false);
    }
  }

  private initDragAndDrop() {
    this.input.on("dragstart", (pointer: any, gameObject: Phaser.GameObjects.Image) => {
      // Store original position
      gameObject.setData('dragStartX', gameObject.x);
      gameObject.setData('dragStartY', gameObject.y);
      
             // Store original scale with special handling for spatula
       let originalScale = gameObject.getData('originalScale') || 0.2;
       if (gameObject.name === 'Sepatula') {
         originalScale = 0.15; // Consistent spatula size
         gameObject.setData('originalScale', originalScale);
       }
    });

    this.input.on("drag", (pointer: any, gameObject: any, dragX: any, dragY: any) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      gameObject.setTint(0xFFFFAA);
    });

    this.input.on("dragend", (pointer: any, gameObject: any, dropped: any) => {
      gameObject.clearTint();
      
      if (!dropped) {
        // Restore original scale based on object type
        let originalScale = gameObject.getData('originalScale') || 0.2;
        
                 // Special handling for spatula to maintain consistent size
         if (gameObject.name === 'Sepatula') {
           originalScale = 0.15; // Consistent spatula size
         }
        
        gameObject.setScale(originalScale);
        
        this.tweens.add({
          targets: gameObject,
          x: gameObject.getData('dragStartX'),
          y: gameObject.getData('dragStartY'),
          duration: 400,
          ease: 'Back.easeOut'
        });
      }
    });

    this.input.on("drop", (pointer: any, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedKey = gameObject.name;
      
      // Debug: Log drop attempt
      console.log(`Drop attempt: ${droppedKey} on ${dropZone.name}, Current step: ${this.currentStep}, Wajan state: ${this.wajanState}`);

      // Step 1: Add coconut to teflon
      if (dropZone === this.teflonZone && this.bowlState === "empty" && droppedKey === "Kelapa" && this.currentStep === 0) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Teflon, "TeflonKelapa");
          this.bowlState = "teflonKelapa";
          
          // Auto-cook coconut after 1 second
          this.time.delayedCall(1000, () => {
            if (this.bowlState === "teflonKelapa") {
              this.setVesselTexture(this.Teflon, "Sangrai");
              this.bowlState = "sangrai";
              this.nextStep();
            }
          });
        });
      }
      // Step 2: Stir the coconut
      else if (dropZone === this.teflonZone && this.bowlState === "sangrai" && droppedKey === "Sepatula" && this.currentStep === 1) {
        // Set ukuran spatula yang konsisten sebelum digunakan
        this.setSpatulaScale(gameObject);
        this.executeStirringAnimation(gameObject);
      }
      // Step 3: Add kemangi to wajan first - Reset wajan di awal step
      else if (dropZone === this.wajanZone && droppedKey === "Kemangi" && this.currentStep === 2) {
        // Reset wajan sepenuhnya di awal step 3
        if (this.wajanState === "empty") {
          this.resetWajanCompletely();
        }
        
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "Tambahankemangi");
          this.wajanState = "kemangi";
        });
      }
      // Step 3: Add kol after kemangi
      else if (dropZone === this.wajanZone && this.wajanState === "kemangi" && droppedKey === "Kol" && this.currentStep === 2) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "tambahanKol");
          this.wajanState = "kol";
        });
      }
      // Step 3: Add bawang putih after kol
      else if (dropZone === this.wajanZone && this.wajanState === "kol" && droppedKey === "BawangPutih" && this.currentStep === 2) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "tambahanBawangPutih");
          this.wajanState = "bawangPutih";
          this.nextStep();
        });
      }
      // Step 4: Add cabe and bawang merah together
      else if (dropZone === this.wajanZone && this.currentStep === 3 && (droppedKey === "Cabe" || droppedKey === "BawangMerah")) {
        console.log(`Step 4: Adding ${droppedKey}`); // Debug log
        if (droppedKey === "Cabe") {
          this.hasCabe = true;
          this.executeSuccessfulDrop(gameObject, () => {});
        } else if (droppedKey === "BawangMerah") {
          this.hasBawangMerah = true;
          this.executeSuccessfulDrop(gameObject, () => {});
        }
        
        // Setelah kedua bahan dimasukkan, update texture wajan tanpa menggeser posisi
        if (this.hasCabe && this.hasBawangMerah) {
          console.log("Both cabe and bawang merah added, updating texture"); // Debug log
          // Simpan posisi wajan saat ini
          const currentX = this.Wajan.x;
          const currentY = this.Wajan.y;
          const currentScale = this.Wajan.scale;
          
          this.setVesselTexture(this.Wajan, "tambahanCabeBawangMerah");
          this.wajanState = "cabeBawangMerah";
          
          // Kembalikan posisi dan scale wajan
          this.Wajan.setPosition(currentX, currentY);
          this.Wajan.setScale(currentScale);
        }
      }
      // Step 4: Add daging after cabe and bawang merah
      else if (dropZone === this.wajanZone && this.wajanState === "cabeBawangMerah" && droppedKey === "Daging" && this.currentStep === 3) {
        console.log("Step 4: Adding daging"); // Debug log
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "tambahanDaging");
          this.wajanState = "daging";
          this.nextStep(); // Lanjut ke step 5
        });
      }
      // Step 5: Add minyak ikan
      else if (dropZone === this.wajanZone && this.wajanState === "daging" && droppedKey === "MinyakIkan" && this.currentStep === 4) {
        console.log("Step 5: Adding minyak ikan"); // Debug log
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "tambahanMinyak");
          this.wajanState = "minyak";
          this.nextStep(); // Advances to step 6 ("...ambil piring...")
        });
      }
      // Step 6: Place plate on plating area
      else if (dropZone === this.platingZone && this.bowlState === "sangrai" && droppedKey === "Piring" && this.currentStep === 5) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.finalPlate = this.add.image(this.platingZone.x, this.platingZone.y, 'Piring');
          this.finalPlate.setScale(0.4);
          this.finalPlate.setData('targetWidth', this.finalPlate.displayWidth); // Store the initial width
          const plateBounds = this.finalPlate.getBounds();
          this.plateZone = this.add.zone(this.finalPlate.x, this.finalPlate.y, plateBounds.width, plateBounds.height).setRectangleDropZone(plateBounds.width, plateBounds.height);
          this.plateZone.name = "plateZone";
          this.bowlState = "piring_on_plating";
          this.nextStep(); // Advances to step 7 ("Letakkan kelapa sangrai...")
        });
      }
      // Step 7: Teflon to Plate
      else if (this.plateZone && dropZone === this.plateZone && this.bowlState === "piring_on_plating" && gameObject === this.Teflon && this.currentStep === 6) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.finalPlate!, 'PiringKelapa');
          this.Teflon.destroy();
          this.teflonZone.destroy();
          this.KomporTeflon.destroy();
          this.bowlState = "piring_with_kelapa";
          this.nextStep(); // Advances to step 8 ("Ambil sayuran...")
        });
      }
      // Step 8, Part 1: Use Spatula on Wajan to prepare it for moving
      else if (dropZone === this.wajanZone && this.wajanState === "minyak" && droppedKey === "Sepatula" && this.currentStep === 7) {
        // Set ukuran spatula yang konsisten sebelum digunakan
        this.setSpatulaScale(gameObject);
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, 'SepatuladanSayur');
          this.wajanState = "ready_to_plate";
          this.Wajan.setInteractive();
          this.input.setDraggable(this.Wajan, true);
          this.Wajan.name = "WajanWithFood"; // Identify the wajan as ready to be moved
          // Do not advance step, user needs to drag the wajan
        });
      }
      // Step 8, Part 2: Drop the Wajan onto the plate
      else if (this.plateZone && dropZone === this.plateZone && this.bowlState === "piring_with_kelapa" && gameObject.name === "WajanWithFood" && this.currentStep === 7) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.finalPlate!, 'KohuKohu');
          // The gameObject is the Wajan itself, so it's destroyed here
          this.wajanZone.destroy();
          this.KomporWajan.destroy();
          this.bowlState = "finished";
          this.nextStep(); // Advance to final step
          this.showCompletionCelebration();
        });
      }
      // Invalid drop
      else {
        this.executeInvalidDrop(gameObject);
      }
    });
  }

  // Helper methods for better code organization
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
        this.showSuccessFeedback();
      }
    });
  }

  // Function untuk membersihkan wajan sebelum menambahkan bahan baru
  private clearWajan() {
    // Reset wajan ke state kosong
    this.setVesselTexture(this.Wajan, "Wajan");
    this.wajanState = "empty";
    // Jangan reset hasCabe dan hasBawangMerah karena masih dalam proses step yang sama
  }

  // Function untuk reset wajan sepenuhnya (untuk step baru)
  private resetWajanCompletely() {
    this.setVesselTexture(this.Wajan, "Wajan");
    this.wajanState = "empty";
    this.hasCabe = false;
    this.hasBawangMerah = false;
  }

  // Function untuk mengatur ukuran spatula yang konsisten
  private setSpatulaScale(spatula: Phaser.GameObjects.Image) {
    // Set ukuran spatula yang lebih kecil dan konsisten
    spatula.setScale(0.15); // Ukuran yang lebih kecil dari sebelumnya
    spatula.setData('initialScale', 0.15);
  }

  private executeSuccessfulMove(gameObject: Phaser.GameObjects.Image, targetX: number, targetY: number) {
    this.tweens.add({
      targets: gameObject,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.showSuccessFeedback();
      }
    });
  }

  private executeStirringAnimation(spatula: Phaser.GameObjects.Image) {
    this.bowlState = "aduk";
    
    // Return spatula with smooth animation
    this.tweens.add({
      targets: spatula,
      x: spatula.getData('dragStartX'),
      y: spatula.getData('dragStartY'),
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Enhanced stirring animation
    const stirTextures = ["TambahanSepatula", "AdukKohu1", "AdukKohu2"];
    let stirIndex = 0;
    
    this.stirringTimer = this.time.addEvent({
      delay: 350,
      repeat: 7,
      callback: () => {
        this.setVesselTexture(this.Teflon, stirTextures[stirIndex % stirTextures.length]);
        stirIndex++;
        
        // Enhanced stirring effects
        this.tweens.add({
          targets: this.Teflon,
          scaleX: this.layoutConfig.vesselScale * 1.05,
          scaleY: this.layoutConfig.vesselScale * 0.95,
          duration: 175,
          yoyo: true,
          ease: 'Power2'
        });

        // Add steam particles
        this.createSteamEffect(this.Teflon.x, this.Teflon.y - 50);
      }
    });

    this.time.delayedCall(2800, () => {
      if (this.stirringTimer) {
        this.stirringTimer.destroy();
        this.stirringTimer = null;
      }
      this.setVesselTexture(this.Teflon, "Sangrai");
      this.bowlState = "sangrai";
      this.nextStep();
      this.showSuccessFeedback();
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
    
    // Shake effect
    this.cameras.main.shake(150, 0.008);
    
    // Show brief error indicator
    const errorText = this.add.text(gameObject.x, gameObject.y - 50, "✘", {
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
    // Simple steam particle effect
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
    
    const completionText = this.add.text(centerX, centerY, "Kohu Kohu Berhasil Dibuat!", {
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

  update() {
    // Update method can be used for any continuous game logic if needed
  }

  private setVesselTexture(vessel: Phaser.GameObjects.Image, textureKey: string) {
    const targetWidth = vessel.getData('targetWidth');
    if (!targetWidth) {
      console.error('Target width not set for vessel', vessel);
      return;
    }

    vessel.setTexture(textureKey);
    
    const newTexture = this.textures.get(textureKey);
    if (!newTexture || !newTexture.source || !newTexture.source[0]) return;

    const newBaseWidth = newTexture.source[0].width;

    if (newBaseWidth > 0) {
      const newScale = targetWidth / newBaseWidth;
      vessel.setScale(newScale);
    }
    
    // Debug: Log perubahan texture
    console.log(`Wajan texture changed to: ${textureKey}, State: ${this.wajanState}`);
  }
}