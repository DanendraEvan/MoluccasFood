// src/pages/Game.tsx
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const PhaserGame = dynamic(() => import('../components/PhaserGame'), {
  ssr: false,
});

const GamePage = () => {
  const router = useRouter();
  const { food } = router.query;

  if (!food || (food !== 'papeda' && food !== 'kohukohu')) {
    return <div>Invalid food selection</div>;
  }

  return <PhaserGame food={food} />;
};

export default GamePage;
