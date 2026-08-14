import * as THREE from 'three';
import { BirthdayThemeConfig } from '../../engine/world/BirthdayThemeConfig';
import type { LandmarkData } from '../../data/landmarks';
import { PortfolioContext } from '../core/Context';
import { cel, flat } from '../rendering/toon';
import { box } from '../rendering/util';
import { makeCat } from './WorldProps';
import { playMeowHappyBirthday } from '../audio/CatSong';

export function buildInterior(ctx: PortfolioContext, lm: LandmarkData, doorU: number) {
  const g = new THREE.Group();
  
  const w = lm.w;
  const d = lm.d;
  const H = lm.floors * 2.72;
  const iw = w - 0.4;
  const id = d - 0.4;
  const iH = H - 0.2;
  
  const wallMat = cel({ color: 0xeae6e0, side: THREE.DoubleSide }); // Warm off-white
  const floorMat = cel({ color: 0x4a4750, side: THREE.DoubleSide }); // Dark carpet/floor

  // Floor
  const floor = box(iw, 0.1, id, floorMat, 0, 0.05, 0);
  floor.receiveShadow = true;
  g.add(floor);
  if (ctx.collision && typeof (ctx.collision as any).addFloor === 'function') {
    (ctx.collision as any).addFloor(lm.x, lm.z, iw/2, id/2, 0.05);
  }

  // Ceiling
  const ceiling = box(iw, 0.1, id, wallMat, 0, iH, 0);
  g.add(ceiling);

  const frontIsX = lm.face.startsWith('x');
  const fx = frontIsX ? (lm.face === 'x+' ? 1 : -1) : 0;
  const fz = frontIsX ? 0 : (lm.face === 'z+' ? 1 : -1);

  const th = 0.2; // wall thickness
  const hw = w / 2;
  const hd = d / 2;
  
  const walls = [];

  if (frontIsX) {
    // Front and Back are along X
    const backX = -fx * (hw - th/2);
    walls.push({ cx: backX, cz: 0, bw: th, bd: d, label: 'back' });
    
    // Left and Right along Z
    walls.push({ cx: 0, cz: (hd - th/2), bw: w, bd: th, label: 'side1' });
    walls.push({ cx: 0, cz: -(hd - th/2), bw: w, bd: th, label: 'side2' });

    // Front wall with doorway
    const frontX = fx * (hw - th/2);
    const dW = 2.0; // Wide 2-meter doorway
    const z1End = doorU - dW/2;
    const z1Start = -hd;
    if (z1End > z1Start) {
      walls.push({ cx: frontX, cz: (z1Start + z1End)/2, bw: th, bd: z1End - z1Start, label: 'front1' });
    }
    const z2Start = doorU + dW/2;
    const z2End = hd;
    if (z2End > z2Start) {
      walls.push({ cx: frontX, cz: (z2Start + z2End)/2, bw: th, bd: z2End - z2Start, label: 'front2' });
    }
  } else {
    // Front and Back are along Z
    const backZ = -fz * (hd - th/2);
    walls.push({ cx: 0, cz: backZ, bw: w, bd: th, label: 'back' });
    
    // Left and Right along X
    walls.push({ cx: (hw - th/2), cz: 0, bw: th, bd: d, label: 'side1' });
    walls.push({ cx: -(hw - th/2), cz: 0, bw: th, bd: d, label: 'side2' });

    // Front wall with doorway
    const frontZ = fz * (hd - th/2);
    const dW = 2.0; // Wide 2-meter doorway
    const x1End = doorU - dW/2;
    const x1Start = -hw;
    if (x1End > x1Start) {
      walls.push({ cx: (x1Start + x1End)/2, cz: frontZ, bw: x1End - x1Start, bd: th, label: 'front1' });
    }
    const x2Start = doorU + dW/2;
    const x2End = hw;
    if (x2End > x2Start) {
      walls.push({ cx: (x2Start + x2End)/2, cz: frontZ, bw: x2End - x2Start, bd: th, label: 'front2' });
    }
  }

  // Add walls to group and collision
  const wallHeight = iH;
  for (const wDef of walls) {
    const wallMesh = box(wDef.bw, wallHeight, wDef.bd, wallMat, wDef.cx, wallHeight/2 + 0.1, wDef.cz);
    g.add(wallMesh);
    ctx.collision.addBox(lm.x + wDef.cx, lm.z + wDef.cz, wDef.bw/2, wDef.bd/2, 0.1, wallHeight, 0, lm.id + "_" + wDef.label);
  }
  
  // Front wall above door
  const frontX = frontIsX ? fx * (hw - th/2) : doorU;
  const frontZ = frontIsX ? doorU : fz * (hd - th/2);
  const aboveDoorHeight = wallHeight - 2.1;
  if (aboveDoorHeight > 0) {
    const bw = frontIsX ? th : 1.2;
    const bd = frontIsX ? 1.2 : th;
    const aboveDoor = box(bw, aboveDoorHeight, bd, wallMat, frontIsX ? frontX : doorU, 2.1 + aboveDoorHeight/2 + 0.1, frontIsX ? doorU : frontZ);
    g.add(aboveDoor);
  }

  // --- Procedural Furniture & Props ---
  buildFurniture(ctx, lm, g);

  // Interior Lighting
  const light = new THREE.PointLight(0xfff0dd, 0.8, 10);
  light.position.set(0, iH - 0.5, 0);
  g.add(light);

  g.position.set(lm.x, 0, lm.z);
  ctx.scene.add(g);
  
  // We don't disable collision yet, that will be handled by door logic in Buildings.ts,
  // but wait, the exterior collider is what stops you.
}

