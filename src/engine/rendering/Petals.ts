import * as THREE from 'three';
import type { System } from '../core/Engine';
import { BirthdayThemeConfig } from '../../engine/world/BirthdayThemeConfig';

export class PetalSystem implements System {
  readonly name = 'petals';
  private instMesh: THREE.InstancedMesh;
  private count = BirthdayThemeConfig.enabled ? 1600 : 700;
  
  private positions: Float32Array;
  private velocities: Float32Array;
  private spinSpeeds: Float32Array;
  private phases: Float32Array;
  private scales: Float32Array;
  
  private dummy = new THREE.Object3D();

  constructor(scene: THREE.Scene) {
    // -----------------------------------------------------------------
    // Curved 2D Sakura Petal Geometry
    // Realistic curved silhouette with notched tip and delicate cup curve
    // -----------------------------------------------------------------
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // 0: Stem base
      0.0, -0.045, 0.0,
      // 1: Lower left
      -0.022, -0.018, 0.003,
      // 2: Lower right
      0.022, -0.018, 0.003,
      // 3: Mid left (widest)
      -0.032, 0.018, 0.007,
      // 4: Mid right (widest)
      0.032, 0.018, 0.007,
      // 5: Top left lobe
      -0.015, 0.052, 0.013,
      // 6: Top notch center
      0.0, 0.042, 0.010,
      // 7: Top right lobe
      0.015, 0.052, 0.013
    ]);

    const indices = [
      0, 2, 1, // base triangle
      1, 2, 4, // mid quad 1
      1, 4, 3, // mid quad 2
      3, 4, 6, // upper body
      3, 6, 5, // left lobe
      6, 4, 7  // right lobe
    ];

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshBasicMaterial({ 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      depthWrite: false
    });
    
    this.instMesh = new THREE.InstancedMesh(geo, mat, this.count);
    this.instMesh.frustumCulled = false;
    
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.spinSpeeds = new Float32Array(this.count * 3);
    this.phases = new Float32Array(this.count * 3);
    this.scales = new Float32Array(this.count);

    // Multi-tone soft translucent pink colors (#fbcfe8, #fda4af, #fce7f3)
    const colorA = new THREE.Color(0xfbcfe8); // Soft pastel pink
    const colorB = new THREE.Color(0xfda4af); // Warm rose blush
    const colorC = new THREE.Color(0xfce7f3); // Light airy pastel
    const colorD = new THREE.Color(0xf472b6); // Vivid inner tone
    const tempCol = new THREE.Color();

    for (let i = 0; i < this.count; i++) {
      this.resetPetal(i);
      // Pre-warm vertical positions so petals fill the sky immediately
      this.positions[i * 3 + 1] = 0.2 + Math.random() * 12.0;

      const r = Math.random();
      if (r < 0.55) tempCol.copy(colorA);
      else if (r < 0.82) tempCol.copy(colorB);
      else if (r < 0.94) tempCol.copy(colorC);
      else tempCol.copy(colorD);

      this.instMesh.setColorAt(i, tempCol);
    }
    
    if (this.instMesh.instanceColor) {
      this.instMesh.instanceColor.needsUpdate = true;
    }
    
    scene.add(this.instMesh);
  }

  private resetPetal(i: number) {
    let x = 0, z = 0;
    const r = Math.random();

    // 70% concentrated near the Central Plaza Hero Tree (-4, -6) and Plaza center (0, 0)
    if (r < 0.70) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.6) * 13.0; // Biased toward core
      x = -4.0 + Math.cos(angle) * dist;
      z = -6.0 + Math.sin(angle) * dist;
    } else if (r < 0.82) {
      // Near Home Sakura tree (10, 22)
      x = 10.0 + (Math.random() - 0.5) * 12.0;
      z = 22.0 + (Math.random() - 0.5) * 12.0;
    } else if (r < 0.92) {
      // Near Library Sakura tree (22, -4)
      x = 22.0 + (Math.random() - 0.5) * 12.0;
      z = -4.0 + (Math.random() - 0.5) * 12.0;
    } else {
      // Ambient district drift
      x = (Math.random() - 0.5) * 80.0;
      z = (Math.random() - 0.5) * 80.0;
    }

    // Spawn above canopy
    const y = 6.5 + Math.random() * 7.5;
    
    this.positions[i * 3] = x;
    this.positions[i * 3 + 1] = y;
    this.positions[i * 3 + 2] = z;
    
    // Wind drift & falling velocities
    this.velocities[i * 3] = 0.2 + Math.random() * 0.6; // Gentle eastward drift
    this.velocities[i * 3 + 1] = -(0.35 + Math.random() * 0.45); // Gentle downward glide
    this.velocities[i * 3 + 2] = 0.15 + (Math.random() - 0.5) * 0.4;

    // Flutter spin & rocking speeds
    this.spinSpeeds[i * 3] = (Math.random() - 0.5) * 1.8;
    this.spinSpeeds[i * 3 + 1] = 0.5 + Math.random() * 1.5;
    this.spinSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    
    this.phases[i * 3] = Math.random() * Math.PI * 2;
    this.phases[i * 3 + 1] = Math.random() * Math.PI * 2;
    this.phases[i * 3 + 2] = Math.random() * Math.PI * 2;

    this.scales[i] = 0.8 + Math.random() * 0.45;
  }

  update(dt: number, elapsed: number): void {
    // Clamp delta time to prevent large steps on lag
    const safeDt = Math.min(dt, 0.05);
    const windGust = Math.sin(elapsed * 0.45) * 0.6 + Math.cos(elapsed * 0.2) * 0.35;
    
    for (let i = 0; i < this.count; i++) {
      let x = this.positions[i * 3];
      let y = this.positions[i * 3 + 1];
      let z = this.positions[i * 3 + 2];
      
      const vx = this.velocities[i * 3];
      const vy = this.velocities[i * 3 + 1];
      const vz = this.velocities[i * 3 + 2];
      
      const p1 = this.phases[i * 3];
      const p2 = this.phases[i * 3 + 1];
      const p3 = this.phases[i * 3 + 2];

      const wx = this.spinSpeeds[i * 3];
      const wy = this.spinSpeeds[i * 3 + 1];
      const wz = this.spinSpeeds[i * 3 + 2];

      // Swirling turbulence and horizontal wind sway
      const swirlX = Math.sin(y * 0.9 + elapsed * 1.4 + p1) * 0.65;
      const swirlZ = Math.cos(y * 0.8 + elapsed * 1.1 + p3) * 0.55;
      
      x += (vx * (1.0 + windGust) + swirlX) * safeDt;
      // Fluttering descent speed variation
      y += (vy * (1.0 + Math.sin(elapsed * 2.2 + p2) * 0.2)) * safeDt;
      z += (vz * (1.0 + windGust) + swirlZ) * safeDt;
      
      // Ground reset
      if (y < 0.08) {
        this.resetPetal(i);
        continue;
      }
      
      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;
      
      // Aerodynamic fluttering rotation around multiple axes
      const rotX = Math.sin(elapsed * 2.6 + p1) * 0.75 + elapsed * wx;
      const rotY = elapsed * wy + p2;
      const rotZ = Math.cos(elapsed * 2.1 + p3) * 0.7 + elapsed * wz;
      
      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(rotX, rotY, rotZ);
      
      const s = this.scales[i];
      this.dummy.scale.set(s, s, s);
      
      this.dummy.updateMatrix();
      this.instMesh.setMatrixAt(i, this.dummy.matrix);
    }
    
    this.instMesh.instanceMatrix.needsUpdate = true;
  }
}
