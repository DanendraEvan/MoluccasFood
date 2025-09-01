// src/game/scenes/IkanKuahKuningScene.ts
import Phaser from 'phaser';

export default class IkanKuahKuningScene extends Phaser.Scene {
  private gameObjects: { [key: string]: Phaser.GameObjects.Image } = {};
  private progressText: Phaser.GameObjects.Text | null = null;
  private wajanArea: Phaser.GameObjects.Rectangle;
  private isDragging: boolean = false;
  private dragTarget: Phaser.GameObjects.Image | null = null;
  private gameState: {
    wajanState: string;
    ulekanState: string;
    hasBawangPutih: boolean;
    hasBawangMerah: boolean;
    hasCabai: boolean;
    hasKunyit: boolean;
    hasLengkuas: boolean;
    hasJahe: boolean;
    hasDaunSalam: boolean;
    hasDaunSerai: boolean;
    hasDaunJeruk: boolean;
    hasAsamJawa: boolean;
    hasGaram: boolean;
    hasGula: boolean;
    hasDagingIkan: boolean;
    hasAir: boolean;
    hasTomat: boolean;
    hasDaunBawang: boolean;
    hasMunthu: boolean;
    hasMangkuk: boolean;
  };

  constructor() {
    super('IkanKuahKuningScene');
  }

  preload() {
    // Preload background
    this.load.image('background', '/assets/backgrounds/kitchen.png');
    
    // Preload hasil masakan selesai
    this.load.image('ikan_kuah_kuning_finished', '/assets/foods/ikan_kuahkuning/Ikan Kuah Kuning.png');
    this.load.image('mangkuk_coklat', '/assets/foods/ikan_kuahkuning/MangkukCoklat.png');
    
    // ===== PRELOAD BAHAN-BAHAN =====
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
    
    // Bahan pelengkap
    this.load.image('munthu', '/assets/foods/ikan_kuahkuning/Munthu 3.png');
    
    // ===== PRELOAD TOOLS/PERALATAN =====
    // Ulekan dan bumbu halus
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
  }

  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Initialize game state
    this.gameState = {
      wajanState: 'wajan',
      ulekanState: 'ulekan',
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
      hasMunthu: false,
      hasMangkuk: false
    };

    // Create initial wajan (pan) - left side
    this.gameObjects.wajan = this.add.image(200, 400, 'wajan');
    this.gameObjects.wajan.setInteractive({ draggable: true });
    this.gameObjects.wajan.setScale(0.6);
    this.gameObjects.wajan.setData('type', 'wajan');
    this.gameObjects.wajan.setData('currentState', 'wajan');

    // Create kompor (stove) below wajan
    this.createKompor();

    // Create ulekan (mortar and pestle) - left side
    this.gameObjects.ulekan = this.add.image(200, 600, 'ulekan');
    this.gameObjects.ulekan.setInteractive({ draggable: true });
    this.gameObjects.ulekan.setScale(0.6);

    // Create ingredient objects - right side vertical layout
    this.createIngredient('bawang_putih', 700, 150, 0.4);
    this.createIngredient('bawang_merah', 700, 220, 0.4);
    this.createIngredient('cabai', 700, 290, 0.4);
    this.createIngredient('kunyit', 700, 360, 0.4);
    this.createIngredient('daun_salam', 700, 430, 0.4);
    this.createIngredient('lengkuas', 700, 500, 0.4);
    this.createIngredient('daun_serai', 700, 570, 0.4);
    this.createIngredient('daging_ikan', 700, 640, 0.4);
    this.createIngredient('air', 700, 710, 0.4);
    this.createIngredient('daun_jeruk', 700, 180, 0.4);
    this.createIngredient('jahe', 750, 130, 0.4);
    this.createIngredient('garam', 750, 150, 0.4);
    this.createIngredient('gula', 750, 220, 0.4);
    this.createIngredient('tomat', 700, 200, 0.4);
    this.createIngredient('daun_bawang', 700, 130, 0.4);
    this.createIngredient('asam_jawa', 750, 290, 0.4);
    // this.createIngredient('munthu', 700, 1270, 0.4);
    this.createIngredient('mangkuk_coklat', 750, 640, 0.4);

    // Create wajan area - right side
    this.createWajanArea();

    // Set up drag and drop events
    this.setupDragAndDrop();

