import * as THREE from 'three';

/**
 * Collision registry.
 *
 * The town is small and almost entirely axis-aligned, so a broadphase-free
 * list of analytic shapes beats a mesh BVH here: it is exact, allocation-free
 * per frame, and lets each builder declare its own blockers without any shared
 * bake step.
 *
 * All shapes are 2D in the XZ plane with a vertical span, because the player
 * walks on a heightfield and never needs to resolve against sloped ceilings.
 */

export interface ColliderBase {
  /** Vertical span; the player only collides when their capsule overlaps it. */
  minY: number;
  maxY: number;
  /** Debug label, shown by the collider visualiser. */
  tag?: string;
  /** Whether the collider is inactive. */
  disabled?: boolean;
}

export interface BoxCollider extends ColliderBase {
  kind: 'box';
  /** Centre in world XZ. */
  cx: number;
  cz: number;
  /** Half-extents along the box's local axes. */
  hx: number;
  hz: number;
  /** Rotation about Y, radians. */
  rot: number;
}

export interface CircleCollider extends ColliderBase {
  kind: 'circle';
  cx: number;
  cz: number;
  r: number;
}

export type Collider = BoxCollider | CircleCollider;

export interface GroundSampler {
  /** World-space ground height at (x, z). */
  (x: number, z: number): number;
}

export interface FloorCollider {
  cx: number;
  cz: number;
  hx: number;
  hz: number;
  y: number;
}

const _v = new THREE.Vector2();

export class CollisionWorld {
  readonly colliders: Collider[] = [];
  readonly floors: FloorCollider[] = [];

  /** Replaced by the terrain system once its heightfield exists. */
  groundHeight: GroundSampler = () => 0;

  /** Surface material id at a point, used to pick footstep sounds. */
  surfaceAt: (x: number, z: number) => string = () => 'grass';

  addFloor(cx: number, cz: number, hx: number, hz: number, y: number): void {
    this.floors.push({ cx, cz, hx, hz, y });
  }

  addBox(
    cx: number,
    cz: number,
    hx: number,
    hz: number,
    minY: number,
    maxY: number,
    rot = 0,
    tag?: string,
  ): BoxCollider {
    const c: BoxCollider = { kind: 'box', cx, cz, hx, hz, minY, maxY, rot, tag };
    this.colliders.push(c);
    return c;
  }

  addCircle(
    cx: number,
    cz: number,
    r: number,
    minY: number,
    maxY: number,
    tag?: string,
  ): CircleCollider {
    const c: CircleCollider = { kind: 'circle', cx, cz, r, minY, maxY, tag };
    this.colliders.push(c);
    return c;
  }

  /** Wraps an Object3D's world AABB as a box collider. */
  addFromObject(obj: THREE.Object3D, shrink = 0, tag?: string): BoxCollider {
    obj.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return this.addBox(
      center.x,
      center.z,
      Math.max(0.02, size.x / 2 - shrink),
      Math.max(0.02, size.z / 2 - shrink),
      box.min.y,
      box.max.y,
      0,
      tag ?? obj.name,
    );
  }

  clear(): void {
    this.colliders.length = 0;
  }

  /**
   * Resolves a moving circle (the player's capsule footprint) against every
   * collider, returning the corrected position.
   *
   * Two passes: the first resolves the deepest penetrations, the second
   * catches the corner case where pushing out of one collider pushes into
   * another. More passes buy nothing at this scene's density.
   */
  resolve(
    x: number,
    z: number,
    feetY: number,
    headY: number,
    radius: number,
    out: THREE.Vector2,
  ): THREE.Vector2 {
    let px = x;
    let pz = z;

    for (let pass = 0; pass < 2; pass++) {
      let moved = false;
      for (const c of this.colliders) {
        if (c.disabled) continue;
        // Vertical overlap test — lets the player walk over low kerbs and
        // under raised eaves without extra geometry.
        if (headY <= c.minY || feetY >= c.maxY) continue;

        if (c.kind === 'circle') {
          const dx = px - c.cx;
          const dz = pz - c.cz;
          const d2 = dx * dx + dz * dz;
          const rr = c.r + radius;
          if (d2 < rr * rr && d2 > 1e-9) {
            const d = Math.sqrt(d2);
            const push = rr - d;
            px += (dx / d) * push;
            pz += (dz / d) * push;
            moved = true;
          } else if (d2 <= 1e-9) {
            px += rr;
            moved = true;
          }
        } else {
          // Transform into the box's local frame, resolve, transform back.
          const cos = Math.cos(-c.rot);
          const sin = Math.sin(-c.rot);
          const rx = px - c.cx;
          const rz = pz - c.cz;
          const lx = rx * cos - rz * sin;
          const lz = rx * sin + rz * cos;

          const nx = Math.max(-c.hx, Math.min(c.hx, lx));
          const nz = Math.max(-c.hz, Math.min(c.hz, lz));
          const dx = lx - nx;
          const dz = lz - nz;
          const d2 = dx * dx + dz * dz;

          if (d2 > radius * radius) continue;

          let outLx: number;
          let outLz: number;
          if (d2 > 1e-9) {
            // Outside the box, inside the radius: push along the surface normal.
            const d = Math.sqrt(d2);
            outLx = nx + (dx / d) * radius;
            outLz = nz + (dz / d) * radius;
          } else {
            // Centre is inside the box: eject along the shallowest axis.
            const px1 = c.hx - Math.abs(lx);
            const pz1 = c.hz - Math.abs(lz);
            if (px1 < pz1) {
              outLx = Math.sign(lx || 1) * (c.hx + radius);
              outLz = lz;
            } else {
              outLx = lx;
              outLz = Math.sign(lz || 1) * (c.hz + radius);
            }
          }

          const cos2 = Math.cos(c.rot);
          const sin2 = Math.sin(c.rot);
          px = c.cx + (outLx * cos2 - outLz * sin2);
          pz = c.cz + (outLx * sin2 + outLz * cos2);
          moved = true;
        }
      }
      if (!moved) break;
    }

    return out.set(px, pz);
  }

