import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useEngine } from '../../hooks/useEngine';
import { PortfolioContext } from '../../engine/core/Context';
import { InteractionSystem } from '../../engine/interaction/InteractionSystem';
import { PlayerController } from '../../engine/player/PlayerController';
import { CollisionWorld } from '../../engine/player/Collision';
import { AudioSystem } from '../../engine/audio/AudioSystem';
import { WorldBuilder } from '../../engine/world/WorldBuilder';
import { PAL } from '../../engine/rendering/palette';
import { DebugOverlay } from './DebugOverlay';
import { InteractionPrompt } from '../hud/InteractionPrompt';
import { IntroOverlay } from '../transitions/IntroOverlay';
import { ProjectTerminalUI } from '../hud/ProjectTerminalUI';
import { MusicPlayerUI } from '../audio/MusicPlayerUI';
import { WorldGuideUI } from './WorldGuideUI';
import { BirthdayVideoUI } from '../hud/BirthdayVideoUI';
import { RooftopExperienceUI } from '../hud/RooftopExperienceUI';
import { Persona3ThreatUI } from '../hud/Persona3ThreatUI';
import { CakeCuttingUI } from '../hud/CakeCuttingUI';
import { MobileControls } from '../hud/MobileControls';
import { AnimatePresence, motion } from 'framer-motion';

import { useTourState } from '../../hooks/useTourState';
import { NavigationMarker } from '../../engine/world/NavigationMarker';
import { BirthdayThemeConfig } from '../../engine/world/BirthdayThemeConfig';

