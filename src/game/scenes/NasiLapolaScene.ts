
// src/game/scenes/NasiLapolaScene.ts
import Phaser from "phaser";

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

export default class NasiLapolaScene extends Phaser.Scene {
  // Definisikan semua objek game
  private panciKiri: Phaser.GameObjects.Image;
  private panciKanan: Phaser.GameObjects.Image;
  private panciMasak: Phaser.GameObjects.Image | null = null;

  private komporKiriZone: Phaser.GameObjects.Zone;
  private komporKananZone: Phaser.GameObjects.Zone;
  private stagingZone: Phaser.GameObjects.Zone;

  // State untuk setiap panci
  private statePanciKiri: PotState = "air";
  private statePanciKanan: PotState = "air";
  private statePanciMasak: PotState = "empty";
  private statePanciKukus: PotState = "empty";

  // Status penempatan panci
  private isPanciKiriStaged = false;
  private isPanciKananStaged = false;

  constructor() {
    super("NasiLapolaScene");
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/kitchen.png");
    this.load.image("Kompor", "/assets/foods/kohu_kohu/Kompor.png");

    // Alat & Bahan
    this.load.image("PanciAir", "/assets/foods/nasi_lapola/PanciAir.png");
    this.load.image("PanciAir2", "/assets/foods/nasi_lapola/PanciAir2.png");
    this.load.image("Kacang", "/assets/foods/nasi_lapola/Kacang.png");
    this.load.image("Kelapa", "/assets/foods/kohu_kohu/Kelapa.png");
    this.load.image("Beras", "/assets/foods/nasi_lapola/Beras.png");
    this.load.image("Garam", "/assets/foods/nasi_lapola/Garam.png");
    this.load.image("Sepatula", "/assets/foods/kohu_kohu/sepatula.png");

    // Variasi Panci
    this.load.image("PanciKacang", "/assets/foods/nasi_lapola/PanciKacang.png");
    this.load.image("PanciSaring", "/assets/foods/nasi_lapola/PanciSaring.png");
    this.load.image("PanciKelapa", "/assets/foods/nasi_lapola/PanciKelapa.png");
    this.load.image("PanciBeras", "/assets/foods/nasi_lapola/PanciBeras.png");
    this.load.image("PanciKelapaGaram", "/assets/foods/nasi_lapola/PanciKelapaGaram.png");
    this.load.image("PanciKacang2", "/assets/foods/nasi_lapola/PanciKacang2.png"); // Hasil akhir
    this.load.image("PanciBerasKelapa", "/assets/foods/nasi_lapola/PanciBerasKelapa.png");
    this.load.image("PanciNasiLapola", "/assets/foods/nasi_lapola/PanciNasiLapola.png");

    // Animasi Aduk
    this.load.image("PanciAirSepatula", "/assets/foods/nasi_lapola/PanciAirSepatula.png");
    this.load.image("PanciAirSepatula2", "/assets/foods/nasi_lapola/PanciAirSepatula2.png");
    this.load.image("PanciAirSepatula3", "/assets/foods/nasi_lapola/PanciAirSepatula3.png");
    this.load.image("AdukKacang", "/assets/foods/nasi_lapola/AdukKacang.png");
    this.load.image("AdukKacang2", "/assets/foods/nasi_lapola/AdukKacang2.png");
    this.load.image("Piring", "/assets/foods/nasi_lapola/Piring.png");
    this.load.image("KukusNasi", "/assets/foods/nasi_lapola/KukusNasi.png");
    this.load.image("NasiLapola", "/assets/foods/nasi_lapola/NasiLapola.png");
  }

  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");
    bg.setScale(Math.max(this.cameras.main.width / bg.width, this.cameras.main.height / bg.height));

    // 1. ZONA & KOMPOR
    // Zona kompor kiri
    const komporKiri = this.add.image(this.cameras.main.width / 4, this.cameras.main.height - 150, "Kompor").setScale(0.4);
    this.komporKiriZone = this.add.zone(komporKiri.x, komporKiri.y - 100, 200, 200).setRectangleDropZone(200, 200);
    this.komporKiriZone.name = "komporKiri";

    // Zona kompor kanan
    const komporKanan = this.add.image(this.cameras.main.width / 2, this.cameras.main.height - 150, "Kompor").setScale(0.4);
    this.komporKananZone = this.add.zone(komporKanan.x, komporKanan.y - 100, 200, 200).setRectangleDropZone(200, 200);
    this.komporKananZone.name = "komporKanan";
    
    // Zona samping kanan untuk menaruh panci
    this.stagingZone = this.add.zone(this.cameras.main.width - 200, this.cameras.main.height / 2, 300, 400).setRectangleDropZone(300, 400);
    this.stagingZone.name = "staging";
    // Debug staging zone
    // const graphics = this.add.graphics();
    // graphics.lineStyle(2, 0xffff00);
    // graphics.strokeRect(this.stagingZone.x - this.stagingZone.input.hitArea.width / 2, this.stagingZone.y - this.stagingZone.input.hitArea.height / 2, this.stagingZone.input.hitArea.width, this.stagingZone.input.hitArea.height);


