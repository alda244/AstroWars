import { Game } from './src/game.js'; 
import { SFX } from './src/sfx.js';   
import { AssetLoader } from './engine/loader.js'; 

const canvas = document.getElementById('game');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
// const pauseBtn = document.getElementById('pauseBtn'); // ya no existe en overlay
const muteBtn = document.getElementById('muteBtn');     // puede no existir (ya no está en overlay)
const contrastBtn = document.getElementById('contrastBtn');
const gameUi = document.getElementById('game-ui');
const uiPauseBtn = document.getElementById('uiPauseBtn');
const uiMuteBtn  = document.getElementById('uiMuteBtn');
const uiMenuBtn  = document.getElementById('uiMenuBtn');

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
   if (muteBtn) {
     muteBtn.textContent = sfx.muted ? '🔇 Sonido: OFF' : '🔈 Sonido: ON';
     muteBtn.setAttribute('aria-pressed', sfx.muted ? 'true':'false');
   }
   if (uiMuteBtn) {
     uiMuteBtn.innerHTML = sfx.muted
       ? '<span class="icon">🔇</span><span class="label">Sonido: OFF</span>'
       : '<span class="icon">🔈</span><span class="label">Sonido: ON</span>';
     uiMuteBtn.setAttribute('aria-pressed', sfx.muted ? 'true':'false');
   }
 }
 function toggleOverlay(show){
   overlay.classList.toggle('hidden', !show);
   overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
   // Mostrar barra superior solo cuando no hay overlay (jugando/pausa)
   if (gameUi) gameUi.classList.toggle('hidden', show);
 }

 updateMuteButton();
 toggleOverlay(true);

 startBtn.addEventListener('click', () => {
   toggleOverlay(false);
   canvas.focus();
   if (game.state === 'menu' || game.state === 'gameover') game.startNew();
   else game.resume();
 });
 // if (pauseBtn) pauseBtn.addEventListener('click', () => game.togglePause()); // ya no hay pauseBtn en overlay

 if (muteBtn) {
   muteBtn.addEventListener('click', () => {
     sfx.setMuted(!sfx.muted);
     localStorage.setItem('aw_muted', JSON.stringify(sfx.muted));
     updateMuteButton();
     game.setMusicMuted(sfx.muted);
   });
 }
 contrastBtn.addEventListener('click', () => {
   document.body.classList.toggle('contrast');
   const on = document.body.classList.contains('contrast');
   contrastBtn.setAttribute('aria-pressed', on ? 'true':'false');
   localStorage.setItem('aw_contrast', JSON.stringify(on));
 });

 // Barra superior
 if (uiPauseBtn) uiPauseBtn.addEventListener('click', () => game.togglePause());
 if (uiMuteBtn)  uiMuteBtn.addEventListener('click', () => {
   sfx.setMuted(!sfx.muted);
   localStorage.setItem('aw_muted', JSON.stringify(sfx.muted));
   updateMuteButton();
   game.setMusicMuted(sfx.muted);
 });
 if (uiMenuBtn)  uiMenuBtn.addEventListener('click', () => { game.startMenu(); });

 // Accesos rápidos
 window.addEventListener('keydown', (e) => {
   const k = e.key.toLowerCase();
   if (k === 'm'){ sfx.setMuted(!sfx.muted); localStorage.setItem('aw_muted', JSON.stringify(sfx.muted)); updateMuteButton(); game.setMusicMuted(sfx.muted); }
   if (k === 'h'){ document.body.classList.toggle('contrast'); const on=document.body.classList.contains('contrast'); contrastBtn.setAttribute('aria-pressed', on?'true':'false'); localStorage.setItem('aw_contrast', JSON.stringify(on)); }
 });

 // Estado overlay/menú
 game.onShowMenu = () => { toggleOverlay(true); };
 // No mostrar overlay al morir; solo el mensaje dibujado en el canvas
 game.onGameOver = () => { toggleOverlay(false); };
 game.startMenu();

}).catch(err => {
 console.error("No se pudieron cargar los assets iniciales.", err);
 loadingIndicator.textContent = 'Error al cargar. Refresca la página.';
});