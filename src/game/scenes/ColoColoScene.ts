// src/game/scenes/ColoColoScene.ts
import Phaser from 'phaser';

export default class ColoColoScene extends Phaser.Scene {
  private gameObjects: { [key: string]: Phaser.GameObjects.Image } = {};
  private pisauArea: Phaser.GameObjects.Rectangle;
  private isDragging: boolean = false;
  private dragTarget: Phaser.GameObjects.Image | null = null;
  private gameState: {
    telenanState: string;
    ulekanState: string;
    hasPisau: boolean;
    hasBawangPutih: boolean;
    hasCabai: boolean;
    hasDaunJeruk: boolean;
    hasJerukNipis: boolean;
    hasMunthu: boolean;
    hasKecap: boolean;
    hasPiring: boolean;
  };

  constructor() {
    super('ColoColoScene');
  }

  preload() {
    // Preload assets for Colo-Colo here
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
    this.load.image('telenan_cabai_bawang_putih', '/assets/foods/colo_colo/TelenanCabaiBawangPutih.png');
    this.load.image('telenan_cabai_bawang_potong', '/assets/foods/colo_colo/TelenanCabaiBawangPotong.png');
    
    // Preload additional assets
    this.load.image('Pisau', '/assets/foods/colo_colo/Pisau.png');
  }

  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Initialize game state
    this.gameState = {
      telenanState: 'telenan',
      ulekanState: 'ulekan',
      hasPisau: false,
      hasBawangPutih: false,
      hasCabai: false,
      hasDaunJeruk: false,
      hasJerukNipis: false,
      hasMunthu: false,
      hasKecap: false,
      hasPiring: false
    };

    // Create initial telenan (cutting board) - left side
    this.gameObjects.telenan = this.add.image(200, 400, 'telenan');
    this.gameObjects.telenan.setInteractive({ draggable: true });
    this.gameObjects.telenan.setScale(0.6);
    this.gameObjects.telenan.setData('type', 'telenan');
    this.gameObjects.telenan.setData('currentState', 'telenan');

    // Create ulekan (mortar and pestle) - left side
    this.gameObjects.ulekan = this.add.image(200, 600, 'ulekan');
    this.gameObjects.ulekan.setInteractive({ draggable: true });
    this.gameObjects.ulekan.setScale(0.6);

    // Create ingredient objects - right side vertical layout
    this.createIngredient('cabai', 700, 150, 0.4);
    this.createIngredient('bawang_putih', 700, 220, 0.4);
    this.createIngredient('daun_jeruk', 700, 290, 0.4);
    this.createIngredient('jeruk_nipis', 700, 360, 0.4);
    this.createIngredient('kecap', 700, 430, 0.4);
    this.createIngredient('munthu', 700, 500, 0.4);
    this.createIngredient('piring_colo_colo', 700, 570, 0.4);

    // Create knife area and knife object - right side
    this.createPisauArea();
    this.createPisauObject();

    // Set up drag and drop events
    this.setupDragAndDrop();

