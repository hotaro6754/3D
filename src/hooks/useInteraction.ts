import { useState, useEffect, useCallback } from 'react';
import type { Interactable, InteractionSystem } from '../engine/interaction/InteractionSystem';

export function useInteraction(system: InteractionSystem | null) {
  const [focusedItem, setFocusedItem] = useState<Interactable | null>(null);

  useEffect(() => {
    if (!system) {
      setFocusedItem(null);
      return;
    }

    // Initialize with whatever is currently focused
    setFocusedItem(system.focused);

    // Setup listener
    const handleFocusChange = (item: Interactable | null) => {
      setFocusedItem(item);
    };

    system.onFocusChange = handleFocusChange;

    return () => {
      // Clean up if it hasn't been overwritten
      if (system.onFocusChange === handleFocusChange) {
        system.onFocusChange = null;
      }
    };
  }, [system]);

  const activate = useCallback(() => {
    if (system) {
      system.activate();
    }
  }, [system]);

  return { focusedItem, activate };
}
