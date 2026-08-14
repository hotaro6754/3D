import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number): number => (v - a) / (b - a);
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

/** Hermite smoothstep that tolerates a > b (descending ranges). */
export function sstep(a: number, b: number, v: number): number {
  const t = clamp((v - a) / (b - a || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Deterministic PRNG so the street looks identical on every load. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface RngKit {
  next: () => number;
  range: (a: number, b: number) => number;
  int: (a: number, b: number) => number;
  pick: <T>(arr: T[]) => T;
  chance: (p: number) => boolean;
  sign: () => number;
}

/** Small helper bundle around a seeded PRNG. */
export function rngKit(seed: number): RngKit {
  const r = mulberry32(seed);
  return {
    next: r,
    range: (a: number, b: number) => a + (b - a) * r(),
    int: (a: number, b: number) => Math.floor(a + (b - a + 1) * r()),
    pick: <T>(arr: T[]) => arr[Math.floor(r() * arr.length) % arr.length],
    chance: (p: number) => r() < p,
    sign: () => (r() < 0.5 ? -1 : 1),
  };
}

export interface BakePart {
  geometry: THREE.BufferGeometry;
  matrix?: THREE.Matrix4;
}

/**
 * Merge a list of {geometry, matrix} into one buffer geometry (single draw
 * call).  ExtrudeGeometry is non-indexed while the primitives are indexed, so
 * a mixed batch gets flattened to non-indexed before merging.
 */
export function bake(parts: BakePart[]): THREE.BufferGeometry {
  if (parts.length === 0) return new THREE.BufferGeometry();
  let geos = parts.map(({ geometry, matrix }) => {
    const g = geometry.clone();
    if (matrix) g.applyMatrix4(matrix);
    return g;
  });
  const indexed = geos.filter((g) => g.index).length;
  if (indexed > 0 && indexed < geos.length) {
    geos = geos.map((g) => {
      if (!g.index) return g;
      const flat = g.toNonIndexed();
      g.dispose();
      return flat;
    });
  }
  // keep only the attributes every geometry shares, or the merge rejects them
  const common = geos.reduce(
    (acc, g) => acc.filter((name) => g.attributes[name] !== undefined),
    Object.keys(geos[0].attributes)
  );
  for (const g of geos) {
    for (const name of Object.keys(g.attributes)) {
      if (!common.includes(name)) g.deleteAttribute(name);
    }
  }
  const merged = mergeGeometries(geos, false);
  if (merged) {
    merged.computeBoundingSphere();
    merged.computeBoundingBox();
  }
  geos.forEach((g) => g.dispose());
  return merged;
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();

/** Compose a matrix from loose position/euler/scale args. */
export function trs(px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1): THREE.Matrix4 {
  _v.set(px, py, pz);
  _e.set(rx, ry, rz);
  _q.setFromEuler(_e);
  _s.set(sx, sy, sz);
  return _m.clone().compose(_v, _q, _s);
}

/** A box mesh whose local origin sits at the centre of its base. */
export function boxOnGround(w: number, h: number, d: number, mat: THREE.Material): THREE.Mesh {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0);
  return new THREE.Mesh(g, mat);
}

export function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

export function cyl(rt: number, rb: number, h: number, seg: number, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  return m;
}

export function plane(w: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  return m;
}

/**
 * Recursively enable shadow casting/receiving on a subtree.
 *
 * Transparent meshes are skipped: glass, highlight quads and netting are there
 * to be seen through, and letting them cast would drop a hard shadow over
 * whatever they are covering (a glazed vending machine display goes muddy).
 */
export function shadowify<T extends THREE.Object3D>(obj: T, cast = true, receive = true): T {
  obj.traverse((o: THREE.Object3D) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const seeThrough = mesh.userData.noShadow ||
      (mesh.material && !Array.isArray(mesh.material) && mesh.material.transparent);
    mesh.castShadow = cast && !seeThrough;
    mesh.receiveShadow = receive;
  });
  return obj;
}

/** A catenary-ish sagging curve between two points. */
export function sagCurve(a: THREE.Vector3, b: THREE.Vector3, sag: number, segments = 14): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = new THREE.Vector3().lerpVectors(a, b, t);
    p.y -= Math.sin(Math.PI * t) * sag;
    pts.push(p);
  }
  return new THREE.CatmullRomCurve3(pts);
}
