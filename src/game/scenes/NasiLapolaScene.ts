// src/game/scenes/NasiLapolaScene.ts - Improved with CSS-based Layout
import * as Phaser from "phaser";

// State untuk panci-panci individual
type PotState =
  | "empty"
  | "air"
  | "kacang_mentah"
  | "kacang_matang"
  | "kelapa_mentah"
  | "kelapa_matang"
  | "beras_mentah"
  | "beras_diaduk"
  | "beras_matang"
  | "beras_kelapa"
  | "beras_kelapa_garam"
  | "kelapa_garam"
  | "final"
  | "kukus"
  | "plated";

interface GameStep {
  id: number;
  text: string;
  character: string;
  isCompleted: boolean;
}

export default class NasiLapolaScene extends Phaser.Scene {
  // Definisikan semua objek game
  private panciKiri!: Phaser.GameObjects.Image;
  private panciKanan!: Phaser.GameObjects.Image;
  private komporKiri!: Phaser.GameObjects.Image;
  private komporKanan!: Phaser.GameObjects.Image;
  private panciMasak: Phaser.GameObjects.Image | null = null;
  private panciKukus: Phaser.GameObjects.Image | null = null;

  private komporKiriZone!: Phaser.GameObjects.Zone;
  private komporKananZone!: Phaser.GameObjects.Zone;
  private stagingZone!: Phaser.GameObjects.Zone;

  // State untuk setiap panci
  private statePanciKiri: PotState = "air";
  private statePanciKanan: PotState = "air";
  private statePanciMasak: PotState = "empty";
  private statePanciKukus: PotState = "empty";

  // Status penempatan panci
  private isPanciKiriStaged = false;
  private isPanciKananStaged = false;

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


  // Layout configuration - dapat diatur secara manual
    private layoutConfig = {
    // Header bar
    headerHeight: 60,
    
    // Ingredients panel
    ingredientsPanelWidth: 350,
    ingredientsPanelX: 0, // Will be calculated
    ingredientsPanelY: 155,
    ingredientsPanelHeight: 450, // Tinggi tetap untuk wrap content
    
    // Cooking area
    cookingAreaLeft: 20,
    cookingAreaTop: 70,
    cookingAreaRight: 290, // Account for ingredients panel
    cookingAreaBottom: 180, // Account for dialog panel
    
    // Dialog panel
    dialogPanelHeight: 120, // Dikecilkan
    dialogPanelY: 0, // Will be calculated
    dialogPanelLeft: 15,
    dialogPanelRight: 290,

    // Character
    characterX: 1010,
    characterY: 500,

    // Stoves & Pots
    stoveSpacing: 500,
    stoveScale: 0.45,
    potScale: 0.45,
    
    // Staging area
    stagingAreaX: 200,
    stagingAreaY: 300,
    stagingAreaWidth: 300,
    stagingAreaHeight: 225
  }

  // Game steps
  private gameSteps: GameStep[] = [
    {
     id:1,
      text: "Proses pembuatan nasi lapola diawali dengan merebus kacang yang sudah dicuci bersih.",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 2,
      text: "Siapkan parutan kelapa dan masukkan ke panci untuk dikukus.",
      character: "karakter2.png",
      isCompleted: false
    },
    {
      id: 3,
      text: "Tiriskan kacang dan kukusan kelapa yang sudah direbus dan dikukus.",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 4,
      text: "Kemudian masukkan beras yang dicuci 3 kali kedalam wajan baru.",
      character: "karakter4.png",
      isCompleted: false
    },
    {
      id: 5,
      text: "Aduk nasi dengan spatula agar matang merata.",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 6,
      text: "Saat nasi setengah matang tambahkan Garam, Kukusan kelapa dan kacang rebus, kemudian aduk hingga rata.",
      character: "karakter6.png",
      isCompleted: false
    },
    {
      id: 7,
      text: "Siapkan panci kukus baru, kemudian masukkan nasi yang matang kedalam panci kukus.",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 8,
      text: "Setelah matang, Nasi Lapola siap untuk disajikan ke piring.",
      character: "karakter2.png",
      isCompleted: false
    }
  ];

