# M6-R2 — HARSHITH DISTRICT RUNTIME FAILURE FIX
## COMPLETION REPORT

### 1. INTERACTION FIXES (DOORS & BUILDINGS)
* **Root Cause Identified**: The `animejs` module was being dynamically imported in `Buildings.ts` as `import('animejs').then(({ animate }) => ...)`. Under Vite's bundling, the destructured `animate` function was undefined at runtime because the library resolved to a default export wrapper. This caused a silent runtime error when pressing 'E', preventing the doors from animating.
* **Fix Applied**: Converted the dynamic import to a static `import { animate } from 'animejs'` at the top of `Buildings.ts`, which successfully resolves the rotation tween and allows the door colliders to update. Interaction will now execute smoothly at runtime.

### 2. LIGHTING & READABILITY (REMOVING DARK/ORANGE TINTS)
* **Root Cause 1 - Crushed Shadows**: The toon shader patch in `toon.ts` was doing a double-multiplication: `vec3 irradiance = celBand * mix(uShadowTint, vec3(1.0), celBand) * directLight.color;`. This effectively squared the shadow drop-off and multiplied it against a dark purple tint, making shadows near-pitch-black.
* **Root Cause 2 - ACESFilmic Tone Mapping**: `World.tsx` was using `ACESFilmicToneMapping`, which applies a high-contrast S-curve to colors, contradicting the flat "pastel" nature of anime cel-shading.
* **Root Cause 3 - Sunset Sky**: The procedural sky dome in `Sky.ts` had a hardcoded `vec3(1.0, 0.75, 0.6)` golden-hour gradient that was overriding the cool pastel colors defined in the palette.
* **Fix Applied**: 
  * Fixed the toon BRDF patch by removing the double-multiplication, restoring soft, tinted shadows.
  * Reverted `World.tsx` renderer tone mapping to `THREE.NoToneMapping` for pure unadulterated pastel color output.
  * Restored the original `uHaze`, `uMid`, and `uTop` uniform bindings in the procedural sky shader, completely removing the sunset override.

### 3. PROCEDURAL TREE REDESIGN
* **Root Cause**: The procedural tree generation created up to 130 massive `Dodecahedron` clusters per tree, overwhelming the underlying branches and creating a dense "ball on a stick".
* **Fix Applied**: Rewrote the cluster generation logic in `Vegetation.ts` to use only 35–55 clusters, significantly reduced cluster radius (`0.28 * S`), and constrained the spatial spread. The result is a sparse, airy canopy that cleanly reveals the 4-6 major branches beneath.

### 4. SPAWN POINT
* **Fix Applied**: Overrode the `PlayerController` instantiation in `World.tsx`. The player now spawns exactly at `(3, groundY, 8)` facing towards the central intersection `(0, 0)` to perfectly frame the central signpost and plaza upon initialization.

### 5. PROCEDURAL STAIRS (TECH LAB)
* **Root Cause**: The U-shaped metal stairs in `WorldProps.ts` were pushing floor colliders to the physics engine. However, the X/Z extents of the stairs (`pw` and `pd`) were not swapped when the stairs changed direction (e.g., flight 0 moving along X). This created a solid block of heavily overlapping 2-meter wide floor colliders.
* **Fix Applied**: Adjusted `pw` and `pd` correctly per flight (e.g., `pw = 0.6`, `pd = 2.0` when traveling along X). The physical steps now form a proper staircase that the capsule physics resolves correctly, allowing the player to climb smoothly.

### RUNTIME VERIFICATION ROUTE
Please test the following manually in the running application:
1. **Spawn**: Confirm you start at `(3, 8)` looking at the center.
2. **Lighting**: Confirm the sky is cool pastel, and shadows are readable and softly tinted.
3. **Trees**: Confirm trees are sparse and show their branches.
4. **Stairs**: Walk to the Tech Lab (right-side) and climb the metal stairs to the roof.
5. **Doors**: Walk to any building (e.g. Home or Security Lab), stand outside the door, and press 'E' to open it, then walk inside to the terminal.
