// src/pages/Game.tsx
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const PhaserGame = dynamic(() => import('../components/PhaserGame'), {
  ssr: false,
});

const GamePage = () => {
  const router = useRouter();
  const { food } = router.query;

  if (!food || (food !== 'papeda' && food !== 'kohukohu' && food !== 'nasi_lapola' && food !== 'colo_colo' && food !== 'ikan_kuahkuning')) {
    return <div>Invalid food selection</div>;
  }

  return <PhaserGame food={food} />;
};

export default GamePage;