  constructor() {
    super("NasiLapolaScene");
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/kitchen.png");
    this.load.image("Kompor", "/assets/foods/kohu_kohu/Kompor.png");

    // Alat & Bahan
    this.load.image("PanciAir", "/assets/foods/nasi_lapola/PanciAir.png");
    this.load.image("PanciAir2", "/assets/foods/nasi_lapola/PanciAir2.png");
    this.load.image("Kacang", "/assets/foods/nasi_lapola/Kacang.png");
    this.load.image("Kelapa", "/assets/foods/kohu_kohu/Kelapa.png");
    this.load.image("Beras", "/assets/foods/nasi_lapola/Beras.png");
    this.load.image("Garam", "/assets/foods/nasi_lapola/Garam.png");
    this.load.image("Sepatula", "/assets/foods/kohu_kohu/sepatula.png");

    // Variasi Panci
    this.load.image("PanciKacang", "/assets/foods/nasi_lapola/PanciKacang.png");
    this.load.image("PanciSaring", "/assets/foods/nasi_lapola/PanciSaring.png");
    this.load.image("PanciKelapa", "/assets/foods/nasi_lapola/PanciKelapa.png");
    this.load.image("PanciBeras", "/assets/foods/nasi_lapola/PanciBeras.png");
    this.load.image("PanciKelapaGaram", "/assets/foods/nasi_lapola/PanciKelapaGaram.png");
    this.load.image("PanciKacang2", "/assets/foods/nasi_lapola/PanciKacang2.png");
    this.load.image("PanciBerasKelapa", "/assets/foods/nasi_lapola/PanciBerasKelapa.png");
    this.load.image("PanciNasiLapola", "/assets/foods/nasi_lapola/PanciNasiLapola.png");

    // Animasi Aduk
    this.load.image("PanciAirSepatula", "/assets/foods/nasi_lapola/PanciAirSepatula.png");
    this.load.image("PanciAirSepatula2", "/assets/foods/nasi_lapola/PanciAirSepatula2.png");
    this.load.image("PanciAirSepatula3", "/assets/foods/nasi_lapola/PanciAirSepatula3.png");
    this.load.image("AdukKacang", "/assets/foods/nasi_lapola/AdukKacang.png");
    this.load.image("AdukKacang2", "/assets/foods/nasi_lapola/AdukKacang2.png");
    this.load.image("Piring", "/assets/foods/nasi_lapola/Piring.png");
    this.load.image("KukusNasi", "/assets/foods/nasi_lapola/KukusNasi.png");
    this.load.image("NasiLapola", "/assets/foods/nasi_lapola/NasiLapola.png");

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
    this.add.image(0,0, "background").setOrigin(0);
    // Calculate layout positions
    this.calculateLayout();

    // Create game elements in the cooking area
    this.createCookingArea();

    // Create UI components that will be controlled by CSS
    this.createIngredientsPanel();
    this.createDialogPanel();

    // Initial update of panel visuals
    this.updateIngredientsPanelVisuals();

    // Setup ingredient panel layout
    // Example: Set ingredient panel position using x and y coordinates
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
    
    
    // Calculate dialog panel position
    this.layoutConfig.dialogPanelY = gameHeight - this.layoutConfig.dialogPanelHeight - 15;
    
    // Update cooking area bounds
    this.layoutConfig.cookingAreaRight = gameWidth - this.layoutConfig.ingredientsPanelWidth - 40;
    this.layoutConfig.cookingAreaBottom = gameHeight - this.layoutConfig.dialogPanelHeight - 40;
  }

