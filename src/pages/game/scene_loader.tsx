// pages/game.tsx - Improved with CSS-based Layout Control
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import KitchenBackgroundWrapper, { DialogStep, useDialogSystem } from '@/components/KitchenBackgroundWrapper';

// Scene configurations
interface GameScene {
  name: string;
  displayName: string;
  description: string;
  backgroundColor: string;
}

const gameScenes: Record<string, GameScene> = {
  kohukohu: {
    name: 'KohuKohu',
    displayName: 'Kohu-Kohu',
    description: 'Pelajari cara membuat Kohu-Kohu tradisional Maluku dengan berbagai bahan segar',
    backgroundColor: 'transparent'
  },
  nasilapola: {
    name: 'nasilapola',
    displayName: 'Nasi Lapola',
    description: 'Masak Nasi Lapola yang lezat dari Maluku dengan kacang hijau dan kelapa',
    backgroundColor: 'transparent'
  },
  colocolo: {
    name: 'colocolo',
    displayName: 'Colo-Colo',
    description: 'Belajar membuat sambal Colo-Colo khas Maluku yang pedas dan segar',
    backgroundColor: 'transparent'
  },
  ikankuahkuning: {
    name: 'ikankuahkuning',
    displayName: 'Ikan Kuah Kuning',
    description: 'Masak Ikan Kuah Kuning yang nikmat dengan bumbu rempah khas Maluku',
    backgroundColor: 'transparent'
  },
  papeda: {
    name: 'papeda',
    displayName: 'Papeda',
    description: 'Pelajari cara membuat Papeda, makanan pokok tradisional Maluku',
    backgroundColor: 'transparent'
  }
};

