import * as THREE from 'three';
import { PortfolioContext } from '../core/Context';
import { Rng, makeNoise, bell } from './Synth';
import { BirthdayThemeConfig } from '../world/BirthdayThemeConfig';

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
  
  private birthdayAudioEl: HTMLAudioElement | null = null;
  private isDucked = false;
  private isBenchMode = false;
  private unlocked = false;
  private isDisposed = false;
  private masterVolume = 1.0;
  private pianoInterval: any = null;
  
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

    this.tracks.set('home', globalAudio);

    // Rooftop: Strong wind (white-ish noise)
    const roofAudio = new THREE.Audio(this.listener);
    roofAudio.setBuffer(makeNoise(this.audioCtx, 5, this.rng, 0.1));
    roofAudio.setLoop(true);
    roofAudio.setVolume(0);
    roofAudio.play();
    this.tracks.set('rooftop', roofAudio);
    this.targetVolumes.set('rooftop', 0);
    this.currentVolumes.set('rooftop', 0);

    // Birthday Track (if configured)
    if (BirthdayThemeConfig.enabled && BirthdayThemeConfig.birthdayAudio) {
      try {
        const audio = new Audio(BirthdayThemeConfig.birthdayAudio);
        audio.loop = true;
        audio.volume = 0.15;
        audio.play().then(() => {
          this.birthdayAudioEl = audio;
        }).catch(() => {
          // Gracefully fallback to procedural piano if asset is missing or autoplay restricted
          this.playPianoTrack();
        });
      } catch (e) {
        this.playPianoTrack();
      }
    }
  }

  duckForVideo(duck: boolean) {
    this.isDucked = duck;
    if (this.birthdayAudioEl) {
      if (duck) {
        this.birthdayAudioEl.pause();
      } else {
        this.birthdayAudioEl.play().catch(() => {});
      }
    }
  }

  setBenchMode(active: boolean) {
    this.isBenchMode = active;
  }

  playConfirm() {
    if (!this.unlocked || !this.audioCtx || !this.listener) return;
    bell(this.audioCtx, this.listener.getInput(), {
      t0: this.audioCtx.currentTime,
      freq: 880,
      gain: 0.5,
      decay: 1.0
    });
  }

  setMasterVolume(vol: number) {
    this.masterVolume = vol;
    if (this.listener) {
      this.listener.setMasterVolume(vol);
    }
    if (this.birthdayAudioEl) {
      this.birthdayAudioEl.volume = Math.max(0, Math.min(1, 0.5 * vol));
    }
  }

  playPianoTrack() {
    if (!this.unlocked || !this.audioCtx || !this.listener || this.pianoInterval) return;
    const ctx = this.audioCtx;
    const dest = this.listener.getInput();
    const notes = [
      440.00, // A4
      523.25, // C5
      659.25, // E5
      587.33, // D5
      329.63, // E4
      392.00, // G4
      493.88, // B4
    ];
    let step = 0;
    this.pianoInterval = setInterval(() => {
      if (this.isDucked) return;
      if (Math.random() > 0.3) {
        bell(ctx, dest, {
          t0: ctx.currentTime,
          freq: notes[step % notes.length] * (Math.random() > 0.8 ? 0.5 : 1.0),
          gain: this.isBenchMode ? 0.4 : 0.2,
          decay: 4.0
        });
      }
      step++;
    }, 2000);
  }

  stopPianoTrack() {
    if (this.pianoInterval) {
      clearInterval(this.pianoInterval);
      this.pianoInterval = null;
    }
  }

  update(dt: number) {
    if (!this.unlocked || !this.listener) return;

    if (this.isDucked) {
      for (const [, track] of this.tracks) {
        track.setVolume(0);
      }
      return;
    }

    const pos = this.ctx.camera.position;
    let newZone: AudioZone = 'global';

    for (const zone of this.zones) {
      if (pos.distanceTo(zone.center) < zone.radius) {
        newZone = zone.id;
        if (newZone === 'techLab' && pos.y > 5) {
          newZone = 'rooftop';
        }
        break;
      }
    }

    // Distance to Plaza (0, 0)
    const distToPlaza = Math.hypot(pos.x, pos.z);

    if (newZone !== this.currentZone) {
      this.currentZone = newZone;
      for (const [id, _] of this.targetVolumes) {
        this.targetVolumes.set(id, 0);
      }
      
      if (newZone === 'global') {
        const globalVol = BirthdayThemeConfig.enabled 
          ? (distToPlaza < 10 ? 0.02 : distToPlaza < 25 ? 0.04 : 0.06) 
          : 0.05;
        this.targetVolumes.set('global', globalVol);
      } else if (newZone === 'home') {
        this.targetVolumes.set('global', 0.01);
      } else {
        this.targetVolumes.set('global', 0.02);
        if (newZone === 'techLab') this.targetVolumes.set('techLab', 0.3);
        if (newZone === 'securityLab') this.targetVolumes.set('securityLab', 0.2);
        if (newZone === 'station') this.targetVolumes.set('station', 0.15);
        if (newZone === 'rooftop') this.targetVolumes.set('rooftop', 0.2);
      }
    }

    // Check if player is inside any building interior
    const p = this.ctx.player.state.position;
    const isInsideLibrary = Math.abs(p.x - 25) < 4.8 && Math.abs(p.z - 0) < 5.8 && p.y < 3.0;
    const isInsideSecurityLab = Math.abs(p.x - (-23)) < 5.8 && Math.abs(p.z - (-15)) < 4.8 && p.y < 3.0;
    const isInsideTechLabGround = Math.abs(p.x - 15) < 5.8 && Math.abs(p.z - (-20)) < 4.8 && p.y < 3.0;
    const isInsideBuilding = isInsideLibrary || isInsideSecurityLab || isInsideTechLabGround;

    // Dynamic Birthday music volume modulation
    if (this.birthdayAudioEl && BirthdayThemeConfig.enabled) {
      let targetMusicVol = 0.2;
      if (isInsideBuilding) {
        targetMusicVol = 0.0; // Silence music when inside building interiors
      } else if (this.isBenchMode) {
        targetMusicVol = 0.75;
      } else if (distToPlaza < 10) {
        targetMusicVol = 0.55;
      } else if (distToPlaza < 25) {
        targetMusicVol = 0.35;
      }

      const curVol = this.birthdayAudioEl.volume;
      const nextVol = THREE.MathUtils.lerp(curVol, targetMusicVol * this.masterVolume, dt * (isInsideBuilding ? 3.5 : 1.5));
      this.birthdayAudioEl.volume = Math.max(0, Math.min(1, nextVol));
    }

    // Lerp volumes
    for (const [id, track] of this.tracks) {
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
    this.stopPianoTrack();
    if (this.birthdayAudioEl) {
      this.birthdayAudioEl.pause();
      this.birthdayAudioEl = null;
    }
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
