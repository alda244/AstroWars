// // src/main.js
// import { Game } from './src/game.js';
// import { SFX } from './src/sfx.js';
// import { AssetLoader } from '../engine/loader.js';

// const canvas = document.getElementById('game');
// const overlay = document.getElementById('overlay');
// const startBtn = document.getElementById('startBtn');
// const pauseBtn = document.getElementById('pauseBtn');
// const muteBtn = document.getElementById('muteBtn');
// const contrastBtn = document.getElementById('contrastBtn');
// const loader = new AssetLoader();
// const loadingIndicator = document.createElement('p'); // Indicador simple
// loadingIndicator.textContent = 'Cargando assets...';
// loadingIndicator.style.color = 'white';
// document.body.appendChild(loadingIndicator);

// loader.loadImage('player', './assets/player.png');
// // loader.loadImage('asteroid', './assets/asteroid.png'); // (Próximamente)
// // loader.loadImage('bullet', './assets/bullet.png');   // (Próximamente)

// const prefs = {
//   muted: JSON.parse(localStorage.getItem('aw_muted') || 'false'),
//   contrast: JSON.parse(localStorage.getItem('aw_contrast') || 'false'),
// };

// if (prefs.contrast) document.body.classList.add('contrast');

// loader.loadAll().then((assets) => {
//   document.body.removeChild(loadingIndicator); 
//   const sfx = new SFX({ muted: prefs.muted });
//   const game = new Game(canvas, sfx, assets);

// // UI helpers
// function updateMuteButton(){
//   muteBtn.textContent = sfx.muted ? '🔇 Sonido: OFF' : '🔈 Sonido: ON';
//   muteBtn.setAttribute('aria-pressed', sfx.muted ? 'true':'false');
// }
// function toggleOverlay(show){
//   overlay.classList.toggle('hidden', !show);
//   overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
// }

// updateMuteButton();
// toggleOverlay(true);

// startBtn.addEventListener('click', () => {
//   toggleOverlay(false);
//   canvas.focus();
//   if (game.state === 'menu' || game.state === 'gameover') game.startNew();
//   else game.resume();
// });
// pauseBtn.addEventListener('click', () => game.togglePause());

// muteBtn.addEventListener('click', () => {
//   sfx.setMuted(!sfx.muted);
//   localStorage.setItem('aw_muted', JSON.stringify(sfx.muted));
//   updateMuteButton();
// });
// contrastBtn.addEventListener('click', () => {
//   document.body.classList.toggle('contrast');
//   const on = document.body.classList.contains('contrast');
//   contrastBtn.setAttribute('aria-pressed', on ? 'true':'false');
//   localStorage.setItem('aw_contrast', JSON.stringify(on));
// });

// // Accesos rápidos accesibles
// window.addEventListener('keydown', (e) => {
//   const k = e.key.toLowerCase();
//   if (k === 'm'){ sfx.setMuted(!sfx.muted); localStorage.setItem('aw_muted', JSON.stringify(sfx.muted)); updateMuteButton(); }
//   if (k === 'h'){ document.body.classList.toggle('contrast'); const on=document.body.classList.contains('contrast'); contrastBtn.setAttribute('aria-pressed', on?'true':'false'); localStorage.setItem('aw_contrast', JSON.stringify(on)); }
//   if (k === 'p'){ game.togglePause(); }
//   if (k === 'enter' && (game.state==='menu' || game.state==='gameover')){ toggleOverlay(false); game.startNew(); }
// });

// // Comienza en menú
// game.onShowMenu = () => { toggleOverlay(true); };
// game.onGameOver = () => { toggleOverlay(true); };
// game.startMenu();

// }).catch(err => {
//   console.error("No se pudieron cargar los assets iniciales.", err);
//   loadingIndicator.textContent = 'Error al cargar. Refresca la página.';
// });

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
 if (k === 'p'){ game.togglePause(); }
 if (k === 'enter' && (game.state==='menu' || game.state==='gameover')){ toggleOverlay(false); game.startNew(); }
});

// Comienza en menú
game.onShowMenu = () => { toggleOverlay(true); };
game.onGameOver = () => { toggleOverlay(true); };
game.startMenu();

