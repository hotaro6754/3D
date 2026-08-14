import * as THREE from 'three';
import { PortfolioContext } from '../core/Context';
import { Rng, makeNoise, bell } from './Synth';

type AudioZone = 'global' | 'techLab' | 'securityLab' | 'station' | 'home' | 'rooftop';

interface ZoneDef {
  id: AudioZone;
  center: THREE.Vector3;
  radius: number;
}

export class AudioSystem {
  ctx: PortfolioContext;
  listener: THREE.AudioListener | null = null;
  audioCtx: AudioContext | null = null;
  rng: Rng;
  
  private tracks: Map<AudioZone, THREE.Audio> = new Map();
  private zones: ZoneDef[] = [
    { id: 'techLab', center: new THREE.Vector3(15, 0, -15), radius: 15 },
    { id: 'securityLab', center: new THREE.Vector3(-23, 0, -15), radius: 15 },
    { id: 'station', center: new THREE.Vector3(-20, 0, 0), radius: 15 },
    { id: 'home', center: new THREE.Vector3(15, 0, 15), radius: 12 },
    { id: 'rooftop', center: new THREE.Vector3(15, 10, -20), radius: 10 }
  ];
  
  private currentZone: AudioZone = 'global';
  private targetVolumes: Map<AudioZone, number> = new Map();
  private currentVolumes: Map<AudioZone, number> = new Map();
  
  private unlocked = false;
  private isDisposed = false;
  
  constructor(ctx: PortfolioContext) {
    this.ctx = ctx;
    this.rng = new Rng(ctx.seed);
  }

  unlock() {
    if (this.unlocked || this.isDisposed) return;
    this.unlocked = true;
    
    this.listener = new THREE.AudioListener();
    this.ctx.camera.add(this.listener);

    this.audioCtx = this.listener.context as AudioContext;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.setupTracks();
  }

  private setupTracks() {
    if (!this.audioCtx || !this.listener) return;

    // Base wind/city noise (global)
    const globalAudio = new THREE.Audio(this.listener);
    globalAudio.setBuffer(makeNoise(this.audioCtx, 4, this.rng, 0.5));
    globalAudio.setLoop(true);
    globalAudio.setVolume(0.05);
    globalAudio.play();
    this.tracks.set('global', globalAudio);
    this.targetVolumes.set('global', 0.05);
    this.currentVolumes.set('global', 0.05);

    // Tech Lab: Server hum (brown noise)
    const techAudio = new THREE.Audio(this.listener);
    techAudio.setBuffer(makeNoise(this.audioCtx, 2, this.rng, 0.9));
    techAudio.setLoop(true);
    techAudio.setVolume(0);
    techAudio.play();
    this.tracks.set('techLab', techAudio);
    this.targetVolumes.set('techLab', 0);
    this.currentVolumes.set('techLab', 0);

    // Security Lab: Lower pitched hum
    const secAudio = new THREE.Audio(this.listener);
    secAudio.setBuffer(makeNoise(this.audioCtx, 2, this.rng, 0.98));
    secAudio.setLoop(true);
    secAudio.setVolume(0);
    secAudio.play();
    this.tracks.set('securityLab', secAudio);
    this.targetVolumes.set('securityLab', 0);
    this.currentVolumes.set('securityLab', 0);

    // Station: Wide pink noise
    const stationAudio = new THREE.Audio(this.listener);
    stationAudio.setBuffer(makeNoise(this.audioCtx, 3, this.rng, 0.6));
    stationAudio.setLoop(true);
    stationAudio.setVolume(0);
    stationAudio.play();
    this.tracks.set('station', stationAudio);
    this.targetVolumes.set('station', 0);
    this.currentVolumes.set('station', 0);

    // Home: Quiet (just lower global volume)
    // We just handle 'home' by adjusting global target volume later.
    this.tracks.set('home', globalAudio);

    // Rooftop: Strong wind (white-ish noise)
    const roofAudio = new THREE.Audio(this.listener);
    roofAudio.setBuffer(makeNoise(this.audioCtx, 5, this.rng, 0.1)); // high cutoff
    roofAudio.setLoop(true);
    roofAudio.setVolume(0);
    roofAudio.play();
    this.tracks.set('rooftop', roofAudio);
    this.targetVolumes.set('rooftop', 0);
    this.currentVolumes.set('rooftop', 0);
  }

  playConfirm() {
    if (!this.unlocked || !this.audioCtx || !this.listener) return;
    bell(this.audioCtx, this.listener.getInput(), {
      t0: this.audioCtx.currentTime,
      freq: 880, // A5
      gain: 0.5,
      decay: 1.0
    });
  }

  update(dt: number) {
    if (!this.unlocked || !this.listener) return;

    const pos = this.ctx.camera.position;
    let newZone: AudioZone = 'global';

    for (const zone of this.zones) {
      if (pos.distanceTo(zone.center) < zone.radius) {
        newZone = zone.id;
        // Priority for rooftop if y > 5
        if (newZone === 'techLab' && pos.y > 5) {
           newZone = 'rooftop';
        }
        break;
      }
    }

    if (newZone !== this.currentZone) {
      this.currentZone = newZone;
      // Reset targets
      for (const [id, _] of this.targetVolumes) {
        this.targetVolumes.set(id, 0);
      }
      
      // Set active targets
      if (newZone === 'global') {
        this.targetVolumes.set('global', 0.05);
      } else if (newZone === 'home') {
        this.targetVolumes.set('global', 0.01); // quieter
      } else {
        this.targetVolumes.set('global', 0.02); // fade global down
        if (newZone === 'techLab') this.targetVolumes.set('techLab', 0.3);
        if (newZone === 'securityLab') this.targetVolumes.set('securityLab', 0.2);
        if (newZone === 'station') this.targetVolumes.set('station', 0.15);
        if (newZone === 'rooftop') this.targetVolumes.set('rooftop', 0.2);
      }
    }

    // Lerp volumes
    for (const [id, track] of this.tracks) {
      // Home shares the global track, don't lerp 'home' separately
      if (id === 'home') continue;

      const target = this.targetVolumes.get(id) || 0;
      let current = this.currentVolumes.get(id) || 0;
      
      if (current !== target) {
        current = THREE.MathUtils.lerp(current, target, dt * 2.0);
        if (Math.abs(current - target) < 0.001) current = target;
        this.currentVolumes.set(id, current);
        track.setVolume(current);
      }
    }
  }

  dispose() {
    this.isDisposed = true;
    for (const [_, track] of this.tracks) {
      if (track.isPlaying) track.stop();
      track.disconnect();
    }
    this.tracks.clear();
    
    if (this.listener && this.ctx.camera) {
      this.ctx.camera.remove(this.listener);
      this.listener = null;
    }
    
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
