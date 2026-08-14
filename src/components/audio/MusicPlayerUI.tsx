import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from './MusicProvider';

interface Props {
  visible: boolean;
  onStand: () => void;
}

export const MusicPlayerUI: React.FC<Props> = ({ visible, onStand }) => {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, stop, playTrack, tracks } = useMusic();

  useEffect(() => {
    if (!visible) {
      stop();
    } else if (visible && !isPlaying && tracks.length > 0) {
      playTrack(tracks[0]);
    }
  }, [visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key.toLowerCase() === 'e' || e.key === 'Escape') {
        onStand();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onStand]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50, transition: { duration: 0.2 } }}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '15px',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif'
          }}
        >
          {/* Track Info */}
          <div style={{
            background: '#0052cc',
            padding: '15px 30px',
            border: '2px solid #fff',
            boxShadow: '4px 4px 0 #000',
            transform: 'skewX(-10deg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: '250px'
          }}>
            <div style={{ transform: 'skewX(10deg)' }}>
              <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '4px' }}>
                NOW PLAYING
              </div>
              <div style={{ fontSize: '18px', color: '#fff', fontWeight: 900, textTransform: 'uppercase' }}>
                {currentTrack?.title || 'NO TRACK'}
              </div>
              <div style={{ fontSize: '12px', color: '#b3d4ff', fontWeight: 'bold', marginTop: '2px' }}>
                {currentTrack?.artist || 'UNKNOWN'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#0052cc', color: '#fff' }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTrack}
              style={{
                background: '#fff',
                border: '2px solid #000',
                color: '#000',
                padding: '10px 15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transform: 'skewX(-10deg)'
              }}
            >
              <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>|&lt;</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#0052cc', color: '#fff' }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              style={{
                background: '#fff',
                border: '2px solid #000',
                color: '#000',
                padding: '10px 25px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transform: 'skewX(-10deg)'
              }}
            >
              <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#0052cc', color: '#fff' }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTrack}
              style={{
                background: '#fff',
                border: '2px solid #000',
                color: '#000',
                padding: '10px 15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transform: 'skewX(-10deg)'
              }}
            >
              <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>&gt;|</span>
            </motion.button>
          </div>
          
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
             <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStand}
              style={{
                background: '#000',
                border: '2px solid #fff',
                color: '#fff',
                padding: '8px 20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                letterSpacing: '1px'
              }}
            >
              [E] STAND UP
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
