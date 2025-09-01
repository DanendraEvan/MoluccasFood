// src/game/GameEngine.ts
import Phaser from 'phaser';
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
    width: '100%',
    height: '100%',
    parent: 'game-container',
    scene: [सीन्स[food]],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };

  return new Phaser.Game(config);
};