import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    // Background loading screen
    this.add.image(512, 384, "background").setAlpha(0.7);

    // Title "Loading..."
    this.add.text(512, 300, "🍳 Loading Cooking Game...", {
      fontFamily: "Arial Black",
      fontSize: 28,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Progress bar outline
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(3, 0xf57c00);

    // Progress bar fill
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffcc80).setOrigin(0, 0.5);

    // Update progress
    this.load.on("progress", (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    // Semua aset game dipanggil di sini
    this.load.setPath("/assets");

    // UI / Logo
    this.load.image("logo", "logo.png");

    // Cooking assets - memperbaiki path yang salah
    this.load.image("Tepung", "foods/flour.png");
    this.load.image("Mangkuk", "foods/bowl.png");
    this.load.image("Mangkuk_isi", "foods/DenganTepung.png");
    this.load.image("dropZone", "foods/DropZOne.png");

    // Background dapur
    this.load.image("background", "backgrounds/kitchen.png");

    // Bahan tambahan
    this.load.image("star", "foods/star.png");
    
    // Character assets untuk dialog
    this.load.image("karakter1", "characters/karakter1.png");
    this.load.image("karakter2", "characters/karakter2.png");
    this.load.image("karakter3", "characters/karakter3.png");
    this.load.image("karakter4", "characters/karakter4.png");
    this.load.image("karakter5", "characters/karakter5.png");
    
    // UI buttons
    this.load.image("menu_button", "ui/buttons/menu/menu_normal.png");
    this.load.image("menu_button_hover", "ui/buttons/menu/menu_hover.png");
    this.load.image("menu_button_active", "ui/buttons/menu/menu_active.png");
  }

  create() {
    // Setelah selesai loading, langsung ke scene yang sesuai
    // Untuk sementara, kita akan langsung ke scene pertama
    this.scene.start("PapedaScene");
  }
}
