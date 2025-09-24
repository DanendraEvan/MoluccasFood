// src/game/scenes/KohuKohuScene.ts - Enhanced with UI Components from NasiLapola
import * as Phaser from "phaser";
import ResponsiveGameUtils, { ResponsiveLayout } from "../utils/ResponsiveUtils";
import ResponsiveMixin, { ResponsiveScene } from "../utils/ResponsiveMixin";

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
  | "kacangpanjang"
  | "sawi"
  | "tauge"
  | "cabeBawangMerah"
  | "daging"
  | "minyak"
  | "sepatulaDanSayur"
  | "ready_to_plate"
  | "kohukohu";

type BaskomState = 
  | "empty"
  | "kelapa"
  | "parut1"
  | "parut2"
  | "baskomkelapa";

interface GameStep {
  id: number;
  text: string;
  character: string;
  isCompleted: boolean;
}

export default class KohuKohuScene extends Phaser.Scene implements ResponsiveScene {
  // Dialog bridge for React integration
  public dialogBridge: any = null;
  private useReactDialog: boolean = true; // Flag to use React dialog instead of Phaser dialog (ALWAYS true now)

  // Responsive system
  private responsiveLayout!: ResponsiveLayout;
  private originalIngredientsPanelConfig: any = null;
  // Definisikan semua objek game
  private Teflon!: Phaser.GameObjects.Image;
  private Wajan!: Phaser.GameObjects.Image;
  private KomporWajan!: Phaser.GameObjects.Image;
  private KomporTeflon!: Phaser.GameObjects.Image;
  private baskom!: Phaser.GameObjects.Image;


  // Drop zones
  private wajanZone!: Phaser.GameObjects.Zone;
  private teflonZone!: Phaser.GameObjects.Zone;
  private platingZone!: Phaser.GameObjects.Zone;
  private plateZone: Phaser.GameObjects.Zone | null = null;
  private baskomZone!: Phaser.GameObjects.Zone;

  // State untuk setiap cooking vessel
  private bowlState: BowlState = "empty";
  private wajanState: WajanState = "empty";
  private baskomState: BaskomState = "empty";
  private stirringTimer: Phaser.Time.TimerEvent | null = null;

  // Swipe mechanic state
  private isMengaduk = false;
  private swipeCount = 0;
  private lastSwipeDirection: 'left' | 'right' | null = null;
  private pointerStartX = 0;
  private swipeHintText: Phaser.GameObjects.Text | null = null;

  // Tracking variables
  private hasCabe = false;
  private hasBawangMerah = false;

  private finalPlate: Phaser.GameObjects.Image | null = null;

  // UI Components
  private ingredientsPanel!: Phaser.GameObjects.Container;
  // NOTE: dialogPanel removed - using React dialog system only
  private menuToggleButton!: Phaser.GameObjects.Image;
  // NOTE: characterImage and stepText removed - using React dialog system only
  private isIngredientsPanelOpen = true;
  private currentStep = 0;
  private ingredientItems: Phaser.GameObjects.Image[] = [];
  private panelBg!: Phaser.GameObjects.Graphics;
  private panelTitle!: Phaser.GameObjects.Text;
  private infoContent: string = `Kohu-kohu adalah salad segar dari Maluku! Makanan ini dibuat dari sayuran mentah seperti kacang panjang, tauge, dan kemangi. Bumbunya spesial, yaitu kelapa parut yang disangrai dan dicampur dengan bumbu lain seperti cabai dan bawang. Rasanya segar, gurih, dan sedikit pedas. Enak sekali dimakan bersama nasi!`;

  // Layout configuration
  private layoutConfig = {
    // Header bar
    headerHeight: 60,
    
    // Ingredients panel
    ingredientsPanelWidth: 375,
    ingredientsPanelX: 1100, // Set posisi X manual
    ingredientsPanelY: 300, // Turun 150px lagi dari 755 ke 905
    ingredientsPanelHeight: 600,
    
    // Cooking area
    cookingAreaLeft: 20,
    cookingAreaTop: 70,
    cookingAreaRight: 290,
    cookingAreaBottom: 180,
    
    // NOTE: Dialog panel config removed - using React dialog system

    // dialogPanelHeight: 120,
    // dialogPanelY: 850, // Will be calculated
    // dialogPanelLeft: 50,
    // dialogPanelRight: 20,

    // Character
    characterX: 1000,
    characterY: 500,

    // Stoves & cooking vessels
    stoveSpacing: 500,
    stoveScale: 0.35,
    vesselScale: 0.35,
    
    // Plating area (renamed from staging)
    platingAreaX: 200,
    platingAreaY: 400, // Turun 100px dari 300 ke 400
    platingAreaWidth: 300,
    platingAreaHeight: 225
  }