  private setupStoveLayout(hAlign: string, vAlign: string, spacing: number, padding: number) {
    const { cookingAreaLeft, cookingAreaRight, cookingAreaTop, cookingAreaBottom } = this.layoutConfig;

    // Determine Y position based on vertical alignment
    let yPosition;
    switch (vAlign) {
      case 'top':
        yPosition = cookingAreaTop + padding;
        break;
      case 'middle':
        yPosition = (cookingAreaTop + cookingAreaBottom) / 2;
        break;
      default: // bottom
        yPosition = cookingAreaBottom - padding;
        break;
    }

    // Determine X positions based on horizontal alignment
    let leftX, rightX;
    switch (hAlign) {
      case 'left':
        leftX = cookingAreaLeft + padding;
        rightX = leftX + spacing;
        break;
      case 'right':
        rightX = cookingAreaRight - padding;
        leftX = rightX - spacing;
        break;
      default: // center
        const centerX = (cookingAreaLeft + cookingAreaRight) / 2;
        leftX = centerX - spacing / 2;
        rightX = centerX + spacing / 2;
        break;
    }

    this.setStoveCoordinates(leftX, yPosition, rightX, yPosition);
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

  private setStoveCoordinates(leftX: number, leftY: number, rightX: number, rightY: number) {
    // Set position for left stove and its zone
    if (this.komporKiri) {
      this.komporKiri.setPosition(leftX, leftY);
      this.komporKiriZone.setPosition(leftX, leftY - 60);
    }

    // Set position for right stove and its zone
    if (this.komporKanan) {
      this.komporKanan.setPosition(rightX, rightY);
      this.komporKananZone.setPosition(rightX, rightY - 60);
    }
  }

  private createCookingArea() {
    // Calculate cooking area center
    const cookingCenterX = (this.layoutConfig.cookingAreaLeft + this.layoutConfig.cookingAreaRight) / 2;
    const cookingCenterY = (this.layoutConfig.cookingAreaTop + this.layoutConfig.cookingAreaBottom) / 2;
    
    // Kompor positioning
    const komporY = this.layoutConfig.cookingAreaBottom - 100;
    
    // Kompor kiri
    this.komporKiri = this.add.image(0, 0, "Kompor").setScale(this.layoutConfig.stoveScale);
    
    this.komporKiriZone = this.add.zone(0, 0, 120, 120).setRectangleDropZone(120, 120);
    this.komporKiriZone.name = "komporKiri";

    // Kompor kanan
    this.komporKanan = this.add.image(0, 0, "Kompor").setScale(this.layoutConfig.stoveScale);
    
    this.komporKananZone = this.add.zone(0, 0, 120, 120).setRectangleDropZone(120, 120);
    this.komporKananZone.name = "komporKanan";

    // Atur posisi kompor secara manual dengan koordinat (x, y).
    // Anda bisa mengubah angka-angka di bawah ini untuk memindahkan kompor.
    // Format: setStoveCoordinates(kiriX, kiriY, kananX, kananY)
    this.setStoveCoordinates(650, 600, 1150, 600);

    // Pemanggilan fungsi layout berbasis perataan (non-aktif).
    // this.setupStoveLayout('center', 'bottom', this.layoutConfig.stoveSpacing, 100);
    
    // Staging zone
    this.stagingZone = this.add.zone(
      this.layoutConfig.cookingAreaLeft + this.layoutConfig.stagingAreaX,
      this.layoutConfig.cookingAreaTop + this.layoutConfig.stagingAreaY,
      this.layoutConfig.stagingAreaWidth,
      this.layoutConfig.stagingAreaHeight
    ).setRectangleDropZone(this.layoutConfig.stagingAreaWidth, this.layoutConfig.stagingAreaHeight);
    this.stagingZone.name = "staging";

    // Visual indicator untuk staging area (gaya baru)
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
      "Area Staging",
      {
        fontSize: '14px',
        fontFamily: 'Chewy, cursive',
        color: '#FFE4B5',
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0.5);

    // Initial pots
    this.panciKiri = this.add.image(
      this.komporKiriZone.x, 
      this.komporKiriZone.y, 
      "PanciAir"
    ).setScale(this.layoutConfig.potScale).setInteractive();
    
    this.panciKanan = this.add.image(
      this.komporKananZone.x, 
      this.komporKananZone.y, 
      "PanciSaring"
    ).setScale(this.layoutConfig.potScale).setInteractive();
  }

  private createIngredientsPanel() {
    // Create ingredients panel container (positioned by CSS)
    this.ingredientsPanel = this.add.container(
      this.layoutConfig.ingredientsPanelX,
      this.layoutConfig.ingredientsPanelY
    );

    // Panel background
    this.panelBg = this.add.graphics();
    this.ingredientsPanel.add(this.panelBg);

    // Panel title
    this.panelTitle = this.add.text(0, 0, "", {}); // Initialized with empty values
    this.ingredientsPanel.add(this.panelTitle);

    // Menu toggle button
    this.menuToggleButton = this.add.image(0, 0, "menu_normal"); // Initialized with empty values
    this.ingredientsPanel.add(this.menuToggleButton);

    this.createIngredients();
  }

  private createIngredients() {
    // Destroy existing ingredient items to prevent duplicates
    this.ingredientItems.forEach(item => item.destroy());
    this.ingredientItems = [];

    const ingredients = [
      { key: "Kacang", name: "Kacang", scale: 0.2 },
      { key: "Kelapa", name: "Kelapa", scale: 0.2 },
      { key: "Beras", name: "Beras", scale: 0.2 },
      { key: "Garam", name: "Garam", scale: 0.2 },
      { key: "Sepatula", name: "Spatula", scale: 0.1 },
      { key: "PanciAir2", name: "Panci", scale: 0.1 },
      { key: "PanciSaring", name: "Panci Saring", scale: 0.1 },
      { key: "Piring", name: "Piring", scale: 0.15 }
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
    progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 15, (dialogWidth - 40) * 0.125, 6, 3);
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

    // Update panel title position and text
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

    // Update menu toggle button position and interactivity
    this.menuToggleButton.setPosition(30, 30);
    this.menuToggleButton.setScale(0.05);
    this.menuToggleButton.setInteractive();
    this.menuToggleButton.off('pointerover'); // Remove old listeners
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
      
      // Find and update progress bar
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
      
      // Success feedback
      this.cameras.main.flash(200, 144, 238, 144, false);
    }
  }

