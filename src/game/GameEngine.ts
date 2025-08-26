// src/game/GameEngine.ts
import Phaser from 'phaser';
import CookingScene from './scenes/CookingScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  parent: 'game-container',
  scene: [CookingScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export const createGame = () => {
  return new Phaser.Game(config);
};
