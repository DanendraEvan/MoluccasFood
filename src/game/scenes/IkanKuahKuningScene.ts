// src/game/scenes/IkanKuahKuningScene.ts
import Phaser from 'phaser';

export default class IkanKuahKuningScene extends Phaser.Scene {
  constructor() {
    super('IkanKuahKuningScene');
  }

  preload() {
    // Preload assets for Ikan Kuah Kuning here
    this.load.image('background', '/assets/backgrounds/kitchen.png');
    this.load.image('ikan_kuahkuning_finished', '/assets/foods/ikan_kuahkuning/ikan_kuahkuning.json'); // Assuming you have a finished state image
  }

  create() {
    const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
    const scaleX = this.cameras.main.width / bg.width;
    const scaleY = this.cameras.main.height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Add placeholder text
    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        'Ikan Kuah Kuning Scene - Work in Progress',
        {
          font: '48px Chewy',
          color: '#000000',
        }
      )
      .setOrigin(0.5);
  }

  update() {
    // Add game logic here
  }
}
