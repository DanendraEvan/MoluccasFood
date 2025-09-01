// src/game/scenes/KohuKohuScene.ts
import Phaser from "phaser";

type BowlState =
  | "empty"
  | "teflonKelapa"
  | "sangrai"
  | "tambahanSepatula"
  | "aduk"
  | "piringKelapa"
  | "finished";

type WajanState =
  | "empty"
  | "kemangi"
  | "kol"
  | "bawangPutih"
  | "cabeBawangMerah"
  | "daging"
  | "minyak"
  | "sepatulaDanSayur"
  | "kohukohu";

export default class KohuKohuScene extends Phaser.Scene {
  private Teflon: Phaser.GameObjects.Image;
  private Wajan: Phaser.GameObjects.Image;
  private Sepatula: Phaser.GameObjects.Image;
  private Piring: Phaser.GameObjects.Image;

  private Kelapa: Phaser.GameObjects.Image;
  private Kemangi: Phaser.GameObjects.Image;
  private Kol: Phaser.GameObjects.Image;
  private BawangPutih: Phaser.GameObjects.Image;
  private Cabe: Phaser.GameObjects.Image;
  private BawangMerah: Phaser.GameObjects.Image;
  private Daging: Phaser.GameObjects.Image;
  private MinyakIkan: Phaser.GameObjects.Image;

  private dropZone: Phaser.GameObjects.Zone;
  private wajanZone: Phaser.GameObjects.Zone;
  private teflonZone: Phaser.GameObjects.Zone;
  private bowlState: BowlState;
  private wajanState: WajanState;
  private stirringTimer: Phaser.Time.TimerEvent | null = null;

  private KomporWajan: Phaser.GameObjects.Image;
  private KomporTeflon: Phaser.GameObjects.Image;

  private hasCabe = false;
  private hasBawangMerah = false;

  constructor() {
    super("KohuKohuScene");
    this.bowlState = "empty";
    this.wajanState = "empty";
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/kitchen.png");

    // Tools
    this.load.image("Teflon", "/assets/foods/kohu_kohu/Teflon.png");
    this.load.image("Wajan", "/assets/foods/kohu_kohu/wajan.png");
    this.load.image("Sepatula", "/assets/foods/kohu_kohu/sepatula.png");
    this.load.image("Piring", "/assets/foods/kohu_kohu/Piring Kohu.png");
    this.load.image("Kompor", "/assets/foods/kohu_kohu/Kompor.png");

    // Ingredients
    this.load.image("Kelapa", "/assets/foods/kohu_kohu/Kelapa.png");
    this.load.image("Kol", "/assets/foods/kohu_kohu/kol.png");
    this.load.image("Kemangi", "/assets/foods/kohu_kohu/Kemangi.png");
    this.load.image("BawangPutih", "/assets/foods/kohu_kohu/bawangPutih.png");
    this.load.image("Cabe", "/assets/foods/kohu_kohu/Cabe.png");
    this.load.image("BawangMerah", "/assets/foods/kohu_kohu/Bawang Merah.png");
    this.load.image("Daging", "/assets/foods/kohu_kohu/Daging.png");
    this.load.image("MinyakIkan", "/assets/foods/kohu_kohu/MinyakIkan.png");

    // Steps / hasil
    this.load.image("TeflonKelapa", "/assets/foods/kohu_kohu/TeflonKelapa.png");
    this.load.image("Sangrai", "/assets/foods/kohu_kohu/sangrai.png");
    this.load.image("TambahanSepatula", "/assets/foods/kohu_kohu/TambahanSepatula.png");
    this.load.image("AdukKohu1", "/assets/foods/kohu_kohu/adukKohu1.png");
    this.load.image("AdukKohu2", "/assets/foods/kohu_kohu/AdukKohu2.png");
    this.load.image("PiringKelapa", "/assets/foods/kohu_kohu/piringKelapa.png");
    this.load.image("SepatuladanSayur", "/assets/foods/kohu_kohu/SepatuladanSayur.png");
    this.load.image("KohuKohu", "/assets/foods/kohu_kohu/kohukohu.png");

    this.load.image("Tambahankemangi", "/assets/foods/kohu_kohu/Tambahankemangi.png");
    this.load.image("tambahanKol", "/assets/foods/kohu_kohu/tambahanKol.png");
    this.load.image("tambahanBawangPutih", "/assets/foods/kohu_kohu/tambahanBawangPutih.png");
    this.load.image("tambahanCabeBawangMerah", "/assets/foods/kohu_kohu/tambahanCabeBawangMerah.png");
    this.load.image("tambahanDaging", "/assets/foods/kohu_kohu/TambahanDaging.png");
    this.load.image("tambahanMinyak", "/assets/foods/kohu_kohu/tambahanMinyak.png");
  }

  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // --- Kompor kiri untuk WAJAN ---
    this.KomporWajan = this.add.image(this.cameras.main.width / 3, this.cameras.main.height - 150, "Kompor").setScale(0.4);
    this.wajanZone = this.add.zone(this.KomporWajan.x, this.KomporWajan.y - 100, 200, 200).setRectangleDropZone(200, 200).setName("wajanZone");
    this.Wajan = this.add.image(this.wajanZone.x, this.wajanZone.y, "Wajan").setScale(0.3);

    // --- Kompor kanan untuk TEFLON ---
    this.KomporTeflon = this.add.image(this.cameras.main.width * 2/3, this.cameras.main.height - 150, "Kompor").setScale(0.4);
    this.teflonZone = this.add.zone(this.KomporTeflon.x, this.KomporTeflon.y - 100, 200, 200).setRectangleDropZone(200, 200).setName("teflonZone");
    this.Teflon = this.add.image(this.teflonZone.x, this.teflonZone.y, "Teflon").setScale(0.3);

