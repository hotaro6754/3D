import * as THREE from 'three';
import { PortfolioContext } from '../core/Context';
import { buildTerrain } from './Terrain';
import { buildBuildings } from './Buildings';
import { buildProps } from './WorldProps';
import { buildWater } from './Water';

export class WorldBuilder {
  root = new THREE.Group();
  private ctx: PortfolioContext;

  constructor(ctx: PortfolioContext) {
    this.ctx = ctx;
    this.root.name = 'WorldRoot';
    // The prompt requested a root Group added to the engine scene.
    // However, ctx.scene is already the world content root.
    // So we add ctx.scene to this.root, and this.root to engine.scene.
    this.root.add(this.ctx.scene);
    this.ctx.engine.scene.add(this.root);
  }

  get collision() {
    return this.ctx.collision;
  }

  get interaction() {
    return this.ctx.interaction;
  }

  build() {
    buildTerrain(this.ctx);
    buildBuildings(this.ctx);
    buildProps(this.ctx);

    // DEFERRED TECHNICAL DEBT:
    // The buildWater() call initializes the procedural water which currently executes 
    // a synchronous noise generation pass (bakeSeabed) using Simplex noise. 
    // This causes a ~150-300ms thread stall during engine boot. 
    // DO NOT rewrite this to a Web Worker yet. The stall is hidden behind the 
    // IntroOverlay and is acceptable for the current milestone. 
    // Migration to async baking is deferred to a future performance milestone.
    buildWater(this.ctx);
  }
}
