import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string; // The audio file URL
}

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  stop: () => void;
  tracks: Track[];
}

const MusicContext = createContext<MusicContextType | null>(null);

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
};

const DEFAULT_TRACKS: Track[] = [
  { id: '1', title: 'Mass Destruction', artist: 'Lotus Juice', url: '/audio/mass_destruction.mp3' },
  { id: '2', title: 'Burn My Dread', artist: 'Yumi Kawamura', url: '/audio/burn_my_dread.mp3' },
  { id: '3', title: 'Want To Be Close', artist: 'Yumi Kawamura', url: '/audio/want_to_be_close.mp3' }
];

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      audioRef.current.onended = () => nextTrack();
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn("Audio play blocked by browser. User interaction needed.", e);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentIndex]);

  const currentTrack = tracks[currentIndex] || null;

  const playTrack = (track: Track) => {
    const index = tracks.findIndex(t => t.id === track.id);
    if (index !== -1) {
      setCurrentIndex(index);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current?.src && currentTrack) {
      if (audioRef.current) audioRef.current.src = currentTrack.url;
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const nextIdx = (currentIndex + 1) % tracks.length;
    setCurrentIndex(nextIdx);
    if (audioRef.current) {
      audioRef.current.src = tracks[nextIdx].url;
      audioRef.current.currentTime = 0;
    }
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    }
  };

  const prevTrack = () => {
    const prevIdx = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentIndex(prevIdx);
    if (audioRef.current) {
      audioRef.current.src = tracks[prevIdx].url;
      audioRef.current.currentTime = 0;
    }
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    }
  };

  const stop = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <MusicContext.Provider value={{
      currentTrack,
      isPlaying,
      volume,
      playTrack,
      togglePlay,
      setVolume,
      nextTrack,
      prevTrack,
      stop,
      tracks
    }}>
      {children}
    </MusicContext.Provider>
  );
};