  private initDragAndDrop() {
    this.input.on("drag", (pointer: any, gameObject: any, dragX: any, dragY: any) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // Visual feedback saat drag dengan enhanced effects
      
      gameObject.setTint(0xFFFFAA);
      
      // Add glow effect
      const originalFilter = gameObject.postPipelines;
      // Add glowing effect or similar visual enhancement here if needed
    });

    this.input.on("dragend", (pointer: any, gameObject: any, dropped: any) => {
      // Reset visual feedback
      gameObject.clearTint();
      
      if (!dropped) { // Only reset scale if not dropped on a valid zone
        const originalScale = gameObject.getData('originalScale') || 
          (gameObject.name === 'Kacang' ? 0.2 : 
           gameObject.name === 'Kelapa' ? 0.18 : 
           gameObject.name === 'Beras' ? 0.2 : 
           gameObject.name === 'Garam' ? 0.16 : 
           gameObject.name === 'Sepatula' ? 0.18 : 
           gameObject.name === 'PanciAir2' ? 0.16 : 
           gameObject.name === 'PanciSaring' ? 0.16 : 
           gameObject.name === 'Piring' ? 0.17 : 0.15);
        gameObject.setScale(originalScale);
        
        // Smooth return with bounce effect
        this.tweens.add({
          targets: gameObject,
          x: gameObject.input.dragStartX,
          y: gameObject.input.dragStartY,
          duration: 400,
          ease: 'Back.easeOut'
        });
      }
      // If 'dropped' is true, the scale should be handled by the drop zone's logic,
      // or it should retain its current scale if no specific scale is set by the drop zone.
    });

