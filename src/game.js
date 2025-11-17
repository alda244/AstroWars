// src/game.js
export class Game {
  constructor(canvas, sfx, assets) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.sfx = sfx;
    this.assets = assets;
    this.width = 0; this.height = 0;

    this.music_track = assets.music; // Guarda la pista de música
    if (this.music_track) {
      this.music_track.loop = true;  // Para que se repita
      this.music_track.volume = 0.4; // Ajusta el volumen (0 a 1)
    }

    // Estado de alto nivel
    this.state = 'menu'; // 'menu' | 'playing' | 'paused' | 'gameover'
    this.onShowMenu = null; // callbacks opcionales
    this.onGameOver = null;

    // ---- Jugador ----
    this.x = 100; this.y = 100; this.speed = 220;
    this.vx = 0; this.vy = 0; this.heading = -Math.PI/2;
    
    this.playerWidth = 81; 
    this.playerHeight = 81;
    this.radius = 31.5;
    
    this.lastDirX = 0; this.lastDirY = -1;


    // ---- Input ----
    this.keys = {};

    // ---- Estado general ----
    this.lastTime = 0; this.running = true;
    this.score = 0; this.lives = 3;

    // ---- Disparo ----
    this.bullets = []; this.bulletSpeed = 520;
    this.bulletCooldown = 0; this.bulletRate = 0.18;
    this.doubleShot = false; this.doubleShotTimer = 0;
    this.shield = 0;
    this.damageMultiplier = 1; this.damageTimer = 0;

    // ---- Oleadas ----
    this.asteroids = [];
    this.wave = 1; this.killsThisWave = 0; this.targetKills = 0;
    this.spawnTimer = 0; this.spawnInterval = 1.0; this.maxOnScreen = 8;
    this.spawnLocked = true;
    this.powerups = []; this.powerupTimer = 0;

    // Banner
    this.bannerTimer = 0; this.bannerDuration = 1.6; this.bannerText = "";
    
    this.stars = []; 
    this._initStars();

