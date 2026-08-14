import * as THREE from 'three';
import { PAL } from '../rendering/palette';
import { flat } from '../rendering/toon';
// Assume cloudTex exists or we can mock a simple canvas texture
import { rngKit } from '../rendering/util';
import { BirthdayThemeConfig } from '../../engine/world/BirthdayThemeConfig';

function cloudTex(): THREE.Texture {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 256;
  const c = cv.getContext('2d')!;

  const drawPuff = (cx: number, cy: number, rx: number, ry: number, alpha: number) => {
    const grad = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(0.5, `rgba(240, 248, 255, ${alpha * 0.75})`);
    grad.addColorStop(0.8, `rgba(224, 242, 254, ${alpha * 0.3})`);
    grad.addColorStop(1, 'rgba(224, 242, 254, 0)');
    c.fillStyle = grad;
    c.beginPath();
    c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
  };

  // Base layered painterly cloud cluster
  drawPuff(256, 140, 160, 60, 0.9);
  drawPuff(180, 150, 110, 50, 0.85);
  drawPuff(330, 145, 120, 55, 0.85);
  drawPuff(220, 110, 90, 50, 0.95);
  drawPuff(290, 105, 100, 55, 0.95);
  drawPuff(140, 160, 70, 35, 0.6);
  drawPuff(380, 155, 80, 40, 0.6);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * A three-stop painted gradient dome plus a handful of flat cel clouds.
 */
export function buildSky(scene: THREE.Scene | THREE.Group, radius = 500) {
  const isBirthday = BirthdayThemeConfig.enabled;
  const geo = new THREE.SphereGeometry(radius, 32, 20);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: true,
    fog: false,
    toneMapped: true,
    uniforms: {
      uTop: { value: new THREE.Color(isBirthday ? BirthdayThemeConfig.sky.top : PAL.skyTop) },
      uMid: { value: new THREE.Color(isBirthday ? BirthdayThemeConfig.sky.middle : PAL.skyMid) },
      uHaze: { value: new THREE.Color(isBirthday ? BirthdayThemeConfig.sky.horizon : PAL.skyHaze) },
      uBands: { value: 26.0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4( position, 1.0 );
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uMid, uHaze;
      uniform float uBands;
      varying vec3 vWorld;

      void main() {
        vec3 dir = normalize(vWorld);
        float h = dir.y;
        float t = clamp( h * 1.15 + 0.02, 0.0, 1.0 );
        
        // Smooth out the banding for a lush gradient
        float q = floor( t * uBands ) / uBands;
        t = mix( t, q, 0.1 );

        vec3 col = mix( uHaze, uMid, smoothstep( 0.0, 0.35, t ) );
        col = mix( col, uTop, smoothstep( 0.30, 0.85, t ) );
        col = mix( col, uHaze, smoothstep( 0.12, -0.05, h ) * 0.8 );
        
        gl_FragColor = vec4( col, 1.0 );
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const dome = new THREE.Mesh(geo, mat);
  dome.frustumCulled = false;
  dome.renderOrder = -10;
  scene.add(dome);

  // --- Real Texture Luminous Moon in the night sky ---
  if (isBirthday) {
    const moonGroup = new THREE.Group();
    
    // Soft atmospheric halo behind the moon
    const haloGeo = new THREE.PlaneGeometry(75, 75);
    const cvHalo = document.createElement('canvas');
    cvHalo.width = 256; cvHalo.height = 256;
    const cHalo = cvHalo.getContext('2d')!;
    const gHalo = cHalo.createRadialGradient(128, 128, 0, 128, 128, 120);
    gHalo.addColorStop(0, 'rgba(224, 242, 254, 0.8)');
    gHalo.addColorStop(0.35, 'rgba(186, 230, 253, 0.4)');
    gHalo.addColorStop(0.7, 'rgba(125, 211, 252, 0.12)');
    gHalo.addColorStop(1, 'rgba(125, 211, 252, 0)');
    cHalo.fillStyle = gHalo;
    cHalo.beginPath(); cHalo.arc(128, 128, 120, 0, Math.PI * 2); cHalo.fill();

    const haloTex = new THREE.CanvasTexture(cvHalo);
    const haloMat = new THREE.MeshBasicMaterial({ 
      map: haloTex, 
      transparent: true, 
      opacity: 0.85, 
      fog: false, 
      depthWrite: false, 
      side: THREE.DoubleSide 
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0, -0.5);
    haloMesh.renderOrder = -8;
    moonGroup.add(haloMesh);

    // Exact high-contrast luminous moon image from user
    const moonTex = new THREE.TextureLoader().load('/assets/birthday/moon.jpg');
    moonTex.colorSpace = THREE.SRGBColorSpace;
    const moonMat = new THREE.MeshBasicMaterial({
      map: moonTex,
      fog: false,
      depthWrite: false,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const moonMesh = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), moonMat);
    moonMesh.renderOrder = -7;
    moonGroup.add(moonMesh);

    moonGroup.position.set(-150, 140, 110);
    moonGroup.lookAt(0, 0, 0);
    scene.add(moonGroup);
  }

  // --- Natural soft painterly clouds ---
  const tex = cloudTex();
  const rng = rngKit(7781);
  const clouds = new THREE.Group();
  const cloudColA = isBirthday ? 0x94a3b8 : PAL.cloud;
  const cloudColB = isBirthday ? 0x475569 : PAL.cloudShade;
  const matA = flat({ color: cloudColA, map: tex, transparent: true, opacity: isBirthday ? 0.55 : 0.62, depthWrite: false, fog: false, cache: false });
  const matB = flat({ color: cloudColB, map: tex, transparent: true, opacity: isBirthday ? 0.35 : 0.34, depthWrite: false, fog: false, cache: false });
  if (matA.map) {
    matA.map.wrapS = matA.map.wrapT = THREE.ClampToEdgeWrapping;
  }

  for (let i = 0; i < (isBirthday ? 16 : 22); i++) {
    const r = rng.range(240, 400);
    const a = rng.range(0, Math.PI * 2);
    const w = rng.range(140, 280);
    const h = w * rng.range(0.35, 0.48);
    const y = rng.range(70, 170);
    const g = new THREE.Group();
    const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matB);
    back.position.set(4, -h * 0.08, -2.5);
    const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matA);
    g.add(back, front);
    g.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    g.lookAt(0, y * 0.55, 0);
    g.renderOrder = -9;
    clouds.add(g);
  }
  clouds.frustumCulled = false;
  scene.add(clouds);

  return { dome, clouds };
}
