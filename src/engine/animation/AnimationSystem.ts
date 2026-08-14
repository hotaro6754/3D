import { animate } from 'animejs';
import * as THREE from 'three';
import { PlayerController, CameraMode } from '../player/PlayerController';

export class AnimationSystem {
  static playLandingBounce(player: PlayerController, intensity: number = 1.0) {
    player.externalBobY = -(0.3 * intensity);
    animate(player, {
      externalBobY: 0,
      duration: 800,
      easing: 'easeOutElastic(1, .6)'
    });
    
    player.externalPitch = (0.1 * intensity);
    animate(player, {
      externalPitch: 0,
      duration: 1000,
      easing: 'easeOutQuart'
    });
  }

  static playBenchSit(player: PlayerController, benchPos: THREE.Vector3, benchRotY: number, onComplete: () => void, targetPitch: number = -0.05) {
    player.mode = CameraMode.SITTING;
    player.state.grounded = false;
    player.state.velocity.set(0, 0, 0);
    
    animate(player.state.position, {
      x: benchPos.x,
      y: benchPos.y,
      z: benchPos.z,
      duration: 1500,
      easing: 'easeInOutSine'
    });

    animate(player.state, {
      yaw: benchRotY,
      pitch: targetPitch,
      duration: 1200,
      easing: 'easeInOutQuad',
      complete: onComplete
    });
  }

  static playBenchStand(player: PlayerController, targetPos: THREE.Vector3, targetYaw: number, onComplete: () => void) {
    animate(player.state.position, {
      x: targetPos.x,
      y: targetPos.y + 0.5,
      z: targetPos.z + 1.0,
      duration: 1000,
      easing: 'easeInOutQuad'
    });

    animate(player.state, {
      yaw: targetYaw,
      pitch: 0,
      duration: 800,
      easing: 'easeInOutQuad',
      complete: () => {
        player.mode = CameraMode.PLAYER;
        player.state.velocity.set(0, 0, 0);
        player.state.grounded = true;
        onComplete();
      }
    });
  }

  static playScreenDoorTransition(onMidpoint: () => void, onComplete?: () => void) {
    const leftDoor = document.createElement('div');
    const rightDoor = document.createElement('div');

    const commonStyle = 'position:fixed; top:0; width:50vw; height:100vh; background:#000; z-index:9999; pointer-events:none;';
    leftDoor.style.cssText = commonStyle + 'left:-50vw;';
    rightDoor.style.cssText = commonStyle + 'right:-50vw;';

    document.body.appendChild(leftDoor);
    document.body.appendChild(rightDoor);

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
