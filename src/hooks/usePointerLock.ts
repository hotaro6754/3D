import { useState, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

export function usePointerLock(canvasRef: RefObject<HTMLElement>) {
  const [isLocked, setIsLocked] = useState(false);

  const handleLockChange = useCallback(() => {
    setIsLocked(document.pointerLockElement === canvasRef.current);
  }, [canvasRef]);

  const requestLock = useCallback(() => {
    if (canvasRef.current && !isLocked) {
      canvasRef.current.requestPointerLock();
    }
  }, [canvasRef, isLocked]);

  useEffect(() => {
    document.addEventListener('pointerlockchange', handleLockChange);
    document.addEventListener('pointerlockerror', handleLockChange);

    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('pointerlockerror', handleLockChange);
    };
  }, [handleLockChange]);

  return { isLocked, requestLock };
}
