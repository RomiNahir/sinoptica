// herramientasDibujo.js

let lienzoCanvas = null;
let contextoLienzo = null;
let dibujando = false;
let colorActual = ""; 
let grosorLinea = 3;

// Cursor de precisión en forma de lápiz inclinado
const CURSOR_LAPIZ = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M0 32l12-4 18-18-8-8-18 18-4 12zM21 4l7 7-3 3-7-7 3-3z' fill='%23333'/></svg>") 0 32, crosshair`;

/**
 * Inicializa el lienzo de dibujo sobre el mapa izquierdo
 */
function inicializarCapaDibujo() {
  const wrapper = document.getElementById('img-container');
  if (!wrapper) return;

  const canvasViejo = document.getElementById('capa-dibujo');
  if (canvasViejo) canvasViejo.remove();

  lienzoCanvas = document.createElement('canvas');
  lienzoCanvas.id = 'capa-dibujo';
  
  lienzoCanvas.style.position = 'absolute';
  lienzoCanvas.style.top = '0';
  lienzoCanvas.style.left = '0';
  lienzoCanvas.style.width = '100%';
  lienzoCanvas.style.height = '100%';
  lienzoCanvas.style.zIndex = '5'; 
  
  if (colorActual === "") {
    lienzoCanvas.style.cursor = 'default';
  } else {
    lienzoCanvas.style.cursor = CURSOR_LAPIZ;
  }

  lienzoCanvas.width = wrapper.clientWidth;
  lienzoCanvas.height = wrapper.clientHeight;

  wrapper.appendChild(lienzoCanvas);
  contextoLienzo = lienzoCanvas.getContext('2d');

  lienzoCanvas.addEventListener('mousedown', iniciarTrazo);
  lienzoCanvas.addEventListener('mousemove', dibujarTrazo);
  window.addEventListener('mouseup', detenerTrazo);
}

function iniciarTrazo(e) {
  if (colorActual === "") return;
  if (typeof escala !== 'undefined' && escala > 1) return; // Candado clásico de zoom
  
  dibujando = true;
  contextoLienzo.beginPath();
  const rect = lienzoCanvas.getBoundingClientRect();
  contextoLienzo.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function dibujarTrazo(e) {
  if (!dibujando) return;
  
  const rect = lienzoCanvas.getBoundingClientRect();
  contextoLienzo.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  
  contextoLienzo.strokeStyle = colorActual;
  contextoLienzo.lineWidth = grosorLinea;
  contextoLienzo.lineCap = 'round';
  contextoLienzo.stroke();
}

function detenerTrazo() {
  dibujando = false;
}

// --- ACCIONES DE PALETA ---
function cambiarColorDibujo(nuevoColor) {
  colorActual = nuevoColor;
  if (lienzoCanvas) {
    lienzoCanvas.style.cursor = CURSOR_LAPIZ;
  }
}

function borrarDibujo() {
  if (contextoLienzo && lienzoCanvas) {
    contextoLienzo.clearRect(0, 0, lienzoCanvas.width, lienzoCanvas.height);
    colorActual = "";
    lienzoCanvas.style.cursor = 'default';
  }
}

/**
 * 💾 IMPRESIÓN / EXPORTACIÓN PDF LOCAL COMPATIBLE
 */
function descargarMapaConTrazos() {
  const mapaImg = document.getElementById('mapa-img');
  if (!mapaImg || !mapaImg.src || mapaImg.src === "") {
    alert("No hay ningún mapa cargado para guardar.");
    return;
  }
  
  window.print();
}
