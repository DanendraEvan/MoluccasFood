// src/components/PhaserGame.tsx
import { useEffect, useRef } from 'react';
import { createGame } from '../game/GameEngine';
import type { Game } from 'phaser';

const PhaserGame = () => {
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      gameRef.current = createGame();
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="game-container" style={{ width: '100vw', height: '100vh' }} />;
};

export default PhaserGame;