export default function World() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engine = useEngine(containerRef);
  const [ctxObj, setCtxObj] = useState<PortfolioContext | null>(null);
  const [entered, setEntered] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isSitting, setIsSitting] = useState(false);
  const [isRooftopCinema, setIsRooftopCinema] = useState(false);
  const [showRooftopDisclaimer, setShowRooftopDisclaimer] = useState(false);
  const [isRooftopPlaying, setIsRooftopPlaying] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showBirthdayReveal, setShowBirthdayReveal] = useState(false);
  const [showBirthdayVideo, setShowBirthdayVideo] = useState(false);
  const [showPersona3Threat, setShowPersona3Threat] = useState(false);
  const [showCakeCutting, setShowCakeCutting] = useState(false);
  const [showRooftopExp, setShowRooftopExp] = useState(false);
  
  const { currentTargetId } = useTourState();

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    setIsTouchDevice(!!isTouch);
  }, []);

  // Sync navigation marker with tour state (disabled in birthday mode)
  useEffect(() => {
    if (!ctxObj) return;
    const markerSystem = ctxObj.engine.systems.find(s => (s as any).name === 'navigation_marker') as NavigationMarker | undefined;
    if (markerSystem) {
      markerSystem.setTarget(BirthdayThemeConfig.enabled ? null : currentTargetId);
    }
  }, [ctxObj, currentTargetId]);

  useEffect(() => {
    if (ctxObj && ctxObj.engine) {
      ctxObj.engine.input.suspended = !entered;
    }
  }, [entered, ctxObj]);

  useEffect(() => {
    if (!ctxObj) return;
    const unsubTerminal = ctxObj.events.on('TERMINAL_ACCESS', (p: any) => {
      setActiveProject(p.projectId);
      ctxObj.engine.input.suspended = true;
      ctxObj.events.emit('CINEMATIC', true);
      document.exitPointerLock();
    });

    const handleMapToggle = (e: KeyboardEvent) => {
      if (BirthdayThemeConfig.enabled) return;
      if (e.key.toLowerCase() === 'm' && !activeProject) {
        setShowGuide(prev => {
          const next = !prev;
          if (next) {
            ctxObj.engine.input.suspended = true;
            document.exitPointerLock();
          } else {
            ctxObj.engine.input.suspended = false;
            ctxObj.engine.input.requestLock();
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleMapToggle);

    const unsubLandmark = ctxObj.events.on('INTERACT_LANDMARK', (landmarkId: any) => {
      ctxObj.engine.input.suspended = true;
      ctxObj.events.emit('CINEMATIC', true);
      document.exitPointerLock();

      import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
        AnimationSystem.playScreenDoorTransition(() => {
          import('../../data/landmarks').then(({ WORLD_LANDMARKS }) => {
            const lm = Object.values(WORLD_LANDMARKS).find(x => x.id === landmarkId);
            if (lm && lm.projectId) {
              setActiveProject(lm.projectId);
            } else if (lm && lm.experienceId) {
              setActiveProject(lm.experienceId);
            } else if (landmarkId === 'home') {
              setActiveProject('home');
            } else {
              setTimeout(() => {
                ctxObj.engine.input.suspended = false;
                ctxObj.events.emit('CINEMATIC', false);
              }, 1000);
            }
          });
        });
      });
    });

    const unsubGuide = ctxObj.events.on('OPEN_DISTRICT_GUIDE', () => {
      if (BirthdayThemeConfig.enabled) return;
      setShowGuide(true);
      ctxObj.engine.input.suspended = true;
      document.exitPointerLock();
    });

    const unsubNav = ctxObj.events.on('NAVIGATE_TO', (pos: any) => {
      if (ctxObj.player) {
        const playerState = (ctxObj.player as any).state;
        playerState.position.x = pos.x;
        playerState.position.z = pos.z;
        const targetGround = ctxObj.collision.groundHeight(pos.x, pos.z, playerState.position.y);
        playerState.position.y = targetGround + 0.1;
        playerState.position.y += 1.5;
        playerState.grounded = false;
        playerState.velocity.y = 0;
        ctxObj.events.emit('RESET_LAND');
      }
    });

    const unsubPersona = ctxObj.events.on('OPEN_PERSONA3_THREAT', () => {
      setShowPersona3Threat(true);
      ctxObj.engine.input.suspended = true;
      document.exitPointerLock();
    });

    const unsubCinema = ctxObj.events.on('INTERACT_ROOFTOP_CINEMA', () => {
      setIsSitting(true);
      setIsRooftopCinema(true);
      setShowRooftopDisclaimer(true);
      setIsRooftopPlaying(false);
      sitTimestampRef.current = performance.now();
      document.exitPointerLock();

      import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
        const targetPos = new THREE.Vector3(15, 6.54, -20.5);
        AnimationSystem.playBenchSit(ctxObj.player, targetPos, 0, () => {}, 0.30);
      });
    });

    const unsubVideo = ctxObj.events.on('OPEN_BIRTHDAY_VIDEO', () => {
      setShowBirthdayVideo(true);
      ctxObj.engine.input.suspended = true;
      document.exitPointerLock();
    });

    const unsubCake = ctxObj.events.on('OPEN_CAKE_CUTTING', () => {
      setShowCakeCutting(true);
      ctxObj.engine.input.suspended = true;
      document.exitPointerLock();
    });

    const unsubRooftop = ctxObj.events.on('OPEN_ROOFTOP_EXPERIENCE', () => {
      setShowRooftopExp(true);
      ctxObj.engine.input.suspended = true;
      document.exitPointerLock();
    });

    const unsubTeleport = ctxObj.events.on('TELEPORT_TO_ROOFTOP', () => {
      import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
        AnimationSystem.playScreenDoorTransition(() => {
          const s = (ctxObj.player as any).state;
          s.position.set(15, 5.44, -13);
          s.yaw = 0;
          s.pitch = 0;
          s.velocity.set(0, 0, 0);
          s.grounded = true;
          ctxObj.engine.input.requestLock();
        });
      });
    });

    const unsubBench = ctxObj.events.on('INTERACT_BENCH', (benchData: any) => {
      const isPlaza = Math.abs(benchData.x) < 10 && Math.abs(benchData.z) < 10;
      const rySafe = typeof benchData.ry === 'number' && !isNaN(benchData.ry) ? benchData.ry : 0;

      if (BirthdayThemeConfig.enabled && isPlaza) {
        setShowBirthdayReveal(true);
        setIsSitting(true);
        document.exitPointerLock();
        
        if (ctxObj.audio) {
          (ctxObj.audio as any).setBenchMode?.(true);
          (ctxObj.audio as any).playPianoTrack();
        }

        import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
          const targetPos = new THREE.Vector3(benchData.x, 1.1, benchData.z);
          AnimationSystem.playBenchSit(ctxObj.player, targetPos, rySafe + 0.3, () => {
             // Camera arrived
          }, 0.1);
        });
        return;
      }

      setIsSitting(true);
      document.exitPointerLock();
      import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
        const targetPos = new THREE.Vector3(
          benchData.x,
          benchData.y > 2 ? benchData.y + 1.1 : 1.1,
          benchData.z
        );
        AnimationSystem.playBenchSit(ctxObj.player, targetPos, rySafe, () => {
          // Camera arrived
        });
      });
    });

    return () => {
      window.removeEventListener('keydown', handleMapToggle);
      unsubTerminal();
      unsubLandmark();
      unsubBench();
      unsubGuide();
      unsubNav();
      unsubVideo();
      unsubCake();
      unsubRooftop();
      unsubTeleport();
      unsubPersona();
      unsubCinema();
    };
  }, [ctxObj]);

  useEffect(() => {
    if (!engine) return;

    const ctx = new PortfolioContext();
    ctx.engine = engine;
    ctx.camera = engine.camera;
    
    ctx.collision = new CollisionWorld();
    ctx.interaction = new InteractionSystem(ctx);
    engine.add(ctx.interaction);

    const builder = new WorldBuilder(ctx);
    builder.build();

    const isBirthday = BirthdayThemeConfig.enabled;
    const spawnX = isBirthday ? 0 : 3;
    const spawnZ = isBirthday ? 12 : 8;
    const spawnYaw = isBirthday ? Math.PI : Math.atan2(-3, -8);
    const groundY = ctx.collision.groundHeight(spawnX, spawnZ);
    ctx.player = new PlayerController(ctx, new THREE.Vector3(spawnX, groundY, spawnZ), spawnYaw);
    engine.add(ctx.player);

    let hasLanded = true;
    ctx.events.on('RESET_LAND', () => { hasLanded = false; });
    const unsubLand = ctx.events.on('FOOTSTEP', (data: any) => {
      if (data.land && !hasLanded) {
        hasLanded = true;
        import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
          AnimationSystem.playLandingBounce(ctx.player, 1.5);
        });
        window.dispatchEvent(new Event('tour_advance'));
      }
    });

    const navMarker = new NavigationMarker(ctx);
    (ctx as any).navMarker = navMarker;
    engine.add(navMarker);

    const handleDebugKeys = (e: KeyboardEvent) => {
      if (!ctx.engine || !(ctx.engine as any).pipeline) return;
      const pipeline = (ctx.engine as any).pipeline;
      switch (e.key) {
        case '1':
          pipeline.enabled = { ink: false, grade: false, fxaa: false };
          break;
        case '2':
          pipeline.enabled = { ink: false, grade: true, fxaa: false };
          break;
        case '3':
          pipeline.enabled = { ink: true, grade: true, fxaa: false };
          break;
        case '4':
          pipeline.enabled = { ink: true, grade: true, fxaa: true };
          break;
      }
    };
    window.addEventListener('keydown', handleDebugKeys);

    const scene = engine.scene;
    
    const hSky = isBirthday ? BirthdayThemeConfig.lighting.ambientColor : PAL.hemiSky;
    const hGround = isBirthday ? BirthdayThemeConfig.lighting.groundColor : PAL.hemiGround;
    const hInt = isBirthday ? BirthdayThemeConfig.lighting.ambientIntensity : 0.9;
    
    const hemiLight = new THREE.HemisphereLight(hSky, hGround, hInt);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(
      isBirthday ? BirthdayThemeConfig.lighting.moonColor : PAL.sun,
      isBirthday ? BirthdayThemeConfig.lighting.moonIntensity : 1.15
    );
    sunLight.position.set(isBirthday ? -40 : -80, isBirthday ? 55 : 35, isBirthday ? 65 : 60);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.camera.near = 10.0;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.mapSize.setScalar(4096);
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.normalBias = 0.015;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(
      isBirthday ? BirthdayThemeConfig.lighting.ambientColor : PAL.fill, 
      isBirthday ? 1.0 : 0.6
    );
    fillLight.position.set(48, 30, -44);
    scene.add(fillLight);

    const bounceLight = new THREE.DirectionalLight(
      isBirthday ? 0x475569 : 0xd8cbe8, 
      isBirthday ? 0.75 : 0.2
    );
    bounceLight.position.set(10, -18, 40);
    scene.add(bounceLight);

    // Warm lantern glow accents (warm amber #fbbf24 & warm peach #fed7aa)
    if (isBirthday) {
      // 1. Central Plaza Hero Tree glow (warm amber)
      const heroGlow = new THREE.PointLight(BirthdayThemeConfig.lighting.accentColor, 2.5, 22, 1.2);
      heroGlow.position.set(-4, 3.2, -6);
      scene.add(heroGlow);

      // 2. Central Plaza Landmark / Benches (warm peach)
      const plazaGlow = new THREE.PointLight(BirthdayThemeConfig.lighting.lanternColor, 2.0, 18, 1.2);
      plazaGlow.position.set(0, 2.5, 0);
      scene.add(plazaGlow);

      // 3. Home / East Garden Sakura (warm peach)
      const homeGlow = new THREE.PointLight(BirthdayThemeConfig.lighting.lanternColor, 1.8, 16, 1.2);
      homeGlow.position.set(10, 2.5, 20);
      scene.add(homeGlow);

      // 4. Station & Canal Bridge (warm amber)
      const stationGlow = new THREE.PointLight(BirthdayThemeConfig.lighting.accentColor, 1.8, 18, 1.2);
      stationGlow.position.set(-20, 2.8, 0);
      scene.add(stationGlow);

      // 5. Tech Lab Rooftop Observation Viewpoint (warm peach)
      const techGlow = new THREE.PointLight(BirthdayThemeConfig.lighting.lanternColor, 1.6, 16, 1.2);
      techGlow.position.set(15, 6.8, -20);
      scene.add(techGlow);

      // 6. Library Courtyard Sakura (warm amber)
      const libraryGlow = new THREE.PointLight(BirthdayThemeConfig.lighting.accentColor, 1.8, 16, 1.2);
      libraryGlow.position.set(22, 2.5, -4);
      scene.add(libraryGlow);
    }

    const fogColor = new THREE.Color(isBirthday ? BirthdayThemeConfig.sky.horizon : PAL.fog);
    engine.renderer.setClearColor(fogColor, 1);
    engine.renderer.toneMapping = THREE.NoToneMapping;
    engine.renderer.toneMappingExposure = 1.0;
    scene.background = fogColor;
    scene.fog = new THREE.Fog(fogColor, 44, 205);
    
    import('../../engine/world/Sky').then(({ buildSky }) => {
      buildSky(scene);
      const pmremGenerator = new THREE.PMREMGenerator(engine.renderer);
      const skyScene = new THREE.Scene();
      buildSky(skyScene);
      scene.environment = pmremGenerator.fromScene(skyScene).texture;
    });

    import('../../engine/rendering/Petals').then(({ PetalSystem }) => {
      engine.add(new PetalSystem(scene));
    });

    ctx.audio = new AudioSystem(ctx);
    engine.add({ name: 'audio', update: (dt) => ctx.audio?.update(dt) });

    engine.start();
    setCtxObj(ctx);

    return () => {
      window.removeEventListener('keydown', handleDebugKeys);
      ctx.audio?.dispose();
      unsubLand();
    };
  }, [engine]);

  const handleEnter = () => {
    setEntered(true);
    if (ctxObj) {
      ctxObj.audio?.unlock();
      ctxObj.audio?.playConfirm();
      ctxObj.engine.input.requestLock();
      
      const playerState = (ctxObj.player as any).state;
      playerState.position.y += 1.5;
      playerState.grounded = false;
      playerState.velocity.y = 0;
      
      ctxObj.events.emit('RESET_LAND');
    }
  };

  const handleCanvasClick = () => {
    if (entered && ctxObj && !isSitting) {
      ctxObj.engine.input.requestLock();
    }
  };

  const handleStand = () => {
    setIsSitting(false);
    setIsRooftopCinema(false);
    setShowBirthdayReveal(false);
    setShowPersona3Threat(false);
    if (!ctxObj) return;

    // Pause in-world 3D video if playing
    const v = (ctxObj as any).rooftopVideoEl as HTMLVideoElement | undefined;
    if (v) {
      v.pause();
    }

    if (ctxObj.audio) {
      ctxObj.audio.setMasterVolume(1.0);
      (ctxObj.audio as any).setBenchMode?.(false);
      (ctxObj.audio as any).stopPianoTrack();
    }

    import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
      const s = (ctxObj.player as any).state;
      const targetPos = new THREE.Vector3(s.position.x, s.position.y, s.position.z);
      
      AnimationSystem.playBenchStand(ctxObj.player, targetPos, s.yaw, () => {
        ctxObj.engine.input.requestLock();
      });
    });
  };

  const sitTimestampRef = useRef<number>(0);

  const handlePlayRooftopVideo = () => {
    setShowRooftopDisclaimer(false);
    setIsRooftopPlaying(true);
    sitTimestampRef.current = performance.now();
    const v = (ctxObj as any)?.rooftopVideoEl as HTMLVideoElement | undefined;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    }
  };

  const handleCloseVideo = () => {
    setShowBirthdayVideo(false);
    if (ctxObj) {
      ctxObj.engine.input.suspended = false;
      ctxObj.engine.input.requestLock();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore key events within 500ms of sitting to prevent immediate accidental stand-up from the 'E' press
      if (performance.now() - sitTimestampRef.current < 500) return;
      if (showRooftopDisclaimer) {
        if (e.code === 'Escape') handleStand();
        return;
      }

      if ((showBirthdayReveal || isSitting || isRooftopCinema) && (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Escape')) {
        handleStand();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showBirthdayReveal, isSitting, isRooftopCinema, showRooftopDisclaimer, ctxObj]);

  return (
    <>
      <div 
        ref={containerRef} 
        onClick={handleCanvasClick}
        style={{ 
          position: 'fixed', 
          inset: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 0 
        }} 
      />
      {!BirthdayThemeConfig.enabled && (
        <WorldGuideUI ctx={ctxObj!} visible={showGuide} onComplete={() => setShowGuide(false)} />
      )}
      <DebugOverlay ctx={ctxObj!} />
      <InteractionPrompt system={ctxObj?.interaction || null} input={ctxObj?.engine.input || null} />
      
      <AnimatePresence>
        {!entered && <IntroOverlay onEnter={handleEnter} />}
      </AnimatePresence>

      {/* Mobile Touch Joystick and Screen Rotation HUD */}
      <MobileControls 
        ctx={ctxObj} 
        visible={isTouchDevice && entered && !isSitting && !activeProject && !showBirthdayVideo && !showCakeCutting && !showPersona3Threat && !showRooftopExp} 
      />

      <AnimatePresence>
        {activeProject && (
          <ProjectTerminalUI 
            projectId={activeProject} 
            onClose={() => {
              import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
                AnimationSystem.playScreenDoorTransition(() => {
                  setActiveProject(null); 
                  if (ctxObj) {
                    (ctxObj.player as any).mode = 'PLAYER';
                    (ctxObj.player as any).state.grounded = true;
                    (ctxObj.player as any).state.velocity.set(0, 0, 0);
                    ctxObj.engine.input.suspended = false;
                    ctxObj.events.emit('CINEMATIC', false);
                    ctxObj.events.emit('DIALOGUE_ACTIVE', false);
                    ctxObj.engine.input.requestLock();
                  }
                  window.dispatchEvent(new Event('tour_advance'));
                });
              });
            }} 
          />
        )}
        {showBirthdayReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.25)',
              color: '#fff', fontFamily: 'serif'
            }}
          >
            <motion.div style={{ textAlign: 'center' }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, duration: 1.5 }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.5rem', letterSpacing: '0.15em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {BirthdayThemeConfig.birthdayName}
              </h1>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 300, marginBottom: '2rem', letterSpacing: '0.1em', color: '#ffb7c5', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                HAPPY BIRTHDAY 🌸
              </h2>
              <p style={{ fontSize: '1.2rem', fontStyle: 'italic', letterSpacing: '0.05em', color: '#f8fafc', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                Wishing you a wonderful year ahead.
              </p>
            </motion.div>
            <motion.button
              onClick={handleStand}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 1, duration: 0.8 }}
              style={{
                marginTop: '3.5rem',
                letterSpacing: '0.2em',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                background: 'rgba(244, 114, 182, 0.85)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '24px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(244, 114, 182, 0.4)'
              }}
            >
              [ E ] STAND UP & WALK
            </motion.button>
          </motion.div>
        )}

        {isSitting && !showBirthdayReveal && !isRooftopCinema && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleStand}
            style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1200,
              backgroundColor: '#f472b6',
              color: '#ffffff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '30px',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(244, 114, 182, 0.5)'
            }}
          >
            [ E ] STAND UP & WALK
          </motion.button>
        )}

        {/* Phase 1: Focused Heartfelt Apology Disclaimer Before Playing Video */}
        {isRooftopCinema && showRooftopDisclaimer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 160 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1400,
              width: '680px',
              maxWidth: '92vw',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 27, 75, 0.96) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(244, 114, 182, 0.6)',
              borderRadius: '24px',
              padding: '32px 36px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(244,114,182,0.3)'
            }}
          >
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#f472b6', letterSpacing: '0.12em', textAlign: 'center' }}>
              🌸 A Special Birthday Surprise for Sahithi 🌸
            </div>

            <div style={{
              background: 'rgba(254, 215, 170, 0.1)',
              borderLeft: '4px solid #fed7aa',
              borderRadius: '8px',
              padding: '16px 20px',
              fontSize: '0.92rem',
              color: '#fed7aa',
              lineHeight: 1.6,
              fontStyle: 'italic'
            }}>
              <strong>A quick note first:</strong><br />
              I am really sorry if this took you by surprise — I saved this video without your prior consent because I wanted to make something truly special, meaningful, and unforgettable for your birthday. I am genuinely and extremely sorry for taking it without asking, but I hope this tribute brings a warm smile to your face! 💖
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', width: '100%', justifyContent: 'center' }}>
              <button
                onClick={handlePlayRooftopVideo}
                style={{
                  background: 'linear-gradient(90deg, #f472b6 0%, #ec4899 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '30px',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(244, 114, 182, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ▶ WATCH BIRTHDAY SURPRISE
              </button>

              <button
                onClick={handleStand}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px 24px',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                STAND UP
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase 2: Floating Tribute Subtitle Bar While Video Plays */}
        {isRooftopCinema && isRooftopPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1100,
              width: '820px',
              maxWidth: '94vw',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(244, 114, 182, 0.45)',
              borderRadius: '18px',
              padding: '18px 24px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 12px 35px rgba(0,0,0,0.7)'
            }}
          >
            <p style={{ margin: 0, fontSize: '0.96rem', fontStyle: 'italic', textAlign: 'center', color: '#fbcfe8', letterSpacing: '0.03em', lineHeight: 1.5 }}>
              "Wishing a very, very Happy Birthday to Sahithi! You are truly one of the most brilliant, inspiring, and wonderful people I know. I hope this year brings you endless joy, success, and beautiful smiles! 🌸✨💖"
            </p>
            <button
              onClick={handleStand}
              style={{
                backgroundColor: '#f472b6',
                color: '#ffffff',
                border: 'none',
                padding: '8px 28px',
                borderRadius: '24px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(244, 114, 182, 0.4)'
              }}
            >
              [ E ] STAND UP & EXPLORE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <MusicPlayerUI visible={isSitting && !showBirthdayReveal && !isRooftopCinema} onStand={handleStand} />
      <BirthdayVideoUI ctx={ctxObj} visible={showBirthdayVideo} onClose={handleCloseVideo} />
      <Persona3ThreatUI 
        ctx={ctxObj} 
        visible={showPersona3Threat} 
        onClose={() => {
          setShowPersona3Threat(false);
          if (ctxObj) {
            (ctxObj.player as any).mode = 0; // CameraMode.PLAYER
            (ctxObj.player as any).state.grounded = true;
            (ctxObj.player as any).state.velocity.set(0, 0, 0);
            ctxObj.engine.input.suspended = false;
            ctxObj.engine.input.requestLock();
          }
        }} 
      />
      <CakeCuttingUI
        visible={showCakeCutting}
        onClose={() => {
          setShowCakeCutting(false);
          if (ctxObj) {
            (ctxObj.player as any).mode = 0; // CameraMode.PLAYER
            (ctxObj.player as any).state.grounded = true;
            (ctxObj.player as any).state.velocity.set(0, 0, 0);
            ctxObj.engine.input.suspended = false;
            ctxObj.engine.input.requestLock();
          }
        }}
      />
      <RooftopExperienceUI 
        ctx={ctxObj} 
        visible={showRooftopExp} 
        onClose={() => {
          setShowRooftopExp(false);
          if (ctxObj) {
            (ctxObj.player as any).mode = 'PLAYER';
            (ctxObj.player as any).state.grounded = true;
            (ctxObj.player as any).state.velocity.set(0, 0, 0);
            ctxObj.engine.input.suspended = false;
            ctxObj.events.emit('CINEMATIC', false);
            ctxObj.events.emit('DIALOGUE_ACTIVE', false);
            ctxObj.engine.input.requestLock();
          }
        }} 
      />
    </>
  );
}
