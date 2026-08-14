import { useEffect, useState, useRef, useCallback } from 'react';
import { AudioDirector } from '../engine/audio';

const STORAGE_KEY = 'harshith-district-audio';

interface AudioState {
  volume: number;
  muted: boolean;
}

export function useAudio() {
  const [audioReady, setAudioReady] = useState(false);
  const [volume, setVolumeState] = useState(1.0);
  const [muted, setMutedState] = useState(false);
  
  const directorRef = useRef<AudioDirector | null>(null);

  // Initialize from storage once
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: AudioState = JSON.parse(stored);
        setVolumeState(state.volume ?? 1.0);
        setMutedState(state.muted ?? false);
      }
    } catch (e) {
      console.warn('Failed to read audio state from storage', e);
    }
  }, []);

  // Sync state to audio director and local storage
  const syncState = useCallback((vol: number, isMuted: boolean) => {
    if (directorRef.current) {
      directorRef.current.masterVolume = vol;
      directorRef.current.muted = isMuted;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: vol, muted: isMuted }));
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    syncState(vol, muted);
  }, [muted, syncState]);

  const setMuted = useCallback((isMuted: boolean) => {
    setMutedState(isMuted);
    syncState(volume, isMuted);
  }, [volume, syncState]);

  // Setup audio lifecycle
  useEffect(() => {
    const director = new AudioDirector();
    director.masterVolume = volume;
    director.muted = muted;
    directorRef.current = director;

    const handleInteraction = () => {
      if (!director.unlocked) {
        director.unlock();
        setAudioReady(true);
      }
    };

    // Unlock audio on first user gesture
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      director.dispose();
      directorRef.current = null;
    };
    // We intentionally omit volume/muted from deps to avoid recreating the director
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    director: directorRef.current,
    audioReady,
    volume,
    setVolume,
    muted,
    setMuted,
  };
}
