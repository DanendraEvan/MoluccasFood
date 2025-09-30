// src/game/GameEngine.ts
import Phaser from 'phaser';
import PapedaScene from './scenes/PapedaScene';
import KohuKohuScene from './scenes/KohuKohuScene';
import NasiLapolaScene from './scenes/NasiLapolaScene';
import ColoColoScene from './scenes/ColoColoScene';
import IkanKuahKuningScene from './scenes/IkanKuahKuningScene';

export function createGame(food: 'papeda' | 'kohukohu' | 'nasi_lapola' | 'colo_colo' | 'ikan_kuahkuning'): Phaser.Game {
  // Map food names to scene classes
  const sceneMap: Record<string, typeof Phaser.Scene> = {
    'papeda': PapedaScene,
    'kohukohu': KohuKohuScene,
    'nasi_lapola': NasiLapolaScene,
    'colo_colo': ColoColoScene,
    'ikan_kuahkuning': IkanKuahKuningScene,
  };

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#2d2d2d',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: sceneMap[food],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  return new Phaser.Game(config);
}