// src/pages/Game.tsx
import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('../components/PhaserGame'), {
  ssr: false,
});

const GamePage = () => {
  return <PhaserGame />;
};

export default GamePage;