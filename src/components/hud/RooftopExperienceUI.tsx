import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirthdayThemeConfig } from '../../engine/world/BirthdayThemeConfig';
import type { PortfolioContext } from '../../engine/core/Context';

interface RooftopExperienceUIProps {
  ctx: PortfolioContext | null;
  visible: boolean;
  onClose: () => void;
}

export const RooftopExperienceUI: React.FC<RooftopExperienceUIProps> = ({ ctx, visible, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
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

      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            setNeedsUserPlay(true);
          });
        }
      }, 150);

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
        if (needsUserPlay && videoRef.current) {
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
  }, [visible, needsUserPlay, onClose]);

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
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
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
            width: '920px',
            maxWidth: '94vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            border: '1px solid rgba(244, 114, 182, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(244, 114, 182, 0.15)',
            borderRadius: '16px',
            padding: '28px 36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Header */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(244, 114, 182, 0.25)',
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
                ROOFTOP OBSERVATION // A TRIBUTE
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.1em' }}>
              // NIGHT WORKSHOP
            </span>
          </div>

          {/* Scrolling Heartfelt Tribute Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              padding: '18px 24px',
              background: 'rgba(244, 114, 182, 0.08)',
              border: '1px solid rgba(244, 114, 182, 0.25)',
              borderRadius: '12px',
              color: '#fdf2f8',
              lineHeight: '1.7',
              fontSize: '14.5px',
              fontStyle: 'italic',
              letterSpacing: '0.02em',
              textAlign: 'center'
            }}
          >
            "Thank you for your motivation, for your guidance, and for all your help. You have truly inspired me to become the best version of myself. I thank you so much, and wish a very, very Happy Birthday to my best friend and mentor! 🌸"
          </motion.div>

          {/* Video Container */}
          <div style={{
            width: '100%',
            height: '380px',
            maxHeight: '48vh',
            background: 'rgba(15, 23, 42, 0.85)',
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
                padding: '30px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>🌸</span>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#fbcfe8'
                }}>
                  THE SURPRISE IS TAKING A MOMENT TO LOAD.
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Video file ready at {BirthdayThemeConfig.videoAsset}
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
              PRESS [E] OR [ESC] TO RETURN TO ROOFTOP
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
              [ E ] CONTINUE EXPLORING
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
