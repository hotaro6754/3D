class AudioSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    playClang() {
        if(this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.1);
    }

    playSwoosh() {
        if(this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.2);
    }

    playHit() {
        if(this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.2);
    }

    playLaugh() {
        if(this.ctx.state === 'suspended') this.ctx.resume();
        const playHa = (time, pitch) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(pitch, time);
            osc.frequency.exponentialRampToValueAtTime(pitch/2, time + 0.2);
            gain.gain.setValueAtTime(1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(time); osc.stop(time + 0.2);
        };
        const t = this.ctx.currentTime;
        playHa(t, 150); playHa(t + 0.3, 140); playHa(t + 0.6, 130); playHa(t + 0.9, 110);
    }

    startBGM(mode) {
        if(this.ctx.state === 'suspended') this.ctx.resume();
        this.stopBGM();
        this.bgmOsc = this.ctx.createOscillator();
        this.bgmGain = this.ctx.createGain();
        this.bgmOsc.connect(this.bgmGain);
        this.bgmGain.connect(this.ctx.destination);
        if (mode === 'easy') {
            this.bgmOsc.type = 'sine';
            this.bgmOsc.frequency.setValueAtTime(220, this.ctx.currentTime);
            this.bgmGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        } else {
            this.bgmOsc.type = 'sawtooth';
            this.bgmOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
            this.bgmGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            this.heartbeat = setInterval(() => {
                if(this.ctx.state === 'suspended') return;
                const hOsc = this.ctx.createOscillator();
                const hGain = this.ctx.createGain();
                hOsc.type = 'sine';
                hOsc.frequency.setValueAtTime(60, this.ctx.currentTime);
                hOsc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.2);
                hGain.gain.setValueAtTime(1, this.ctx.currentTime);
                hGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
                hOsc.connect(hGain); hGain.connect(this.ctx.destination);
                hOsc.start(); hOsc.stop(this.ctx.currentTime + 0.2);
            }, 800);
        }
        this.bgmOsc.start();
    }

    stopBGM() {
        if(this.bgmOsc) this.bgmOsc.stop();
        if(this.heartbeat) clearInterval(this.heartbeat);
    }
}

class Fighter {
    constructor(id, x, isPlayer, imgPath) {
        this.id = id;
        this.x = x;
        this.y = 350; // Ground level
        this.vx = 0;
        this.vy = 0;
        this.facing = isPlayer ? 1 : -1;
        this.isPlayer = isPlayer;
        this.hp = 100;
        this.stamina = 100;
        this.state = 'idle'; // idle, run, dash, attack, heavyAttack, parry, hit, dead
        this.stateTimer = 0;
        this.hitLanded = false;
        
        // Aesthetics
        this.img = new Image();
        this.img.src = imgPath;
        this.width = 180;
        this.height = 180;
        
        // Procedural Animation Targets
        this.scaleX = 1;
        this.scaleY = 1;
        this.rot = 0;
        this.trails = []; // For dash/heavy ghosts
    }
}

class GhostEngine {
    constructor(canvasId, mode) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 450;
        this.mode = mode; 
        
        this.audio = new AudioSynth();
        this.state = 'cutscene'; 
        this.tauntText = "";
        this.tauntTimer = 0;

        // Background
        this.bgImg = new Image();
        this.bgImg.src = mode === 'easy' ? 'bg_bamboo.png' : 'bg_bloodmoon.png';

