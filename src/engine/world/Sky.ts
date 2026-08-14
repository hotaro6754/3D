import * as THREE from 'three';
import { PAL } from '../rendering/palette';
import { flat } from '../rendering/toon';
// Assume cloudTex exists or we can mock a simple canvas texture
import { rngKit } from '../rendering/util';

function cloudTex(): THREE.Texture {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 128;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.ellipse(256, 64, 200, 50, 0, 0, Math.PI * 2);
  c.ellipse(150, 80, 100, 30, 0, 0, Math.PI * 2);
  c.ellipse(350, 70, 120, 40, 0, 0, Math.PI * 2);
  c.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * A three-stop painted gradient dome plus a handful of flat cel clouds.
 */
export function buildSky(scene: THREE.Scene | THREE.Group, radius = 500) {
  const geo = new THREE.SphereGeometry(radius, 32, 20);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: true, // Must be true so depth buffer works!
    fog: false,
    toneMapped: true,
    uniforms: {
      uTop: { value: new THREE.Color(PAL.skyTop) },
      uMid: { value: new THREE.Color(PAL.skyMid) },
      uHaze: { value: new THREE.Color(PAL.skyHaze) },
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

        // Sun glow
        vec3 sunDir = normalize(vec3(-80.0, 25.0, 60.0));
        float sunDot = max(dot(dir, sunDir), 0.0);
        float sunGlow = pow(sunDot, 8.0) * 0.6 + pow(sunDot, 32.0) * 0.4;
        vec3 sunColor = vec3(1.0, 0.9, 0.7);
        col += sunColor * sunGlow * smoothstep(-0.1, 0.2, h);

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

  // --- flat clouds ---
  const tex = cloudTex();
  const rng = rngKit(7781);
  const clouds = new THREE.Group();
  const matA = flat({ color: PAL.cloud, map: tex, transparent: true, opacity: 0.62, depthWrite: false, fog: false, cache: false });
  const matB = flat({ color: PAL.cloudShade, map: tex, transparent: true, opacity: 0.34, depthWrite: false, fog: false, cache: false });
  if (matA.map) {
    matA.map.wrapS = matA.map.wrapT = THREE.ClampToEdgeWrapping;
  }

  for (let i = 0; i < 22; i++) {
    const r = rng.range(220, 350);
    const a = rng.range(0, Math.PI * 2);
    const w = rng.range(90, 210);
    const h = w * rng.range(0.24, 0.34);
    const y = rng.range(46, 140);
    const g = new THREE.Group();
    const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matB);
    back.position.set(2, -h * 0.1, -1.5);
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