    // Add instruction text
    this.add.text(400, 100, 'Drag ingredients to telenan and ulekan!', {
      font: '24px Chewy',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Add back button
    this.createBackButton();
  }

  private createIngredient(key: string, x: number, y: number, scale: number = 1) {
    this.gameObjects[key] = this.add.image(x, y, key);
    this.gameObjects[key].setInteractive({ draggable: true });
    this.gameObjects[key].setScale(scale);
    this.gameObjects[key].setData('type', key);
  }

  private createPisauArea() {
    // Create knife area with actual knife image - right side
    this.pisauArea = this.add.rectangle(800, 200, 80, 80, 0x00ff00, 0.3);
    this.pisauArea.setInteractive();
    this.pisauArea.setData('type', 'pisau');
    
    // Add actual knife image on top of the area
    const pisauImage = this.add.image(800, 200, 'Pisau');
    pisauImage.setScale(0.4);
    pisauImage.setData('type', 'pisau_image');
    
    // Add text to show it's a knife area
    this.add.text(800, 200, 'PISAU\n(Knife)', {
      font: '14px Chewy',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5);
  }

  private createPisauObject() {
    // Create a draggable knife object that can be used for cutting - right side
    this.gameObjects.pisau = this.add.image(750, 200, 'Pisau');
    this.gameObjects.pisau.setInteractive({ draggable: true });
    this.gameObjects.pisau.setScale(0.4);
    this.gameObjects.pisau.setData('type', 'pisau_object');
    
    // Add cutting animation when knife is used
    this.gameObjects.pisau.on('pointerdown', () => {
      this.animatePisauCut();
    });
  }

  private setupDragAndDrop() {
    this.input.on('dragstart', (pointer: any, gameObject: Phaser.GameObjects.Image) => {
      this.isDragging = true;
      this.dragTarget = gameObject;
      gameObject.setTint(0x00ff00);
    });

    this.input.on('drag', (pointer: any, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer: any, gameObject: Phaser.GameObjects.Image) => {
      this.isDragging = false;
      gameObject.clearTint();
      
      // Check for valid drop targets
      this.checkDropTarget(gameObject);
      
      // Reset position if not dropped on valid target
      if (!this.isValidDrop(gameObject)) {
        this.resetIngredientPosition(gameObject);
      }
    });
  }

  private checkDropTarget(gameObject: Phaser.GameObjects.Image) {
    const type = gameObject.getData('type');
    const currentState = gameObject.getData('currentState');
    
    // Check if dropped on telenan
    if (this.isNear(gameObject, this.gameObjects.telenan, 100)) {
      this.handleTelenanDrop(type);
    }
    
    // Check if dropped on ulekan
    if (this.isNear(gameObject, this.gameObjects.ulekan, 100)) {
      // Use currentState if available, otherwise use type
      const dropType = currentState || type;
      this.handleUlekanDrop(dropType);
    }
    
    // Pisau area hanya untuk visual, tidak untuk logic cutting
    // Logika cutting sekarang ada di handleTelenanDrop
  }

  private handleTelenanDrop(ingredientType: string) {
    console.log(`handleTelenanDrop called with: ${ingredientType}, current state: ${this.gameState.telenanState}`);
    
    if (ingredientType === 'cabai' && this.gameState.telenanState === 'telenan') {
      console.log('Cabai ditambahkan ke telenan');
      this.transformTelenan('telenan_cabai');
      this.gameState.hasCabai = true;
      this.hideIngredient('cabai');
    } else if (ingredientType === 'bawang_putih' && this.gameState.telenanState === 'telenan_cabai_potong') {
      console.log('Bawang putih ditambahkan ke telenan_cabai_potong');
      this.transformTelenan('telenan_cabai_bawang_putih');
      this.gameState.hasBawangPutih = true;
      this.hideIngredient('bawang_putih');
    } else if (ingredientType === 'pisau_object' && this.gameState.telenanState === 'telenan_cabai') {
      // Pisau di-drop ke telenan_cabai untuk memotong
      console.log('Pisau memotong telenan_cabai!');
      this.transformTelenan('telenan_cabai_potong');
      this.gameState.hasPisau = true;
      this.animatePisauCut();
      this.showCuttingFeedback();
    } else if (ingredientType === 'pisau_object' && this.gameState.telenanState === 'telenan_cabai_bawang_putih') {
      // Pisau di-drop ke telenan_cabai_bawang_putih untuk memotong
      console.log('Pisau memotong telenan_cabai_bawang_putih!');
      this.transformTelenan('telenan_cabai_bawang_potong');
      this.gameState.hasPisau = true;
      this.animatePisauCut();
      this.showCuttingFeedback();
    } else {
      console.log(`Invalid combination: ${ingredientType} with state ${this.gameState.telenanState}`);
    }
  }

  private handleUlekanDrop(ingredientType: string) {
    console.log(`handleUlekanDrop called with: ${ingredientType}, current ulekan state: ${this.gameState.ulekanState}`);
    
    if (ingredientType === 'kecap' && this.gameState.ulekanState === 'ulekan') {
      console.log('Kecap ditambahkan ke ulekan');
      this.transformUlekan('ulekan_kecap');
      this.gameState.hasKecap = true;
      this.hideIngredient('kecap');
    } else if (ingredientType === 'daun_jeruk' && (this.gameState.ulekanState === 'ulekan_kecap' || this.gameState.ulekanState === 'ulekan_cabe_bawang')) {
      console.log('Daun jeruk ditambahkan ke ulekan');
      this.transformUlekan('ulekan_daun');
      this.gameState.hasDaunJeruk = true;
      this.hideIngredient('daun_jeruk');
    } else if (ingredientType === 'jeruk_nipis' && (this.gameState.ulekanState === 'ulekan_daun' || this.gameState.ulekanState === 'ulekan_cabe_bawang')) {
      console.log('Jeruk nipis ditambahkan ke ulekan');
      this.transformUlekan('ulekan_nipis');
      this.gameState.hasJerukNipis = true;
      this.hideIngredient('jeruk_nipis');
    } else if (ingredientType === 'munthu' && this.gameState.ulekanState === 'ulekan_nipis') {
      console.log('Munthu ditambahkan ke ulekan_nipis');
      this.startMunthuAnimation();
      this.gameState.hasMunthu = true;
      this.hideIngredient('munthu');
    } else if (ingredientType === 'piring_colo_colo' && this.gameState.ulekanState === 'ulekan_munthu2') {
      console.log('Piring colo-colo ditambahkan ke ulekan_munthu2');
      this.completeColoColo();
      this.gameState.hasPiring = true;
      this.hideIngredient('piring_colo_colo');
    } else if (ingredientType === 'telenan_cabai_bawang_potong' && this.gameState.ulekanState === 'ulekan_kecap') {
      // Telenan_cabai_bawang_potong di-drop ke ulekan_kecap untuk menjadi ulekan_cabe_bawang
      console.log('Telenan_cabai_bawang_potong di-drop ke ulekan_kecap!');
      this.transformUlekan('ulekan_cabe_bawang');
      this.hideTelenan();
      this.showUlekanTransformationFeedback('ulekan_cabe_bawang');
    } else {
      console.log(`Invalid combination for ulekan: ${ingredientType} with state ${this.gameState.ulekanState}`);
    }
  }

  // handlePisauDrop dihapus karena logika cutting sekarang ada di handleTelenanDrop
  // Pisau area hanya untuk visual, tidak untuk logic cutting

  private transformTelenan(newState: string) {
    console.log(`Transforming telenan from ${this.gameState.telenanState} to ${newState}`);
    this.gameObjects.telenan.setTexture(newState);
    this.gameState.telenanState = newState;
    
    // Update telenan data to reflect new state
    this.gameObjects.telenan.setData('currentState', newState);
    
    // Show transformation feedback
    this.showTransformationFeedback(newState);
  }

  private transformUlekan(newState: string) {
    console.log(`Transforming ulekan from ${this.gameState.ulekanState} to ${newState}`);
    this.gameObjects.ulekan.setTexture(newState);
    this.gameState.ulekanState = newState;
    
    // Show ulekan transformation feedback
    this.showUlekanTransformationFeedback(newState);
  }

  private startMunthuAnimation() {
    // Start the rotating animation
    this.transformUlekan('ulekan_munthu');
    
    // Create rotation animation
    this.tweens.add({
      targets: this.gameObjects.ulekan,
      angle: 360,
      duration: 1000,
      ease: 'Linear',
      onComplete: () => {
        this.transformUlekan('ulekan_munthu2');
        this.gameObjects.ulekan.setAngle(0);
      }
    });
  }

  private completeColoColo() {
    // Show completion message
    this.add.text(400, 300, 'Colo-Colo Selesai!', {
      font: '48px Chewy',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    // Transform to finished colo-colo
    this.gameObjects.ulekan.setTexture('colo_colo_finished');
    this.gameState.ulekanState = 'colo_colo_finished';
  }

  private hideIngredient(ingredientType: string) {
    if (this.gameObjects[ingredientType]) {
      this.gameObjects[ingredientType].setVisible(false);
    }
  }

  private isNear(obj1: Phaser.GameObjects.Image, obj2: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle, distance: number): boolean {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy) < distance;
  }

  private isValidDrop(gameObject: Phaser.GameObjects.Image): boolean {
    // Check if dropped on any valid target
    return this.isNear(gameObject, this.gameObjects.telenan, 100) ||
           this.isNear(gameObject, this.gameObjects.ulekan, 100) ||
           this.isNear(gameObject, this.pisauArea, 100);
  }

  private resetIngredientPosition(gameObject: Phaser.GameObjects.Image) {
    const type = gameObject.getData('type');
    // Reset to original position based on type - right side vertical layout
    const positions: { [key: string]: { x: number, y: number } } = {
      'cabai': { x: 700, y: 150 },
      'bawang_putih': { x: 700, y: 220 },
      'daun_jeruk': { x: 700, y: 290 },
      'jeruk_nipis': { x: 700, y: 360 },
      'kecap': { x: 700, y: 430 },
      'munthu': { x: 700, y: 500 },
      'piring_colo_colo': { x: 700, y: 570 },
      'pisau_object': { x: 750, y: 200 }
    };
    
    if (positions[type]) {
      gameObject.x = positions[type].x;
      gameObject.y = positions[type].y;
    }
  }

  private createBackButton() {
    // Create back button in top-left corner
    const backButton = this.add.text(50, 50, '← Back', {
      font: '24px Chewy',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    });
    
    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      // Navigate back to SelectFood page
      if (typeof window !== 'undefined') {
        window.location.href = '/SelectFood';
      }
    });
    
    backButton.on('pointerover', () => {
      backButton.setStyle({ backgroundColor: '#333333' });
    });
    
    backButton.on('pointerout', () => {
      backButton.setStyle({ backgroundColor: '#000000' });
    });
  }

  private animatePisauCut() {
    // Animate the knife cutting motion
    if (this.gameObjects.pisau) {
      this.tweens.add({
        targets: this.gameObjects.pisau,
        angle: 15,
        duration: 100,
        ease: 'Power2',
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          this.gameObjects.pisau.setAngle(0);
        }
      });
    }
  }

