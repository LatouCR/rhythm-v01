'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as Tone from 'tone';

interface AudioContextState {
  isReady: boolean;
  startAudio: () => Promise<void>;
}

const AudioContext = createContext<AudioContextState | null>(null);

// Check initial state outside of component to avoid effect
const getInitialReadyState = () => {
  if (typeof window === 'undefined') return false;
  try {
    return Tone.getContext().state === 'running';
  } catch {
    return false;
  }
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(getInitialReadyState);

  const startAudio = useCallback(async () => {
    if (Tone.getContext().state === 'running') {
      setIsReady(true);
      return;
    }

    await Tone.start();
    setIsReady(true);
    console.log('Tone.js AudioContext started');
  }, []);

  return (
    <AudioContext.Provider value={{ isReady, startAudio }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}
