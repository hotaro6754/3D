import * as THREE from 'three';
import type { System } from '../core/Engine';
import { PAL } from './palette';

export class PetalSystem implements System {
  readonly name = 'petals';
  private instMesh: THREE.InstancedMesh;
  private count = 2000;
  
  // Instance attributes
  private positions: Float32Array;
  private velocities: Float32Array;
  private phases: Float32Array;
  
  private dummy = new THREE.Object3D();

  constructor(scene: THREE.Scene) {
    const geo = new THREE.PlaneGeometry(0.12, 0.12);
    // Petals are mostly unlit pink/white flakes, use basic material to save performance
    // or a custom shader. We'll use MeshBasicMaterial for now.
    const mat = new THREE.MeshBasicMaterial({ 
      color: PAL.blossomLight, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    
    this.instMesh = new THREE.InstancedMesh(geo, mat, this.count);
    this.instMesh.frustumCulled = false; // Always update all petals
    
    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.phases = new Float32Array(this.count * 3); // rx, ry, rz phases
    
    // Distribute petals around the main areas
    for(let i=0; i<this.count; i++) {
      this.resetPetal(i);
      // Give initial random Y so they aren't all at the top
      this.positions[i*3 + 1] = Math.random() * 15;
    }
    
    scene.add(this.instMesh);
  }

  private resetPetal(i: number) {
    // Spawn mostly near sakura trees or global bounds
    // Center crossing: 0,0. Library: 25,0. Home: 15,20. Tech Lab: 15,-15.
    const x = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 80;
    const y = 8 + Math.random() * 7;
    
    this.positions[i*3] = x;
    this.positions[i*3+1] = y;
    this.positions[i*3+2] = z;
    
    // Wind drift vector + fall
    this.velocities[i*3] = -0.5 - Math.random() * 1.5; // Wind blowing -X
    this.velocities[i*3+1] = -0.4 - Math.random() * 0.8; // Fall
    this.velocities[i*3+2] = (Math.random() - 0.5) * 1.0;
    
    this.phases[i*3] = Math.random() * Math.PI * 2;
    this.phases[i*3+1] = Math.random() * Math.PI * 2;
    this.phases[i*3+2] = Math.random() * Math.PI * 2;
  }

  update(dt: number, elapsed: number): void {
    // Global wind influence
    const windForce = Math.sin(elapsed * 0.5) * 0.5 + 0.5;
    
    for(let i=0; i<this.count; i++) {
      let x = this.positions[i*3];
      let y = this.positions[i*3+1];
      let z = this.positions[i*3+2];
      
      const vx = this.velocities[i*3];
      const vy = this.velocities[i*3+1];
      const vz = this.velocities[i*3+2];
      
      x += (vx * (1.0 + windForce)) * dt;
      y += vy * dt;
      z += vz * dt;
      
      // Swirl wobble
      x += Math.sin(y * 0.8 + elapsed * 2.0 + this.phases[i*3]) * 1.2 * dt;
      z += Math.cos(y * 0.8 + elapsed * 1.5 + this.phases[i*3+2]) * 1.2 * dt;
      
      if (y < 0.1) {
        this.resetPetal(i);
        continue; // reset to top
      }
      
      this.positions[i*3] = x;
      this.positions[i*3+1] = y;
      this.positions[i*3+2] = z;
      
      this.dummy.position.set(x, y, z);
      // More chaotic tumbling
      this.dummy.rotation.set(
        elapsed * 2.2 + this.phases[i*3],
        elapsed * 1.8 + this.phases[i*3+1],
        elapsed * 2.5 + this.phases[i*3+2]
      );
      this.dummy.updateMatrix();
      this.instMesh.setMatrixAt(i, this.dummy.matrix);
    }
    
    this.instMesh.instanceMatrix.needsUpdate = true;
  }
}
