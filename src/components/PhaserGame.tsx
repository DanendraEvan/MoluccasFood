// src/components/PhaserGame.tsx
import { useEffect, useRef } from 'react';
import { createGame } from '../game/GameEngine';
import type { Game } from 'phaser';

const PhaserGame = ({ food }: { food: 'papeda' | 'kohukohu' | 'nasi_lapola' | 'colo_colo' | 'ikan_kuahkuning' }) => {
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      gameRef.current = createGame(food);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [food]);

  return <div id="game-container" style={{ width: '100vw', height: '100vh' }} />;
};

export default PhaserGame;