    this._setupInput();
    this._resize();
    addEventListener("resize", () => this._resize());
  }

  setMusicMuted(isMuted) {
    if (this.music_track) {
      this.music_track.muted = isMuted;
    }
  }

  _initStars() {
  this.stars = [];
  const totalStars = 100; 
  for (let i = 0; i < totalStars; i++) {
    this.stars.push({
      x: rand(0, this.width || innerWidth),
      y: rand(0, this.height || innerHeight),
      layer: Math.ceil(Math.random() * 3),
    });
  }
}

  // ======= Ciclo de vida de estados =======
  startMenu(){
    this.state = 'menu';
    this._resetCore();
    if (this.music_track) {
      this.music_track.pause(); // Detén la música en el menú
      this.music_track.currentTime = 0; // Reinicia al principio
    }
    if (this.onShowMenu) this.onShowMenu();
    this._ensureLoop();
  }
  startNew(){
    this._resetCore();
    this.state = 'playing';
    this._startWave(1);
    if (this.music_track) {
      this.music_track.play(); // ¡Inicia la música!
    }
    this._ensureLoop();
  }
  resume(){ if (this.state==='paused'){ this.state='playing'; } }
  togglePause(){ if (this.state==='playing') this.state='paused'; else if (this.state==='paused') this.state='playing'; }
  gameOver(){
    this.state = 'gameover';
    this.sfx?.over();
    if (this.music_track) {
      this.music_track.pause(); // Detén la música
      this.music_track.currentTime = 0;
    }
    if (this.onGameOver) this.onGameOver();
    const oldHiScore = parseInt(localStorage.getItem('aw_highscore') || '0');
    if (this.score > oldHiScore) {
      localStorage.setItem('aw_highscore', this.score.toString());
}
  }

  _resetCore(){
    this.score=0; this.lives=3; this.lastTime=0;
    this.x=this.width/2 || 100; this.y=Math.floor((this.height||600)*0.7);
    this.vx=0; this.vy=0; this.heading=-Math.PI/2; this.lastDirX=0; this.lastDirY=-1;
    this.bullets=[]; this.doubleShot=false; this.doubleShotTimer=0; this.shield=0;
    this.damageMultiplier=1; this.damageTimer=0;
    this.asteroids=[]; this.wave=1; this.killsThisWave=0; this.targetKills=0;
    this.spawnTimer=0; this.spawnInterval=1.0; this.maxOnScreen=8; this.spawnLocked=true;
    this.powerups=[]; this.powerupTimer=0; this.bannerTimer=0;
  }

  _ensureLoop(){
    if (this._loopStarted) return;
    this._loopStarted = true;
    const loop = (t) => {
      const dt = Math.min(0.033, (t - this.lastTime) / 1000 || 0);
      this.lastTime = t;
      if (this.state==='playing') this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // ======= Sistema base =======
  _setupInput() {
    addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = true;
      // Controles de estado rápidos
      if (k === 'enter' && (this.state==='menu'||this.state==='gameover')) { this.startNew(); }
      if (k === 'p') this.togglePause();
      if (k === ' ' || k === 'space' || k === 'spacebar') e.preventDefault();
    }, { passive:false });
    addEventListener("keyup", (e) => (this.keys[e.key.toLowerCase()] = false));
  }

  _resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cssW = innerWidth, cssH = innerHeight;
    this.canvas.width  = Math.floor(cssW * dpr);
    this.canvas.height = Math.floor(cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = cssW; this.height = cssH;
    if (!this.y) this.y = Math.floor(this.height * 0.7);
  }

  // ======= Oleadas =======
  _startWave(n) {
    this.wave = n; this.killsThisWave = 0;
    this.targetKills = 8 + (n - 1) * 4;
    this.spawnInterval = Math.max(0.45, 1.0 - (n - 1) * 0.07);
    this.maxOnScreen   = Math.min(22, 8 + (n - 1) * 2);
    this.bannerText = `Oleada ${this.wave}`;
    this.bannerTimer = this.bannerDuration;
    this.spawnLocked = true; this.spawnTimer = 0;
    this.sfx?.wave();
  }
  _showNextWave() { this._startWave(this.wave + 1); }

  // ======= Update =======
  update(dt) {
    // Banner
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.spawnLocked = false;
    }

    // --- Actualización del fondo de estrellas ---
    const baseSpeed = 40; // Velocidad base del fondo
    for (const star of this.stars) {
      // Mueve la estrella basado en su "capa"
      star.y += (star.layer * baseSpeed) * dt;
    
      // Si la estrella se sale por abajo, muévela arriba
      if (star.y > this.height) {
        star.y = 0;
        star.x = rand(0, this.width);
      }
    }

    // Movimiento
    let mx = 0, my = 0;
    if (this.keys["arrowleft"] || this.keys["a"]) mx -= 1;
    if (this.keys["arrowright"]|| this.keys["d"]) mx += 1;
    if (this.keys["arrowup"]   || this.keys["w"]) my -= 1;
    if (this.keys["arrowdown"] || this.keys["s"]) my += 1;
    if (mx && my) { const k = Math.SQRT1_2; mx *= k; my *= k; }

    this.vx = mx * this.speed; this.vy = my * this.speed;
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.x = Math.max(this.radius, Math.min(this.width  - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(this.height - this.radius, this.y));

    if (mx !== 0 || my !== 0) { this.lastDirX = mx; this.lastDirY = my; }

    if (Math.hypot(this.vx, this.vy) > 1e-3) {
      const velAngle = Math.atan2(this.vy, this.vx);
      const target = velAngle + Math.PI / 2;
      this.heading = lerpAngle(this.heading, target, Math.min(1, 12 * dt));
    }

    // Disparo
    this.bulletCooldown -= dt;
    const spaceDown = this.keys[" "] || this.keys["space"] || this.keys["spacebar"];
    if (spaceDown && this.bulletCooldown <= 0) {
      this._shoot();
      this.bulletCooldown = this.bulletRate;
    }

    // Timers de poderes
    if (this.shield > 0) this.shield -= dt;
    if (this.doubleShotTimer > 0) this.doubleShotTimer -= dt; else this.doubleShot = false;
    if (this.damageTimer > 0) { this.damageTimer -= dt; if (this.damageTimer <= 0){ this.damageMultiplier=1; this.damageTimer=0; } }

    // Balas
    // Balas (Lógica de movimiento)
    for (const b of this.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
    }
    // Filtrar balas muertas o fuera de pantalla
    this.bullets = this.bullets.filter(b => b.life > 0 && b.x > -50 && b.x < this.width + 50 && b.y > -50 && b.y < this.height + 50);
    // Spawner
    if (!this.spawnLocked) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval && this.asteroids.length < this.maxOnScreen) {
        this.spawnTimer = 0;
        this._spawnAsteroid();
      }
    }

    // Powerups
    this.powerupTimer += dt;
    if (!this.spawnLocked && this.powerupTimer > 10 + Math.random()*5) { this.powerupTimer = 0; this._spawnPowerup(); }
    for (const p of this.powerups) p.y += p.vy * dt;
    this.powerups = this.powerups.filter(p => p.y < this.height + 40 && !p.dead);

    // Asteroides
    for (const a of this.asteroids) {
      a.x += a.vx * dt; a.y += a.vy * dt;
      a.angle += a.angleSpeed * dt;
      if (a.x < a.r && a.vx < 0) a.vx *= -1;
      if (a.x > this.width - a.r && a.vx > 0) a.vx *= -1;
    }
    this.asteroids = this.asteroids.filter(a => a.y < this.height + a.r + 60 && !a.dead);

    // Colisiones bala-asteroide
    for (const b of this.bullets) {
      for (const a of this.asteroids) {
        if (!a.dead && circleHit(b.x, b.y, b.r, a.x, a.y, a.r)) {
          a.hp -= (b.dmg || 1);
          b.life = 0;
          this.sfx?.hit();
          if (a.hp <= 0) {
            a.dead = true; this.killsThisWave += 1;
            this.score += 10 + Math.floor(a.r);
          }
        }
      }
    }
    this.asteroids = this.asteroids.filter(a => !a.dead);

    // Colisión jugador-asteroide
    for (const a of this.asteroids) {
      if (circleHit(this.x, this.y, this.radius, a.x, a.y, a.r)) {
        if (this.shield <= 0) this._onPlayerHit();
        a.dead = true;
      }
    }
    this.asteroids = this.asteroids.filter(a => !a.dead);

    // Jugador-powerup
    for (const p of this.powerups) {
      if (circleHit(this.x, this.y, this.radius, p.x, p.y, 10)) {
        this._applyPowerup(p.type);
        p.dead = true;
      }
    }
    this.powerups = this.powerups.filter(p => !p.dead);

    // Avance de oleada
    if (this.killsThisWave >= this.targetKills && this.bannerTimer <= 0) {
      this.asteroids.length = 0; this.powerups.length = 0;
      this.spawnLocked = true; this._showNextWave();
    }

    // Game over
    if (this.lives <= 0 && this.state==='playing') this.gameOver();
  }
  // ======= Render =======
  render() {
    const c = this.ctx;
    c.clearRect(0, 0, this.width, this.height);

    // Fondo
    c.clearRect(0, 0, this.width, this.height);

    // --- Dibujar fondo de estrellas parallax ---
    // (Usa tu paleta de colores aquí)
    const colorLejos = "#73b9d9ff"; // (Capa 1)
    const colorMedio = "#f7f3f5ff"; // (Capa 2)
    const colorCerca = "#fdf380ff"; // (Capa 3)

    for (const star of this.stars) {
      if (star.layer === 1) {
        c.fillStyle = colorLejos;
        c.fillRect(star.x, star.y, 1, 1);
      } else if (star.layer === 2) {
        c.fillStyle = colorMedio;
        c.fillRect(star.x, star.y, 2, 2);
      } else { // Capa 3
        c.fillStyle = colorCerca;
        c.fillRect(star.x, star.y, 3, 3);
      }
    }

    // Balas
// Balas (Dibujo con sprites)
    const bulletSprite = this.assets.bullet;
    if (bulletSprite) { // Solo dibuja si el sprite se cargó
      
      for (const b of this.bullets) {
        // 'b.r' es el radio de colisión (que es 3)
        const drawSize = 10; // Ajusta este tamaño como veas necesario

        c.save();
        c.translate(b.x, b.y);
        
        // Rota la bala
        const angle = Math.atan2(b.vy, b.vx) + Math.PI / 2;
        c.rotate(angle);

        // Dibuja el sprite centrado
        c.drawImage(
          bulletSprite,
          -drawSize / 2,
          -drawSize / 2,
          drawSize,
          drawSize
        );
        c.restore();
      }
    }

    // Asteroides
    // (Asume que this.sprite_ast_S, this.sprite_ast_M, this.sprite_ast_L están cargados)

    for (const a of this.asteroids) {
      let sprite;
      if (a.r < 18) {
        sprite = this.assets.asteroid_S; // Sprite pequeño
      } else if (a.r < 24) {
        sprite = this.assets.asteroid_M; // Sprite mediano
      } else {
        sprite = this.assets.asteroid_L; // Sprite grande
      }

      const drawSize = a.r * 2.2; // Multiplicador para que el sprite sea algo más grande que el hitbox
      
      if (!sprite) continue; // Si el sprite no está cargado, no dibuja nada

      c.save();
      c.translate(a.x, a.y); // 1. Mover al centro del asteroide
      c.rotate(a.angle);     // 2. Rotar el canvas
      
      c.drawImage(
        sprite,          // La imagen del sprite
        -drawSize / 2,   // Centrar en X
        -drawSize / 2,   // Centrar en Y
        drawSize,        // Ancho del sprite
        drawSize         // Alto del sprite
      );
      
      c.restore();
    }

    // Powerups
    for (const p of this.powerups) {
      let sprite;
      
      // Asigna el sprite correcto basado en el tipo
      if (p.type === "life") {
        sprite = this.assets.powerup_life;
      } else if (p.type === "double") {
        sprite = this.assets.powerup_double;
      } else if (p.type === "shield") {
        sprite = this.assets.powerup_shield;
      }

      if (!sprite) continue; // Si el sprite no está cargado, no dibuja nada

      // Define el tamaño del sprite (ajusta '32' según sea necesario)
      const drawSize = 32; 

      c.save();
      c.translate(p.x, p.y);
      
      // Dibuja el sprite centrado
      c.drawImage(
        sprite,
        -drawSize / 2,
        -drawSize / 2,
        drawSize,
        drawSize
      );
      
      c.restore();
    }

    // Jugador
    if (this.assets.player) {
      c.save();
      c.translate(this.x, this.y);
      c.rotate(this.heading);
      
      // Dibujar la imagen centrada
      c.drawImage(
        this.assets.player,
        -this.playerWidth / 2,  // Centrar en X
        -this.playerHeight / 2, // Centrar en Y
        this.playerWidth,
        this.playerHeight
      );
      
      c.restore();
      
      // Dibujar escudo (si existe)
      if (this.shield > 0) {
        c.strokeStyle = '#30C0B7'; // Color Cyan para powerups
        c.lineWidth = 2;
        c.beginPath();
        c.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
        c.stroke();
      }
      
    } else {
      // Fallback si la imagen no cargó (mantiene el triángulo original)
      c.save();
      c.translate(this.x, this.y);
      c.rotate(this.heading);
      c.beginPath();
      c.moveTo(0, -36); c.lineTo(27, 27); c.lineTo(-27, 27); c.closePath();
      c.fillStyle = this.shield > 0 ? "#5f5" : "#e6e9f5";
      c.fill(); c.restore();
    }


    // HUD si no estamos en menú
    if (this.state !== 'menu') {
      c.fillStyle = "#e6e9f5";
      c.font = "bold 16px system-ui, sans-serif";
      c.fillText(`Puntaje: ${this.score}`, 12, 22);
      c.fillText(`Vidas: ${this.lives}`, 12, 42);
      c.fillText(`Oleada: ${this.wave}`, 12, 62);
      c.fillText(`Eliminados: ${this.killsThisWave}/${this.targetKills}`, 12, 82);
      if (this.doubleShot) c.fillText(`Disparo doble ${Math.ceil(this.doubleShotTimer)}s`, 12, 102);
      if (this.shield>0)   c.fillText(`Escudo ${Math.ceil(this.shield)}s`, 12, 122);
      if (this.damageTimer>0) c.fillText(`Daño ×${this.damageMultiplier}  ${Math.ceil(this.damageTimer)}s`, 12, 142);
    }

    // Banner de oleada
    if (this.bannerTimer > 0) {
      const t = this.bannerTimer / this.bannerDuration;
      const alpha = t < 0.5 ? t*2 : (1 - t)*2;
      c.save();
      c.globalAlpha = Math.max(0, Math.min(1, alpha));
      c.fillStyle = "#e6e9f5";
      c.font = "bold 42px system-ui, sans-serif";
      c.textAlign = "center";
      c.fillText(this.bannerText, this.width/2, this.height*0.38);
      c.restore();
    }

    if (this.state === 'paused') {
      c.fillStyle = "rgba(0,0,0,0.45)";
      c.fillRect(0,0,this.width,this.height);
      c.fillStyle = "#e6e9f5"; c.font="bold 28px system-ui, sans-serif"; c.textAlign="center";
      c.fillText("PAUSA (P para continuar)", this.width/2, this.height/2);
      c.textAlign="start";
    }

    if (this.state === 'menu') {
      // El overlay HTML muestra el menú
    }

    if (this.state === 'gameover') {
      c.fillStyle = "rgba(0,0,0,0.55)"; c.fillRect(0, 0, this.width, this.height);
      c.fillStyle = "#e6e9f5"; c.font = "bold 28px system-ui, sans-serif"; c.textAlign = "center";
      c.fillText("GAME OVER", this.width/2, this.height/2 - 10);
      c.font = "16px system-ui, sans-serif";
      c.fillText("Enter para reiniciar", this.width/2, this.height/2 + 20); c.textAlign = "start";
    }
  }

  // ======= Gameplay helpers =======
  _shoot() {
    const mag = Math.hypot(this.lastDirX, this.lastDirY);
    if (mag < 0.01) return;
    const dirx = this.lastDirX / mag, diry = this.lastDirY / mag;
    const bx = this.x + dirx * 18,  by = this.y + diry * 18;

    const addBullet = (dx, dy) => {
      this.bullets.push({ x: bx, y: by, vx: dx * this.bulletSpeed, vy: dy * this.bulletSpeed, r: 3, life: 1.2, dmg: this.damageMultiplier });
    };

    addBullet(dirx, diry);
    this.sfx?.shoot();
    if (this.doubleShot) {
      const off = 0.16; const ca = Math.cos(off), sa = Math.sin(off);
      const dx1 = dirx * ca - diry * sa, dy1 = dirx * sa + diry * ca;
      const dx2 = dirx * ca + diry * sa, dy2 = -dirx * sa + diry * ca;
      addBullet(dx1, dy1); addBullet(dx2, dy2);
    }
  }

 _spawnAsteroid() {
    const n = this.wave, baseSpeed = 70 + n * 8;
    const r = rand(12, 28); // Mantenemos el radio aleatorio para la colisión y la lógica
    const hp = Math.max(1, Math.round(r / 10 + (n - 1) * 0.6));
    const x = rand(r, this.width - r), y = rand(-200, -r - 10);
    const vy = rand(baseSpeed, baseSpeed + 70), vx = rand(-50, 50);

    // --- NUEVO: Propiedades de rotación ---
    const angle = rand(0, Math.PI * 2);
    const angleSpeed = rand(-1.5, 1.5); // Velocidad de rotación en radianes/seg

    this.asteroids.push({ x, y, vx, vy, r, hp, dead:false, angle, angleSpeed }); // <-- Añadido al final
  }

  _spawnPowerup() {
    const types = ["life", "double", "shield"]; // 'life' = rojo = daño x2 temporal
    const type = types[Math.floor(Math.random() * types.length)];
    const x = rand(40, this.width - 40), y = -20, vy = rand(40, 80);
    this.powerups.push({ x, y, vy, type, dead:false });
  }

  _applyPowerup(type) {
    if (type === "life") {       // ROJO => daño
      this.damageMultiplier = 2; this.damageTimer = 8; this.sfx?.power();
    } else if (type === "double") {
      this.doubleShot = true; this.doubleShotTimer = 8; this.sfx?.power();
    } else if (type === "shield") {
      this.shield = 6; this.sfx?.power();
    }
  }

  _onPlayerHit() {
    if (this.shield > 0) return;
    this.lives -= 1; this.sfx?.boom();
    if (this.lives <= 0) this.gameOver();
  }
}

// ---- utilidades ----
function rand(min, max) { return Math.random() * (max - min) + min; }
function circleHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx, dy = ay - by; return dx*dx + dy*dy <= (ar + br)*(ar + br);
}
function lerpAngle(a, b, t) { let diff = normalizeAngle(b - a); return a + diff * t; }
function normalizeAngle(a) {
  while (a > Math.PI)  a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}
