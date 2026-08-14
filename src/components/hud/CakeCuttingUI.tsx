import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  playMeowHappyBirthday, 
  playSingleCatPurrMeow, 
  playCatNomSound, 
  playCandleBlowSound, 
  playCakeSliceSound 
} from '../../engine/audio/CatSong';

function fireConfetti(count = 40, colors = ['#fbcfe8', '#f472b6', '#fed7aa', '#38bdf8', '#fbbf24', '#ffffff']) {
  if (typeof document === 'undefined') return;
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 8 + 6;
    const col = colors[Math.floor(Math.random() * colors.length)];
    p.style.position = 'absolute';
    p.style.width = `${size}px`;
    p.style.height = `${size * 0.8}px`;
    p.style.backgroundColor = col;
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    p.style.left = `${Math.random() * 80 + 10}vw`;
    p.style.top = `${Math.random() * 25 + 20}vh`;
    p.style.opacity = '1';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.transition = `all ${Math.random() * 1.2 + 1.0}s cubic-bezier(0.25, 1, 0.5, 1)`;
    container.appendChild(p);

    requestAnimationFrame(() => {
      p.style.top = `${window.innerHeight + 40}px`;
      p.style.left = `${parseFloat(p.style.left) + (Math.random() * 160 - 80)}px`;
      p.style.transform = `rotate(${Math.random() * 720}deg) scale(${Math.random() * 0.5 + 0.5})`;
      p.style.opacity = '0';
    });
  }

  setTimeout(() => {
    container.remove();
  }, 2400);
}

interface CakeCuttingUIProps {
  visible: boolean;
  onClose: () => void;
}

interface CatGuest {
  id: string;
  name: string;
  avatar: string;
  color: string;
  quote: string;
  eaten: boolean;
  pitch: number;
}

const INITIAL_CATS: CatGuest[] = [
  { id: 'ginger', name: 'Ginger', avatar: '🐱', color: '#f59e0b', quote: 'Purrr~ Happy Birthday Sahithi! 🌸', eaten: false, pitch: 1.0 },
  { id: 'snowball', name: 'Snowball', avatar: '🤍', color: '#ffffff', quote: 'Meow! You are truly one of a kind! ✨', eaten: false, pitch: 1.15 },
  { id: 'calico', name: 'Calico', avatar: '🐾', color: '#fb923c', quote: 'Nyaa~ Wishing you endless smiles! 💖', eaten: false, pitch: 0.9 },
  { id: 'tuxedo', name: 'Tuxedo', avatar: '🎩', color: '#64748b', quote: 'Meow~ Best birthday celebration ever! 🎀', eaten: false, pitch: 0.85 },
  { id: 'tabby', name: 'Tabby', avatar: '🍰', color: '#d97706', quote: 'Meow! You shine brighter than the stars! ⭐', eaten: false, pitch: 1.05 },
  { id: 'kitten', name: 'Kitten', avatar: '🎀', color: '#f472b6', quote: '*soft purr* Happy Birthday Sahithi! 🐱', eaten: false, pitch: 1.3 },
  { id: 'siamese', name: 'Siamese', avatar: '🌸', color: '#cbd5e1', quote: 'Purrr~ This cake is delicious! 🍓', eaten: false, pitch: 1.1 },
  { id: 'shadow', name: 'Shadow', avatar: '🌟', color: '#334155', quote: 'Purrrrr... Hope this brings a warm smile to you! ✨', eaten: false, pitch: 0.8 }
];

