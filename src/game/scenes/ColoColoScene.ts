// src/game/scenes/ColoColoScene.ts - Rewritten with User-Mandated Sequential Flow
import Phaser from 'phaser';

interface GameStep {
  id: number;
  text: string;
  character: string;
}

export default class ColoColoScene extends Phaser.Scene {
  // Game objects and state
  private gameObjects: { [key: string]: Phaser.GameObjects.Image } = {};
  private gameState: {
    telenanState: string;
    ulekanState: string;
  };
  private currentStep = 0;
  private subStepCounter = 0; // Used for multi-stage actions like cutting
  private telenanSelected = false;

  // UI Components
  private ingredientsPanel!: Phaser.GameObjects.Container;
  private dialogPanel!: Phaser.GameObjects.Container;
  private characterImage!: Phaser.GameObjects.Image;
  private stepText!: Phaser.GameObjects.Text;
  private ingredientItems: Phaser.GameObjects.Image[] = [];

  // Configuration for layout
  private layoutConfig = {
    ingredientsPanelWidth: 375,
    ingredientsPanelX: 0,
    dialogPanelHeight: 120,
    dialogPanelY: 0,
    cookingAreaRight: 0,
  };

  // The definitive game flow based on user request
  private gameSteps: GameStep[] = [
    { id: 0, text: "Mari kita mulai! Pertama, letakkan cabai di atas talenan.", character: "karakter1" }, // Drop Chili
    { id: 1, text: "Gunakan pisau untuk memotong cabai sampai halus.", character: "karakter1" }, // Cut Chili
    { id: 2, text: "Bagus! Klik talenan berisi cabai, lalu klik mangkok untuk memindahkannya.", character: "karakter2" }, // Transfer Chili
    { id: 3, text: "Sekarang, letakkan bawang putih di talenan yang kosong.", character: "karakter2" }, // Drop Garlic
    { id: 4, text: "Potong bawang putih hingga halus juga.", character: "karakter2" }, // Cut Garlic
    { id: 5, text: "Kerja bagus! Pindahkan bawang putih ke dalam mangkok.", character: "karakter3" }, // Transfer Garlic
    { id: 6, text: "Saatnya menambahkan kecap. Seret dan letakkan kecap ke dalam mangkok.", character: "karakter3" }, // Add Kecap
    { id: 7, text: "Sekarang, tambahkan daun jeruk untuk memberi aroma segar.", character: "karakter4" }, // Add Daun Jeruk
    { id: 8, text: "Kita perlu talenan lagi. Aku akan siapkan untukmu.", character: "karakter1" }, // Prepare for Lime
    { id: 9, text: "Letakkan jeruk nipis di atas talenan yang bersih.", character: "karakter5" }, // Drop Lime
    { id: 10, text: "Potong jeruk nipis menjadi dua bagian.", character: "karakter5" }, // Cut Lime
    { id: 11, text: "Pindahkan potongan jeruk nipis ke dalam mangkok.", character: "karakter5" }, // Transfer Lime
    { id: 12, text: "Ambil munthu, lalu ulek semua bahan di dalam mangkok.", character: "karakter1" }, // Grind
    { id: 13, text: "Hampir selesai! Ambil piring dan sajikan sambalmu.", character: "karakter2" }, // Serve
    { id: 14, text: "Luar biasa! Sambal Colo-colo khas Maluku buatanmu sudah jadi!", character: "karakter2" }, // Finish
  ];

  constructor() {
    super('ColoColoScene');
  }