function buildFurniture(ctx: PortfolioContext, lm: LandmarkData, g: THREE.Group) {
  let ix = 0;
  let iz = 0;
  let interactionLabel = "INTERACT";
  
  const mWood = cel({ color: 0x8b5a2b });
  const mWoodLight = cel({ color: 0xdeb887 });
  const mMetal = cel({ color: 0x444444 });
  const mMetalDark = cel({ color: 0x222222 });
  const mScreen = flat({ color: 0x00aaff });

  if (lm.id === 'home') {
    // Bed
    const bedGeo = new THREE.BoxGeometry(1.6, 0.4, 2.0);
    const bedMesh = new THREE.Mesh(bedGeo, cel({ color: 0xaa4444 }));
    bedMesh.position.set(-lm.w/2 + 1.5, 0.2, -lm.d/2 + 1.5);
    g.add(bedMesh);
    ctx.collision.addBox(lm.x - lm.w/2 + 1.5, lm.z - lm.d/2 + 1.5, 0.8, 1.0, 0, 0.4, 0, "bed");

    // Desk
    const deskGeo = new THREE.BoxGeometry(1.8, 0.75, 0.8);
    const deskMesh = new THREE.Mesh(deskGeo, mWood);
    deskMesh.position.set(lm.w/2 - 1.5, 0.375, -lm.d/2 + 1.0);
    g.add(deskMesh);
    ctx.collision.addBox(lm.x + lm.w/2 - 1.5, lm.z - lm.d/2 + 1.0, 0.9, 0.4, 0, 0.75, 0, "desk");

    // Chair
    const chairGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const chairMesh = new THREE.Mesh(chairGeo, mMetal);
    chairMesh.position.set(lm.w/2 - 1.5, 0.25, -lm.d/2 + 1.8);
    g.add(chairMesh);

    // PC Screen
    const screenGeo = new THREE.BoxGeometry(0.7, 0.4, 0.05);
    const screenMesh = new THREE.Mesh(screenGeo, mScreen);
    screenMesh.position.set(lm.w/2 - 1.5, 0.75 + 0.2, -lm.d/2 + 1.0);
    g.add(screenMesh);
    
    // Shelves
    const shelfGeo = new THREE.BoxGeometry(0.8, 2.0, 0.4);
    const shelfMesh = new THREE.Mesh(shelfGeo, mWoodLight);
    shelfMesh.position.set(-lm.w/2 + 1.5, 1.0, lm.d/2 - 1.5);
    g.add(shelfMesh);
    ctx.collision.addBox(lm.x - lm.w/2 + 1.5, lm.z + lm.d/2 - 1.5, 0.4, 0.2, 0, 2.0, 0, "shelf");

    ix = lm.x + lm.w/2 - 1.5;
    ix = lm.x + lm.w/2 - 1.5;
    iz = lm.z - lm.d/2 + 2.5;
    interactionLabel = BirthdayThemeConfig.enabled ? "[E] REST IN QUIET CORNER" : "[E] ACCESS PERSONAL TERMINAL";

  } else if (lm.id === 'techLab') {
    // Server racks
    for(let i=0; i<4; i++) {
      const serverGeo = new THREE.BoxGeometry(0.8, 2.2, 1.0);
      const serverMesh = new THREE.Mesh(serverGeo, mMetal);
      serverMesh.position.set(-lm.w/2 + 1.5 + i*1.2, 1.1, -lm.d/2 + 1.5);
      g.add(serverMesh);
      ctx.collision.addBox(lm.x - lm.w/2 + 1.5 + i*1.2, lm.z - lm.d/2 + 1.5, 0.4, 0.5, 0, 2.2, 0, "server");
      
      // Emissive server lights
      const lightGeo = new THREE.PlaneGeometry(0.6, 1.8);
      const lightMesh = new THREE.Mesh(lightGeo, flat({ color: 0x00e5ff }));
      lightMesh.position.set(-lm.w/2 + 1.5 + i*1.2, 1.1, -lm.d/2 + 2.01);
      g.add(lightMesh);
    }

    if (BirthdayThemeConfig.enabled) {
      // Elevator / stairs access directly to rooftop
      ctx.interaction.register({
        id: 'techLab_rooftop_access',
        position: new THREE.Vector3(lm.x, 1.0, lm.z - lm.d/2 + 2.5),
        radius: 2.5,
        facingDot: -1.0,
        label: '[E] TAKE ELEVATOR TO ROOFTOP',
        onInteract: () => {
          ctx.events.emit('TELEPORT_TO_ROOFTOP');
        }
      });
    } else {
      // Individual Project Terminals
      const projects = [
        { id: 'projects:aegis', name: 'AEGIS', x: -lm.w/2 + 1.5, z: -lm.d/2 + 2.5 },
        { id: 'projects:zeroslop', name: 'ZEROSLOP', x: -lm.w/2 + 2.7, z: -lm.d/2 + 2.5 },
        { id: 'projects:biobloomberg', name: 'BIOBLOOMBERG', x: -lm.w/2 + 3.9, z: -lm.d/2 + 2.5 },
        { id: 'projects:home', name: 'BASE OF OPERATIONS', x: -lm.w/2 + 5.1, z: -lm.d/2 + 2.5 }
      ];

      projects.forEach(p => {
        ctx.interaction.register({
          id: `techLab_${p.id}`,
          position: new THREE.Vector3(lm.x + p.x, 1.0, lm.z + p.z),
          radius: 2.0,
          facingDot: -1.0,
          label: `[E] OPEN ${p.name}`,
          onInteract: () => {
            ctx.events.emit('TERMINAL_ACCESS', { projectId: p.id });
          }
        });
      });
    }

    ix = 0; // Skip generic registration
    iz = 0;

  } else if (lm.id === 'securityLab') {
    // Incident Board (gentle persona aura diagnostic screen)
    const boardGeo = new THREE.BoxGeometry(4.8, 2.4, 0.1);
    const cvRed = document.createElement('canvas');
    cvRed.width = 512; cvRed.height = 256;
    const cRed = cvRed.getContext('2d')!;
    cRed.fillStyle = '#070d18'; cRed.fillRect(0, 0, 512, 256);
    cRed.strokeStyle = '#38bdf8'; cRed.lineWidth = 4;
    cRed.strokeRect(8, 8, 496, 240);
    cRed.fillStyle = '#38bdf8';
    cRed.font = '900 26px "Segoe UI", sans-serif';
    cRed.fillText('✦ AURA & ESSENCE DIAGNOSTIC ✦', 30, 60);
    cRed.font = '700 20px monospace';
    cRed.fillStyle = '#fbcfe8';
    cRed.fillText('TARGET: SAHITHI 🌸', 30, 110);
    cRed.fillStyle = '#93c5fd';
    cRed.fillText('STATUS: 100% PERFECT HARMONY', 30, 150);
    cRed.fillStyle = '#fed7aa';
    cRed.fillText('PRESS [E] TO INITIATE GENTLE SCAN', 30, 200);

    const redTex = new THREE.CanvasTexture(cvRed);
    const mRedScreen = new THREE.MeshBasicMaterial({ map: redTex });
    const boardMesh = new THREE.Mesh(boardGeo, mRedScreen);
    boardMesh.position.set(0, 1.6, -lm.d/2 + 0.2);
    g.add(boardMesh);
    ctx.collision.addBox(lm.x, lm.z - lm.d/2 + 0.2, 2.4, 0.1, 0, 2.4, 0, "board");

    // Calm ambient electric blue and soft magenta glow
    const blueLight = new THREE.PointLight(0x38bdf8, 2.6, 9);
    blueLight.position.set(0, 2.2, -lm.d/2 + 1.2);
    g.add(blueLight);
    const pinkAccent = new THREE.PointLight(0xf472b6, 1.8, 7);
    pinkAccent.position.set(0, 1.5, 0);
    g.add(pinkAccent);

    // Operations Desk
    const deskGeo = new THREE.BoxGeometry(2.5, 0.8, 1.2);
    const deskMesh = new THREE.Mesh(deskGeo, mMetalDark);
    deskMesh.position.set(0, 0.4, 0);
    g.add(deskMesh);
    ctx.collision.addBox(lm.x, lm.z, 1.25, 0.6, 0, 0.8, 0, "op_desk");

    // Threat Analysis Terminal on desk
    const termGeo = new THREE.BoxGeometry(1.0, 0.5, 0.2);
    const termMesh = new THREE.Mesh(termGeo, mMetal);
    termMesh.position.set(0, 0.8 + 0.25, 0);
    termMesh.rotation.x = -0.2;
    g.add(termMesh);

    if (BirthdayThemeConfig.enabled) {
      ctx.interaction.register({
        id: 'secLab_threat_screen',
        position: new THREE.Vector3(lm.x, 1.2, lm.z - lm.d/2 + 2.0),
        radius: 3.0,
        facingDot: -1.0,
        label: '[E] SCAN AURA & ESSENCE ✦',
        onInteract: () => {
          ctx.events.emit('OPEN_PERSONA3_THREAT');
        }
      });
    } else {
      ctx.interaction.register({
        id: 'secLab_board',
        position: new THREE.Vector3(lm.x, 1.0, lm.z - lm.d/2 + 2.0),
        radius: 2.5,
        facingDot: -1.0,
        label: '[E] VIEW CERTIFICATION PATH',
        onInteract: () => {
          ctx.events.emit('TERMINAL_ACCESS', { projectId: 'security:certs' });
        }
      });
      ctx.interaction.register({
        id: 'secLab_desk',
        position: new THREE.Vector3(lm.x - 1.5, 1.0, lm.z + 0.5),
        radius: 2.0,
        facingDot: -1.0,
        label: '[E] VIEW SECURITY PROJECTS',
        onInteract: () => ctx.events.emit('TERMINAL_ACCESS', { projectId: 'security:projects' })
      });

      ctx.interaction.register({
        id: 'secLab_term',
        position: new THREE.Vector3(lm.x + 1.5, 1.0, lm.z + 0.5),
        radius: 2.0,
        facingDot: -1.0,
        label: '[E] ACCESS SECURITY PROFILE',
        onInteract: () => ctx.events.emit('TERMINAL_ACCESS', { projectId: 'security:profile' })
      });
    }

    ix = 0;
    iz = 0;

  } else if (lm.id === 'library') {
    if (!BirthdayThemeConfig.enabled) {
      // Bookshelves (Rows)
      for (let x = -lm.w/2 + 2.0; x < lm.w/2 - 2.0; x += 3.0) {
        for (let z = -lm.d/2 + 2.0; z < lm.d/2 - 3.0; z += 3.0) {
          const shelfGeo = new THREE.BoxGeometry(0.6, 2.4, 2.2);
          const shelfMesh = new THREE.Mesh(shelfGeo, mWood);
          shelfMesh.position.set(x, 1.2, z);
          g.add(shelfMesh);
          ctx.collision.addBox(lm.x + x, lm.z + z, 0.3, 1.1, 0, 2.4, 0, "bookshelf");
        }
      }
      // Reading/Study Table
      const deskGeo = new THREE.BoxGeometry(3.5, 0.75, 1.5);
      const deskMesh = new THREE.Mesh(deskGeo, mWoodLight);
      deskMesh.position.set(0, 0.375, lm.d/2 - 2.5);
      g.add(deskMesh);
      ctx.collision.addBox(lm.x, lm.z + lm.d/2 - 2.5, 1.75, 0.75, 0, 0.75, 0, "reading_table");
      
      // Chairs
      for(let i=-1; i<=1; i+=2) {
        const chairGeo = new THREE.BoxGeometry(0.5, 0.4, 0.5);
        const chairMesh = new THREE.Mesh(chairGeo, cel({ color: 0x777777 }));
        chairMesh.position.set(i*1.0, 0.2, lm.d/2 - 1.5);
        g.add(chairMesh);
      }

      const skills = [
        { id: 'skills:programming', name: 'PROGRAMMING', x: -lm.w/2 + 2.0, z: -lm.d/2 + 3.0 },
        { id: 'skills:web', name: 'WEB / FULL STACK', x: -lm.w/2 + 5.0, z: -lm.d/2 + 3.0 },
        { id: 'skills:ai', name: 'AI / ML', x: -lm.w/2 + 8.0, z: -lm.d/2 + 3.0 },
        { id: 'skills:cyber', name: 'CYBERSECURITY', x: -lm.w/2 + 11.0, z: -lm.d/2 + 3.0 },
        { id: 'skills:systems', name: 'SYSTEMS & TOOLS', x: 0, z: lm.d/2 - 2.5 }
      ];

      skills.forEach(s => {
        ctx.interaction.register({
          id: `lib_${s.id}`,
          position: new THREE.Vector3(lm.x + s.x, 1.0, lm.z + s.z),
          radius: 2.0,
          facingDot: -1.0,
          label: `[E] BROWSE ${s.name}`,
          onInteract: () => {
            ctx.events.emit('TERMINAL_ACCESS', { projectId: s.id });
          }
        });
      });
    } else {
      // ------------------------------------------------------------------
      // Magical Cat Sanctuary in Quiet Hours (Sahithi's Cat Haven!)
      // ------------------------------------------------------------------
      // Back Perimeter Bookshelves (unobstructed central floor)
      for (let x = -lm.w/2 + 2.0; x < lm.w/2 - 2.0; x += 2.8) {
        const shelfGeo = new THREE.BoxGeometry(2.4, 2.4, 0.6);
        const shelfMesh = new THREE.Mesh(shelfGeo, mWood);
        shelfMesh.position.set(x, 1.2, -lm.d/2 + 0.8);
        g.add(shelfMesh);
        ctx.collision.addBox(lm.x + x, lm.z - lm.d/2 + 0.8, 1.2, 0.3, 0, 2.4, 0, "bookshelf_back");
      }

      // Warm Ambient Fairy Lanterns & Ceiling Glow
      const fairyLight1 = new THREE.PointLight(0xfef08a, 2.4, 10);
      fairyLight1.position.set(-2.5, 2.2, 0);
      g.add(fairyLight1);
      const fairyLight2 = new THREE.PointLight(0xfbcfe8, 2.4, 10);
      fairyLight2.position.set(2.5, 2.2, 0);
      g.add(fairyLight2);
      const fairyLight3 = new THREE.PointLight(0xfdba74, 2.2, 8);
      fairyLight3.position.set(0, 2.2, 2.2);
      g.add(fairyLight3);
      const fairyLight4 = new THREE.PointLight(0xffedd5, 2.2, 8);
      fairyLight4.position.set(0, 2.2, -2.2);
      g.add(fairyLight4);

      // Cozy Large Soft Rug in room center
      const rugGeo = new THREE.PlaneGeometry(6.5, 5.5);
      const rugMat = flat({ color: 0xfce7f3 });
      const rugMesh = new THREE.Mesh(rugGeo, rugMat);
      rugMesh.rotation.x = -Math.PI / 2;
      rugMesh.position.set(0, 0.105, 0);
      g.add(rugMesh);

      // Central Birthday Pedestal
      const pedGeo = new THREE.CylinderGeometry(0.75, 0.80, 0.35, 24);
      const pedMat = cel({ color: 0xfdba74 });
      const pedMesh = new THREE.Mesh(pedGeo, pedMat);
      pedMesh.position.set(0, 0.275, 0);
      g.add(pedMesh);

      // Open Birthday Book on center pedestal
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 128;
      // -------------------------------------------------------------
      // 3D Layered Birthday Cake on Central Pedestal
      // -------------------------------------------------------------
      // Golden Serving Plate
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.04, 24), cel({ color: 0xfef08a }));
      plate.position.set(0, 0.46, 0);
      g.add(plate);

      // Bottom Cake Tier (Peach & Vanilla Sponge)
      const cakeBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.50, 0.22, 24), cel({ color: 0xfed7aa }));
      cakeBottom.position.set(0, 0.58, 0);
      g.add(cakeBottom);

      // Top Cake Tier (Strawberry Blossom Cream)
      const cakeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.18, 24), cel({ color: 0xfbcfe8 }));
      cakeTop.position.set(0, 0.77, 0);
      g.add(cakeTop);

      // Strawberries on top
      for (let s = 0; s < 5; s++) {
        const sAng = (s / 5) * Math.PI * 2;
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), flat({ color: 0xf43f5e }));
        berry.position.set(Math.cos(sAng) * 0.22, 0.88, Math.sin(sAng) * 0.22);
        g.add(berry);
      }

      // Lit Birthday Candles with warm glowing flame particles
      for (let c = 0; c < 5; c++) {
        const cAng = (c / 5) * Math.PI * 2 + 0.3;
        const candleStick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8), flat({ color: 0xf472b6 }));
        candleStick.position.set(Math.cos(cAng) * 0.14, 0.92, Math.sin(cAng) * 0.14);
        g.add(candleStick);

        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        flame.position.set(Math.cos(cAng) * 0.14, 0.99, Math.sin(cAng) * 0.14);
        g.add(flame);
      }

      // Warm candle light glow
      const cakeCandleGlow = new THREE.PointLight(0xf59e0b, 1.8, 4);
      cakeCandleGlow.position.set(0, 1.05, 0);
      g.add(cakeCandleGlow);

      // 8 Plush Velvet Cushions & Cats in an orderly 2.0m circle around the cake
      const catDefs = [
        { name: 'GINGER', quote: 'Purrr~ Happy Birthday Sahithi! 🌸', color: 0xf59e0b, darkColor: 0xb45309, cushionColor: 0xfde68a },
        { name: 'SNOWBALL', quote: 'Meow! You are truly one of a kind! ✨', color: 0xffffff, darkColor: 0xe2e8f0, cushionColor: 0xfbcfe8 },
        { name: 'CALICO', quote: 'Nyaa~ Wishing you endless smiles & happiness! 💖', color: 0xfb923c, darkColor: 0x9a3412, cushionColor: 0xfdba74 },
        { name: 'TUXEDO', quote: 'Meow~ Someone really wanted to make this day special for you! 🎀', color: 0x1e293b, darkColor: 0xffffff, cushionColor: 0x93c5fd },
        { name: 'TABBY', quote: 'Meow! You shine brighter than the stars! ⭐', color: 0xd97706, darkColor: 0x78350f, cushionColor: 0xfde68a },
        { name: 'KITTEN', quote: '*soft purr* Happy Birthday to someone truly amazing! 🐱', color: 0xf472b6, darkColor: 0x9d174d, cushionColor: 0xfce7f3 },
        { name: 'SIAMESE', quote: 'Purrr~ Welcome to your Birthday Sanctuary! 🌸', color: 0xe2e8f0, darkColor: 0x475569, cushionColor: 0xa7f3d0 },
        { name: 'SHADOW', quote: 'Purrrrr... Hope this brings a warm smile to your face! 🌟', color: 0x0f172a, darkColor: 0x334155, cushionColor: 0xc4b5fd }
      ];

      const circleRadius = 2.0;
      catDefs.forEach((cat, idx) => {
        const ang = (idx / 8) * Math.PI * 2;
        const cx = Math.cos(ang) * circleRadius;
        const cz = Math.sin(ang) * circleRadius;
        // Face inward toward cake at (0, 0)
        const cry = Math.atan2(-cx, -cz);

        // Plush velvet cushion under each cat
        const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.50, 0.12, 16), flat({ color: cat.cushionColor }));
        pil.position.set(cx, 0.16, cz);
        g.add(pil);

        // Cat perched comfortably on cushion
        const catMesh = makeCat({ x: cx, y: 0.22, z: cz, ry: cry, color: cat.color, darkColor: cat.darkColor });
        g.add(catMesh);

        // Individual Cat Interaction (Tight radius to prevent overlapping with cake)
        ctx.interaction.register({
          id: `lib_cat_${idx}`,
          position: new THREE.Vector3(lm.x + cx, 0.8, lm.z + cz),
          radius: 1.1,
          facingDot: -1.0,
          label: `[E] ${cat.name}: "${cat.quote}" 🐱 (SINGS FOR SAHITHI!)`,
          onInteract: () => {
            playMeowHappyBirthday();
          }
        });
      });

      // Interactive Birthday Cake Cutting & Cat Feast (Central celebration trigger)
      ctx.interaction.register({
        id: 'lib_birthday_cake',
        position: new THREE.Vector3(lm.x, 1.0, lm.z),
        radius: 2.2,
        facingDot: -1.0,
        label: "[E] CUT BIRTHDAY CAKE & FEED CATS 🎂 (CELEBRATION)",
        onInteract: () => {
          ctx.events.emit('OPEN_CAKE_CUTTING');
        }
      });
    }

    ix = 0;
    iz = 0;

  } else if (lm.id === 'station') {
    // Timetable / Signage
    const signGeo = new THREE.BoxGeometry(3.0, 0.8, 0.1);
    const signMesh = new THREE.Mesh(signGeo, flat({ color: 0xf0b000 }));
    signMesh.position.set(0, 2.0, -lm.d/2 + 0.2);
    g.add(signMesh);

    // Waiting Benches
    for (let i = -1; i <= 1; i += 2) {
      const benchGeo = new THREE.BoxGeometry(2.5, 0.5, 0.8);
      const benchMesh = new THREE.Mesh(benchGeo, mMetalDark);
      benchMesh.position.set(i * 4.0, 0.25, -lm.d/2 + 2.0);
      g.add(benchMesh);
      ctx.collision.addBox(lm.x + i * 4.0, lm.z - lm.d/2 + 2.0, 1.25, 0.4, 0, 0.5, 0, "waiting_bench");
    }
    
    // Ticket Counters / Vending
    for (let i = 0; i < 2; i++) {
      const ticketGeo = new THREE.BoxGeometry(1.2, 1.8, 0.8);
      const ticketMesh = new THREE.Mesh(ticketGeo, mMetal);
      ticketMesh.position.set(lm.w/2 - 2.0, 0.9, lm.d/2 - 3.0 + i*1.5);
      g.add(ticketMesh);
      ctx.collision.addBox(lm.x + lm.w/2 - 2.0, lm.z + lm.d/2 - 3.0 + i*1.5, 0.6, 0.4, 0, 1.8, 0, "ticket_machine");
    }
    
    ix = lm.x + lm.w/2 - 2.0 - 1.5;
    iz = lm.z + lm.d/2 - 2.25;
    interactionLabel = BirthdayThemeConfig.enabled ? "[E] NEXT DEPARTURE: WHEREVER YOU WANT TO GO." : "[E] VIEW EXPERIENCE";
  }

  // Register an interior interaction point
  if (ix !== 0 && iz !== 0) {
    ctx.interaction.register({
      id: lm.id + "_interior",
      position: new THREE.Vector3(ix, 1.0, iz),
      radius: 2.5,
      label: interactionLabel,
      onInteract: () => {
        if (BirthdayThemeConfig.enabled && lm.id === 'station') return;
        ctx.events.emit('INTERACT_LANDMARK', lm.id);
      }
    });
  }
}