  // Game steps for Kohu Kohu
  private gameSteps: GameStep[] = [
    {
      id: 1,
      text: "Halo! Mari kita buat Kohu-Kohu. Pertama, ambil Kelapa dari panel bahan di sebelah kanan, lalu seret dan letakkan di atas baskom di tengah.",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 2,
      text: "Bagus! Kelapanya sudah diparut. Sekarang, klik di sekitar kanan Baskom dan seret Baskom berisi kelapa parut dan letakkan di atas teflon di sebelah kanan.",
      character: "karakter2.png",
      isCompleted: false
    },
    {
      id: 3,
      text: "Saatnya menyangrai kelapa. Ambil Spatula dari panel kanan, lalu seret ke atas teflon untuk mulai mengaduk. Geser ke kiri dan kanan berulang kali ya!",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 4,
      text: "Sip, kelapa sangrai sudah jadi! Sekarang, kita siapkan sayurannya. Ambil Kemangi dari panel kanan dan masukkan ke dalam wajan di sebelah kiri.",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 5,
      text: "Lanjutkan dengan mengambil Kacang Panjang dan masukkan ke dalam wajan.",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 6,
      text: "Sekarang, ambil Sawi dan masukkan ke dalam wajan.",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 7,
      text: "Terakhir, ambil Tauge dan masukkan ke dalam wajan.",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 8,
      text: "Biar makin lezat, ayo tambahkan bumbu! Ambil Cabai dan Bawang Merah, lalu masukkan ke wajan. Setelah itu, ambil Ikan Cakalang dan masukkan juga ke wajan ya.",
      character: "karakter4.png",
      isCompleted: false
    },
    {
      id: 9,
      text: "Hampir selesai! Ambil Minyak Ikan dari panel kanan dan tuangkan ke dalam wajan untuk rasa yang lebih mantap.",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 10,
      text: "Bagus! Semua bahan sudah tercampur. Sekarang ambil Piring dari panel bahan dan letakkan di Area Penyajian di sebelah kiri.",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 11,
      text: "Pertama, seret Teflon yang berisi kelapa sangrai dan letakkan di atas piring.",
      character: "karakter6.png",
      isCompleted: false
    },
    {
      id: 12,
      text: "Luar biasa! Sekarang, ambil Spatula dan seret ke wajan untuk mengangkat sayuran. Lalu, bawa sayuran itu ke atas piring.",
      character: "karakter6.png",
      isCompleted: false
    },
    {
      id: 13,
      text: "Wah, kamu hebat! Kohu-Kohu buatanmu sudah jadi dan siap disajikan! Selamat menikmati!",
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
    
    // Load food image for hint popup
    this.load.image('kohukohu_food', '/assets/makanan/kohukohu.png');

    // Tools
    this.load.image("Teflon", "/assets/foods/kohu_kohu/teflonkosong.png");
    this.load.image("Wajan", "/assets/foods/kohu_kohu/wajan.png");
    this.load.image("Sepatula", "/assets/foods/kohu_kohu/sepatula.png");
    this.load.image("Piring", "/assets/foods/kohu_kohu/Piring Kohu.png");
    this.load.image("Baskom", "/assets/foods/kohu_kohu/Baskom.png");
    this.load.image("Parut1", "/assets/foods/kohu_kohu/Parut1.png");
    this.load.image("Parut2", "/assets/foods/kohu_kohu/Parut2.png");

    // Ingredients
    this.load.image("Kelapa", "/assets/foods/kohu_kohu/Kelapa.png");
    this.load.image("Sawi", "/assets/foods/kohu_kohu/Sawi.png");
    this.load.image("Tauge", "/assets/foods/kohu_kohu/Tauge.png");
    this.load.image("KacangPanjang", "/assets/foods/kohu_kohu/KacangPanjang.png");
    this.load.image("Kemangi", "/assets/foods/kohu_kohu/Kemangi.png");
    this.load.image("Cabe", "/assets/foods/kohu_kohu/Cabe.png");
    this.load.image("BawangMerah", "/assets/foods/kohu_kohu/Bawang Merah.png");
    this.load.image("Daging", "/assets/foods/kohu_kohu/Daging.png");
    this.load.image("MinyakIkan", "/assets/foods/kohu_kohu/MinyakIkan.png");

    // Steps / hasil
    this.load.image("Baskomkelapa", "/assets/foods/kohu_kohu/Baskomkelapa.png");
    this.load.image("TeflonKelapa", "/assets/foods/kohu_kohu/teflonkelapa.png");
    this.load.image("Sangrai", "/assets/foods/kohu_kohu/sangrai.png");
    this.load.image("Aduk1", "/assets/foods/kohu_kohu/Aduk1.png");
    this.load.image("Aduk2", "/assets/foods/kohu_kohu/Aduk2.png");
    this.load.image("PiringKelapa", "/assets/foods/kohu_kohu/PiringKelapa.png");
    this.load.image("SepatuladanSayur", "/assets/foods/kohu_kohu/SepatuladanSayur.png");
    this.load.image("KohuKohu", "/assets/foods/kohu_kohu/KohuKohu.png");
    this.load.image("Tambahankemangi", "/assets/foods/kohu_kohu/Tambahankemangi.png");
    this.load.image("tambahanSawi", "/assets/foods/kohu_kohu/tambahanSawi.png");
    this.load.image("tambahanTauge", "/assets/foods/kohu_kohu/tambahanTauge.png");
    this.load.image("tambahanKacangPanjang", "/assets/foods/kohu_kohu/tambahanKacangPanjang.png");
    this.load.image("tambahanCabeBawangMerah", "/assets/foods/kohu_kohu/tambahanCabeBawangMerah.png");
    this.load.image("tambahanDaging", "/assets/foods/kohu_kohu/TambahanDaging.png");
    this.load.image("tambahanMinyak", "/assets/foods/kohu_kohu/tambahanMinyak.png");

    // UI Elements
    this.load.image("menu_normal", "/assets/ui/buttons/menu/menu_normal.png");
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
  }

  create() {
    this.add.image(0, 0, "background").setOrigin(0);

    // Setup responsive system
    this.setupResponsiveSystem();

    // Calculate layout positions
    this.calculateLayout();

    // Create game elements in the cooking area
    this.createCookingArea();

    // Create UI components
    this.createIngredientsPanel();
    // NOTE: Phaser dialog removed completely - using React dialog system only

    // Initial update of panel visuals
    this.updateIngredientsPanelVisuals();

    // Setup ingredient panel layout
    this.setupIngredientsPanelLayout(undefined, undefined, undefined, this.layoutConfig.ingredientsPanelX, this.layoutConfig.ingredientsPanelY);

    // Initialize drag and drop
    this.initDragAndDrop();

    // NOTE: updateStepDisplay removed - using React dialog system only

    // Setup dialog bridge integration
    this.setupDialogBridge();
  }

  private setupResponsiveSystem() {
    // Use mixin untuk setup responsive system
    ResponsiveMixin.setupResponsiveSystem(this);

    // Expose dialog config untuk React
    ResponsiveMixin.exposeDialogConfigToReact(this);

    // Save original config
    this.originalIngredientsPanelConfig = { ...this.layoutConfig };
  }

  private updateResponsiveLayout() {
    // Use mixin untuk update responsive layout
    ResponsiveMixin.updateResponsiveLayout(this);
  }

  private calculateLayout() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Use responsive config if available
    if (this.responsiveLayout) {
      // Already handled in updateResponsiveLayout
    } else {
      // Only auto-calculate if not manually set
      if (this.layoutConfig.ingredientsPanelX === 0) {
        // Fallback to original calculation
        this.layoutConfig.ingredientsPanelX = gameWidth - this.layoutConfig.ingredientsPanelWidth - 15;
      }
    }

    // NOTE: Dialog panel calculation removed - using React dialog system

    // Update cooking area bounds
    this.layoutConfig.cookingAreaRight = gameWidth - this.layoutConfig.ingredientsPanelWidth - 40;
    this.layoutConfig.cookingAreaBottom = gameHeight - 180; // Account for React dialog panel
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
    const gameHeight = this.cameras.main.height;
    const komporYPos = gameHeight - 280; // 280px dari dasar halaman
    const wajanYPos = gameHeight - 350; // Wajan sedikit di atas kompor

    this.KomporWajan = this.add.image(640, komporYPos, "Kompor").setScale(this.layoutConfig.stoveScale);
    this.wajanZone = this.add.zone(640, wajanYPos, 120, 120).setRectangleDropZone(120, 120);
    this.wajanZone.name = "wajanZone";
    this.Wajan = this.add.image(this.wajanZone.x, this.wajanZone.y, "Wajan").setScale(this.layoutConfig.vesselScale);
    this.Wajan.setData('initialScale', this.layoutConfig.vesselScale);
    this.Wajan.setData('targetWidth', this.Wajan.displayWidth);

    // --- Kompor kanan untuk TEFLON - Fixed position ---
    this.KomporTeflon = this.add.image(1140, komporYPos, "Kompor").setScale(this.layoutConfig.stoveScale);
    // Memperbesar drop zone untuk teflon agar lebih mudah drop baskom
    this.teflonZone = this.add.zone(1140, wajanYPos, 180, 180).setRectangleDropZone(180, 180);
    this.teflonZone.name = "teflonZone";

    // Visual indicator untuk drop zone teflon (akan muncul saat dragging baskom)
    const teflonDropIndicator = this.add.graphics();
    teflonDropIndicator.lineStyle(3, 0x00FF00, 0.8);
    teflonDropIndicator.strokeCircle(this.teflonZone.x, this.teflonZone.y, 90);
    teflonDropIndicator.setVisible(false);
    this.teflonZone.setData('dropIndicator', teflonDropIndicator);
    this.Teflon = this.add.image(this.teflonZone.x, this.teflonZone.y, "Teflon").setScale(this.layoutConfig.vesselScale);
    this.Teflon.setData('targetWidth', this.Teflon.displayWidth);
    this.Teflon.setData('initialScale', this.layoutConfig.vesselScale);
    
    // --- Baskom in the center ---
    const baskomX = (this.wajanZone.x + this.teflonZone.x) / 2;
    const baskomY = this.wajanZone.y;
    this.baskom = this.add.image(baskomX, baskomY, "Baskom").setScale(0.3);
    this.baskomZone = this.add.zone(baskomX, baskomY, 120, 120).setRectangleDropZone(120, 120);
    this.baskomZone.name = "baskomZone";

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
      "Area Penyajian",
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
      { key: "Sawi", name: "Sawi", scale: 0.15 },
      { key: "Tauge", name: "Tauge", scale: 0.18 },
      { key: "KacangPanjang", name: "Kacang Panjang", scale: 0.15 },
      { key: "Cabe", name: "Cabai", scale: 0.2 },
      { key: "BawangMerah", name: "Bawang Merah", scale: 0.16 },
      { key: "Daging", name: "Ikan Cakalang", scale: 0.18 },
      { key: "MinyakIkan", name: "Minyak Ikan", scale: 0.16 },
      { key: "Sepatula", name: "Spatula", scale: 0.12 },
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

    // Update panel title with responsive font size
    const titleFontSize = this.responsiveLayout
      ? this.responsiveLayout.infoPanel.titleFontSize
      : 24;

    this.panelTitle.setText("BAHAN & ALAT");
    this.panelTitle.setStyle({
      fontSize: `${titleFontSize}px`,
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

  // NOTE: updateStepDisplay removed - using React dialog system only

  private nextStep() {
    if (this.currentStep >= this.gameSteps.length - 1) return;

    this.gameSteps[this.currentStep].isCompleted = true;
    this.currentStep++;

    // NOTE: updateStepDisplay removed - using React dialog system only

    // Update React dialog system if bridge is available
    if (this.dialogBridge) {
      console.log(`🚀 KohuKohu: Game advancing to step ${this.currentStep + 1}`);
      console.log(`🎯 KohuKohu: Updating dialog to step index ${this.currentStep}`);

      try {
        this.dialogBridge.setStep(this.currentStep);
        console.log('✅ KohuKohu: Dialog update successful');

        // Verify the update
        const verifyStep = this.dialogBridge.getCurrentStep();
        console.log(`🔍 KohuKohu: Verification - dialog is now at step ${verifyStep}`);
      } catch (error) {
        console.error('❌ KohuKohu: Dialog update failed:', error);
      }
    } else {
      console.warn('⚠️ KohuKohu: Dialog bridge not available for step update');
    }

    this.showSuccessFeedback();

    if (this.currentStep === this.gameSteps.length - 1) { // Last step
        this.showCompletionCelebration();
    }
  }

  private initDragAndDrop() {
    this.input.on("dragstart", (pointer: any, gameObject: any) => {
      // Store original position
      gameObject.setData('dragStartX', gameObject.x);
      gameObject.setData('dragStartY', gameObject.y);

      // Store original scale if not already set
      if (!gameObject.getData('originalScale')) {
        gameObject.setData('originalScale', gameObject.scale);
      }

      // Special handling for baskom drag area
      const baskomImage = gameObject.getData('baskomImage');
      if (baskomImage) {
        baskomImage.setTint(0xFFFFAA);

        // Hide drag outline and hint during drag
        const dragOutline = gameObject.getData('dragOutline');
        const dragHint = gameObject.getData('dragHint');
        if (dragOutline) dragOutline.setVisible(false);
        if (dragHint) dragHint.setVisible(false);

        // Show drop indicator for teflon when dragging baskom
        if (gameObject.name === "Baskom" && this.baskomState === "baskomkelapa" && this.currentStep === 1) {
          const dropIndicator = this.teflonZone.getData('dropIndicator');
          if (dropIndicator) {
            dropIndicator.setVisible(true);

            // Add pulsing animation
            this.tweens.add({
              targets: dropIndicator,
              alpha: 0.3,
              duration: 500,
              ease: 'Power2',
              yoyo: true,
              repeat: -1
            });
          }
        }
      }
    });

    this.input.on("drag", (pointer: any, gameObject: any, dragX: any, dragY: any) => {
      gameObject.x = dragX;
      gameObject.y = dragY;

      // Special handling for baskom drag area
      const baskomImage = gameObject.getData('baskomImage');
      if (baskomImage) {
        baskomImage.x = dragX;
        baskomImage.y = dragY;
        baskomImage.setTint(0xFFFFAA);
      } else {
        gameObject.setTint(0xFFFFAA);
      }
    });

    this.input.on("dragend", (pointer: any, gameObject: any, dropped: any) => {
      // Special handling for baskom drag area
      const baskomImage = gameObject.getData('baskomImage');
      if (baskomImage) {
        baskomImage.clearTint();

        // Show drag outline and hint again after drag
        const dragOutline = gameObject.getData('dragOutline');
        const dragHint = gameObject.getData('dragHint');

        // Hide drop indicator when drag ends
        if (gameObject.name === "Baskom") {
          const dropIndicator = this.teflonZone.getData('dropIndicator');
          if (dropIndicator) {
            // Stop pulsing animation and hide
            this.tweens.killTweensOf(dropIndicator);
            dropIndicator.setAlpha(1);
            dropIndicator.setVisible(false);
          }
        }

        if (!dropped) {
          // Show outline and hint again if drag failed
          if (dragOutline) dragOutline.setVisible(true);
          if (dragHint) dragHint.setVisible(true);

          this.tweens.add({
            targets: [gameObject, baskomImage],
            x: gameObject.getData('dragStartX'),
            y: gameObject.getData('dragStartY'),
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
              // Update outline and hint positions
              if (dragOutline) {
                dragOutline.clear();
                dragOutline.lineStyle(2, 0xFFFF00, 0.6);
                dragOutline.strokeRoundedRect(baskomImage.x - 125, baskomImage.y - 125, 250, 250, 10);
              }
              if (dragHint) {
                dragHint.setPosition(baskomImage.x, baskomImage.y - 150);
              }
            }
          });
        }
      } else {
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
      }
    });

    this.input.on("drop", (pointer: any, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedKey = gameObject.name;
      
      // Debug: Log drop attempt
      console.log(`Drop attempt: ${droppedKey} on ${dropZone.name}, Current step: ${this.currentStep}, Wajan state: ${this.wajanState}`);

      // Step 1: Add kelapa to baskom
      if (dropZone === this.baskomZone && this.baskomState === "empty" && droppedKey === "Kelapa" && this.currentStep === 0) {
        this.executeSuccessfulDrop(gameObject, () => {
          const repeatCount = 6; // Total changes: Parut1, Parut2, ...
          let currentCount = 0;
          
          const gratingAnimation = this.time.addEvent({
              delay: 500,
              callback: () => {
                  currentCount++;
                  if (currentCount % 2 !== 0) { // 1, 3, 5
                      this.baskom.setTexture("Parut1");
                  } else { // 2, 4, 6
                      this.baskom.setTexture("Parut2");
                  }
      
                  if (currentCount >= repeatCount) {
                      gratingAnimation.remove();
                      // After animation, set the final state
                      this.time.delayedCall(500, () => {
                          this.baskom.setTexture("Baskomkelapa");
                          this.baskomState = "baskomkelapa";

                          // Buat drag area yang SANGAT besar untuk baskom agar mudah di-drag
                          const dragArea = this.add.zone(this.baskom.x, this.baskom.y, 250, 250);
                          dragArea.setInteractive();
                          dragArea.setName("Baskom");
                          this.input.setDraggable(dragArea);

                          // Store reference to baskom for visual updates
                          dragArea.setData('baskomImage', this.baskom);

                          // Tambahkan visual outline untuk menunjukkan area drag
                          const dragOutline = this.add.graphics();
                          dragOutline.lineStyle(3, 0xFFFF00, 0.8);
                          dragOutline.strokeRoundedRect(this.baskom.x - 125, this.baskom.y - 125, 250, 250, 15);
                          dragArea.setData('dragOutline', dragOutline);

                          // Tambahkan animasi berkedip pada outline
                          this.tweens.add({
                            targets: dragOutline,
                            alpha: 0.3,
                            duration: 800,
                            ease: 'Power2',
                            yoyo: true,
                            repeat: -1
                          });

                          // Tambahkan teks petunjuk
                          const dragHint = this.add.text(this.baskom.x, this.baskom.y - 150, 'DRAG SINI!', {
                            fontSize: '20px',
                            fontFamily: 'Chewy, cursive',
                            color: '#FFFF00',
                            align: 'center',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: { x: 10, y: 5 }
                          }).setOrigin(0.5);
                          dragArea.setData('dragHint', dragHint);

                          // Tambahkan hover effects
                          dragArea.on('pointerover', () => {
                            this.baskom.setTint(0xFFFFAA);
                            dragOutline.setAlpha(1);
                            dragHint.setStyle({ color: '#FFFFFF' });
                          });

                          dragArea.on('pointerout', () => {
                            this.baskom.clearTint();
                            dragOutline.setAlpha(0.6);
                            dragHint.setStyle({ color: '#FFFF00' });
                          });

                          this.nextStep();
                      });
                  }
              },
              repeat: repeatCount - 1
          });
        });
      }
      // Step 2: Add baskomkelapa to teflon
      else if (dropZone === this.teflonZone && this.bowlState === "empty" && this.baskomState === "baskomkelapa" && droppedKey === "Baskom" && this.currentStep === 1) {
        // Handle special case for baskom drag area
        const baskomImage = gameObject.getData('baskomImage');
        if (baskomImage) {
          // Get outline and hint for cleanup
          const dragOutline = gameObject.getData('dragOutline');
          const dragHint = gameObject.getData('dragHint');

          // Animate both the drag area and the visual baskom
          this.tweens.add({
            targets: [gameObject, baskomImage],
            alpha: 0,
            scale: 0,
            duration: 400,
            ease: 'Power2.easeOut',
            onComplete: () => {
              gameObject.destroy();
              // Clean up outline and hint
              if (dragOutline) dragOutline.destroy();
              if (dragHint) dragHint.destroy();

              this.setVesselTexture(this.Teflon, "TeflonKelapa");
              this.bowlState = "teflonKelapa";
              this.showSuccessFeedback();
              this.nextStep();
            }
          });
        } else {
          this.executeSuccessfulDrop(gameObject, () => {
            this.setVesselTexture(this.Teflon, "TeflonKelapa");
            this.bowlState = "teflonKelapa";
            this.nextStep();
          });
        }
      }
      // Step 3: Stir the coconut
      else if (dropZone === this.teflonZone && this.bowlState === "teflonKelapa" && droppedKey === "Sepatula" && this.currentStep === 2) {
        // Return spatula to panel
        this.tweens.add({
            targets: gameObject,
            x: gameObject.getData('dragStartX'),
            y: gameObject.getData('dragStartY'),
            duration: 400,
            ease: 'Back.easeOut'
        });

        // Set initial state for stirring
        this.setVesselTexture(this.Teflon, "Aduk1");
        this.bowlState = "aduk";
        this.isMengaduk = true;
        this.swipeCount = 0;
        this.lastSwipeDirection = null;

        // Show swipe hint
        this.showSwipeHint();

        // Activate swipe handler
        this.handleMengaduk();
      }
      // Step 4: Add kemangi to wajan
      else if (dropZone === this.wajanZone && this.wajanState === "empty" && droppedKey === "Kemangi" && this.currentStep === 3) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "Tambahankemangi");
          this.wajanState = "kemangi";
          this.nextStep();
        });
      }
      // Step 5: Add kacang panjang to wajan
      else if (dropZone === this.wajanZone && this.wajanState === "kemangi" && droppedKey === "KacangPanjang" && this.currentStep === 4) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "tambahanKacangPanjang");
          this.wajanState = "kacangpanjang";
          this.nextStep();
        });
      }
      // Step 6: Add sawi to wajan
      else if (dropZone === this.wajanZone && this.wajanState === "kacangpanjang" && droppedKey === "Sawi" && this.currentStep === 5) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "tambahanSawi");
          this.wajanState = "sawi";
          this.nextStep();
        });
      }
      // Step 7: Add tauge to wajan
      else if (dropZone === this.wajanZone && this.wajanState === "sawi" && droppedKey === "Tauge" && this.currentStep === 6) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "tambahanTauge");
          this.wajanState = "tauge";
          this.nextStep();
        });
      }
      // Step 8: Add cabe and bawang merah together
      else if (dropZone === this.wajanZone && this.currentStep === 7 && (droppedKey === "Cabe" || droppedKey === "BawangMerah")) {
        console.log(`Step 4: Adding ${droppedKey}`); // Debug log
        if (droppedKey === "Cabe") {
          this.hasCabe = true;
          this.executeSuccessfulDrop(gameObject, () => {});
        } else if (droppedKey === "BawangMerah") {
          this.hasBawangMerah = true;
          this.executeSuccessfulDrop(gameObject, () => {});
        }
        
        // Setelah kedua bahan dimasukkan, update texture wajan dan pastikan posisi konsisten
        if (this.hasCabe && this.hasBawangMerah) {
          console.log("Both cabe and bawang merah added, updating texture"); // Debug log
          
          this.setVesselTexture(this.Wajan, "tambahanCabeBawangMerah");
          this.wajanState = "cabeBawangMerah";
          
          // Pastikan wajan tetap di tengah zone setelah ganti texture
          this.Wajan.setPosition(this.wajanZone.x, this.wajanZone.y);
        }
      }
      // Step 8: Add daging after cabe and bawang merah
      else if (dropZone === this.wajanZone && this.wajanState === "cabeBawangMerah" && droppedKey === "Daging" && this.currentStep === 7) {
        console.log("Step 4: Adding daging"); // Debug log
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "tambahanDaging");
          this.wajanState = "daging";
          this.nextStep(); // Lanjut ke step 5
        });
      }
      // Step 9: Add minyak ikan
      else if (dropZone === this.wajanZone && this.wajanState === "daging" && droppedKey === "MinyakIkan" && this.currentStep === 8) {
        console.log("Step 5: Adding minyak ikan"); // Debug log
        this.executeSuccessfulDrop(gameObject, () => {
          this.setVesselTexture(this.Wajan, "tambahanMinyak");
          this.wajanState = "minyak";
          this.nextStep(); // Advances to step 6 ("...ambil piring...")
        });
      }
      // Step 10: Place plate on plating area
      else if (dropZone === this.platingZone && this.bowlState === "sangrai" && droppedKey === "Piring" && this.currentStep === 9) {
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
      // Step 11: Teflon to Plate
      else if (this.plateZone && dropZone === this.plateZone && this.bowlState === "piring_on_plating" && gameObject === this.Teflon && this.currentStep === 10) {
        this.setVesselTexture(this.finalPlate!, 'PiringKelapa'); // Update plate
        this.setVesselTexture(this.Teflon, 'Teflon'); // Reset Teflon to empty
        this.Teflon.disableInteractive(); // Make it static

        // Move Teflon back to its stove
        this.tweens.add({
            targets: this.Teflon,
            x: this.teflonZone.x,
            y: this.teflonZone.y,
            duration: 400,
            ease: 'Back.easeOut'
        });

        this.bowlState = "piring_with_kelapa";
        this.nextStep();
        this.showSuccessFeedback();
      }
      // Step 12, Part 1: Use Spatula on Wajan to create a new draggable object
      else if (dropZone === this.wajanZone && this.wajanState === "minyak" && droppedKey === "Sepatula" && this.currentStep === 11) {
        // Destroy the spatula from the panel
        gameObject.destroy();

        // Create the new draggable "spatula with food"
        const spatulaWithFood = this.add.image(this.wajanZone.x, this.wajanZone.y - 50, 'SepatuladanSayur').setScale(0.35); // Or appropriate scale
        spatulaWithFood.setName("SpatulaWithFood");
        spatulaWithFood.setInteractive();
        this.input.setDraggable(spatulaWithFood);

        // Set the wajan to empty visually and update state
        this.setVesselTexture(this.Wajan, 'Wajan'); 
        this.wajanState = "ready_to_plate";
        
        this.showSuccessFeedback();
        // Do not advance step, user needs to drag the new object
      }
      // Step 12, Part 2: Drop the SpatulaWithFood onto the plate
      else if (this.plateZone && dropZone === this.plateZone && this.bowlState === "piring_with_kelapa" && gameObject.name === "SpatulaWithFood" && this.currentStep === 11) {
        this.executeSuccessfulDrop(gameObject, () => { // This will destroy the SpatulaWithFood
          this.setVesselTexture(this.finalPlate!, 'KohuKohu');
          // The Wajan is now empty and will not be destroyed
          this.Wajan.disableInteractive();
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

  private handleMengaduk() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isMengaduk) {
        this.pointerStartX = pointer.x;
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isMengaduk) {
        const swipeDistance = pointer.x - this.pointerStartX;

        if (swipeDistance < -50 && this.lastSwipeDirection !== 'left') { // Swipe left
          this.swipeCount++;
          this.lastSwipeDirection = 'left';
          this.setVesselTexture(this.Teflon, "Aduk2");
        } else if (swipeDistance > 50 && this.lastSwipeDirection !== 'right') { // Swipe right
          this.swipeCount++;
          this.lastSwipeDirection = 'right';
          this.setVesselTexture(this.Teflon, "Aduk1");
        }

        if (this.swipeCount >= 6) {
          this.isMengaduk = false;
          this.input.off('pointerdown');
          this.input.off('pointerup');

          // Hide the hint
          if (this.swipeHintText) {
            const arrows = this.swipeHintText.getData('arrows');
            if (arrows) {
              arrows.forEach((arrow: Phaser.GameObjects.Text) => arrow.destroy());
            }
            this.swipeHintText.destroy();
            this.swipeHintText = null;
          }
          
          this.setVesselTexture(this.Teflon, "Sangrai");
          this.bowlState = "sangrai";
          this.Teflon.setInteractive();
          this.input.setDraggable(this.Teflon);
          this.nextStep();
          this.showSuccessFeedback();
        }
      }
    });
  }

  private showSwipeHint() {
    if (this.swipeHintText) {
      this.swipeHintText.destroy();
    }
    this.swipeHintText = this.add.text(
      this.Teflon.x, 
      this.Teflon.y - 100, 
      'Geser ke Kiri & Kanan untuk Mengaduk!', 
      {
        fontSize: '24px',
        fontFamily: 'Chewy, cursive',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 10, y: 5 },
        // borderRadius: 8
      }
    ).setOrigin(0.5);

    // Add arrows for more clarity
    const leftArrow = this.add.text(this.swipeHintText.x - 220, this.swipeHintText.y, '⟷', { fontSize: '32px', color: '#ffffff' });
    const rightArrow = this.add.text(this.swipeHintText.x + 220, this.swipeHintText.y, '⟷', { fontSize: '32px', color: '#ffffff' });

    this.tweens.add({
        targets: [leftArrow, rightArrow],
        alpha: 0.5,
        yoyo: true,
        repeat: -1,
        duration: 500
    });

    // Store arrows to be destroyed later
    this.swipeHintText.setData('arrows', [leftArrow, rightArrow]);
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

  private showSuccessFeedback() { this.cameras.main.flash(100, 144, 238, 144); }

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

  // NOTE: Hint system removed - now handled by React components in KitchenBackgroundWrapper

  private setupDialogBridge() {
    console.log('🔧 KohuKohu: Setting up dialog bridge...');

    // Wait for dialog bridge to be attached by React
    const checkForBridge = () => {
      console.log('🔍 KohuKohu: Checking for dialog bridge...');
      if (this.dialogBridge) {
        console.log('✅ KohuKohu: Dialog bridge connected!');
        console.log('🎯 KohuKohu: Current game step:', this.currentStep);

        // Test the bridge
        try {
          const currentDialogStep = this.dialogBridge.getCurrentStep();
          console.log('📊 KohuKohu: Current dialog step:', currentDialogStep);

          // Sync initial step
          this.syncDialogWithGameStep();
        } catch (error) {
          console.error('❌ KohuKohu: Bridge test failed:', error);
        }
      } else {
        console.log('⏳ KohuKohu: Bridge not ready, checking again in 500ms...');
        // Try again in 500ms
        this.time.delayedCall(500, checkForBridge);
      }
    };

    // Start checking for bridge
    this.time.delayedCall(100, checkForBridge);
  }

  private syncDialogWithGameStep() {
    if (this.dialogBridge) {
      console.log('🔄 KohuKohu: Syncing dialog with game step...');

      try {
        // Make sure dialog is at the correct step
        const currentDialogStep = this.dialogBridge.getCurrentStep();
        console.log(`📊 KohuKohu: Game step: ${this.currentStep}, Dialog step: ${currentDialogStep}`);

        if (this.currentStep !== currentDialogStep) {
          console.log(`🔄 KohuKohu: Syncing dialog step from ${currentDialogStep} to ${this.currentStep}`);
          this.dialogBridge.setStep(this.currentStep);
          console.log('✅ KohuKohu: Dialog sync complete');
        } else {
          console.log('✅ KohuKohu: Dialog already in sync');
        }
      } catch (error) {
        console.error('❌ KohuKohu: Dialog sync failed:', error);
      }
    }
  }
}