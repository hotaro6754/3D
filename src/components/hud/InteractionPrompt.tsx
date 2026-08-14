import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInteraction } from '../../hooks/useInteraction';
import { InteractionSystem } from '../../engine/interaction';
import { Input, InputAction } from '../../engine/core/Input';

interface InteractionPromptProps {
  system: InteractionSystem | null;
  input: Input | null;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({ system, input }) => {
  const { focusedItem, activate } = useInteraction(system);
  const [isActivating, setIsActivating] = useState(false);
  const interactKey = input ? input.getBinding(InputAction.INTERACT) : 'E';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = focusedItem?.key || interactKey;
      if (e.key.toLowerCase() === key.toLowerCase() && !isActivating && focusedItem) {
        setIsActivating(true);
        activate(); // Call immediately
        setTimeout(() => {
          setIsActivating(false);
        }, 150);
      }
    };

    if (focusedItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedItem, activate, isActivating, interactKey]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '12%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: 'none',
        perspective: '1000px',
      }}
    >
      <AnimatePresence>
        {focusedItem && (
          <motion.div
            key={focusedItem.label}
            onClick={() => {
              if (!isActivating) {
                setIsActivating(true);
                activate();
                setTimeout(() => setIsActivating(false), 150);
              }
            }}
            initial={{ opacity: 0, x: -80, skewX: -15, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              skewX: 0,
              scale: isActivating ? 1.05 : 1,
            }}
            exit={{ opacity: 0, x: 80, skewX: 15, scale: 0.9 }}
            transition={{ 
              type: 'spring',
              stiffness: 500,
              damping: 20,
              scale: { duration: 0.1 }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
          >
            {/* Key Hint Block */}
            <motion.div
              animate={{ 
                backgroundColor: isActivating ? '#ffffff' : '#00e5ff',
                color: '#000000',
                scale: isActivating ? 0.9 : 1
              }}
              transition={{ duration: 0.1 }}
              style={{
                padding: '12px 24px',
                clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
                fontFamily: 'monospace',
                fontSize: '28px',
                fontWeight: 900,
                textTransform: 'uppercase',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '60px',
              }}
            >
              {(focusedItem.key || interactKey).toUpperCase()}
            </motion.div>

            {/* Label String Block */}
            <motion.div
              animate={{ 
                borderColor: isActivating ? '#ffffff' : '#00e5ff',
                backgroundColor: isActivating ? 'rgba(255, 255, 255, 0.9)' : 'rgba(5, 15, 30, 0.85)',
              }}
              transition={{ duration: 0.1 }}
              style={{
                border: '2px solid #00e5ff',
                clipPath: 'polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)',
                padding: '12px 40px',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <motion.span
                animate={{
                  color: isActivating ? '#000000' : '#ffffff',
                  textShadow: isActivating ? 'none' : '0 0 4px rgba(0, 229, 255, 0.5)',
                }}
                transition={{ duration: 0.1 }}
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {focusedItem.label}
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
