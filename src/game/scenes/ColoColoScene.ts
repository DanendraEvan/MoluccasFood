// src/game/scenes/ColoColoScene.ts
import Phaser from 'phaser';

export default class ColoColoScene extends Phaser.Scene {
  constructor() {
    super('ColoColoScene');
  }

  preload() {
    // Preload assets for Colo-Colo here
    this.load.image('background', '/assets/backgrounds/kitchen.png');
    this.load.image('colo_colo_finished', '/assets/foods/colo_colo/colo_colo.json'); // Assuming you have a finished state image
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
        'Colo-Colo Scene - Work in Progress',
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
