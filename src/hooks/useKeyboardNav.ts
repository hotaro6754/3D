import { useState, useEffect, useCallback } from "react";

export interface UseKeyboardNavOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  onBack?: () => void;
  orientation?: "vertical" | "horizontal" | "both";
}

export function useKeyboardNav({
  itemCount,
  onSelect,
  onBack,
  orientation = "vertical",
}: UseKeyboardNavOptions) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activate = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(itemCount - 1, index)));
    },
    [itemCount]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (orientation === "vertical" || orientation === "both") {
        if (e.key === "ArrowUp") activate(activeIndex - 1);
        if (e.key === "ArrowDown") activate(activeIndex + 1);
      }
      
      if (orientation === "horizontal" || orientation === "both") {
        if (e.key === "ArrowLeft") activate(activeIndex - 1);
        if (e.key === "ArrowRight") activate(activeIndex + 1);
      }

      if (e.key === "Enter") {
        onSelect?.(activeIndex);
      }
      
      if (e.key === "Escape") {
        onBack?.();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, activate, onSelect, onBack, orientation]);

  return { activeIndex, setActiveIndex: activate };
}