    // Enhanced drop handling dengan improved feedback
    this.input.on("drop", (pointer: any, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedKey = gameObject.name;

      // Step 1: Add beans to left pot
      if (dropZone === this.komporKiriZone && this.statePanciKiri === "air" && droppedKey === "Kacang" && this.currentStep === 0) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciKiri.setTexture("PanciKacang");
          this.statePanciKiri = "kacang_matang";
          this.input.setDraggable(this.panciKiri);
          this.nextStep();
        });
      }
      // Step 2: Add coconut to right pot
      else if (dropZone === this.komporKananZone && this.statePanciKanan === "air" && droppedKey === "Kelapa" && this.currentStep === 1) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciKanan.setTexture("PanciKelapa");
          this.statePanciKanan = "kelapa_matang";
          this.input.setDraggable(this.panciKanan);
          this.nextStep();
        });
      }
      // Step 3: Move pots to staging area
      else if (dropZone === this.stagingZone && this.currentStep === 2) {
        if (gameObject === this.panciKiri && this.statePanciKiri === "kacang_matang") {
          this.isPanciKiriStaged = true;
          this.executeSuccessfulMove(gameObject, dropZone.x, dropZone.y - 30);
          if (this.isPanciKananStaged) this.nextStep();
        }
        else if (gameObject === this.panciKanan && this.statePanciKanan === "kelapa_matang") {
          this.isPanciKananStaged = true;
          this.executeSuccessfulMove(gameObject, dropZone.x, dropZone.y + 30);
          if (this.isPanciKiriStaged) this.nextStep();
        }
      }
      // Step 4: Add new pot and rice
      else if ((dropZone === this.komporKiriZone || dropZone === this.komporKananZone) && this.statePanciMasak === "empty" && droppedKey === "PanciAir2" && this.currentStep === 3) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciMasak = this.add.image(dropZone.x, dropZone.y, "PanciAir2").setScale(this.layoutConfig.potScale).setInteractive();
          this.input.setDraggable(this.panciMasak);
          this.statePanciMasak = "air";
        });
      }
      else if (this.panciMasak && this.panciMasak.texture.key === "PanciAir2" && 
               Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && 
               this.statePanciMasak === "air" && droppedKey === "Beras" && this.currentStep === 3) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.statePanciMasak = "beras_mentah";
          this.nextStep();
        });
      }
      // Step 5: Stir rice with enhanced animation
      else if (this.panciMasak && this.panciMasak.texture.key === "PanciAir2" && 
               Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && 
               this.statePanciMasak === "beras_mentah" && droppedKey === "Sepatula" && this.currentStep === 4) {
        this.executeStirringAnimation(gameObject);
      }
      // Step 6: Add coconut and beans
      else if (this.panciMasak && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && 
               this.statePanciMasak === "beras_matang" && gameObject === this.panciKanan && 
               this.statePanciKanan === "kelapa_matang" && this.currentStep === 5) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciMasak.setTexture("PanciBerasKelapa");
          this.statePanciMasak = "beras_kelapa";
          this.panciKanan.destroy();
          this.isPanciKananStaged = false;
        });
      }
      else if (this.panciMasak && this.panciMasak.texture.key === "PanciBerasKelapa" && 
               Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && 
               this.statePanciMasak === "beras_kelapa" && droppedKey === "Garam" && this.currentStep === 5) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.statePanciMasak = "beras_kelapa_garam";
        });
      }
      else if (this.panciMasak && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && 
               this.statePanciMasak === "beras_kelapa_garam" && gameObject === this.panciKiri && 
               this.statePanciKiri === "kacang_matang" && this.currentStep === 5) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciMasak.setTexture("PanciNasiLapola");
          this.statePanciMasak = "final";
          this.panciKiri.destroy();
          this.isPanciKiriStaged = false;
          this.nextStep();
        });
      }
      // Step 7: Steam the rice
      else if ((dropZone === this.komporKiriZone || dropZone === this.komporKananZone) && 
               !this.panciKukus && droppedKey === "PanciSaring" && this.currentStep === 6) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciKukus = this.add.image(dropZone.x, dropZone.y, "PanciSaring").setScale(this.layoutConfig.potScale).setInteractive();
          this.statePanciKukus = "air";
        });
      }
      else if (this.panciKukus && this.statePanciKukus === "air" && gameObject === this.panciMasak && 
               this.statePanciMasak === "final" && Phaser.Geom.Rectangle.Contains(this.panciKukus.getBounds(), pointer.x, pointer.y) && 
               this.currentStep === 6) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciKukus.setTexture("KukusNasi");
          this.statePanciKukus = "kukus";
          this.panciMasak.destroy();
          this.panciMasak = null;
          this.nextStep();
        });
      }
      // Step 8: Serve on plate
      else if (this.panciKukus && this.statePanciKukus === "kukus" && droppedKey === "Piring" && 
               Phaser.Geom.Rectangle.Contains(this.panciKukus.getBounds(), pointer.x, pointer.y) && 
               this.currentStep === 7) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciKukus.setTexture("NasiLapola");
          this.statePanciKukus = "plated";
          this.panciKukus.disableInteractive();
          this.nextStep();
          this.showCompletionCelebration();
        });
      }
      // Invalid drop - return to original position
      else {
        this.executeInvalidDrop(gameObject);
      }
    });
  }

  // Helper methods for better code organization
  private executeSuccessfulDrop(gameObject: Phaser.GameObjects.Image, callback: () => void) {
    // Fade out animation
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
    this.statePanciMasak = "beras_diaduk";
    
    // Return spatula with smooth animation
    this.tweens.add({
      targets: spatula,
      x: spatula.input.dragStartX,
      y: spatula.input.dragStartY,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Enhanced stirring animation with particle effects
    const stirTextures = ["PanciAirSepatula", "PanciAirSepatula2", "PanciAirSepatula3"];
    let stirIndex = 0;
    
    const stirTimer = this.time.addEvent({
      delay: 350,
      repeat: 7,
      callback: () => {
        this.panciMasak.setTexture(stirTextures[stirIndex % stirTextures.length]);
        stirIndex++;
        
        // Enhanced stirring effects
        this.tweens.add({
          targets: this.panciMasak,
          scaleX: this.layoutConfig.potScale * 1.05,
          scaleY: this.layoutConfig.potScale * 0.95,
          duration: 175,
          yoyo: true,
          ease: 'Power2'
        });

        // Add steam particles
        this.createSteamEffect(this.panciMasak.x, this.panciMasak.y - 50);
      }
    });

    this.time.delayedCall(2800, () => {
      stirTimer.destroy();
      this.panciMasak.setTexture("PanciBeras");
      this.panciMasak.setScale(this.layoutConfig.potScale);
      this.statePanciMasak = "beras_matang";
      this.nextStep();
      this.showSuccessFeedback();
    });
  }

  private executeInvalidDrop(gameObject: Phaser.GameObjects.Image) {
    // Enhanced invalid drop feedback
    this.tweens.add({
      targets: gameObject,
      x: gameObject.input.dragStartX,
      y: gameObject.input.dragStartY,
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    // Shake effect and sound feedback
    this.cameras.main.shake(150, 0.008);
    
    // Show brief error indicator
    const errorText = this.add.text(gameObject.x, gameObject.y - 50, "❌", {
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
    
    const completionText = this.add.text(centerX, centerY, "Nasi Lapola Berhasil Dibuat!", {
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

    this.tweens.add({
        targets: dialogElements,
        alpha: 1,
        duration: 500,
        ease: 'Power2',
        delay: this.tweens.stagger(100)
    });
  }

}