    this.createIngredients();
    this.initDragAndDrop();
  }

  private createIngredients() {
    const ingredientX = this.cameras.main.width - 100;
    const verticalSpacing = 60;
    const initialY = 100;

    const ingredients = [
      "Kelapa",
      "Kemangi",
      "Kol",
      "BawangPutih",
      "Cabe",
      "BawangMerah",
      "Daging",
      "MinyakIkan",
      "Sepatula",
      "Piring"
    ];

    ingredients.forEach((key, i) => {
      this[key] = this.add.image(ingredientX, initialY + i * verticalSpacing, key).setInteractive().setScale(0.2);
      this.input.setDraggable(this[key]);
    });
  }

  private initDragAndDrop() {
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      if (gameObject.texture.key === "Sepatula" && this.wajanState === "minyak") {
        const spatulaBounds = gameObject.getBounds();
        const wajanBounds = this.Wajan.getBounds();
    
        // Kalau spatula menyentuh wajan sedikit saja
        if (Phaser.Geom.Intersects.RectangleToRectangle(spatulaBounds, wajanBounds)) {
          this.Wajan.setTexture("SepatuladanSayur");
          this.wajanState = "sepatulaDanSayur";
    
          // Spatula juga langsung berubah
          gameObject.setTexture("SepatuladanSayur");
          gameObject.Interactive(); // biar nggak bisa ditarik lagi
        }
      }
    });

    this.input.on("drop", (pointer, gameObject: Phaser.GameObjects.Image, dropZone) => {
      const droppedKey = gameObject.texture.key;
      if (droppedKey === "Piring") {
        this.Piring.x = this.KomporTeflon.x;
        this.Piring.y = this.KomporTeflon.y - 180; // agak lebih tinggi
      }
      // --- TEFLON logic (kanan) ---
      if (dropZone === this.teflonZone) {
        if (this.bowlState === "empty" && droppedKey === "Kelapa") {
          this.Teflon.setTexture("TeflonKelapa");
          this.bowlState = "teflonKelapa";
          gameObject.destroy();
          this.time.delayedCall(1000, () => {
            // Cek lagi buat jaga-jaga kalau state sudah berubah
            if (this.bowlState === "teflonKelapa") {
              this.Teflon.setTexture("Sangrai");
              this.bowlState = "sangrai";
              this.Teflon.setInteractive();
    this.input.setDraggable(this.Teflon);
            }
          });
        } else if (this.bowlState === "teflonKelapa" && droppedKey === "Kelapa") {
          this.Teflon.setTexture("Sangrai");
          this.bowlState = "sangrai";
          gameObject.destroy();
        } else if (this.bowlState === "sangrai" && droppedKey === "Sepatula") {
          this.Teflon.setTexture("TambahanSepatula");
          this.startStirring();
          gameObject.destroy();
        }  // ✅ Sangrai ke Piring
        else if (this.bowlState === "sangrai" && droppedKey === "Piring") {
          this.Teflon.setTexture("PiringKelapa");
          this.bowlState = "piringKelapa";
      
          this.Teflon.x = this.Piring.x;
          this.Teflon.y = this.Piring.y - 30;
      
          gameObject.destroy();
        } else if (this.bowlState === "piringKelapa" && droppedKey === "SepatuladanSayur") {
          this.Teflon.setTexture("KohuKohu");
          this.bowlState = "finished";
        }
      }

      // --- WAJAN logic (kiri) ---
      if (dropZone === this.wajanZone) {
        if (this.wajanState === "empty" && droppedKey === "Kemangi") {
          this.Wajan.setTexture("Tambahankemangi");
          this.wajanState = "kemangi";
          gameObject.destroy();
        } else if (this.wajanState === "kemangi" && droppedKey === "Kol") {
          this.Wajan.setTexture("tambahanKol");
          this.wajanState = "kol";
          gameObject.destroy();
        } else if (this.wajanState === "kol" && droppedKey === "BawangPutih") {
          this.Wajan.setTexture("tambahanBawangPutih");
          this.wajanState = "bawangPutih";
          gameObject.destroy();
        } else if (this.wajanState === "bawangPutih") {
          if (droppedKey === "Cabe") {
            this.hasCabe = true;
            gameObject.destroy();
          } else if (droppedKey === "BawangMerah") {
            this.hasBawangMerah = true;
            gameObject.destroy();
          }
          if (this.hasCabe && this.hasBawangMerah) {
            this.Wajan.setTexture("tambahanCabeBawangMerah");
            this.wajanState = "cabeBawangMerah";
          }
        } else if (this.wajanState === "cabeBawangMerah" && droppedKey === "Daging") {
          this.Wajan.setTexture("tambahanDaging");
          this.wajanState = "daging";
          gameObject.destroy();
        } else if (this.wajanState === "daging" && droppedKey === "MinyakIkan") {
          this.Wajan.setTexture("tambahanMinyak");
          this.wajanState = "minyak";
          gameObject.destroy();
        } else if (this.wajanState === "minyak" && droppedKey === "Sepatula") {
          this.Wajan.setTexture("SepatuladanSayur");
          this.wajanState = "sepatulaDanSayur";
          gameObject.destroy();
        } else if (this.wajanState === "sepatulaDanSayur" && droppedKey === "PiringKelapa") {
          this.Wajan.setTexture("KohuKohu");
          this.wajanState = "kohukohu";
        }
      }
    });
  }

  private startStirring() {
    this.bowlState = "aduk";
    let isAduk1 = true;
    this.stirringTimer = this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        this.Teflon.setTexture(isAduk1 ? "AdukKohu1" : "AdukKohu2");
        isAduk1 = !isAduk1;
      }
    });
  }

  update() {}
}
