import { useRef, useState } from 'react';
import GhostEngine from './GhostEngine';

import './FightingGame.css';

export interface FightingGameProps {
  mode?: 'story' | 'arcade' | 'versus';
  className?: string;
}

export default function FightingGame({ mode = 'arcade', className = '' }: FightingGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Map the new mode prop to the engine's expected mode
  const engineMode = mode === 'story' ? 'easy' : 'hard';

  const startGame = () => {
    setIsPlaying(true);
    // Give React a tick to render the canvas and HUD, then initialize
    setTimeout(() => {
      new GhostEngine('gameCanvas', engineMode);
    }, 0);
  };

  return (
    <div className={`fighting-game-container ${className}`} ref={containerRef}>
      {!isPlaying && (
        <div className="fighting-game-start-overlay">
          <button className="fight-button" onClick={startGame}>FIGHT</button>
        </div>
      )}

      {/* The DOM structure expected by GhostEngine */}
      <div id="cutscene-layer" style={{ display: 'none' }}>
        <h1 id="cutscene-text"></h1>
      </div>

      <div id="game-hud" style={{ display: 'none' }}>
        <div className="hud-side left">
          <h3>THE GHOST</h3>
          <div className="bar-container hp-bar-container">
            <div id="jin-hp" className="hp-bar jin-hp"></div>
          </div>
          <div className="bar-container stamina-bar-container">
            <div id="jin-stamina" className="stamina-bar"></div>
          </div>
        </div>

        <div className="hud-side right">
          <h3>LORD SHIMURA</h3>
          <div className="bar-container hp-bar-container right-aligned">
            <div id="shimura-hp" className="hp-bar shimura-hp"></div>
          </div>
          <div className="bar-container stamina-bar-container right-aligned">
            <div id="shimura-stamina" className="stamina-bar"></div>
          </div>
        </div>

        <div id="game-controls">
          <p>[A/D] MOVE &nbsp;|&nbsp; [SHIFT] DASH &nbsp;|&nbsp; [J] LIGHT &nbsp;|&nbsp; [K] HEAVY &nbsp;|&nbsp; [L] PARRY</p>
        </div>
      </div>

      <div id="game-victory" style={{ display: 'none' }}>
        <h1>ROOM CLEARED</h1>
        <p>"I am not your son. I am the Ghost."</p>
      </div>

      <div id="game-flash"></div>
      
      <div className="status-container">
        <h2 id="game-status"></h2>
        <p id="game-sub"></p>
      </div>

      <canvas id="gameCanvas"></canvas>
      <div className="scanlines"></div>
    </div>
  );
}
