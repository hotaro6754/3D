import { useTourState } from '../../hooks/useTourState';
import { WORLD_LANDMARKS } from '../../data/landmarks';

export default function TourHUD() {
  const { state, currentTargetId, skipTour } = useTourState();

  if (state.phase !== 'GUIDED' || !currentTargetId) {
    return null; // Don't show in INTRO or FREE_ROAM
  }

  const target = WORLD_LANDMARKS[currentTargetId];
  if (!target) return null;

  return (
    <div
      className="tour-hud"
      style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        padding: '1rem 1.5rem',
        background: 'var(--ink)',
        color: 'var(--fg)',
        border: '2px solid var(--accent)',
        boxShadow: '8px 8px 0px rgba(0,0,0,0.5)',
        fontFamily: 'var(--font-body)',
        pointerEvents: 'auto',
        zIndex: 100
      }}
    >
      <div style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        Current Objective
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'var(--font-impact)', marginBottom: '1rem' }}>
        Visit {target.name}
      </div>
      
      <button
        onClick={skipTour}
        style={{
          background: 'transparent',
          color: 'var(--fg)',
          border: '1px solid var(--fg)',
          padding: '0.4rem 0.8rem',
          fontSize: '0.75rem',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Skip Tour
      </button>
    </div>
  );
}
