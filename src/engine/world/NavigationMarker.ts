import * as THREE from 'three';
import { PortfolioContext } from '../core/Context';
import { WORLD_LANDMARKS } from '../../data/landmarks';

export class NavigationMarker {
  readonly name = 'navigation_marker';
  private marker: THREE.Group;
  private innerMesh: THREE.Mesh;
  private time = 0;

  private ctx: PortfolioContext;
  private advancing = false;

  constructor(ctx: PortfolioContext) {
    this.ctx = ctx;
    this.marker = new THREE.Group();
    
    // Create a glowing diamond shape
    const geo = new THREE.OctahedronGeometry(0.5, 0);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    this.innerMesh = new THREE.Mesh(geo, mat);
    this.innerMesh.scale.set(1, 1.5, 1);
    this.marker.add(this.innerMesh);
    
    // Light beam
    const beamGeo = new THREE.CylinderGeometry(0.1, 0.5, 20, 8, 1, true);
    beamGeo.translate(0, 10, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    this.marker.add(beam);

    this.marker.visible = false;
    ctx.scene.add(this.marker);
  }

  setTarget(landmarkId: string | null) {
    if (!landmarkId || !WORLD_LANDMARKS[landmarkId]) {
      this.marker.visible = false;
      return;
    }

    const lm = WORLD_LANDMARKS[landmarkId];
    // Position the marker above the building (or just at Y=3.0 for bridge)
    this.marker.position.set(lm.x, (lm.floors * 2.72) + 3.0, lm.z);
    this.marker.visible = true;
  }

  update(dt: number) {
    if (!this.marker.visible) return;
    this.time += dt;
    
    // Bounce and rotate
    this.innerMesh.rotation.y = this.time * 2.0;
    this.innerMesh.position.y = Math.sin(this.time * 4.0) * 0.5;
    
    // Check proximity to player to advance tour
    if (this.ctx && this.ctx.player && this.ctx.player.state && !this.advancing) {
      const dx = this.marker.position.x - this.ctx.player.state.position.x;
      const dz = this.marker.position.z - this.ctx.player.state.position.z;
      const distSq = dx * dx + dz * dz;
      
      // If within 10 meters, advance tour
      if (distSq < 100) {
        this.advancing = true;
        if (this.ctx.audio) this.ctx.audio.playConfirm();
        window.dispatchEvent(new Event('tour_advance'));
        setTimeout(() => { this.advancing = false; }, 2000);
      }
    }
  }
}
