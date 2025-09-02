// src/game/scenes/IkanKuahKuningScene.ts - Enhanced with NasiLapola UI System
import * as Phaser from "phaser";

// State untuk panci dan ulekan
type CookingState =
  | "empty"
  | "wajan"
  | "wajan_bumbu_halus"
  | "wajan_lengkuas_daun_bawang"
  | "wajan_daging_air_daun_jahe"
  | "wajan_daun_bawang_tomat"
  | "wajan_asam_jawa"
  | "ulekan"
  | "ulekan_bumbu_halus"
  | "campuran_bumbu_halus"
  | "finished";

interface GameStep {
  id: number;
  text: string;
  character: string;
  isCompleted: boolean;
}

export default class IkanKuahKuningScene extends Phaser.Scene {
  // Definisikan semua objek game
  private wajan!: Phaser.GameObjects.Image;
  private ulekan!: Phaser.GameObjects.Image;
  private kompor!: Phaser.GameObjects.Image;
  private wajanZone!: Phaser.GameObjects.Zone;
  private ulekanZone!: Phaser.GameObjects.Zone;
  private stagingZone!: Phaser.GameObjects.Zone;

  // State untuk peralatan masak
  private stateWajan: CookingState = "wajan";
  private stateUlekan: CookingState = "ulekan";

