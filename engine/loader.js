// engine/loader.js

export class AssetLoader {
  constructor() {
    this.assets = {};
    this.promises = [];
  }

  loadImage(name, src) {
    const img = new Image();
    img.src = src;
    
    const p = new Promise((resolve, reject) => {
      img.onload = () => {
        this.assets[name] = img;
        resolve(img);
      };
      img.onerror = (err) => {
        console.error(`Error cargando imagen: ${name} en ${src}`);
        reject(err);
      };
    });
    this.promises.push(p);
  }

  loadAudio(name, src) {
  const audio = new Audio(); // Crea un elemento <audio>
  audio.src = src;
  audio.preload = 'auto'; // Configura para precargar
  
  const p = new Promise((resolve, reject) => {
   audio.addEventListener('canplaythrough', () => {
    this.assets[name] = audio;
    resolve(audio);
   }, { once: true }); 

   audio.onerror = (err) => {
    console.error(`Error cargando audio: ${name} en ${src}`);
    reject(err);
   };
  });
  this.promises.push(p);
 }
  loadAll() {
    return Promise.all(this.promises)
      .then(() => this.assets)
      .catch((err) => {
        console.error("Fallo al cargar uno o más assets.", err);
        return this.assets; 
      });
  }
}