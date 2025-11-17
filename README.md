# 🚀 Astro Wars 🚀

¡Un *arcade shooter* clásico de HTML5, reinventado con una estética *Synthwave* y *Pixel Art*!

Este proyecto es una demo técnica construida desde cero con **JavaScript (ESM)**, **HTML5 Canvas** y la **Web Audio API**, cumpliendo con los requisitos del proyecto de Aplicaciones Web.

¡Defiende la galaxia (o al menos tu sector) de oleadas interminables de asteroides y consigue el *high score*!



---

## ✨ Características Principales

* **Estilo Pixel Art Nítido:** Gráficos 100% pixel art con carga de *spritesheets*.
* **Fondo Parallax:** Un campo de estrellas procedural con 3 capas de profundidad que se mueven a diferentes velocidades.
* **Audio Dinámico:**
    * Música de fondo cargada y reproducida con `<audio>`.
    * Efectos de sonido **procedurales** generados al vuelo con la **Web Audio API** (¡no se cargan archivos!).
* **Oleadas Infinitas:** La dificultad aumenta con cada oleada, generando más asteroides y más rápidos.
* **Poderes:** ¡3 power-ups distintos para cambiar el juego! (Disparo Doble, Escudo y Daño x2).
* **Persistencia:** El juego guarda tu **High Score** usando `localStorage`.
* **Alta Accesibilidad:** Incluye un modo de **Alto Contraste** y un botón de **Silencio** (Mute) que persiste entre sesiones.

---

## 🎮 Controles

| Tecla | Acción |
| :--- | :--- |
| **WASD** / **Flechas** | Mover la nave |
| **Espacio** | Disparar |
| **P** | Pausar / Continuar el juego |
| **M** | Activar / Desactivar Sonido (Mute) |
| **H** | Activar / Desactivar Alto Contraste |
| **Enter** | Iniciar el juego (desde el menú) |

---

## 🚀 Instrucciones de Ejecución

Este proyecto es 100% *Vanilla JS* y no requiere compilación. La única dependencia es un servidor web local (necesario para que los módulos `import` de JavaScript funcionen).

1.  Clona o descarga este repositorio.
2.  Abre una terminal en la carpeta raíz del proyecto.
3.  Inicia un servidor web estático. La forma más fácil es con la extensión **"Live Server"** de VSCode.
    * *Alternativamente, si tienes Node.js, puedes correr `npx http-server` en la carpeta.*
4.  Abre tu navegador en `http://localhost:8080` (o el puerto que te indique Live Server).
5.  ¡A jugar! 👾

---

## 🔧 Arquitectura Técnica

El juego sigue una estructura modular moderna, separando el "motor" del "juego".

* `index.html`: Define la "carcasa" de la aplicación. Contiene el `<canvas>` y el *overlay* del menú/UI (hecho en HTML/CSS para mejor accesibilidad).
* `style.css`: Define toda la estética, desde la paleta de colores *Synthwave* hasta la fuente *Pixel Art* (`Press Start 2P`) y los estilos de alto contraste.
* `main.js`: Es el **Director de Orquesta**.
    1.  Importa el `AssetLoader`.
    2.  Define la lista de *assets* (imágenes y audio) a cargar.
    3.  Muestra el "Cargando...".
    4.  Espera (`await`) a que `loader.loadAll()` termine.
    5.  Instancia `Game` y `SFX`, pasándoles los *assets* cargados.
    6.  Configura los *listeners* de los botones del menú (Iniciar, Mute, Contraste).
* `engine/loader.js`: Una clase simple que usa `Promise.all` para cargar múltiples *assets* (imágenes y audio) de forma asíncrona.
* `src/sfx.js`: Un módulo independiente que usa la **Web Audio API** para generar "beeps" y ruidos procedurales. Es responsable de todos los efectos de sonido (disparo, hit, explosión, etc.).
* `src/game.js`: ¡El **Corazón** del juego! Es una clase masiva que maneja:
    * **Game Loop:** Controlado por `_ensureLoop` -> `update(dt)` y `render()`.
    * **Manejo de Estado:** Una máquina de estados simple que controla si estás en `menu`, `playing`, `paused` o `gameover`.
    * **Renderizado:** Dibuja todo en el `<canvas>`, incluyendo el fondo parallax, los sprites rotados (jugador, asteroides, balas) y el HUD.
    * **Física y Colisiones:** Lógica simple de `circleHit` para todas las interacciones.
    * **Lógica de Juego:** Manejo de oleadas (`_startWave`), *spawning* de asteroides y *powerups* (`_spawnAsteroid`, `_spawnPowerup`).

---

## ✅ Checklist de Requisitos del Proyecto

* [x] **Arquetipo:** Arcade Shooter (Top-down).
* [x] **Game Loop y Estados:** Implementado (Menú, Pausa, Game Over).
* [x] **Loader:** Implementado en `engine/loader.js` para evitar bloqueos.
* [x] **Física/Colisiones:** Implementado (`circleHit`).
* [x] **UI/HUD:** Implementado (Menú en HTML, HUD en Canvas).
* [x] **Oleadas Crecientes:** Implementado (`_startWave`).
* [x] **Audio (Música + 2 efectos):** ¡Cumplido y superado! (1 pista de música + 6 efectos procedurales).
* [x] **Persistencia (High Score):** Implementado con `localStorage`.
* [x] **Rendimiento (≥45 FPS):** Optimizado (fondo procedural, `requestAnimationFrame`).
* [x] **Accesibilidad Mínima:** Implementado (Mute y Contraste).
* [x] **Código Modular:** ¡Hecho! (Separado en `main`, `game`, `sfx`, `loader`).
* [ ] **Controles Táctiles:** *Pendiente.*