    // 2. PANCI AWAL
    this.panciKiri = this.add.image(this.komporKiriZone.x, this.komporKiriZone.y, "PanciAir").setScale(0.4).setInteractive();
    this.panciKanan = this.add.image(this.komporKananZone.x, this.komporKananZone.y, "PanciSaring").setScale(0.4).setInteractive();
    
    // 3. BAHAN-BAHAN (di sisi kanan)
    const ingredientX = this.cameras.main.width - 150;
    const initialY = 150;
    const verticalSpacing = 80;
    const ingredients = ["Kacang", "Kelapa", "Beras", "Garam", "Sepatula", "PanciAir2", "PanciSaring", "Piring"];
    ingredients.forEach((key, i) => {
      const ingredient = this.add.image(ingredientX, initialY + i * verticalSpacing, key)
        .setInteractive()
        .setScale(0.3);
      ingredient.name = key;
      this.input.setDraggable(ingredient);
    });

    this.initDragAndDrop();
  }

  private initDragAndDrop() {
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("dragend", (pointer, gameObject, dropped) => {
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });

    this.input.on("drop", (pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedKey = gameObject.name;

      // --- LOGIKA UNTUK PANCI KIRI ---
      if (dropZone === this.komporKiriZone && this.statePanciKiri === "air" && droppedKey === "Kacang") {
        this.panciKiri.setTexture("PanciKacang");
        this.statePanciKiri = "kacang_matang";
        this.input.setDraggable(this.panciKiri); // Sekarang panci bisa di-drag
        gameObject.destroy();
      }
      // --- LOGIKA UNTUK PANCI KANAN ---
      else if (dropZone === this.komporKananZone && this.statePanciKanan === "air" && droppedKey === "Kelapa") {
        this.panciKanan.setTexture("PanciKelapa");
        this.statePanciKanan = "kelapa_matang";
        this.input.setDraggable(this.panciKanan); // Sekarang panci bisa di-drag
        gameObject.destroy();
      }
      // --- LOGIKA MENARUH PANCI KE STAGING AREA ---
      else if (dropZone === this.stagingZone) {
        if (gameObject === this.panciKiri && this.statePanciKiri === "kacang_matang") {
            this.isPanciKiriStaged = true;
            // Biarkan panci dapat di-drag lagi
        }
        if (gameObject === this.panciKanan && this.statePanciKanan === "kelapa_matang") {
            this.isPanciKananStaged = true;
            // Biarkan panci dapat di-drag lagi
        }
      }
      // --- LOGIKA MEMASAK BERAS (DENGAN PANCI AIR 2) ---
      // 1. Taruh PanciAir2 ke kompor
      else if ((dropZone === this.komporKiriZone || dropZone === this.komporKananZone) && this.statePanciMasak === "empty" && droppedKey === "PanciAir2") {
          this.panciMasak = this.add.image(dropZone.x, dropZone.y, "PanciAir2").setScale(0.4).setInteractive();
          this.input.setDraggable(this.panciMasak);
          this.statePanciMasak = "air";
          gameObject.destroy();
      }
      // 2. Taruh Beras ke PanciAir2 (tidak ada perubahan visual)
      else if (this.panciMasak && this.panciMasak.texture.key === "PanciAir2" && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && this.statePanciMasak === "air" && droppedKey === "Beras") {
          this.statePanciMasak = "beras_mentah";
          gameObject.destroy();
      }
      // 3. Aduk dengan Sepatula, animasi, lalu jadi PanciBeras
      else if (this.panciMasak && this.panciMasak.texture.key === "PanciAir2" && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && this.statePanciMasak === "beras_mentah" && droppedKey === "Sepatula") {
          this.statePanciMasak = "beras_diaduk";
          // Kembalikan sepatula ke posisi semula agar bisa dipakai lagi
          gameObject.x = gameObject.input.dragStartX;
          gameObject.y = gameObject.input.dragStartY;
          
          // Simpan tekstur awal untuk animasi
          const initialTexture = this.panciMasak.texture.key;

          const animTimer = this.time.addEvent({
              delay: 300,
              repeat: 2, // Akan berjalan 3 kali (0, 1, 2)
              callback: () => {
                  const currentTexture = this.panciMasak.texture.key;
                  if (currentTexture === initialTexture) {
                      this.panciMasak.setTexture("PanciAirSepatula");
                  } else if (currentTexture === "PanciAirSepatula") {
                      this.panciMasak.setTexture("PanciAirSepatula2");
                  } else {
                      this.panciMasak.setTexture("PanciAirSepatula3");
                  }
              }
          });

          this.time.delayedCall(1200, () => {
              animTimer.destroy();
              this.panciMasak.setTexture("PanciBeras"); // Hasil akhir
              this.statePanciMasak = "beras_matang";
          });
      }
      // --- LOGIKA PENGGABUNGAN SETELAH NASI MASAK ---
      // 4. Gabungkan PanciKelapa ke PanciBeras
      else if (this.panciMasak && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && this.statePanciMasak === "beras_matang" && gameObject === this.panciKanan && this.statePanciKanan === "kelapa_matang") {
          this.panciMasak.setTexture("PanciBerasKelapa");
          this.statePanciMasak = "beras_kelapa";
          this.panciKanan.destroy();
          this.isPanciKananStaged = false; // Reset flag
      }
      // 5. Tambahkan Garam ke PanciBerasKelapa (tidak ada perubahan visual)
      else if (this.panciMasak && this.panciMasak.texture.key === "PanciBerasKelapa" && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && this.statePanciMasak === "beras_kelapa" && droppedKey === "Garam") {
          this.statePanciMasak = "beras_kelapa_garam";
          gameObject.destroy();
      }
      // 6. (FINAL) Gabungkan PanciKacang untuk menjadi Nasi Lapola
      else if (this.panciMasak && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && this.statePanciMasak === "beras_kelapa_garam" && gameObject === this.panciKiri && this.statePanciKiri === "kacang_matang") {
          this.panciMasak.setTexture("PanciNasiLapola");
          this.statePanciMasak = "final";
          this.panciKiri.destroy();
          this.isPanciKiriStaged = false; // Reset flag

          // TODO: Pindah ke scene Result
          this.time.delayedCall(1000, () => {
            // this.scene.start('ResultScene', { score: 100 });
          });
      }
      // 7. Aduk Nasi Lapola yang sudah jadi
      else if (this.panciMasak && this.panciMasak.texture.key === "PanciNasiLapola" && Phaser.Geom.Rectangle.Contains(this.panciMasak.getBounds(), pointer.x, pointer.y) && this.statePanciMasak === "final" && droppedKey === "Sepatula") {
          // Kembalikan sepatula ke posisi semula
          gameObject.x = gameObject.input.dragStartX;
          gameObject.y = gameObject.input.dragStartY;

          // Animasi mengaduk
          const initialTexture = this.panciMasak.texture.key; // PanciNasiLapola
          this.panciMasak.setTexture("AdukKacang");

          const animTimer = this.time.addEvent({
              delay: 300,
              repeat: 3, // Loop 4 times total
              callback: () => {
                  if (this.panciMasak.texture.key === "AdukKacang") {
                      this.panciMasak.setTexture("AdukKacang2");
                  } else {
                      this.panciMasak.setTexture("AdukKacang");
                  }
              }
          });

          this.time.delayedCall(1200, () => { // 300ms * 4
              animTimer.destroy();
              this.panciMasak.setTexture(initialTexture); // Kembali ke PanciNasiLapola
          });
      }
      // --- LOGIKA MENGUKUS DAN MENYAJIKAN ---
      // 8. Taruh PanciSaring (baru) ke kompor untuk mengukus
      else if ((dropZone === this.komporKiriZone || dropZone === this.komporKananZone) && !this.panciKukus && droppedKey === "PanciSaring") {
          this.panciKukus = this.add.image(dropZone.x, dropZone.y, "PanciSaring").setScale(0.4).setInteractive();
          this.statePanciKukus = "air"; // State awal untuk panci kukus
          gameObject.destroy();
      }
      // 9. Drag PanciNasiLapola ke PanciSaring untuk dikukus
      else if (this.panciKukus && this.statePanciKukus === "air" && gameObject === this.panciMasak && this.statePanciMasak === "final" && Phaser.Geom.Rectangle.Contains(this.panciKukus.getBounds(), pointer.x, pointer.y)) {
          this.panciKukus.setTexture("KukusNasi");
          this.statePanciKukus = "kukus";
          this.panciMasak.destroy();
          this.panciMasak = null;
      }
      // 10. Sajikan dengan Piring
      else if (this.panciKukus && this.statePanciKukus === "kukus" && droppedKey === "Piring" && Phaser.Geom.Rectangle.Contains(this.panciKukus.getBounds(), pointer.x, pointer.y)) {
          this.panciKukus.setTexture("NasiLapola"); // Ini adalah gambar final di atas piring
          this.statePanciKukus = "plated";
          this.panciKukus.disableInteractive();
          gameObject.destroy(); // Hancurkan piring

          // Selesai!
          this.time.delayedCall(2000, () => {
            // this.scene.start('ResultScene', { score: 100 });
          });
      }
      // Jika salah langkah, kembalikan objek ke posisi awal
      else {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });
  }
}