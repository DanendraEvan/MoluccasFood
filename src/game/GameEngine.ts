// src/game/GameEngine.ts
import Phaser from 'phaser';
import { Preloader } from './scenes/PreloadScene';
import PapedaScene from './scenes/PapedaScene';
import KohuKohuScene from './scenes/KohuKohuScene';
import NasiLapolaScene from './scenes/NasiLapolaScene';
import ColoColoScene from './scenes/ColoColoScene';
import IkanKuahKuningScene from './scenes/IkanKuahKuningScene';

const सीन्स = {
  papeda: PapedaScene,
  kohukohu: KohuKohuScene,
  nasi_lapola: NasiLapolaScene,
  colo_colo: ColoColoScene,
  ikan_kuahkuning: IkanKuahKuningScene,
};

export const createGame = (food: keyof typeof सीन्स) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    scene: [Preloader, सीन्स[food]],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    }
  };

  return new Phaser.Game(config);
};