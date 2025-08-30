// src/pages/Game.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PhaserGame from '../components/PhaserGame';

const Game = () => {
  const router = useRouter();
  const [food, setFood] = useState<'papeda' | 'kohukohu' | 'nasi_lapola' | 'colo_colo' | 'ikan_kuahkuning' | null>(null);

  useEffect(() => {
    if (router.isReady) {
      const { food: foodParam } = router.query;
      
      if (foodParam && typeof foodParam === 'string') {
        // Validate that the food parameter is one of the allowed values
        const validFoods: ('papeda' | 'kohukohu' | 'nasi_lapola' | 'colo_colo' | 'ikan_kuahkuning')[] = [
          'papeda',
          'kohukohu', 
          'nasi_lapola',
          'colo_colo',
          'ikan_kuahkuning'
        ];
        
        if (validFoods.includes(foodParam as any)) {
          setFood(foodParam as any);
        } else {
          // Invalid food parameter, redirect to SelectFood
          router.push('/SelectFood');
        }
      } else {
        // No food parameter, redirect to SelectFood
        router.push('/SelectFood');
      }
    }
  }, [router.isReady, router.query]);

  // Show loading while router is not ready or food is not set
  if (!router.isReady || !food) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  return <PhaserGame food={food} />;
};

export default Game;