  // Game state untuk bahan-bahan
  private gameState = {
    hasBawangPutih: false,
    hasBawangMerah: false,
    hasCabai: false,
    hasKunyit: false,
    hasLengkuas: false,
    hasJahe: false,
    hasDaunSalam: false,
    hasDaunSerai: false,
    hasDaunJeruk: false,
    hasAsamJawa: false,
    hasGaram: false,
    hasGula: false,
    hasDagingIkan: false,
    hasAir: false,
    hasTomat: false,
    hasDaunBawang: false,
    hasMangkuk: false
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
  private campuranBumbuHalus: Phaser.GameObjects.Image | null = null;
  private ingredientsContentContainer!: Phaser.GameObjects.Container;
  private scrollbar!: Phaser.GameObjects.Graphics;
  private scrollableArea!: Phaser.GameObjects.Zone;
  private scrollContentHeight: number = 0;
  private draggedItemOriginalParent: Phaser.GameObjects.Container | null = null;
  private draggedItemOriginalX: number = 0;
  private draggedItemOriginalY: number = 0;
  private ingredientsContentMask: Phaser.Display.Masks.GeometryMask | null = null;

  // Layout configuration
  private layoutConfig = {
    // Header bar
    headerHeight: 60,
    
    // Ingredients panel
    ingredientsPanelWidth: 400,
    ingredientsPanelX: 0, // Will be calculated
    ingredientsPanelY: 155,
    ingredientsPanelHeight: 550,
    
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

    // Cooking equipment
    equipmentScale: 0.6,
    
    // Staging area
    stagingAreaX: 200,
    stagingAreaY: 300,
    stagingAreaWidth: 300,
    stagingAreaHeight: 225
  };

  // Game steps dengan dialog yang diminta
  private gameSteps: GameStep[] = [
    {
      id: 1,
      text: "Pertama, kita siapkan dulu bumbu halus-nya. Ambil semua bawang merah, bawang putih, kunyit, dan cabai merah keriting. Sekarang, ulek semuanya sampai halus ya!",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 2,
      text: "Hebat! Bumbu sudah siap. Sekarang, panaskan wajan-mu. Setelah panas, tumis bumbu halus yang tadi kamu ulek. Aduk-aduk sampai wanginya tercium!",
      character: "karakter2.png",
      isCompleted: false
    },
    {
      id: 3,
      text: "Lanjut! Sekarang giliran bahan-bahan aromatik. Masukkan lengkuas, serai, dan daun salam ke dalam wajan. Aduk lagi ya, biar semua bumbu tercampur rata.",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 4,
      text: "Sempurna! Sekarang saatnya bahan utama. Masukkan potongan ikan, irisan jahe, daun jeruk, dan tuang air secukupnya.",
      character: "karakter4.png",
      isCompleted: false
    },
    {
      id: 5,
      text: "Hampir selesai! Sekarang masukkan potongan tomat, serta tambahkan garam dan gula.",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 6,
      text: "Satu lagi yang penting! Masukkan air asam jawa yang sudah dilarutkan. Ini rahasia rasa segarnya, lho!",
      character: "karakter6.png",
      isCompleted: false
    },
    {
      id: 7,
      text: "Terakhir, masak sebentar sampai ikannya matang sempurna. Setelah itu, pindahkan ke mangkuk saji. Ikan Kuah Kuning lezatmu sudah siap! Misi selesai!",
      character: "karakter1.png",
      isCompleted: false
    }
  ];

  constructor() {
    super("IkanKuahKuningScene");
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/kitchen.png");
    this.load.image("Kompor", "/assets/foods/kohu_kohu/Kompor.png");

    // Hasil masakan selesai
    this.load.image('ikan_kuah_kuning_finished', '/assets/foods/ikan_kuahkuning/Ikan Kuah Kuning.png');
    this.load.image('mangkuk_coklat', '/assets/foods/ikan_kuahkuning/MangkukCoklat.png');
    
    // Bahan utama
    this.load.image('daging_ikan', '/assets/foods/ikan_kuahkuning/DagingIkan.png');
    this.load.image('air', '/assets/foods/ikan_kuahkuning/Air.png');
    
    // Bumbu halus
    this.load.image('bawang_putih', '/assets/foods/ikan_kuahkuning/BawangPutih1.png');
    this.load.image('bawang_merah', '/assets/foods/ikan_kuahkuning/BawangMerah.png');
    this.load.image('cabai', '/assets/foods/ikan_kuahkuning/Cabai1.png');
    this.load.image('kunyit', '/assets/foods/ikan_kuahkuning/Kunyit.png');
    this.load.image('lengkuas', '/assets/foods/ikan_kuahkuning/Lengkuas.png');
    this.load.image('jahe', '/assets/foods/ikan_kuahkuning/Jahe.png');
    
    // Bumbu daun
    this.load.image('daun_salam', '/assets/foods/ikan_kuahkuning/DaunSalam.png');
    this.load.image('daun_serai', '/assets/foods/ikan_kuahkuning/DaunSerai.png');
    this.load.image('daun_jeruk', '/assets/foods/ikan_kuahkuning/DaunJeruk1.png');
    this.load.image('daun_bawang', '/assets/foods/ikan_kuahkuning/DaunBawang.png');
    
    // Bumbu tambahan
    this.load.image('asam_jawa', '/assets/foods/ikan_kuahkuning/AsamJawa.png');
    this.load.image('garam', '/assets/foods/ikan_kuahkuning/Garam1.png');
    this.load.image('gula', '/assets/foods/ikan_kuahkuning/Gula1.png');
    this.load.image('tomat', '/assets/foods/ikan_kuahkuning/Tomat.png');
    
    // Peralatan
    this.load.image('ulekan', '/assets/foods/ikan_kuahkuning/Ulekan1.png');
    this.load.image('ulekan_bumbu_halus', '/assets/foods/ikan_kuahkuning/UlekanBumbuHalus.png');
    this.load.image('campuran_bumbu_halus', '/assets/foods/ikan_kuahkuning/CampuranBumbuHalus.png');
    
    // Wajan dan berbagai state
    this.load.image('wajan', '/assets/foods/ikan_kuahkuning/Wajan1.png');
    this.load.image('wajan_bumbu_halus', '/assets/foods/ikan_kuahkuning/WajanBumbuHalus.png');
    this.load.image('wajan_asam_jawa', '/assets/foods/ikan_kuahkuning/WajanAsamJawa.png');
    this.load.image('wajan_daging_air_daun_jahe', '/assets/foods/ikan_kuahkuning/WajanDagingAirDaunJahe.png');
    this.load.image('wajan_daun_bawang_tomat', '/assets/foods/ikan_kuahkuning/WajanDaunBawangTomat.png');
    this.load.image('wajan_lengkuas_daun_bawang', '/assets/foods/ikan_kuahkuning/WajanLengkuasDaunBawang.png');

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
    // Kompor
    this.kompor = this.add.image(700, 700, "Kompor").setScale(this.layoutConfig.equipmentScale);
    
    // Wajan
    this.wajan = this.add.image(650, 540, "wajan")
      .setScale(this.layoutConfig.equipmentScale)
      .setInteractive();
    this.input.setDraggable(this.wajan);

    // Ulekan
    this.ulekan = this.add.image(1200, 600, "ulekan")
      .setScale(this.layoutConfig.equipmentScale)
      .setInteractive();
    this.input.setDraggable(this.ulekan);

    // Create drop zones
    this.wajanZone = this.add.zone(650, 540, 120, 120).setRectangleDropZone(120, 120);
    this.wajanZone.name = "wajanZone";

    this.ulekanZone = this.add.zone(350, 500, 120, 120).setRectangleDropZone(120, 120);
    this.ulekanZone.name = "ulekanZone";
    
    // Staging zone
    this.stagingZone = this.add.zone(
      this.layoutConfig.cookingAreaLeft + this.layoutConfig.stagingAreaX,
      this.layoutConfig.cookingAreaTop + this.layoutConfig.stagingAreaY,
      this.layoutConfig.stagingAreaWidth,
      this.layoutConfig.stagingAreaHeight
    ).setRectangleDropZone(this.layoutConfig.stagingAreaWidth, this.layoutConfig.stagingAreaHeight);
    this.stagingZone.name = "staging";

    // Visual indicator untuk staging area
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
  }

  private createIngredientsPanel() {
    // Create ingredients panel container (main container for the whole panel)
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

    // Create a scrollable area (zone) for ingredients
    const scrollableAreaX = 15; // Relative to ingredientsPanel
    const scrollableAreaY = 100; // Relative to ingredientsPanel, below title
    const scrollableAreaWidth = this.layoutConfig.ingredientsPanelWidth - 70; // Panel width minus padding
    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - scrollableAreaY - 5; // Remaining height

    this.scrollableArea = this.add.zone(
      scrollableAreaX + scrollableAreaWidth / 2,
      scrollableAreaY + scrollableAreaHeight / 2,
      scrollableAreaWidth,
      scrollableAreaHeight
    ).setOrigin(0.5, 0.5);
    this.ingredientsPanel.add(this.scrollableArea);

    // Create a container for the actual ingredient items
    this.ingredientsContentContainer = this.add.container(scrollableAreaX, scrollableAreaY);
    this.ingredientsPanel.add(this.ingredientsContentContainer);

    // Set up a clipping mask for the ingredients content
    const maskGraphics = this.make.graphics();
    maskGraphics.fillRect(0, 0, scrollableAreaWidth, scrollableAreaHeight); // Define mask in local coordinates
    this.ingredientsContentMask = maskGraphics.createGeometryMask(); // Store the mask object
    this.ingredientsContentContainer.setMask(this.ingredientsContentMask); // Apply the stored mask

    // Position the maskGraphics to align with the scrollable area in world coordinates
    maskGraphics.x = this.ingredientsPanel.x + scrollableAreaX;
    maskGraphics.y = this.ingredientsPanel.y + scrollableAreaY;

    // Create scrollbar
    this.scrollbar = this.add.graphics();
    this.ingredientsPanel.add(this.scrollbar);

    this.createIngredients();

    // Enable mouse wheel scrolling
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      // Check if the mouse pointer is within the ingredients panel's scrollable area
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
  }

  private createIngredients() {
    // Destroy existing ingredient items to prevent duplicates
    this.ingredientItems.forEach(item => item.destroy());
    this.ingredientItems = [];
    this.ingredientsContentContainer.removeAll(true); // Clear previous items from the container

    const ingredients = [
      { key: "bawang_putih", name: "Bawang Putih", scale: 0.15 },
      { key: "bawang_merah", name: "Bawang Merah", scale: 0.15 },
      { key: "cabai", name: "Cabai", scale: 0.15 },
      { key: "kunyit", name: "Kunyit", scale: 0.15 },
      { key: "lengkuas", name: "Lengkuas", scale: 0.15 },
      { key: "jahe", name: "Jahe", scale: 0.15 },
      { key: "daun_salam", name: "Daun Salam", scale: 0.15 },
      { key: "daun_serai", name: "Daun Serai", scale: 0.15 },
      { key: "daun_jeruk", name: "Daun Jeruk", scale: 0.15 },
      { key: "daun_bawang", name: "Daun Bawang", scale: 0.15 },
      { key: "daging_ikan", name: "Daging Ikan", scale: 0.15 },
      { key: "air", name: "Air", scale: 0.15 },
      { key: "tomat", name: "Tomat", scale: 0.15 },
      { key: "garam", name: "Garam", scale: 0.15 },
      { key: "gula", name: "Gula", scale: 0.15 },
      { key: "asam_jawa", name: "Asam Jawa", scale: 0.15 },
      { key: "mangkuk_coklat", name: "Mangkuk", scale: 0.15 }
    ];

    // Manual grid layout
    const panelWidth = this.layoutConfig.ingredientsPanelWidth;
    const startX = panelWidth / 6;
    const startY = 100; // Adjusted startY for content container
    const spacingX = panelWidth / 2;
    const spacingY = 90;
    const itemsPerRow = 2;

    let maxContentY = 0;

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
      this.ingredientsContentContainer.add(itemBg); // Add to content container

      // Item image
      const item = this.add.image(x, y, ingredient.key)
        .setInteractive()
        .setScale(ingredient.scale)
        .setName(ingredient.key);

      this.ingredientItems.push(item);
      this.input.setDraggable(item);
      this.ingredientsContentContainer.add(item); // Add to content container

      // Item label
      const label = this.add.text(x, y + 40, ingredient.name, {
        fontSize: '14px',
        fontFamily: 'Chewy, cursive',
        color: '#FFE4B5',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      this.ingredientsContentContainer.add(label); // Add to content container

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
      maxContentY = Math.max(maxContentY, y + 40); // Track the lowest point of content
    });

    this.scrollContentHeight = maxContentY + startY; // Calculate total content height
    this.updateScrollbar(); // Initial update of scrollbar
  }

  private createDialogPanel() {
    // Create dialog panel container
    this.dialogPanel = this.add.container(
      this.layoutConfig.dialogPanelLeft,
      this.layoutConfig.dialogPanelY
    );

    // const dialogWidth = this.layoutConfig.cookingAreaRight - this.layoutConfig.dialogPanelLeft;
    const dialogWidth = this.layoutConfig.cookingAreaRight - 200;

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
    progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 15, (dialogWidth - 40) * (1/7), 6, 3);
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

    this.updateScrollbar(); // Call updateScrollbar here
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
    this.input.on("dragstart", (pointer: any, gameObject: Phaser.GameObjects.Image) => {
      // Simpan parent dan posisi asli
      this.draggedItemOriginalParent = gameObject.parentContainer;
      this.draggedItemOriginalX = gameObject.x;
      this.draggedItemOriginalY = gameObject.y;

      // Disable the mask on the container by setting it to null
      if (this.ingredientsContentContainer) { // Check if container exists
        this.ingredientsContentContainer.mask = null;
      }

      // Pindahkan gameObject ke scene utama agar tidak terpengaruh mask
      this.children.bringToTop(gameObject); // Pastikan item berada di atas semua objek lain
    });

    this.input.on("drag", (pointer: any, gameObject: any, dragX: any, dragY: any) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // Visual feedback saat drag
      gameObject.setTint(0xFFFFAA);
    });