  preload() {
    this.load.image('background', '/assets/backgrounds/kitchen.png');
    const basePath = '/assets/foods/colo_colo/';
    this.load.image('ingredient_cabai', `${basePath}Cabai.png`);
    this.load.image('ingredient_bawang_putih', `${basePath}BawangPutih2.png`);
    this.load.image('ingredient_daun_jeruk', `${basePath}DaunJeruk.png`);
    this.load.image('ingredient_jeruk_nipis', `${basePath}JerukNipis.png`);
    this.load.image('ingredient_kecap', `${basePath}Kecap.png`);
    this.load.image('ingredient_munthu', `${basePath}Munthu.png`);
    this.load.image('ingredient_pisau', `${basePath}Pisau.png`);
    this.load.image('ingredient_piring', `${basePath}PiringColoColo.png`);
    this.load.image('telenan_base', `${basePath}telenan.png`);
    this.load.image('ulekan_base', `${basePath}Ulekan.png`);
    this.load.image('colo_colo_final', `${basePath}ColoColo.png`);

    for (let i = 0; i <= 4; i++) { const key = i === 0 ? '' : i; this.load.image(`telenan_chili_${i}`, `${basePath}step-1/TelenanCabaiPotong${key}.png`); }
    this.load.image('telenan_garlic_0', `${basePath}step-2/TelenanBawangPutih.png`);
    for (let i = 1; i <= 6; i++) { this.load.image(`telenan_garlic_${i}`, `${basePath}step-2/TelenanBawangPutih${i}.png`); }
    this.load.image('ulekan_chili', `${basePath}step-3/UlekanKecap4.png`);
    this.load.image('ulekan_chili_garlic', `${basePath}step-3/UlekanKecap5.png`);
    this.load.image('ulekan_chili_garlic_kecap_0', `${basePath}step-3/UlekanKecap.png`);
    this.load.image('ulekan_chili_garlic_kecap_1', `${basePath}step-3/UlekanKecap1.png`);
    this.load.image('ulekan_chili_garlic_kecap_2', `${basePath}step-3/UlekanKecap3.png`);
    for (let i = 6; i <= 11; i++) { this.load.image(`ulekan_daun_${i-6}`, `${basePath}step-5/UlekanKecap${i}.png`); }
    this.load.image('telenan_lime_0', `${basePath}step-4/TelenanNipis.png`);
    this.load.image('telenan_lime_1', `${basePath}step-4/TelenanNipis1.png`);
    this.load.image('telenan_lime_2', `${basePath}step-4/TelenanNipis2.png`);
    this.load.image('ulekan_lime_0', `${basePath}step-4/UlekanNipis.png`);
    this.load.image('ulekan_lime_1', `${basePath}step-4/UlekanNipis1.png`);
    this.load.image('ulekan_grind_0', `${basePath}step-6/Ulekan.png`);
    this.load.image('ulekan_grind_1', `${basePath}step-6/Ulekan1.png`);
    this.load.image('ulekan_grind_2', `${basePath}step-6/Ulekan2.png`);
    for (let i = 1; i <= 5; i++) { this.load.image(`karakter${i}`, `/assets/karakter/karakter${i}.png`); }
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0);
    this.calculateLayout();
    this.gameState = { telenanState: 'telenan_base', ulekanState: 'ulekan_base' };
    this.createCookingArea();
    this.createIngredientsPanel();
    this.createDialogPanel();
    this.setupInteractions();
    this.updateStepDisplay();
  }

  private setupInteractions() {
    this.input.on('dragstart', (p: any, go: any) => { this.children.bringToTop(go); go.setTint(0x00ff00); go.setData('dragStartX', go.x); go.setData('dragStartY', go.y); });
    this.input.on('drag', (p: any, go: any, dragX: any, dragY: any) => { go.x = dragX; go.y = dragY; });
    this.input.on('dragend', (p: any, go: any, dropped: any) => { go.clearTint(); if (!dropped) { this.resetIngredientPosition(go); } });
    this.input.on('drop', (p: any, go: any, dropZone: any) => { this.handleDrop(go.name, dropZone.name, go); });
    this.gameObjects.telenan.on('pointerdown', () => this.handleTelenanClick());
    this.gameObjects.ulekan.on('pointerdown', () => this.handleUlekanClick());
  }

  private handleDrop(ingredient: string, target: string, ingredientObject: Phaser.GameObjects.Image) {
    let correctDrop = false;
    let manualNextStep = false;

    switch (this.currentStep) {
      case 0: // Drop Chili
        if (ingredient === 'ingredient_cabai' && target === 'telenan') {
          this.transformTelenan('telenan_chili_0');
          correctDrop = true;
        }
        break;
      case 1: // Cut Chili
        if (ingredient === 'ingredient_pisau' && this.gameState.telenanState.startsWith('telenan_chili')) {
          this.subStepCounter++;
          this.transformTelenan(`telenan_chili_${this.subStepCounter}`);
          this.resetIngredientPosition(ingredientObject);
          if (this.subStepCounter >= 4) { this.nextStep(); }
          manualNextStep = true;
        }
        break;
      case 3: // Drop Garlic
        if (ingredient === 'ingredient_bawang_putih' && target === 'telenan') {
          this.transformTelenan('telenan_garlic_0'); // Visually incorrect, but per user request
          correctDrop = true;
        }
        break;
      case 4: // Cut Garlic
        if (ingredient === 'ingredient_pisau' && this.gameState.telenanState.startsWith('telenan_garlic')) {
          this.subStepCounter++;
          this.transformTelenan(`telenan_garlic_${this.subStepCounter}`);
          this.resetIngredientPosition(ingredientObject);
          if (this.subStepCounter >= 6) { this.nextStep(); }
          manualNextStep = true;
        }
        break;
      case 6: // Add Kecap
        if (ingredient === 'ingredient_kecap' && target === 'ulekan') {
          this.playAnimation(['ulekan_chili_garlic_kecap_0', 'ulekan_chili_garlic_kecap_1', 'ulekan_chili_garlic_kecap_2'], 'ulekan', 300, () => this.nextStep());
          correctDrop = true; manualNextStep = true;
        }
        break;
      case 7: // Add Daun Jeruk
        if (ingredient === 'ingredient_daun_jeruk' && target === 'ulekan') {
          const frames = Array.from({length: 6}, (_, i) => `ulekan_daun_${i}`);
          this.playAnimation(frames, 'ulekan', 200, () => this.nextStep());
          correctDrop = true; manualNextStep = true;
        }
        break;
      case 9: // Drop Lime
        if (ingredient === 'ingredient_jeruk_nipis' && target === 'telenan') {
          this.transformTelenan('telenan_lime_0');
          correctDrop = true;
        }
        break;
      case 10: // Cut Lime
        if (ingredient === 'ingredient_pisau' && this.gameState.telenanState.startsWith('telenan_lime')) {
          this.subStepCounter++;
          this.transformTelenan(`telenan_lime_${this.subStepCounter}`);
          this.resetIngredientPosition(ingredientObject);
          if (this.subStepCounter >= 2) { this.nextStep(); }
          manualNextStep = true;
        }
        break;
      case 12: // Grind
        if (ingredient === 'ingredient_munthu' && target === 'ulekan') {
          this.playAnimation(['ulekan_grind_0', 'ulekan_grind_1', 'ulekan_grind_2'], 'ulekan', 300, () => { this.transformUlekan('ulekan_grind_0'); this.nextStep(); }, 3);
          this.resetIngredientPosition(ingredientObject);
          manualNextStep = true;
        }
        break;
      case 13: // Serve
        if (ingredient === 'ingredient_piring' && target === 'ulekan') {
          this.gameObjects.ulekan.setVisible(false);
          this.add.image(this.gameObjects.ulekan.x, this.gameObjects.ulekan.y, 'colo_colo_final').setScale(0.6);
          correctDrop = true;
        }
        break;
    }

    if (correctDrop) {
      this.hideIngredient(ingredient);
      ingredientObject.destroy();
      if (!manualNextStep) { this.nextStep(); }
    } else if (!manualNextStep) {
      this.handleIncorrectDrop(ingredientObject);
    }
  }

  private handleTelenanClick() {
    if ((this.currentStep === 2 && this.gameState.telenanState === 'telenan_chili_4') ||
        (this.currentStep === 5 && this.gameState.telenanState === 'telenan_garlic_6') ||
        (this.currentStep === 11 && this.gameState.telenanState === 'telenan_lime_2')) {
      this.telenanSelected = true;
      this.gameObjects.telenan.setTint(0x00ff00);
    }
  }

  private handleUlekanClick() {
    if (!this.telenanSelected) return;

    let transferred = false;
    if (this.currentStep === 2) { // Transfer Chili
      this.transformUlekan('ulekan_chili');
      this.transformTelenan('telenan_base');
      transferred = true;
    } else if (this.currentStep === 5) { // Transfer Garlic
      this.transformUlekan('ulekan_chili_garlic');
      this.gameObjects.telenan.setVisible(false).setActive(false);
      transferred = true;
    } else if (this.currentStep === 11) { // Transfer Lime
      this.transformUlekan('ulekan_lime_0');
      this.time.delayedCall(500, () => { this.transformUlekan('ulekan_lime_1'); });
      this.gameObjects.telenan.setVisible(false).setActive(false);
      transferred = true;
    }

    if(transferred) {
      this.telenanSelected = false;
      this.gameObjects.telenan.clearTint();
      this.nextStep();
    }
  }

  private nextStep() {
    if (this.currentStep >= this.gameSteps.length - 1) return;
    this.currentStep++;
    this.subStepCounter = 0;
    this.updateStepDisplay();
    this.showSuccessFeedback();
    if (this.currentStep === 8) { // Re-show telenan for lime
      this.time.delayedCall(1000, () => {
        this.transformTelenan('telenan_base');
        this.gameObjects.telenan.setVisible(true).setActive(true);
        this.nextStep();
      });
    }
  }

  private transformTelenan(newState: string) { this.gameState.telenanState = newState; this.gameObjects.telenan.setTexture(newState); }
  private transformUlekan(newState: string) { this.gameState.ulekanState = newState; this.gameObjects.ulekan.setTexture(newState); }
  private playAnimation(frames: string[], target: 'ulekan' | 'telenan', frameRate: number, onComplete: () => void, repeatCount: number = 1) { let frameIndex = 0; const totalRepeats = Math.floor(frames.length * repeatCount); const animEvent = this.time.addEvent({ delay: frameRate, callback: () => { const frame = frames[frameIndex % frames.length]; if (target === 'ulekan') this.transformUlekan(frame); else this.transformTelenan(frame); frameIndex++; }, repeat: totalRepeats - 1, callbackScope: this }); this.time.delayedCall(totalRepeats * frameRate, () => { animEvent.destroy(); onComplete(); }); }
  private updateStepDisplay() { const step = this.gameSteps[this.currentStep]; if (!step) return; this.stepText.setText(step.text); this.characterImage.setTexture(step.character); this.tweens.add({ targets: this.stepText, alpha: { from: 0, to: 1 }, duration: 400 }); }
  private hideIngredient(ingredientName: string) { const item = this.ingredientItems.find(i => i.name === ingredientName); if (item) { item.setVisible(false).setActive(false); } }
  private resetIngredientPosition(gameObject: Phaser.GameObjects.Image) { this.tweens.add({ targets: gameObject, x: gameObject.getData('dragStartX'), y: gameObject.getData('dragStartY'), duration: 300, ease: 'Power2' }); }
  private handleIncorrectDrop(gameObject: Phaser.GameObjects.Image) { this.cameras.main.shake(150, 0.005); this.resetIngredientPosition(gameObject); }
  private showSuccessFeedback() { this.cameras.main.flash(100, 144, 238, 144, false, null, true); }
  private calculateLayout() { const { width, height } = this.cameras.main; this.layoutConfig.ingredientsPanelX = width - this.layoutConfig.ingredientsPanelWidth - 15; this.layoutConfig.dialogPanelY = height - this.layoutConfig.dialogPanelHeight - 20; this.layoutConfig.cookingAreaRight = width - this.layoutConfig.ingredientsPanelWidth - 40; }
  private createCookingArea() { const { width, height } = this.cameras.main; const cookingAreaCenterX = (width - this.layoutConfig.ingredientsPanelWidth) / 2; const cookingAreaCenterY = height / 2; this.gameObjects.telenan = this.add.image(cookingAreaCenterX - 200, cookingAreaCenterY, 'telenan_base').setInteractive({ dropZone: true }).setName('telenan').setScale(0.6); this.gameObjects.ulekan = this.add.image(cookingAreaCenterX + 200, cookingAreaCenterY, 'ulekan_base').setInteractive({ dropZone: true }).setName('ulekan').setScale(0.5).setVisible(true); }
  private createIngredientsPanel() { this.ingredientsPanel = this.add.container(this.layoutConfig.ingredientsPanelX, 155); const panelBg = this.add.graphics(); panelBg.fillStyle(0x2A1810, 0.95); panelBg.fillRoundedRect(0, 0, this.layoutConfig.ingredientsPanelWidth, 600, 20); this.ingredientsPanel.add(panelBg); const title = this.add.text(this.layoutConfig.ingredientsPanelWidth / 2, 40, "Bahan & Alat", { fontSize: '28px', fontFamily: 'Chewy, cursive', color: '#FFE4B5' }).setOrigin(0.5); this.ingredientsPanel.add(title); const ingredients = [ { key: "ingredient_cabai", name: "Cabai" }, { key: "ingredient_bawang_putih", name: "Bawang" }, { key: "ingredient_daun_jeruk", name: "Daun Jeruk" }, { key: "ingredient_jeruk_nipis", name: "Jeruk Nipis" }, { key: "ingredient_kecap", name: "Kecap" }, { key: "ingredient_munthu", name: "Munthu" }, { key: "ingredient_pisau", name: "Pisau" }, { key: "ingredient_piring", name: "Piring" } ]; const itemsPerRow = 2; const cellWidth = 160; const cellHeight = 130; const startX = (this.layoutConfig.ingredientsPanelWidth - (itemsPerRow * cellWidth)) / 2 + cellWidth/2; const startY = 140; ingredients.forEach((ing, i) => { const row = Math.floor(i / itemsPerRow); const col = i % itemsPerRow; const x = startX + (col * cellWidth); const y = startY + (row * cellHeight); const item = this.add.image(x, y, ing.key).setName(ing.key).setInteractive().setScale(0.25); this.input.setDraggable(item); this.ingredientsPanel.add(item); this.ingredientItems.push(item); const label = this.add.text(x, y + 50, ing.name, { fontSize: '20px', fontFamily: 'Chewy, cursive', color: '#FFFFFF' }).setOrigin(0.5); this.ingredientsPanel.add(label); }); }
  private createDialogPanel() { this.dialogPanel = this.add.container(50, this.layoutConfig.dialogPanelY); const dialogWidth = this.layoutConfig.cookingAreaRight - 50; const dialogBg = this.add.graphics(); dialogBg.fillStyle(0xFFFFF0, 0.95); dialogBg.fillRoundedRect(0, 0, dialogWidth, this.layoutConfig.dialogPanelHeight, 20); this.dialogPanel.add(dialogBg); this.characterImage = this.add.image(60, this.layoutConfig.dialogPanelHeight / 2, "karakter1").setScale(0.4); this.dialogPanel.add(this.characterImage); this.stepText = this.add.text(120, this.layoutConfig.dialogPanelHeight / 2, "", { fontSize: '20px', fontFamily: 'Chewy, cursive', color: '#2C1810', wordWrap: { width: dialogWidth - 140, useAdvancedWrap: true }, lineSpacing: 5 }).setOrigin(0, 0.5); this.dialogPanel.add(this.stepText); }
}