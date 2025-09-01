// src/components/MusicDebug.tsx - FIXED: Default export untuk Next.js compatibility
import React, { useState, useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';

interface MusicDebugProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  compact?: boolean;
  showFileStatus?: boolean;
  showControls?: boolean;
}

const MusicDebug: React.FC<MusicDebugProps> = ({ 
  position = 'bottom-left',
  compact = false,
  showFileStatus = true,
  showControls = true
}) => {
  const { isPlaying, currentTrack, toggleMusic, setTrack, isLoading, hasUserInteracted } = useMusic();
  const [fileStatus, setFileStatus] = useState<Record<number, 'unknown' | 'exists' | 'missing'>>({});
  const [isMinimized, setIsMinimized] = useState(false);

  // Position classes
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4', 
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  const checkAllFiles = async () => {
    const newStatus: Record<number, 'unknown' | 'exists' | 'missing'> = {};
    
    for (let i = 1; i <= 6; i++) {
      try {
        const response = await fetch(`/assets/bgm/bgm${i}.mp3`, { method: 'HEAD' });
        newStatus[i] = response.ok ? 'exists' : 'missing';
      } catch {
        newStatus[i] = 'missing';
      }
    }
    
    setFileStatus(newStatus);
  };

  useEffect(() => {
    if (showFileStatus) {
      setTimeout(checkAllFiles, 1000);
    }
  }, [showFileStatus]);

  const getStatusColor = (trackNum: number) => {
    const status = fileStatus[trackNum];
    if (status === 'exists') return 'text-green-600 bg-green-100';
    if (status === 'missing') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (trackNum: number) => {
    const status = fileStatus[trackNum];
    if (status === 'exists') return '✅';
    if (status === 'missing') return '❌';
    return '❓';
  };

  if (isMinimized) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <button 
          onClick={() => setIsMinimized(false)}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="Show Music Debug Panel"
        >
          🎵
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} bg-white border border-gray-300 rounded-lg p-3 shadow-lg text-sm z-50 ${compact ? 'max-w-xs' : 'max-w-sm'}`}>
      
      {/* Header with minimize button */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">🎵 Debug</h3>
        <button 
          onClick={() => setIsMinimized(true)}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          ➖
        </button>
      </div>
      
      {/* Current Status - Always shown */}
      <div className={`mb-2 p-2 bg-blue-50 rounded ${compact ? 'text-xs' : ''}`}>
        <div className="flex justify-between">
          <span><strong>Status:</strong></span>
          <span>{isPlaying ? '▶️' : '⏸️'} {isLoading ? '🔄' : ''}</span>
        </div>
        <div className="flex justify-between">
          <span><strong>Track:</strong></span>
          <span>BGM{currentTrack}</span>
        </div>
        {!compact && (
          <div className="flex justify-between">
            <span><strong>Interaction:</strong></span>
            <span>{hasUserInteracted ? '✅' : '❌'}</span>
          </div>
        )}
      </div>

      {/* File Status - Optional */}
      {showFileStatus && !compact && (
        <div className="mb-2">
          <div className="font-semibold mb-1 text-xs">Files:</div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            {[1,2,3,4,5,6].map(trackNum => (
              <div 
                key={trackNum}
                className={`p-1 rounded text-center cursor-pointer transition-colors ${getStatusColor(trackNum)}
                  ${currentTrack === trackNum ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setTrack(trackNum)}
              >
                {getStatusIcon(trackNum)} {trackNum}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls - Optional */}
      {showControls && (
        <div className="flex gap-1 text-xs">
          <button 
            onClick={toggleMusic}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          {showFileStatus && (
            <button 
              onClick={checkAllFiles}
              className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              🔍
            </button>
          )}
        </div>
      )}

      {/* Warning - Always shown when relevant */}
      {!hasUserInteracted && (
        <div className="mt-2 p-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-center">
          ⚠️ Need user interaction
        </div>
      )}
    </div>
  );
};

export default MusicDebug;