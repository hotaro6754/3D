import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirthdayThemeConfig } from '../../engine/world/BirthdayThemeConfig';
import type { PortfolioContext } from '../../engine/core/Context';

interface BirthdayVideoUIProps {
  ctx: PortfolioContext | null;
  visible: boolean;
  onClose: () => void;
}

export const BirthdayVideoUI: React.FC<BirthdayVideoUIProps> = ({ ctx, visible, onClose }) => {
  const [loadError, setLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsUserPlay, setNeedsUserPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (visible) {
      setLoadError(false);
      setIsPlaying(false);
      setNeedsUserPlay(false);

      if (ctx?.audio) {
        (ctx.audio as any).duckForVideo?.(true);
      }

      // Attempt autoplay after brief mount
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            setNeedsUserPlay(true);
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (ctx?.audio) {
        (ctx.audio as any).duckForVideo?.(false);
      }
    }
  }, [visible, ctx]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key.toLowerCase() === 'e') {
        if (loadError) {
          onClose();
        } else if (needsUserPlay && videoRef.current) {
          videoRef.current.play().then(() => {
            setIsPlaying(true);
            setNeedsUserPlay(false);
          });
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, loadError, needsUserPlay, onClose]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
          color: '#f8fafc',
          padding: '24px'
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '840px',
            maxWidth: '92vw',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(244, 114, 182, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(244, 114, 182, 0.15)',
            borderRadius: '16px',
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}
        >
          {/* Header */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(244, 114, 182, 0.2)',
            paddingBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#f472b6',
                boxShadow: '0 0 10px #f472b6'
              }} />
              <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.2em', color: '#fbcfe8' }}>
                DISTRICT WATCH // CELEBRATION DIRECTIVE 🌸
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#f472b6', letterSpacing: '0.1em', fontWeight: 600 }}>
              // CONFIDENTIAL & SPECIAL
            </span>
          </div>

          <div style={{
            width: '100%',
            backgroundColor: 'rgba(244, 114, 182, 0.1)',
            border: '1px solid rgba(244, 114, 182, 0.25)',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '0.9rem',
            color: '#fed7aa',
            textAlign: 'center',
            letterSpacing: '0.05em'
          }}>
            ✦ ALERT: System scanning confirms you are the most incredible person today. Happy Birthday! ✦
          </div>

          {/* Video Container / Fallback View */}
          <div style={{
            width: '100%',
            height: '420px',
            maxHeight: '56vh',
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {loadError ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span style={{ fontSize: '32px' }}>🌸</span>
                <p style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: '#fbcfe8',
                  lineHeight: 1.6
                }}>
                  THE SURPRISE IS TAKING A LITTLE LONGER TO ARRIVE.
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '420px', lineHeight: 1.5 }}>
                  (Place your video file at <code style={{ color: '#38bdf8' }}>{BirthdayThemeConfig.videoAsset}</code> to view it here.)
                </p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={BirthdayThemeConfig.videoAsset}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#000'
                  }}
                  controls
                  playsInline
                  muted={false}
                  onError={() => setLoadError(true)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {needsUserPlay && !isPlaying && (
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.play().then(() => {
                          setIsPlaying(true);
                          setNeedsUserPlay(false);
                        });
                      }
                    }}
                    style={{
                      position: 'absolute',
                      padding: '14px 28px',
                      background: 'rgba(244, 114, 182, 0.25)',
                      border: '1px solid #f472b6',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '14px',
                      letterSpacing: '0.15em',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(244, 114, 182, 0.4)',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    [ E ] PLAY VIDEO
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer Controls */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '6px'
          }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
              PRESS [E] OR [ESC] TO CLOSE
            </span>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                background: 'rgba(244, 114, 182, 0.2)',
                border: '1px solid rgba(244, 114, 182, 0.6)',
                borderRadius: '8px',
                color: '#fbcfe8',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(244, 114, 182, 0.35)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(244, 114, 182, 0.2)';
                e.currentTarget.style.color = '#fbcfe8';
              }}
            >
              [ E ] CLOSE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
