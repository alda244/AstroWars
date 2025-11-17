import { Game } from './src/game.js'; 
import { SFX } from './src/sfx.js';   
import { AssetLoader } from './engine/loader.js'; 

const canvas = document.getElementById('game');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const muteBtn = document.getElementById('muteBtn');
const contrastBtn = document.getElementById('contrastBtn');
const howtoBtn = document.getElementById('howtoBtn');
const backBtn = document.getElementById('backBtn');
const menuBtn = document.getElementById('menuBtn')
const menuMain = document.getElementById('menu-main');
const menuHowto = document.getElementById('menu-howto');
const gameUI = document.getElementById('game-ui');
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
 muteBtn.textContent = sfx.muted ? '🔇 Sonido: OFF' : '🔈 Sonido: ON';
 muteBtn.setAttribute('aria-pressed', sfx.muted ? 'true':'false');
}
function toggleOverlay(show){
 overlay.classList.toggle('hidden', !show);
 overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
 gameUI.classList.toggle('hidden', show);
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

howtoBtn.addEventListener('click', () => {
    menuMain.classList.add('hidden');
    menuHowto.classList.remove('hidden');
  });

backBtn.addEventListener('click', () => {
    menuHowto.classList.add('hidden');
    menuMain.classList.remove('hidden');
  });
menuBtn.addEventListener('click', () => {
    game.startMenu(); 
  });
// Accesos rápidos accesibles
window.addEventListener('keydown', (e) => {
 const k = e.key.toLowerCase();
 if (k === 'm'){ sfx.setMuted(!sfx.muted); localStorage.setItem('aw_muted', JSON.stringify(sfx.muted)); updateMuteButton(); game.setMusicMuted(sfx.muted); }
 if (k === 'h'){ document.body.classList.toggle('contrast'); const on=document.body.classList.contains('contrast'); contrastBtn.setAttribute('aria-pressed', on?'true':'false'); localStorage.setItem('aw_contrast', JSON.stringify(on)); }
 
});

// Comienza en menú
game.onShowMenu = () => { toggleOverlay(true); };
game.onGameOver = () => { toggleOverlay(true); };

game.startMenu();

}).catch(err => {
 console.error("No se pudieron cargar los assets iniciales.", err);
 loadingIndicator.textContent = 'Error al cargar. Refresca la página.';
});