  /** True if a circle at (x,z) spanning [feetY, headY] overlaps anything. */
  overlaps(x: number, z: number, feetY: number, headY: number, radius: number): boolean {
    this.resolve(x, z, feetY, headY, radius, _v);
    return Math.abs(_v.x - x) > 1e-4 || Math.abs(_v.y - z) > 1e-4;
  }

  /** True if a line segment in XZ plane intersects any active collider at the given Y level. */
  lineTest(x0: number, z0: number, x1: number, z1: number, y: number): boolean {
    for (const c of this.colliders) {
      if (c.disabled || y < c.minY || y > c.maxY) continue;

      if (c.kind === 'circle') {
        const dx = x1 - x0;
        const dz = z1 - z0;
        const t = Math.max(0, Math.min(1, ((c.cx - x0) * dx + (c.cz - z0) * dz) / (dx * dx + dz * dz + 1e-9)));
        const px = x0 + t * dx;
        const pz = z0 + t * dz;
        if ((px - c.cx) ** 2 + (pz - c.cz) ** 2 <= c.r ** 2) return true;
      } else {
        // Line-AABB test in local space
        const cos = Math.cos(-c.rot);
        const sin = Math.sin(-c.rot);
        const lx0 = (x0 - c.cx) * cos - (z0 - c.cz) * sin;
        const lz0 = (x0 - c.cx) * sin + (z0 - c.cz) * cos;
        const lx1 = (x1 - c.cx) * cos - (z1 - c.cz) * sin;
        const lz1 = (x1 - c.cx) * sin + (z1 - c.cz) * cos;

        // Cohen-Sutherland-like or simple AABB intersection
        const minX = Math.min(lx0, lx1), maxX = Math.max(lx0, lx1);
        const minZ = Math.min(lz0, lz1), maxZ = Math.max(lz0, lz1);
        
        if (minX > c.hx || maxX < -c.hx || minZ > c.hz || maxZ < -c.hz) continue;
        
        // Detailed cross product check
        const dx = lx1 - lx0;
        const dz = lz1 - lz0;
        if (Math.abs(dx) > 1e-6) {
          const t1 = (-c.hx - lx0) / dx;
          const t2 = (c.hx - lx0) / dx;
          const zAt1 = lz0 + t1 * dz;
          const zAt2 = lz0 + t2 * dz;
          if ((t1 >= 0 && t1 <= 1 && zAt1 >= -c.hz && zAt1 <= c.hz) ||
              (t2 >= 0 && t2 <= 1 && zAt2 >= -c.hz && zAt2 <= c.hz)) return true;
        }
        if (Math.abs(dz) > 1e-6) {
          const t1 = (-c.hz - lz0) / dz;
          const t2 = (c.hz - lz0) / dz;
          const xAt1 = lx0 + t1 * dx;
          const xAt2 = lx0 + t2 * dx;
          if ((t1 >= 0 && t1 <= 1 && xAt1 >= -c.hx && xAt1 <= c.hx) ||
              (t2 >= 0 && t2 <= 1 && xAt2 >= -c.hx && xAt2 <= c.hx)) return true;
        }
        
        // Check if endpoints are inside
        if ((lx0 >= -c.hx && lx0 <= c.hx && lz0 >= -c.hz && lz0 <= c.hz) ||
            (lx1 >= -c.hx && lx1 <= c.hx && lz1 >= -c.hz && lz1 <= c.hz)) return true;
      }
    }
    return false;
  }

  /** Builds a wireframe visualisation of every collider, for debugging. */
  buildDebugMesh(): THREE.Object3D {
    const group = new THREE.Group();
    group.name = 'ColliderDebug';
    const mat = new THREE.MeshBasicMaterial({ color: 0xff3366, wireframe: true, transparent: true, opacity: 0.6 });
    for (const c of this.colliders) {
      const h = Math.max(0.05, c.maxY - c.minY);
      let mesh: THREE.Mesh;
      if (c.kind === 'box') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(c.hx * 2, h, c.hz * 2), mat);
        mesh.rotation.y = c.rot;
      } else {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(c.r, c.r, h, 12), mat);
      }
      mesh.position.set(c.cx, c.minY + h / 2, c.cz);
      group.add(mesh);
    }
    return group;
  }
}
