import React from 'react';
import type { PortfolioContext } from '../../engine/core/Context';

interface Props {
  ctx: PortfolioContext;
  visible: boolean;
  onComplete: () => void;
}

export const WorldGuideUI: React.FC<Props> = ({ ctx, visible, onComplete }) => {
  // We don't strictly need internal step state if we're just waiting for a button click,
  // but we keep the structure just in case.
  
  if (!visible) return null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'auto', // allow clicking the button
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace',
      zIndex: 100,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)'
    }}>
      <div style={{
        background: '#0a0a0c',
        border: '2px solid #00e5ff',
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.2), inset 0 0 10px rgba(0, 229, 255, 0.1)',
        padding: '40px',
        width: '600px',
        color: '#00e5ff',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ borderBottom: '1px solid #00e5ff', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold', fontSize: '20px' }}>HARSHITH DISTRICT</span>
          <span>v1.0.0</span>
        </div>

        <div style={{ whiteSpace: 'pre', fontSize: '14px', lineHeight: '1.4', alignSelf: 'center', margin: '20px 0' }}>
{`              [ HOME ]
                 |
                 |
        ~~~~~~~~~|~~~~~~~~~ [ CANAL ]
        ~~~~~~~~~|~~~~~~~~~
             [ BRIDGE ]
                 |
[ STATION ]------*------[ TECH LAB ]
                 |
                 |
            [ LIBRARY ]
                 
                 *
                 |
          [ SECURITY LAB ]`}
        </div>

        <div style={{ alignSelf: 'center', padding: '5px 15px', background: '#00e5ff', color: '#000', fontWeight: 'bold' }}>
          YOU ARE HERE: * (SPAWN)
        </div>

        <button 
          onClick={() => {
            if (ctx.audio) ctx.audio.playConfirm();
            onComplete();
          }}
          style={{
            marginTop: '20px',
            padding: '15px 30px',
            background: 'transparent',
            border: '2px solid #00e5ff',
            color: '#00e5ff',
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.3s',
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#00e5ff';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#00e5ff';
          }}
        >
          [ BEGIN TOUR ]
        </button>
      </div>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 229, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 229, 255, 0); }
        }
      `}</style>
    </div>
  );
};
