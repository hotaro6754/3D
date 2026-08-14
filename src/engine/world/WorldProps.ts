import * as THREE from 'three';
import { PortfolioContext } from '../core/Context';
import { makeSignPost, makePole, makeVendBin, makeBench, makeGuideBoard, makeBicycle, makePostBox } from './Props';
import { makeGuardrail } from './Props';
import { buildSakura } from './Vegetation';
import { trailSign } from '../rendering/textures';
import { bake, trs } from '../rendering/util';
import { cel, flat } from '../rendering/toon';
import { PAL } from '../rendering/palette';

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
      radius: 3.0,
      label: 'Sit',
      onInteract: () => {
        ctx.events.emit('INTERACT_BENCH', { x, y: 1.0, z });
      }
    });
  };
  registerBench(techLabPos.x + 8.5, techLabPos.z + 1.2, -Math.PI / 2);
  registerBench(techLabPos.x + 8.5, techLabPos.z - 2.8, -Math.PI / 2);

  // ------------------------------------------------------------------
  // Signpost removed - only keeping the one at (0, 0)
  // ------------------------------------------------------------------
  // 2. Library Props
  // ------------------------------------------------------------------
  // Procedural Metal Stairs to Tech Lab Roof
  const stairParts = [];
  const stairMat = cel({ color: PAL.roadDark });
  const sx = 12, sz = -21;
  const steps = 30;
  const heightPerStep = 5.6 / steps;
  for(let i = 0; i < steps; i++) {
    const flight = Math.floor(i / 10);
    const localStep = i % 10;
    
    let px = sx, pz = sz, pw = 2, pd = 0.8;
    if (flight === 0) { px = sx - 3 + (localStep * 0.4); pz = sz; pw = 0.6; pd = 2.0; }
    else if (flight === 1) { px = sx + 1; pz = sz - 1.2 + (localStep * 0.4); pw = 2.0; pd = 0.6; }
    else { px = sx + 1 - (localStep * 0.4); pz = sz + 2.4; pw = 0.6; pd = 2.0; }
    
    stairParts.push({ geometry: new THREE.BoxGeometry(pw, heightPerStep, pd), matrix: trs(px, i * heightPerStep, pz) });
    if (ctx.collision && typeof (ctx.collision as any).addFloor === 'function') {
      (ctx.collision as any).addFloor(px, pz, pw/2, pd/2, (i+1)*heightPerStep);
    }
  }
  const stairMesh = new THREE.Mesh(bake(stairParts), stairMat);
  stairMesh.receiveShadow = true; stairMesh.castShadow = true;
  ctx.scene.add(stairMesh);
  
  // Tech Lab Rooftop Viewpoint
  const roofY = 5.44;
  registerBench(techLabPos.x, techLabPos.z - 2, Math.PI / 2);
  // Re-register with the correct Y since registerBench forces y=1.0 for ground benches
  // Wait, I should manually register the roof bench because registerBench sets Y to 1.0.
  ctx.scene.add(makeBench({ x: techLabPos.x, z: techLabPos.z + 1, y: roofY, ry: -Math.PI / 2 }));
  ctx.interaction.register({
    id: `bench_techlab_roof`,
    position: new THREE.Vector3(techLabPos.x, roofY + 1.0, techLabPos.z + 1),
    radius: 3.0,
    label: '[E] SIT & ENJOY THE VIEW',
    onInteract: () => {
      ctx.events.emit('INTERACT_BENCH', { x: techLabPos.x, y: roofY, z: techLabPos.z + 1 });
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
  // 6. Central Landmark
  // A directional pole guiding the player.
  ctx.scene.add(makeSignPost({ 
    x: 0, 
    z: 0, 
    plates: [
      // HOME (15, 20)
      { map: trailSign(0), double: true, w: 1.0, h: 0.25, y: 1.8, ry: Math.atan2(15, 20) },
      // TECH LAB (15, -15)
      { map: trailSign(1), double: true, w: 1.0, h: 0.25, y: 1.5, ry: Math.atan2(15, -15) },
      // SECURITY LAB (-23, -15)
      { map: trailSign(2), double: true, w: 1.0, h: 0.25, y: 1.2, ry: Math.atan2(-23, -15) },
      // STATION (-20, 0)
      { map: trailSign(3), double: true, w: 1.0, h: 0.25, y: 0.9, ry: Math.atan2(-20, 0) },
      // LIBRARY (25, 0)
      { map: trailSign(4), double: true, w: 1.0, h: 0.25, y: 0.6, ry: Math.atan2(25, 0) }
    ]
  }));
  registerBench(-4, -4, Math.PI / 4);
  registerBench(4, 4, -3 * Math.PI / 4);
  registerBench(-4, 4, 3 * Math.PI / 4);
  registerBench(4, -4, -Math.PI / 4);
  
  // Communications Terminal
  const termGeo = new THREE.BoxGeometry(0.8, 1.2, 0.6);
  const termMesh = new THREE.Mesh(termGeo, flat({ color: 0x00e5ff }));
  termMesh.position.set(0, 0.6, -4);
  ctx.scene.add(termMesh);
  ctx.collision.addBox(0, -4, 0.4, 0.3, 0, 1.2, 0, "comm_terminal");
  
  ctx.interaction.register({
    id: "plaza_contact",
    position: new THREE.Vector3(0, 1.0, -3),
    radius: 2.0,
    facingDot: -1.0,
    label: "[E] OPEN COMMUNICATIONS",
    onInteract: () => {
      ctx.events.emit('TERMINAL_ACCESS', { projectId: 'contact' });
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
    // Home / Central Area
    { x: 10, y: 0, z: 22, scale: 1.5, seed: 903 },
    // Canal / Bridge Area
    { x: -4, y: 0, z: -6, scale: 1.2, seed: 608 },
    { x: -12, y: 0, z: 6, scale: 1.1, seed: 891 },
    // Library
    { x: 22, y: 0, z: -4, scale: 1.3, seed: 206 }
  ]);
}