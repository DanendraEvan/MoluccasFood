// src/game/scenes/PapedaScene.ts
import Phaser from "phaser";

type BowlState = 'empty' | 'flour' | 'flour_water' | 'finished' | 'keras_with_water' | 'finished_second_stir' | 'keras_with_nipis' | 'keras_with_nipis_and_hot_water' | 'final_stir' | 'ready_to_serve' | 'served'; // Added new states

export default class PapedaScene extends Phaser.Scene {
  private mangkuk: Phaser.GameObjects.Image;
  private tepung: Phaser.GameObjects.Image;
  private water: Phaser.GameObjects.Image;
  private spoon: Phaser.GameObjects.Image;
  private piring: Phaser.GameObjects.Image;
  private airPanas: Phaser.GameObjects.Image;
  private air100ml: Phaser.GameObjects.Image;
  private nipis: Phaser.GameObjects.Image;
  private dropZone: Phaser.GameObjects.Zone;
  private bowlState: BowlState;
  private stirringTimer: Phaser.Time.TimerEvent | null = null; // To hold the repeating timer

  constructor() {
    super("PapedaScene");
    this.bowlState = 'empty';
  }

  preload() {
    this.load.image("background", "/assets/backgrounds/kitchen.png");
    this.load.image("Tepung", "/assets/foods/papeda/flour.png");
    this.load.image("Water", "/assets/foods/papeda/water.png");
    this.load.image("Spoon", "/assets/foods/papeda/spoon.png");
    this.load.image("Mangkuk", "/assets/foods/papeda/bowl.png");
    this.load.image("DenganTepung", "/assets/foods/papeda/DenganTepung.png");
    this.load.image("DenganAir", "/assets/foods/papeda/DenganAir.png");
    this.load.image("DenganEndok", "/assets/foods/papeda/Denganendok.png");

    // New images
    this.load.image("Piring", "/assets/foods/papeda/Piring.png");
    this.load.image("AirPanas", "/assets/foods/papeda/AirPanas.png");
    this.load.image("Air100ml", "/assets/foods/papeda/Air-100-ml.png");
    this.load.image("Nipis", "/assets/foods/papeda/nipis.png");

    // Papeda stirring animation images
    this.load.image("PapedaAduk1", "/assets/foods/papeda/PapedaAduk1.png");
    this.load.image("PapedaAduk2", "/assets/foods/papeda/PapedaAduk2.png");
    this.load.image("HasilAduk1", "/assets/foods/papeda/hasilAduk1.png");
    this.load.image("Keras", "/assets/foods/papeda/Keras.png");
    this.load.image("Keras2", "/assets/foods/papeda/Keras2.png");
    this.load.image("TambahanAir100Ml", "/assets/foods/papeda/Tambahan-Air-100-Ml.png");
    this.load.image("Tambahan-Nipis", "/assets/foods/papeda/Tambahan-Nipis.png");
    this.load.image("Tambahan-Air-Panas", "/assets/foods/papeda/Tambahan-Air-Panas.png");
    this.load.image("Hasil-Jadi", "/assets/foods/papeda/Hasil-Jadi.png");
    this.load.image("Papeda", "/assets/foods/papeda/Papeda.png");


    // New stirring animation images
    this.load.image("Aduk3", "/assets/foods/papeda/Aduk3.png");
    this.load.image("Aduk4", "/assets/foods/papeda/Aduk4.png");
    this.load.image("Aduk5", "/assets/foods/papeda/Aduk5.png");
    this.load.image("Aduk6", "/assets/foods/papeda/Aduk6.png");
    this.load.image("Aduk7", "/assets/foods/papeda/Aduk7.png");
    this.load.image("Aduk8", "/assets/foods/papeda/Aduk8.png");
  }

  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "background");
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    this.dropZone = this.add.zone(this.cameras.main.width / 2, this.cameras.main.height / 2, 200, 200).setRectangleDropZone(200, 200);
    
    this.mangkuk = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, "Mangkuk").setScale(0.3);

    // Ingredients
    const ingredientX = this.cameras.main.width - 100;
    const verticalSpacing = 60; // Approximate height of scaled image + 5px gap

    this.tepung = this.add.image(ingredientX, 100, "Tepung").setInteractive().setScale(0.2);
    this.water = this.add.image(ingredientX, 100 + verticalSpacing, "Water").setInteractive().setScale(0.2);
    this.spoon = this.add.image(ingredientX, 100 + 2 * verticalSpacing, "Spoon").setInteractive().setScale(0.2);

    // New ingredients below spoon
    this.piring = this.add.image(ingredientX, 100 + 3 * verticalSpacing, "Piring").setInteractive().setScale(0.2);
    this.airPanas = this.add.image(ingredientX, 100 + 4 * verticalSpacing, "AirPanas").setInteractive().setScale(0.2);
    this.air100ml = this.add.image(ingredientX, 100 + 5 * verticalSpacing, "Air100ml").setInteractive().setScale(0.2);
    this.nipis = this.add.image(ingredientX, 100 + 6 * verticalSpacing, "Nipis").setInteractive().setScale(0.2);


    this.input.setDraggable(this.tepung);
    this.input.setDraggable(this.water);
    this.input.setDraggable(this.spoon);
    this.input.setDraggable(this.piring);
    this.input.setDraggable(this.airPanas);
    this.input.setDraggable(this.air100ml);
    this.input.setDraggable(this.nipis);

    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
      gameObject.setTint(0x00ff00);
      this.children.bringToTop(gameObject);
    });

    this.input.on('dragenter', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
        this.mangkuk.setTint(0x00ff00);
    });

    this.input.on('dragleave', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
        this.mangkuk.clearTint();
    });

    this.input.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropZone: Phaser.GameObjects.Zone) => {
      const droppedItemKey = gameObject.texture.key;

      if (this.bowlState === 'empty' && droppedItemKey === 'Tepung') {
        this.mangkuk.setTexture('DenganTepung');
        this.bowlState = 'flour';
        gameObject.destroy();
      } else if (this.bowlState === 'flour' && droppedItemKey === 'Water') {
        this.mangkuk.setTexture('DenganAir');
        this.bowlState = 'flour_water';
        gameObject.destroy();
      } else if (this.bowlState === 'flour_water' && droppedItemKey === 'Spoon') {
        this.mangkuk.setTexture('PapedaAduk1'); // Start with the first stirring image
        this.bowlState = 'finished';
        // Don't destroy spoon, move it back
        if (gameObject.input) {
          gameObject.x = gameObject.input.dragStartX;
          gameObject.y = gameObject.input.dragStartY;
        }

        let isAduk1 = true;
        this.stirringTimer = this.time.addEvent({
            delay: 250, // Change image every 250ms
            callback: () => {
                if (isAduk1) {
                    this.mangkuk.setTexture('PapedaAduk2');
                }
                else {
                    this.mangkuk.setTexture('PapedaAduk1');
                }
                isAduk1 = !isAduk1;
            },
            loop: true // Loop indefinitely until stopped
        });

        // Stop stirring after 2 seconds (2000ms)
        this.time.delayedCall(2000, () => {
            if (this.stirringTimer) {
                this.stirringTimer.destroy();
                this.stirringTimer = null;
            }
            this.mangkuk.setTexture('HasilAduk1'); // Set final texture to hasilAduk1.png

            // New delayed call for Keras.png
            this.time.delayedCall(2000, () => { // 2 seconds after HasilAduk1
                this.mangkuk.setTexture('Keras');
            }, [], this);

        }, [], this);
      } else if (this.bowlState === 'finished' && droppedItemKey === 'Air100ml') {
        this.mangkuk.setTexture('TambahanAir100Ml');
        this.bowlState = 'keras_with_water';
        gameObject.destroy();

        this.time.delayedCall(1000, () => {
            let adukFrame = 3;
            this.stirringTimer = this.time.addEvent({
                delay: 250, // Change image every 250ms
                callback: () => {
                    adukFrame++;
                    if (adukFrame > 5) {
                        adukFrame = 3; // Loop Aduk3, Aduk4, Aduk5
                    }
                    this.mangkuk.setTexture('Aduk' + adukFrame);
                },
                loop: true // Loop indefinitely until stopped
            });
    
            // Stop stirring after 2 seconds (2000ms)
            this.time.delayedCall(2000, () => {
                if (this.stirringTimer) {
                    this.stirringTimer.destroy();
                    this.stirringTimer = null;
                }
                this.mangkuk.setTexture('Keras2'); // Final frame of this animation
                this.bowlState = 'finished_second_stir'; // New state after second stir
            }, [], this);
        }, [], this);

      } else if (this.bowlState === 'finished_second_stir' && droppedItemKey === 'Nipis') {
        this.mangkuk.setTexture('Tambahan-Nipis');
        this.bowlState = 'keras_with_nipis';
        gameObject.destroy();
      } else if (this.bowlState === 'keras_with_nipis' && droppedItemKey === 'AirPanas') {
        this.mangkuk.setTexture('Tambahan-Air-Panas');
        this.bowlState = 'keras_with_nipis_and_hot_water';
        gameObject.destroy();

        let adukFrame = 6;
        this.stirringTimer = this.time.addEvent({
            delay: 250, // Change image every 250ms
            callback: () => {
                adukFrame++;
                if (adukFrame > 8) {
                    adukFrame = 6; // Loop Aduk6, Aduk7, Aduk8
                }
                this.mangkuk.setTexture('Aduk' + adukFrame);
            },
            loop: true // Loop indefinitely until stopped
        });

        this.time.delayedCall(2000, () => {
            if (this.stirringTimer) {
                this.stirringTimer.destroy();
                this.stirringTimer = null;
            }
            this.time.delayedCall(1000, () => {
                this.mangkuk.setTexture('Hasil-Jadi');
                this.bowlState = 'ready_to_serve';
            }, [], this);
        }, [], this);
      } else if (this.bowlState === 'ready_to_serve' && droppedItemKey === 'Piring') {
        this.mangkuk.setTexture('Papeda');
        this.bowlState = 'served';
        gameObject.destroy();
      }
      
      this.mangkuk.clearTint();
    });

    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dropped: boolean) => {
        if (!dropped) {
            if (gameObject.input) {
              gameObject.x = gameObject.input.dragStartX;
              gameObject.y = gameObject.input.dragStartY;
            }
        }
        gameObject.clearTint();
        this.mangkuk.clearTint();
    });
  }

  update() {
  }
}