// main.js - ¡Este archivo está en la raíz de astro-wars/!
import { Game } from './src/game.js'; // CAMBIADO: Debería ser './game.js' si game.js está en la raíz, o './src/game.js' si está en src/
import { SFX } from './src/sfx.js';   // CAMBIADO: Debería ser './sfx.js' si sfx.js está en la raíz, o './src/sfx.js' si está en src/
import { AssetLoader } from './engine/loader.js'; // CORREGIDO: la ruta del loader

const canvas = document.getElementById('game');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const muteBtn = document.getElementById('muteBtn');
const contrastBtn = document.getElementById('contrastBtn');

const loader = new AssetLoader();
const loadingIndicator = document.createElement('p'); // Indicador simple
loadingIndicator.textContent = 'Cargando assets...';
loadingIndicator.style.color = 'white';
document.body.appendChild(loadingIndicator);

loader.loadImage('player', './assets/player.png');
loader.loadImage('asteroid_S', './assets/asteroid_S.png');
loader.loadImage('asteroid_M', './assets/asteroid_M.png');
loader.loadImage('asteroid_L', './assets/asteroid_L.png');
loader.loadImage('powerup_life', './assets/powerup_life.png');
loader.loadImage('powerup_double', './assets/powerup_double.png');
loader.loadImage('powerup_shield', './assets/powerup_shield.png');
loader.loadImage('bullet', './assets/bullet.png');
loader.loadAudio('music', './assets/music.mp3');
// loader.loadImage('bullet', './assets/bullet.png');   // (Próximamente)

// Mueve la lectura de preferencias aquí para que esté disponible antes del SFX
const prefs = {
 muted: JSON.parse(localStorage.getItem('aw_muted') || 'false'),
 contrast: JSON.parse(localStorage.getItem('aw_contrast') || 'false'),
};

if (prefs.contrast) document.body.classList.add('contrast');

loader.loadAll().then((assets) => {
 document.body.removeChild(loadingIndicator); 
 
 // SFX y Game ahora se inicializan DESPUÉS de que los assets estén cargados.
 const sfx = new SFX({ muted: prefs.muted });
 const game = new Game(canvas, sfx, assets);
 game.setMusicMuted(prefs.muted);

// UI helpers
function updateMuteButton(){
 muteBtn.textContent = sfx.muted ? '🔇 Sonido: OFF' : '🔈 Sonido: ON';
 muteBtn.setAttribute('aria-pressed', sfx.muted ? 'true':'false');
}
function toggleOverlay(show){
 overlay.classList.toggle('hidden', !show);
 overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
}

updateMuteButton();
toggleOverlay(true);

startBtn.addEventListener('click', () => {
 toggleOverlay(false);
 canvas.focus();
 if (game.state === 'menu' || game.state === 'gameover') game.startNew();
 else game.resume();
});
pauseBtn.addEventListener('click', () => game.togglePause());

muteBtn.addEventListener('click', () => {
 sfx.setMuted(!sfx.muted);
 localStorage.setItem('aw_muted', JSON.stringify(sfx.muted));
 updateMuteButton();

 game.setMusicMuted(sfx.muted);
});
contrastBtn.addEventListener('click', () => {
 document.body.classList.toggle('contrast');
 const on = document.body.classList.contains('contrast');
 contrastBtn.setAttribute('aria-pressed', on ? 'true':'false');
 localStorage.setItem('aw_contrast', JSON.stringify(on));
});

// Accesos rápidos accesibles
window.addEventListener('keydown', (e) => {
 const k = e.key.toLowerCase();
 if (k === 'm'){ sfx.setMuted(!sfx.muted); localStorage.setItem('aw_muted', JSON.stringify(sfx.muted)); updateMuteButton(); game.setMusicMuted(sfx.muted); }
 if (k === 'h'){ document.body.classList.toggle('contrast'); const on=document.body.classList.contains('contrast'); contrastBtn.setAttribute('aria-pressed', on?'true':'false'); localStorage.setItem('aw_contrast', JSON.stringify(on)); }
 
});

// Comienza en menú
game.onShowMenu = () => { toggleOverlay(true); };
// No mostrar overlay al morir; solo el mensaje dibujado en el canvas
game.onGameOver = () => { toggleOverlay(false); };
game.startMenu();

}).catch(err => {
 console.error("No se pudieron cargar los assets iniciales.", err);
 loadingIndicator.textContent = 'Error al cargar. Refresca la página.';
});