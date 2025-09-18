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
  private panciKiri!: Phaser.GameObjects.Image; // legacy (unused in new flow)
  private panciKanan!: Phaser.GameObjects.Image; // legacy (unused in new flow)
  private kompor!: Phaser.GameObjects.Image;
  private panciMasak: Phaser.GameObjects.Image | null = null;
  private panciKukus: Phaser.GameObjects.Image | null = null;

  private komporZone!: Phaser.GameObjects.Zone;
  private stagingZone!: Phaser.GameObjects.Zone;
  private prepRightZone!: Phaser.GameObjects.Zone;

  // State untuk setiap panci
  private statePanciKiri: PotState = "air"; // legacy
  private statePanciKanan: PotState = "air"; // legacy
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
  private ingredientsContentContainer!: Phaser.GameObjects.Container;
  private scrollbar!: Phaser.GameObjects.Graphics;
  private scrollableArea!: Phaser.GameObjects.Zone;
  private scrollContentHeight: number = 0;
  private draggedItemOriginalParent: Phaser.GameObjects.Container | null = null;
  private draggedItemOriginalX: number = 0;
  private draggedItemOriginalY: number = 0;
  private ingredientsContentMask: Phaser.Display.Masks.GeometryMask | null = null;
  private scrollbarThumb!: Phaser.GameObjects.Graphics;
  private isScrollbarDragging: boolean = false;
  private scrollbarDragStartY: number = 0;
  private contentStartY: number = 0;
  private hintPopup!: Phaser.GameObjects.Container;
  private infoContent: string = `Nasi Lapola adalah hidangan nasi khas Maluku yang memiliki keunikan tersendiri dalam penyajian dan rasanya. Lapola sendiri berasal dari bahasa lokal yang berarti "dicampur" atau "diaduk". Nasi lapola dibuat dari beras yang dimasak dengan santan kelapa dan rempah-rempah seperti pala, cengkeh, dan daun pandan yang memberikan aroma harum dan rasa yang khas. Yang membuat nasi lapola istimewa adalah cara penyajiannya yang dicampur dengan berbagai lauk pauk seperti ayam suwir, ikan asin, sayuran, dan kerupuk, sehingga menjadi satu hidangan yang lengkap dan mengenyangkan. Biasanya nasi ini disajikan dalam porsi besar dan dimakan bersama-sama sebagai simbol kebersamaan dalam masyarakat Maluku. Cita rasanya yang gurih dari santan dan harum dari rempah-rempah membuat nasi lapola menjadi makanan yang sangat digemari, terutama saat acara-acara adat atau perayaan keluarga.`;

  // Stove and timing state
  private isStoveOn: boolean = false;
  private stoveClickCount: number = 0;
  private stoveAnimTimer: Phaser.Time.TimerEvent | null = null;
  private cookCountdownTimer: Phaser.Time.TimerEvent | null = null;
  private cookCountdownText: Phaser.GameObjects.Text | null = null;

  // Step 3-8 working objects
  private baskomObj: Phaser.GameObjects.Image | null = null;
  private saringObj: Phaser.GameObjects.Image | null = null;
  private kukusKelapaObj: Phaser.GameObjects.Image | null = null;
  private wajanNasiObj: Phaser.GameObjects.Image | null = null;

  // Order validation system
  private ingredientOrder: { [step: number]: string[] } = {
    0: ['Panci', 'water', 'Kacang'],
    1: ['Garam', 'Gula'],
    2: ['Baskom', 'Saring', 'KukusKelapa'],
    3: ['Wajan', 'Minyak', 'BawangMerah', 'BawangPutih'],
    4: ['Nasi', 'Garam', 'Gula'],
    5: ['Piring']
  };

  // Layout configuration - dapat diatur secara manual
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
    cookingAreaRight: 290, // Account for ingredients panel
    cookingAreaBottom: 180, // Account for dialog panel
    
    // Dialog panel
    dialogPanelHeight: 120,
    dialogPanelY: 850, // Will be calculated
    dialogPanelLeft: 50,
    dialogPanelRight: 20,

    // Character
    characterX: 1000,
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
      text: "Ayo masak Nasi Lapola! Pertama, ambil Panci dari menu, lalu taruh di atas kompor. Setelah itu, tuangkan Air ke dalam panci, dan masukkan Kacang.",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 2,
      text: "Sekarang, klik tuas kompor beberapa kali untuk menyalakannya. Tunggu sebentar sampai kacangnya matang ya. Kalau sudah, pindahkan panci berisi kacang ke Area Persiapan.",
      character: "karakter2.png",
      isCompleted: false
    },
    {
      id: 3,
      text: "Lanjut, kita siapkan kelapanya. Ambil Baskom dan taruh di sebelah kompor. Lalu, ambil Parutan dan Kelapa, kemudian taruh di atas baskom. Gerakkan kelapa ke atas dan ke bawah untuk memarut!",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 4,
      text: "Hebat! Sekarang ambil Panci baru dari menu dan taruh di atas kompor. Masukkan kelapa parut tadi ke dalam panci, lalu nyalakan kompor. Tunggu sampai matang, lalu pindahkan ke Area Persiapan.",
      character: "karakter4.png",
      isCompleted: false
    },
    {
      id: 5,
      text: "Setelah merebus kacang dan mengukus kelapa, ayo kita masak berasnya! Ambil Wajan dari menu dan taruh di atas kompor. Masukkan Beras ke dalam wajan, lalu aduk terus sampai setengah matang.",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 6,
      text: "Berasnya sudah setengah matang! Sekarang, ayo campur semua bahan. Masukkan Garam, Kukusan Kelapa, dan Rebusan Kacang dari Area Persiapan ke dalam wajan. Aduk lagi sampai rata dan tunggu sampai matang.",
      character: "karakter6.png",
      isCompleted: false
    },
    {
      id: 7,
      text: "Oke, nasinya sudah enak! Pindahkan wajan berisi nasi ke Area Persiapan. Sekarang, ambil Panci Kukus dan taruh di atas kompor. Masukkan nasi dari wajan ke dalam Panci Kukus dan tunggu sampai benar-benar matang.",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 8,
      text: "Yeay, Nasi Lapola sudah matang! Ambil Piring dan taruh di Area Persiapan. Terakhir, angkat nasi dari Panci Kukus dan sajikan di atas piring. Selamat menikmati!",
      character: "karakter2.png",
      isCompleted: false
    }
  ];

  constructor() {
    super("NasiLapolaScene");
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/kitchen.png");
    // Ensure stove for this scene uses nasi_lapola asset set
    this.load.image("Kompor", "/assets/foods/nasi_lapola/Kompor.png");
    
    // Load food image for hint popup
    this.load.image('nasilapola_food', '/assets/makanan/nasilapola.png');

    // Alat & Bahan - preload all assets found under /assets/foods/nasi_lapola
    this.load.image("PanciAir", "/assets/foods/nasi_lapola/PanciAir.png");
    this.load.image("PanciAir2", "/assets/foods/nasi_lapola/PanciAir2.png");
    this.load.image("Kacang", "/assets/foods/nasi_lapola/Kacang.png");
    this.load.image("Kelapa", "/assets/foods/nasi_lapola/Kelapa.png");
    this.load.image("Beras", "/assets/foods/nasi_lapola/Beras.png");
    this.load.image("Garam", "/assets/foods/nasi_lapola/Garam.png");
    this.load.image("Sepatula", "/assets/foods/nasi_lapola/sepatula.png");
    this.load.image("Panci", "/assets/foods/nasi_lapola/Panci.png");
    this.load.image("Baskom", "/assets/foods/nasi_lapola/Baskom.png");
    this.load.image("Parut", "/assets/foods/nasi_lapola/Parut.png");

    // Variasi & hasil proses
    this.load.image("PanciKacang", "/assets/foods/nasi_lapola/PanciKacang.png");
    this.load.image("PanciSaring", "/assets/foods/nasi_lapola/PanciSaring.png");
    this.load.image("PanciKelapa", "/assets/foods/nasi_lapola/PanciKelapa.png");
    this.load.image("PanciBeras", "/assets/foods/nasi_lapola/PanciBeras.png");
    this.load.image("PanciBerasKelapa", "/assets/foods/nasi_lapola/PanciBerasKelapa.png");
    this.load.image("PanciNasiLapola", "/assets/foods/nasi_lapola/PanciNasiLapola.png");
    this.load.image("NasiAduk", "/assets/foods/nasi_lapola/NasiAduk.png");
    this.load.image("NasiGaram", "/assets/foods/nasi_lapola/NasiGaram.png");
    this.load.image("NasiKelapa", "/assets/foods/nasi_lapola/NasiKelapa.png");
    this.load.image("KukusNasiLapola", "/assets/foods/nasi_lapola/KukusNasiLapola.png");
    this.load.image("WajanNasiLapola", "/assets/foods/nasi_lapola/WajanNasiLapola.png");
    this.load.image("KukusNasi", "/assets/foods/nasi_lapola/KukusNasi.png");
    this.load.image("KukusKelapa", "/assets/foods/nasi_lapola/KukusKelapa.png");
    this.load.image("BaskomKelapa", "/assets/foods/nasi_lapola/BaskomKelapa.png");
    this.load.image("Piring", "/assets/foods/nasi_lapola/Piring.png");
    this.load.image("NasiLapola", "/assets/foods/nasi_lapola/NasiLapola.png");

    // Kompor nyala frames
    this.load.image("KomporNyala1", "/assets/foods/nasi_lapola/KomporNyala1.png");
    this.load.image("KomporNyala2", "/assets/foods/nasi_lapola/KomporNyala2.png");
    this.load.image("KomporNyala3", "/assets/foods/nasi_lapola/KomporNyala3.png");
    this.load.image("KomporNyala4", "/assets/foods/nasi_lapola/KomporNyala4.png");
    this.load.image("KomporNyala5", "/assets/foods/nasi_lapola/KomporNyala5.png");
    this.load.image("KomporNyala6", "/assets/foods/nasi_lapola/KomporNyala6.png");

    // Tuang/memasukkan animasi frames
    this.load.image("TuangAir1", "/assets/foods/nasi_lapola/TuangAir1.png");
    this.load.image("TuangAir2", "/assets/foods/nasi_lapola/TuangAir2.png");
    this.load.image("TuangAir3", "/assets/foods/nasi_lapola/TuangAir3.png");
    this.load.image("TuangAir4", "/assets/foods/nasi_lapola/TuangAir4.png");
    this.load.image("MasukkanKacang1", "/assets/foods/nasi_lapola/MasukkanKacang1.png");
    this.load.image("MasukkanKacang2", "/assets/foods/nasi_lapola/MasukkanKacang2.png");
    this.load.image("MasukkanKacang3", "/assets/foods/nasi_lapola/MasukkanKacang3.png");
    this.load.image("MasukkanKacang4", "/assets/foods/nasi_lapola/MasukkanKacang4.png");
    this.load.image("MasukkanBeras1", "/assets/foods/nasi_lapola/MasukkanBeras1.png");
    this.load.image("MasukkanBeras2", "/assets/foods/nasi_lapola/MasukkanBeras2.png");
    this.load.image("MasukkanBeras3", "/assets/foods/nasi_lapola/MasukkanBeras3.png");
    this.load.image("KelapaMasuk1", "/assets/foods/nasi_lapola/KelapaMasuk1.png");
    this.load.image("KelapaMasuk2", "/assets/foods/nasi_lapola/KelapaMasuk2.png");
    this.load.image("KelapaMasuk3", "/assets/foods/nasi_lapola/KelapaMasuk3.png");
    this.load.image("TuangGaram1", "/assets/foods/nasi_lapola/TuangGaram1.png");
    this.load.image("TuangGaram2", "/assets/foods/nasi_lapola/TuangGaram2.png");
    this.load.image("TuangGaram3", "/assets/foods/nasi_lapola/TuangGaram3.png");
    this.load.image("TuangKelapa1", "/assets/foods/nasi_lapola/TuangKelapa1.png");
    this.load.image("TuangKelapa2", "/assets/foods/nasi_lapola/TuangKelapa2.png");
    this.load.image("TuangKelapa3", "/assets/foods/nasi_lapola/TuangKelapa3.png");
    this.load.image("TuangKacang1", "/assets/foods/nasi_lapola/TuangKacang1.png");
    this.load.image("TuangKacang2", "/assets/foods/nasi_lapola/TuangKacang2.png");
    this.load.image("TuangKacang3", "/assets/foods/nasi_lapola/TuangKacang3.png");

    // Aduk frames
    this.load.image("PanciAirSepatula", "/assets/foods/nasi_lapola/PanciAirSepatula.png");
    this.load.image("PanciAirSepatula2", "/assets/foods/nasi_lapola/PanciAirSepatula2.png");
    this.load.image("PanciAirSepatula3", "/assets/foods/nasi_lapola/PanciAirSepatula3.png");
    this.load.image("AdukKacang", "/assets/foods/nasi_lapola/AdukKacang.png");
    this.load.image("AdukKacang2", "/assets/foods/nasi_lapola/AdukKacang2.png");

    // Saring/parut kelapa sequence
    this.load.image("SaringKelapa", "/assets/foods/nasi_lapola/SaringKelapa.png");
    this.load.image("SaringKelapa1", "/assets/foods/nasi_lapola/SaringKelapa1.png");
    this.load.image("SaringKelapa2", "/assets/foods/nasi_lapola/SaringKelapa2.png");
    this.load.image("SaringKelapa3", "/assets/foods/nasi_lapola/SaringKelapa3.png");

    // Others
    this.load.image("water", "/assets/foods/nasi_lapola/water.png");

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

    const centerXPos = (leftX + rightX) / 2;
    this.setStoveCoordinates(centerXPos, yPosition);
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

  private setStoveCoordinates(singleX: number, singleY: number) {
    if (this.kompor) {
      this.kompor.setPosition(singleX, singleY);
    }
    if (this.komporZone) {
      this.komporZone.setPosition(singleX, singleY - 60);
    }
  }

  private createCookingArea() {
    // Calculate cooking area center
    const cookingCenterX = (this.layoutConfig.cookingAreaLeft + this.layoutConfig.cookingAreaRight) / 2;
    const cookingCenterY = (this.layoutConfig.cookingAreaTop + this.layoutConfig.cookingAreaBottom) / 2;
    
    // Kompor positioning
    const komporY = this.layoutConfig.cookingAreaBottom - 100;
    
    // Single center stove
    this.kompor = this.add.image(0, 0, "Kompor").setScale(this.layoutConfig.stoveScale).setInteractive();
    this.komporZone = this.add.zone(0, 0, 160, 140).setRectangleDropZone(160, 140);
    this.komporZone.name = "kompor";

    // Atur posisi kompor secara manual dengan koordinat (x, y).
    // Anda bisa mengubah angka-angka di bawah ini untuk memindahkan kompor.
    // Format: setStoveCoordinates(kiriX, kiriY, kananX, kananY)
    // Place single stove slightly higher
    this.setStoveCoordinates(((this.layoutConfig.cookingAreaLeft + this.layoutConfig.cookingAreaRight) / 2) - 90, this.layoutConfig.cookingAreaBottom - 270);

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

    // Prep zone to the right of stove for step 3 setup (baskom/parut/kelapa)
    this.prepRightZone = this.add.zone(
      this.komporZone.x + 260,
      this.komporZone.y,
      200,
      160
    ).setRectangleDropZone(200, 160);
    this.prepRightZone.name = 'prepRight';

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
      "Area Persiapan",
      {
        fontSize: '14px',
        fontFamily: 'Chewy, cursive',
        color: '#FFE4B5',
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0.5);

    // No initial pots placed in new flow
    // Stove click logic: toggle after 5 clicks
    this.kompor.on('pointerdown', () => {
      this.stoveClickCount++;
      if (this.stoveClickCount >= 5) {
        this.toggleStove();
        this.stoveClickCount = 0;
      }
    });

    // Allow dragging cooking pot to staging after it is cooked in step 2
    this.input.on('dragstart', (_: any, obj: Phaser.GameObjects.Image) => {
      if (obj === this.panciMasak && this.currentStep === 1 && this.statePanciMasak !== 'kacang_matang') {
        obj.disableInteractive();
        this.time.delayedCall(0, () => obj.setInteractive());
      }
    });
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

    // Create scrollbar background
    this.scrollbar = this.add.graphics();
    this.ingredientsPanel.add(this.scrollbar);
    
    // Create scrollbar thumb (draggable part)
    this.scrollbarThumb = this.add.graphics();
    this.ingredientsPanel.add(this.scrollbarThumb);

    this.createIngredients();

    // Enable mouse wheel scrolling
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
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
      { key: "Panci", name: "Panci", scale: 0.12 },
      { key: "water", name: "Air", scale: 0.15 },
      { key: "Kacang", name: "Kacang", scale: 0.2 },
      { key: "Beras", name: "Beras", scale: 0.2 },
      { key: "Garam", name: "Garam", scale: 0.2 },
      { key: "Kelapa", name: "Kelapa", scale: 0.2 },
      { key: "Parut", name: "Parutan", scale: 0.15 },
      { key: "Baskom", name: "Baskom", scale: 0.15 },
      { key: "PanciSaring", name: "Panci Saring", scale: 0.12 },
      { key: "PanciSaring", name: "Panci Saring", scale: 0.12 },
      // Remove spatula from panel per request
      { key: "PanciAir2", name: "Panci Air", scale: 0.12 },
      { key: "Piring", name: "Piring", scale: 0.15 }
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
      fontSize: '18px',
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
    progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 18, (dialogWidth - 40) * 0.125, 6, 3);
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

    this.updateScrollbar(); // Update scrollbar visuals
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
      this.stepText.setText(step.text);
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
    this.input.on("dragstart", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      this.draggedItemOriginalParent = gameObject.parentContainer;
      this.draggedItemOriginalX = gameObject.x;
      this.draggedItemOriginalY = gameObject.y;
    
      if (gameObject.parentContainer) {
        const parent = gameObject.parentContainer;
        
        parent.remove(gameObject);
        this.add.existing(gameObject);
    
        // Set posisi langsung ke posisi pointer/cursor
        gameObject.x = pointer.worldX;
        gameObject.y = pointer.worldY;
      }
    
      gameObject.setDepth(1000);
    });
    

    // Drag update - validate ingredient order immediately
    this.input.on("drag", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      // Check if ingredient is valid for current step
      if (!this.isValidIngredient(gameObject.name)) {
        // Invalid ingredient - shake screen and return to original position
        this.shakeScreen();
        this.returnItemToOriginalPosition(gameObject);
        return;
      }

      // Valid ingredient - continue with normal drag behavior
      gameObject.x = pointer.worldX;
      gameObject.y = pointer.worldY;
      
      // Visual feedback saat drag
      gameObject.setTint(0xFFFFAA);
    });

    // Drag selesai
    this.input.on("dragend", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
      // Reset efek visual
      gameObject.clearTint();
      gameObject.setDepth(0); // Reset depth

      // Jika dilepas di luar panel scroll (worldX > 300) → biarkan di posisi cursor
      if (pointer.worldX > 300) {
        // Item tetap di posisi terakhir cursor (sudah diatur di drag event)
        console.log(`Item ${gameObject.name} dropped outside scrollbar at ${gameObject.x}, ${gameObject.y}`);
        return; // Item tetap di posisi cursor
      }

      // Kalau dilepas di dalam panel scroll → balikin ke parent / posisi awal
      if (!dropped) {
        const originalScale = this.getOriginalScale(gameObject.name);
        gameObject.setScale(originalScale);

        if (this.draggedItemOriginalParent) {
          // Convert world position back to local position
          const localPos = this.draggedItemOriginalParent.getWorldTransformMatrix().applyInverse(gameObject.x, gameObject.y);
          this.draggedItemOriginalParent.add(gameObject);
          gameObject.setPosition(this.draggedItemOriginalX, this.draggedItemOriginalY);
          gameObject.setInteractive();
        } else {
          if (gameObject.input && gameObject.input.dragStartX !== undefined && gameObject.input.dragStartY !== undefined) {
            this.tweens.add({
              targets: gameObject,
              x: gameObject.input.dragStartX,
              y: gameObject.input.dragStartY,
              duration: 400,
              ease: 'Back.easeOut'
            });
          }
        }
      }

      // Re-enable mask hanya jika item dikembalikan ke container
      if (pointer.worldX <= 300 && this.ingredientsContentContainer && this.ingredientsContentMask) {
        this.ingredientsContentContainer.setMask(this.ingredientsContentMask);
      }

      // Reset properti yang disimpan
      this.draggedItemOriginalParent = null;
      this.draggedItemOriginalX = 0;
      this.draggedItemOriginalY = 0;
    });

    // Enhanced drop handling dengan improved feedback
    this.input.on("drop", (pointer: any, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedKey = gameObject.name;

      // STEP 1: Place pot on stove, pour water, then add beans
      if (dropZone === this.komporZone && this.currentStep === 0 && droppedKey === "Panci" && !this.panciMasak) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciMasak = this.add.image(dropZone.x - 20, dropZone.y - 65, "Panci").setScale(this.layoutConfig.potScale).setInteractive().setData('originalScale', this.layoutConfig.potScale);
          this.input.setDraggable(this.panciMasak);
          this.statePanciMasak = "empty";
        });
      }
      else if (this.panciMasak && this.currentStep === 0 && droppedKey === "water" && this.statePanciMasak === "empty" && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["TuangAir1", "TuangAir2", "TuangAir3", "TuangAir4"], 6000, () => {
          if (this.panciMasak) {
            this.panciMasak.setTexture("PanciAir");
          this.statePanciMasak = "air";
          }
        }, this.panciMasak);
      }
      else if (this.panciMasak && this.currentStep === 0 && droppedKey === "Kacang" && this.statePanciMasak === "air" && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["MasukkanKacang1", "MasukkanKacang2", "MasukkanKacang3", "MasukkanKacang4"], 6000, () => {
          if (this.panciMasak) {
            this.panciMasak.setTexture("PanciKacang");
            this.statePanciMasak = "kacang_mentah";
          this.nextStep();
          }
        }, this.panciMasak);
      }
      // STEP 2: Turn on stove (5 clicks), countdown 30s, then allow moving PanciKacang to staging
      else if (dropZone === this.stagingZone && this.currentStep === 1 && this.panciMasak && this.statePanciMasak === "kacang_matang") {
        this.executeSuccessfulMove(this.panciMasak, dropZone.x, dropZone.y);
            // Clear reference so a new pot can be placed on the stove in step 5
            this.panciMasak = null;
            this.nextStep();
          }
      // STEP 3: Grating workflow
      else if (this.currentStep === 2 && droppedKey === "Baskom" && !this.baskomObj) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.baskomObj = this.add.image(this.prepRightZone.x, this.prepRightZone.y, "Baskom").setScale(0.39).setInteractive();
          this.baskomObj.setData('type', 'baskom');
        });
      }
      else if (this.currentStep === 2 && droppedKey === "Parut" && this.baskomObj && !this.saringObj && Phaser.Geom.Rectangle.Contains(this.baskomObj.getBounds(), pointer.x, pointer.y)) {
        this.executeSuccessfulDrop(gameObject, () => {
          // Remove baskom view and replace with saring
          const bx = this.baskomObj ? this.baskomObj.x : this.prepRightZone.x;
          const by = this.baskomObj ? this.baskomObj.y : this.prepRightZone.y;
          if (this.baskomObj) this.baskomObj.destroy();
          this.baskomObj = null;
          this.saringObj = this.add.image(bx, by, "SaringKelapa").setScale(0.39).setInteractive().setName('SaringKelapa');
          this.saringObj.setData('type', 'saring');
        });
      }
      else if (this.currentStep === 2 && (droppedKey === "Kelapa" || droppedKey === "Parut") && this.saringObj && Phaser.Geom.Rectangle.Contains(this.saringObj.getBounds(), pointer.x, pointer.y)) {
        this.executeSuccessfulDrop(gameObject, () => {
          const sx = this.saringObj!.x;
          const sy = this.saringObj!.y;
          this.saringObj?.destroy();
          this.saringObj = this.add.image(sx, sy, "SaringKelapa1").setScale(0.39).setInteractive().setName('SaringKelapa1');
          this.saringObj.setData('type', 'saring_active');
          this.initGratingMechanic(this.saringObj);
        });
      }
      // STEP 4: Steam coconut - place PanciSaring on stove then pour BaskomKelapa, then 30s cook and move to staging
      else if (dropZone === this.komporZone && this.currentStep === 3 && droppedKey === "PanciSaring" && !this.panciKukus) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciKukus = this.add.image(dropZone.x - 20, dropZone.y - 65, "PanciSaring").setScale(this.layoutConfig.potScale).setInteractive();
          this.input.setDraggable(this.panciKukus);
          this.statePanciKukus = "empty";
        });
      }
      else if (this.panciKukus && this.currentStep === 3 && droppedKey === "BaskomKelapa" && Phaser.Geom.Rectangle.Contains(this.panciKukus.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["KelapaMasuk1","KelapaMasuk2","KelapaMasuk3"], 6000, () => {
          if (this.panciKukus) {
            this.panciKukus.setTexture('KukusKelapa');
            this.statePanciKukus = 'kelapa_mentah';
          }
        }, this.panciKukus);
      }
      else if (dropZone === this.stagingZone && this.currentStep === 3 && this.panciKukus && this.statePanciKukus === 'kelapa_matang') {
        this.executeSuccessfulMove(this.panciKukus, dropZone.x, dropZone.y);
        this.nextStep();
      }
      // STEP 5: Rice - place PanciAir2, pour Beras, then stir 15x to NasiAduk
      else if (dropZone === this.komporZone && this.currentStep === 4 && droppedKey === "PanciAir2" && !this.panciMasak) {
        if (!this.isStoveOn) {
          this.executeInvalidDrop(gameObject);
        } else {
        this.executeSuccessfulDrop(gameObject, () => {
            this.panciMasak = this.add.image(dropZone.x - 20, dropZone.y - 65, 'PanciAir2').setScale(this.layoutConfig.potScale).setInteractive().setData('originalScale', this.layoutConfig.potScale);
            this.input.setDraggable(this.panciMasak);
            this.statePanciMasak = 'air';
          });
        }
      }
      else if (this.panciMasak && this.currentStep === 4 && droppedKey === 'Beras' && this.statePanciMasak === 'air' && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["MasukkanBeras1","MasukkanBeras2","MasukkanBeras3"], 6000, () => {
          if (this.panciMasak) {
            this.panciMasak.setTexture('PanciAirSepatula');
            this.initStirMechanic(this.panciMasak, ['PanciAirSepatula2','PanciAirSepatula3'], 15, () => {
              if (this.panciMasak) {
                this.panciMasak.setTexture('NasiAduk');
                this.statePanciMasak = 'beras_diaduk';
          this.nextStep();
          }
        });
      }
        }, this.panciMasak);
      }
      // STEP 6: Add Garam, Kelapa (from staging), Kacang (from staging), stir 15x to WajanNasiLapola then wait 30s
      else if (this.panciMasak && this.currentStep === 5 && droppedKey === 'Garam' && this.panciMasak.texture.key === 'NasiAduk' && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["TuangGaram1","TuangGaram2","TuangGaram3"], 6000, () => {
          if (this.panciMasak) this.panciMasak.setTexture('NasiGaram');
        }, this.panciMasak);
      }
      else if (this.panciMasak && this.currentStep === 5 && gameObject === this.panciKukus && this.panciMasak.texture.key === 'NasiGaram' && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["TuangKelapa1","TuangKelapa2","TuangKelapa3"], 6000, () => {
          if (this.panciMasak) this.panciMasak.setTexture('PanciBerasKelapa');
          if (this.panciKukus) {
            this.panciKukus.destroy();
            this.panciKukus = null;
          }
        }, this.panciMasak);
      }
      else if (this.panciMasak && this.currentStep === 5 && gameObject !== this.panciMasak && this.panciMasak.texture.key === 'PanciBerasKelapa' && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        // Assume beans staging object is dragged (the old panciMasak that became kacang staged), use pour frames for kacang
        this.executePourAnimation(gameObject, ["TuangKacang1","TuangKacang2","TuangKacang3"], 6000, () => {
          if (this.panciMasak) {
            this.panciMasak.setTexture('AdukKacang');
            this.initStirMechanic(this.panciMasak, ['AdukKacang','AdukKacang2'], 15, () => {
              if (this.panciMasak) {
                this.panciMasak.setTexture('WajanNasiLapola');
                // Wait 30s before moving to next step
                this.startGenericCountdown(30, () => {
            this.nextStep();
                });
          }
        });
      }
        }, this.panciMasak);
      }
      // STEP 7: Steam final rice - place PanciSaring, drop WajanNasiLapola, 40s to KukusNasi
      else if (dropZone === this.komporZone && this.currentStep === 6 && droppedKey === 'PanciSaring' && !this.panciKukus) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciKukus = this.add.image(dropZone.x - 20, dropZone.y - 65, 'PanciSaring').setScale(this.layoutConfig.potScale).setInteractive();
          this.input.setDraggable(this.panciKukus);
          this.statePanciKukus = 'empty';
        });
      }
      else if (dropZone === this.stagingZone && this.currentStep === 6 && this.panciMasak && this.panciMasak.texture.key === 'WajanNasiLapola') {
        // Allow staging the wajan nasi before steaming
        this.executeSuccessfulMove(this.panciMasak, dropZone.x, dropZone.y - 10);
      }
      else if (this.panciKukus && this.currentStep === 6 && this.panciMasak && this.panciMasak.texture.key === 'WajanNasiLapola' && Phaser.Geom.Rectangle.Contains(this.panciKukus.getBounds(), pointer.x, pointer.y)) {
        this.executeSuccessfulDrop(gameObject, () => {
          if (this.panciKukus) {
            this.panciKukus.setTexture('KukusNasiLapola');
            // 40s countdown
            this.startGenericCountdown(40, () => {
              if (this.panciKukus) this.panciKukus.setTexture('KukusNasi');
            this.nextStep();
            });
          }
        });
      }
      // STEP 8: Plate - remove stove, drop Piring to get NasiLapola and complete
      else if (this.currentStep === 7 && this.panciKukus && this.panciKukus.texture.key === 'KukusNasi') {
        // Remove stove visual
        if (this.kompor) this.kompor.setVisible(false);
        if (droppedKey === 'Piring' && Phaser.Geom.Rectangle.Contains(this.panciKukus.getBounds(), pointer.x, pointer.y)) {
        this.executeSuccessfulDrop(gameObject, () => {
          if (this.panciKukus) {
              this.panciKukus.setTexture('NasiLapola');
              this.statePanciKukus = 'plated';
            this.nextStep();
            this.showCompletionCelebration();
          }
        });
        } else {
          this.executeInvalidDrop(gameObject);
      }
      }
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

  private executePourAnimation(gameObject: Phaser.GameObjects.Image, frames: string[], durationMs: number, onDone: () => void, targetToHide?: Phaser.GameObjects.Image) {
    // Destroy dragged item immediately so only animation frames are visible
    gameObject.destroy();

    // Temporary sprite to show pour frames near pot
    const anchor = targetToHide ?? this.panciMasak;
    const targetX = anchor ? anchor.x - 20 : this.cameras.main.centerX;
    const targetY = anchor ? anchor.y - 120 : this.cameras.main.centerY;
    // Scale pour frames 1.5x
    const temp = this.add.image(targetX, targetY, frames[0]).setScale(0.375);

    // Hide target pot during pour animation if provided
    if (targetToHide) targetToHide.setVisible(false);

    let idx = 0;
    const frameTimer = this.time.addEvent({
      delay: Math.max(100, Math.floor(durationMs / frames.length)),
      loop: true,
      callback: () => {
        temp.setTexture(frames[idx % frames.length]);
        idx++;
      }
    });

    this.time.delayedCall(durationMs, () => {
      frameTimer.remove(false);
      temp.destroy();
      if (targetToHide) targetToHide.setVisible(true);
      onDone();
      this.showSuccessFeedback();
    });
  }

  private toggleStove() {
    if (!this.isStoveOn) {
      this.isStoveOn = true;
      // Loop through KomporNyala frames
      const frames = ["KomporNyala1","KomporNyala2","KomporNyala3","KomporNyala4","KomporNyala5","KomporNyala6"];
      let i = 0;
      this.stoveAnimTimer?.destroy();
      this.stoveAnimTimer = this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          if (this.kompor) this.kompor.setTexture(frames[i % frames.length]);
          i++;
        }
      });

      // If step 2 and panci berisi kacang mentah, start 30s countdown
      if (this.currentStep === 1 && this.panciMasak && this.statePanciMasak === 'kacang_mentah') {
        this.startCookCountdown(30, () => {
          if (this.panciMasak) {
            this.statePanciMasak = 'kacang_matang';
            // Ensure pot is draggable again after cook
            this.panciMasak.setInteractive();
            this.input.setDraggable(this.panciMasak);
          }
        });
      }
      // If step 4 and kelapa baru masuk panci saring, start 30s countdown for steaming coconut
      if (this.currentStep === 3 && this.panciKukus && this.statePanciKukus === 'kelapa_mentah') {
        this.startCookCountdown(30, () => {
          if (this.panciKukus) {
            this.statePanciKukus = 'kelapa_matang';
            this.panciKukus.setInteractive();
            this.input.setDraggable(this.panciKukus);
          }
        });
      }
    } else {
      // Turn off
      this.isStoveOn = false;
      this.stoveAnimTimer?.destroy();
      this.stoveAnimTimer = null;
      if (this.kompor) this.kompor.setTexture('Kompor');
    }
  }

  private startCookCountdown(seconds: number, onDone: () => void) {
    if (this.cookCountdownTimer) this.cookCountdownTimer.destroy();
    if (this.cookCountdownText) this.cookCountdownText.destroy();

    const x = this.komporZone.x;
    const y = this.komporZone.y - 150;
    this.cookCountdownText = this.add.text(x, y, `${seconds}`, {
      fontSize: '22px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700'
    }).setOrigin(0.5);

    let remaining = seconds;
    // Lock dragging for pot during countdown
    if (this.panciMasak) this.panciMasak.disableInteractive();

    this.cookCountdownTimer = this.time.addEvent({
      delay: 1000,
      repeat: seconds - 1,
      callback: () => {
        remaining--;
        if (this.cookCountdownText) this.cookCountdownText.setText(`${remaining}`);
        if (remaining <= 0) {
          this.cookCountdownTimer?.destroy();
          this.cookCountdownTimer = null;
          this.cookCountdownText?.destroy();
          this.cookCountdownText = null;
          onDone();
          if (this.panciMasak) this.panciMasak.setInteractive();
        }
      }
    });
  }

  private initGratingMechanic(activeSaring: Phaser.GameObjects.Image) {
    let grateCount = 0;
    let lastY: number | null = null;
    const updateFrame = () => {
      if (!activeSaring) return;
      // Alternate frames for up/down motion
      activeSaring.setTexture(grateCount % 2 === 0 ? 'SaringKelapa2' : 'SaringKelapa3');
    };

    const onPointerDown = (pointer: Phaser.Input.Pointer) => {
      lastY = pointer.worldY;
    };
    const onPointerMove = (pointer: Phaser.Input.Pointer) => {
      if (lastY === null) return;
      const dy = pointer.worldY - lastY;
      if (Math.abs(dy) > 25) {
        grateCount++;
        updateFrame();
        lastY = pointer.worldY;
        if (grateCount >= 15) {
          this.input.off('pointerdown', onPointerDown);
          this.input.off('pointermove', onPointerMove);
          this.input.off('pointerup', onPointerUp);
          // Replace with final baskom kelapa result
          const x = activeSaring.x;
          const y = activeSaring.y;
          activeSaring.destroy();
          this.baskomObj?.destroy();
          this.baskomObj = this.add.image(x, y, 'BaskomKelapa').setScale(0.28).setInteractive();
          this.baskomObj.setName('BaskomKelapa');
          this.input.setDraggable(this.baskomObj);
          this.nextStep();
        }
      }
    };
    const onPointerUp = () => {
      lastY = null;
    };

    this.input.on('pointerdown', onPointerDown);
    this.input.on('pointermove', onPointerMove);
    this.input.on('pointerup', onPointerUp);
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
      x: spatula.input?.dragStartX ?? spatula.x,
      y: spatula.input?.dragStartY ?? spatula.y,
      
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
        if (this.panciMasak) {
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
      }
    });

    this.time.delayedCall(2800, () => {
      stirTimer.destroy();
      if (this.panciMasak) {
        this.panciMasak.setTexture("PanciBeras");
        this.panciMasak.setScale(this.layoutConfig.potScale);
        this.statePanciMasak = "beras_matang";
        this.nextStep();
        this.showSuccessFeedback();
      }
    });
  }

  // Generic stir mechanic: alternate textures many times then invoke callback
  private initStirMechanic(target: Phaser.GameObjects.Image, frames: string[], times: number, onDone: () => void) {
    let count = 0;
    let useAlt = false;
    const onPointerDown = () => {
      // Toggle frame on each click-drag motion
      useAlt = !useAlt;
      target.setTexture(frames[useAlt ? 1 : 0]);
      count++;
      if (count >= times) {
        this.input.off('pointerdown', onPointerDown);
        onDone();
      }
    };
    // Lock pot position while stirring
    const fixedX = target.x;
    const fixedY = target.y;
    target.disableInteractive();
    this.input.on('pointerdown', onPointerDown);
    // Keep the pot fixed in place each frame
    const lockTimer = this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        target.setPosition(fixedX, fixedY);
      }
    });
    const finish = () => {
      lockTimer.destroy();
      target.setInteractive();
    };
    // Wrap onDone to restore interactivity
    const originalOnDone = onDone;
    onDone = () => {
      finish();
      originalOnDone();
    };
  }

  private startGenericCountdown(seconds: number, onDone: () => void) {
    let text: Phaser.GameObjects.Text | null = null;
    let remaining = seconds;
    const x = this.komporZone.x;
    const y = this.komporZone.y - 120;
    text = this.add.text(x, y, `${remaining}`, {
      fontSize: '22px',
      fontFamily: 'Chewy, cursive',
      color: '#FFD700'
    }).setOrigin(0.5);
    const t = this.time.addEvent({
      delay: 1000,
      repeat: seconds - 1,
      callback: () => {
        remaining--;
        if (text) text.setText(`${remaining}`);
        if (remaining <= 0) {
          t.destroy();
          if (text) text.destroy();
          onDone();
        }
      }
    });
  }

  private executeInvalidDrop(gameObject: Phaser.GameObjects.Image) {
    // Enhanced invalid drop feedback
    this.tweens.add({
      targets: gameObject,
      x: gameObject.input?.dragStartX ?? gameObject.x,
      y: gameObject.input?.dragStartY ?? gameObject.y,
      
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
        delay: ((_: any, __: any, ___: any, index: number) => index * 100) as any



    });
  }

  private isValidIngredient(ingredientName: string): boolean {
    const allowedIngredients = this.ingredientOrder[this.currentStep];
    return allowedIngredients ? allowedIngredients.includes(ingredientName) : false;
  }

  private shakeScreen() {
    this.cameras.main.shake(300, 0.01);
  }

  private returnItemToOriginalPosition(gameObject: Phaser.GameObjects.Image) {
    const originalScale = this.getOriginalScale(gameObject.name);
    gameObject.setScale(originalScale);
    gameObject.clearTint();
    gameObject.setDepth(0);

    if (this.draggedItemOriginalParent) {
      this.draggedItemOriginalParent.add(gameObject);
      gameObject.setPosition(this.draggedItemOriginalX, this.draggedItemOriginalY);
      gameObject.setInteractive();
    }

    // Reset stored properties
    this.draggedItemOriginalParent = null;
    this.draggedItemOriginalX = 0;
    this.draggedItemOriginalY = 0;
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
    const title = this.add.text(0, -popupHeight / 2 + 45, 'Nasi Lapola', {
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
    contentBg.fillRoundedRect(-popupWidth / 2 + 20, -popupHeight / 2 + 85, popupWidth - 40, popupHeight - 120, 20);
    this.hintPopup.add(contentBg);

    // Text content - simplified without masking
    const textAreaWidth = popupWidth - 80;
    const textStartX = -popupWidth / 2 + 40;
    const textStartY = -popupHeight / 2 + 90;
    
    // Food information content
    const nasiLapolaContent = `Nasi Lapola adalah hidangan nasi khas Maluku yang memiliki keunikan tersendiri dalam penyajian dan rasanya. Lapola sendiri berasal dari bahasa lokal yang berarti "dicampur" atau "diaduk". Nasi lapola dibuat dari beras yang dimasak dengan santan kelapa dan rempah-rempah seperti pala, cengkeh, dan daun pandan yang memberikan aroma harum dan rasa yang khas. Yang membuat nasi lapola istimewa adalah cara penyajiannya yang dicampur dengan berbagai lauk pauk seperti ayam suwir, ikan asin, sayuran, dan kerupuk, sehingga menjadi satu hidangan yang lengkap dan mengenyangkan. Biasanya nasi ini disajikan dalam porsi besar dan dimakan bersama-sama sebagai simbol kebersamaan dalam masyarakat Maluku. Cita rasanya yang gurih dari santan dan harum dari rempah-rempah membuat nasi lapola menjadi makanan yang sangat digemari, terutama saat acara-acara adat atau perayaan keluarga.`;
    
    // Add the main text directly to popup
    const text = this.add.text(textStartX, textStartY, nasiLapolaContent, {
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
    this.scrollbarThumb.clear();

    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 100 - 15; // Same as in createIngredientsPanel
    const scrollbarWidth = 12;
    const scrollbarX = this.layoutConfig.ingredientsPanelWidth - scrollbarWidth - 8; // Position to the right of the panel
    const scrollbarYOffset = 100; // Start below the title

    if (this.scrollContentHeight > scrollableAreaHeight) {
      // Draw scrollbar track (background)
      this.scrollbar.fillStyle(0x4A3428, 0.6);
      this.scrollbar.fillRoundedRect(scrollbarX, scrollbarYOffset, scrollbarWidth, scrollableAreaHeight, 6);
      this.scrollbar.lineStyle(1, 0x8B4513, 0.8);
      this.scrollbar.strokeRoundedRect(scrollbarX, scrollbarYOffset, scrollbarWidth, scrollableAreaHeight, 6);

      // Calculate scrollbar thumb height based on content and visible area
      const thumbHeight = Math.max(20, (scrollableAreaHeight / this.scrollContentHeight) * scrollableAreaHeight);

      // Calculate scrollbar thumb position based on content container's scroll
      const maxScroll = this.scrollContentHeight - scrollableAreaHeight;
      const scrollPercentage = maxScroll > 0 ? Math.abs(this.ingredientsContentContainer.y) / maxScroll : 0;
      const thumbY = scrollbarYOffset + (scrollableAreaHeight - thumbHeight) * scrollPercentage;

      // Draw scrollbar thumb (draggable part)
      this.scrollbarThumb.fillStyle(0x8B4513, 0.9);
      this.scrollbarThumb.fillRoundedRect(scrollbarX + 1, thumbY, scrollbarWidth - 2, thumbHeight, 5);
      this.scrollbarThumb.lineStyle(1, 0xFFD700, 0.6);
      this.scrollbarThumb.strokeRoundedRect(scrollbarX + 1, thumbY, scrollbarWidth - 2, thumbHeight, 5);

      // Make scrollbar thumb interactive for dragging
      this.scrollbarThumb.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(scrollbarX, thumbY, scrollbarWidth, thumbHeight),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains
      });
      this.input.setDraggable(this.scrollbarThumb);

      // Handle scrollbar thumb dragging
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
          
          // Clamp content position
          this.ingredientsContentContainer.y = Phaser.Math.Clamp(newContentY, -maxScroll, 0);
          this.updateScrollbar();
        }
      });

      this.scrollbarThumb.on('dragend', () => {
        this.isScrollbarDragging = false;
      });
      
    } else {
      // If content is not scrollable, hide scrollbar
      this.scrollbar.setVisible(false);
      this.scrollbarThumb.setVisible(false);
      this.scrollbar.disableInteractive();
      this.scrollbarThumb.disableInteractive();
    }
  }

  private getOriginalScale(itemName: string): number {
    const scaleMap: { [key: string]: number } = {
      "Panci": 0.12,
      "water": 0.15,
      "Kacang": 0.2,
      "Beras": 0.2,
      "Garam": 0.2,
      "Kelapa": 0.2,
      "Parut": 0.15,
      "Baskom": 0.15,
      "PanciSaring": 0.12,
      "PanciAir2": 0.12,
      "Piring": 0.15
    };
    return scaleMap[itemName] || 0.15;
  }
}