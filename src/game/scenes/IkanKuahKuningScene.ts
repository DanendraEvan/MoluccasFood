// src/game/scenes/IkanKuahKuningScene.ts - Enhanced with NasiLapola UI System
import * as Phaser from "phaser";

// State untuk panci dan ulekan
type CookingState = 
  | "start"
  | "cobek_placed"
  | "ulekan_step_1"
  | "ulekan_step_2"
  | "ulekan_step_3"
  | "ulekan_step_4"
  | "bumbu_halus_done"
  | "wajan_placed"
  | "bumbu_tuang"
  | "mengaduk_bumbu"
  | "bumbu_matang"
  | "daun_salam_added"
  | "sereh_added"
  | "lengkuas_added"
  | "mengaduk_aromatics"
  | "aromatics_done"
  | "jahe_added"
  | "daun_jeruk_added"
  | "ikan_added"
  | "air_added"
  | "mengaduk_air"
  | "mendidih"
  | "tomat_added"
  | "garam_added"
  | "gula_added"
  | "daun_bawang_added"
  | "asam_added"
  | "mengaduk_finishing"
  | "matang"
  | "mangkuk_placed"
  | "finished";

interface GameStep {
  id: number;
  text: string;
  character: string;
  isCompleted: boolean;
}

export default class IkanKuahKuningScene extends Phaser.Scene {
  // Game objects
  private kompor!: Phaser.GameObjects.Image;
  private komporZone!: Phaser.GameObjects.Zone;
  private cookingState: CookingState = "start";
  private cobek!: Phaser.GameObjects.Image;

  // Mengulek state
  private isMengulek: boolean = false;
  private swipeCount: number = 0;
  private lastSwipeDirection: 'left' | 'right' | null = null;
  private pointerStartX: number = 0;
  private mengulekPhase: 1 | 2 = 1; // Phase 1: Mengulek1/2, Phase 2: Mengulek4/5

  // Wajan state
  private wajan!: Phaser.GameObjects.Image;
  private isMengaduk: boolean = false;
  private countdownText!: Phaser.GameObjects.Text;
  private mangkuk!: Phaser.GameObjects.Image;
  private isDragging: boolean = false;

  // Stove and timing state
  private isStoveOn: boolean = false;
  private stoveAnimTimer: Phaser.Time.TimerEvent | null = null;
  private stoveButton: Phaser.GameObjects.Rectangle | null = null;
  private stoveButtonText: Phaser.GameObjects.Text | null = null;
  private cookCountdownTimer: Phaser.Time.TimerEvent | null = null;
  private cookCountdownText: Phaser.GameObjects.Text | null = null;

