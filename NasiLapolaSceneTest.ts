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
  // Dialog bridge for React integration
  public dialogBridge: any = null;
  private useReactDialog: boolean = true; // Flag to use React dialog instead of Phaser dialog (ALWAYS true now)

  // Definisikan semua objek game
  private panciKiri!: Phaser.GameObjects.Image; // legacy (unused in new flow)
  private panciKanan!: Phaser.GameObjects.Image; // legacy (unused in new flow)
  private kompor!: Phaser.GameObjects.Image;
  private panciMasak: Phaser.GameObjects.Image | null = null;
  private panciKukus: Phaser.GameObjects.Image | null = null;
  private panciKacang: Phaser.GameObjects.Image | null = null;
  private panciKacangOriginalX: number = 0;
  private panciKacangOriginalY: number = 0;
  private panciKukusOriginalX: number = 0;
  private panciKukusOriginalY: number = 0;
  private wajanNasiLapola: Phaser.GameObjects.Image | null = null;
  private wajanNasiLapolaOriginalX: number = 0;
  private wajanNasiLapolaOriginalY: number = 0;
  private piringInStaging: Phaser.GameObjects.Image | null = null;

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
  private menuToggleButton!: Phaser.GameObjects.Image;
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
  private itemBeingReturned: boolean = false;
  private ingredientsContentMask: Phaser.Display.Masks.GeometryMask | null = null;
  private scrollbarThumb!: Phaser.GameObjects.Graphics;
  private isScrollbarDragging: boolean = false;
  private scrollbarDragStartY: number = 0;
  private contentStartY: number = 0;

  // Mobile swipe scroll variables
  private isSwipeScrolling: boolean = false;
  private swipeStartY: number = 0;
  private swipeStartScrollY: number = 0;
  // NOTE: Hint system removed - now handled by React components in KitchenBackgroundWrapper
  private infoContent: string = `Nasi Lapola adalah hidangan nasi khas Maluku yang memiliki keunikan tersendiri dalam penyajian dan rasanya. Lapola sendiri berasal dari bahasa lokal yang berarti "dicampur" atau "diaduk". Nasi lapola dibuat dari beras yang dimasak dengan santan kelapa dan rempah-rempah seperti pala, cengkeh, dan daun pandan yang memberikan aroma harum dan rasa yang khas. Yang membuat nasi lapola istimewa adalah cara penyajiannya yang dicampur dengan berbagai lauk pauk seperti ayam suwir, ikan asin, sayuran, dan kerupuk, sehingga menjadi satu hidangan yang lengkap dan mengenyangkan. Biasanya nasi ini disajikan dalam porsi besar dan dimakan bersama-sama sebagai simbol kebersamaan dalam masyarakat Maluku. Cita rasanya yang gurih dari santan dan harum dari rempah-rempah membuat nasi lapola menjadi makanan yang sangat digemari, terutama saat acara-acara adat atau perayaan keluarga.`;

  // Stove and timing state
  private isStoveOn: boolean = false;
  private stoveAnimTimer: Phaser.Time.TimerEvent | null = null;
  private stoveButton: Phaser.GameObjects.Graphics | null = null;
  private stoveButtonText: Phaser.GameObjects.Text | null = null;
  private cookCountdownTimer: Phaser.Time.TimerEvent | null = null;
  private cookCountdownText: Phaser.GameObjects.Text | null = null;

  // Step 3-8 working objects
  private baskomObj: Phaser.GameObjects.Image | null = null;
  private saringObj: Phaser.GameObjects.Image | null = null;
  private kukusKelapaObj: Phaser.GameObjects.Image | null = null;
  private wajanNasiObj: Phaser.GameObjects.Image | null = null;

  // Step 4 specific objects
  private panciSaringStep4: Phaser.GameObjects.Image | null = null;
  private statePanciSaringStep4: string = '';

  // New comprehensive step validation system
  private currentSubStep: number = 0;
  private stepValidation: { [step: number]: { allowedItems: string[], totalSubSteps: number } } = {
    0: { allowedItems: ['Panci', 'water', 'Kacang'], totalSubSteps: 3 }, // Step 1: Panci->Water->Kacang
    1: { allowedItems: ['PanciKacang'], totalSubSteps: 1 }, // Step 2: PanciKacang only
    2: { allowedItems: ['Baskom', 'Parut', 'Kelapa'], totalSubSteps: 3 }, // Step 3: Baskom->Parut->Kelapa
    3: { allowedItems: ['PanciSaring', 'BaskomKelapa', 'KukusKelapa'], totalSubSteps: 3 }, // Step 4: PanciSaring->BaskomKelapa->KukusKelapa
    4: { allowedItems: ['PanciAir2', 'Beras'], totalSubSteps: 2 }, // Step 5: PanciAir2->Beras
    5: { allowedItems: ['Garam', 'PanciKelapa', 'PanciKacang'], totalSubSteps: 3 }, // Step 6: Garam->PanciKelapa->PanciKacang
    6: { allowedItems: ['WajanNasiLapola', 'PanciSaring', 'WajanNasiLapola'], totalSubSteps: 3 }, // Step 7: WajanNasiLapola->PanciSaring->WajanNasiLapola
    7: { allowedItems: ['Piring', 'KukusNasi'], totalSubSteps: 2 } // Step 8: Piring->KukusNasi
  };

  // Legacy order validation system (kept for compatibility)
  private ingredientOrder: { [step: number]: string[] } = {
    0: ['Panci', 'water', 'Kacang'],
    1: ['Garam', 'Gula'],
    2: ['Baskom', 'Saring', 'KukusKelapa'],
    3: ['PanciSaring', 'BaskomKelapa'],
    4: ['PanciAir2', 'Beras'],
    5: ['Garam', 'Gula'],
    6: ['PanciSaring'],
    7: ['Piring']
  };

  // Layout configuration - dapat diatur secara manual
    private layoutConfig = {
    // Header bar
    headerHeight: 60,
    
    // Ingredients panel
    ingredientsPanelWidth: 400,
    ingredientsPanelX: 0, // Will be calculated
    ingredientsPanelY: 300, // Turun 150px lagi dari 755 ke 905
    ingredientsPanelHeight: 550,
    
    // Cooking area
    cookingAreaLeft: 20,
    cookingAreaTop: 70,
    cookingAreaRight: 290, // Account for ingredients panel
    cookingAreaBottom: 180, // Account for dialog panel
    
    // NOTE: Dialog panel config removed - using React dialog system

    // Character
    characterX: 1000,
    characterY: 500,

    // Stoves & Pots
    stoveSpacing: 500,
    stoveScale: 0.5, // Increased by 20% (0.45 * 1.20 = 0.54)
    potScale: 0.45,
    
    // Staging area
    stagingAreaX: 200,
    stagingAreaY: 400, // Turun 100px dari 300 ke 400
    stagingAreaWidth: 300,
    stagingAreaHeight: 225
  }

  // Game steps
  private gameSteps: GameStep[] = [
    {
     id:1,
      text: "Selamat Datang di Game Traditional of Moluccas Food, sudah siap untuk Memasak Nasi Lapola hari ini!?! Oke Step 1 ambil Panci di Menu dan taruh di atas kompor. Sudah? Ambil air dan masukkan kedalam Panci. Setelah air masukkan kacang ke dalamnya.",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 2,
      text: "Step ke 2 ayo kita nyalakan Kompornya dengan Klik tuasnya. Tunggu beberapa saat sampai matang. Kacang yang sudah matang dan tempatkan ke Tempat Tiris.",
      character: "karakter2.png",
      isCompleted: false
    },
    {
      id: 3,
      text: "Lanjut, kita parut kelapa terlebih dahulu. Ambil Baskom dan taruh di sebelah kompor. Ambil Parutan Kelapa dan Kelapa diatas baskom. Sudah? Mari kita parut kelapa dengan menggerakkan kelapa ke atas dan bawah",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 4,
      text: "Step ke 4 Taruh Panci baru dari Menu dan taruh ke atas Kompor. Kemudian Ambil Parutan Kelapa tadi dan masukkan ke panci, lanjut kita nyalakan Kompornya dengan Klik tuasnya. Tunggu beberapa saat sampai matang. Kukusan kelapa yang sudah matang dan tempatkan ke Tempat Tiris.",
      character: "karakter4.png",
      isCompleted: false
    },
    {
      id: 5,
      text: "Baik setelah Merebus kacang dan Mengukus kelapa, mari kita masak berasnya. Ambil Panci berisi Air di menu dan Taruh ke Kompor. Ambil Beras dari menu dan masukkan ke dalam Panci air diatas Kompor. Lanjut!! Kita aduk terus beras sampai masak setengah matang.",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 6,
      text: "Beras yang setengah matang mari kita tambahkan dengan bahan lainnya. Ambil Garam terlebih dahulu di Menu dan Kukusan kelapa yang ada di Tempat Tiris. Sudah? Mari kita tambahkan Rebusan Kacang di Tempat Tiris dan Masukkan ke dalam Masakan Beras tadi. Aduk hingga merata, kemudian tunggu beberapa saat sampai matang.",
      character: "karakter6.png",
      isCompleted: false
    },
    {
      id: 7,
      text: "Oke lanjut ya? Kita sisihkan Masakan nasi yang kita masak ke Tempat Tiris di Kiri. Lanjut kita ambil Panci Kukus di Menu dan taruh keatas kompor. Kita ambil lagi Masakan Nasi yang kita sisihkan di Area Tiris dan masukkan ke dalam Panci Kukus. Kita tunggu beberapa saat sampai Nasi matang",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 8,
      text: "Yeayy!!! Kita telah menyelesaikan Masakan Nasi Lapola. Ambil Piring di Menu dan taruh ke Tempat Tiris. Ambil Kukusan Nasi Lapola yang sudah matang dan sajikan ke Piring di Tempat Tiris.",
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

    // NOTE: Phaser dialog removed completely - using React dialog system only

    // Setup dialog bridge integration
    this.setupDialogBridge();

    // Initial update of panel visuals
    this.updateIngredientsPanelVisuals();

    // Setup ingredient panel layout
    // Example: Set ingredient panel position using x and y coordinates
    this.setupIngredientsPanelLayout(undefined, undefined, undefined, 1500, this.layoutConfig.ingredientsPanelY);

    // Initialize drag and drop
    this.initDragAndDrop();

    // NOTE: updateStepDisplay removed - using React dialog system only
    // NOTE: createHintButton removed - hint system now handled by React components in KitchenBackgroundWrapper
  }

  private setupDialogBridge() {
    console.log('🔧 NasiLapola: Setting up dialog bridge...');

    // Wait for dialog bridge to be attached by React
    const checkForBridge = () => {
      console.log('🔍 NasiLapola: Checking for dialog bridge...');
      if (this.dialogBridge) {
        console.log('✅ NasiLapola: Dialog bridge connected!');
        console.log('🎯 NasiLapola: Current game step:', this.currentStep);

        // Test the bridge
        try {
          const currentDialogStep = this.dialogBridge.getCurrentStep();
          console.log('📊 NasiLapola: Current dialog step:', currentDialogStep);

          // Sync initial step
          this.syncDialogWithGameStep();
        } catch (error) {
          console.error('❌ NasiLapola: Bridge test failed:', error);
        }
      } else {
        console.log('⏳ NasiLapola: Bridge not ready, checking again in 500ms...');
        // Try again in 500ms
        this.time.delayedCall(500, checkForBridge);
      }
    };

    // Start checking for bridge
    this.time.delayedCall(100, checkForBridge);
  }

  private syncDialogWithGameStep() {
    if (this.dialogBridge) {
      console.log('🔄 NasiLapola: Syncing dialog with game step...');

      try {
        // Make sure dialog is at the correct step
        const currentDialogStep = this.dialogBridge.getCurrentStep();
        console.log(`📊 NasiLapola: Game step: ${this.currentStep}, Dialog step: ${currentDialogStep}`);

        if (this.currentStep !== currentDialogStep) {
          console.log(`🔄 NasiLapola: Syncing dialog step from ${currentDialogStep} to ${this.currentStep}`);
          this.dialogBridge.setStep(this.currentStep);
          console.log('✅ NasiLapola: Dialog sync complete');
        } else {
          console.log('✅ NasiLapola: Dialog already in sync');
        }
      } catch (error) {
        console.error('❌ NasiLapola: Dialog sync failed:', error);
      }
    } else {
      console.log('❌ NasiLapola: No dialog bridge available for sync');
    }
  }

  private calculateLayout() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Calculate ingredients panel position
    this.layoutConfig.ingredientsPanelX = gameWidth - this.layoutConfig.ingredientsPanelWidth - 15;
    
    
    // Update cooking area bounds - no longer need to account for dialog panel
    this.layoutConfig.cookingAreaRight = gameWidth - this.layoutConfig.ingredientsPanelWidth - 40;
    this.layoutConfig.cookingAreaBottom = gameHeight - 40; // More space since no dialog panel

    // Update mask position after layout changes
    this.updateMaskPosition();
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

    // Update mask position when panel moves
    this.updateMaskPosition();
  }

  private updateMaskPosition() {
    if (this.ingredientsContentMask && this.ingredientsContentMask.geometryMask) {
      const maskGraphics = this.ingredientsContentMask.geometryMask as Phaser.GameObjects.Graphics;
      const scrollableAreaX = 12;
      const scrollableAreaY = 60; // Restored to original value

      // Simply update mask position to follow panel (size is already correct)
      maskGraphics.x = this.ingredientsPanel.x + scrollableAreaX;
      maskGraphics.y = this.ingredientsPanel.y + scrollableAreaY;
    }
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
    // Place single stove at 280px from bottom
    const gameHeight = this.cameras.main.height;
    const stoveYPos = gameHeight - 280; // 280px dari dasar halaman
    this.setStoveCoordinates(((this.layoutConfig.cookingAreaLeft + this.layoutConfig.cookingAreaRight) / 2) - 90, stoveYPos);

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
      "Tempat Tiris",
      {
        fontSize: '28px',
        fontFamily: 'Chewy, cursive',
        color: '#FFE4B5',
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0.5);

    // No initial pots placed in new flow
    // Create stove on/off button
    this.createStoveButton();

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
    const scrollableAreaX = 12; // Relative to ingredientsPanel - matches border and rounded corner
    const scrollableAreaY = 60; // Restored to original value, below header area
    const scrollableAreaWidth = this.layoutConfig.ingredientsPanelWidth - 36; // Panel width minus left(12) + right(12) + scrollbar(12)
    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - scrollableAreaY - 12; // Remaining height with bottom padding matching border

    this.scrollableArea = this.add.zone(
      scrollableAreaX + scrollableAreaWidth / 2,
      scrollableAreaY + scrollableAreaHeight / 2,
      scrollableAreaWidth,
      scrollableAreaHeight
    ).setOrigin(0.5, 0.5);
    this.ingredientsPanel.add(this.scrollableArea);

    // Create a container for the actual ingredient items
    // Position container at scrollable area since we now have proper padding in content
    this.ingredientsContentContainer = this.add.container(scrollableAreaX, scrollableAreaY);
    this.ingredientsPanel.add(this.ingredientsContentContainer);

    // Set up a clipping mask for the ingredients content
    const maskGraphics = this.make.graphics();
    maskGraphics.fillRect(0, 0, scrollableAreaWidth, scrollableAreaHeight); // Define mask in local coordinates
    this.ingredientsContentMask = maskGraphics.createGeometryMask(); // Store the mask object

    // Position the maskGraphics to align with the scrollable area in world coordinates
    maskGraphics.x = this.ingredientsPanel.x + scrollableAreaX;
    maskGraphics.y = this.ingredientsPanel.y + scrollableAreaY;

    // Apply mask but allow dragging outside of it
    this.ingredientsContentContainer.setMask(this.ingredientsContentMask);

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

    // Add mobile-friendly swipe scroll mechanism after ingredients are created
    this.setupSwipeScrolling(scrollableAreaX, scrollableAreaY, scrollableAreaWidth, scrollableAreaHeight);

    // Initial mask position update
    this.updateMaskPosition();
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
      { key: "PanciSaring", name: "Panci Saring", scale: 0.14 },
      { key: "PanciSaring", name: "Panci Saring", scale: 0.14 },
      // Remove spatula from panel per request
      { key: "PanciAir2", name: "Panci Air", scale: 0.12 },
      { key: "Piring", name: "Piring", scale: 0.15 }
    ];

    // Manual grid layout - Larger UI items, left-shifted 2-column layout with closer horizontal spacing
    const panelWidth = this.layoutConfig.ingredientsPanelWidth;
    const itemWidth = 160; // Increased item background width
    const itemHeight = 110; // Increased item background height
    const horizontalGap = 20; // Small gap between columns (was panelWidth/2)
    const totalContentWidth = (itemWidth * 2) + horizontalGap; // Total width of 2 columns + gap
    const leftMargin = 30; // Left margin to shift items to the left
    const startX = leftMargin + (itemWidth / 2); // Shift layout to the left
    const topPadding = 100;
    const startY = 20 + topPadding;
    const spacingX = itemWidth + horizontalGap; // Close horizontal spacing
    const spacingY = 120; // Slightly increased vertical spacing for larger items
    const itemsPerRow = 2;

    let maxContentY = 0;

    ingredients.forEach((ingredient, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = startX + (col * spacingX);
      const y = startY + (row * spacingY);

      // Item background - Larger size for better UI
      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x000000, 0.25);
      itemBg.fillRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
      itemBg.lineStyle(1, 0x8B4513, 0.4);
      itemBg.strokeRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
      this.ingredientsContentContainer.add(itemBg); // Add to content container

      // Item image - Larger scale for better visibility
      const item = this.add.image(x, y, ingredient.key)
        .setInteractive() // Simple interactive setup
        .setScale(ingredient.scale * 1.5) // Increased scale from 1.3 to 1.5 for bigger items
        .setName(ingredient.key)
        .setData('originalScale', ingredient.scale * 1.5) // Store the increased scale
        .setData('ingredientType', ingredient.key);

      this.ingredientItems.push(item);
      this.input.setDraggable(item); // Simple draggable setup like other scenes
      this.ingredientsContentContainer.add(item); // Add to content container

      // Item label - Larger font size
      const label = this.add.text(x, y + 50, ingredient.name, {
        fontSize: '18px', // Increased from 14px to 18px
        fontFamily: 'Chewy, cursive',
        color: '#FFE4B5',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      this.ingredientsContentContainer.add(label); // Add to content container

      // Hover effects completely disabled
      item.on('pointerover', () => {
        // No hover effects like in IkanKuahKuningScene
      });

      item.on('pointerout', () => {
        // Always reset to normal state with new larger sizes
        item.setScale(ingredient.scale * 1.5); // Use increased scale
        label.setColor('#FFE4B5');
        itemBg.clear();
        itemBg.fillStyle(0x000000, 0.25);
        itemBg.fillRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
        itemBg.lineStyle(1, 0x8B4513, 0.4);
        itemBg.strokeRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
      });
      maxContentY = Math.max(maxContentY, y + 40); // Track the lowest point of content
    });

    const bottomPadding = 15; // Space kosong di bawah konten
    this.scrollContentHeight = maxContentY + bottomPadding; // Calculate total content height with bottom padding
    this.updateScrollbar(); // Initial update of scrollbar
  }

  // NOTE: createDialogPanel method removed - using React dialog system only

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
    this.updateMaskPosition(); // Update mask position
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
      ease: 'Power2',
      onUpdate: () => {
        // Update mask position during animation
        this.updateMaskPosition();
      }
    });

    // Hide/show ingredients
    this.ingredientItems.forEach(item => {
      item.setVisible(this.isIngredientsPanelOpen);
      item.setActive(this.isIngredientsPanelOpen);
    });
  }

  // NOTE: updateStepDisplay method removed - using React dialog system only

  private nextStep() {
    if (this.currentStep < this.gameSteps.length - 1) {
      this.gameSteps[this.currentStep].isCompleted = true;
      this.currentStep++;
      this.currentSubStep = 0; // Reset sub-step when moving to next step

      // NOTE: updateStepDisplay removed - using React dialog system only

      // Update React dialog system if bridge is available
      if (this.dialogBridge) {
        console.log(`🚀 NasiLapola: Game advancing to step ${this.currentStep + 1}`);
        console.log(`🎯 NasiLapola: Updating dialog to step index ${this.currentStep}`);

        try {
          this.dialogBridge.setStep(this.currentStep);
          console.log('✅ NasiLapola: Dialog update successful');

          // Verify the update
          const verifyStep = this.dialogBridge.getCurrentStep();
          console.log(`🔍 NasiLapola: Verification - dialog is now at step ${verifyStep}`);
        } catch (error) {
          console.error('❌ NasiLapola: Dialog update failed:', error);
        }
      } else {
        console.log('❌ NasiLapola: No dialog bridge available - step not synchronized');
      }

      // Handle panciMasak dragging state for step 6 (currentStep === 5)
      if (this.panciMasak) {
        if (this.currentStep === 5) {
          // Disable dragging during step 6 - pot stays on stove
          this.input.setDraggable(this.panciMasak, false);
          console.log('Entered step 6 (currentStep 5) - PanciKacang exists:', !!this.panciKacang);
          // Enable dragging for items in staging area during step 6
          if (this.panciKacang) {
            this.enableStagingItemDrag(this.panciKacang);
          }
          if (this.panciKukus) {
            this.enableStagingItemDrag(this.panciKukus);
          }
        } else if (this.currentStep === 6) {
          // Re-enable dragging when leaving step 6
          this.input.setDraggable(this.panciMasak, true);
          // Disable dragging for items in staging area when leaving step 6
          if (this.panciKacang) {
            this.disableStagingItemDrag(this.panciKacang);
          }
          if (this.panciKukus) {
            this.disableStagingItemDrag(this.panciKukus);
          }
        }
      }

      // Success feedback
      this.cameras.main.flash(200, 144, 238, 144, false);
    }
  }

  private nextSubStep() {
    const validation = this.stepValidation[this.currentStep];
    if (validation && this.currentSubStep < validation.totalSubSteps - 1) {
      this.currentSubStep++;
      console.log(`Advanced to sub-step ${this.currentSubStep} of step ${this.currentStep}`);
    } else {
      // All sub-steps completed, move to next step
      this.nextStep();
    }
  }

  private isItemAllowedToDrag(itemName: string): boolean {
    const validation = this.stepValidation[this.currentStep];
    if (!validation) return false;

    // Special case for step 2: allow dragging cooked pot from stove to staging
    if (this.currentStep === 1 && this.panciMasak && this.statePanciMasak === 'kacang_matang') {
      // Allow dragging the cooked pot regardless of itemName for step 2
      return true;
    }

    // Special case for step 4: allow dragging cooked coconut from stove to staging
    if (this.currentStep === 3 && this.panciSaringStep4 && this.statePanciSaringStep4 === 'kelapa_matang') {
      // Allow dragging the cooked coconut pot regardless of itemName for step 4
      return true;
    }

    // Special case for step 4: allow dragging KukusKelapa when cooked
    if (this.currentStep === 3 && itemName === 'KukusKelapa' && this.statePanciSaringStep4 === 'kelapa_matang') {
      return true;
    }

    // Special case for step 6: allow dragging staging items at appropriate substeps
    if (this.currentStep === 5) {
      // Allow PanciKelapa (KukusKelapa) at substep 1
      if (this.currentSubStep === 1 && itemName === 'PanciKelapa') {
        return true;
      }
      // Allow PanciKacang at substep 2
      if (this.currentSubStep === 2 && itemName === 'PanciKacang') {
        return true;
      }
    }

    // Special case for step 7: allow dragging WajanNasiLapola from kompor and staging items
    if (this.currentStep === 6) {
      // Allow WajanNasiLapola from staging at substep 2
      if (this.currentSubStep === 2 && itemName === 'WajanNasiLapola') {
        return true;
      }
    }

    const allowedItem = validation.allowedItems[this.currentSubStep];
    const isAllowed = itemName === allowedItem;

    console.log(`Drag validation: Step ${this.currentStep}, SubStep ${this.currentSubStep}, Item: ${itemName}, Allowed: ${allowedItem}, Result: ${isAllowed}`);
    return isAllowed;
  }

  private preventDragWithShake(gameObject: Phaser.GameObjects.Image) {
    // Disable interaction temporarily
    gameObject.disableInteractive();

    // Screen shake effect
    this.cameras.main.shake(200, 0.01);

    // Re-enable interaction after shake
    this.time.delayedCall(300, () => {
      if (gameObject && gameObject.scene) {
        gameObject.setInteractive({ draggable: true });
      }
    });
  }

  private returnToOriginalPosition(gameObject: Phaser.GameObjects.Image) {
    const originalX = gameObject.getData('dragStartX') || gameObject.input?.dragStartX || gameObject.x;
    const originalY = gameObject.getData('dragStartY') || gameObject.input?.dragStartY || gameObject.y;

    this.tweens.add({
      targets: gameObject,
      x: originalX,
      y: originalY,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  private enableStagingItemDrag(item: Phaser.GameObjects.Image) {
    if (item && item.scene) {
      item.setInteractive();
      this.input.setDraggable(item);
      // Store current position as drag start for return mechanism
      item.setData('dragStartX', item.x);
      item.setData('dragStartY', item.y);
      // Also store in input for compatibility
      if (item.input) {
        item.input.dragStartX = item.x;
        item.input.dragStartY = item.y;
      }
      console.log(`Enabled dragging for ${item.name} in staging area at position:`, item.x, item.y);
    }
  }

  private disableStagingItemDrag(item: Phaser.GameObjects.Image) {
    if (item && item.scene) {
      item.disableInteractive();
      console.log(`Disabled dragging for ${item.name} in staging area`);
    }
  }


  private initDragAndDrop() {
    this.input.on("dragstart", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      // Check if item is allowed to be dragged in current step/substep
      const itemName = gameObject.name;
      if (!this.isItemAllowedToDrag(itemName)) {
        // Prevent drag and show shake effect
        this.preventDragWithShake(gameObject);
        return;
      }

      // Debug logging for special objects
      if (gameObject === this.panciKacang) {
        console.log('PanciKacang drag started at:', gameObject.x, gameObject.y);
      } else if (gameObject === this.wajanNasiLapola) {
        console.log('WajanNasiLapola drag started at:', gameObject.x, gameObject.y);
      }

      this.draggedItemOriginalParent = gameObject.parentContainer;
      this.draggedItemOriginalX = gameObject.x;
      this.draggedItemOriginalY = gameObject.y;

      // Ensure dragStart coordinates are properly stored
      if (gameObject.input) {
        gameObject.input.dragStartX = gameObject.x;
        gameObject.input.dragStartY = gameObject.y;
      }

      // Store original position in game object data as well
      gameObject.setData('dragStartX', gameObject.x);
      gameObject.setData('dragStartY', gameObject.y);

      if (gameObject.parentContainer) {
        const parent = gameObject.parentContainer;

        // Remove any mask from the item being dragged
        gameObject.clearMask();

        parent.remove(gameObject);
        this.add.existing(gameObject);

        // Set posisi langsung ke posisi pointer/cursor
        gameObject.x = pointer.worldX;
        gameObject.y = pointer.worldY;
      }

      // Keep mask enabled for remaining items in container
      // The dragged item is already removed from container and added to scene level,
      // and has its mask cleared so it won't be affected by any masking

      gameObject.setDepth(1000);
    });
    

    // Drag update - provide visual feedback based on validity
    this.input.on("drag", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      gameObject.x = pointer.worldX;
      gameObject.y = pointer.worldY;

      // Provide visual feedback for valid/invalid ingredients
      if (!this.isValidIngredient(gameObject.name)) {
        // Invalid ingredient - red tint to indicate it's not the right time
        gameObject.setTint(0xFF6666);
      } else {
        // Valid ingredient - yellow tint
        gameObject.setTint(0xFFFFAA);
      }
    });

    // Drag end - handle return to panel or stay in dropped position
    this.input.on("dragend", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
      // Reset visual effects
      gameObject.clearTint();
      gameObject.setDepth(0);

      // If dropped successfully, don't return item
      if (dropped) {
        // Valid drop handled in drop event - don't return item
        return;
      }

      // ALWAYS return item to original position (panel or staging area)
      // Check if the gameObject still exists (not destroyed by valid drop)
      if (gameObject.scene) {
        console.log(`Returning ${gameObject.name} to original position`);

        // Reset scale for ingredients going back to original position
        const originalScale = gameObject.getData('originalScale') || 0.15;
        gameObject.setScale(originalScale);

        if (this.draggedItemOriginalParent) {
          // Return to original container
          this.draggedItemOriginalParent.add(gameObject);

          // Animate back to original position
          this.tweens.add({
            targets: gameObject,
            x: this.draggedItemOriginalX,
            y: this.draggedItemOriginalY,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
              gameObject.setInteractive();
              // Re-apply mask to the entire container (which will affect all items in it including this one)
              if (this.ingredientsContentContainer && this.ingredientsContentMask) {
                this.ingredientsContentContainer.setMask(this.ingredientsContentMask);
              }
            }
          });
        } else {
          // Fallback: handle items created outside ingredient panel (like BaskomKelapa, PanciKacang, PanciKukus)
          if (gameObject.name === 'BaskomKelapa' && this.baskomObj === gameObject) {
            // Return BaskomKelapa to its position in staging area
            this.tweens.add({
              targets: gameObject,
              x: this.draggedItemOriginalX,
              y: this.draggedItemOriginalY,
              duration: 400,
              ease: 'Back.easeOut',
              onComplete: () => {
                gameObject.setInteractive();
              }
            });
          } else if (gameObject === this.panciKacang) {
            // Return PanciKacang to its original position in staging area
            console.log('Returning PanciKacang to staging area position:', this.panciKacangOriginalX, this.panciKacangOriginalY);
            this.tweens.add({
              targets: gameObject,
              x: this.panciKacangOriginalX,
              y: this.panciKacangOriginalY,
              scale: 0.25, // Updated to match PanciKacang scale
              duration: 400,
              ease: 'Back.easeOut',
              onComplete: () => {
                gameObject.setInteractive();
              }
            });
          } else if (gameObject === this.panciKukus) {
            // Return PanciKukus to its original position in staging area
            console.log('Returning PanciKukus to staging area position:', this.panciKukusOriginalX, this.panciKukusOriginalY);
            this.tweens.add({
              targets: gameObject,
              x: this.panciKukusOriginalX,
              y: this.panciKukusOriginalY,
              scale: 0.25,
              duration: 400,
              ease: 'Back.easeOut',
              onComplete: () => {
                gameObject.setInteractive();
              }
            });
          } else if (gameObject === this.panciSaringStep4) {
            // Return KukusKelapa (panciSaringStep4) to kompor position
            console.log('Returning KukusKelapa to kompor position');
            const komporX = gameObject.getData('dragStartX') || gameObject.x;
            const komporY = gameObject.getData('dragStartY') || gameObject.y;
            this.tweens.add({
              targets: gameObject,
              x: komporX,
              y: komporY,
              duration: 400,
              ease: 'Back.easeOut',
              onComplete: () => {
                gameObject.setInteractive();
              }
            });
          } else if (gameObject === this.wajanNasiLapola) {
            // Return WajanNasiLapola to its original position in staging area
            console.log('Returning WajanNasiLapola to staging area position:', this.wajanNasiLapolaOriginalX, this.wajanNasiLapolaOriginalY);
            this.tweens.add({
              targets: gameObject,
              x: this.wajanNasiLapolaOriginalX,
              y: this.wajanNasiLapolaOriginalY,
              scale: 0.38, // Match size with PanciAir2
              duration: 400,
              ease: 'Back.easeOut',
              onComplete: () => {
                gameObject.setInteractive();
              }
            });
          } else {
            // Other fallback items: add to ingredients container
            if (this.ingredientsContentContainer) {
              this.ingredientsContentContainer.add(gameObject);
            }
            gameObject.setInteractive();
            gameObject.setVisible(true);
          }
        }
      }

      // Reset stored properties
      this.draggedItemOriginalParent = null;
      this.draggedItemOriginalX = 0;
      this.draggedItemOriginalY = 0;
    });

    // Enhanced drop handling dengan improved feedback
    this.input.on("drop", (pointer: any, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedKey = gameObject.name;

      // STEP 1: Place pot on stove, pour water, then add beans (Panci->Water->Kacang sequence)
      if (dropZone === this.komporZone && this.currentStep === 0 && this.currentSubStep === 0 && droppedKey === "Panci" && !this.panciMasak) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciMasak = this.add.image(dropZone.x - 25, dropZone.y - 80, "Panci").setScale(0.38).setInteractive().setData('originalScale', 0.38);
          this.input.setDraggable(this.panciMasak);
          this.statePanciMasak = "empty";
          this.nextSubStep(); // Move to sub-step 1 (water)
        });
      }
      else if (this.panciMasak && this.currentStep === 0 && this.currentSubStep === 1 && droppedKey === "water" && this.statePanciMasak === "empty" && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["TuangAir1", "TuangAir2", "TuangAir3", "TuangAir4"], 6000, () => {
          if (this.panciMasak) {
            this.panciMasak.setTexture("PanciAir");
            this.panciMasak.setScale(0.48); // Adjust scale for PanciAir texture
            this.statePanciMasak = "air";
            this.nextSubStep(); // Move to sub-step 2 (kacang)
          }
        }, this.panciMasak);
      }
      else if (this.panciMasak && this.currentStep === 0 && this.currentSubStep === 2 && droppedKey === "Kacang" && this.statePanciMasak === "air" && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["MasukkanKacang1", "MasukkanKacang2", "MasukkanKacang3", "MasukkanKacang4"], 6000, () => {
          if (this.panciMasak) {
            this.panciMasak.setTexture("PanciKacang");
            this.panciMasak.setScale(0.48); // Adjust scale for PanciKacang texture
            this.statePanciMasak = "kacang_mentah";
            this.nextSubStep(); // This will call nextStep() since it's the last sub-step
          }
        }, this.panciMasak);
      }
      // STEP 2: Turn on stove (5 clicks), countdown 30s, then allow moving PanciKacang to staging (PanciKacang only)
      else if (dropZone === this.stagingZone && this.currentStep === 1 && this.currentSubStep === 0 && this.panciMasak && this.statePanciMasak === "kacang_matang") {
        // Position PanciKacang on the left side of staging area
        const panciKacangX = dropZone.x - 50; // Move left 5px
        const panciKacangY = dropZone.y - 5; // Move down 5px
        this.executeSuccessfulMove(this.panciMasak, panciKacangX, panciKacangY);
        // Create PanciKacang reference for step 6
        this.panciKacang = this.add.image(panciKacangX, panciKacangY, 'PanciKacang').setScale(0.25).setInteractive().setName('PanciKacang'); // Match KukusKelapa scale
        // Disable dragging initially - only allow when it's time to use
        this.panciKacang.disableInteractive();
        // Save original position for return mechanism
        this.panciKacangOriginalX = panciKacangX;
        this.panciKacangOriginalY = panciKacangY;
        console.log('PanciKacang created in staging area at:', dropZone.x, dropZone.y);
        // Remove the old cooking pot
        if (this.panciMasak) {
          this.panciMasak.destroy();
          this.panciMasak = null;
        }
        this.nextSubStep(); // This will call nextStep() since it's the only sub-step
      }
      // STEP 2: Handle invalid drop of cooked PanciKacang (not to staging area)
      else if (this.currentStep === 1 && gameObject === this.panciMasak && this.statePanciMasak === 'kacang_matang') {
        console.log('PanciKacang dropped to invalid location - returning to kompor position');
        // Return PanciKacang to kompor position
        this.returnToOriginalPosition(gameObject);
      }
      // STEP 4: Handle invalid drop of cooked KukusKelapa (not to staging area)
      else if (this.currentStep === 3 && this.currentSubStep === 2 && gameObject === this.panciSaringStep4 && this.statePanciSaringStep4 === 'kelapa_matang' && dropZone !== this.stagingZone) {
        console.log('KukusKelapa dropped to invalid location - returning to kompor position');
        // Return KukusKelapa to kompor position
        this.returnToOriginalPosition(gameObject);
      }
      // STEP 3: Grating workflow (Baskom->Parut->Kelapa sequence)
      else if (this.currentStep === 2 && this.currentSubStep === 0 && droppedKey === "Baskom" && !this.baskomObj) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.baskomObj = this.add.image(this.prepRightZone.x, this.prepRightZone.y, "Baskom").setScale(0.39).setInteractive();
          this.baskomObj.setData('type', 'baskom');
          this.nextSubStep(); // Move to sub-step 1 (Parut)
        });
      }
      else if (this.currentStep === 2 && this.currentSubStep === 1 && droppedKey === "Parut" && this.baskomObj && !this.saringObj && Phaser.Geom.Rectangle.Contains(this.baskomObj.getBounds(), pointer.x, pointer.y)) {
        this.executeSuccessfulDrop(gameObject, () => {
          // Remove baskom view and replace with saring
          const bx = this.baskomObj ? this.baskomObj.x : this.prepRightZone.x;
          const by = this.baskomObj ? this.baskomObj.y : this.prepRightZone.y;
          if (this.baskomObj) this.baskomObj.destroy();
          this.baskomObj = null;
          this.saringObj = this.add.image(bx, by, "SaringKelapa").setScale(0.39).setInteractive().setName('SaringKelapa');
          this.saringObj.setData('type', 'saring');
          this.nextSubStep(); // Move to sub-step 2 (Kelapa)
        });
      }
      else if (this.currentStep === 2 && this.currentSubStep === 2 && droppedKey === "Kelapa" && this.saringObj && Phaser.Geom.Rectangle.Contains(this.saringObj.getBounds(), pointer.x, pointer.y)) {
        this.executeSuccessfulDrop(gameObject, () => {
          const sx = this.saringObj!.x;
          const sy = this.saringObj!.y;
          this.saringObj?.destroy();
          this.saringObj = this.add.image(sx, sy, "SaringKelapa1").setScale(0.39).setInteractive().setName('SaringKelapa1');
          this.saringObj.setData('type', 'saring_active');
          this.initGratingMechanic(this.saringObj);
          // nextSubStep will be called from initGratingMechanic when grating is complete
        });
      }
      // STEP 4: Steaming Coconut (PanciSaring->BaskomKelapa->KukusKelapa sequence)
      else if (dropZone === this.komporZone && this.currentStep === 3 && this.currentSubStep === 0 && droppedKey === "PanciSaring" && !this.panciSaringStep4) {
        console.log('PanciSaring placed on stove for step 4');
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciSaringStep4 = this.add.image(dropZone.x - 15, dropZone.y - 60, 'PanciSaring')
            .setScale(this.layoutConfig.potScale)
            .setInteractive()
            .setName('PanciSaring')
            .setData('originalScale', this.layoutConfig.potScale);
          this.input.setDraggable(this.panciSaringStep4);
          this.statePanciSaringStep4 = 'empty';
          this.nextSubStep(); // Move to sub-step 1 (BaskomKelapa)
        });
      }
      else if (this.currentStep === 3 && this.currentSubStep === 1 && droppedKey === 'BaskomKelapa') {
        console.log('BaskomKelapa drop attempt:');
        console.log('- panciSaringStep4 exists:', !!this.panciSaringStep4);
        console.log('- currentStep:', this.currentStep, 'currentSubStep:', this.currentSubStep);
        console.log('- statePanciSaringStep4:', this.statePanciSaringStep4);

        if (this.panciSaringStep4 && this.statePanciSaringStep4 === 'empty' && Phaser.Geom.Rectangle.Contains(this.panciSaringStep4.getBounds(), pointer.x, pointer.y)) {
          console.log('BaskomKelapa dropped successfully on PanciSaring!');
          // Execute pour animation dengan BaskomKelapa menuang ke PanciSaring
        this.executePourAnimation(gameObject, ["KelapaMasuk1","KelapaMasuk2","KelapaMasuk3"], 6000, () => {
          if (this.panciSaringStep4) {
            // Setelah animasi selesai, panciSaring berubah menjadi KukusKelapa
            this.panciSaringStep4.setTexture('KukusKelapa');
            this.panciSaringStep4.setName('KukusKelapa');
            this.statePanciSaringStep4 = 'kelapa_mentah';
            this.panciSaringStep4.disableInteractive(); // Disable dragging selama memasak

            // Cek apakah kompor sudah menyala untuk memulai countdown
            if (this.isStoveOn) {
              // Mulai countdown 30 detik untuk mengukus kelapa
              this.startCookCountdown(30, () => {
                if (this.panciSaringStep4) {
                  this.statePanciSaringStep4 = 'kelapa_matang';
                  // Ensure pot is draggable again after cook
                  this.panciSaringStep4.setInteractive();
                  this.input.setDraggable(this.panciSaringStep4);
                  // Store current position as drag start for return mechanism
                  this.panciSaringStep4.setData('dragStartX', this.panciSaringStep4.x);
                  this.panciSaringStep4.setData('dragStartY', this.panciSaringStep4.y);
                  this.nextSubStep(); // Move to sub-step 2 (KukusKelapa)
                }
              });
            } else {
              this.nextSubStep(); // Move to sub-step 2 immediately if stove not on
            }
          }
        }, this.panciSaringStep4);
        } else {
          console.log('BaskomKelapa drop failed - conditions not met');
          this.executeInvalidDrop(gameObject);
        }
      }
      // STEP 4: Turn on stove (5 clicks), countdown 30s, then allow moving KukusKelapa to staging (KukusKelapa only)
      else if (dropZone === this.stagingZone && this.currentStep === 3 && this.currentSubStep === 2 && this.panciSaringStep4 && this.statePanciSaringStep4 === 'kelapa_matang') {
        console.log('KukusKelapa drop to staging area - conditions met!');
        // Position KukusKelapa on the right side of staging area
        const panciKukusX = dropZone.x + 30; // Move left 5px
        const panciKukusY = dropZone.y - 15; // Move down 5px
        this.executeSuccessfulMove(this.panciSaringStep4, panciKukusX, panciKukusY);
        // Create PanciKelapa reference for step 6 (keep the KukusKelapa visual)
        this.panciKukus = this.add.image(panciKukusX, panciKukusY, 'KukusKelapa').setScale(0.25).setInteractive().setName('PanciKelapa');
        // Disable dragging initially - only allow when it's time to use
        this.panciKukus.disableInteractive();
        // Save original position for return mechanism
        this.panciKukusOriginalX = panciKukusX;
        this.panciKukusOriginalY = panciKukusY;
        console.log('PanciKelapa created in staging area at:', dropZone.x, dropZone.y);
        // Remove the old steaming pot
        if (this.panciSaringStep4) {
          this.panciSaringStep4.destroy();
          this.panciSaringStep4 = null;
        }
        this.nextSubStep(); // This will call nextStep() since it's the last sub-step
      }
      // STEP 5: Rice - place PanciAir2, pour Beras, then stir 15x to NasiAduk
      else if (dropZone === this.komporZone && this.currentStep === 4 && this.currentSubStep === 0 && droppedKey === "PanciAir2" && !this.panciMasak) {
        if (!this.isStoveOn) {
          this.executeInvalidDrop(gameObject);
        } else {
        this.executeSuccessfulDrop(gameObject, () => {
            this.panciMasak = this.add.image(dropZone.x - 20, dropZone.y - 75, 'PanciAir2').setScale(0.38).setInteractive().setData('originalScale', 0.38); // Move up 10px (from -65 to -75)
            this.input.setDraggable(this.panciMasak);
            this.statePanciMasak = 'air';
            this.nextSubStep(); // Move to sub-step 1 (Beras only)
          });
        }
      }
      else if (this.panciMasak && this.currentStep === 4 && this.currentSubStep === 1 && droppedKey === 'Beras' && this.statePanciMasak === 'air' && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["MasukkanBeras1","MasukkanBeras2","MasukkanBeras3"], 6000, () => {
          if (this.panciMasak) {
            this.panciMasak.setTexture('PanciAirSepatula');
            this.initStirMechanic(this.panciMasak, ['PanciAirSepatula2','PanciAirSepatula3'], 15, () => {
              if (this.panciMasak) {
                this.panciMasak.setTexture('NasiAduk');
                this.panciMasak.setScale(0.51); // Updated size for NasiAduk
                this.panciMasak.setX(this.panciMasak.x + 5); // Move right 5px
                this.panciMasak.setY(this.panciMasak.y + 3); // Move down 3px
                this.statePanciMasak = 'beras_diaduk';
          this.nextStep();
          }
        });
      }
        }, this.panciMasak);
      }
      // STEP 5: Handle invalid drops to PanciAir2 (only Beras allowed)
      else if (this.currentStep === 4 && this.currentSubStep === 1 && this.panciMasak && this.statePanciMasak === 'air' && droppedKey !== 'Beras' && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        console.log(`Invalid item ${droppedKey} dropped on PanciAir2 - only Beras allowed`);
        this.executeInvalidDrop(gameObject);
      }
      // STEP 6: Add Garam, Kelapa (from staging), Kacang (from staging), stir 15x to WajanNasiLapola then wait 30s
      // Sub-step 0: Add Garam to NasiAduk
      else if (this.panciMasak && this.currentStep === 5 && this.currentSubStep === 0 && droppedKey === 'Garam' && this.panciMasak.texture.key === 'NasiAduk' && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["TuangGaram1","TuangGaram2","TuangGaram3"], 6000, () => {
          if (this.panciMasak) {
            this.panciMasak.setTexture('NasiGaram');
            this.panciMasak.setScale(0.48); // Updated size for NasiGaram
            this.nextSubStep(); // Move to sub-step 1 (PanciKelapa)
          }
        }, this.panciMasak);
      }
      // Handle invalid Garam drop - return to original position with camera shake
      else if (this.currentStep === 5 && droppedKey === 'Garam') {
        this.executeInvalidDrop(gameObject);
      }
      // Sub-step 1: Add PanciKelapa (KukusKelapa) to NasiGaram
      else if (this.panciMasak && this.currentStep === 5 && this.currentSubStep === 1 && gameObject.name === 'PanciKelapa' && this.panciMasak.texture.key === 'NasiGaram') {
        const bounds = this.panciMasak.getBounds();
        const hitArea = new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
        hitArea.width += 20;
        hitArea.height += 20;
        hitArea.x -= 10;
        hitArea.y -= 10;
        if (Phaser.Geom.Rectangle.Contains(hitArea, pointer.x, pointer.y)) {
        this.executePourAnimation(gameObject, ["TuangKelapa1","TuangKelapa2","TuangKelapa3"], 6000, () => {
          if (this.panciMasak) {
            this.panciMasak.setTexture('NasiKelapa');
            // Move NasiKelapa up 10px, right 5px
            this.panciMasak.setPosition(this.panciMasak.x + 5, this.panciMasak.y - 10);
            this.nextSubStep(); // Move to sub-step 2 (PanciKacang)
          }
          if (this.panciKukus) {
            this.panciKukus.destroy();
            this.panciKukus = null;
          }
        }, this.panciMasak);
        }
      }
      // Handle invalid PanciKelapa drop - return to staging area with camera shake
      else if (this.currentStep === 5 && gameObject.name === 'PanciKelapa') {
        if (this.currentSubStep !== 1) {
          console.log(`PanciKukus dropped at wrong time (substep ${this.currentSubStep}) - should be substep 1`);
        }
        this.executeInvalidDrop(gameObject);
      }
      // Handle invalid PanciKacang drop at wrong substep
      else if (this.currentStep === 5 && gameObject === this.panciKacang && this.currentSubStep !== 2) {
        console.log(`PanciKacang dropped at wrong time (substep ${this.currentSubStep}) - should be substep 2`);
        this.executeInvalidDrop(gameObject);
      }
      // Sub-step 2: Add PanciKacang to PanciBerasKelapa
      else if (this.currentStep === 5 && this.currentSubStep === 2 && gameObject === this.panciKacang) {
        console.log('PanciKacang drop detected:', {
          currentStep: this.currentStep,
          currentSubStep: this.currentSubStep,
          panciMasak: !!this.panciMasak,
          panciMasakTexture: this.panciMasak?.texture.key,
          panciKacang: !!this.panciKacang,
          gameObjectName: gameObject.name
        });

        if (this.panciMasak && this.panciMasak.texture.key === 'NasiKelapa' && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y)) {
          // PanciKacang dragged to NasiKelapa - pour beans animation
          console.log('PanciKacang dropped on NasiKelapa - starting animation');
          this.executePourAnimation(gameObject, ["TuangKacang1","TuangKacang2","TuangKacang3"], 6000, () => {
            if (this.panciMasak) {
              this.panciMasak.setTexture('AdukKacang');
              this.panciMasak.setScale(0.67); // Reduced size by 5px (0.72 - 0.05 = 0.67)
              this.panciMasak.setY(this.panciMasak.y - 13); // Move up 8px more (from -5 to -13)
              this.initStirMechanic(this.panciMasak, ['AdukKacang','AdukKacang2'], 15, () => {
                if (this.panciMasak) {
                  this.panciMasak.setTexture('WajanNasiLapola');
                  this.panciMasak.setScale(0.51); // Match size with NasiAduk
                  this.panciMasak.setY(this.panciMasak.y + 3); // Move down 3px
                  this.panciMasak.setName('WajanNasiLapola'); // Set name for drag validation
                  // Wait 30s before moving to next step
                  this.startGenericCountdown(30, () => {
                    this.nextStep();
                  });
                }
              });
            }
            // Remove PanciKacang after pouring
            if (this.panciKacang) {
              this.panciKacang.destroy();
              this.panciKacang = null;
            }
          }, this.panciMasak);
        } else {
          // Invalid drop - return to original position
          console.log('PanciKacang dropped incorrectly - returning to staging area');
          this.returnPanciKacangToOriginalPosition();
        }
      }
      // STEP 7: Sub-step 1 - place PanciSaring on Kompor
      else if (dropZone === this.komporZone && this.currentStep === 6 && this.currentSubStep === 1 && droppedKey === 'PanciSaring' && !this.panciKukus) {
        this.executeSuccessfulDrop(gameObject, () => {
          this.panciKukus = this.add.image(dropZone.x - 25, dropZone.y - 60, 'PanciSaring').setScale(this.layoutConfig.potScale).setInteractive();
          this.input.setDraggable(this.panciKukus);
          this.statePanciKukus = 'empty';
          this.nextSubStep(); // Move to sub-step 2 (WajanNasiLapola drop to PanciSaring)
        });
      }
      // STEP 7: Sub-step 0 - Move WajanNasiLapola from Kompor to StagingArea
      else if (dropZone === this.stagingZone && this.currentStep === 6 && this.currentSubStep === 0 && this.panciMasak && this.panciMasak.texture.key === 'WajanNasiLapola') {
        console.log('WajanNasiLapola moved from Kompor to StagingArea');
        // Move WajanNasiLapola to staging area and create separate reference
        this.executeSuccessfulMove(this.panciMasak, dropZone.x, dropZone.y - 10);
        // Create WajanNasiLapola reference for step 7
        this.wajanNasiLapola = this.add.image(dropZone.x, dropZone.y - 10, 'WajanNasiLapola').setScale(0.51).setInteractive().setName('WajanNasiLapola'); // Match size with NasiAduk
        this.input.setDraggable(this.wajanNasiLapola);
        // Save original position for return mechanism
        this.wajanNasiLapolaOriginalX = dropZone.x;
        this.wajanNasiLapolaOriginalY = dropZone.y - 10;
        console.log('WajanNasiLapola created in staging area at:', dropZone.x, dropZone.y - 10);
        // Remove the old cooking pot
        if (this.panciMasak) {
          this.panciMasak.destroy();
          this.panciMasak = null;
        }
        this.nextSubStep(); // Move to sub-step 1 (PanciSaring)
      }
      // STEP 7: Sub-step 2 - Drop WajanNasiLapola to PanciSaring for steaming
      else if (this.currentStep === 6 && this.currentSubStep === 2 && gameObject === this.wajanNasiLapola && this.panciKukus && Phaser.Geom.Rectangle.Contains(this.panciKukus.getBounds(), pointer.x, pointer.y)) {
        // WajanNasiLapola dropped on PanciSaring - start steaming
        console.log('WajanNasiLapola dropped on PanciSaring - starting steaming');
        this.executeSuccessfulDrop(gameObject, () => {
          if (this.panciKukus) {
            this.panciKukus.setTexture('KukusNasiLapola');
            // 40s countdown
            this.startGenericCountdown(40, () => {
              if (this.panciKukus) {
                this.panciKukus.setTexture('KukusNasi');
                this.panciKukus.setName('KukusNasi'); // Set name for drag validation
              }
              this.nextStep();
            });
          }
          // Remove WajanNasiLapola after successful drop
          if (this.wajanNasiLapola) {
            this.wajanNasiLapola.destroy();
            this.wajanNasiLapola = null;
          }
        });
      }
      // Handle invalid WajanNasiLapola drop - return to staging area
      else if (this.currentStep === 6 && gameObject === this.wajanNasiLapola) {
        if (this.currentSubStep !== 2) {
          console.log(`WajanNasiLapola dropped at wrong time (substep ${this.currentSubStep}) - should be substep 2`);
        } else {
          console.log('WajanNasiLapola dropped incorrectly - returning to staging area');
        }
        this.returnWajanNasiLapolaToOriginalPosition();
      }
      // Handle invalid drop of WajanNasiLapola from Kompor at wrong substep
      else if (this.currentStep === 6 && this.currentSubStep !== 0 && this.panciMasak && this.panciMasak.texture.key === 'WajanNasiLapola') {
        console.log(`WajanNasiLapola from Kompor dropped at wrong time (substep ${this.currentSubStep}) - should be substep 0`);
        this.executeInvalidDrop(gameObject);
      }
      // STEP 8: First part - drag Piring to StagingArea
      else if (this.currentStep === 7 && droppedKey === 'Piring' && dropZone === this.stagingZone) {
        // Don't use executeSuccessfulDrop as we want to keep the Piring visible
        // Position Piring in staging area
        gameObject.x = this.stagingZone.x;
        gameObject.y = this.stagingZone.y;
        // Store reference to Piring in staging area
        this.piringInStaging = gameObject;
        console.log('Piring placed in staging area');
        this.showSuccessFeedback();
        this.nextSubStep(); // Advance to expect KukusNasi
      }
      // STEP 8: Second part - drag KukusNasi from Kompor to Piring in StagingArea
      else if (this.currentStep === 7 && gameObject === this.panciKukus && this.panciKukus &&
               this.panciKukus.texture.key === 'KukusNasi' && this.piringInStaging) {
        if (this.piringInStaging && Phaser.Geom.Rectangle.Contains(this.piringInStaging.getBounds(), pointer.x, pointer.y)) {
          this.executeSuccessfulDrop(gameObject, () => {
            // Remove stove visual
            if (this.kompor) this.kompor.setVisible(false);
            // Change everything to NasiLapola
            if (this.piringInStaging) {
              this.piringInStaging.setTexture('NasiLapola');
              this.piringInStaging.setScale(0.3);
            }
            // Remove the dragged KukusNasi
            if (this.panciKukus) {
              this.panciKukus.setVisible(false);
            }
            this.statePanciKukus = 'plated';
            this.nextStep();
            this.showCompletionCelebration();
          });
        } else {
          this.executeInvalidDrop(gameObject);
        }
      }
      else {
        // Debug logging for KukusKelapa drops
        if (gameObject === this.panciSaringStep4 && this.statePanciSaringStep4 === 'kelapa_matang') {
          console.log('KukusKelapa drop debug:', {
            dropZone: dropZone?.name,
            isStagingZone: dropZone === this.stagingZone,
            currentStep: this.currentStep,
            currentSubStep: this.currentSubStep,
            panciSaringStep4: !!this.panciSaringStep4,
            statePanciSaringStep4: this.statePanciSaringStep4,
            gameObjectName: gameObject.name
          });
        }

        // Comprehensive catch-all for invalid drops
        console.log(`Invalid drop detected: ${gameObject.name} in step ${this.currentStep}, sub-step ${this.currentSubStep}`);

        // Show screen shake and return all items to original position
        this.cameras.main.shake(200, 0.01);

        // Handle special objects with specific return functions
        if (gameObject === this.panciKacang) {
          // Check if it's the right time to drag PanciKacang
          if (this.currentStep !== 5) {
            console.log('PanciKacang dragged at wrong time - returning to staging area');
            this.returnPanciKacangToOriginalPosition();
          } else {
            this.returnPanciKacangToOriginalPosition();
          }
        } else if (gameObject === this.panciKukus) {
          // Check if it's the right time to drag PanciKukus
          if (this.currentStep !== 5) {
            console.log('PanciKukus dragged at wrong time - returning to staging area');
            this.returnToOriginalPosition(gameObject);
          } else {
            this.returnToOriginalPosition(gameObject);
          }
        } else if (gameObject === this.panciSaringStep4) {
          // Handle KukusKelapa (panciSaringStep4) returns
          console.log('KukusKelapa (panciSaringStep4) returning to kompor position');
          this.returnToOriginalPosition(gameObject);
        } else if (gameObject === this.wajanNasiLapola) {
          this.returnWajanNasiLapolaToOriginalPosition();
        } else {
          // For all other items, use return to original position
          this.returnToOriginalPosition(gameObject);
        }
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
    let targetX = anchor ? anchor.x - 20 : this.cameras.main.centerX;
    let targetY = anchor ? anchor.y - 120 : this.cameras.main.centerY;

    if (frames[0] && frames[0].includes('MasukkanKacang')) {
      targetX += 85; // Move right 10px
      targetY -= 50; // Move up 20px
    }
    if (frames[0] && frames[0].includes('KelapaMasuk')) {
      targetX += 85; // Move right 10px
      targetY -= 50; // Move up 20px
    }
    if (frames[0] && frames[0].includes('TuangKacang')) {
      targetX += 35; // Move right 5px more (from +30 to +35)
      targetY -= -7; // Move down 2px more (from -5 to -7)
    }
    if (frames[0] && frames[0].includes('MasukkanBeras')) {
      targetX += 20; // Move right 10px more (from +10 to +20)
    }
    if (frames[0] && frames[0].includes('TuangGaram')) {
      targetX += 25; // Move right 10px more (from +10 to +20)
      targetY -= -58; // Move down 3px more (changed from -55 to -58)
    }
    if (frames[0] && frames[0].includes('TuangAir')) {
      targetX += 85; // Move right 10px
      targetY -= 50; // Move up 20px
    }
    if (frames[0] && frames[0].includes('TuangKelapa')) {
      targetX += 55; // Move right 5px more (from +50 to +55)
      targetY -= -7; // Move down 2px more (from -5 to -7)
    }
    // Scale pour frames 1.5x
    // Determine scale based on animation type
    let animationScale = 0.375; // Default scale
    if (frames[0] && frames[0].includes('MasukkanBeras')) {
      animationScale = 0.45; // +15px for MasukkanBeras animations
    }
    if (frames[0] && frames[0].includes('TuangGaram')) {
      animationScale = 0.48; // Updated size for TuangGaram animations
    }
    if (frames[0] && frames[0].includes('TuangKelapa')) {
      animationScale = 0.52; // +20px for TuangKelapa animations (0.375 + 0.145 ≈ 0.52)
    }
    if (frames[0] && frames[0].includes('TuangAir')) {
      animationScale = 0.62; // +40px for TuangAir animations (0.375 + 0.245 ≈ 0.62)
    }
    if (frames[0] && frames[0].includes('MasukkanKacang')) {
      animationScale = 0.49; // +20px for MasukkanKacang animations (0.375 + 0.115 ≈ 0.49)
    }
    if (frames[0] && frames[0].includes('TuangKacang')) {
      animationScale = 0.52; // Match size with TuangKelapa animations
    }
    const temp = this.add.image(targetX, targetY, frames[0]).setScale(animationScale);

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

  private createStoveButton() {
    // Create Image-based button like menu toggle button for better mobile compatibility
    const buttonX = this.kompor.x + 120;
    const buttonY = this.kompor.y + 60;

    // Create button container for better organization
    const buttonContainer = this.add.container(buttonX, buttonY).setDepth(1000);

    // Create button background using Graphics (as a fallback if images aren't available)
    this.stoveButton = this.add.graphics();
    this.stoveButton.fillStyle(this.isStoveOn ? 0x00aa00 : 0x666666);
    this.stoveButton.fillRoundedRect(-60, -30, 120, 60, 8);
    this.stoveButton.lineStyle(3, 0x333333);
    this.stoveButton.strokeRoundedRect(-60, -30, 120, 60, 8);
    this.stoveButton.setInteractive(new Phaser.Geom.Rectangle(-60, -30, 120, 60), Phaser.Geom.Rectangle.Contains);

    buttonContainer.add(this.stoveButton);

    // Create button text
    this.stoveButtonText = this.add.text(0, 0, this.isStoveOn ? 'OFF' : 'ON', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    buttonContainer.add(this.stoveButtonText);

    // Simple click-only event handling (no hover effects)
    this.stoveButton.setInteractive();
    this.stoveButton.off('pointerover'); // Remove old listeners
    this.stoveButton.off('pointerout');
    this.stoveButton.off('pointerdown');
    this.stoveButton.off('pointerup');

    // Main action on pointerdown - simple click without hover
    this.stoveButton.on('pointerdown', () => {
      console.log('=== STOVE BUTTON CLICKED ===');
      console.log('Current stove state:', this.isStoveOn);

      // Toggle stove immediately
      this.toggleStove();
      this.updateButtonAppearance();

      console.log('New stove state:', this.isStoveOn);
    });
  }

  private updateButtonAppearance() {
    if (this.stoveButton && this.stoveButtonText) {
      // Update button graphics
      this.stoveButton.clear();
      this.stoveButton.fillStyle(this.isStoveOn ? 0x00aa00 : 0x666666);
      this.stoveButton.fillRoundedRect(-60, -30, 120, 60, 8);
      this.stoveButton.lineStyle(3, 0x333333);
      this.stoveButton.strokeRoundedRect(-60, -30, 120, 60, 8);

      // Update button text
      if (this.isStoveOn) {
        this.stoveButtonText.setText('OFF');
      } else {
        this.stoveButtonText.setText('ON');
      }
    }
  }

  private toggleStove() {
    console.log('toggleStove called, current state:', this.isStoveOn);
    console.log('Kompor object exists:', !!this.kompor);

    if (!this.isStoveOn) {
      this.isStoveOn = true;
      console.log('Turning stove ON');
      // Loop through KomporNyala frames
      const frames = ["KomporNyala1","KomporNyala2","KomporNyala3","KomporNyala4","KomporNyala5","KomporNyala6"];
      let i = 0;
      this.stoveAnimTimer?.destroy();
      this.stoveAnimTimer = this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          if (this.kompor) {
            console.log('Setting texture to:', frames[i % frames.length]);
            try {
              this.kompor.setTexture(frames[i % frames.length]);
            } catch (error) {
              console.error('Error setting texture:', error);
            }
          } else {
            console.error('Kompor object is null/undefined');
          }
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
            // Store current position as drag start for return mechanism
            this.panciMasak.setData('dragStartX', this.panciMasak.x);
            this.panciMasak.setData('dragStartY', this.panciMasak.y);
          }
        });
      }
      // If step 4 and kelapa baru masuk panci saring baru, start 30s countdown for steaming coconut
      if (this.currentStep === 3 && this.panciSaringStep4 && this.statePanciSaringStep4 === 'kelapa_mentah') {
        this.startCookCountdown(30, () => {
          if (this.panciSaringStep4) {
            this.statePanciSaringStep4 = 'kelapa_matang';
            // Ensure pot is draggable again after cook
            this.panciSaringStep4.setInteractive();
            this.input.setDraggable(this.panciSaringStep4);
            // Store current position as drag start for return mechanism
            this.panciSaringStep4.setData('dragStartX', this.panciSaringStep4.x);
            this.panciSaringStep4.setData('dragStartY', this.panciSaringStep4.y);
          }
        });
      }
    } else {
      // Turn off
      console.log('Turning stove OFF');
      this.isStoveOn = false;
      this.stoveAnimTimer?.destroy();
      this.stoveAnimTimer = null;
      if (this.kompor) {
        this.kompor.setTexture('Kompor');
      }
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
          this.baskomObj = this.add.image(x, y, 'BaskomKelapa')
            .setScale(0.39)
            .setInteractive({ draggable: true })
            .setName('BaskomKelapa')
            .setData('originalScale', 0.39)
            .setData('ingredientType', 'BaskomKelapa');
          this.input.setDraggable(this.baskomObj);
          this.nextSubStep(); // This will call nextStep() since it's the last sub-step
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
        this.panciMasak.setScale(0.38); // Match size with PanciAir2 (was this.layoutConfig.potScale = 0.45)
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
      // Special scaling for AdukKacang animations
      if (frames[0] && frames[0].includes('AdukKacang')) {
        target.setScale(0.67); // Reduced size by 5px for AdukKacang animations
      }
      count++;
      if (count >= times) {
        this.input.off('pointerdown', onPointerDown);
        onDone();
      }
    };
    // Lock pot position while stirring
    const fixedX = target.x;
    let fixedY = target.y;
    // Special positioning for PanciAirSepatula stirring animations
    if (frames[0] && frames[0].includes('PanciAirSepatula')) {
      fixedY = target.y - 10; // Move up 10px for AdukNasi stirring animations
    }
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

  private returnPanciKacangToOriginalPosition() {
    if (this.panciKacang) {
      console.log('Returning PanciKacang to original position:', this.panciKacangOriginalX, this.panciKacangOriginalY);

      // Camera shake effect
      this.cameras.main.shake(150, 0.008);

      // Show error indicator
      const errorText = this.add.text(this.panciKacang.x, this.panciKacang.y - 50, "❌", {
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

      // Return PanciKacang to original position
      this.tweens.add({
        targets: this.panciKacang,
        x: this.panciKacangOriginalX,
        y: this.panciKacangOriginalY,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          console.log('PanciKacang returned to:', this.panciKacang?.x, this.panciKacang?.y);
        }
      });
    }
  }

  private returnWajanNasiLapolaToOriginalPosition() {
    if (this.wajanNasiLapola) {
      console.log('Returning WajanNasiLapola to original position:', this.wajanNasiLapolaOriginalX, this.wajanNasiLapolaOriginalY);

      // Camera shake effect
      this.cameras.main.shake(150, 0.008);

      // Show error indicator
      const errorText = this.add.text(this.wajanNasiLapola.x, this.wajanNasiLapola.y - 50, "❌", {
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

      // Return WajanNasiLapola to original position
      this.tweens.add({
        targets: this.wajanNasiLapola,
        x: this.wajanNasiLapolaOriginalX,
        y: this.wajanNasiLapolaOriginalY,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          console.log('WajanNasiLapola returned to:', this.wajanNasiLapola?.x, this.wajanNasiLapola?.y);
        }
      });
    }
  }

  private executeInvalidDrop(gameObject: Phaser.GameObjects.Image) {
    console.log('executeInvalidDrop called for:', gameObject.name, {
      currentPos: { x: gameObject.x, y: gameObject.y },
      dragStartPos: {
        x: gameObject.input?.dragStartX,
        y: gameObject.input?.dragStartY
      },
      isPanciKacang: gameObject === this.panciKacang
    });

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

  private returnItemToOriginPosition(gameObject: Phaser.GameObjects.Image): void {
    if (this.itemBeingReturned) {
      return;
    }

    this.itemBeingReturned = true;

    if (this.draggedItemOriginalParent) {
      this.draggedItemOriginalParent.add(gameObject);

      this.tweens.add({
        targets: gameObject,
        x: this.draggedItemOriginalX,
        y: this.draggedItemOriginalY,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          gameObject.setInteractive();

          // Re-enable mask when returning to container
          if (this.ingredientsContentContainer && this.ingredientsContentMask) {
            this.ingredientsContentContainer.setMask(this.ingredientsContentMask);
          }

          // Reset the return flag
          this.itemBeingReturned = false;
        }
      });
    } else {
      // Fallback: Create new item in ingredients panel if original parent is lost
      console.warn(`Item ${gameObject.name} lost original parent, recreating in ingredients panel`);

      // Find the item in the ingredients list to get its configuration
      const ingredientConfig = this.findIngredientConfig(gameObject.name);
      if (ingredientConfig) {
        // Destroy the lost item
        gameObject.destroy();

        // Recreate the item in ingredients panel
        this.recreateItemInPanel(ingredientConfig);
      } else {
        // Last resort: just add to ingredients container at a safe position
        this.ingredientsContentContainer.add(gameObject);
        gameObject.setPosition(50, 50); // Safe fallback position
        gameObject.setInteractive();
      }

      // Reset the return flag in fallback case
      this.itemBeingReturned = false;
    }
  }

  // NOTE: Hint system removed - now handled by React components in KitchenBackgroundWrapper

  private handleScroll(deltaY: number) {
    const scrollSpeed = 1; // Reduced from 10 to 1 for slower scrolling like in IkanKuahKuningScene
    let newY = this.ingredientsContentContainer.y - deltaY * scrollSpeed;

    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 60 - 12; // Restored to original calculation
    const maxScroll = Math.max(0, this.scrollContentHeight - scrollableAreaHeight);

    newY = Math.max(-maxScroll, newY);
    newY = Math.min(0, newY);

    this.ingredientsContentContainer.y = newY;
    this.updateScrollbar();
  }

  private setupSwipeScrolling(scrollableAreaX: number, scrollableAreaY: number, scrollableAreaWidth: number, scrollableAreaHeight: number) {
    // Simple swipe scroll setup that doesn't interfere with dragging
    const panelBounds = new Phaser.Geom.Rectangle(
      this.ingredientsPanel.x + scrollableAreaX,
      this.ingredientsPanel.y + scrollableAreaY,
      scrollableAreaWidth,
      scrollableAreaHeight
    );

    // Only enable swipe scrolling when touching empty areas (not on items)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!Phaser.Geom.Rectangle.Contains(panelBounds, pointer.x, pointer.y)) {
        return;
      }

      // Check if we clicked directly on an ingredient item
      const gameObjectsUnderPointer = this.input.hitTestPointer(pointer);
      const clickedIngredient = gameObjectsUnderPointer.find((obj: any) =>
        this.ingredientItems.includes(obj)
      );

      // Only start swipe if we didn't click on an ingredient
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

    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 60 - 12; // Restored to original calculation
    const scrollbarWidth = 12;
    const scrollbarX = this.layoutConfig.ingredientsPanelWidth - scrollbarWidth - 12; // Position to the right with proper padding
    const scrollbarYOffset = 60; // Restored to original position

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
      "Panci": 0.12 * 1.5,
      "water": 0.15 * 1.5,
      "Kacang": 0.2 * 1.5,
      "Beras": 0.2 * 1.5,
      "Garam": 0.2 * 1.5,
      "Kelapa": 0.2 * 1.5,
      "Parut": 0.15 * 1.5,
      "Baskom": 0.15 * 1.5,
      "PanciSaring": 0.14 * 1.5,
      "PanciAir2": 0.12 * 1.5,
      "Piring": 0.15 * 1.5
    };
    return scaleMap[itemName] || (0.15 * 1.5);
  }

  private findIngredientConfig(itemName: string) {
    const ingredients = [
      { key: "Panci", name: "Panci", scale: 0.12 },
      { key: "water", name: "Air", scale: 0.15 },
      { key: "Kacang", name: "Kacang", scale: 0.2 },
      { key: "Beras", name: "Beras", scale: 0.2 },
      { key: "Garam", name: "Garam", scale: 0.2 },
      { key: "Gula", name: "Gula", scale: 0.2 },
      { key: "Kelapa", name: "Kelapa", scale: 0.2 },
      { key: "Parut", name: "Parut", scale: 0.15 },
      { key: "Baskom", name: "Baskom", scale: 0.15 },
      { key: "Saring", name: "Saring", scale: 0.15 },
      { key: "KukusKelapa", name: "Kukus Kelapa", scale: 0.15 },
      { key: "PanciSaring", name: "Panci Saring", scale: 0.14 },
      { key: "PanciAir2", name: "Panci Air 2", scale: 0.12 },
      { key: "Piring", name: "Piring", scale: 0.15 }
    ];

    return ingredients.find(ingredient => ingredient.key === itemName);
  }

  private recreateItemInPanel(ingredientConfig: { key: string, name: string, scale: number }): void {
    // Use the same layout parameters as main ingredient creation
    const panelWidth = this.layoutConfig.ingredientsPanelWidth;
    const itemWidth = 160; // Same as main layout
    const itemHeight = 110; // Same as main layout
    const horizontalGap = 20;
    const totalContentWidth = (itemWidth * 2) + horizontalGap;
    const leftMargin = 30; // Same left margin as main layout
    const startX = leftMargin + (itemWidth / 2); // Same left-shifted position
    const startY = 120; // Place dynamic items at top

    // For simplicity, place at first position - could be improved to find actual empty spot
    const x = startX;
    const y = startY;

    // Create background for item - Same larger size as main layout
    const itemBg = this.add.graphics();
    itemBg.fillStyle(0x000000, 0.25);
    itemBg.fillRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
    itemBg.lineStyle(1, 0x8B4513, 0.4);
    itemBg.strokeRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
    this.ingredientsContentContainer.add(itemBg);

    // Create new item with same scale as main layout
    const item = this.add.image(x, y, ingredientConfig.key)
      .setInteractive() // Simple interactive setup
      .setScale(ingredientConfig.scale * 1.5) // Same scale as main layout
      .setName(ingredientConfig.key)
      .setData('originalScale', ingredientConfig.scale * 1.5)
      .setData('ingredientType', ingredientConfig.key);

    this.ingredientItems.push(item);
    this.input.setDraggable(item); // Simple draggable setup like other scenes
    this.ingredientsContentContainer.add(item);

    // Create label with same larger font as main layout
    const label = this.add.text(x, y + 50, ingredientConfig.name, {
      fontSize: '18px', // Same larger font size as main layout
      fontFamily: 'Chewy, cursive',
      color: '#FFE4B5',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.ingredientsContentContainer.add(label);

    // Add hover effects (disabled like in IkanKuahKuningScene)
    item.on('pointerover', () => {
      // No hover effects like in IkanKuahKuningScene
    });

    item.on('pointerout', () => {
      // Always reset to normal state with new larger scale
      item.setScale(ingredientConfig.scale * 1.5);
      label.setColor('#FFE4B5');
      itemBg.clear();
      itemBg.fillStyle(0x000000, 0.25);
      itemBg.fillRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
      itemBg.lineStyle(1, 0x8B4513, 0.4);
      itemBg.strokeRoundedRect(x - (itemWidth/2), y - (itemHeight/2), itemWidth, itemHeight, 12);
    });

    // Drag events are now handled by the global input system like in other scenes
  }
}