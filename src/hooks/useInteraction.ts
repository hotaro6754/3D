import { useState, useEffect, useCallback } from 'react';
import type { Interactable, InteractionSystem } from '../engine/interaction/InteractionSystem';

export function useInteraction(system: InteractionSystem | null) {
  const [focusedItem, setFocusedItem] = useState<Interactable | null>(null);

  useEffect(() => {
    if (!system) {
      setFocusedItem(null);
      return;
    }

    setFocusedItem(system.focused);

    const unsubscribe = system.subscribe((item) => {
      setFocusedItem(item);
    });

    return () => {
      unsubscribe();
    };
  }, [system]);

  const activate = useCallback(() => {
    if (system) {
      system.activate();
    }
  }, [system]);

  return { focusedItem, activate };
}
