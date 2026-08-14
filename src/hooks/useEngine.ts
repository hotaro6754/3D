import { useEffect, useState } from 'react';
import { Engine } from '../engine/core/Engine';

export function useEngine(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [engine, setEngine] = useState<Engine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize Engine
    const newEngine = new Engine(containerRef.current);
    setEngine(newEngine);
    
    // Cleanup on unmount
    return () => {
      newEngine.dispose();
      setEngine(null);
    };
  }, [containerRef]);

  return engine;
}
