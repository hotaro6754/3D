import * as THREE from 'three';
import type { LandmarkData } from '../../data/landmarks';
import { PortfolioContext } from '../core/Context';
import { cel, flat } from '../rendering/toon';
import { box } from '../rendering/util';

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
  ctx.collision.addBox(lm.x, lm.z, iw/2, id/2, 0.05, 0.15, 0, lm.id + "_floor");

  // Ceiling
  const ceiling = box(iw, 0.1, id, wallMat, 0, iH, 0);
  g.add(ceiling);

  const frontIsX = lm.face.startsWith('x');
  const fx = frontIsX ? (lm.face === 'x+' ? 1 : -1) : 0;
  const fz = frontIsX ? 0 : (lm.face === 'z+' ? 1 : -1);

  // We will build the walls out of boxes to provide both visuals and collision.
  // Left, Right, Back walls are simple. Front wall has a doorway.
  // Instead of managing complex box placements based on face direction, 
  // we'll build them assuming building faces Z-, then rotate the group to match face.
  // Wait, `makeHouse` doesn't rotate the group; it explicitly uses fx, fz, frontIsX!
  // It builds the house unrotated, but places features based on `fx` and `fz`.
  // So we must do the same.

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
    // Doorway is at Z = doorU, width approx 1.2
    const dW = 1.2;
    // Piece 1 (Z < doorU - dW/2)
    const z1End = doorU - dW/2;
    const z1Start = -hd;
    if (z1End > z1Start) {
      walls.push({ cx: frontX, cz: (z1Start + z1End)/2, bw: th, bd: z1End - z1Start, label: 'front1' });
    }
    // Piece 2 (Z > doorU + dW/2)
    const z2Start = doorU + dW/2;
    const z2End = hd;
    if (z2End > z2Start) {
      walls.push({ cx: frontX, cz: (z2Start + z2End)/2, bw: th, bd: z2End - z2Start, label: 'front2' });
    }
    // Piece 3 (above door)
    // Door height is ~2.05.
  } else {
    // Front and Back are along Z
    const backZ = -fz * (hd - th/2);
    walls.push({ cx: 0, cz: backZ, bw: w, bd: th, label: 'back' });
    
    // Left and Right along X
    walls.push({ cx: (hw - th/2), cz: 0, bw: th, bd: d, label: 'side1' });
    walls.push({ cx: -(hw - th/2), cz: 0, bw: th, bd: d, label: 'side2' });

    // Front wall with doorway
    const frontZ = fz * (hd - th/2);
    const dW = 1.2;
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
  const mScreenDark = flat({ color: 0xff3366 });

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
    iz = lm.z - lm.d/2 + 2.5;
    interactionLabel = "[E] ACCESS PERSONAL TERMINAL";

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

    ix = 0; // Skip generic registration
    iz = 0;

  } else if (lm.id === 'securityLab') {
    // Incident Board (massive screen)
    const boardGeo = new THREE.BoxGeometry(4.0, 2.0, 0.1);
    const boardMesh = new THREE.Mesh(boardGeo, mScreenDark);
    boardMesh.position.set(0, 1.5, -lm.d/2 + 0.2);
    g.add(boardMesh);
    ctx.collision.addBox(lm.x, lm.z - lm.d/2 + 0.2, 2.0, 0.1, 0, 2.0, 0, "board");

    // Operations Desk
    const deskGeo = new THREE.BoxGeometry(2.5, 0.8, 1.2);
    const deskMesh = new THREE.Mesh(deskGeo, mMetalDark);
    deskMesh.position.set(0, 0.4, 0);
    g.add(deskMesh);
    ctx.collision.addBox(lm.x, lm.z, 1.25, 0.6, 0, 0.8, 0, "op_desk");

    // Threat Analysis Terminal
    const termGeo = new THREE.BoxGeometry(1.0, 0.5, 0.2);
    const termMesh = new THREE.Mesh(termGeo, mMetal);
    termMesh.position.set(0, 0.8 + 0.25, 0);
    termMesh.rotation.x = -0.2;
    g.add(termMesh);

    ctx.interaction.register({
      id: 'secLab_board',
      position: new THREE.Vector3(lm.x, 1.0, lm.z - lm.d/2 + 2.0),
      radius: 2.5,
      facingDot: -1.0,
      label: '[E] VIEW CERTIFICATION PATH',
      onInteract: () => ctx.events.emit('TERMINAL_ACCESS', { projectId: 'security:certs' })
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

    ix = 0;
    iz = 0;

  } else if (lm.id === 'library') {
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
      { id: 'skills:systems', name: 'SYSTEMS & TOOLS', x: 0, z: lm.d/2 - 2.5 } // at the reading table
    ];

    skills.forEach(s => {
      ctx.interaction.register({
        id: `lib_${s.id}`,
        position: new THREE.Vector3(lm.x + s.x, 1.0, lm.z + s.z),
        radius: 2.0,
        facingDot: -1.0,
        label: `[E] BROWSE ${s.name}`,
        onInteract: () => ctx.events.emit('TERMINAL_ACCESS', { projectId: s.id })
      });
    });

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
    interactionLabel = "[E] VIEW EXPERIENCE";
  }

  // Register an interior interaction point
  if (ix !== 0 && iz !== 0) {
    ctx.interaction.register({
      id: lm.id + "_interior",
      position: new THREE.Vector3(ix, 1.0, iz),
      radius: 2.5,
      label: interactionLabel,
      onInteract: () => {
        ctx.events.emit('INTERACT_LANDMARK', lm.id);
      }
    });
  }
}
