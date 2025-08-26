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

    // Cooking assets
    this.load.image("Tepung", "public/assets/flour.png");
    this.load.image("Mangkuk", "bowl.png");
    this.load.image("Mangkuk_isi", "public/assets/DenganTepung.png");
    this.load.image("dropZone", "public/assets/DropZOne.png");

    // Background dapur
    this.load.image("background", "Background.png");

    // Bahan tambahan
    this.load.image("star", "star.png");
  }

  create() {
    // Setelah selesai loading, langsung ke MainMenu
    this.scene.start("MainMenu");
  }
}
