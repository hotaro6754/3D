import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PortfolioContext } from '../../engine/core/Context';
import { playMeowHappyBirthday } from '../../engine/audio/CatSong';

interface Persona3ThreatUIProps {
  ctx: PortfolioContext | null;
  visible: boolean;
  onClose: () => void;
}

const CUTE_EMOJIS = ['🌸', '🐾', '✨', '💖', '🐱', '🎀', '⭐', '🍰', '🎉', '(≧◡≦)', '✦', '💕'];

export const Persona3ThreatUI: React.FC<Persona3ThreatUIProps> = ({ ctx, visible, onClose }) => {
  const [scanStage, setScanStage] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; x: number; y: number; scale: number; rot: number; delay: number }>>([]);

  useEffect(() => {
    if (visible) {
      setScanStage(0);
      if (ctx?.audio) {
        ctx.audio.playConfirm();
      }
      const t1 = setTimeout(() => setScanStage(1), 700);
      const t2 = setTimeout(() => setScanStage(2), 1600);
      const t3 = setTimeout(() => {
        setScanStage(3);
        playMeowHappyBirthday();

        // Generate 45 bursting cuteness explosion particles
        const newParticles = Array.from({ length: 45 }).map((_, i) => {
          const angle = (i / 45) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          const dist = 180 + Math.random() * 320;
          return {
            id: i,
            emoji: CUTE_EMOJIS[Math.floor(Math.random() * CUTE_EMOJIS.length)],
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            scale: 0.8 + Math.random() * 1.2,
            rot: (Math.random() - 0.5) * 360,
            delay: Math.random() * 0.3
          };
        });
        setParticles(newParticles);
      }, 2500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [visible, ctx]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === 'Escape' || e.key.toLowerCase() === 'e' || e.key === ' ') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: scanStage >= 3 ? 'rgba(15, 7, 24, 0.94)' : 'rgba(5, 12, 28, 0.94)',
          backdropFilter: 'blur(14px)',
          fontFamily: '"Impact", "Segoe UI", -apple-system, sans-serif',
          overflow: 'hidden'
        }}
      >
        {/* Animated Scanlines Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 229, 255, 0.04) 0px, rgba(0, 229, 255, 0.04) 2px, transparent 2px, transparent 4px)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Background Tartarus Moon & Radial Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: '850px',
            height: '850px',
            borderRadius: '50%',
            border: `2px dashed ${scanStage >= 3 ? 'rgba(244, 114, 182, 0.3)' : 'rgba(0, 229, 255, 0.2)'}`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Bursting Cuteness Particles on Explosion */}
        {scanStage >= 3 && particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{ 
              opacity: [1, 1, 0], 
              scale: [0, p.scale, p.scale * 0.8], 
              x: p.x, 
              y: p.y, 
              rotate: p.rot 
            }}
            transition={{ duration: 2.2, delay: p.delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              zIndex: 10,
              fontSize: '28px',
              pointerEvents: 'none',
              textShadow: '0 0 15px rgba(244, 114, 182, 0.8)'
            }}
          >
            {p.emoji}
          </motion.div>
        ))}

        {/* Main Slanted Persona Card Container */}
        <motion.div
          initial={{ scale: 0.85, skewX: -8, y: 30, opacity: 0 }}
          animate={{ 
            scale: 1, 
            skewX: -8, 
            y: scanStage >= 3 ? [0, -6, 6, -4, 4, 0] : 0, 
            opacity: 1 
          }}
          exit={{ scale: 0.9, skewX: -8, opacity: 0 }}
          transition={{ 
            type: 'spring', 
            damping: 18, 
            stiffness: 140,
            y: scanStage >= 3 ? { duration: 0.5, ease: 'easeInOut' } : {}
          }}
          style={{
            position: 'relative',
            zIndex: 2,
            width: '900px',
            maxWidth: '94vw',
            background: scanStage >= 3 
              ? 'linear-gradient(135deg, #240b2b 0%, #0c0414 100%)' 
              : 'linear-gradient(135deg, #0b1528 0%, #030814 100%)',
            border: `3px solid ${scanStage >= 3 ? '#f472b6' : '#00e5ff'}`,
            boxShadow: scanStage >= 3
              ? '0 0 50px rgba(244, 114, 182, 0.45), inset 0 0 35px rgba(244, 114, 182, 0.2)'
              : '0 0 40px rgba(0, 229, 255, 0.35), inset 0 0 30px rgba(0, 229, 255, 0.1)',
            padding: '36px 44px',
            color: '#ffffff'
          }}
        >
          {/* Top Persona Header Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `2px solid ${scanStage >= 3 ? '#f472b6' : '#38bdf8'}`,
            paddingBottom: '14px',
            marginBottom: '22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                backgroundColor: scanStage >= 3 ? '#f472b6' : '#0284c7',
                color: '#fff',
                padding: '4px 14px',
                fontSize: '13px',
                fontWeight: 900,
                letterSpacing: '0.2em',
                borderRadius: '4px'
              }}>
                {scanStage >= 3 ? '🌸 AURA HARMONY' : '✦ AURA SCANNER'}
              </div>
              <span style={{ fontSize: '19px', letterSpacing: '0.15em', color: scanStage >= 3 ? '#fbcfe8' : '#7dd3fc' }}>
                PERSONALITY &amp; CHARM DIAGNOSTIC
              </span>
            </div>
            <span style={{ fontSize: '13px', color: scanStage >= 3 ? '#f472b6' : '#38bdf8', letterSpacing: '0.2em', fontFamily: 'monospace' }}>
              {scanStage >= 3 ? 'STATUS // PERFECT HARMONY 🌸' : 'STATUS // READING GENTLE VIBES'}
            </span>
          </div>

          {/* Target Profile Bar */}
          <div style={{
            background: scanStage >= 3 ? 'rgba(244, 114, 182, 0.12)' : 'rgba(56, 189, 248, 0.08)',
            borderLeft: `5px solid ${scanStage >= 3 ? '#f472b6' : '#38bdf8'}`,
            padding: '16px 22px',
            marginBottom: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.2em', fontFamily: 'monospace' }}>
                TARGET IDENTITY:
              </div>
              <div style={{ fontSize: '30px', color: '#ffffff', letterSpacing: '0.08em', fontWeight: 900, textShadow: '0 0 15px rgba(244,114,182,0.6)' }}>
                SAHITHI 🌸 (Truly Wonderful &amp; Charming)
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: scanStage >= 3 ? '#f472b6' : '#38bdf8', letterSpacing: '0.2em', fontFamily: 'monospace' }}>
                CHARM RATING:
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: '32px', color: scanStage >= 3 ? '#f472b6' : '#7dd3fc', fontWeight: 900, textShadow: '0 0 20px rgba(244,114,182,0.8)' }}
              >
                {scanStage >= 3 ? '100% PERFECT ✨' : '✦ SCANNING...'}
              </motion.div>
            </div>
          </div>

          {/* Diagnostic Log Steps */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontFamily: 'monospace',
            fontSize: '13.5px',
            marginBottom: '24px'
          }}>
            <div style={{ color: '#38bdf8' }}>
              &gt; [00:00:01] INITIATING GENTLE ESSENCE &amp; AURA SCAN...
            </div>
            
            {scanStage >= 1 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ color: '#fed7aa' }}>
                &gt; [00:00:02] DETECTED: Extraordinary grace, brilliant intellect, and a genuinely warm smile.
              </motion.div>
            )}

            {scanStage >= 2 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ color: '#f472b6' }}>
                &gt; [00:00:03] HARMONY INDEX: 100% — Effortless charm and an inspiring, unforgettable presence 🌸
              </motion.div>
            )}

            {scanStage >= 3 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ color: '#4ade80', fontWeight: 'bold' }}>
                &gt; [00:00:04] VERDICT: Someone truly one of a kind. Wishing you a beautiful birthday! ✨
              </motion.div>
            )}
          </div>

          {/* Cuteness Stats Grid */}
          {scanStage >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '22px'
              }}
            >
              <div style={{ background: 'rgba(244, 114, 182, 0.15)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(244, 114, 182, 0.4)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#fbcfe8', fontFamily: 'monospace' }}>ELEGANCE &amp; GRACE</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>🌸 100% PERFECT</div>
              </div>
              <div style={{ background: 'rgba(244, 114, 182, 0.15)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(244, 114, 182, 0.4)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#fbcfe8', fontFamily: 'monospace' }}>INTELLIGENCE &amp; CHARM</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#fbcfe8', marginTop: '4px' }}>⭐ SSS+ (MAX)</div>
              </div>
              <div style={{ background: 'rgba(244, 114, 182, 0.15)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(244, 114, 182, 0.4)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#fbcfe8', fontFamily: 'monospace' }}>KINDNESS &amp; VIBES</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>💖 UNMATCHED</div>
              </div>
            </motion.div>
          )}

          {/* Persona Styled Birthday Banner */}
          {scanStage >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'linear-gradient(90deg, rgba(244,114,182,0.9) 0%, rgba(168,85,247,0.9) 100%)',
                padding: '18px 24px',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(244,114,182,0.6)',
                borderRadius: '8px',
                marginBottom: '22px'
              }}
            >
              <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '0.15em', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                🎉 HAPPY BIRTHDAY SAHITHI! 🎉
              </div>
              <div style={{ fontSize: '14.5px', letterSpacing: '0.08em', marginTop: '6px', color: '#fdf2f8', fontStyle: 'italic' }}>
                Wishing a very Happy Birthday to someone truly amazing, brilliant, and unforgettable! 💖🌸
              </div>
            </motion.div>
          )}

          {/* Bottom Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                background: scanStage >= 3 ? '#f472b6' : '#00e5ff',
                color: scanStage >= 3 ? '#ffffff' : '#030814',
                border: 'none',
                padding: '12px 34px',
                fontSize: '14px',
                fontWeight: 900,
                letterSpacing: '0.2em',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: scanStage >= 3 ? '0 0 25px rgba(244,114,182,0.7)' : '0 0 20px rgba(0,229,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              [ E ] CELEBRATE &amp; CONTINUE 🌸
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