// --- NUEVO: detección y activación de controles táctiles ---
const touchControls = document.getElementById('touchControls');
const touchStickEl = document.getElementById('touchStick');
const touchFireEl = document.getElementById('touchFire');

function showTouchControls() {
  if (!touchControls) return;
  touchControls.style.display = 'block'; // <- forzar visible (antes se dejaba '')
  touchControls.removeAttribute('aria-hidden');
  document.body.classList.add('using-touch');
}

// Si el dispositivo ya declara soporte touch, activamos de inmediato.
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
 showTouchControls();
} else {
 // Si no, activamos cuando ocurra el primer touch (soporta cambios dinámicos)
 const onFirstTouch = (e) => {
   showTouchControls();
   window.removeEventListener('touchstart', onFirstTouch, { passive:false });
 };
 window.addEventListener('touchstart', onFirstTouch, { passive:false });
}

// --- NUEVO: mantener la inicialización de listeners táctiles como estaba,
// pero solo si los elementos existen (esto ya permite que ambos inputs funcionen al mismo tiempo) ---
if (touchStickEl && touchFireEl) {
 let stickId = null;
 let stickCenter = null;
 const knob = touchStickEl.querySelector('.knob');

 function resetStick() {
   if (knob) knob.style.transform = 'translate(0px,0px)';
   ['arrowleft','arrowright','arrowup','arrowdown'].forEach(k => game.keys[k] = false);
   stickId = null; stickCenter = null;
 }

 function handleStickMove(clientX, clientY) {
   if (!stickCenter) return;
   const dx = (clientX - stickCenter.x) / (touchStickEl.clientWidth / 2);
   const dy = (clientY - stickCenter.y) / (touchStickEl.clientHeight / 2);
   const dead = 0.35;
   game.keys['arrowleft']  = dx < -dead;
   game.keys['arrowright'] = dx > dead;
   game.keys['arrowup']    = dy < -dead;
   game.keys['arrowdown']  = dy > dead;
   if (knob) {
     const max = 30;
     const tx = Math.max(-max, Math.min(max, dx * max));
     const ty = Math.max(-max, Math.min(max, dy * max));
     knob.style.transform = `translate(${tx}px, ${ty}px)`;
   }
 }

 touchStickEl.addEventListener('touchstart', (e) => {
   e.preventDefault();
   const t = e.changedTouches[0];
   stickId = t.identifier;
   const rect = touchStickEl.getBoundingClientRect();
   stickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
   handleStickMove(t.clientX, t.clientY);
 }, { passive:false });

 touchStickEl.addEventListener('touchmove', (e) => {
   e.preventDefault();
   for (const t of e.changedTouches) {
     if (t.identifier === stickId) handleStickMove(t.clientX, t.clientY);
   }
 }, { passive:false });

 touchStickEl.addEventListener('touchend', (e) => {
   for (const t of e.changedTouches) {
     if (t.identifier === stickId) resetStick();
   }
 }, { passive:false });

 touchStickEl.addEventListener('touchcancel', resetStick, { passive:false });

 // Botón de disparo (multitouch friendly)
 let fireId = null;
 touchFireEl.addEventListener('touchstart', (e) => {
   e.preventDefault();
   const t = e.changedTouches[0];
   fireId = t.identifier;
   game.keys[' '] = true; // espacio
   touchFireEl.classList.add('active');
 }, { passive:false });

 function onFireEnd(e) {
   for (const t of e.changedTouches) {
     if (t.identifier === fireId) {
       game.keys[' '] = false;
       touchFireEl.classList.remove('active');
       fireId = null;
     }
   }
 }
 touchFireEl.addEventListener('touchend', onFireEnd, { passive:false });
 touchFireEl.addEventListener('touchcancel', onFireEnd, { passive:false });

 // Limpieza si el canvas pierde foco (evita quedarse "pillado")
 window.addEventListener('blur', () => { resetStick(); game.keys[' '] = false; });
 }

}).catch(err => {
 console.error("No se pudieron cargar los assets iniciales.", err);
 loadingIndicator.textContent = 'Error al cargar. Refresca la página.';
});