const GamePage: React.FC = () => {
  const router = useRouter();
  const { scene } = router.query;
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<any>(null);
  const [currentScene, setCurrentScene] = useState<GameScene | null>(null);
  const [gameStatus, setGameStatus] = useState<'loading' | 'ready' | 'playing' | 'demo'>('loading');
  const [isGameActive, setIsGameActive] = useState(false);
  const [phaserLoaded, setPhaserLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Import dialog steps
  const { getDialogStepsForScene } = require('@/components/DialogSteps');

  const dialogSteps = getDialogStepsForScene(scene as string || '');
  const dialogSystem = useDialogSystem(dialogSteps);

  // Create a bridge function to communicate with Phaser scenes
  const createDialogBridge = useCallback((game: any) => {
    console.log('=== DIALOG BRIDGE SETUP ===');

    if (!game || !game.scene) {
      console.log('❌ Dialog bridge: No game or scene manager found');
      return null;
    }

    console.log('✅ Game found, looking for scenes...');
    console.log('📋 Available scenes:', game.scene.scenes.map((s: any) => `${s.scene.key} (active: ${s.scene.isActive()})`));

    // Get the active scene - try multiple approaches
    let activeScene = game.scene.scenes.find((s: any) => s.scene.isActive());

    if (!activeScene && game.scene.scenes.length > 0) {
      // If no active scene found, try the first scene
      activeScene = game.scene.scenes[0];
      console.log('⚠️ No active scene found, using first scene:', activeScene.scene.key);
    }

    if (!activeScene) {
      console.log('❌ Dialog bridge: No scene found at all');
      return null;
    }

    console.log('🎯 Target scene:', activeScene.scene.key);

    // Create communication bridge with enhanced debugging
    const bridge = {
      nextStep: () => {
        console.log('🔄 Dialog bridge: nextStep called - current:', dialogSystem.currentStep);
        dialogSystem.nextStep();
        console.log('✅ Dialog bridge: nextStep complete - new:', dialogSystem.currentStep);
      },
      setStep: (stepIndex: number) => {
        console.log(`🎯 Dialog bridge: setStep called from ${dialogSystem.currentStep} to ${stepIndex}`);
        dialogSystem.setCurrentStep(stepIndex);
        console.log(`✅ Dialog bridge: setStep complete - current: ${dialogSystem.currentStep}`);
      },
      getCurrentStep: () => {
        const current = dialogSystem.currentStep;
        console.log(`📍 Dialog bridge: getCurrentStep called - returning ${current}`);
        return current;
      }
    };

    // Attach bridge to scene
    activeScene.dialogBridge = bridge;
    console.log('🔗 Dialog bridge: Successfully attached to scene:', activeScene.scene.key);
    console.log('📊 Initial dialog step:', dialogSystem.currentStep);
    console.log('📝 Total dialog steps:', dialogSystem.dialogSteps.length);

    // Test the bridge immediately
    console.log('🧪 Testing bridge connection...');
    const testStep = bridge.getCurrentStep();
    console.log('🧪 Bridge test result:', testStep);

    console.log('=== BRIDGE SETUP COMPLETE ===');
    return bridge;
  }, [dialogSystem]);

  // Initialize scene configuration
  useEffect(() => {
    if (!scene || typeof scene !== 'string') {
      console.error('No scene specified');
      router.push('/game/index_game');
      return;
    }

    const sceneConfig = gameScenes[scene];
    if (!sceneConfig) {
      console.error(`Scene '${scene}' not found`);
      router.push('/game/index_game');
      return;
    }

    setCurrentScene(sceneConfig);
    setLoadingProgress(20);
  }, [scene, router]);

  // Load Phaser and Scene
  useEffect(() => {
    const loadGame = async () => {
      if (!currentScene) return;

      setGameStatus('loading');
      setLoadingProgress(30);
      setErrorMessage(null);

      try {
        console.log(`Loading scene: ${currentScene.displayName}`);
        
        // Dynamic import Phaser
        const Phaser = (await import('phaser')).default;
        console.log('Phaser loaded successfully');
        setLoadingProgress(50);

        // Try to load the scene file
        let SceneClass: any;
        try {
          switch(scene) {
            case 'kohukohu':
              SceneClass = (await import('@/game/scenes/KohuKohuScene')).default;
              break;
            case 'papeda':
              SceneClass = (await import('@/game/scenes/PapedaScene')).default;
              break;
            case 'colocolo':
              SceneClass = (await import('@/game/scenes/ColoColoScene')).default;
              break;
            case 'nasilapola':
              SceneClass = (await import('@/game/scenes/NasiLapolaScene')).default;
              break;
            case 'ikankuahkuning':
              SceneClass = (await import('@/game/scenes/IkanKuahKuningScene')).default;
              break;
            default:
              throw new Error(`Unknown scene: ${scene}`);
          }
          
          console.log(`Scene class loaded: ${SceneClass.name}`);
          setPhaserLoaded(true);
          setLoadingProgress(100);
          setGameStatus('ready');
        } catch (importError) {
          console.error('Error importing scene:', importError);
          setPhaserLoaded(false);
          setGameStatus('demo');
          setErrorMessage(`Scene ${scene} tidak ditemukan. Mode demo akan diaktifkan.`);
          setLoadingProgress(100);
        }

      } catch (error) {
        console.error('Error loading game:', error);
        setGameStatus('demo');
        setPhaserLoaded(false);
        setErrorMessage('Terjadi kesalahan saat memuat game. Mode demo akan diaktifkan.');
        setLoadingProgress(100);
      }
    };

    if (currentScene) {
      loadGame();
    }
  }, [currentScene, scene]);

  // Start game handler
  const handleStartGame = async () => {
    if (!currentScene || !gameContainerRef.current) {
      console.error('Game cannot start: missing scene or container');
      setErrorMessage('Game tidak dapat dimulai: komponen tidak tersedia');
      return;
    }

    setIsGameActive(true);
    setGameStatus('playing');

    if (phaserLoaded) {
      try {
        // Dynamic import Phaser again for game creation
        const Phaser = (await import('phaser')).default;
        
        // Import the correct scene class
        let SceneClass: any;
        switch(scene) {
          case 'kohukohu':
            SceneClass = (await import('@/game/scenes/KohuKohuScene')).default;
            break;
          case 'papeda':
            SceneClass = (await import('@/game/scenes/PapedaScene')).default;
            break;
          case 'colocolo':
            SceneClass = (await import('@/game/scenes/ColoColoScene')).default;
            break;
          case 'nasilapola':
            SceneClass = (await import('@/game/scenes/NasiLapolaScene')).default;
            break;
          case 'ikankuahkuning':
            SceneClass = (await import('@/game/scenes/IkanKuahKuningScene')).default;
            break;
          default:
            throw new Error(`Unknown scene: ${scene}`);
        }

        // Enhanced Phaser Game Configuration with transparent background
        const config = {
          type: Phaser.AUTO,
          width: 1920,
          height: 1080,
          parent: gameContainerRef.current,
          backgroundColor: 'transparent',
          transparent: true,
          scene: SceneClass,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 0, x: 0 },
              debug: false
            }
          },
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1920,
            height: 1080
          },
          render: {
            antialias: true,
            pixelArt: false,
            transparent: true,
            clearBeforeRender: true,
            preserveDrawingBuffer: false
          },
          input: {
            mouse: {
              target: gameContainerRef.current
            },
            touch: {
              target: gameContainerRef.current
            }
          },
          dom: {
            createContainer: true
          },
          callbacks: {
            preBoot: (game: any) => {
              console.log('Phaser game pre-boot');
            },
            postBoot: (game: any) => {
              console.log('Phaser game post-boot');
            }
          }
        };

        console.log('Creating Enhanced Phaser Game...');
        
        // Destroy existing game if any
        if (phaserGameRef.current) {
          phaserGameRef.current.destroy(true);
          phaserGameRef.current = null;
        }

        // Create new game
        phaserGameRef.current = new Phaser.Game(config);

        // Add event listeners for game events
        if (phaserGameRef.current) {
          phaserGameRef.current.events.on('ready', () => {
            console.log('Phaser game ready');
            // Setup dialog bridge after game is ready
            const setupBridge = () => {
              console.log('Setting up dialog bridge...');
              const bridge = createDialogBridge(phaserGameRef.current);
              if (!bridge) {
                console.log('Bridge setup failed, retrying in 1 second...');
                setTimeout(setupBridge, 1000);
              }
            };
            setTimeout(setupBridge, 2000);
          });

          phaserGameRef.current.events.on('step', () => {
            // Game step event
          });
        }
        
        console.log('Enhanced Game created successfully');

      } catch (error) {
        console.error('Error creating Phaser game:', error);
        setGameStatus('demo');
        setErrorMessage('Gagal membuat game Phaser. Mode demo akan diaktifkan.');
      }
    } else {
      // Demo mode
      console.log(`Starting demo mode for: ${currentScene.displayName}`);
      setGameStatus('demo');
    }
  };

  // Back to menu handler
  const handleBackToMenu = async () => {
    try {
      // Destroy game before navigation
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
      
      await router.push('/game/index_game');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (phaserGameRef.current) {
        console.log('Cleaning up Phaser game...');
        try {
          phaserGameRef.current.destroy(true);
          phaserGameRef.current = null;
        } catch (error) {
          console.error('Error cleaning up Phaser game:', error);
        }
      }
    };
  }, []);

  // Demo mode component
  const DemoModeComponent: React.FC = () => (
    <div className="start-game-overlay">
      <div className="start-game-content">
        <h2 className="start-game-title">
          Mode Demo - {currentScene?.displayName}
        </h2>
        <p className="start-game-description">
          {currentScene?.description}
        </p>
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(255, 193, 7, 0.2))',
          borderRadius: '12px',
          border: '1px solid rgba(245, 158, 11, 0.5)'
        }}>
          <p style={{ fontSize: '14px', color: '#FCD34D' }}>
            Scene game belum tersedia. Ini adalah tampilan demo untuk menunjukkan
            antarmuka game. Fitur interaktif belum dapat digunakan.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleBackToMenu}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #6B7280, #4B5563)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontFamily: 'Chewy, cursive',
              fontWeight: 'bold',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #4B5563, #374151)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #6B7280, #4B5563)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    </div>
  );

  // Error screen component
  const ErrorScreen: React.FC<{ error: string }> = ({ error }) => (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1F2937, #111827)',
        color: 'white',
        fontFamily: 'Chewy, cursive'
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#F87171'
          }}
        >
          Oops! Terjadi Kesalahan
        </h1>
        <p
          style={{
            fontSize: '18px',
            marginBottom: '24px',
            opacity: '0.8',
            lineHeight: '1.5'
          }}
        >
          {error}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontFamily: 'Chewy, cursive',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB, #1D4ED8)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6, #2563EB)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Muat Ulang
          </button>
          <button
            onClick={handleBackToMenu}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #6B7280, #4B5563)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontFamily: 'Chewy, cursive',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #4B5563, #374151)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #6B7280, #4B5563)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    </div>
  );

  // Show error page if scene not found
  if (!currentScene && gameStatus !== 'loading') {
    return (
      <ErrorScreen error={`Scene game "${scene}" tidak ditemukan atau tidak tersedia.`} />
    );
  }

  return (
    <>
      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        .slide-in-up {
          animation: slideInUp 0.6s ease-out;
        }
        
        .glow-effect {
          animation: glow 2s ease-in-out infinite;
        }
        
        /* Game wrapper specific styles */
        .game-wrapper * {
          box-sizing: border-box;
        }
        
        .game-wrapper canvas {
          display: block !important;
          margin: 0 auto !important;
          background: transparent !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 5 !important;
        }
        
        .phaser-game-container {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          z-index: 5 !important;
          background-color: transparent !important;
          overflow: hidden !important;
        }
        
        /* Enhanced loading styles */
        .loading-progress-bar {
          background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .game-wrapper canvas {
            width: 100vw !important;
            height: 100vh !important;
          }
        }
      `}</style>

      <KitchenBackgroundWrapper
        sceneTitle={currentScene?.displayName || 'Loading...'}
        sceneDescription={currentScene?.description || 'Memuat deskripsi game...'}
        backgroundColor={currentScene?.backgroundColor || 'transparent'}
        isGameActive={isGameActive}
        onStartGame={handleStartGame}
        showStartButton={gameStatus === 'ready'}
        gameStatus={gameStatus}
        // Dialog system props
        dialogSteps={dialogSystem.dialogSteps}
        currentDialogStep={dialogSystem.currentStep}
        onDialogStepChange={dialogSystem.setCurrentStep}
        onDialogToggle={dialogSystem.setIsDialogOpen}
        showDialog={gameStatus === 'playing' && isGameActive}
        sceneName={scene as string}
        // Centralized hint system props
        foodType={scene as 'kohukohu' | 'colocolo' | 'nasilapola' | 'papeda' | 'ikankuahkuning'}
        showHintButton={gameStatus === 'playing' && isGameActive}
      >
        <div className="game-wrapper">
          {/* Demo Mode Screen */}
          {gameStatus === 'demo' && isGameActive && <DemoModeComponent />}

          {/* Main Game Container - Full screen transparent container */}
          <div
            ref={gameContainerRef}
            className="phaser-game-container"
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              overflow: 'hidden',
              zIndex: gameStatus === 'playing' ? 10 : 1
            }}
          />
        </div>
      </KitchenBackgroundWrapper>
    </>
  );
};

export default GamePage;