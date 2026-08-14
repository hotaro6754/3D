import * as THREE from 'three';
import { PortfolioContext } from '../core/Context';
import { makePole, makeVendBin, makeBench, makeGuideBoard, makeBicycle, makePostBox } from './Props';
import { makeGuardrail } from './Props';
import { buildSakura } from './Vegetation';
import { cel, flat } from '../rendering/toon';
import { BirthdayThemeConfig } from './BirthdayThemeConfig';
import { playMeowHappyBirthday } from '../audio/CatSong';

/**
 * Adapter: Sakura Crossing vegetation code expects ctx.add() and ctx.collide().
 * Our PortfolioContext uses ctx.scene.add() and ctx.collision.addAABB().
 * This wrapper bridges the two APIs.
 */
function sakuraCtx(ctx: PortfolioContext) {
  return {
    add: (obj: THREE.Object3D) => ctx.scene.add(obj),
    tick: (fn: () => void) => ctx.tick(fn),
    collide: (x0: number, z0: number, x1: number, z1: number, h: number) => {
      if (ctx.collision) {
        const cx = (x0 + x1) / 2;
        const cz = (z0 + z1) / 2;
        const hx = Math.abs(x1 - x0) / 2;
        const hz = Math.abs(z1 - z0) / 2;
        ctx.collision.addBox(cx, cz, hx, hz, 0, h, 0, 'SakuraTree');
      }
    },
  };
}

export const activeCats: Array<{ group: THREE.Group; head: THREE.Mesh; tail: THREE.Mesh; seed: number; baseY: number }> = [];

export function makeCat({ x, y = 0, z, ry = 0, color = 0xf59e0b, darkColor }: { x: number; y?: number; z: number; ry?: number; color?: number; darkColor?: number }) {
  const g = new THREE.Group();
  const matBody = cel({ color });
  const matEar = darkColor !== undefined ? cel({ color: darkColor }) : cel({ color: 0xf472b6 });
  const matWhite = cel({ color: 0xffffff });
  const matPink = cel({ color: 0xf472b6 });
  const matGold = cel({ color: 0xfbbf24 });
  const matEyes = flat({ color: 0x1e293b });

  // Main Torso (elevated on legs)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.52), matBody);
  body.position.set(0, 0.26, 0);
  g.add(body);

  // Soft White Belly / Chest
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.24, 0.18), matWhite);
  chest.position.set(0, 0.24, 0.20);
  g.add(chest);

  // Collar with Golden Bell
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.05, 12), matPink);
  collar.position.set(0, 0.38, 0.24);
  g.add(collar);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), matGold);
  bell.position.set(0, 0.35, 0.35);
  g.add(bell);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.30, 0.32), matBody);
  head.position.set(0, 0.46, 0.24);
  g.add(head);

  // Pointy Ears
  for (let i = -1; i <= 1; i += 2) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 4), matEar);
    ear.position.set(i * 0.11, 0.66, 0.26);
    ear.rotation.y = Math.PI / 4;
    g.add(ear);
  }

  // Cute Big Eyes
  for (let i = -1; i <= 1; i += 2) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), matEyes);
    eye.position.set(i * 0.09, 0.48, 0.40);
    g.add(eye);
  }

  // Curled Expressive Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 8), matBody);
  tail.position.set(0, 0.34, -0.32);
  tail.rotation.x = Math.PI / 3;
  g.add(tail);

  // 4 Distinct Standing Paws (Height 0.16, baseline at y=0.00)
  for (let sx = -1; sx <= 1; sx += 2) {
    for (let sz = -1; sz <= 1; sz += 2) {
      const paw = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.16, 0.13), matWhite);
      paw.position.set(sx * 0.14, 0.08, sz * 0.18);
      g.add(paw);
    }
  }

  g.position.set(x, y, z);
  g.rotation.y = ry;
  activeCats.push({ group: g, head, tail, seed: Math.random() * 10, baseY: y });
  return g;
}

