import React, { useState } from 'react';
import type { PortfolioContext } from '../../engine/core/Context';
import { BirthdayThemeConfig } from '../../engine/world/BirthdayThemeConfig';

interface Props {
  ctx: PortfolioContext;
  visible: boolean;
  onComplete: () => void;
}

interface Destination {
  id: string;
  name: string;
  jp: string;
  sub: string;
  landmarkId?: string;
  coord: string;
}

const DESTINATIONS: Destination[] = [
  { id: 'plaza', name: 'SAKURA PLAZA', jp: '桜広場', sub: 'Hero Tree & Resting Bench', coord: '0, 0' },
  { id: 'station', name: 'LAST TRAIN // STATION', jp: '中央駅', sub: 'Railway Platform 01', landmarkId: 'station', coord: '-20, 0' },
  { id: 'library', name: 'QUIET HOURS // LIBRARY', jp: '図書室', sub: 'Archives & Reading Room', landmarkId: 'library', coord: '20, 0' },
  { id: 'security', name: 'NIGHT WATCH // SECURITY', jp: '警備棟', sub: 'District Operations Center', landmarkId: 'securityLab', coord: '-23, -15' },
  { id: 'techLab', name: 'NIGHT WORKSHOP // TECH LAB', jp: '技術研究室', sub: 'Systems & Experimental Lab', landmarkId: 'techLab', coord: '15, -15' },
  { id: 'home', name: 'A QUIET PLACE // RESIDENCE', jp: '静かな家', sub: 'Hillside Home & Overlook', landmarkId: 'home', coord: '15, 15' },
  { id: 'bridge', name: 'CANAL & BRIDGE', jp: '運河橋', sub: 'District Waterway Crossing', landmarkId: 'bridge', coord: '-10, 0' },
];

const BIRTHDAY_DESTINATIONS: Destination[] = [
  { id: 'plaza', name: '🌸 SAKURA PLAZA', jp: '桜広場', sub: 'Hero Tree & Lantern Garden', coord: '0, 0' },
  { id: 'library', name: '🐱 CAT SANCTUARY', jp: '猫の楽園', sub: '8 Cats, Birthday Cake & Choir', landmarkId: 'library', coord: '25, 0' },
  { id: 'security', name: '✨ AURA LAB', jp: 'オーラ診断', sub: 'Personality & Charm Diagnostic', landmarkId: 'securityLab', coord: '-15, -20' },
  { id: 'techLab', name: '🎬 ROOFTOP THEATRE', jp: '屋上劇場', sub: 'Birthday Cinema & Stargazing', landmarkId: 'techLab', coord: '15, -20' },
];

export const WorldGuideUI: React.FC<Props> = ({ ctx, visible, onComplete }) => {
  const [selectedId, setSelectedId] = useState<string>('plaza');
  const isBirthday = BirthdayThemeConfig.enabled;
  const activeDestinations = isBirthday ? BIRTHDAY_DESTINATIONS : DESTINATIONS;

  if (!visible) return null;

  const handleSelect = (dest: Destination) => {
    setSelectedId(dest.id);
    if (ctx.audio) ctx.audio.playConfirm();
    if (dest.landmarkId) {
      ctx.events.emit('SET_NAV_TARGET', dest.landmarkId);
    }
    onComplete();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
      zIndex: 1000,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.15)',
        borderRadius: '12px',
        padding: '32px 36px',
        width: '720px',
        maxWidth: '92vw',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header Bar */}
        <div style={{
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          paddingBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#f472b6',
              boxShadow: '0 0 8px #f472b6'
            }} />
            <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '0.15em', color: '#e0f2fe' }}>
              {isBirthday ? 'HARSHITH DISTRICT // IoT GUIDE' : 'DISTRICT TRANSIT & NAVIGATION'}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
            NIGHT TRANSIT MAP
          </span>
        </div>

        {/* Two Column Layout: Map Topology + Destination List */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'stretch' }}>
          {/* Left: Minimalist Anime Transit Topology */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#38bdf8',
              whiteSpace: 'pre',
              textAlign: 'center'
            }}>
{`     [ A QUIET PLACE ]
             |
   ~~~~~~~~~~|~~~~~~~~~~
         [ BRIDGE ]
             |
 [ STATION ]-*-[ TECH LAB ]
             |
      [ SAKURA PLAZA ]
             |
      [ QUIET HOURS ]
             |
      [ NIGHT WATCH ]`}
            </div>
            <div style={{
              marginTop: '16px',
              padding: '4px 12px',
              background: 'rgba(244, 114, 182, 0.15)',
              border: '1px solid rgba(244, 114, 182, 0.4)',
              borderRadius: '4px',
              color: '#fbcfe8',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em'
            }}>
              🌸 HERO TREE AT SAKURA PLAZA
            </div>
          </div>

          {/* Right: Interactive Destination Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '320px', paddingRight: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.15em', marginBottom: '4px' }}>
              SELECT DESTINATION WAYPOINT:
            </div>
            {activeDestinations.map(d => {
              const isSelected = selectedId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => handleSelect(d)}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: isSelected ? '#38bdf8' : '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>{d.name}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'serif' }}>{d.jp}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: isSelected ? '#bae6fd' : '#64748b' }}>
                    {d.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
            PRESS [ESC] OR CLICK TO RESUME EXPLORATION
          </span>
          <button
            onClick={() => {
              if (ctx.audio) ctx.audio.playConfirm();
              onComplete();
            }}
            style={{
              padding: '10px 24px',
              background: '#38bdf8',
              border: 'none',
              borderRadius: '6px',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#7dd3fc'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#38bdf8'; }}
          >
            CLOSE GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
