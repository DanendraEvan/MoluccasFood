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
  private telenanSelected = false;
  private hintPopup!: Phaser.GameObjects.Container;
  private infoContent: string = `Colo-colo adalah sambal khas Maluku yang memiliki cita rasa pedas dan segar. Sambal ini terbuat dari campuran cabai rawit merah, bawang merah, tomat, dan garam yang diulek kasar hingga tercampur rata. Yang membuat colo-colo unik adalah teksturnya yang tidak terlalu halus, sehingga masih terasa potongan-potongan kecil dari bahan-bahannya. Kadang-kadang ditambahkan perasan jeruk nipis atau jeruk lemon untuk memberikan rasa asam segar yang menyeimbangkan rasa pedasnya. Colo-colo biasanya disajikan sebagai pelengkap berbagai makanan khas Maluku seperti ikan bakar, papeda, atau nasi putih. Sambal ini sangat digemari karena kesegaran dan rasa pedasnya yang khas, serta kemudahan dalam pembuatannya yang tidak memerlukan proses memasak.`;

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
    dialogPanelY: 700, // Will be calculated
    dialogPanelLeft: 50,
    dialogPanelRight: 20,

    // Character
    characterX: 400,
    characterY: 1000,

    // Staging area
    stagingAreaX: 200,
    stagingAreaY: 300,
    stagingAreaWidth: 300,
    stagingAreaHeight: 225
  };

  private ulekanConfig = {
    x: 0,
    y: 0
  };

  // Game steps for Colo-Colo
  private gameSteps: GameStep[] = [
    {
      id: 1,
      text: "Selamat datang kembali, Koki! Mari kita buat Sambal Colo-colo. Pertama, siapkan talenan dan potong cabai rawit.",
      character: "karakter1",
      isCompleted: false
    },
    {
      id: 2,
      text: "Bagus! Sekarang, potong bawang putih di atas talenan.",
      character: "karakter2",
      isCompleted: false
    },
    {
      id: 3,
      text: "Selanjutnya, tuangkan kecap ke dalam mangkok. Setelah itu, klik talenan lalu klik mangkok untuk memindahkan bahan-bahan yang sudah dipotong.",
      character: "karakter3",
      isCompleted: false
    },
    {
      id: 4,
      text: "Tambahkan daun jeruk untuk aroma yang lebih segar.",
      character: "karakter4",
      isCompleted: false
    },
    {
      id: 5,
      text: "Peras jeruk nipis ke dalam mangkok untuk sentuhan rasa asam.",
      character: "karakter5",
      isCompleted: false
    },
    {
      id: 6,
      text: "Ambil munthu dan ulek semua bahan di dalam mangkok hingga tercampur rata.",
      character: "karakter1",
      isCompleted: false
    },
    {
      id: 7,
      text: "Luar biasa! Sambal colo-colo kecapmu sudah jadi. Saatnya disajikan!",
      character: "karakter2",
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
    
    // Load food image for hint popup
    this.load.image('colocolo_food', '/assets/makanan/colocolo.png');
    this.load.image('telenan_cabai_bawang_putih', '/assets/foods/colo_colo/TelenanCabaiBawangPutih.png');
    this.load.image('telenan_cabai_bawang_potong', '/assets/foods/colo_colo/TelenanCabaiBawangPotong.png');
    
    // Preload additional assets
    this.load.image('Pisau', '/assets/foods/colo_colo/Pisau.png');

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
    this.setupInteractions();

    // Update step display
    this.updateStepDisplay();

    // Add hint button
    this.createHintButton();
  }

  private calculateLayout() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Calculate ingredients panel position
    this.layoutConfig.ingredientsPanelX = gameWidth - this.layoutConfig.ingredientsPanelWidth - 15;
    
    // Calculate dialog panel position
        this.layoutConfig.dialogPanelY = gameHeight - this.layoutConfig.dialogPanelHeight - 100;
    
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
    const cookingAreaCenterX = (this.cameras.main.width - this.layoutConfig.ingredientsPanelWidth) / 2;
    const cookingAreaCenterY = (this.cameras.main.height / 2) + 50; // Adjusted Y position

    // Position telenan to the left-center
    const telenanX = cookingAreaCenterX - 250; // Adjusted X position
    this.gameObjects.telenan = this.add.image(telenanX, cookingAreaCenterY, 'telenan');
    this.gameObjects.telenan.setInteractive({ dropZone: true });
    this.gameObjects.telenan.setScale(0.6);
    this.gameObjects.telenan.setData('type', 'telenan');
    this.gameObjects.telenan.setData('currentState', 'telenan');
    this.gameObjects.telenan.setData('homeX', telenanX);
    this.gameObjects.telenan.setData('homeY', cookingAreaCenterY);

    // Position ulekan to the right of telenan, initially hidden
    const ulekanX = telenanX + 500; // Adjusted X position for more distance
    this.ulekanConfig.x = ulekanX - 75;
    this.ulekanConfig.y = cookingAreaCenterY - 100;
    this.gameObjects.ulekan = this.add.image(this.ulekanConfig.x, this.ulekanConfig.y, 'ulekan');
    this.gameObjects.ulekan.setOrigin(0, 0); // Set origin to top-left for positional consistency
    this.gameObjects.ulekan.setScale(0.5);
    this.gameObjects.ulekan.setInteractive({ dropZone: true });
    this.gameObjects.ulekan.setVisible(false);
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
      { key: "cabai", name: "Cabai", scale: 0.2 },
      { key: "bawang_putih", name: "Bawang Putih", scale: 0.2 },
      { key: "daun_jeruk", name: "Daun Jeruk", scale: 0.2 },
      { key: "jeruk_nipis", name: "Jeruk Nipis", scale: 0.2 },
      { key: "kecap", name: "Kecap", scale: 0.2 },
      { key: "munthu", name: "Munthu", scale: 0.2 },
      { key: "Pisau", name: "Pisau", scale: 0.2 },
      { key: "piring_colo_colo", name: "Piring", scale: 0.2 }
    ];

    // --- Dynamic Centered Grid Layout ---
    const panelWidth = this.layoutConfig.ingredientsPanelWidth;
    const panelHeight = this.layoutConfig.ingredientsPanelHeight;
    const titleAreaHeight = 80; // Space for the title

    const itemsPerRow = 2;
    const numRows = Math.ceil(ingredients.length / itemsPerRow);

    const itemCell = { width: 140, height: 120 }; // Width and height of the area for each item
    const gridPadding = { horizontal: 20, vertical: 20 }; // Padding around the entire grid

    const gridWidth = (itemsPerRow * itemCell.width);
    const gridHeight = (numRows * itemCell.height);

    const startX = (panelWidth - gridWidth) / 2;
    const startY = titleAreaHeight + (panelHeight - titleAreaHeight - gridHeight) / 2;

    ingredients.forEach((ingredient, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      
      const x = startX + (col * itemCell.width) + (itemCell.width / 2);
      const y = startY + (row * itemCell.height) + (itemCell.height / 2);

      // Item background
      const itemBg = this.add.graphics();
      itemBg.fillStyle(0x000000, 0.25);
      itemBg.fillRoundedRect(x - 55, y - 45, 110, 90, 12);
      itemBg.lineStyle(1, 0x8B4513, 0.4);
      itemBg.strokeRoundedRect(x - 55, y - 45, 110, 90, 12);
      this.ingredientsPanel.add(itemBg);

      // Item image
      const item = this.add.image(x, y - 10, ingredient.key)
        .setInteractive()
        .setScale(ingredient.scale)
        .setName(ingredient.key);

      this.ingredientItems.push(item);
      this.input.setDraggable(item);
      this.ingredientsPanel.add(item);

      // Item label
      const label = this.add.text(x, y + 35, ingredient.name, {
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
        itemBg.fillRoundedRect(x - 55, y - 45, 110, 90, 12);
        itemBg.lineStyle(1, 0xFFD700, 0.6);
        itemBg.strokeRoundedRect(x - 55, y - 45, 110, 90, 12);
      });

      item.on('pointerout', () => {
        item.setScale(ingredient.scale);
        label.setColor('#FFE4B5');
        itemBg.clear();
        itemBg.fillStyle(0x000000, 0.25);
        itemBg.fillRoundedRect(x - 55, y - 45, 110, 90, 12);
        itemBg.lineStyle(1, 0x8B4513, 0.4);
        itemBg.strokeRoundedRect(x - 55, y - 45, 110, 90, 12);
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
    progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 18, (dialogWidth - 40) * 0.2, 6, 3);
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
      progressBar.fillRoundedRect(20, this.layoutConfig.dialogPanelHeight - 18, (dialogWidth - 40) * progressPercentage, 6, 3);
    }
  }

  private nextStep() {
    if (this.currentStep < this.gameSteps.length - 1) {
      this.gameSteps[this.currentStep].isCompleted = true;
      this.currentStep++;
      this.updateStepDisplay();
      this.showSuccessFeedback();

      // When we reach step 3 (index 2), make the ulekan visible
      if (this.currentStep === 2) {
        this.gameObjects.ulekan.setVisible(true);
        this.tweens.add({
            targets: this.gameObjects.ulekan,
            alpha: { from: 0, to: 1 },
            duration: 500
        });
      }

    } else if (this.currentStep === this.gameSteps.length - 1) {
      this.gameSteps[this.currentStep].isCompleted = true;
      this.showCompletionCelebration();
    }
  }

  private setupInteractions() {
    // General drag and drop for ingredients from the panel
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      this.children.bringToTop(gameObject);
      gameObject.setTint(0x00ff00);
      // Store original position
      gameObject.setData('dragStartX', gameObject.x);
      gameObject.setData('dragStartY', gameObject.y);
    });

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    
    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
        gameObject.clearTint();
        if (!dropped) {
            this.resetIngredientPosition(gameObject);
        }
    });

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
        const ingredientType = gameObject.name;

        const telenanBounds = this.gameObjects.telenan.getBounds();
        const ulekanBounds = this.gameObjects.ulekan.getBounds();
        const gameObjectBounds = gameObject.getBounds();

        // Check for drop on telenan for regular ingredients
        if (Phaser.Geom.Intersects.RectangleToRectangle(gameObjectBounds, telenanBounds)) {
            if (ingredientType !== 'telenan_full') { // Ensure we don't drop telenan on itself
                this.handleTelenanDrop(ingredientType, gameObject);
                return;
            }
        }

        // Check for drop on ulekan for regular ingredients
        if (this.gameObjects.ulekan.visible && Phaser.Geom.Intersects.RectangleToRectangle(gameObjectBounds, ulekanBounds)) {
            this.handleUlekanDrop(ingredientType, gameObject);
            return;
        }

        // If not dropped on any valid zone, reset position
        this.resetIngredientPosition(gameObject);
    });

    // Click handlers for the new tap-to-transfer system
    this.gameObjects.telenan.on('pointerdown', () => this.handleTelenanClick());
    this.gameObjects.ulekan.on('pointerdown', () => this.handleUlekanClick());
  }

  private handleTelenanClick() {
    // Only allow selecting the telenan at the right step and state
    if (this.currentStep === 2 && this.gameState.telenanState === 'telenan_cabai_bawang_potong') {
        this.telenanSelected = true;
        this.gameObjects.telenan.setTint(0x00ff00); // Highlight tint
    }
  }

  private handleUlekanClick() {
    // Check if the telenan has been selected first, and it's the right step and state
    if (this.telenanSelected && this.currentStep === 2 && this.gameState.ulekanState === 'ulekan_kecap') {
        // Transfer ingredients
        this.transformUlekan('ulekan_cabe_bawang');
        this.gameObjects.telenan.setVisible(false).setActive(false);
        
        // Reset selection state
        this.telenanSelected = false;
        this.gameObjects.telenan.clearTint();

        this.nextStep(); // Advance to step 4 (daun jeruk)
    }
  }

  private handleTelenanDrop(ingredientType: string, ingredientObject: Phaser.GameObjects.Image) {
    console.log(`handleTelenanDrop called with: ${ingredientType}, current step: ${this.currentStep}, telenan state: ${this.gameState.telenanState}`);

    // Step 1: Place chili, then cut
    if (this.currentStep === 0) {
        if (ingredientType === 'cabai' && this.gameState.telenanState === 'telenan') {
            this.transformTelenan('telenan_cabai');
            this.hideIngredient('cabai');
            ingredientObject.destroy();
        } else if (ingredientType === 'Pisau' && this.gameState.telenanState === 'telenan_cabai') {
            this.animatePisauCut(ingredientObject, () => {
                this.transformTelenan('telenan_cabai_potong');
                this.resetIngredientPosition(ingredientObject);
                this.nextStep();
            });
        } else {
            this.handleIncorrectDrop(ingredientObject);
        }
    } 
    // Step 2: Place garlic, then cut
    else if (this.currentStep === 1) {
        if (ingredientType === 'bawang_putih' && this.gameState.telenanState === 'telenan_cabai_potong') {
            this.transformTelenan('telenan_cabai_bawang_putih');
            this.hideIngredient('bawang_putih');
            ingredientObject.destroy();
        } else if (ingredientType === 'Pisau' && this.gameState.telenanState === 'telenan_cabai_bawang_putih') {
            this.animatePisauCut(ingredientObject, () => {
                this.transformTelenan('telenan_cabai_bawang_potong');
                this.resetIngredientPosition(ingredientObject);
                // ** CHANGE: No longer making it draggable. It's now clickable. **
                this.nextStep();
            });
        } else {
            this.handleIncorrectDrop(ingredientObject);
        }
    } else {
        this.handleIncorrectDrop(ingredientObject);
    }
  }

  private handleUlekanDrop(ingredientType: string, ingredientObject: Phaser.GameObjects.Image) {
    console.log(`handleUlekanDrop called with: ${ingredientType}, current ulekan state: ${this.gameState.ulekanState}`);

    // Step 3 Part 1: Add kecap
    if (ingredientType === 'kecap' && this.gameState.ulekanState === 'ulekan' && this.currentStep === 2) {
      this.transformUlekan('ulekan_kecap');
      this.hideIngredient('kecap');
      ingredientObject.destroy();
      // NOTE: The click interaction for telenan is now the next logical step for the user
    } 
    // Step 4: Add daun jeruk
    else if (ingredientType === 'daun_jeruk' && this.gameState.ulekanState === 'ulekan_cabe_bawang' && this.currentStep === 3) {
      this.transformUlekan('ulekan_daun');
      this.hideIngredient('daun_jeruk');
      ingredientObject.destroy();
      this.nextStep(); // Advance to step 5 (jeruk nipis)
    }
    // Step 5: Add jeruk nipis
    else if (ingredientType === 'jeruk_nipis' && this.gameState.ulekanState === 'ulekan_daun' && this.currentStep === 4) {
      this.transformUlekan('ulekan_nipis');
      this.hideIngredient('jeruk_nipis');
      ingredientObject.destroy();
      this.nextStep(); // Advance to step 6 (munthu)
    } 
    // Step 6: Ulek with munthu
    else if (ingredientType === 'munthu' && this.gameState.ulekanState === 'ulekan_nipis' && this.currentStep === 5) {
        this.animateMunthuUlek(ingredientObject, () => {
            // The transformUlekan is now handled inside the animation function
            this.resetIngredientPosition(ingredientObject);
            this.nextStep(); // Advance to plating
        });
    }
    // Step 7: Plating
    else if (ingredientType === 'piring_colo_colo' && this.gameState.ulekanState === 'ulekan_munthu' && this.currentStep === 6) {
      this.completeColoColo();
      this.hideIngredient('piring_colo_colo');
      ingredientObject.destroy();
      this.nextStep(); // Complete the recipe
    } 
    // Invalid action
    else {
      this.handleIncorrectDrop(ingredientObject);
    }
  }

  private transformTelenan(newState: string) {
    console.log(`Transforming telenan from ${this.gameState.telenanState} to ${newState}`);
    this.gameObjects.telenan.setTexture(newState);
    this.gameObjects.telenan.setScale(0.6);
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

  private resetIngredientPosition(gameObject: Phaser.GameObjects.Image) {
    let x, y;

    // If the object is the telenan, return it to its home position
    if (gameObject.name === 'telenan_full') {
        x = gameObject.getData('homeX');
        y = gameObject.getData('homeY');
    } else {
        // Otherwise, return to where the drag started
        x = gameObject.getData('dragStartX');
        y = gameObject.getData('dragStartY');
    }

    this.tweens.add({
      targets: gameObject,
      x: x,
      y: y,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  private handleIncorrectDrop(gameObject: Phaser.GameObjects.Image) {
    // Shake the camera
    this.cameras.main.shake(200, 0.01);

    // Vibrate the game object
    this.tweens.add({
        targets: gameObject,
        x: gameObject.x + 10,
        yoyo: true,
        repeat: 5,
        duration: 30,
        ease: 'Sine.easeInOut',
        onComplete: () => {
            // Return to original position after shaking
            this.resetIngredientPosition(gameObject);
        }
    });
  }

  private animatePisauCut(pisau: Phaser.GameObjects.Image, onComplete: () => void) {
    this.tweens.add({
        targets: pisau,
        x: this.gameObjects.telenan.x,
        y: this.gameObjects.telenan.y - 20, // Start slightly above
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
            this.tweens.add({
                targets: pisau,
                y: this.gameObjects.telenan.y + 20, // Move down
                duration: 150,
                ease: 'Sine.easeInOut',
                yoyo: true, // Go back up
                repeat: 2, // Repeat 2 times for 3 cuts total
                onComplete: () => {
                    onComplete();
                }
            });
        }
    });
  }

  private animateMunthuUlek(munthu: Phaser.GameObjects.Image, onComplete: () => void) {
    // First, move the munthu to the ulekan
    this.tweens.add({
        targets: munthu,
        x: this.gameObjects.ulekan.x,
        y: this.gameObjects.ulekan.y - 50, // Position it above the ulekan
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
            // Hide the original munthu image from the panel
            this.hideIngredient('munthu');
            munthu.setVisible(false);

            // Start the ulek animation with the ulekan itself
            const ulekAnimTextures = ['ulekan_munthu', 'ulekan_munthu2'];
            let textureIndex = 0;
            const ulekAnimation = this.time.addEvent({
                delay: 200, // Speed of the ulek animation
                callback: () => {
                    this.gameObjects.ulekan.setTexture(ulekAnimTextures[textureIndex % ulekAnimTextures.length]);
                    textureIndex++;
                },
                repeat: 5 // Number of ulek movements (total 6 frames)
            });

            // After the animation, set the final state and call the callback
            const duration = ulekAnimation.delay * (ulekAnimation.repeatCount + 1);
            this.time.delayedCall(duration, () => {
                ulekAnimation.destroy();
                this.transformUlekan('ulekan_munthu');
                this.gameObjects.ulekan.setScale(0.5); // Maintain consistent scale
                onComplete();
            });
        }
    });
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
    // This function is now empty to prevent showing text feedback
  }

  private showUlekanTransformationFeedback(newState: string) {
    // This function is now empty to prevent showing text feedback
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
      
      // Game completed - could add completion logic here if needed
    });
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
    const title = this.add.text(0, -popupHeight / 2 + 45, 'Colo-Colo', {
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
    const colocoloContent = `Colo-colo adalah sambal khas Maluku yang memiliki cita rasa pedas dan segar. Sambal ini terbuat dari campuran cabai rawit merah, bawang merah, tomat, dan garam yang diulek kasar hingga tercampur rata. Yang membuat colo-colo unik adalah teksturnya yang tidak terlalu halus, sehingga masih terasa potongan-potongan kecil dari bahan-bahannya. Kadang-kadang ditambahkan perasan jeruk nipis atau jeruk lemon untuk memberikan rasa asam segar yang menyeimbangkan rasa pedasnya. Colo-colo biasanya disajikan sebagai pelengkap berbagai makanan khas Maluku seperti ikan bakar, papeda, atau nasi putih. Sambal ini sangat digemari karena kesegaran dan rasa pedasnya yang khas, serta kemudahan dalam pembuatannya yang tidak memerlukan proses memasak.`;
    
    // Add the main text directly to popup
    const text = this.add.text(textStartX, textStartY, colocoloContent, {
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

  update() {
    // Game logic updates
  }
}