export function buildProps(ctx: PortfolioContext) {
  // ------------------------------------------------------------------
  // 1. Tech Lab Props
  // ------------------------------------------------------------------
  // (Left side of the main crossroad)
  const techLabPos = new THREE.Vector3(15, 0, -20);
  ctx.scene.add(makeVendBin({ x: techLabPos.x - 5, z: techLabPos.z + 5, ry: Math.PI / 2, color: 0x00f0ff, seed: 1 }));
  ctx.scene.add(makeVendBin({ x: techLabPos.x - 5, z: techLabPos.z + 7, ry: Math.PI / 2, color: 0x00f0ff, seed: 2 }));
  const bin1 = makeVendBin({ x: techLabPos.x + 6, z: techLabPos.z + 4, ry: 0, color: 0x00f0ff, seed: 3 });
  ctx.scene.add(bin1);
  const bin2 = makeVendBin({ x: techLabPos.x + 6, z: techLabPos.z + 4, ry: 0, color: 0x00f0ff, seed: 4 });
  bin2.position.y += 1.8;
  ctx.scene.add(bin2);
  const bin3 = makeVendBin({ x: techLabPos.x + 6, z: techLabPos.z + 4, ry: 0, color: 0x00f0ff, seed: 5 });
  bin3.position.y += 3.6;
  ctx.scene.add(bin3);
  const registerBench = (x: number, z: number, ry: number) => {
    ctx.scene.add(makeBench({ x, z, ry }));
    ctx.interaction.register({
      id: `bench_${Math.round(x)}_${Math.round(z)}`,
      position: new THREE.Vector3(x, 1.0, z),
      radius: 2.0,
      label: BirthdayThemeConfig.enabled ? '[E] REST UNDER SAKURA' : '[E] SIT ON BENCH',
      onInteract: () => {
        ctx.events.emit('INTERACT_BENCH', { x, y: 0, z, ry });
      }
    });
  };
  registerBench(techLabPos.x + 4, techLabPos.z + 7, Math.PI / 2);
  registerBench(techLabPos.x + 4, techLabPos.z - 7, Math.PI / 2);

  // Metal Exterior Staircase to Rooftop (3 flights)
  const stairMat = cel({ color: 0x334155 });
  const landingMat = cel({ color: 0x1e293b });
  const numSteps = 24;
  const totalH = 5.44;
  const stepH = totalH / numSteps;
  const stepD = 0.32;
  const stepW = 1.1;

  for (let i = 0; i < numSteps; i++) {
    const isFlight1 = i < 8;
    const isFlight2 = i >= 8 && i < 16;
    const isFlight3 = i >= 16;

    let sx = techLabPos.x + 6.3;
    let sy = (i + 0.5) * stepH;
    let sz = techLabPos.z;

    if (isFlight1) {
      sz = techLabPos.z - 3.5 + i * stepD;
    } else if (isFlight2) {
      sz = techLabPos.z - 3.5 + 8 * stepD - (i - 8) * stepD;
      sx += 0.9;
    } else if (isFlight3) {
      sz = techLabPos.z - 3.5 + (i - 16) * stepD;
    }

    const stepGeo = new THREE.BoxGeometry(stepW, stepH, stepD);
    const stepMesh = new THREE.Mesh(stepGeo, stairMat);
    stepMesh.position.set(sx, sy, sz);
    ctx.scene.add(stepMesh);

    if (ctx.collision && typeof (ctx.collision as any).addFloor === 'function') {
      (ctx.collision as any).addFloor(sx, sz, stepW/2, stepD/2, (i + 1) * stepH);
    }
  }

  // Intermediate landings
  const landing1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 1.4), landingMat);
  landing1.position.set(techLabPos.x + 6.75, 8 * stepH, techLabPos.z - 3.5 + 8 * stepD);
  ctx.scene.add(landing1);
  if (ctx.collision && typeof (ctx.collision as any).addFloor === 'function') {
    (ctx.collision as any).addFloor(landing1.position.x, landing1.position.z, 0.9, 0.7, 8 * stepH);
  }

  const landing2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 1.4), landingMat);
  landing2.position.set(techLabPos.x + 6.75, 16 * stepH, techLabPos.z - 3.5);
  ctx.scene.add(landing2);
  if (ctx.collision && typeof (ctx.collision as any).addFloor === 'function') {
    (ctx.collision as any).addFloor(landing2.position.x, landing2.position.z, 0.9, 0.7, 16 * stepH);
  }

  // Tech Lab Rooftop Floor & Observation Viewpoint
  const roofY = 5.44;
  if (ctx.collision && typeof (ctx.collision as any).addFloor === 'function') {
    (ctx.collision as any).addFloor(techLabPos.x, techLabPos.z, 5.8, 4.8, roofY);
  }

  // Rooftop Fairy / Paper Lanterns (Unobstructed viewing deck)
  const roofLight1 = new THREE.PointLight(0xfbcfe8, 1.8, 12);
  roofLight1.position.set(techLabPos.x - 4, roofY + 2.5, techLabPos.z - 3);
  ctx.scene.add(roofLight1);
  const roofLight2 = new THREE.PointLight(0xfef08a, 1.8, 12);
  roofLight2.position.set(techLabPos.x + 4, roofY + 2.5, techLabPos.z - 3);
  ctx.scene.add(roofLight2);

  // In-World Rooftop 3D Video Screen
  let screenMat: THREE.Material = flat({ color: 0x0f172a });
  if (BirthdayThemeConfig.enabled && typeof document !== 'undefined') {
    const v = document.createElement('video');
    v.src = BirthdayThemeConfig.videoAsset;
    v.crossOrigin = 'anonymous';
    v.loop = true;
    v.playsInline = true;
    v.autoplay = false;
    v.preload = 'auto';
    (ctx as any).rooftopVideoEl = v;

    const vTex = new THREE.VideoTexture(v);
    vTex.minFilter = THREE.LinearFilter;
    vTex.magFilter = THREE.LinearFilter;
    vTex.format = THREE.RGBAFormat;
    vTex.colorSpace = THREE.SRGBColorSpace;
    vTex.generateMipmaps = false;

    screenMat = new THREE.MeshBasicMaterial({ 
      map: vTex,
      side: THREE.DoubleSide,
      toneMapped: false
    });
  }

  // Giant Horizontal Projector Theater Screen (6.4m x 3.6m)
  const screenH = 3.6;
  const screenW = 6.4;
  const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.name = 'rooftop_screen_mesh';
  screenMesh.position.set(techLabPos.x, roofY + 2.3, techLabPos.z - 3.8);
  ctx.scene.add(screenMesh);

  // Screen Glowing Cinema Border
  const borderGeo = new THREE.BoxGeometry(screenW + 0.16, screenH + 0.16, 0.05);
  const borderMat = flat({ color: 0xf472b6 });
  const borderMesh = new THREE.Mesh(borderGeo, borderMat);
  borderMesh.position.set(techLabPos.x, roofY + 2.3, techLabPos.z - 3.85);
  ctx.scene.add(borderMesh);

  // Volumetric Projector Beam
  const beamGeo = new THREE.CylinderGeometry(0.12, 2.8, 6.0, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamMesh.position.set(techLabPos.x, roofY + 2.3, techLabPos.z - 0.8);
  beamMesh.rotation.x = Math.PI / 2;
  ctx.scene.add(beamMesh);

  if (BirthdayThemeConfig.enabled && typeof document !== 'undefined') {
    const v = (ctx as any).rooftopVideoEl as HTMLVideoElement | undefined;
    if (v) {
      v.addEventListener('loadedmetadata', () => {
        if (v.videoWidth && v.videoHeight) {
          const aspect = v.videoWidth / v.videoHeight;
          const newW = Math.max(2.4, Math.min(6.8, screenH * aspect));
          screenMesh.geometry.dispose();
          screenMesh.geometry = new THREE.PlaneGeometry(newW, screenH);
          borderMesh.geometry.dispose();
          borderMesh.geometry = new THREE.BoxGeometry(newW + 0.16, screenH + 0.16, 0.05);
        }
      });
    }
  }

  // Rooftop Seating Chair facing screen (ry = 0 faces -Z screen)
  ctx.scene.add(makeBench({ x: techLabPos.x, z: techLabPos.z - 0.5, y: roofY, ry: 0 }));
  ctx.interaction.register({
    id: `bench_techlab_roof`,
    position: new THREE.Vector3(techLabPos.x, roofY + 1.0, techLabPos.z - 0.5),
    radius: 3.0,
    label: BirthdayThemeConfig.enabled ? '[E] SIT & WATCH SURPRISE' : '[E] SIT & ENJOY THE VIEW',
    onInteract: () => {
      if (BirthdayThemeConfig.enabled) {
        ctx.events.emit('INTERACT_ROOFTOP_CINEMA');
      } else {
        ctx.events.emit('INTERACT_BENCH', { x: techLabPos.x, y: roofY, z: techLabPos.z - 0.5, ry: 0 });
      }
    }
  });

  // ------------------------------------------------------------------
  // Painted Street-Art Graffiti Arrows & Mystery Symbols (Zero solid box)
  // ------------------------------------------------------------------
  if (BirthdayThemeConfig.enabled && typeof document !== 'undefined') {
    const makeWallGraffiti = (symbol: string, color = '#f472b6', glow = 'rgba(244, 114, 182, 0.8)', size = 1.6) => {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 256;
      const c = cv.getContext('2d')!;
      c.clearRect(0, 0, 256, 256);

      c.shadowColor = glow;
      c.shadowBlur = 24;
      c.fillStyle = color;
      c.font = '900 72px "Segoe UI", "Arial Black", sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(symbol, 128, 128);
      c.fillText(symbol, 128, 128);

      const tex = new THREE.CanvasTexture(cv);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.FrontSide });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
      return mesh;
    };

    // 1. Glowing Electric Blue Rooftop Arrow on Tech Lab Stair Wall
    const arrowRoof = makeWallGraffiti('↗ ✦', '#38bdf8', '#0284c7', 1.8);
    arrowRoof.position.set(18.5, 2.0, -14.88);
    arrowRoof.rotation.y = 0;
    ctx.scene.add(arrowRoof);

    // 2. Glowing Magenta Cat Paws on Library Wall pointing to Sanctuary (Outside courtyard only)
    const arrowCats = makeWallGraffiti('➔ 🐾', '#f472b6', '#db2777', 1.8);
    arrowCats.position.set(19.88, 2.0, 2.0);
    arrowCats.rotation.y = -Math.PI / 2;
    ctx.scene.add(arrowCats);

    // 3. Glowing Amber Warning Arrow on Plaza Security Wall
    const arrowSec = makeWallGraffiti('➔ ⚡', '#fbbf24', '#d97706', 1.8);
    arrowSec.position.set(-18.0, 2.0, -9.88);
    arrowSec.rotation.y = 0;
    ctx.scene.add(arrowSec);
  }

  // ------------------------------------------------------------------
  // Cats (Sahithi loves cats!)
  // ------------------------------------------------------------------
  // 1. Rooftop Cat
  const roofCat = makeCat({ x: techLabPos.x + 2.0, y: roofY, z: techLabPos.z - 1.5, ry: -Math.PI / 3, color: 0xf59e0b });
  ctx.scene.add(roofCat);
  ctx.interaction.register({
    id: 'cat_rooftop',
    position: new THREE.Vector3(techLabPos.x + 2.0, roofY + 0.5, techLabPos.z - 1.5),
    radius: 2.5,
    facingDot: -1.0,
    label: '[E] PET ROOFTOP CAT 🐱 (SINGS FOR SAHITHI!)',
    onInteract: () => {
      playMeowHappyBirthday();
    }
  });

  // 2. Sakura Plaza Cat
  const plazaCat = makeCat({ x: -2.5, y: 0.1, z: 2.0, ry: Math.PI / 4, color: 0xffffff });
  ctx.scene.add(plazaCat);
  ctx.interaction.register({
    id: 'cat_plaza',
    position: new THREE.Vector3(-2.5, 0.5, 2.0),
    radius: 2.5,
    facingDot: -1.0,
    label: '[E] PET SAKURA CAT 🐱 (SINGS FOR SAHITHI!)',
    onInteract: () => {
      playMeowHappyBirthday();
    }
  });

  // 3. Quiet Corner Cat
  const homeCat = makeCat({ x: 13.5, y: 0.1, z: 13.5, ry: -Math.PI / 2, color: 0x334155 });
  ctx.scene.add(homeCat);
  ctx.interaction.register({
    id: 'cat_home',
    position: new THREE.Vector3(13.5, 0.5, 13.5),
    radius: 2.5,
    facingDot: -1.0,
    label: '[E] PET COZY CAT 🐱 (SINGS FOR SAHITHI!)',
    onInteract: () => {
      playMeowHappyBirthday();
    }
  });

  // Continuous animation loop for all cats in the district
  ctx.tick(() => {
    const t = performance.now() / 1000;
    const playerPos = ctx.player?.state?.position;

    for (const cat of activeCats) {
      // Natural lively tail wag
      cat.tail.rotation.z = Math.sin(t * 3.2 + cat.seed) * 0.45;
      cat.tail.rotation.x = Math.PI / 3 + Math.cos(t * 2.1 + cat.seed) * 0.20;

      // Cute rhythmic breathing bob
      cat.group.position.y = cat.baseY + Math.sin(t * 2.8 + cat.seed) * 0.012;

      // Turn head toward player when player is within 5 meters
      if (playerPos) {
        const catWorldPos = new THREE.Vector3();
        cat.group.getWorldPosition(catWorldPos);
        const dist = catWorldPos.distanceTo(new THREE.Vector3(playerPos.x, catWorldPos.y, playerPos.z));

        if (dist < 4.5) {
          const dx = playerPos.x - catWorldPos.x;
          const dz = playerPos.z - catWorldPos.z;
          const targetAngle = Math.atan2(dx, dz) - cat.group.rotation.y;
          const clamped = Math.max(-0.65, Math.min(0.65, targetAngle));
          cat.head.rotation.y = THREE.MathUtils.lerp(cat.head.rotation.y, clamped, 0.08);
        } else {
          cat.head.rotation.y = THREE.MathUtils.lerp(cat.head.rotation.y, Math.sin(t * 1.2 + cat.seed) * 0.25, 0.05);
        }
      }
    }
  });
  
  // ------------------------------------------------------------------
  // 2. Security Lab Props
  // ------------------------------------------------------------------
  const secLabPos = new THREE.Vector3(-15, 0, -20);
  ctx.scene.add(makePole({ x: secLabPos.x + 5, z: secLabPos.z + 5 }));

  // ------------------------------------------------------------------
  // 3. Station Props
  // ------------------------------------------------------------------
  const stationPos = new THREE.Vector3(-25, 0, 0);
  registerBench(stationPos.x + 8, stationPos.z - 3, Math.PI / 2);
  registerBench(stationPos.x + 8, stationPos.z + 3, Math.PI / 2);
  ctx.scene.add(makeGuideBoard({ x: stationPos.x + 10, z: stationPos.z, ry: Math.PI / 2, style: 1 }));

  // ------------------------------------------------------------------
  // 4. Library Props
  // ------------------------------------------------------------------
  const libraryPos = new THREE.Vector3(25, 0, 0);
  registerBench(libraryPos.x - 8, libraryPos.z - 3, -Math.PI / 2);
  registerBench(libraryPos.x - 8, libraryPos.z + 3, -Math.PI / 2);
  

  // ------------------------------------------------------------------
  // 5. Home Props
  // ------------------------------------------------------------------
  const homePos = new THREE.Vector3(15, 0, 20);
  ctx.scene.add(makePostBox({ x: homePos.x - 4, z: homePos.z - 4, ry: Math.PI }));
  ctx.scene.add(makeBicycle({ x: homePos.x + 3, z: homePos.z - 3, ry: 0.5 }));
  

  // ------------------------------------------------------------------
  // 6. Central Landmark Directional Fingerpost
  // Physically pointed directional arms targeting the 4 active birthday destinations
  // ------------------------------------------------------------------
  const makeBirthdayFingerPost = () => {
    const g = new THREE.Group();
    g.position.set(0, 0, 0);

    const matPole = cel({ color: 0x3b2416 });
    const matStone = cel({ color: 0x64748b });

    // Plinth Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.20, 8), matStone);
    base.position.set(0, 0.10, 0);
    base.castShadow = true;
    g.add(base);

    // Main Octagonal Timber Pole (Height 2.7m)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 2.7, 8), matPole);
    pole.position.set(0, 1.35, 0);
    pole.castShadow = true;
    g.add(pole);

    // Glowing Golden Lantern atop pole
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 8), matPole);
    cap.position.set(0, 2.74, 0);
    g.add(cap);

    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.24, 0.20), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    lantern.position.set(0, 2.88, 0);
    g.add(lantern);

    const lanternLight = new THREE.PointLight(0xfef08a, 1.5, 6);
    lanternLight.position.set(0, 2.88, 0);
    g.add(lanternLight);

    const destinations = [
      { name: 'CAT SANCTUARY', sub: 'Cake & Cat Choir', emoji: '🐱', tx: 20, tz: 0, y: 2.15, col: '#ec4899' },
      { name: 'ROOFTOP THEATRE', sub: 'Birthday Cinema', emoji: '🎬', tx: 15, tz: -15, y: 1.70, col: '#0284c7' },
      { name: 'AURA LAB', sub: 'Persona Diagnostic', emoji: '✨', tx: -23, tz: -15, y: 1.25, col: '#d97706' },
      { name: 'SAKURA HERO TREE', sub: 'Resting Garden', emoji: '🌸', tx: -4, tz: -6, y: 0.80, col: '#db2777' }
    ];

    destinations.forEach(dest => {
      const arm = new THREE.Group();
      arm.position.set(0, dest.y, 0);

      // Exact Three.js Angle: rotating local +X axis to point along world (tx, tz)
      arm.rotation.y = Math.atan2(-dest.tz, dest.tx);

      const plankW = 1.12;
      const plankH = 0.26;
      const plankD = 0.055;

      // Front Face Canvas (Normal in +Z: Arrow ➤ is on the right tip)
      const cvFront = document.createElement('canvas');
      cvFront.width = 512; cvFront.height = 128;
      const cF = cvFront.getContext('2d')!;
      cF.fillStyle = '#fff7ed';
      cF.fillRect(0, 0, 512, 128);
      cF.fillStyle = dest.col;
      cF.fillRect(0, 0, 512, 10);
      cF.fillRect(0, 118, 512, 10);
      cF.fillStyle = '#0f172a';
      cF.font = 'bold 36px "Segoe UI", sans-serif';
      cF.textAlign = 'left';
      cF.fillText(`${dest.emoji} ${dest.name}`, 20, 52);
      cF.fillStyle = '#475569';
      cF.font = '600 24px "Segoe UI", sans-serif';
      cF.fillText(dest.sub, 20, 96);
      cF.fillStyle = dest.col;
      cF.font = '900 56px sans-serif';
      cF.textAlign = 'right';
      cF.fillText('➤', 492, 78);

      const texFront = new THREE.CanvasTexture(cvFront);

      // Back Face Canvas (Normal in -Z: Looking from opposite side, Arrow ◄ is on the left tip)
      const cvBack = document.createElement('canvas');
      cvBack.width = 512; cvBack.height = 128;
      const cB = cvBack.getContext('2d')!;
      cB.fillStyle = '#fff7ed';
      cB.fillRect(0, 0, 512, 128);
      cB.fillStyle = dest.col;
      cB.fillRect(0, 0, 512, 10);
      cB.fillRect(0, 118, 512, 10);
      cB.fillStyle = dest.col;
      cB.font = '900 56px sans-serif';
      cB.textAlign = 'left';
      cB.fillText('◄', 20, 78);
      cB.fillStyle = '#0f172a';
      cB.font = 'bold 36px "Segoe UI", sans-serif';
      cB.textAlign = 'left';
      cB.fillText(`${dest.emoji} ${dest.name}`, 96, 52);
      cB.fillStyle = '#475569';
      cB.font = '600 24px "Segoe UI", sans-serif';
      cB.fillText(dest.sub, 96, 96);

      const texBack = new THREE.CanvasTexture(cvBack);

      const matSides = cel({ color: 0xeddcc8 });
      const matF = new THREE.MeshBasicMaterial({ map: texFront });
      const matB = new THREE.MeshBasicMaterial({ map: texBack });

      const plankGeo = new THREE.BoxGeometry(plankW, plankH, plankD);
      const plankMesh = new THREE.Mesh(plankGeo, [matSides, matSides, matSides, matSides, matF, matB]);
      plankMesh.position.set(plankW / 2 + 0.04, 0, 0);
      plankMesh.castShadow = true;
      arm.add(plankMesh);

      // Sharp 3D Pointed Arrow Tip pointing along +X
      const tipShape = new THREE.Shape();
      tipShape.moveTo(0, -plankH / 2);
      tipShape.lineTo(0.18, 0);
      tipShape.lineTo(0, plankH / 2);
      tipShape.closePath();

      const tipExtrude = new THREE.ExtrudeGeometry(tipShape, { depth: plankD, bevelEnabled: false });
      const tipMesh = new THREE.Mesh(tipExtrude, cel({ color: 0xfde047 }));
      tipMesh.position.set(plankW + 0.04, 0, -plankD / 2);
      tipMesh.castShadow = true;
      arm.add(tipMesh);

      g.add(arm);
    });

    return g;
  };

  ctx.scene.add(makeBirthdayFingerPost());
  registerBench(-4, -4, Math.PI / 4);
  registerBench(4, 4, -3 * Math.PI / 4);
  registerBench(-4, 4, 3 * Math.PI / 4);
  registerBench(4, -4, -Math.PI / 4);
  
  // Stylized Japanese District Guide Kiosk (Replacing raw cyan box)
  const kioskMat = cel({ color: 0x1e293b });
  const kioskScreenMat = flat({ color: 0x38bdf8 });
  const kioskGeo = new THREE.BoxGeometry(0.8, 1.2, 0.35);
  const kioskMesh = new THREE.Mesh(kioskGeo, kioskMat);
  kioskMesh.position.set(0, 0.6, -4);
  ctx.scene.add(kioskMesh);

  const kScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.8), kioskScreenMat);
  kScreen.position.set(0, 0.65, -3.81);
  ctx.scene.add(kScreen);

  ctx.collision.addBox(0, -4, 0.4, 0.25, 0, 1.2, 0, "comm_terminal");
  
  ctx.interaction.register({
    id: "plaza_contact",
    position: new THREE.Vector3(0, 1.0, -3),
    radius: 2.0,
    facingDot: -1.0,
    label: BirthdayThemeConfig.enabled ? "[E] OPEN DISTRICT GUIDE" : "[E] OPEN COMMUNICATIONS",
    onInteract: () => {
      if (BirthdayThemeConfig.enabled) {
        ctx.events.emit('OPEN_DISTRICT_GUIDE');
      } else {
        ctx.events.emit('TERMINAL_ACCESS', { projectId: 'contact' });
      }
    }
  });
  
  

  // ------------------------------------------------------------------
  // 7. Canal Guardrails
  // ------------------------------------------------------------------
  for (let z = -60; z <= 60; z += 4) {
    if (Math.abs(z) > 8) { // Leave gap for the bridge
      ctx.scene.add(makeGuardrail({ x: -15, z: z, ry: Math.PI / 2, segs: 2 }));
      ctx.scene.add(makeGuardrail({ x: -5, z: z, ry: -Math.PI / 2, segs: 2 }));
    }
  }

  // ------------------------------------------------------------------
  // --- HERO SAKURA TREES ---
  // Minimal composition: quality over quantity
  buildSakura(sakuraCtx(ctx), [
    // Central Plaza Hero Tree - prominent, lush, distinct silhouette
    { x: -4, y: 0, z: -6, scale: 1.7, seed: 608, isHero: true, lean: 0.08, leanDir: 0.85 },
    // Home / East Garden
    { x: 10, y: 0, z: 22, scale: 1.35, seed: 903, lean: 0.12, leanDir: 2.1 },
    // Canal West Bank
    { x: -12, y: 0, z: 6, scale: 1.15, seed: 891, lean: 0.14, leanDir: -1.2 },
    // Library Courtyard
    { x: 22, y: 0, z: -4, scale: 1.3, seed: 206, lean: 0.06, leanDir: 1.5 }
  ]);
}