    // Add instruction text
    this.add.text(400, 100, 'Drag ingredients to ulekan first, then to wajan!', {
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

  private createKompor() {
    // Create kompor (stove) below wajan
    const kompor = this.add.rectangle(200, 500, 120, 80, 0x8B4513, 0.8);
    kompor.setData('type', 'kompor');
    
    // Add text to show it's a kompor
    this.add.text(200, 500, 'KOMPOR\n(Stove)', {
      font: '14px Chewy',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5);
  }

  private showUlekanProgress() {
    // Hitung progress bahan yang sudah ditambahkan
    let progress = 0;
    if (this.gameState.hasBawangPutih) progress++;
    if (this.gameState.hasBawangMerah) progress++;
    if (this.gameState.hasCabai) progress++;
    if (this.gameState.hasKunyit) progress++;
    
    // Hapus progress text lama jika ada
    if (this.progressText) {
      this.progressText.destroy();
    }
    
    // Tampilkan progress text
    this.progressText = this.add.text(200, 580, `Progress: ${progress}/4 bahan`, {
      font: '16px Chewy',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    // Hapus progress text setelah 2 detik
    this.time.delayedCall(2000, () => {
      if (this.progressText) {
        this.progressText.destroy();
        this.progressText = null;
      }
    });
  }

  private createCampuranBumbuHalus() {
    this.transformUlekan('ulekan_bumbu_halus');
    
    this.time.delayedCall(2000, () => {
      this.gameObjects.campuran_bumbu_halus = this.add.image(800, 300, 'campuran_bumbu_halus');
      this.gameObjects.campuran_bumbu_halus.setInteractive({ draggable: true });
      this.gameObjects.campuran_bumbu_halus.setScale(0.4);
      this.gameObjects.campuran_bumbu_halus.setData('type', 'campuran_bumbu_halus');
      
      if (this.progressText) {
        this.progressText.destroy();
        this.progressText = null;
      }
      
      this.showUlekanTransformationFeedback('campuran_bumbu_halus_ready');
    });
  }

  private createWajanArea() {
  // Create wajan area - right side
  this.wajanArea = this.add.rectangle(800, 200, 100, 100, 0x00ff00, 0.3);
  this.wajanArea.setInteractive();
  this.wajanArea.setData('type', 'wajan_area');
    
    // Add text to show it's a wajan area
  this.add.text(800, 200, 'WAJAN\n(Pan)', {
    font: '14px Chewy',
    color: '#000000',
    backgroundColor: '#ffffff',
    padding: { x: 5, y: 2 }
    }).setOrigin(0.5);
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
    
    // Check if dropped on wajan
    if (this.isNear(gameObject, this.gameObjects.wajan, 100)) {
      this.handleWajanDrop(type);
    }
    
    // Check if dropped on ulekan
    if (this.isNear(gameObject, this.gameObjects.ulekan, 100)) {
      // Use currentState if available, otherwise use type
      const dropType = currentState || type;
      this.handleUlekanDrop(dropType);
    }
    
    // Wajan area hanya untuk visual, tidak untuk logic cooking
    // Logika cooking sekarang ada di handleWajanDrop
  }

  private handleWajanDrop(ingredientType: string) {
    if (ingredientType === 'campuran_bumbu_halus' && this.gameState.wajanState === 'wajan') {
      this.transformWajan('wajan_bumbu_halus');
      this.hideIngredient('campuran_bumbu_halus');
    } 
    else if (ingredientType === 'daun_salam' && this.gameState.wajanState === 'wajan_bumbu_halus') {
      this.gameState.hasDaunSalam = true;
      this.hideIngredient('daun_salam');
      this.checkDaunSalamLengkap();
    } else if (ingredientType === 'lengkuas' && this.gameState.wajanState === 'wajan_bumbu_halus') {
      this.gameState.hasLengkuas = true;
      this.hideIngredient('lengkuas');
      this.checkDaunSalamLengkap();
    } else if (ingredientType === 'daun_serai' && this.gameState.wajanState === 'wajan_bumbu_halus') {
      this.gameState.hasDaunSerai = true;
      this.hideIngredient('daun_serai');
      this.checkDaunSalamLengkap();
    }
    // Step 4: Drag daging_ikan, air, daun_jeruk, jahe ke wajan
    else if (ingredientType === 'daging_ikan' && this.gameState.wajanState === 'wajan_lengkuas_daun_bawang') {
      this.gameState.hasDagingIkan = true;
      this.hideIngredient('daging_ikan');
      this.checkDagingLengkap();
    } else if (ingredientType === 'air' && this.gameState.wajanState === 'wajan_lengkuas_daun_bawang') {
      this.gameState.hasAir = true;
      this.hideIngredient('air');
      this.checkDagingLengkap();
    } else if (ingredientType === 'daun_jeruk' && this.gameState.wajanState === 'wajan_lengkuas_daun_bawang') {
      this.gameState.hasDaunJeruk = true;
      this.hideIngredient('daun_jeruk');
      this.checkDagingLengkap();
    } else if (ingredientType === 'jahe' && this.gameState.wajanState === 'wajan_lengkuas_daun_bawang') {
      this.gameState.hasJahe = true;
      this.hideIngredient('jahe');
      this.checkDagingLengkap();
    }
    // Step 5: Drag garam, gula, tomat, daun_bawang ke wajan
    else if (ingredientType === 'garam' && this.gameState.wajanState === 'wajan_daging_air_daun_jahe') {
      this.gameState.hasGaram = true;
      this.hideIngredient('garam');
      this.checkGaramGulaLengkap();
    } else if (ingredientType === 'gula' && this.gameState.wajanState === 'wajan_daging_air_daun_jahe') {
      this.gameState.hasGula = true;
      this.hideIngredient('gula');
      this.checkGaramGulaLengkap();
    } else if (ingredientType === 'tomat' && this.gameState.wajanState === 'wajan_daging_air_daun_jahe') {
      this.gameState.hasTomat = true;
      this.hideIngredient('tomat');
      this.checkGaramGulaLengkap();
    } else if (ingredientType === 'daun_bawang' && this.gameState.wajanState === 'wajan_daging_air_daun_jahe') {
      this.gameState.hasDaunBawang = true;
      this.hideIngredient('daun_bawang');
      this.checkGaramGulaLengkap();
    }
    else if (ingredientType === 'asam_jawa' && this.gameState.wajanState === 'wajan_daun_bawang_tomat') {
      this.transformWajan('wajan_asam_jawa');
      this.gameState.hasAsamJawa = true;
      this.hideIngredient('asam_jawa');
    }
    else if (ingredientType === 'mangkuk_coklat' && this.gameState.wajanState === 'wajan_asam_jawa') {
      this.completeIkanKuahKuning();
      this.gameState.hasMangkuk = true;
      this.hideIngredient('mangkuk_coklat');
    }
  }

  private handleUlekanDrop(ingredientType: string) {
    console.log(`handleUlekanDrop called with: ${ingredientType}, current ulekan state: ${this.gameState.ulekanState}`);
    
    // Step 1: Drag semua bahan ke ulekan terlebih dahulu (gambar tidak berubah sampai semua selesai)
    if (ingredientType === 'bawang_putih' && this.gameState.ulekanState === 'ulekan') {
      console.log('Bawang putih ditambahkan ke ulekan');
      this.gameState.hasBawangPutih = true;
      this.hideIngredient('bawang_putih');
      this.showUlekanProgress();
    } else if (ingredientType === 'bawang_merah' && this.gameState.ulekanState === 'ulekan') {
      console.log('Bawang merah ditambahkan ke ulekan');
      this.gameState.hasBawangMerah = true;
      this.hideIngredient('bawang_merah');
      this.showUlekanProgress();
    } else if (ingredientType === 'cabai' && this.gameState.ulekanState === 'ulekan') {
      console.log('Cabai ditambahkan ke ulekan');
      this.gameState.hasCabai = true;
      this.hideIngredient('cabai');
      this.showUlekanProgress();
    } else if (ingredientType === 'kunyit' && this.gameState.ulekanState === 'ulekan') {
      console.log('Kunyit ditambahkan ke ulekan');
      this.gameState.hasKunyit = true;
      this.hideIngredient('kunyit');
      this.showUlekanProgress();
      
      // Setelah semua bumbu halus ditambahkan, baru ubah gambar ulekan
      console.log('Checking bahan status:', {
        bawangPutih: this.gameState.hasBawangPutih,
        bawangMerah: this.gameState.hasBawangMerah,
        cabai: this.gameState.hasCabai,
        kunyit: this.gameState.hasKunyit
      });
      
      if (this.gameState.hasBawangPutih && this.gameState.hasBawangMerah && this.gameState.hasCabai && this.gameState.hasKunyit) {
        this.createCampuranBumbuHalus();
      }
    } else {
      console.log(`Invalid combination for ulekan: ${ingredientType} with state ${this.gameState.ulekanState}`);
    }
  }

  // handlePisauDrop dihapus karena logika cutting sekarang ada di handleTelenanDrop
  // Pisau area hanya untuk visual, tidak untuk logic cutting

  private transformWajan(newState: string) {
    console.log(`Transforming wajan from ${this.gameState.wajanState} to ${newState}`);
    this.gameObjects.wajan.setTexture(newState);
    this.gameState.wajanState = newState;
    
    // Update wajan data to reflect new state
    this.gameObjects.wajan.setData('currentState', newState);
    
    // Show transformation feedback
    this.showWajanTransformationFeedback(newState);
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

  private completeIkanKuahKuning() {
    // Show completion message
    this.add.text(400, 300, 'Ikan Kuah Kuning Selesai!', {
      font: '48px Chewy',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    // Transform to finished ikan kuah kuning
    this.gameObjects.ulekan.setTexture('ikan_kuah_kuning_finished');
    this.gameState.ulekanState = 'ikan_kuah_kuning_finished';
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
    return this.isNear(gameObject, this.gameObjects.wajan, 100) ||
           this.isNear(gameObject, this.gameObjects.ulekan, 100) ||
           this.isNear(gameObject, this.wajanArea, 100);
  }

  private checkDaunSalamLengkap() {
    if (this.gameState.hasDaunSalam && this.gameState.hasLengkuas && this.gameState.hasDaunSerai) {
      this.transformWajan('wajan_lengkuas_daun_bawang');
    }
  }

  private checkDagingLengkap() {
    if (this.gameState.hasDagingIkan && this.gameState.hasAir && this.gameState.hasDaunJeruk && this.gameState.hasJahe) {
      this.transformWajan('wajan_daging_air_daun_jahe');
    }
  }

  private checkGaramGulaLengkap() {
    if (this.gameState.hasGaram && this.gameState.hasGula && this.gameState.hasTomat && this.gameState.hasDaunBawang) {
      this.transformWajan('wajan_daun_bawang_tomat');
    }
  }

  private resetIngredientPosition(gameObject: Phaser.GameObjects.Image) {
    const type = gameObject.getData('type');
    const positions: { [key: string]: { x: number, y: number } } = {
      'bawang_putih': { x: 700, y: 150 },
      'bawang_merah': { x: 700, y: 220 },
      'cabai': { x: 700, y: 290 },
      'kunyit': { x: 700, y: 360 },
      'daun_salam': { x: 700, y: 430 },
      'lengkuas': { x: 700, y: 500 },
      'daun_serai': { x: 700, y: 570 },
      'daging_ikan': { x: 700, y: 640 },
      'air': { x: 700, y: 710 },
      'daun_jeruk': { x: 700, y: 180 },
      'jahe': { x: 750, y: 230 },
      'garam': { x: 750, y: 150 },
      'gula': { x: 750, y: 220 },
      'tomat': { x: 700, y: 100 },
      'daun_bawang': { x: 700, y: 100 },
      'asam_jawa': { x: 750, y: 290 },
      'munthu': { x: 700, y: 1270 },
      'mangkuk_coklat': { x: 750, y: 640 },
      'campuran_bumbu_halus': { x: 800, y: 300 }
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



  private showWajanTransformationFeedback(newState: string) {
    // Show visual feedback for wajan transformation
    let message = '';
    let color = '#00ff00';
    
    switch (newState) {
      case 'wajan_daging_air_daun_jahe':
        message = 'Daging ikan, air, dan jahe ditambahkan ke wajan';
        break;
      case 'wajan_bumbu_halus':
        message = 'Bumbu halus ditambahkan ke wajan!';
        color = '#ff6600';
        break;
      case 'wajan_asam_jawa':
        message = 'Asam jawa ditambahkan ke wajan';
        color = '#8B4513';
        break;
      case 'wajan_daun_bawang_tomat':
        message = 'Daun bawang dan tomat ditambahkan ke wajan';
        color = '#228B22';
        break;
      case 'wajan_lengkuas_daun_bawang':
        message = 'Lengkuas ditambahkan ke wajan';
        color = '#8B4513';
        break;
      default:
        message = 'Wajan berubah';
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

  private hideWajan() {
    // Hide the wajan after it's been used in ulekan
    if (this.gameObjects.wajan) {
      this.gameObjects.wajan.setVisible(false);
    }
  }

  private showUlekanTransformationFeedback(newState: string) {
    // Show visual feedback for ulekan transformation
    let message = '';
    let color = '#00ff00';
    
    switch (newState) {
      case 'ulekan_bumbu_halus':
        message = 'Bumbu halus selesai diulek!';
        color = '#ff6600';
        break;
      case 'campuran_bumbu_halus_ready':
        message = 'Campuran bumbu halus siap digunakan!';
        color = '#ff6600';
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