export const CakeCuttingUI: React.FC<CakeCuttingUIProps> = ({ visible, onClose }) => {
  const [stage, setStage] = useState<'wish' | 'sliced' | 'feeding' | 'party'>('wish');
  const [candlesLit, setCandlesLit] = useState(true);
  const [cats, setCats] = useState<CatGuest[]>(INITIAL_CATS);
  const [fedCount, setFedCount] = useState(0);
  const [lastFedCat, setLastFedCat] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStage('wish');
      setCandlesLit(true);
      setCats(INITIAL_CATS.map(c => ({ ...c, eaten: false })));
      setFedCount(0);
      setLastFedCat(null);
    }
  }, [visible]);

  // Handle Blowing Candles
  const handleBlowCandles = () => {
    playCandleBlowSound();
    setCandlesLit(false);
    fireConfetti(45, ['#fbcfe8', '#f472b6', '#fed7aa', '#ffffff']);

    setTimeout(() => {
      setStage('sliced');
    }, 900);
  };

  // Handle Slicing Cake
  const handleSliceCake = () => {
    playCakeSliceSound();
    fireConfetti(50, ['#fda4af', '#f43f5e', '#fed7aa', '#fef08a']);

    setTimeout(() => {
      setStage('feeding');
    }, 700);
  };

  // Handle Feeding a Cat
  const handleFeedCat = (catId: string) => {
    const cat = cats.find(c => c.id === catId);
    if (!cat || cat.eaten) return;

    playCatNomSound();
    setTimeout(() => {
      playSingleCatPurrMeow(cat.pitch);
    }, 120);

    setLastFedCat(cat.name);

    const updated = cats.map(c => c.id === catId ? { ...c, eaten: true } : c);
    setCats(updated);
    const newCount = fedCount + 1;
    setFedCount(newCount);

    fireConfetti(25, ['#f472b6', '#38bdf8', '#fbbf24']);

    if (newCount >= cats.length) {
      setTimeout(() => {
        setStage('party');
        playMeowHappyBirthday();
        fireConfetti(100, ['#f472b6', '#ec4899', '#38bdf8', '#fbbf24', '#ffffff']);
      }, 900);
    }
  };

  // Feed Next Available Cat
  const handleFeedNext = () => {
    const nextCat = cats.find(c => !c.eaten);
    if (nextCat) {
      handleFeedCat(nextCat.id);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1500,
          background: 'rgba(3, 7, 18, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 180 }}
          style={{
            position: 'relative',
            width: '860px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%)',
            border: '2px solid rgba(244, 114, 182, 0.5)',
            borderRadius: '28px',
            padding: '36px 40px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 50px rgba(244, 114, 182, 0.25)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          {/* Header Title */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '0.25em',
              color: '#f472b6',
              marginBottom: '6px',
              fontFamily: 'monospace'
            }}>
              ✦ SPECIAL BIRTHDAY CEREMONY ✦
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: '#ffffff',
              textShadow: '0 0 20px rgba(244, 114, 182, 0.6)'
            }}>
              🌸 Sahithi's Birthday Cake &amp; Cat Feast 🎂
            </h2>
          </div>

          {/* 3D-Styled Interactive Cake Representation */}
          <div style={{
            position: 'relative',
            width: '280px',
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}>
            {/* Flickering / Blown Candles */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
              {[0, 1, 2, 3, 4].map(idx => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {candlesLit ? (
                    <motion.div
                      animate={{ scale: [1, 1.25, 0.95, 1.1], y: [0, -2, 1, 0] }}
                      transition={{ duration: 0.6 + idx * 0.1, repeat: Infinity }}
                      style={{
                        width: '12px',
                        height: '18px',
                        background: 'radial-gradient(circle, #fef08a 20%, #f97316 80%)',
                        borderRadius: '50% 50% 35% 35%',
                        boxShadow: '0 0 16px #f59e0b, 0 0 30px #f43f5e'
                      }}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0.8, y: 0 }}
                      animate={{ opacity: 0, y: -15 }}
                      transition={{ duration: 1.2 }}
                      style={{
                        width: '6px',
                        height: '6px',
                        background: '#94a3b8',
                        borderRadius: '50%'
                      }}
                    />
                  )}
                  <div style={{ width: '4px', height: '22px', background: 'linear-gradient(to bottom, #f472b6, #38bdf8)', borderRadius: '2px' }} />
                </div>
              ))}
            </div>

            {/* Top Cake Tier */}
            <div style={{
              width: '180px',
              height: '50px',
              background: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)',
              borderRadius: '16px 16px 8px 8px',
              boxShadow: '0 4px 15px rgba(244, 114, 182, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <span style={{ fontSize: '18px' }}>🍓 🌸 🍓</span>
            </div>

            {/* Bottom Cake Tier */}
            <div style={{
              width: '260px',
              height: '65px',
              background: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)',
              borderRadius: '18px 18px 10px 10px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '13px',
              letterSpacing: '0.15em',
              textShadow: '0 2px 6px rgba(0,0,0,0.4)'
            }}>
              HAPPY BIRTHDAY SAHITHI 💖
            </div>

            {/* Serving Plate */}
            <div style={{
              width: '290px',
              height: '12px',
              background: 'linear-gradient(to right, #94a3b8, #f8fafc, #94a3b8)',
              borderRadius: '20px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
            }} />
          </div>

          {/* Interactive Flow based on stage */}
          {stage === 'wish' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '15px', color: '#fed7aa', fontStyle: 'italic', textAlign: 'center' }}>
                Make a silent birthday wish for an incredible year ahead, then blow out the candles! 🕯️✨
              </p>
              <button
                onClick={handleBlowCandles}
                style={{
                  background: 'linear-gradient(90deg, #f472b6 0%, #ec4899 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 34px',
                  borderRadius: '30px',
                  fontSize: '15px',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(244, 114, 182, 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                🌬️ MAKE A WISH &amp; BLOW CANDLES
              </button>
            </div>
          )}

          {stage === 'sliced' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '15px', color: '#fbcfe8', fontStyle: 'italic', textAlign: 'center' }}>
                Candles are blown! Ready to cut the birthday cake into slices for all the cats? 🍰
              </p>
              <button
                onClick={handleSliceCake}
                style={{
                  background: 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 34px',
                  borderRadius: '30px',
                  fontSize: '15px',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(56, 189, 248, 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                🔪 SLICE THE CAKE FOR THE CATS
              </button>
            </div>
          )}

          {stage === 'feeding' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', width: '100%' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '10px 20px',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '14px', color: '#fbcfe8', fontWeight: 'bold' }}>
                  🐾 Slices Served: {fedCount} / {cats.length}
                </span>
                {lastFedCat && (
                  <span style={{ fontSize: '13.5px', color: '#4ade80', fontStyle: 'italic' }}>
                    ✨ {lastFedCat} enjoyed their cake slice! *nom nom*
                  </span>
                )}
              </div>

              {/* Cats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                width: '100%'
              }}>
                {cats.map(cat => (
                  <motion.div
                    key={cat.id}
                    whileHover={{ scale: cat.eaten ? 1 : 1.04 }}
                    whileTap={{ scale: cat.eaten ? 1 : 0.96 }}
                    onClick={() => handleFeedCat(cat.id)}
                    style={{
                      background: cat.eaten ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                      border: `1.5px solid ${cat.eaten ? '#4ade80' : 'rgba(244, 114, 182, 0.4)'}`,
                      borderRadius: '16px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: cat.eaten ? 'default' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>{cat.avatar}</span>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: cat.color }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: cat.eaten ? '#4ade80' : '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                      {cat.eaten ? '🍰 Fed & Purring! 🌸' : 'Waiting for slice...'}
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={handleFeedNext}
                style={{
                  background: 'linear-gradient(90deg, #f472b6 0%, #fb923c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '30px',
                  fontSize: '14px',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(244, 114, 182, 0.5)'
                }}
              >
                🍰 SERVE NEXT SLICE TO CATS
              </button>
            </div>
          )}

          {stage === 'party' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '18px',
                width: '100%',
                textAlign: 'center'
              }}
            >
              <div style={{
                background: 'linear-gradient(90deg, rgba(244,114,182,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                border: '2px solid rgba(244, 114, 182, 0.6)',
                borderRadius: '18px',
                padding: '20px 24px',
                width: '100%'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#fbcfe8', marginBottom: '8px' }}>
                  🐱🎵 ALL 8 CATS ARE SINGING HAPPY BIRTHDAY! 🎵🐱
                </div>
                <p style={{ margin: 0, fontSize: '15px', color: '#ffffff', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "Wishing you a very Happy Birthday, Sahithi! Hope this day is as sweet, magical, and unforgettable as you are! 🌸✨💖"
                </p>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  onClick={() => playMeowHappyBirthday()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(244, 114, 182, 0.5)',
                    padding: '12px 24px',
                    borderRadius: '30px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🔁 REPLAY CAT CHOIR SONG
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'linear-gradient(90deg, #f472b6 0%, #ec4899 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(244, 114, 182, 0.6)'
                  }}
                >
                  🌸 WALK &amp; CELEBRATE WITH CATS
                </button>
              </div>
            </motion.div>
          )}

          {/* Close X Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#94a3b8',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