        // Input
        this.keys = {};
        window.addEventListener('keydown', e => {
            if(['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
                if(this.state === 'playing') e.preventDefault();
            }
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', e => this.keys[e.code] = false);

        // Juice
        this.screenShake = 0;
        this.hitStop = 0;
        this.bloodSplash = 0;
        this.slashes = []; // Katana arc VFX

        // Fighters
        this.jin = new Fighter('jin', 200, true, 'trans_real_jin.png');
        this.shimura = new Fighter('shimura', 600, false, 'trans_real_shimura.png');
        
        if (this.mode === 'hard') {
            this.shimura.hp = 200;
            this.shimura.dmgScale = 2.0;
        } else {
            this.shimura.hp = 80;
            this.shimura.dmgScale = 0.8;
        }

        this.loop = this.loop.bind(this);
        document.getElementById('game-hud').style.display = 'block';
        this.runCutscene();
    }

    addSlash(x, y, facing, type) {
        this.slashes.push({
            x: x, y: y,
            radius: type === 'heavy' ? 120 : 80,
            angle: facing === 1 ? -Math.PI/4 : Math.PI + Math.PI/4,
            facing: facing,
            life: 1.0,
            color: type === 'heavy' ? (this.mode === 'hard' ? 'rgba(255,50,50,1)' : 'rgba(255,100,100,1)') : 'rgba(255,255,255,1)'
        });
    }

    async runCutscene() {
        requestAnimationFrame(this.loop);
        const textOverlay = document.getElementById('cutscene-text');
        const layer = document.getElementById('cutscene-layer');
        layer.style.display = 'block';
        
        this.jin.state = 'run';
        this.jin.vx = 2;
        await new Promise(r => setTimeout(r, 1000));
        this.jin.state = 'idle';
        this.jin.vx = 0;

        this.hitStop = 60; 
        layer.style.background = 'rgba(0, 255, 204, 0.4)';
        textOverlay.style.color = '#fff';
        textOverlay.style.textShadow = '10px 10px 0px #000';
        textOverlay.innerHTML = "JIN SAKAI<br><span style='font-size:3rem'>THE GHOST</span>";
        gsap.fromTo(textOverlay, { opacity: 0, scale: 3 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power4.out" });
        this.audio.playHit();
        await new Promise(r => setTimeout(r, 1500));
        gsap.to(textOverlay, { opacity: 0, scale: 5, duration: 0.2 });
        layer.style.background = 'rgba(0, 0, 0, 0.5)';

        this.shimura.state = 'run';
        this.shimura.vx = -2;
        await new Promise(r => setTimeout(r, 1000));
        this.shimura.state = 'idle';
        this.shimura.vx = 0;

        this.hitStop = 60; 
        layer.style.background = 'rgba(255, 51, 51, 0.4)';
        textOverlay.style.color = '#fff';
        textOverlay.style.textShadow = '10px 10px 0px #000';
        textOverlay.innerHTML = "LORD SHIMURA<br><span style='font-size:3rem'>THE UNBENDING</span>";
        gsap.fromTo(textOverlay, { opacity: 0, scale: 3 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power4.out" });
        this.audio.playHit();
        await new Promise(r => setTimeout(r, 1500));
        gsap.to(textOverlay, { opacity: 0, scale: 5, duration: 0.2 });
        layer.style.background = 'rgba(0, 0, 0, 0.5)';

        textOverlay.style.textShadow = '0 0 20px #fff';
        textOverlay.innerHTML = "3";
        gsap.fromTo(textOverlay, { opacity: 0, scale: 2 }, { opacity: 1, scale: 1, duration: 0.2 }); this.audio.playClang(); await new Promise(r => setTimeout(r, 700));
        textOverlay.innerHTML = "2"; this.audio.playClang(); await new Promise(r => setTimeout(r, 700));
        textOverlay.innerHTML = "1"; this.audio.playClang(); await new Promise(r => setTimeout(r, 700));
        textOverlay.innerHTML = "STANDOFF!"; this.audio.playHit(); this.screenShake = 20; await new Promise(r => setTimeout(r, 700));
        
        layer.style.display = 'none';
        this.audio.startBGM(this.mode);
        document.getElementById('jin-hp').style.width = '100%';
        document.getElementById('shimura-hp').style.width = '100%';

        this.state = 'playing';
        this.aiLoop();
    }

    aiLoop() {
        setInterval(() => {
            if(this.state !== 'playing' || this.hitStop > 0) return;
            const dist = Math.abs(this.jin.x - this.shimura.x);
            
            const attackChance = this.mode === 'hard' ? 0.95 : 0.4;
            const dashChance = this.mode === 'hard' ? 0.6 : 0.1;
            const parryChance = this.mode === 'hard' ? 0.8 : 0.2;

            if (dist > 250) { 
                if (Math.random() < dashChance) {
                    this.keys['ShiftRight'] = true;
                    setTimeout(() => this.keys['ShiftRight'] = false, 100);
                } else {
                    this.keys['ArrowLeft'] = this.jin.x < this.shimura.x;
                    this.keys['ArrowRight'] = this.jin.x > this.shimura.x;
                    this.keys['Numpad1'] = false;
                    this.keys['Numpad2'] = false;
                }
            } else if (dist < 150) {
                this.keys['ArrowLeft'] = false;
                this.keys['ArrowRight'] = false;
                
                if (this.mode === 'hard' && (this.jin.state === 'attack' || this.jin.state === 'heavyAttack') && Math.random() < parryChance) {
                    this.keys['Numpad3'] = true; 
                    setTimeout(() => this.keys['Numpad3'] = false, 100);
                } else if (Math.random() < attackChance && this.shimura.state === 'idle') {
                    if (Math.random() > 0.4) {
                        this.keys['Numpad1'] = true; 
                        setTimeout(() => this.keys['Numpad1'] = false, 100);
                    } else {
                        this.keys['Numpad2'] = true; 
                        setTimeout(() => this.keys['Numpad2'] = false, 100);
                    }
                }
            } else {
                this.keys['ArrowLeft'] = this.jin.x < this.shimura.x;
                this.keys['ArrowRight'] = this.jin.x > this.shimura.x;
            }

            if (Math.random() > 0.95 && !this.tauntText) this.triggerGroqTaunt();
        }, this.mode === 'hard' ? 80 : 250);
    }

    async triggerGroqTaunt() {
        const hpDiff = this.jin.hp - this.shimura.hp;
        
        const winningTaunts = [
            "You are weak, Jin!",
            "You lack discipline!",
            "Is that all you have!?",
            "You disgrace our clan!"
        ];
        
        const losingTaunts = [
            "I will not yield!",
            "You are no Samurai!",
            "Have you lost your mind!?",
            "I am the unbending sword!"
        ];
        
        const fierceTaunts = [
            "Face me, coward!",
            "For Tsushima!",
            "I will strike you down!",
            "Show me your resolve!"
        ];

        let selected = fierceTaunts;
        if (hpDiff > 30) selected = losingTaunts;
        else if (hpDiff < -30) selected = winningTaunts;

        this.tauntText = selected[Math.floor(Math.random() * selected.length)];
        this.tauntTimer = 180;
    }

    updateFighter(f, left, right, dash, light, heavy, parry) {
        if (f.state === 'dead') {
            f.rot += (-Math.PI/2 * f.facing - f.rot) * 0.1;
            f.y += 5; // fall
            return;
        }

        f.x += f.vx;
        f.vx *= 0.85;

        // Idle Breathing
        if (f.state === 'idle') {
            f.scaleY = 1.0 + Math.sin(Date.now()/200) * 0.03;
            f.scaleX = 1.0 - Math.sin(Date.now()/200) * 0.01;
            f.rot = Math.sin(Date.now()/400) * 0.05 * f.facing;
        }

        // Run Bobbing
        if (f.state === 'run') {
            f.rot = 0.2 * f.facing;
            f.scaleY = 1.0 + Math.abs(Math.sin(Date.now()/100)) * 0.1;
        }

        if (f.stamina < 100 && f.state === 'idle') f.stamina += 0.5;
        if (f.isPlayer) document.getElementById(f.id + '-stamina').style.width = f.stamina + '%';

        if (f.stateTimer > 0) {
            f.stateTimer--;
            if (f.stateTimer <= 0) {
                f.state = 'idle';
                f.hitLanded = false;
            }
        }

        // Ghost Trails for dash
        if (f.state === 'dash' || f.state === 'heavyAttack') {
            if (f.stateTimer % 2 === 0) f.trails.push({x: f.x, life: 1.0});
        }
        f.trails.forEach(t => t.life -= 0.1);
        f.trails = f.trails.filter(t => t.life > 0);

        if (f.state === 'idle' || f.state === 'run') {
            if (parry && f.stamina > 15) {
                f.state = 'parry';
                f.stateTimer = 20;
                f.stamina -= 15;
                f.rot = -0.2 * f.facing; // Lean back to block
                f.scaleX = 1.2; f.scaleY = 0.9;
            } else if (light) {
                f.state = 'attack';
                f.stateTimer = 20;
                this.audio.playSwoosh();
                f.vx = f.facing * 8;
                f.rot = 0.5 * f.facing; // Lunge forward
                f.scaleX = 0.8; f.scaleY = 1.2;
                this.addSlash(f.x + f.facing*50, f.y - 80, f.facing, 'light');
            } else if (heavy && f.stamina > 25) {
                f.state = 'heavyAttack';
                f.stateTimer = 45;
                f.stamina -= 25;
                this.audio.playSwoosh();
                f.rot = -0.5 * f.facing; // Deep windup
            } else if (dash && f.stamina > 30) {
                f.state = 'dash';
                f.stateTimer = 15;
                f.stamina -= 30;
                f.vx = f.facing * 25;
                this.audio.playSwoosh();
                f.rot = 0.6 * f.facing; // Naruto run lean
                f.scaleX = 1.3; f.scaleY = 0.7;
            } else if (left) {
                f.vx -= 1.5;
                f.facing = -1;
                f.state = 'run';
            } else if (right) {
                f.vx += 1.5;
                f.facing = 1;
                f.state = 'run';
            } else {
                f.state = 'idle';
            }
        } else if (f.state === 'heavyAttack') {
            if (f.stateTimer === 19) {
                f.vx = f.facing * 20;
                f.rot = 0.8 * f.facing; // Smash down
                this.addSlash(f.x + f.facing*80, f.y - 60, f.facing, 'heavy');
            }
        } else if (f.state === 'hit') {
            f.rot = -0.3 * f.facing; // Knockback angle
        }

        // Return to normal scale smoothly
        if(f.state !== 'idle' && f.state !== 'run') {
            f.scaleX += (1 - f.scaleX) * 0.2;
            f.scaleY += (1 - f.scaleY) * 0.2;
        }

        if(f.x < 50) f.x = 50;
        if(f.x > 750) f.x = 750;
    }

    checkHit(attacker, defender) {
        if(attacker.state !== 'attack' && attacker.state !== 'heavyAttack') return;
        if(attacker.hitLanded) return;
        
        // Attack hit frames
        if(attacker.state === 'attack' && attacker.stateTimer > 15) return; 
        if(attacker.state === 'heavyAttack' && attacker.stateTimer > 19) return;

        const dist = Math.abs(attacker.x - defender.x);
        const range = attacker.state === 'heavyAttack' ? 180 : 120; // 2D ranges

        if (dist < range) {
            attacker.hitLanded = true;
            
            if (defender.state === 'parry') {
                this.audio.playClang();
                attacker.vx = attacker.facing * -15;
                this.hitStop = 8;
                this.screenShake = 10;
                return;
            } else if (defender.state === 'dash') {
                return;
            }

            let dmg = attacker.state === 'heavyAttack' ? 25 : 10;
            if(attacker.id === 'shimura') dmg *= attacker.dmgScale; 
            
            defender.hp -= dmg;
            defender.state = 'hit';
            defender.stateTimer = 20;
            defender.vx = attacker.facing * (attacker.state === 'heavyAttack' ? 20 : 10);
            defender.scaleX = 1.5; // Squish on hit
            defender.scaleY = 0.5;
            
            this.audio.playHit();
            
            this.screenShake = attacker.state === 'heavyAttack' ? 25 : 10;
            this.hitStop = attacker.state === 'heavyAttack' ? 20 : 5;
            if (attacker.state === 'heavyAttack') this.bloodSplash = 0.6;

            const hpPercent = Math.max(0, (defender.hp / (defender.id === 'shimura' ? (this.mode==='hard'?200:80) : 100)) * 100);
            document.getElementById(defender.id + '-hp').style.width = hpPercent + '%';

            if(defender.hp <= 0) {
                this.state = defender.id === 'jin' ? 'loss' : 'win';
                defender.state = 'dead';
                this.hitStop = 40; 
                this.bloodSplash = 0.8;
                this.audio.stopBGM();
                if(this.state === 'win') this.triggerVictory();
                else this.triggerLoss();
            }
        }
    }

    triggerVictory() {
        setTimeout(() => {
            document.getElementById('game-victory').style.display = 'flex';
            gsap.from('#game-victory', { opacity: 0, scale: 0.8, duration: 0.5, ease: "back.out(2)" });
            document.body.classList.add('paper-mode');
            setTimeout(() => document.body.classList.remove('paper-mode'), 200);
        }, 1500);
    }

    triggerLoss() {
        this.audio.playLaugh();
        setTimeout(() => {
            document.getElementById('game-flash').style.background = 'var(--accent)';
            document.getElementById('game-flash').style.opacity = '0.8';
            document.getElementById('game-status').innerText = 'YOU DIED';
            document.getElementById('game-sub').innerHTML = "Lord Shimura: 'Have you lost your mind!?'<br>Jin Sakai: 'I have lost everything!'";
            setTimeout(() => location.reload(), 3000);
        }, 1500);
    }

    drawFighter(f) {
        if (!f.img.complete) return;
        this.ctx.save();
        
        // Draw ghosts
        f.trails.forEach(t => {
            this.ctx.save();
            this.ctx.globalAlpha = t.life * 0.5;
            this.ctx.translate(t.x, f.y);
            this.ctx.scale(f.facing * f.scaleX, f.scaleY);
            this.ctx.rotate(f.rot);
            this.ctx.drawImage(f.img, -f.width/2, -f.height, f.width, f.height);
            this.ctx.restore();
        });

        // Draw main
        this.ctx.translate(f.x, f.y);
        this.ctx.scale(f.facing * f.scaleX, f.scaleY);
        this.ctx.rotate(f.rot);

        if (f.state === 'hit' && f.stateTimer > 15) {
            // Flash white
            this.ctx.drawImage(f.img, -f.width/2, -f.height, f.width, f.height);
            this.ctx.globalCompositeOperation = "source-atop";
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(-f.width/2, -f.height, f.width, f.height);
        } else {
            this.ctx.drawImage(f.img, -f.width/2, -f.height, f.width, f.height);
        }
        
        this.ctx.restore();
    }

    loop() {
        requestAnimationFrame(this.loop);
        
        let dx = 0; let dy = 0;
        if (this.screenShake > 0) {
            dx = (Math.random() - 0.5) * this.screenShake;
            dy = (Math.random() - 0.5) * this.screenShake;
            this.screenShake *= 0.9;
            if(this.screenShake < 0.5) this.screenShake = 0;
        }

        // Draw Background
        this.ctx.save();
        this.ctx.translate(dx, dy);
        if (this.bgImg.complete && this.bgImg.naturalWidth > 0) {
            // Slight zoom to allow shake without showing edges
            this.ctx.drawImage(this.bgImg, -20, -20, this.canvas.width+40, this.canvas.height+40);
        } else {
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        if (this.hitStop > 0) {
            this.hitStop--;
        } else {
            if(this.state === 'playing' || this.state === 'cutscene') {
                this.updateFighter(this.jin, this.keys['KeyA'], this.keys['KeyD'], this.keys['ShiftLeft'], this.keys['KeyJ'], this.keys['KeyK'], this.keys['KeyL']);
                this.updateFighter(this.shimura, this.keys['ArrowLeft'], this.keys['ArrowRight'], this.keys['ShiftRight'], this.keys['Numpad1'], this.keys['Numpad2'], this.keys['Numpad3']);
                
                if(this.state === 'playing') {
                    this.checkHit(this.jin, this.shimura);
                    this.checkHit(this.shimura, this.jin);
                }
            }
        }

        // Render Characters
        this.drawFighter(this.shimura);
        this.drawFighter(this.jin);

        // Render Slashes
        this.slashes.forEach(s => {
            if(this.hitStop <= 0) s.life -= 0.1;
            this.ctx.save();
            this.ctx.globalAlpha = s.life;
            this.ctx.strokeStyle = s.color;
            this.ctx.lineWidth = 10 * s.life;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            
            // Sweep the arc based on life to make it look like a moving slash
            const sweep = (1 - s.life) * Math.PI;
            if (s.facing === 1) {
                this.ctx.arc(s.x, s.y, s.radius, s.angle, s.angle + sweep);
            } else {
                this.ctx.arc(s.x, s.y, s.radius, s.angle - sweep, s.angle, true);
            }
            this.ctx.stroke();
            this.ctx.restore();
        });
        this.slashes = this.slashes.filter(s => s.life > 0);

        this.ctx.restore(); // Undo camera shake

        // UI Flash Overlays
        const flash = document.getElementById('game-flash');
        if (this.bloodSplash > 0) {
            flash.style.background = 'red';
            flash.style.opacity = this.bloodSplash;
            if(this.hitStop <= 0) this.bloodSplash -= 0.02;
        } else if (flash.style.opacity > 0 && this.state !== 'loss') {
            flash.style.opacity = 0;
        }

        const sub = document.getElementById('game-sub');
        if(this.tauntText && this.tauntTimer > 0) {
            sub.innerText = "LORD SHIMURA: " + this.tauntText;
            if(this.hitStop <= 0) this.tauntTimer--;
        } else if (this.state === 'playing') {
            sub.innerText = "";
        }
    }
}

window.GhostEngine = GhostEngine;
export default GhostEngine;
