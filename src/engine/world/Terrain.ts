import * as THREE from 'three';
import { PortfolioContext } from '../core/Context';
import { cel } from '../rendering/toon';
import { PAL } from '../rendering/palette';
import { bake } from '../rendering/util';

// ------------------------------------------------------------------
// Strip builder (Adapted from Sakura Crossing street.js)
// ------------------------------------------------------------------
interface StripOpts {
  z0: number; z1: number; step?: number;
  a: (z: number) => {x: number, y: number};
  b: (z: number) => {x: number, y: number};
  flip?: boolean;
}
function makeStrip({ z0, z1, step = 1.2, a, b, flip = false }: StripOpts) {
  const geo = new THREE.BufferGeometry();
  const pts = Math.ceil(Math.abs(z1 - z0) / step) + 1;
  const dz = (z1 - z0) / (pts - 1);
  const pos = new Float32Array(pts * 2 * 3);
  const uv = new Float32Array(pts * 2 * 2);
  const idx = [];

  for (let i = 0; i < pts; i++) {
    const z = z0 + i * dz;
    const pa = a(z);
    const pb = b(z);
    pos[i * 6 + 0] = pa.x; pos[i * 6 + 1] = pa.y; pos[i * 6 + 2] = z;
    pos[i * 6 + 3] = pb.x; pos[i * 6 + 4] = pb.y; pos[i * 6 + 5] = z;
    
    // Simple UVs for now
    uv[i * 4 + 0] = 0; uv[i * 4 + 1] = i % 2;
    uv[i * 4 + 2] = 1; uv[i * 4 + 3] = i % 2;

    if (i < pts - 1) {
      const base = i * 2;
      if (flip) {
        idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      } else {
        idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
      }
    }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  geo.computeBoundingBox();
  return geo;
}

export function buildTerrain(ctx: PortfolioContext) {
  const roadMat = cel({ color: PAL.road });
  const grassMat = cel({ color: PAL.grass, tint: PAL.blueDeep });

  const Z_MIN = -60;
  const Z_MAX = 60;
  const ROAD_HALF = 5;

  // Analytical ground function
  const groundY = (x: number, _z: number) => {
    // Canal trench at X = -15 to -5
    if (x > -15 && x < -5) return -2;
    return 0;
  };

  // Main NS Road (strip)
  const nsRoadGeo = makeStrip({
    z0: Z_MIN, z1: Z_MAX, step: 2,
    a: (z) => ({ x: -ROAD_HALF, y: groundY(-ROAD_HALF, z) + 0.01 }),
    b: (z) => ({ x: ROAD_HALF, y: groundY(ROAD_HALF, z) + 0.01 }),
  });
  const nsRoad = new THREE.Mesh(nsRoadGeo, roadMat);
  nsRoad.receiveShadow = true;
  ctx.scene.add(nsRoad);

  // EW Crossroad (strip on X axis, we'll just rotate a Z strip)
  const ewRoadGeo = makeStrip({
    z0: -5, z1: 60, step: 2,
    a: (_z) => ({ x: -ROAD_HALF, y: 0.02 }),
    b: (_z) => ({ x: ROAD_HALF, y: 0.02 }),
  });
  ewRoadGeo.rotateY(Math.PI / 2);
  const ewRoad = new THREE.Mesh(ewRoadGeo, roadMat);
  ewRoad.receiveShadow = true;
  ctx.scene.add(ewRoad);

  // Plaza
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(20, 30), roadMat);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(5, 0.025, 0);
  plaza.receiveShadow = true;
  ctx.scene.add(plaza);

  // West side path connecting Bridge to Security Lab
  const westPathGeo = new THREE.PlaneGeometry(6, 26);
  westPathGeo.rotateX(-Math.PI / 2);
  const westPath = new THREE.Mesh(westPathGeo, roadMat);
  westPath.position.set(-18, 0.02, -7);
  westPath.receiveShadow = true;
  ctx.scene.add(westPath);

  // Base grass plane (adapted Pallet Town analytical fallback)
  const grassGeo = new THREE.PlaneGeometry(120, 120, 30, 30);
  grassGeo.rotateX(-Math.PI / 2);
  const pos = grassGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, groundY(x, z));
  }
  grassGeo.computeVertexNormals();
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.receiveShadow = true;
  ctx.scene.add(grass);

  // Canal Bed
  const canalGeo = new THREE.PlaneGeometry(10, 120);
  canalGeo.rotateX(-Math.PI / 2);
  const canalMat = cel({ color: PAL.dirt });
  const canalBed = new THREE.Mesh(canalGeo, canalMat);
  canalBed.position.set(-10, -2, 0);
  canalBed.receiveShadow = true;
  ctx.scene.add(canalBed);

  // Bridge (Detailed Procedural Japanese Pedestrian Bridge)
  const bridgeMat = cel({ color: PAL.concrete });
  const woodMat = cel({ color: PAL.roofBrown });
  const railMat = cel({ color: PAL.redDeep }); // Red railings
  
  const bGeoParts = [];
  const rGeoParts = [];
  const wGeoParts = [];

  // Main Deck
  bGeoParts.push({ geometry: new THREE.BoxGeometry(10, 0.6, 12), matrix: new THREE.Matrix4().makeTranslation(-10, 0, 0) });
  
  // Arch Support under deck
  bGeoParts.push({ geometry: new THREE.BoxGeometry(8, 2.0, 10), matrix: new THREE.Matrix4().makeTranslation(-10, -1.0, 0) });

  // Wooden Planks on deck
  for (let z = -5.5; z <= 5.5; z += 1.0) {
    wGeoParts.push({ geometry: new THREE.BoxGeometry(9.5, 0.2, 0.8), matrix: new THREE.Matrix4().makeTranslation(-10, 0.4, z) });
  }

  // Railings
  for (const sign of [-1, 1]) {
    const rZ = sign * 5.8;
    // Bottom rail
    rGeoParts.push({ geometry: new THREE.BoxGeometry(10, 0.2, 0.2), matrix: new THREE.Matrix4().makeTranslation(-10, 0.6, rZ) });
    // Top rail
    rGeoParts.push({ geometry: new THREE.BoxGeometry(10.5, 0.4, 0.4), matrix: new THREE.Matrix4().makeTranslation(-10, 1.8, rZ) });
    
    // Vertical Posts
    for (const pX of [-4.5, -1.5, 1.5, 4.5]) {
      // Main red post
      rGeoParts.push({ geometry: new THREE.BoxGeometry(0.4, 1.8, 0.4), matrix: new THREE.Matrix4().makeTranslation(-10 + pX, 1.0, rZ) });
      // Metal cap on post
      wGeoParts.push({ geometry: new THREE.BoxGeometry(0.5, 0.2, 0.5), matrix: new THREE.Matrix4().makeTranslation(-10 + pX, 2.0, rZ) });
    }
  }

  const bridgeGroup = new THREE.Group();
  
  const bMesh = new THREE.Mesh(bake(bGeoParts), bridgeMat);
  bMesh.receiveShadow = true; bMesh.castShadow = true;
  bridgeGroup.add(bMesh);

  const wMesh = new THREE.Mesh(bake(wGeoParts), woodMat);
  wMesh.receiveShadow = true; wMesh.castShadow = true;
  bridgeGroup.add(wMesh);

  const rMesh = new THREE.Mesh(bake(rGeoParts), railMat);
  rMesh.receiveShadow = true; rMesh.castShadow = true;
  bridgeGroup.add(rMesh);

  ctx.scene.add(bridgeGroup);

  ctx.collision.groundHeight = (x, z) => {
    // 1. Check physical floors added by builders (e.g. stairs, rooftops)
    let maxFloorY = -Infinity;
    for (const floor of ctx.collision.floors) {
      if (Math.abs(x - floor.cx) <= floor.hx && Math.abs(z - floor.cz) <= floor.hz) {
        if (floor.y > maxFloorY) maxFloorY = floor.y;
      }
    }
    if (maxFloorY > -Infinity) return maxFloorY;

    // 2. Fallback to analytical terrain/bridge
    if (z > -6 && z < 6 && x > -15 && x < -5) return 0.5; // bridge deck height
    return groundY(x, z);
  };
  
  // Block the player from falling into the canal
  // Canal is at X = -15 to -5. Bridge is at Z = -6 to 6.
  
  // Left edge of canal (X = -15)
  // Leaves gap for bridge (Z=-6 to 6) and Security Lab (Z=-19 to -6)
  ctx.collision.addBox(-15, -39.5, 0.5, 20.5, -2, 2, 0, 'Canal Edge L1 A'); // Z=-60 to -19
  ctx.collision.addBox(-15, 33, 0.5, 27, -2, 2, 0, 'Canal Edge L2'); // Z=6 to 60

  // Right edge of canal (X = -5)
  // Leaves gap for bridge (Z=-6 to 6)
  ctx.collision.addBox(-5, -33, 0.5, 27, -2, 2, 0, 'Canal Edge R1'); // Z=-60 to -6
  ctx.collision.addBox(-5, 33, 0.5, 27, -2, 2, 0, 'Canal Edge R2'); // Z=6 to 60

  ctx.collision.surfaceAt = (x, z) => {
    if (Math.abs(x) < 6 || Math.abs(z) < 6) return 'tarmac';
    return 'concrete';
  };

  // Bridge side railings
  ctx.collision.addBox(-10, -6, 5, 0.5, 0, 1.0, 0, 'Bridge Rail N');
  ctx.collision.addBox(-10, 6, 5, 0.5, 0, 1.0, 0, 'Bridge Rail S');
}