    this.input.on("dragend", (pointer: any, gameObject: Phaser.GameObjects.Image, dropped: any) => {
      // Reset visual feedback
      gameObject.clearTint();
      
      if (!dropped) {
        const originalScale = this.getOriginalScale(gameObject.name);
        gameObject.setScale(originalScale);
        
        // Kembalikan item ke parent aslinya (ingredientsContentContainer)
        if (this.draggedItemOriginalParent) {
          this.draggedItemOriginalParent.add(gameObject);
          gameObject.x = this.draggedItemOriginalX;
          gameObject.y = this.draggedItemOriginalY;
          
          // Re-enable interactivity explicitly
          gameObject.setInteractive(); 
        } else {
          // Fallback jika parent asli tidak ditemukan (seharusnya tidak terjadi)
          this.tweens.add({
            targets: gameObject,
            x: gameObject.input.dragStartX,
            y: gameObject.input.dragStartY,
            duration: 400,
            ease: 'Back.easeOut'
          });
        }
      }

      // Re-enable the mask on the container if it was disabled
      if (this.ingredientsContentContainer && this.ingredientsContentMask) {
        this.ingredientsContentContainer.mask = this.ingredientsContentMask;
      }

      // Reset properti yang disimpan
      this.draggedItemOriginalParent = null;
      this.draggedItemOriginalX = 0;
      this.draggedItemOriginalY = 0;
    });

