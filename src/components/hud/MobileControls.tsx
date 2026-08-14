import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PortfolioContext } from '../../engine/core/Context';
import { BirthdayThemeConfig } from '../../engine/world/BirthdayThemeConfig';
import { useInteraction } from '../../hooks/useInteraction';

interface MobileControlsProps {
  ctx: PortfolioContext | null;
  visible?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ ctx, visible = true }) => {
  const isBirthday = BirthdayThemeConfig.enabled;
  const { focusedItem, activate } = useInteraction(ctx?.interaction || null);

  // Joystick visual state
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);

  // Touch tracking refs
  const joystickTouchIdRef = useRef<number | null>(null);
  const lookTouchIdRef = useRef<number | null>(null);
  const lookLastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const JOYSTICK_MAX_RADIUS = 48; // Max thumb travel distance

  // Initialize joystick center on mount / resize
  const updateJoystickCenter = useCallback(() => {
    const el = document.getElementById('mobile-joystick-base');
    if (el) {
      const rect = el.getBoundingClientRect();
      joystickCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
  }, []);

  useEffect(() => {
    updateJoystickCenter();
    window.addEventListener('resize', updateJoystickCenter);
    window.addEventListener('orientationchange', updateJoystickCenter);
    return () => {
      window.removeEventListener('resize', updateJoystickCenter);
      window.removeEventListener('orientationchange', updateJoystickCenter);
    };
  }, [updateJoystickCenter]);

  // Handle Touch Screen Look (Right Screen or general screen drag)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!ctx) return;
    const input = ctx.engine.input;
    if (input.suspended) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Check if touch is in the left joystick zone
      const isLeftArea = touch.clientX < window.innerWidth * 0.42 && touch.clientY > window.innerHeight * 0.45;

      if (isLeftArea && joystickTouchIdRef.current === null) {
        // Start Joystick
        joystickTouchIdRef.current = touch.identifier;
        setIsJoystickActive(true);
        updateJoystickCenter();

        const dx = touch.clientX - joystickCenterRef.current.x;
        const dy = touch.clientY - joystickCenterRef.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, JOYSTICK_MAX_RADIUS);
        const angle = Math.atan2(dy, dx);

        const stickX = Math.cos(angle) * clampedDist;
        const stickY = Math.sin(angle) * clampedDist;

        setStickPos({ x: stickX, y: stickY });
        // Forward is -Y in screen coordinates, which maps to +Z in input
        input.setVirtualStick(stickX / JOYSTICK_MAX_RADIUS, -stickY / JOYSTICK_MAX_RADIUS);
      } else if (!isLeftArea && lookTouchIdRef.current === null) {
        // Start Look Rotation
        lookTouchIdRef.current = touch.identifier;
        lookLastPosRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!ctx) return;
    const input = ctx.engine.input;
    if (input.suspended) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === joystickTouchIdRef.current) {
        // Update Joystick
        const dx = touch.clientX - joystickCenterRef.current.x;
        const dy = touch.clientY - joystickCenterRef.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, JOYSTICK_MAX_RADIUS);
        const angle = Math.atan2(dy, dx);

        const stickX = Math.cos(angle) * clampedDist;
        const stickY = Math.sin(angle) * clampedDist;

        setStickPos({ x: stickX, y: stickY });
        input.setVirtualStick(stickX / JOYSTICK_MAX_RADIUS, -stickY / JOYSTICK_MAX_RADIUS);
      } else if (touch.identifier === lookTouchIdRef.current) {
        // Update Touch Screen Rotation
        const dx = touch.clientX - lookLastPosRef.current.x;
        const dy = touch.clientY - lookLastPosRef.current.y;

        lookLastPosRef.current = { x: touch.clientX, y: touch.clientY };
        input.addTouchLook(dx, dy);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!ctx) return;
    const input = ctx.engine.input;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setIsJoystickActive(false);
        setStickPos({ x: 0, y: 0 });
        input.setVirtualStick(0, 0);
      } else if (touch.identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
      }
    }
  };

  const handleInteract = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!ctx) return;
    ctx.engine.input.triggerAction('KeyE');
    activate();
  };

  const handleJump = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!ctx) return;
    ctx.engine.input.triggerAction('Space');
    ctx.engine.input.triggerAction('MobileJump');
  };

  const handleSprintToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!ctx) return;
    setIsSprinting(prev => {
      const next = !prev;
      if (next) {
        ctx.engine.input.pressKey('MobileSprint');
      } else {
        ctx.engine.input.releaseKey('MobileSprint');
      }
      return next;
    });
  };

  if (!visible) return null;

  const accentColor = isBirthday ? '#f472b6' : '#00e5ff';
  const glowColor = isBirthday ? 'rgba(244, 114, 182, 0.45)' : 'rgba(0, 229, 255, 0.45)';

  return (
    <div
      id="mobile-touch-overlay"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        pointerEvents: 'auto',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* 1. Left Virtual Analog Joystick */}
      <div
        id="mobile-joystick-base"
        style={{
          position: 'absolute',
          bottom: '28px',
          left: '28px',
          width: '124px',
          height: '124px',
          borderRadius: '50%',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          border: `2px solid ${isJoystickActive ? accentColor : 'rgba(255, 255, 255, 0.25)'}`,
          boxShadow: isJoystickActive ? `0 0 20px ${glowColor}` : '0 4px 15px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          transition: 'border 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Joystick Directional Arrows */}
        <div style={{ position: 'absolute', top: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 900 }}>▲</div>
        <div style={{ position: 'absolute', bottom: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 900 }}>▼</div>
        <div style={{ position: 'absolute', left: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 900 }}>◀</div>
        <div style={{ position: 'absolute', right: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 900 }}>▶</div>

        {/* Joystick Thumb Knob */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: isBirthday
              ? 'radial-gradient(circle at 35% 35%, #fbcfe8 0%, #f472b6 60%, #db2777 100%)'
              : 'radial-gradient(circle at 35% 35%, #e0f2fe 0%, #00e5ff 60%, #0284c7 100%)',
            boxShadow: `0 3px 12px ${glowColor}`,
            transform: `translate3d(${stickPos.x}px, ${stickPos.y}px, 0)`,
            transition: isJoystickActive ? 'none' : 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
        </div>
      </div>

      {/* 2. Touch Screen Camera Look Hint */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: 'rgba(255, 255, 255, 0.65)',
          fontSize: '11px',
          fontFamily: 'monospace',
          letterSpacing: '0.08em',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          padding: '5px 12px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          pointerEvents: 'none',
          backdropFilter: 'blur(6px)',
        }}
      >
        👆 DRAG ANYWHERE TO ROTATE VIEW
      </div>

      {/* 3. Right Action Buttons Cluster */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '14px',
          pointerEvents: 'auto',
        }}
      >
        {/* Sprint Toggle Button */}
        <button
          onClick={handleSprintToggle}
          onTouchStart={handleSprintToggle}
          aria-label="Sprint Toggle"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: isSprinting ? (isBirthday ? '#f472b6' : '#00e5ff') : 'rgba(15, 23, 42, 0.75)',
            color: isSprinting ? '#000000' : '#ffffff',
            border: `1.5px solid ${isSprinting ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}`,
            fontSize: '11px',
            fontWeight: 900,
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isSprinting ? `0 0 16px ${glowColor}` : '0 4px 10px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease',
          }}
        >
          {isSprinting ? 'RUN' : 'WALK'}
        </button>

        {/* Row for Jump and Interact buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Jump Button */}
          <button
            onClick={handleJump}
            onTouchStart={handleJump}
            aria-label="Jump"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: '#ffffff',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '12px',
              fontWeight: 900,
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>▲</span>
            <span style={{ fontSize: '9px', letterSpacing: '0.05em' }}>JUMP</span>
          </button>

          {/* Interact [E] Button */}
          <button
            onClick={handleInteract}
            onTouchStart={handleInteract}
            aria-label="Interact"
            style={{
              width: focusedItem ? '72px' : '64px',
              height: focusedItem ? '72px' : '64px',
              borderRadius: '50%',
              background: focusedItem
                ? isBirthday
                  ? 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
                  : 'linear-gradient(135deg, #00e5ff 0%, #0091ea 100%)'
                : 'rgba(15, 23, 42, 0.82)',
              color: '#ffffff',
              border: `2.5px solid ${focusedItem ? '#ffffff' : accentColor}`,
              fontSize: '13px',
              fontWeight: 900,
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: focusedItem
                ? `0 0 24px ${glowColor}, 0 6px 18px rgba(0,0,0,0.6)`
                : `0 4px 14px rgba(0,0,0,0.5)`,
              backdropFilter: 'blur(10px)',
              transform: focusedItem ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{isBirthday ? '🌸' : '⚡'}</span>
            <span style={{ fontSize: '10px', letterSpacing: '0.08em', marginTop: '2px' }}>
              {focusedItem ? 'OPEN' : 'ACTION'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
