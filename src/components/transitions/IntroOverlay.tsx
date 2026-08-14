import React from 'react';
import { BirthdayThemeConfig } from '../../engine/world/BirthdayThemeConfig';
import { motion } from 'framer-motion';

interface IntroOverlayProps {
  onEnter: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onEnter }) => {
  const isBirthday = BirthdayThemeConfig.enabled;
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        x: '100%',
        y: '-100%',
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
      }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: 'monospace',
        overflow: 'hidden'
      }}
    >
      <motion.h1 
        initial={{ x: -100, opacity: 0, skewX: -15 }}
        animate={{ x: 0, opacity: 1, skewX: -15 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.1 }}
        style={{ 
          fontSize: isBirthday ? '3.4rem' : '6rem', 
          margin: 0, 
          lineHeight: 0.95,
          letterSpacing: '0.08em', 
          color: isBirthday ? '#fbcfe8' : '#00ffff',
          textShadow: `4px 4px 0 #000000, 8px 8px 0 rgba(${isBirthday ? '244,114,182' : '0,255,255'},0.3)`,
          fontWeight: 900,
          textAlign: 'center'
        }}
      >
        {isBirthday ? 'HAPPY BIRTHDAY' : 'HARSHITH'}
      </motion.h1>
      <motion.h1 
        initial={{ x: 100, opacity: 0, skewX: -15 }}
        animate={{ x: 0, opacity: 1, skewX: -15 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
        style={{ 
          fontSize: isBirthday ? '4.0rem' : '6rem', 
          margin: 0, 
          lineHeight: 0.9,
          letterSpacing: '0.05em', 
          color: isBirthday ? '#f472b6' : '#ff003c',
          textShadow: `4px 4px 0 #000000, 8px 8px 0 rgba(${isBirthday ? '244,114,182' : '255,0,60'},0.3)`,
          fontWeight: 900,
          textAlign: 'center'
        }}
      >
        {isBirthday ? 'SAHITHI 🌸' : 'GANGARAJU'}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{ 
          fontSize: isBirthday ? '1.05rem' : '1.2rem', 
          marginTop: '1.5rem', 
          letterSpacing: '0.3em',
          backgroundColor: isBirthday ? '#f472b6' : '#ffffff',
          color: isBirthday ? '#ffffff' : '#000000',
          padding: '0.5rem 1.2rem',
          fontWeight: 'bold',
          clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)'
        }}
      >
        {isBirthday ? '✨ A SPECIAL NIGHT WALK JUST FOR YOU ✨' : 'AI × SECURITY × SOFTWARE'}
      </motion.p>
      
      {/* Minimalist District Map */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: '2.5rem',
          padding: '1.2rem 1.8rem',
          border: `1px solid ${isBirthday ? 'rgba(244, 114, 182, 0.4)' : '#333'}`,
          background: isBirthday ? 'rgba(15, 23, 42, 0.7)' : 'rgba(0,0,0,0.5)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'monospace',
          color: isBirthday ? '#fbcfe8' : '#aaa',
          fontSize: '0.9rem'
        }}
      >
        <div style={{ color: '#fff', marginBottom: '8px', letterSpacing: '2px', fontWeight: 'bold' }}>
          {isBirthday ? '🌸 SAHITHI NIGHT DISTRICT 🌸' : 'DISTRICT TOPOLOGY'}
        </div>
        <div>{isBirthday ? '[ SAKURA PLAZA ] ------ [ CAT SANCTUARY ]' : '[ STATION ] ------ [ LIBRARY ]'}</div>
        <div>   |                   |</div>
        <div>{isBirthday ? '   |----[ WATERFALL ]---|' : '   |----[ BRIDGE ]-----|'}</div>
        <div>   |                   |</div>
        <div>{isBirthday ? '[ AURA LAB ]       [ ROOFTOP THEATRE ]' : '[ SECURITY ]       [ HOME ]'}</div>
        <div style={{ alignSelf: 'flex-start', marginTop: '10px', color: isBirthday ? '#f472b6' : '#aaa' }}>
          &gt; STATUS: {isBirthday ? 'READY TO CELEBRATE 🎂' : 'ONLINE'}
        </div>
      </motion.div>

      <motion.button
        onClick={onEnter}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring' }}
        whileHover={{ scale: 1.05, backgroundColor: isBirthday ? '#baa6ff' : '#00ffff', color: '#000000', skewX: -10 }}
        whileTap={{ scale: 0.95 }}
        style={{
          marginTop: '2rem',
          padding: '1.2rem 3rem',
          fontSize: '1.4rem',
          background: isBirthday ? 'rgba(186, 166, 255, 0.1)' : 'rgba(0, 255, 255, 0.1)',
          border: 'none',
          color: isBirthday ? '#baa6ff' : '#00ffff',
          cursor: 'pointer',
          letterSpacing: '0.15em',
          fontWeight: 900,
          transition: 'all 0.1s ease',
          outline: 'none',
          boxShadow: `4px 4px 0 rgba(${isBirthday ? '186,166,255' : '0,255,255'}, 0.3)`
        }}
      >
        {isBirthday ? '[ ENTER ]' : '[ BEGIN TOUR ]'}
      </motion.button>
    </motion.div>
  );
};
