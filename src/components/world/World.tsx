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
import { AnimatePresence } from 'framer-motion';

import { useTourState } from '../../hooks/useTourState';
import { NavigationMarker } from '../../engine/world/NavigationMarker';

export default function World() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engine = useEngine(containerRef);
  const [ctxObj, setCtxObj] = useState<PortfolioContext | null>(null);
  const [entered, setEntered] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isSitting, setIsSitting] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  const { currentTargetId } = useTourState();

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Sync navigation marker with tour state
  useEffect(() => {
    if (!ctxObj) return;
    const markerSystem = ctxObj.engine.systems.find(s => (s as any).name === 'navigation_marker') as NavigationMarker | undefined;
    if (markerSystem) {
      markerSystem.setTarget(currentTargetId);
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
              // Reset if no valid project/experience
              setTimeout(() => {
                ctxObj.engine.input.suspended = false;
                ctxObj.events.emit('CINEMATIC', false);
              }, 1000);
            }
          });
        });
      });
    });

    const unsubBench = ctxObj.events.on('INTERACT_BENCH', (benchData: any) => {
      setIsSitting(true);
      document.exitPointerLock();
      import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
        const targetPos = new THREE.Vector3(
          benchData.x,
          benchData.y + 0.6,
          benchData.z
        );
        AnimationSystem.playBenchSit(ctxObj.player, targetPos, benchData.ry, () => {
          // Camera arrived
        });
      });
    });

    return () => {
      window.removeEventListener('keydown', handleMapToggle);
      unsubTerminal();
      unsubLandmark();
      unsubBench();
    };
  }, [ctxObj]);

  useEffect(() => {
    if (!engine) return;

    // Create a portfolio context
    const ctx = new PortfolioContext();
    ctx.engine = engine;
    ctx.camera = engine.camera;
    
    // Setup basic collision system
    ctx.collision = new CollisionWorld();

    // Setup interaction system
    ctx.interaction = new InteractionSystem(ctx);
    engine.add(ctx.interaction);

    // Instantiate WorldBuilder first so ground height is set
    const builder = new WorldBuilder(ctx);
    builder.build();

    // Spawn safely at the specified central plaza location
    const spawnX = 3;
    const spawnZ = 8;
    const groundY = ctx.collision.groundHeight(spawnX, spawnZ);
    // Spawn at ground level initially to prevent falling during intro
    ctx.player = new PlayerController(ctx, new THREE.Vector3(spawnX, groundY, spawnZ), Math.atan2(-3, -8));
    engine.add(ctx.player);

    // hasLanded starts true so the initial frame 1 resolution doesn't trigger the tour
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

    // Setup navigation marker
    const navMarker = new NavigationMarker(ctx);
    engine.add(navMarker);

    // ---- DEBUG MODE (Temporary Developer Diagnostic) ----
    // 1: Raw scene / no postFX
    // 2: Toon only
    // 3: Toon + outlines
    // 4: Full postFX
    // 5: Textures disabled (white override)
    // 6: Lighting disabled (ambient override)
    // 7: Water disabled
    const handleDebugKeys = (e: KeyboardEvent) => {
      if (!ctx.engine || !(ctx.engine as any).pipeline) return;
      const pipeline = (ctx.engine as any).pipeline;
      switch (e.key) {
        case '1':
          pipeline.enabled = { ink: false, grade: false, fxaa: false };
          console.log('[DEBUG] Raw scene (no post)');
          break;
        case '2':
          pipeline.enabled = { ink: false, grade: true, fxaa: false };
          console.log('[DEBUG] Toon only (grade pass only)');
          break;
        case '3':
          pipeline.enabled = { ink: true, grade: true, fxaa: false };
          console.log('[DEBUG] Toon + outlines (no FXAA)');
          break;
        case '4':
          pipeline.enabled = { ink: true, grade: true, fxaa: true };
          console.log('[DEBUG] Full pipeline');
          break;
        case '5':
          (ctx.scene as any).overrideMaterial = (ctx.scene as any).overrideMaterial ? null : new THREE.MeshBasicMaterial({ color: 0xffffff });
          console.log('[DEBUG] Textures/materials toggled');
          break;
        case '6':
          // Toggle lights
          ctx.scene.traverse((o) => { if ((o as THREE.Light).isLight) o.visible = !o.visible; });
          console.log('[DEBUG] Lights toggled');
          break;
        case '7':
          const water = ctx.scene.getObjectByName('canal_water');
          if (water) water.visible = !water.visible;
          console.log('[DEBUG] Water toggled');
          break;
      }
    };
    window.addEventListener('keydown', handleDebugKeys);

    // Build the test scene
    const scene = engine.scene;
    
    // ---- Lighting (matching Sakura Crossing original) ----
    const hemiLight = new THREE.HemisphereLight(PAL.hemiSky, PAL.hemiGround, 0.9);
    scene.add(hemiLight);

    // Sun — the key light (warm, strong, but pastel)
    const sunLight = new THREE.DirectionalLight(PAL.sun, 1.15);
    sunLight.position.set(-80, 25, 60);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.mapSize.setScalar(2048);
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // Fill — cool fill from the opposite side
    const fillLight = new THREE.DirectionalLight(PAL.fill, 0.6);
    fillLight.position.set(48, 26, -44);
    scene.add(fillLight);

    // Bounce — subtle upward bounce
    const bounceLight = new THREE.DirectionalLight(0xd8cbe8, 0.2);
    bounceLight.position.set(10, -18, 40);
    scene.add(bounceLight);

    // Sky/fog — match Sakura Crossing original
    const fogColor = new THREE.Color(PAL.fog);
    engine.renderer.setClearColor(fogColor, 1);
    engine.renderer.toneMapping = THREE.NoToneMapping;
    engine.renderer.toneMappingExposure = 1.0;
    scene.background = fogColor;
    scene.fog = new THREE.Fog(fogColor, 44, 205);
    
    // Procedural sky dome
    import('../../engine/world/Sky').then(({ buildSky }) => {
      buildSky(scene);
      
      // Generate PMREM for physical materials (Water) to reflect
      const pmremGenerator = new THREE.PMREMGenerator(engine.renderer);
      const skyScene = new THREE.Scene();
      buildSky(skyScene);
      scene.environment = pmremGenerator.fromScene(skyScene).texture;
    });

    // Petal System
    import('../../engine/rendering/Petals').then(({ PetalSystem }) => {
      engine.add(new PetalSystem(scene));
    });

    // Setup audio system
    ctx.audio = new AudioSystem(ctx);
    engine.add({ name: 'audio', update: (dt) => ctx.audio?.update(dt) });

    // Start engine loop
    engine.start();
    
    setCtxObj(ctx);

    return () => {
      window.removeEventListener('keydown', handleDebugKeys);
      ctx.audio?.dispose();
      unsubLand();
      // Cleanup happens inside useEngine
    };
  }, [engine]);

  const handleEnter = () => {
    setEntered(true);
    if (ctxObj) {
      ctxObj.audio?.unlock();
      ctxObj.audio?.playConfirm();
      ctxObj.engine.input.requestLock();
      
      // TRIGGER THE DROP
      const playerState = (ctxObj.player as any).state;
      playerState.position.y += 1.5;
      playerState.grounded = false;
      playerState.velocity.y = 0;
      
      // This allows the ensuing physics land event to advance the tour
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
    if (!ctxObj) return;

    import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
      const s = (ctxObj.player as any).state;
      const targetPos = new THREE.Vector3(s.position.x, s.position.y, s.position.z);
      
      AnimationSystem.playBenchStand(ctxObj.player, targetPos, s.yaw, () => {
        ctxObj.engine.input.requestLock();
      });
    });
  };

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
      <WorldGuideUI ctx={ctxObj!} visible={showGuide} onComplete={() => setShowGuide(false)} />
      <DebugOverlay ctx={ctxObj!} />
      <InteractionPrompt system={ctxObj?.interaction || null} input={ctxObj?.engine.input || null} />
      
      <AnimatePresence>
        {/* other Overlays are inside here already ... let's put MusicPlayerUI next to ProjectTerminalUI */}
        {isTouchDevice && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1000, 
            backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', 
            flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
          }}>
            <p style={{color: '#fff', marginBottom: '2rem', fontFamily: 'monospace'}}>3D Mode requires a keyboard and mouse.</p>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                padding: '1rem 2rem', background: 'var(--accent)', 
                color: 'var(--fg)', border: 'none', fontWeight: 'bold'
              }}
            >
              [ OPEN CLASSIC MODE ]
            </button>
          </div>
        )}
        {!entered && !isTouchDevice && <IntroOverlay onEnter={handleEnter} />}
        {activeProject && (
          <ProjectTerminalUI 
            projectId={activeProject} 
            onClose={() => { 
              import('../../engine/animation/AnimationSystem').then(({ AnimationSystem }) => {
                AnimationSystem.playScreenDoorTransition(() => {
                  setActiveProject(null); 
                  if (ctxObj) {
                    ctxObj.engine.input.suspended = false;
                    ctxObj.events.emit('CINEMATIC', false);
                    ctxObj.engine.input.requestLock();
                  }
                  window.dispatchEvent(new Event('tour_advance'));
                });
              });
            }} 
          />
        )}
      </AnimatePresence>
      <MusicPlayerUI visible={isSitting} onStand={handleStand} />
    </>
  );
}