  // Order validation system
  private ingredientOrder: { [state: string]: string[] } = {
    'start': ['Cobek'],
    'cobek_placed': ['BawangMerah'],
    'ulekan_step_1': ['CabaiKeriting'],
    'ulekan_step_2': ['Kunyit'],
    'ulekan_step_3': ['BawangPutih'],
    'ulekan_step_4': ['Ulekan'],
    'bumbu_halus_done': ['Wajan'],
    'wajan_placed': ['BumbuHalus'],
    'bumbu_matang': ['DaunSalam'],
    'daun_salam_added': ['Sereh'],
    'sereh_added': ['Lengkuas'],
    'aromatics_done': ['IrisanJahe'],
    'jahe_added': ['DaunJeruk'],
    'daun_jeruk_added': ['PotonganIkan'],
    'ikan_added': ['Air'],
    'mendidih': ['Tomat'],
    'tomat_added': ['Garam'],
    'garam_added': ['Gula'],
    'gula_added': ['DaunBawang'],
    'daun_bawang_added': ['Asam'],
    'matang': ['Mangkuk'],
    'mangkuk_placed': ['IkanKuahKuningJadi']
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
  private itemBeingReturned: boolean = false;
  private ingredientsContentMask: Phaser.Display.Masks.GeometryMask | null = null;
  private scrollbarThumb!: Phaser.GameObjects.Graphics;
  private isScrollbarDragging: boolean = false;
  private scrollbarDragStartY: number = 0;
  private contentStartY: number = 0;
  private hintPopup!: Phaser.GameObjects.Container;
  private infoContent: string = `Ikan Kuah Kuning adalah hidangan berkuah khas Maluku yang memiliki cita rasa gurih, segar, dan kaya rempah. Sesuai namanya, kuah dari hidangan ini berwarna kuning cerah yang berasal dari penggunaan kunyit sebagai bumbu utama. Ikan yang digunakan biasanya adalah ikan laut segar seperti ikan cakalang, tongkol, atau ikan kerapu yang dipotong-potong. Bumbu kuah kuning terdiri dari kunyit, jahe, lengkuas, serai, daun jeruk, cabai, bawang merah, bawang putih, dan santan kelapa. Semua bumbu ditumis hingga harum kemudian ditambah air dan santan hingga mendidih. Ikan kemudian dimasukkan dan dimasak hingga matang sambil menyerap cita rasa kuah yang kaya rempah. Hidangan ini biasanya disajikan dengan nasi putih atau papeda, dan memberikan sensasi hangat serta menyegarkan dengan aroma rempah yang khas.`;

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
    cookingAreaRight: 1480, // Expanded cooking area
    cookingAreaBottom: 180,
    
    // Dialog panel
    dialogPanelHeight: 90,
    dialogPanelY: 900, // Will be calculated
    dialogPanelLeft: 50,
    dialogPanelRight: 20,

    // Character
    characterX: 1000,
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
      text: "Selamat Datang di Game Traditional of Moluccas Food, sudah siap untuk Memasak Ikan Kuah Kuning hari ini!?! Okee!! Pertama ambil Cobek dari Menu dan taruh ke sebelah kanan Kompor. Lanjut kita masukkan Bawang Merah, Cabai Keriting, Kunyit dan, Bawang Putih.",
      character: "karakter1.png",
      isCompleted: false
    },
    {
      id: 2,
      text: "Bumbu sudah masuk mari kita haluskan bumbunya!! Ambil Ulekan di Menu dan taruh ke dalam Cobek. Sudah? Ayo kita haluskan bumbunya dengan menggerakkan Ulekan ke kanan dan kiri sampai jadi.",
      character: "karakter2.png",
      isCompleted: false
    },
    {
      id: 3,
      text: "Step ke 3 ayo kita ambil wajan di Menu dan taruh ke atas Kompor. Sudah? Masukkan Bumbu Halus ke Wajan dan Aduk sampai harum.",
      character: "karakter3.png",
      isCompleted: false
    },
    {
      id: 4,
      text: "Oke sudah Diaduk?!? Ayo Kita masukkan Daun Salam, Sereh, dan Lengkuas ke dalam Wajan. Ayo Kita aduk lagi Bumbunya.",
      character: "karakter4.png",
      isCompleted: false
    },
    {
      id: 5,
      text: "Lanjut lagi. Ayo kita masukkan Irisan jahe, Daun Jeruk, Potongan Ikan, dan Air kedalam bumbu yang kita masak tadi. Kemudian aduk lagi sampai semua nya bercampur rata dan Air mendidih.",
      character: "karakter5.png",
      isCompleted: false
    },
    {
      id: 6,
      text: "Setelah mendidih masukkan Tomat, Garam, Gula, Daun Bawang, dan Asam Jawa, Kemudian aduk dan tunggu Ikan Kuah Kuning sampai Matang.",
      character: "karakter6.png",
      isCompleted: false
    },
    {
      id: 7,
      text: "Yeayy!!! Kita telah menyelesaikan Masakan Ikan Kuah Kuning. Ambil Mangkuk di Menu dan taruh di Meja. Ambil Masakan Ikan Kuah Kuning yang sudah matang dari Wajan dan sajikan ke Mangkuk yang ada di Meja.",
      character: "karakter1.png",
      isCompleted: false
    }
  ];

  constructor() {
    super("IkanKuahKuningScene");
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/kitchen.png");
    this.load.image("Kompor", "/assets/foods/ikan_kuahkuning/Kompor.png");

    // --- Ingredient Panel Assets ---
    this.load.image('Cobek', '/assets/foods/ikan_kuahkuning/Cobek.png');
    this.load.image('BawangMerah', '/assets/foods/ikan_kuahkuning/BawangMerah.png');
    this.load.image('CabaiKeriting', '/assets/foods/ikan_kuahkuning/CabaiKeriting.png');
    this.load.image('Kunyit', '/assets/foods/ikan_kuahkuning/Kunyit.png');
    this.load.image('BawangPutih', '/assets/foods/ikan_kuahkuning/BawangPutih.png');
    this.load.image('Ulekan', '/assets/foods/ikan_kuahkuning/Ulekan.png');
    this.load.image('Wajan', '/assets/foods/ikan_kuahkuning/Wajan.png');
    this.load.image('Sereh', '/assets/foods/ikan_kuahkuning/Sereh.png');
    this.load.image('Lengkuas', '/assets/foods/ikan_kuahkuning/Lengkuas.png');
    this.load.image('DaunSalam', '/assets/foods/ikan_kuahkuning/DaunSalam.png');
    this.load.image('IrisanJahe', '/assets/foods/ikan_kuahkuning/IrisanJahe.png');
    this.load.image('DaunJeruk', '/assets/foods/ikan_kuahkuning/DaunJeruk.png');
    this.load.image('PotonganIkan', '/assets/foods/ikan_kuahkuning/PotonganIkan.png');
    this.load.image('Air', '/assets/foods/ikan_kuahkuning/Air.png');
    this.load.image('Asam', '/assets/foods/ikan_kuahkuning/Asam.png');
    this.load.image('Tomat', '/assets/foods/ikan_kuahkuning/Tomat.png');
    this.load.image('Gula', '/assets/foods/ikan_kuahkuning/Gula.png');
    this.load.image('Garam', '/assets/foods/ikan_kuahkuning/Garam.png');
    this.load.image('DaunBawang', '/assets/foods/ikan_kuahkuning/DaunBawang.png');
    this.load.image('Mangkuk', '/assets/foods/ikan_kuahkuning/Mangkuk.png');

    // Kompor nyala frames
    this.load.image("KomporNyala1", "/assets/foods/ikan_kuahkuning/KomporNyala1.png");
    this.load.image("KomporNyala2", "/assets/foods/ikan_kuahkuning/KomporNyala2.png");
    this.load.image("KomporNyala3", "/assets/foods/ikan_kuahkuning/KomporNyala3.png");
    this.load.image("KomporNyala4", "/assets/foods/ikan_kuahkuning/KomporNyala4.png");
    this.load.image("KomporNyala5", "/assets/foods/ikan_kuahkuning/KomporNyala5.png");
    this.load.image("KomporNyala6", "/assets/foods/ikan_kuahkuning/KomporNyala6.png");
    // --- Game Step Assets ---
    // Ulekan states
    this.load.image('Ulekan1', '/assets/foods/ikan_kuahkuning/Ulekan1.png');
    this.load.image('Ulekan2', '/assets/foods/ikan_kuahkuning/Ulekan2.png');
    this.load.image('Ulekan3', '/assets/foods/ikan_kuahkuning/Ulekan3.png');
    this.load.image('Ulekan4', '/assets/foods/ikan_kuahkuning/Ulekan4.png');

    // Mengulek animation frames
    this.load.image('Mengulek1', '/assets/foods/ikan_kuahkuning/Mengulek1.png');
    this.load.image('Mengulek2', '/assets/foods/ikan_kuahkuning/Mengulek2.png');
    this.load.image('Mengulek4', '/assets/foods/ikan_kuahkuning/Mengulek4.png');
    this.load.image('Mengulek5', '/assets/foods/ikan_kuahkuning/Mengulek5.png');
    this.load.image('BumbuHalus', '/assets/foods/ikan_kuahkuning/BumbuHalus.png');


    // Tuang Bumbu animation
    this.load.image('TuangBumbu1', '/assets/foods/ikan_kuahkuning/TuangBumbu1.png');
    this.load.image('TuangBumbu2', '/assets/foods/ikan_kuahkuning/TuangBumbu2.png');

    // Aduk Bumbu animation
    this.load.image('AdukBumbu1', '/assets/foods/ikan_kuahkuning/AdukBumbu1.png');
    this.load.image('AdukBumbu2', '/assets/foods/ikan_kuahkuning/AdukBumbu2.png');
    this.load.image('BumbuHalusWajan', '/assets/foods/ikan_kuahkuning/BumbuHalusWajan.png');

    // Step 4 states
    this.load.image('TambahDaunSalam', '/assets/foods/ikan_kuahkuning/TambahDaunSalam.png');
    this.load.image('TambahSereh', '/assets/foods/ikan_kuahkuning/TambahSereh.png');
    this.load.image('TambahLengkuas', '/assets/foods/ikan_kuahkuning/TambahLengkuas.png');
    this.load.image('AdukBumbuStep4-1', '/assets/foods/ikan_kuahkuning/AdukBumbuStep4-1.png');
    this.load.image('AdukBumbuStep4-2', '/assets/foods/ikan_kuahkuning/AdukBumbuStep4-2.png');
    this.load.image('BumbuStep4-2', '/assets/foods/ikan_kuahkuning/BumbuStep4-2.png');

    // Step 5 states
    this.load.image('TambahJahe', '/assets/foods/ikan_kuahkuning/TambahJahe.png');
    this.load.image('TambahDaun', '/assets/foods/ikan_kuahkuning/TambahDaun.png');
    this.load.image('TambahIkan', '/assets/foods/ikan_kuahkuning/TambahIkan.png');
    this.load.image('TambahAir', '/assets/foods/ikan_kuahkuning/TambahAir.png');
    this.load.image('AdukAir1', '/assets/foods/ikan_kuahkuning/AdukAir1.png');
    this.load.image('AdukAir2', '/assets/foods/ikan_kuahkuning/AdukAir2.png');
    this.load.image('TambahAir2', '/assets/foods/ikan_kuahkuning/TambahAir2.png');

    // Step 6 states
    this.load.image('TambahTomat', '/assets/foods/ikan_kuahkuning/TambahTomat.png');
    this.load.image('TambahGaram', '/assets/foods/ikan_kuahkuning/TambahGaram.png');
    this.load.image('TambahGula', '/assets/foods/ikan_kuahkuning/TambahGula.png');
    this.load.image('TambahAsam', '/assets/foods/ikan_kuahkuning/TambahAsam.png');
    this.load.image('AdukFinishing1', '/assets/foods/ikan_kuahkuning/AdukFinishing1.png');
    this.load.image('AdukFinishing2', '/assets/foods/ikan_kuahkuning/AdukFinishing2.png');
    this.load.image('IkanKuahKuningJadi', '/assets/foods/ikan_kuahkuning/IkanKuahKuningJadi.png');

    // Final dish
    this.load.image('IkanKuahKuning', '/assets/foods/ikan_kuahkuning/IkanKuahKuning.png');

    // --- UI & Character Assets ---
    this.load.image('ikankuahkuning_food', '/assets/makanan/ikankuahkuning.png');
    this.load.image("menu_normal", "/assets/ui/buttons/menu/menu_normal.png");
    this.load.image("menu_hover", "/assets/ui/buttons/menu/menu_hover.png");
    this.load.image("menu_active", "/assets/ui/buttons/menu/menu_active.png");
    this.load.image("hint_normal", "/assets/ui/buttons/hint/hint_normal.png");
    this.load.image("hint_hover", "/assets/ui/buttons/hint/hint_hover.png");
    this.load.image("hint_active", "/assets/ui/buttons/hint/hint_active.png");
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
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Center stove in the cooking area
    const stoveX = (gameWidth - this.layoutConfig.ingredientsPanelWidth) / 2;
    const stoveY = gameHeight / 2 + 100;

    this.kompor = this.add.image(stoveX, stoveY, "Kompor").setScale(0.5).setInteractive();

    // Add click handler for kompor to create IkanKuahKuningJadi when ready
    this.kompor.on('pointerdown', () => {
      console.log('Kompor clicked! Current cooking state:', this.cookingState);
      if (this.cookingState === 'matang') {
        console.log('Creating IkanKuahKuningJadi from kompor');
        this.createDraggedItemFromKompor('IkanKuahKuningJadi');
      }
    });

    // Create a drop zone for the stove
    this.komporZone = this.add.zone(stoveX, stoveY, this.kompor.width * 0.5, this.kompor.height * 0.5)
        .setRectangleDropZone(this.kompor.width * 0.5, this.kompor.height * 0.5);
    this.komporZone.name = "komporZone";

    // Create Cobek drop zone to the right of kompor (80px distance as specified)
    const cobekZoneX = stoveX + (this.kompor.width * 0.5 / 2) + 80;
    const cobekZoneY = stoveY;
    const cobekZone = this.add.zone(cobekZoneX, cobekZoneY, 200, 200).setRectangleDropZone(200, 200);
    cobekZone.name = "cobekZone";

    // Create a larger cooking area zone for general dropping
    const cookingAreaZone = this.add.zone(
      (this.layoutConfig.cookingAreaLeft + this.layoutConfig.cookingAreaRight) / 2,
      (this.layoutConfig.cookingAreaTop + this.layoutConfig.cookingAreaBottom) / 2,
      this.layoutConfig.cookingAreaRight - this.layoutConfig.cookingAreaLeft,
      this.layoutConfig.cookingAreaBottom - this.layoutConfig.cookingAreaTop
    ).setRectangleDropZone(
      this.layoutConfig.cookingAreaRight - this.layoutConfig.cookingAreaLeft,
      this.layoutConfig.cookingAreaBottom - this.layoutConfig.cookingAreaTop
    );
    cookingAreaZone.name = "cookingAreaZone";

    // Create stove on/off button
    this.createStoveButton();
  }

  private createStoveButton() {
    // Create button background (rectangle)
    const buttonWidth = 80;
    const buttonHeight = 40;
    const buttonX = this.kompor.x + 120; // Position to the right of stove
    const buttonY = this.kompor.y + 60;  // Position below stove

    this.stoveButton = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x666666)
      .setStrokeStyle(2, 0x333333)
      .setInteractive();

    // Create button text
    this.stoveButtonText = this.add.text(buttonX, buttonY, 'ON', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Button click handler
    this.stoveButton.on('pointerdown', () => {
      console.log('=== BUTTON CLICKED ===');
      console.log('Button clicked! Current stove state:', this.isStoveOn);
      this.toggleStove();
      this.updateButtonAppearance();
      console.log('After toggle, new stove state:', this.isStoveOn);
    });

    // Button hover effects
    this.stoveButton.on('pointerover', () => {
      this.stoveButton?.setStrokeStyle(2, 0xffffff);
    });

    this.stoveButton.on('pointerout', () => {
      this.stoveButton?.setStrokeStyle(2, 0x333333);
    });
  }

  private updateButtonAppearance() {
    if (this.stoveButton && this.stoveButtonText) {
      if (this.isStoveOn) {
        this.stoveButton.setFillStyle(0x00aa00); // Green when on
        this.stoveButtonText.setText('OFF');
      } else {
        this.stoveButton.setFillStyle(0x666666); // Gray when off
        this.stoveButtonText.setText('ON');
      }
    }
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
  }

  private createIngredients() {
    // Destroy existing ingredient items to prevent duplicates
    this.ingredientItems.forEach(item => item.destroy());
    this.ingredientItems = [];
    this.ingredientsContentContainer.removeAll(true); // Clear previous items from the container

    const ingredients = [
      { key: "Cobek", name: "Cobek", scale: 0.15 },
      { key: "BawangMerah", name: "Bawang Merah", scale: 0.15 },
      { key: "CabaiKeriting", name: "Cabai Keriting", scale: 0.15 },
      { key: "Kunyit", name: "Kunyit", scale: 0.15 },
      { key: "BawangPutih", name: "Bawang Putih", scale: 0.15 },
      { key: "Ulekan", name: "Ulekan", scale: 0.15 },
      { key: "Wajan", name: "Wajan", scale: 0.15 },
      { key: "Sereh", name: "Sereh", scale: 0.15 },
      { key: "Lengkuas", name: "Lengkuas", scale: 0.15 },
      { key: "DaunSalam", name: "Daun Salam", scale: 0.15 },
      { key: "IrisanJahe", name: "Irisan Jahe", scale: 0.15 },
      { key: "DaunJeruk", name: "Daun Jeruk", scale: 0.15 },
      { key: "PotonganIkan", name: "Potongan Ikan", scale: 0.15 },
      { key: "Air", name: "Air", scale: 0.15 },
      { key: "Asam", name: "Asam", scale: 0.15 },
      { key: "Tomat", name: "Tomat", scale: 0.15 },
      { key: "Gula", name: "Gula", scale: 0.15 },
      { key: "Garam", name: "Garam", scale: 0.15 },
      { key: "DaunBawang", name: "Daun Bawang", scale: 0.15 },
      { key: "Mangkuk", name: "Mangkuk", scale: 0.15 }
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
        .setInteractive({ draggable: true })
        .setScale(ingredient.scale)
        .setName(ingredient.key)
        .setData('originalScale', ingredient.scale)
        .setData('ingredientType', ingredient.key);

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

      // Hover effects completely disabled
      item.on('pointerover', () => {
        // No hover effects during gameplay
      });

      item.on('pointerout', () => {
        // Always reset to normal state
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
    this.stepText = this.add.text(200, this.layoutConfig.dialogPanelHeight/2, "", {
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
    } else {
      // Game complete
      console.log("Game Complete!");
    }
  }


  private initDragAndDrop() {
    this.input.on("dragstart", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      this.isDragging = true;
      console.log('Drag started for:', gameObject.name);
      
      // Store original parent and position BEFORE removing from container
      this.draggedItemOriginalParent = gameObject.parentContainer;
      
      if (gameObject.parentContainer) {
        // Calculate world position before removing from container
        const worldPos = gameObject.parentContainer.getWorldTransformMatrix().transformPoint(gameObject.x, gameObject.y);
        
        // Store local coordinates relative to parent container
        this.draggedItemOriginalX = gameObject.x;
        this.draggedItemOriginalY = gameObject.y;
        
        const parent = gameObject.parentContainer;
        parent.remove(gameObject);
        this.add.existing(gameObject);
        
        // Set to world position first, then to pointer position
        gameObject.setPosition(worldPos.x, worldPos.y);
        gameObject.setPosition(pointer.worldX, pointer.worldY);
      } else {
        // If no parent container, store world coordinates
        this.draggedItemOriginalX = gameObject.x;
        this.draggedItemOriginalY = gameObject.y;
        gameObject.setPosition(pointer.worldX, pointer.worldY);
      }
      
      console.log(`Drag start: ${gameObject.name}, originalParent:`, this.draggedItemOriginalParent?.name || 'none', `originalPos: ${this.draggedItemOriginalX},${this.draggedItemOriginalY}`);
    
      // Enhanced visual feedback saat drag start
      const originalScale = gameObject.getData('originalScale') || 0.15;
      gameObject.setScale(originalScale * 1.2);
      gameObject.setAlpha(0.8);
      gameObject.setTint(0xffffff);
      gameObject.setDepth(1000); // Bring to front during drag
      
      // Add glow effect
      this.tweens.add({
        targets: gameObject,
        scaleX: gameObject.scaleX * 1.1,
        scaleY: gameObject.scaleY * 1.1,
        duration: 100,
        yoyo: true,
        repeat: -1
      });
    });
    

    // Drag update - follow pointer and provide visual feedback
    this.input.on("drag", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      // Always follow pointer during drag
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
      
      // Check if over valid drop zone and provide visual feedback
      this.highlightValidDropZones(gameObject, pointer);
    });

    // Drag selesai
    this.input.on("drop", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone | Phaser.GameObjects.Image) => {
      console.log(`DROP EVENT: ${gameObject.name} dropped on`, dropZone, `cooking state: ${this.cookingState}`);

      // Validate drop before processing
      if (!this.isValidDrop(gameObject, dropZone)) {
        // Invalid drop - shake screen and return item to panel
        this.shakeScreen();
        console.log(`Invalid drop: ${gameObject.name} cannot be used at this time`);

        // Check if this item is from kompor - if so, just destroy it instead of returning to panel
        if (gameObject.getData('fromKompor')) {
          console.log(`Item ${gameObject.name} is from kompor, destroying instead of returning to panel`);
          this.cleanupDragEffects(gameObject);
          gameObject.destroy();
          return;
        }

        // Don't destroy the item, just return it to panel
        this.cleanupDragEffects(gameObject);
        const originalScale = gameObject.getData('originalScale') || 0.15;
        gameObject.setScale(originalScale);

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
              if (this.ingredientsContentContainer && this.ingredientsContentMask) {
                this.ingredientsContentContainer.setMask(this.ingredientsContentMask);
              }
            }
          });
        }
        return;
      }
      // Step 1: Place Cobek
      if (this.cookingState === 'start' && gameObject.name === 'Cobek') {
        let targetX, targetY;
        
        if (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cobekZone') {
          targetX = dropZone.x;
          targetY = dropZone.y;
        } else if (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cookingAreaZone') {
          // Position to the right of kompor when dropped in general cooking area (80px distance)
          targetX = this.kompor.x + (this.kompor.width * 0.5 / 2) + 80;
          targetY = this.kompor.y;
        } else {
          this.returnItemToPanel(gameObject);
          return;
        }
        
        // Clean up drag effects first
        this.cleanupDragEffects(gameObject);
        
        // Create Cobek with smooth animation
        this.cobek = this.add.image(targetX, targetY, 'Cobek').setScale(0);
        this.cobek.setInteractive({ dropZone: true }); // Make the cobek itself a drop zone
        
        // Animate Cobek appearance (0.4x larger than original 0.3)
        this.tweens.add({
          targets: this.cobek,
          scaleX: 0.42,
          scaleY: 0.42,
          duration: 300,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Flash effect untuk sukses
            this.cameras.main.flash(200, 144, 238, 144, false);
          }
        });
        
        this.cookingState = 'cobek_placed';
        gameObject.destroy();
        return;
      }

      // Step 3: Place Wajan on Kompor
      if (this.cookingState === 'bumbu_halus_done' && gameObject.name === 'Wajan') {
        let targetX, targetY;
        
        if (dropZone === this.komporZone) {
          targetX = dropZone.x - 30; // Move 30px to the left (10px more than before)
          targetY = dropZone.y - 150; // Raise 90px above kompor
        } else if (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cookingAreaZone') {
          // Position on kompor when dropped in general cooking area
          targetX = this.kompor.x - 30; // Move 30px to the left (10px more than before)
          targetY = this.kompor.y - 150; // Raise 90px above kompor
        } else {
          this.shakeScreen();
          console.log(`Invalid drop: ${gameObject.name} cannot be used at this time`);
          this.cleanupDragEffects(gameObject);
          const originalScale = gameObject.getData('originalScale') || 0.15;
          gameObject.setScale(originalScale);
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
                if (this.ingredientsContentContainer && this.ingredientsContentMask) {
                  this.ingredientsContentContainer.setMask(this.ingredientsContentMask);
                }
              }
            });
          }
          return;
        }
        
        // Clean up drag effects first
        this.cleanupDragEffects(gameObject);
        
        // Create Wajan with smooth animation
        this.wajan = this.add.image(targetX, targetY, 'Wajan').setScale(0);
        this.wajan.setInteractive({ dropZone: true });
        
        // Animate Wajan appearance
        this.tweens.add({
          targets: this.wajan,
          scaleX: 0.8,
          scaleY: 0.8,
          duration: 300,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Flash effect untuk sukses
            this.cameras.main.flash(200, 144, 238, 144, false);
          }
        });
        
        this.cookingState = 'wajan_placed';
        gameObject.destroy();
        return;
      }

      // Step 3.1: Pour BumbuHalus into Wajan
      if (this.wajan && dropZone === this.wajan && this.cookingState === 'wajan_placed' && gameObject.name === 'BumbuHalus') {
        // Start pouring animation sequence
        this.cookingState = 'bumbu_tuang';
        gameObject.destroy();
        this.wajan.setVisible(false);

        // Create pouring animation with 2 frames over 4 seconds
        const tuangAnim = this.add.sprite(this.wajan.x, this.wajan.y, 'TuangBumbu1').setScale(0.3);
        
        // Manual frame switching for precise timing
        let frameIndex = 0;
        const frames = ['TuangBumbu1', 'TuangBumbu2'];
        
        const frameTimer = this.time.addEvent({
          delay: 2000, // 2 seconds per frame
          repeat: 1, // Switch once (2 frames total)
          callback: () => {
            frameIndex++;
            if (frameIndex < frames.length) {
              tuangAnim.setTexture(frames[frameIndex]);
            }
          }
        });

        // After 4 seconds, transition to stirring
        this.time.delayedCall(4000, () => {
          frameTimer.destroy();
          tuangAnim.destroy();
          this.wajan.setTexture('AdukBumbu1').setVisible(true);
          this.cookingState = 'mengaduk_bumbu';
          this.isMengaduk = true;
          this.swipeCount = 0;
          this.handleMengaduk();
        });
        return;
      }

      // Step 7: Serve the dish
      if (this.cookingState === 'matang' && gameObject.name === 'Mangkuk') {
        let targetX, targetY;
        if (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cobekZone') {
          targetX = dropZone.x;
          targetY = dropZone.y;
        } else if (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cookingAreaZone') {
          // Position to the right of kompor when dropped in general cooking area (50px distance)
          targetX = this.kompor.x + (this.kompor.width * 0.5 / 2) + 50;
          targetY = this.kompor.y;
        } else {
          this.returnItemToPanel(gameObject);
          return;
        }

        this.mangkuk = this.add.image(targetX, targetY, 'Mangkuk').setScale(0.3);
        this.mangkuk.setInteractive({ dropZone: true });
        this.mangkuk.setName('MangkukDropZone');
        this.mangkuk.setDepth(50); // Ensure mangkuk is visible but below dragged items

        console.log('Mangkuk created as dropzone at:', targetX, targetY);
        console.log('Mangkuk properties:', {
          interactive: this.mangkuk.input?.enabled,
          dropZone: this.mangkuk.input?.dropZone,
          name: this.mangkuk.name,
          depth: this.mangkuk.depth
        });

        this.cookingState = 'mangkuk_placed';
        gameObject.destroy();
      } else if (this.mangkuk && dropZone === this.mangkuk && this.cookingState === 'mangkuk_placed' && gameObject.name === 'IkanKuahKuningJadi') {
        console.log('IkanKuahKuningJadi successfully dropped on Mangkuk!');
        this.mangkuk.setTexture('IkanKuahKuning');
        this.cookingState = 'finished';
        gameObject.destroy();
        this.showSuccessPopup();
      }

      if (this.wajan && dropZone === this.wajan) {
        switch (this.cookingState) {
          // ... (existing cases)
          case 'mendidih':
            if (gameObject.name === 'Tomat') {
              this.wajan.setTexture('TambahTomat');
              this.cookingState = 'tomat_added';
              gameObject.destroy();
            }
            break;
          case 'tomat_added':
            if (gameObject.name === 'Garam') {
              this.wajan.setTexture('TambahGaram');
              this.cookingState = 'garam_added';
              gameObject.destroy();
              this.time.delayedCall(2000, () => this.wajan.setTexture('TambahTomat'));
            }
            break;
          case 'garam_added':
            if (gameObject.name === 'Gula') {
              this.wajan.setTexture('TambahGula');
              this.cookingState = 'gula_added';
              gameObject.destroy();
              this.time.delayedCall(2000, () => this.wajan.setTexture('TambahTomat'));
            }
            break;
          case 'gula_added':
            if (gameObject.name === 'DaunBawang') {
              // No texture change, just destroy the item
              this.cookingState = 'daun_bawang_added';
              gameObject.destroy();
            }
            break;
          case 'daun_bawang_added':
            if (gameObject.name === 'Asam') {
              this.wajan.setTexture('TambahAsam');
              this.cookingState = 'asam_added';
              gameObject.destroy();
              this.time.delayedCall(2000, () => {
                this.wajan.setTexture('AdukFinishing1');
                this.cookingState = 'mengaduk_finishing';
                this.isMengaduk = true;
                this.swipeCount = 0;
                this.handleMengaduk();
              });
            }
            break;
        }

        switch (this.cookingState) {
          case 'bumbu_matang':
            if (gameObject.name === 'DaunSalam') {
              this.wajan.setTexture('TambahDaunSalam');
              this.cookingState = 'daun_salam_added';
              gameObject.destroy();
            }
            break;
          case 'daun_salam_added':
            if (gameObject.name === 'Sereh') {
              this.wajan.setTexture('TambahSereh');
              this.cookingState = 'sereh_added';
              gameObject.destroy();
            }
            break;
          case 'sereh_added':
            if (gameObject.name === 'Lengkuas') {
              this.wajan.setTexture('TambahLengkuas');
              this.cookingState = 'lengkuas_added';
              gameObject.destroy();
              // Short delay before starting stirring
              this.time.delayedCall(1000, () => {
                this.wajan.setTexture('AdukBumbuStep4-1');
                this.cookingState = 'mengaduk_aromatics';
                this.isMengaduk = true;
                this.swipeCount = 0;
                this.handleMengaduk();
              });
            }
            break;
          case 'aromatics_done':
            if (gameObject.name === 'IrisanJahe') {
              this.wajan.setTexture('TambahJahe');
              this.cookingState = 'jahe_added';
              gameObject.destroy();
            }
            break;
          case 'jahe_added':
            if (gameObject.name === 'DaunJeruk') {
              this.wajan.setTexture('TambahDaun');
              this.cookingState = 'daun_jeruk_added';
              gameObject.destroy();
            }
            break;
          case 'daun_jeruk_added':
            if (gameObject.name === 'PotonganIkan') {
              this.wajan.setTexture('TambahIkan');
              this.cookingState = 'ikan_added';
              gameObject.destroy();
            }
            break;
          case 'ikan_added':
            if (gameObject.name === 'Air') {
              this.wajan.setTexture('TambahAir');
              this.cookingState = 'air_added';
              gameObject.destroy();
              this.time.delayedCall(3000, () => {
                this.wajan.setTexture('AdukAir2');
                this.cookingState = 'mengaduk_air';
                this.isMengaduk = true;
                this.swipeCount = 0;
                this.handleMengaduk();
              });
            }
            break;
        }

        switch (this.cookingState) {
          case 'bumbu_matang':
            if (gameObject.name === 'DaunSalam') {
              this.wajan.setTexture('TambahDaunSalam');
              this.cookingState = 'daun_salam_added';
              gameObject.destroy();
            }
            break;
          case 'daun_salam_added':
            if (gameObject.name === 'Sereh') {
              this.wajan.setTexture('TambahSereh');
              this.cookingState = 'sereh_added';
              gameObject.destroy();
            }
            break;
          case 'sereh_added':
            if (gameObject.name === 'Lengkuas') {
              this.wajan.setTexture('AdukBumbuStep4-1');
              this.cookingState = 'mengaduk_aromatics';
              this.isMengaduk = true;
              this.swipeCount = 0;
              this.handleMengaduk();
              gameObject.destroy();
            }
            break;
        }
      }

      if (dropZone === this.cobek) {
        switch (this.cookingState) {
          case 'cobek_placed':
            if (gameObject.name === 'BawangMerah') {
              this.cobek.setTexture('Ulekan1');
              this.cookingState = 'ulekan_step_1';
              gameObject.destroy();
            }
            break;
          case 'ulekan_step_1':
            if (gameObject.name === 'CabaiKeriting') {
              this.cobek.setTexture('Ulekan2');
              this.cookingState = 'ulekan_step_2';
              gameObject.destroy();
            }
            break;
          case 'ulekan_step_2':
            if (gameObject.name === 'Kunyit') {
              this.cobek.setTexture('Ulekan3');
              this.cookingState = 'ulekan_step_3';
              gameObject.destroy();
            }
            break;
          case 'ulekan_step_3':
            if (gameObject.name === 'BawangPutih') {
              this.cobek.setTexture('Ulekan4');
              this.cookingState = 'ulekan_step_4';
              gameObject.destroy();
              this.nextStep();
            }
            break;
          // Step 2: Add Ulekan to start grinding
          case 'ulekan_step_4':
            if (gameObject.name === 'Ulekan') {
              // Reset mengulek state
              this.isMengulek = true;
              this.mengulekPhase = 1;
              this.swipeCount = 0;
              this.lastSwipeDirection = null;
              
              // Start with first phase texture and scale up for Mengulek (0.7x larger)
              this.cobek.setTexture('Mengulek1');
              this.cobek.setScale(0.42 * 2); // 0.42 * 1.7 = 0.714 (0.7x larger)
              gameObject.destroy();
              this.handleMengulek();
            }
            break;
        }
      }
    });

    this.input.on("dragend", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
      this.isDragging = false;
      // Skip if item is being returned by another mechanism
      if (this.itemBeingReturned) {
        return;
      }

      // Reset semua efek visual
      this.cleanupDragEffects(gameObject);

      // Special handling for BumbuHalus in step 3
      if (gameObject.name === 'BumbuHalus' && this.cookingState === 'bumbu_halus_done') {
        console.log(`Returning BumbuHalus to position next to kompor`);

        // Position BumbuHalus 30px to the right of kompor
        const targetX = this.kompor.x + (this.kompor.width * 0.5 / 2) + 30;
        const targetY = this.kompor.y;

        // Ensure correct scale (use stored original scale, same as Cobek)
        const originalScale = gameObject.getData('originalScale') || 0.42;
        gameObject.setScale(originalScale);

        // Animate back to position
        this.tweens.add({
          targets: gameObject,
          x: targetX,
          y: targetY,
          duration: 400,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Ensure it remains interactive and draggable
            gameObject.setInteractive();
            this.input.setDraggable(gameObject);
          }
        });
        return;
      }

      // ALWAYS return item to panel unless it was destroyed by valid drop logic
      // Check if the gameObject still exists (not destroyed by valid drop)
      if (gameObject.scene) {
        console.log(`Returning ${gameObject.name} to ingredient panel`);

        // Reset scale for ingredients going back to panel
        const originalScale = gameObject.getData('originalScale') || 0.15;
        gameObject.setScale(originalScale);
        gameObject.setVisible(true);
        gameObject.setActive(true);

        if (this.draggedItemOriginalParent) {
          // Return item to original panel position with animation
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
            }
          });
        } else {
          // Fallback: ensure item is added to ingredients container
          if (this.ingredientsContentContainer) {
            this.ingredientsContentContainer.add(gameObject);
          }
          gameObject.setInteractive();
          gameObject.setVisible(true);
          this.tweens.add({
            targets: gameObject,
            x: this.draggedItemOriginalX || 100,
            y: this.draggedItemOriginalY || 100,
            duration: 400,
            ease: 'Back.easeOut'
          });
        }
      }

      // Reset properti yang disimpan
      this.draggedItemOriginalParent = null;
      this.draggedItemOriginalX = 0;
      this.draggedItemOriginalY = 0;
    });
  }


  private handleMengaduk() {
    // Remove any existing listeners to prevent duplication
    this.input.off('pointerdown');
    this.input.off('pointerup');
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isMengaduk) {
        this.pointerStartX = pointer.x;
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isMengaduk) {
        const swipeDistance = pointer.x - this.pointerStartX;
        
        // Step 3 stirring: AdukBumbu1 <-> AdukBumbu2
        if (this.cookingState === 'mengaduk_bumbu') {
          if (swipeDistance > 50 && this.lastSwipeDirection !== 'right') { // Swipe right
            this.swipeCount++;
            this.lastSwipeDirection = 'right';
            this.wajan.setTexture('AdukBumbu1');
          } else if (swipeDistance < -50 && this.lastSwipeDirection !== 'left') { // Swipe left
            this.swipeCount++;
            this.lastSwipeDirection = 'left';
            this.wajan.setTexture('AdukBumbu2');
          }

          if (this.swipeCount >= 15) {
            this.isMengaduk = false;
            this.swipeCount = 0;
            this.lastSwipeDirection = null;
            this.wajan.setTexture('BumbuHalusWajan');
            this.cookingState = 'bumbu_matang';
            this.nextStep();
          }
        }
        // Step 4 stirring: AdukBumbuStep4-1 <-> AdukBumbuStep4-2
        else if (this.cookingState === 'mengaduk_aromatics') {
          if (swipeDistance > 50 && this.lastSwipeDirection !== 'right') { // Swipe right
            this.swipeCount++;
            this.lastSwipeDirection = 'right';
            this.wajan.setTexture('AdukBumbuStep4-1');
          } else if (swipeDistance < -50 && this.lastSwipeDirection !== 'left') { // Swipe left
            this.swipeCount++;
            this.lastSwipeDirection = 'left';
            this.wajan.setTexture('AdukBumbuStep4-2');
          }

          if (this.swipeCount >= 15) {
            this.isMengaduk = false;
            this.swipeCount = 0;
            this.lastSwipeDirection = null;
            this.wajan.setTexture('BumbuStep4-2');
            this.cookingState = 'aromatics_done';
            this.nextStep();
          }
        }
        // Other stirring states (existing logic)
        else if (this.cookingState === 'mengaduk_air') {
          if (swipeDistance > 50 && this.lastSwipeDirection !== 'right') { // Swipe right
            this.swipeCount++;
            this.lastSwipeDirection = 'right';
            this.wajan.setTexture('AdukAir2');
          } else if (swipeDistance < -50 && this.lastSwipeDirection !== 'left') { // Swipe left
            this.swipeCount++;
            this.lastSwipeDirection = 'left';
            this.wajan.setTexture('AdukAir1');
          }

          if (this.swipeCount >= 15) {
            this.isMengaduk = false;
            this.swipeCount = 0;
            this.lastSwipeDirection = null;
            this.wajan.setTexture('TambahAir2');
            this.cookingState = 'mendidih';
            this.startCountdown(20);
          }
        }
        else if (this.cookingState === 'mengaduk_finishing') {
          if (swipeDistance > 50 && this.lastSwipeDirection !== 'right') {
            this.swipeCount++;
            this.lastSwipeDirection = 'right';
            this.wajan.setTexture('AdukFinishing1');
          } else if (swipeDistance < -50 && this.lastSwipeDirection !== 'left') {
            this.swipeCount++;
            this.lastSwipeDirection = 'left';
            this.wajan.setTexture('AdukFinishing2');
          }

          if (this.swipeCount >= 15) {
            this.isMengaduk = false;
            this.swipeCount = 0;
            this.lastSwipeDirection = null;
            this.wajan.setTexture('IkanKuahKuningJadi');
            this.cookingState = 'matang';
            this.input.setDraggable(this.wajan);
            this.startCountdown(30);
          }
        }
      }
    });
  }

  private startCountdown(duration: number) {
    // Disable all drag and drop during countdown
    this.disableAllDragDrop();

    this.countdownText = this.add.text(this.wajan.x, this.wajan.y - 150, ``, {
      fontSize: '32px',
      fontFamily: 'Chewy, cursive',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    let timeLeft = duration;
    const timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        timeLeft--;
        this.countdownText.setText(`${timeLeft}`);
        if (timeLeft <= 0) {
          timer.remove();
          this.countdownText.destroy();

          // Re-enable drag and drop after countdown
          this.enableAllDragDrop();

          this.nextStep();
        }
      },
      loop: true
    });
  }

  private disableAllDragDrop() {
    // Disable drag for all items in ingredients panel
    this.ingredientItems.forEach(item => {
      if (item.scene) {
        this.input.setDraggable(item, false);
        item.setAlpha(0.5); // Visual feedback that items are disabled
      }
    });

    // Disable drag for BumbuHalus if it exists
    if (this.campuranBumbuHalus && this.campuranBumbuHalus.scene) {
      this.input.setDraggable(this.campuranBumbuHalus, false);
      this.campuranBumbuHalus.setAlpha(0.5);
    }

    // Disable drag for wajan if it exists but keep it fully visible
    if (this.wajan && this.wajan.scene) {
      this.input.setDraggable(this.wajan, false);
      // Keep wajan at full opacity (alpha 1) to prevent transparency issues
      this.wajan.setAlpha(1);
    }
  }

  private enableAllDragDrop() {
    // Re-enable drag for all items in ingredients panel
    this.ingredientItems.forEach(item => {
      if (item.scene) {
        this.input.setDraggable(item, true);
        item.setAlpha(1); // Restore full opacity
      }
    });

    // Re-enable drag for BumbuHalus if it exists
    if (this.campuranBumbuHalus && this.campuranBumbuHalus.scene) {
      this.input.setDraggable(this.campuranBumbuHalus, true);
      this.campuranBumbuHalus.setAlpha(1);
    }

    // Re-enable drag for wajan if it exists and should be draggable
    if (this.wajan && this.wajan.scene && this.cookingState === 'matang') {
      this.input.setDraggable(this.wajan, true);
      this.wajan.setAlpha(1);
    }
  }

  private handleScroll(deltaY: number) {
    const scrollSpeed = 1; // Reduced from 10 to 3 for slower scrolling
    let newY = this.ingredientsContentContainer.y - deltaY * scrollSpeed;

    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 105;
    const maxScroll = Math.max(0, this.scrollContentHeight - scrollableAreaHeight);

    newY = Math.max(-maxScroll, newY);
    newY = Math.min(0, newY);

    this.ingredientsContentContainer.y = newY;
    this.updateScrollbar();
  }

  private updateScrollbar() {
    if (!this.scrollbar || !this.scrollbarThumb) return;

    this.scrollbar.clear();
    this.scrollbarThumb.clear();

    const scrollableAreaHeight = this.layoutConfig.ingredientsPanelHeight - 105;
    const scrollbarWidth = 12;
    const scrollbarX = this.layoutConfig.ingredientsPanelWidth - scrollbarWidth - 8;
    const scrollbarYOffset = 100;

    if (this.scrollContentHeight > scrollableAreaHeight) {
      this.scrollbar.setVisible(true);
      this.scrollbarThumb.setVisible(true);

      this.scrollbar.fillStyle(0x4A3428, 0.6);
      this.scrollbar.fillRoundedRect(scrollbarX, scrollbarYOffset, scrollbarWidth, scrollableAreaHeight, 6);

      const thumbHeight = Math.max(20, (scrollableAreaHeight / this.scrollContentHeight) * scrollableAreaHeight);
      const maxScroll = this.scrollContentHeight - scrollableAreaHeight;
      const scrollPercentage = maxScroll > 0 ? Math.abs(this.ingredientsContentContainer.y) / maxScroll : 0;
      const thumbY = scrollbarYOffset + (scrollableAreaHeight - thumbHeight) * scrollPercentage;

      this.scrollbarThumb.fillStyle(0x8B4513, 0.9);
      this.scrollbarThumb.fillRoundedRect(scrollbarX + 1, thumbY, scrollbarWidth - 2, thumbHeight, 5);
    } else {
      this.scrollbar.setVisible(false);
      this.scrollbarThumb.setVisible(false);
    }
  }

  private isValidIngredient(ingredientName: string): boolean {
    const allowedIngredients = this.ingredientOrder[this.cookingState];
    return allowedIngredients ? allowedIngredients.includes(ingredientName) : false;
  }

  private shakeScreen() {
    this.cameras.main.shake(300, 0.01);
  }

  private returnItemToOriginalPosition(gameObject: Phaser.GameObjects.Image) {
    // Stop all tweens on the object to prevent conflicts
    this.tweens.killTweensOf(gameObject);
    
    // Reset visual properties
    const originalScale = gameObject.getData('originalScale') || 0.15;
    gameObject.setScale(originalScale);
    gameObject.clearTint();
    gameObject.setAlpha(1);
    gameObject.setDepth(0);

    if (this.draggedItemOriginalParent) {
      // Return to original parent container with smooth animation
      this.draggedItemOriginalParent.add(gameObject);
      
      // Animate return to original position
      this.tweens.add({
        targets: gameObject,
        x: this.draggedItemOriginalX,
        y: this.draggedItemOriginalY,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          gameObject.setInteractive();
          // Re-enable mask when returning to container
          if (this.ingredientsContentContainer && this.ingredientsContentMask) {
            this.ingredientsContentContainer.setMask(this.ingredientsContentMask);
          }
        }
      });
    } else {
      // Fallback: ensure item stays interactive and visible
      gameObject.setInteractive();
      gameObject.setVisible(true);
    }

    // Reset stored properties
    this.draggedItemOriginalParent = null;
    this.draggedItemOriginalX = 0;
    this.draggedItemOriginalY = 0;
  }

  private createHintButton() {
    const hintButton = this.add.image(this.layoutConfig.ingredientsPanelX + this.layoutConfig.ingredientsPanelWidth / 2, this.layoutConfig.ingredientsPanelY + this.layoutConfig.ingredientsPanelHeight + 175, 'hint_normal').setInteractive();
    hintButton.setScale(0.1);

    hintButton.on('pointerover', () => hintButton.setTexture('hint_hover'));
    hintButton.on('pointerout', () => hintButton.setTexture('hint_normal'));
    hintButton.on('pointerdown', () => {
      hintButton.setTexture('hint_active');
      this.showHintPopup();
    });
  }

  private showHintPopup() {
    if (!this.hintPopup || !this.hintPopup.scene) {
      this.createHintPopup();
    }
    this.hintPopup.setVisible(!this.hintPopup.visible);
  }

  private createHintPopup() {
    const popupWidth = 650;
    const popupHeight = 450;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.hintPopup = this.add.container(centerX, centerY);
    this.hintPopup.setDepth(100);

    const background = this.add.graphics();
    background.fillStyle(0x8B4513, 0.9);
    background.fillRoundedRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight, 20);
    this.hintPopup.add(background);

    const contentBg = this.add.graphics();
    contentBg.fillStyle(0xFFFDD0, 0.95);
    contentBg.fillRoundedRect(-popupWidth / 2 + 15, -popupHeight / 2 + 15, popupWidth - 30, popupHeight - 30, 15);
    this.hintPopup.add(contentBg);

    const title = this.add.text(0, -popupHeight / 2 + 45, 'Ikan Kuah Kuning', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#5D4037',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.hintPopup.add(title);

    const text = this.add.text(-popupWidth / 2 + 40, -popupHeight / 2 + 90, this.infoContent, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#3E2723',
      wordWrap: { width: popupWidth - 80, useAdvancedWrap: true },
      align: 'left',
      lineSpacing: 6
    }).setOrigin(0, 0);
    
    this.hintPopup.add(text);
    this.hintPopup.setVisible(false);
  }

  private isValidDrop(gameObject: Phaser.GameObjects.Image, dropZone?: Phaser.GameObjects.Zone | Phaser.GameObjects.Image): boolean {
    const itemName = gameObject.name;
    const state = this.cookingState;

    // console.log(`Validating drop: ${itemName} in state ${state}, dropZone:`, dropZone);

    // Define valid drops for each cooking state
    switch (state) {
      case 'start':
        return itemName === 'Cobek' && (
          (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cobekZone') ||
          (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cookingAreaZone')
        );
      
      case 'cobek_placed':
        return itemName === 'BawangMerah' && dropZone === this.cobek;
      
      case 'ulekan_step_1':
        return itemName === 'CabaiKeriting' && dropZone === this.cobek;
      
      case 'ulekan_step_2':
        return itemName === 'Kunyit' && dropZone === this.cobek;
      
      case 'ulekan_step_3':
        return itemName === 'BawangPutih' && dropZone === this.cobek;
      
      case 'ulekan_step_4':
        return itemName === 'Ulekan' && dropZone === this.cobek;
      
      case 'bumbu_halus_done':
        return itemName === 'Wajan' && (
          dropZone === this.komporZone ||
          (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cookingAreaZone')
        );
      
      case 'wajan_placed':
        // BumbuHalus HANYA bisa di-drop ke Wajan.png, tidak ke zone lain
        return itemName === 'BumbuHalus' && dropZone === this.wajan;
      
      case 'bumbu_matang':
        return itemName === 'DaunSalam' && dropZone === this.wajan;
      
      case 'daun_salam_added':
        return itemName === 'Sereh' && dropZone === this.wajan;
      
      case 'sereh_added':
        return itemName === 'Lengkuas' && dropZone === this.wajan;
      
      case 'aromatics_done':
        return itemName === 'IrisanJahe' && dropZone === this.wajan;
      
      case 'jahe_added':
        return itemName === 'DaunJeruk' && dropZone === this.wajan;
      
      case 'daun_jeruk_added':
        return itemName === 'PotonganIkan' && dropZone === this.wajan;
      
      case 'ikan_added':
        return itemName === 'Air' && dropZone === this.wajan;
      
      case 'mendidih':
        return itemName === 'Tomat' && dropZone === this.wajan;
      
      case 'tomat_added':
        return itemName === 'Garam' && dropZone === this.wajan;
      
      case 'garam_added':
        return itemName === 'Gula' && dropZone === this.wajan;
      
      case 'gula_added':
        return itemName === 'DaunBawang' && dropZone === this.wajan;
      
      case 'daun_bawang_added':
        return itemName === 'Asam' && dropZone === this.wajan;
      
      case 'matang':
        return itemName === 'Mangkuk' && (
          (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cobekZone') ||
          (dropZone instanceof Phaser.GameObjects.Zone && dropZone.name === 'cookingAreaZone')
        );

      case 'mangkuk_placed':
        console.log(`Validating drop for mangkuk_placed: itemName=${itemName}, dropZone:`, dropZone, 'this.mangkuk:', this.mangkuk);
        console.log(`dropZone === this.mangkuk:`, dropZone === this.mangkuk);
        return itemName === 'IkanKuahKuningJadi' && dropZone === this.mangkuk;
      
      default:
        return false;
    }
  }

  private shakeScreen(): void {
    this.cameras.main.shake(300, 0.02, true);
  }

  private returnItemToPanel(gameObject: Phaser.GameObjects.Image): void {
    // Check if this item is from kompor - if so, just destroy it
    if (gameObject.getData('fromKompor')) {
      console.log(`Item ${gameObject.name} is from kompor, destroying instead of returning to panel`);
      gameObject.destroy();
      return;
    }

    // Set flag to prevent dragend from interfering
    this.itemBeingReturned = true;

    // Trigger screen shake as warning
    this.shakeScreen();
    console.log(`Returning ${gameObject.name} to panel due to invalid drop`);

    // Clean up drag effects first
    this.cleanupDragEffects(gameObject);

    const originalScale = gameObject.getData('originalScale') || 0.15;
    gameObject.setScale(originalScale);

    if (this.draggedItemOriginalParent) {
      // Return to original parent container
      this.draggedItemOriginalParent.add(gameObject);
      
      // Animate return with bounce effect
      this.tweens.add({
        targets: gameObject,
        x: this.draggedItemOriginalX,
        y: this.draggedItemOriginalY,
        duration: 500,
        ease: 'Bounce.easeOut',
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
    
    // Reset stored properties
    this.draggedItemOriginalParent = null;
    this.draggedItemOriginalX = 0;
    this.draggedItemOriginalY = 0;
  }

  private highlightValidDropZones(gameObject: Phaser.GameObjects.Image, pointer: Phaser.Input.Pointer): void {
    // Check if dragging over kompor zone for Wajan
    if (gameObject.name === 'Wajan' && this.cookingState === 'bumbu_halus_done') {
      const komporBounds = this.komporZone.getBounds();
      const isOverKompor = Phaser.Geom.Rectangle.Contains(komporBounds, pointer.worldX, pointer.worldY);
      
      if (isOverKompor) {
        // No visual highlight when dragging over kompor
        this.kompor.clearTint();
        gameObject.setTint(0xFFFFAA); // Default yellow tint
      } else {
        this.kompor.clearTint();
        gameObject.setTint(0xFFFFAA); // Default yellow tint
      }
    }
    
    // Check if dragging BumbuHalus over Wajan ONLY
    if (gameObject.name === 'BumbuHalus' && this.cookingState === 'wajan_placed' && this.wajan) {
      const wajanBounds = this.wajan.getBounds();
      const isOverWajan = Phaser.Geom.Rectangle.Contains(wajanBounds, pointer.worldX, pointer.worldY);
      
      if (isOverWajan) {
        // No visual highlight when dragging over wajan
        this.wajan.clearTint();
        gameObject.setTint(0xFFFFAA); // Default yellow tint
      } else {
        this.wajan.clearTint();
        gameObject.setTint(0xFF6666); // Red tint to indicate invalid drop everywhere else
      }
    }
    
    // Check if dragging over cobek zone for ingredients
    if (this.cobek && (gameObject.name === 'BawangMerah' || gameObject.name === 'CabaiKeriting' || 
        gameObject.name === 'Kunyit' || gameObject.name === 'BawangPutih' || gameObject.name === 'Ulekan')) {
      const cobekBounds = this.cobek.getBounds();
      const isOverCobek = Phaser.Geom.Rectangle.Contains(cobekBounds, pointer.worldX, pointer.worldY);
      
      if (isOverCobek) {
        // No visual highlight when dragging over cobek
        this.cobek.clearTint();
        gameObject.setTint(0xFFFFAA); // Default yellow tint
      } else {
        this.cobek.clearTint();
        gameObject.setTint(0xFFFFAA); // Default yellow tint
      }
    }
  }

  private cleanupDragEffects(gameObject: Phaser.GameObjects.Image): void {
    // Stop all tweens on the dragged object
    this.tweens.killTweensOf(gameObject);

    // Reset visual properties
    gameObject.clearTint();
    gameObject.setAlpha(1);
    gameObject.setDepth(0);

    // Don't reset scale here - let the specific handlers manage scale

    // Clear tints from drop zones
    if (this.kompor) this.kompor.clearTint();
    if (this.cobek) this.cobek.clearTint();
    if (this.wajan) this.wajan.clearTint();
  }

  private findIngredientConfig(itemName: string) {
    const ingredients = [
      { key: "Cobek", name: "Cobek", scale: 0.15 },
      { key: "BawangMerah", name: "Bawang Merah", scale: 0.15 },
      { key: "CabaiKeriting", name: "Cabai Keriting", scale: 0.15 },
      { key: "Kunyit", name: "Kunyit", scale: 0.15 },
      { key: "BawangPutih", name: "Bawang Putih", scale: 0.15 },
      { key: "Ulekan", name: "Ulekan", scale: 0.15 },
      { key: "Wajan", name: "Wajan", scale: 0.15 },
      { key: "Sereh", name: "Sereh", scale: 0.15 },
      { key: "Lengkuas", name: "Lengkuas", scale: 0.15 },
      { key: "DaunSalam", name: "Daun Salam", scale: 0.15 },
      { key: "IrisanJahe", name: "Irisan Jahe", scale: 0.15 },
      { key: "DaunJeruk", name: "Daun Jeruk", scale: 0.15 },
      { key: "PotonganIkan", name: "Potongan Ikan", scale: 0.15 },
      { key: "Air", name: "Air", scale: 0.15 },
      { key: "Asam", name: "Asam", scale: 0.2 },
      { key: "Tomat", name: "Tomat", scale: 0.15 },
      { key: "Gula", name: "Gula", scale: 0.2 },
      { key: "Garam", name: "Garam", scale: 0.2 },
      { key: "DaunBawang", name: "Daun Bawang", scale: 0.15 },
      { key: "Mangkuk", name: "Mangkuk", scale: 0.15 }
    ];
    
    return ingredients.find(ingredient => ingredient.key === itemName);
  }

  private recreateItemInPanel(ingredientConfig: { key: string, name: string, scale: number }): void {
    // Find an empty spot in the ingredients grid
    const panelWidth = this.layoutConfig.ingredientsPanelWidth;
    const startX = panelWidth / 6;
    const startY = 100;
    const spacingX = panelWidth / 2;
    const spacingY = 90;
    const itemsPerRow = 2;
    
    // For simplicity, place at first position - could be improved to find actual empty spot
    const x = startX;
    const y = startY;

    // Item background
    const itemBg = this.add.graphics();
    itemBg.fillStyle(0x000000, 0.25);
    itemBg.fillRoundedRect(x - 55, y - 37.5, 110, 75, 12);
    itemBg.lineStyle(1, 0x8B4513, 0.4);
    itemBg.strokeRoundedRect(x - 55, y - 37.5, 110, 75, 12);
    this.ingredientsContentContainer.add(itemBg);

    // Item image
    const item = this.add.image(x, y, ingredientConfig.key)
      .setInteractive({ draggable: true })
      .setScale(ingredientConfig.scale)
      .setName(ingredientConfig.key)
      .setData('originalScale', ingredientConfig.scale)
      .setData('ingredientType', ingredientConfig.key);

    this.ingredientItems.push(item);
    this.input.setDraggable(item);
    this.ingredientsContentContainer.add(item);

    // Item label
    const label = this.add.text(x, y + 40, ingredientConfig.name, {
      fontSize: '14px',
      fontFamily: 'Chewy, cursive',
      color: '#FFE4B5',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.ingredientsContentContainer.add(label);

    // Hover effects completely disabled
    item.on('pointerover', () => {
      // No hover effects during gameplay
    });

    item.on('pointerout', () => {
      // Always reset to normal state
      item.setScale(ingredientConfig.scale);
      label.setColor('#FFE4B5');
      itemBg.clear();
      itemBg.fillStyle(0x000000, 0.25);
      itemBg.fillRoundedRect(x - 55, y - 37.5, 110, 75, 12);
      itemBg.lineStyle(1, 0x8B4513, 0.4);
      itemBg.strokeRoundedRect(x - 55, y - 37.5, 110, 75, 12);
    });

    console.log(`Recreated ${ingredientConfig.name} in ingredients panel`);
  }

  private createDraggedItemFromKompor(itemKey: string): void {
    // Create the item at kompor position, slightly above it for visibility
    const draggedItem = this.add.image(this.kompor.x, this.kompor.y - 50, itemKey)
      .setScale(0.3)
      .setInteractive({ draggable: true })
      .setName(itemKey)
      .setData('originalScale', 0.3)
      .setData('fromKompor', true)
      .setDepth(100); // Ensure it's above other objects

    // Make it draggable
    this.input.setDraggable(draggedItem);

    // Visual feedback that it's ready to drag
    draggedItem.setTint(0xFFFFAA);

    // Add debug events for this specific item
    draggedItem.on('dragstart', () => {
      console.log('IkanKuahKuningJadi drag started!');
    });

    draggedItem.on('drag', (pointer: Phaser.Input.Pointer) => {
      console.log('IkanKuahKuningJadi being dragged to:', pointer.x, pointer.y);
    });

    draggedItem.on('dragend', () => {
      console.log('IkanKuahKuningJadi drag ended!');
    });

    draggedItem.on('pointerdown', () => {
      console.log('IkanKuahKuningJadi clicked/touched!');
    });

    console.log('IkanKuahKuningJadi created and ready to drag from kompor');
    console.log('Item properties:', {
      interactive: draggedItem.input?.enabled,
      draggable: draggedItem.input?.draggable,
      name: draggedItem.name,
      depth: draggedItem.depth
    });
  }

  private showSuccessPopup() {
    const popupWidth = 500;
    const popupHeight = 300;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const popup = this.add.container(centerX, centerY);
    popup.setDepth(1000);

    const background = this.add.graphics();
    background.fillStyle(0x000000, 0.7);
    background.fillRect(-popupWidth / 2, -popupHeight / 2, popupWidth, popupHeight);
    popup.add(background);

    const title = this.add.text(0, -popupHeight / 2 + 50, 'Selamat!', {
      fontSize: '32px',
      fontFamily: 'Chewy, cursive',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    popup.add(title);

    const message = this.add.text(0, 0, 'Ikan Kuah Kuning berhasil dimasak!', {
      fontSize: '24px',
      fontFamily: 'Chewy, cursive',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    popup.add(message);

    // Animate popup
    this.tweens.add({
      targets: popup,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  private handleMengulek() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isMengulek) {
        this.pointerStartX = pointer.x;
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isMengulek) {
        const swipeDistance = pointer.x - this.pointerStartX;
        
        if (this.mengulekPhase === 1) {
          if (swipeDistance > 50 && this.lastSwipeDirection !== 'right') { // Swipe right
            this.swipeCount++;
            this.lastSwipeDirection = 'right';
            this.cobek.setTexture('Mengulek2');
          } else if (swipeDistance < -50 && this.lastSwipeDirection !== 'left') { // Swipe left
            this.swipeCount++;
            this.lastSwipeDirection = 'left';
            this.cobek.setTexture('Mengulek1');
          }

          if (this.swipeCount >= 9) {
            this.mengulekPhase = 2;
            this.swipeCount = 0;
            this.lastSwipeDirection = null;
            this.cobek.setTexture('Mengulek4');
          }
        } else if (this.mengulekPhase === 2) {
          if (swipeDistance > 50 && this.lastSwipeDirection !== 'right') { // Swipe right
            this.swipeCount++;
            this.lastSwipeDirection = 'right';
            this.cobek.setTexture('Mengulek4');
          } else if (swipeDistance < -50 && this.lastSwipeDirection !== 'left') { // Swipe left
            this.swipeCount++;
            this.lastSwipeDirection = 'left';
            this.cobek.setTexture('Mengulek5');
          }

          if (this.swipeCount >= 9) {
            this.isMengulek = false;
            this.cobek.setTexture('BumbuHalus');
            this.cobek.setScale(0.42); // Return to normal Cobek size
            this.cookingState = 'bumbu_halus_done';
            this.nextStep();

            // Create draggable bumbu halus (same size as Cobek)
            this.campuranBumbuHalus = this.add.image(this.cobek.x, this.cobek.y, 'BumbuHalus')
              .setScale(0.42)
              .setName('BumbuHalus')
              .setInteractive()
              .setData('originalScale', 0.42); // Store original scale (same as Cobek)
            this.input.setDraggable(this.campuranBumbuHalus);
            this.cobek.destroy();
          }
        }
      }
    });
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
}