  private showCuttingFeedback() {
    // Show visual feedback that cutting was successful
    const feedbackText = this.add.text(400, 350, '✓ Berhasil Dipotong!', {
      font: '24px Chewy',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5);
    
    // Remove feedback after 2 seconds
    this.time.delayedCall(2000, () => {
      feedbackText.destroy();
    });
  }

  private showTransformationFeedback(newState: string) {
    // Show visual feedback for telenan transformation
    let message = '';
    let color = '#00ff00';
    
    switch (newState) {
      case 'telenan_cabai':
        message = 'Cabai ditambahkan ke telenan';
        break;
      case 'telenan_cabai_potong':
        message = 'Cabai berhasil dipotong!';
        color = '#ff6600';
        break;
      case 'telenan_cabai_bawang_putih':
        message = 'Bawang putih ditambahkan';
        break;
      case 'telenan_cabai_bawang_potong':
        message = 'Bawang putih berhasil dipotong!';
        color = '#ff6600';
        break;
      default:
        message = 'Telenan berubah';
    }
    
    const feedbackText = this.add.text(400, 380, message, {
      font: '20px Chewy',
      color: color,
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // Remove feedback after 2 seconds
    this.time.delayedCall(2000, () => {
      feedbackText.destroy();
    });
  }

  private hideTelenan() {
    // Hide the telenan after it's been used in ulekan
    if (this.gameObjects.telenan) {
      this.gameObjects.telenan.setVisible(false);
    }
  }

  private showUlekanTransformationFeedback(newState: string) {
    // Show visual feedback for ulekan transformation
    let message = '';
    let color = '#00ff00';
    
    switch (newState) {
      case 'ulekan_kecap':
        message = 'Kecap ditambahkan ke ulekan!';
        color = '#8B4513';
        break;
      case 'ulekan_cabe_bawang':
        message = 'Cabai dan bawang putih ditambahkan ke ulekan!';
        color = '#ff6600';
        break;
      case 'ulekan_daun':
        message = 'Daun jeruk ditambahkan ke ulekan!';
        color = '#228B22';
        break;
      case 'ulekan_nipis':
        message = 'Jeruk nipis ditambahkan ke ulekan!';
        color = '#FFA500';
        break;
      case 'ulekan_munthu':
        message = 'Munthu ditambahkan ke ulekan!';
        color = '#8B4513';
        break;
      case 'ulekan_munthu2':
        message = 'Munthu selesai diulek!';
        color = '#8B4513';
        break;
      default:
        message = 'Ulekan berubah';
    }
    
    const feedbackText = this.add.text(400, 420, message, {
      font: '20px Chewy',
      color: color,
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);
    
    // Remove feedback after 2 seconds
    this.time.delayedCall(2000, () => {
      feedbackText.destroy();
    });
  }

  update() {
    // Add game logic here
  }
}