    // Enhanced drop handling
    this.input.on("drop", (pointer: any, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedKey = gameObject.name;

      // Step 1: Add ingredients to ulekan for bumbu halus
      if (dropZone === this.ulekanZone && this.stateUlekan === "ulekan" && this.currentStep === 0) {
        if (droppedKey === "bawang_putih" && !this.gameState.hasBawangPutih) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasBawangPutih = true;
            this.checkUlekanComplete();
          });
        }
        else if (droppedKey === "bawang_merah" && !this.gameState.hasBawangMerah) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasBawangMerah = true;
            this.checkUlekanComplete();
          });
        }
        else if (droppedKey === "cabai" && !this.gameState.hasCabai) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasCabai = true;
            this.checkUlekanComplete();
          });
        }
        else if (droppedKey === "kunyit" && !this.gameState.hasKunyit) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasKunyit = true;
            this.checkUlekanComplete();
          });
        }
        else {
          this.executeInvalidDrop(gameObject);
        }
      }
      // Step 2: Add campuran bumbu halus to wajan
      else if (dropZone === this.wajanZone && this.stateWajan === "wajan" && this.currentStep === 1) {
        if (this.campuranBumbuHalus && gameObject === this.campuranBumbuHalus) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.wajan.setTexture("wajan_bumbu_halus");
            this.stateWajan = "wajan_bumbu_halus";
            this.nextStep();
          });
        }
        else {
          this.executeInvalidDrop(gameObject);
        }
      }
      // Step 3: Add lengkuas, serai, daun salam to wajan
      else if (dropZone === this.wajanZone && this.stateWajan === "wajan_bumbu_halus" && this.currentStep === 2) {
        if (droppedKey === "lengkuas" && !this.gameState.hasLengkuas) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasLengkuas = true;
            this.checkAromaticComplete();
          });
        }
        else if (droppedKey === "daun_serai" && !this.gameState.hasDaunSerai) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasDaunSerai = true;
            this.checkAromaticComplete();
          });
        }
        else if (droppedKey === "daun_salam" && !this.gameState.hasDaunSalam) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasDaunSalam = true;
            this.checkAromaticComplete();
          });
        }
        else {
          this.executeInvalidDrop(gameObject);
        }
      }
      // Step 4: Add ikan, jahe, daun jeruk, air to wajan
      else if (dropZone === this.wajanZone && this.stateWajan === "wajan_lengkuas_daun_bawang" && this.currentStep === 3) {
        if (droppedKey === "daging_ikan" && !this.gameState.hasDagingIkan) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasDagingIkan = true;
            this.checkMainIngredientComplete();
          });
        }
        else if (droppedKey === "jahe" && !this.gameState.hasJahe) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasJahe = true;
            this.checkMainIngredientComplete();
          });
        }
        else if (droppedKey === "daun_jeruk" && !this.gameState.hasDaunJeruk) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasDaunJeruk = true;
            this.checkMainIngredientComplete();
          });
        }
        else if (droppedKey === "air" && !this.gameState.hasAir) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasAir = true;
            this.checkMainIngredientComplete();
          });
        }
        else {
          this.executeInvalidDrop(gameObject);
        }
      }
      // Step 5: Add tomat, garam, gula to wajan
      else if (dropZone === this.wajanZone && this.stateWajan === "wajan_daging_air_daun_jahe" && this.currentStep === 4) {
        if (droppedKey === "tomat" && !this.gameState.hasTomat) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasTomat = true;
            this.checkSeasoningComplete();
          });
        }
        else if (droppedKey === "garam" && !this.gameState.hasGaram) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasGaram = true;
            this.checkSeasoningComplete();
          });
        }
        else if (droppedKey === "gula" && !this.gameState.hasGula) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.gameState.hasGula = true;
            this.checkSeasoningComplete();
          });
        }
        else {
          this.executeInvalidDrop(gameObject);
        }
      }
      // Step 6: Add asam jawa to wajan
      else if (dropZone === this.wajanZone && this.stateWajan === "wajan_daun_bawang_tomat" && this.currentStep === 5) {
        if (droppedKey === "asam_jawa" && !this.gameState.hasAsamJawa) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.wajan.setTexture("wajan_asam_jawa");
            this.stateWajan = "wajan_asam_jawa";
            this.gameState.hasAsamJawa = true;
            this.nextStep();
          });
        }
        else {
          this.executeInvalidDrop(gameObject);
        }
      }
      // Step 7: Add mangkuk to finish
      else if (dropZone === this.wajanZone && this.stateWajan === "wajan_asam_jawa" && this.currentStep === 6) {
        if (droppedKey === "mangkuk_coklat" && !this.gameState.hasMangkuk) {
          this.executeSuccessfulDrop(gameObject, () => {
            this.wajan.setTexture("ikan_kuah_kuning_finished");
            this.stateWajan = "finished";
            this.gameState.hasMangkuk = true;
            this.nextStep();
            this.showCompletionCelebration();
          });
        }
        else {
          this.executeInvalidDrop(gameObject);
        }
      }
      // Invalid drop - return to original position
      else {
        this.executeInvalidDrop(gameObject);
      }
    });
  }

  // Helper methods for checking completion of steps
  private checkUlekanComplete() {
    if (this.gameState.hasBawangPutih && this.gameState.hasBawangMerah && 
        this.gameState.hasCabai && this.gameState.hasKunyit) {
      this.createCampuranBumbuHalus();
    }
  }

  private createCampuranBumbuHalus() {
    // Transform ulekan to show bumbu halus
    this.ulekan.setTexture("ulekan_bumbu_halus");
    this.stateUlekan = "ulekan_bumbu_halus";
    
    // Create campuran bumbu halus object after a delay
    this.time.delayedCall(2000, () => {
      this.campuranBumbuHalus = this.add.image(
        this.stagingZone.x, 
        this.stagingZone.y, 
        "campuran_bumbu_halus"
      ).setScale(0.4).setInteractive();
      this.input.setDraggable(this.campuranBumbuHalus);
      this.campuranBumbuHalus.setName("campuran_bumbu_halus");
      
      this.nextStep();
      this.showSuccessFeedback();
    });
  }

  private checkAromaticComplete() {
    if (this.gameState.hasLengkuas && this.gameState.hasDaunSerai && this.gameState.hasDaunSalam) {
      this.wajan.setTexture("wajan_lengkuas_daun_bawang");
      this.stateWajan = "wajan_lengkuas_daun_bawang";
      this.nextStep();
    }
  }

  private checkMainIngredientComplete() {
    if (this.gameState.hasDagingIkan && this.gameState.hasJahe && 
        this.gameState.hasDaunJeruk && this.gameState.hasAir) {
      this.wajan.setTexture("wajan_daging_air_daun_jahe");
      this.stateWajan = "wajan_daging_air_daun_jahe";
      this.nextStep();
    }
  }

  private checkSeasoningComplete() {
    if (this.gameState.hasTomat && this.gameState.hasGaram && this.gameState.hasGula) {
      this.wajan.setTexture("wajan_daun_bawang_tomat");
      this.stateWajan = "wajan_daun_bawang_tomat";
      this.nextStep();
    }
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

  private executeInvalidDrop(gameObject: Phaser.GameObjects.Image) {
    // Enhanced invalid drop feedback
    this.tweens.add({
      targets: gameObject,
      x: gameObject.input.dragStartX,
      y: gameObject.input.dragStartY,
      duration: 400,
      ease: 'Back.easeOut'
    });
    
    // Shake effect
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
    
    const completionText = this.add.text(centerX, centerY, "Ikan Kuah Kuning Berhasil Dibuat!", {
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

  private handleScroll(deltaY: number) {
    const scrollSpeed = 10; // Adjust as needed
    let newY = this.ingredientsContentContainer.y - deltaY * scrollSpeed;

    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 60 - 15; // Same as in createIngredientsPanel
    const maxScroll = Math.max(0, this.scrollContentHeight - scrollableAreaHeight);

    // Clamp the newY value to prevent scrolling beyond content boundaries
    newY = Math.max(-maxScroll, newY);
    newY = Math.min(0, newY); // Cannot scroll above the top

    this.ingredientsContentContainer.y = newY;
    this.updateScrollbar();
  }

  private updateScrollbar() {
    this.scrollbar.clear();

    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 60 - 15; // Same as in createIngredientsPanel
    const scrollbarWidth = 10;
    const scrollbarX = this.layoutConfig.ingredientsPanelWidth - scrollbarWidth - 5; // Position to the right of the panel
    const scrollbarYOffset = 60; // Start below the title

    if (this.scrollContentHeight > scrollableAreaHeight) {
      // Calculate scrollbar height based on content and visible area
      const scrollbarHeight = (scrollableAreaHeight / this.scrollContentHeight) * scrollableAreaHeight;

      // Calculate scrollbar position based on content container's scroll
      const scrollPercentage = -this.ingredientsContentContainer.y / (this.scrollContentHeight - scrollableAreaHeight);
      const scrollbarY = scrollbarYOffset + (scrollableAreaHeight - scrollbarHeight) * scrollPercentage;

      this.scrollbar.fillStyle(0x8B4513, 0.8); // Scrollbar color
      this.scrollbar.fillRoundedRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight, 5);

      // Make scrollbar interactive for dragging
      this.scrollbar.setInteractive(new Phaser.Geom.Rectangle(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight), Phaser.Geom.Rectangle.Contains);
      this.input.setDraggable(this.scrollbar);

      this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        const halfWidth = gameObject.displayWidth / 2;
        const halfHeight = gameObject.displayHeight / 2;
      
        // Clamp supaya tidak keluar dari kamera
        const minX = halfWidth;
        const maxX = this.cameras.main.width - halfWidth;
        const minY = halfHeight;
        const maxY = this.cameras.main.height - halfHeight;
      
        gameObject.x = Phaser.Math.Clamp(dragX, minX, maxX);
        gameObject.y = Phaser.Math.Clamp(dragY, minY, maxY);
      });
      
    } else {
      // If content is not scrollable, hide scrollbar
      this.scrollbar.setVisible(false);
      this.scrollbar.disableInteractive();
    }
  }

  private getOriginalScale(itemName: string): number {
    const scaleMap: { [key: string]: number } = {
      "bawang_putih": 0.15,
      "bawang_merah": 0.15,
      "cabai": 0.15,
      "kunyit": 0.15,
      "lengkuas": 0.15,
      "jahe": 0.15,
      "daun_salam": 0.15,
      "daun_serai": 0.15,
      "daun_jeruk": 0.15,
      "daun_bawang": 0.15,
      "daging_ikan": 0.15,
      "air": 0.15,
      "tomat": 0.15,
      "garam": 0.15,
      "gula": 0.15,
      "asam_jawa": 0.15,
      "mangkuk_coklat": 0.15,
      "campuran_bumbu_halus": 0.4
    };
    return scaleMap[itemName] || 0.15;
  }
}