import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import ClassicPortfolio from './features/classic/ClassicPortfolio';
import World from './components/world/World';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import PageTransition from './components/transitions/PageTransition';

type ViewMode = 'immersive' | 'classic';

function AnimatedRoutes({ mode }: { mode: ViewMode }) {
  const location = useLocation();

  if (mode === 'classic') {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<ClassicPortfolio />} />
          {/* Add more classic routes if needed, but the original was a single scrolling page */}
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<PageTransition variant="default"><div>Project Detail</div></PageTransition>} />
        <Route path="/experience" element={<PageTransition variant="default"><div>Experience</div></PageTransition>} />
        <Route path="/contact" element={<PageTransition variant="default"><div>Contact</div></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

import TourHUD from './components/hud/TourHUD';
import { MusicProvider } from './components/audio/MusicProvider';

export default function App() {
  const [mode, setMode] = useState<ViewMode>(() => {
    // Mobile touch devices immediately fallback to classic mode
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouch) return 'classic';
    }
    return 'immersive';
  });

  return (
    <MusicProvider>
      <div className="app" data-mode={mode}>
      {mode === 'immersive' && (
        <>
          <World />
          <TourHUD />
        </>
      )}

      <div className="ui-layer" style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        <button
          className="mode-toggle"
          onClick={() => setMode(m => m === 'immersive' ? 'classic' : 'immersive')}
          aria-label={`Switch to ${mode === 'immersive' ? 'classic' : 'immersive'} mode`}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 999,
            padding: '0.6rem 1.2rem',
            background: 'var(--accent)',
            color: 'var(--fg)',
            border: 'none',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            pointerEvents: 'auto',
            clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
          }}
        >
          {mode === 'immersive' ? '2D MODE' : '3D MODE'}
        </button>

        <div style={{ pointerEvents: 'auto' }}>
          <AnimatedRoutes mode={mode} />
        </div>
      </div>
    </div>
    <Analytics />
    </MusicProvider>
  );
}
