import { animate } from 'animejs';
import * as THREE from 'three';
import { PlayerController } from '../player/PlayerController';

export class AnimationSystem {
  /**
   * Cinematic drop-in landing animation.
   */
  static playLandingBounce(player: PlayerController, intensity: number = 1.0) {
    // We animate the player's external offsets rather than the camera directly
    // so it doesn't conflict with the player's own update loop.
    
    // Animate an artificial downward kick on the external bob offset
    player.externalBobY = -(0.3 * intensity);
    animate(player, {
      externalBobY: 0,
      duration: 800,
      easing: 'easeOutElastic(1, .6)'
    });
    
    // Headbob pitch bounce
    player.externalPitch = -(0.08 * intensity);
    animate(player, {
      externalPitch: 0,
      duration: 800,
      easing: 'easeOutElastic(1, .6)'
    });
  }

  /**
   * Bench sit animation.
   */
  static playBenchSit(player: PlayerController, targetPos: THREE.Vector3, targetYaw: number, onComplete: () => void) {
    (player as any).mode = 'SITTING';

    animate(player.state.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1200,
      easing: 'easeInOutSine'
    });

    animate(player.state, {
      yaw: targetYaw,
      duration: 1200,
      easing: 'easeInOutSine',
      complete: onComplete
    });
  }

  /**
   * Bench stand up animation.
   */
  static playBenchStand(player: PlayerController, targetPos: THREE.Vector3, targetYaw: number, onComplete: () => void) {
    animate(player.state.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1000,
      easing: 'easeInOutQuad'
    });

    animate(player.state, {
      yaw: targetYaw,
      duration: 1000,
      easing: 'easeInOutQuad',
      complete: () => {
        (player as any).mode = 'PLAYER';
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * Screen door transition (sliding two halves).
   */
  static playScreenDoorTransition(onMidpoint: () => void, onComplete?: () => void) {
    const leftDoor = document.createElement('div');
    const rightDoor = document.createElement('div');

    const commonStyle = 'position:fixed; top:0; width:50vw; height:100vh; background:#000; z-index:9999; pointer-events:none;';
    leftDoor.style.cssText = commonStyle + 'left:-50vw;';
    rightDoor.style.cssText = commonStyle + 'right:-50vw;';

    document.body.appendChild(leftDoor);
    document.body.appendChild(rightDoor);

    // Close doors
    animate(leftDoor, {
      left: 0,
      duration: 500,
      easing: 'easeInOutQuad'
    });

    animate(rightDoor, {
      right: 0,
      duration: 500,
      easing: 'easeInOutQuad',
      complete: () => {
        onMidpoint();
        // Open doors
        animate(leftDoor, {
          left: '-50vw',
          duration: 500,
          delay: 200,
          easing: 'easeInOutQuad'
        });
        animate(rightDoor, {
          right: '-50vw',
          duration: 500,
          delay: 200,
          easing: 'easeInOutQuad',
          complete: () => {
            leftDoor.remove();
            rightDoor.remove();
            if (onComplete) onComplete();
          }
        });
      }
    });
  }
}
