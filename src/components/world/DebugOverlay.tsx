import { useState, useEffect } from 'react';
import { PortfolioContext } from '../../engine/core/Context';
import { useInteraction } from '../../hooks/useInteraction';

export function DebugOverlay({ ctx }: { ctx: PortfolioContext | null }) {
  const [pos, setPos] = useState({ x: 0, y: 0, z: 0 });
  const [fps, setFps] = useState(0);
  const { focusedItem } = useInteraction(ctx?.interaction || null);

  useEffect(() => {
    if (!ctx) return;
    let frames = 0;
    let lastTime = performance.now();
    let rAF: number;

    const loop = () => {
      const now = performance.now();
      frames++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frames * 1000) / (now - lastTime)));
        frames = 0;
        lastTime = now;
      }

      if (ctx.player && ctx.player.state) {
        setPos({
          x: ctx.player.state.position.x,
          y: ctx.player.state.position.y,
          z: ctx.player.state.position.z
        });
      }

      rAF = requestAnimationFrame(loop);
    };
    rAF = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(rAF);
  }, [ctx]);

  const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  if (!ctx || !isDebug) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      color: 'white',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: '10px',
      fontFamily: 'monospace',
      pointerEvents: 'none',
      zIndex: 1000,
      borderRadius: '4px'
    }}>
      <div>FPS: {fps}</div>
      <div>Position: {pos.x.toFixed(2)}, {pos.y.toFixed(2)}, {pos.z.toFixed(2)}</div>
      <div>Target: {focusedItem ? focusedItem.label : 'None'}</div>
    </div>
  );
}
