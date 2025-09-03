// src/contexts/MusicContext.tsx - FINAL MERGED VERSION
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: number;
  toggleMusic: () => void;
  setCurrentTrack: (track: number) => void; // dari versi sederhana
  setTrack: (trackNumber: number) => void;  // dari versi monitoring
  isLoading: boolean;
  hasUserInteracted: boolean;
  startMusic: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialized = useRef(false);
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

  const stopMonitoring = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
  }, []);

  const startMonitoring = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
    }

    monitoringInterval.current = setInterval(() => {
      if (!audioRef.current || !isPlaying) return;

      const audio = audioRef.current;
      const currentTime = audio.currentTime;
      const duration = audio.duration;

      if (duration > 0 && currentTime > 0) {
        const remaining = duration - currentTime;
        
        if (remaining < 0.5 || audio.ended) {
          console.log(`🎵 BGM${currentTrack} finishing (${remaining.toFixed(2)}s remaining)`);

          if (monitoringInterval.current) {
            clearInterval(monitoringInterval.current);
            monitoringInterval.current = null;
          }
          
          const nextTrack = currentTrack >= 6 ? 1 : currentTrack + 1;
          console.log(`🎵 BGM${currentTrack} → BGM${nextTrack}`);
          setTimeout(() => {
            setCurrentTrack(nextTrack);
          }, 100);
        }
      }
    }, 100);
  }, [isPlaying, currentTrack]);

  // ✅ Check file existence
  const checkFileExists = useCallback(async (trackNum: number): Promise<boolean> => {
    try {
      const response = await fetch(`/assets/bgm/bgm${trackNum}.mp3`, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // ✅ Load and play track
  const loadTrack = useCallback(async (trackNum: number) => {
    if (!audioRef.current || !hasUserInteracted) return;

    console.log(`🎵 Loading BGM${trackNum}...`);
    setIsLoading(true);
    stopMonitoring();

    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;

    const fileExists = await checkFileExists(trackNum);
    if (!fileExists) {
      console.warn(`⚠️ BGM${trackNum}.mp3 not found, trying next track`);
      setIsLoading(false);
      const nextTrack = trackNum >= 6 ? 1 : trackNum + 1;
      setTimeout(() => setCurrentTrack(nextTrack), 500);
      return;
    }

    audio.src = `/assets/bgm/bgm${trackNum}.mp3`;

    try {
      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        };

        const onError = (e: Event) => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(e);
        };

        audio.addEventListener('canplaythrough', onCanPlay);
        audio.addEventListener('error', onError);
        audio.load();
      });
      
      if (isPlaying) {
        await audio.play();
        console.log(`✅ BGM${trackNum} playing (${audio.duration.toFixed(1)}s duration)`);
        startMonitoring();
      }
    } catch (error) {
      console.error(`❌ Failed to load BGM${trackNum}:`, error);
      const nextTrack = trackNum >= 6 ? 1 : trackNum + 1;
      setTimeout(() => setCurrentTrack(nextTrack), 1000);
    } finally {
      setIsLoading(false);
    }
  }, [hasUserInteracted, isPlaying, checkFileExists, stopMonitoring, startMonitoring]);

  // ✅ Initialize audio element
  useEffect(() => {
    if (isInitialized.current) return;

    console.log('🎵 Initializing music system...');
    const audio = new Audio();
    audio.volume = 0.3;
    audio.preload = 'none';

    audioRef.current = audio;
    isInitialized.current = true;

    return () => {
      stopMonitoring();
      if (audio) {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      }
      isInitialized.current = false;
    };
  }, [stopMonitoring]);

  // ✅ Track changes
  useEffect(() => {
    if (!isInitialized.current || !hasUserInteracted) return;
    loadTrack(currentTrack);
  }, [currentTrack, hasUserInteracted, loadTrack]);

  // ✅ Play/pause state
  useEffect(() => {
    if (!audioRef.current || !hasUserInteracted || isLoading) return;

    const audio = audioRef.current;
    if (isPlaying) {
      if (audio.paused && audio.src) {
        audio.play().then(() => startMonitoring()).catch(console.error);
      }
    } else {
      if (!audio.paused) {
        audio.pause();
        stopMonitoring();
      }
    }
  }, [isPlaying, hasUserInteracted, isLoading, startMonitoring, stopMonitoring]);

  const startMusic = async () => {
    if (hasUserInteracted) return;

    console.log('🎵 User interaction detected, starting music...');
    setHasUserInteracted(true);
    setIsPlaying(true);

    setTimeout(() => {
      loadTrack(currentTrack);
    }, 200);
  };

  const toggleMusic = () => {
    if (!hasUserInteracted) {
      startMusic();
      return;
    }

    const newState = !isPlaying;
    console.log(`🎵 Toggle: ${newState ? 'ON' : 'OFF'}`);
    setIsPlaying(newState);
  };

  const setTrack = (trackNumber: number) => {
    if (trackNumber >= 1 && trackNumber <= 6) {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        setIsPlaying(true);
      }
      console.log(`🎵 Manual track change: BGM${trackNumber}`);
      setCurrentTrack(trackNumber);
    }
  };

  return (
    <MusicContext.Provider value={{
      isPlaying,
      currentTrack,
      toggleMusic,
      setCurrentTrack, // dari versi sederhana
      setTrack,        // dari versi monitoring
      isLoading,
      hasUserInteracted,
      startMusic
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
