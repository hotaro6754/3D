import { useState, useEffect } from 'react';

export type TourPhase = 'INTRO' | 'GUIDED' | 'FREE_ROAM';

// The canonical sequence of landmarks for the guided tour
export const TOUR_SEQUENCE = [
  'home',
  'techLab',
  'bridge',
  'securityLab',
  'station',
  'library'
];

export interface TourState {
  phase: TourPhase;
  currentTargetIndex: number;
}

export function useTourState() {
  const [state, setState] = useState<TourState>(() => {
    try {
      const saved = localStorage.getItem('harshith_tour_state');
      if (saved) {
        return JSON.parse(saved) as TourState;
      }
    } catch (e) {
      console.error('Failed to parse tour state', e);
    }
    return { phase: 'INTRO', currentTargetIndex: 0 };
  });

  useEffect(() => {
    localStorage.setItem('harshith_tour_state', JSON.stringify(state));
  }, [state]);

  const advanceTour = () => {
    setState(prev => {
      if (prev.phase === 'INTRO') {
        return { phase: 'GUIDED', currentTargetIndex: 0 };
      }
      
      if (prev.phase === 'GUIDED') {
        const nextIndex = prev.currentTargetIndex + 1;
        if (nextIndex >= TOUR_SEQUENCE.length) {
          return { phase: 'FREE_ROAM', currentTargetIndex: prev.currentTargetIndex };
        }
        return { phase: 'GUIDED', currentTargetIndex: nextIndex };
      }

      return prev;
    });
  };

  const skipTour = () => {
    setState({ phase: 'FREE_ROAM', currentTargetIndex: TOUR_SEQUENCE.length - 1 });
  };
  
  const resetTour = () => {
    setState({ phase: 'INTRO', currentTargetIndex: 0 });
  };

  // Global event listeners for ThreeJS engine integration
  useEffect(() => {
    const handleAdvance = () => advanceTour();
    const handleSkip = () => skipTour();
    
    window.addEventListener('tour_advance', handleAdvance);
    window.addEventListener('tour_skip', handleSkip);
    
    return () => {
      window.removeEventListener('tour_advance', handleAdvance);
      window.removeEventListener('tour_skip', handleSkip);
    };
  }, []);

  const currentTargetId = state.phase === 'GUIDED' ? TOUR_SEQUENCE[state.currentTargetIndex] : null;

  return {
    state,
    currentTargetId,
    advanceTour,
    skipTour,
    resetTour
  };
}
