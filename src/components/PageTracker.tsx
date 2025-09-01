// src/components/PageTracker.tsx - Simplified (tidak perlu tracking halaman lagi)
import { useEffect } from 'react';

const PageTracker: React.FC = () => {
  useEffect(() => {
    console.log('Music system initialized - Sequential playback: BGM1→BGM2→BGM3→BGM4→BGM5→BGM6→loop');
  }, []);

  return null; // This component doesn't render anything
};

export default PageTracker;