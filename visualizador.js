// visualizador.js

const baseDeDatos = {
  altura500: { ruta: "500/", archivos: generarNombres("HGT500_vort_") },
  altura250: { ruta: "250/", archivos: generarNombres("Jet_") },
  superficie: { ruta: "superficie/", archivos: generarNombres("HGT_espesores_") },
  omega: { ruta: "omega/", archivos: generarNombres("omega_pres_") },
  divergencia: { ruta: "divergencia/", archivos: generarNombres("divergencia950_") },
  
  adv1000: { ruta: "advT1000/", archivos: generarNombres("advTempHGT1000_") },
  adv900:  { ruta: "advT900/",  archivos: generarNombres("advTempHGT900_") },
  adv700:  { ruta: "advT700/",  archivos: generarNombres("advTempHGT700_") },
  adv400:  { ruta: "advT400/",  archivos: generarNombres("advTempHGT400_") },

  vort500:  { ruta: "advVort500/",  archivos: generarNombres("advVort500_") },
  vort1000: { ruta: "advVort1000/", archivos: generarNombres("advVort1000_") }
};

let categoriaActual = null;
let indiceActual = 0;

// Variables de Control de Modos de Pantalla
let modoSplitActivo = false;
let modoCuatroActivo = false;
let modoVorticidadActivo = false; 

// Variables para el Bucle de Reproducción Automática (Loop)
let reproductorIntervalo = null;
let animacionEnCurso = false;

let capaSplitIzq = "altura250";
let capaSplitDer = "omega";

const carpetasCuatro = ["adv1000", "adv900", "adv700", "adv400"];
const etiquetasCuatro = ["Nivel: 1000 hPa", "Nivel: 900 hPa", "Nivel: 700 hPa", "Nivel: 400 hPa"];

let escala = 1; let posX = 0; let posY = 0;
let estaArrastrando = false; let inicioX = 0; let inicioY = 0;

const mesesEsp = {
  "JAN": "Enero", "FEB": "Febrero", "MAR": "Marzo", "APR": "Abril", 
  "MAY": "Mayo", "JUN": "Junio", "JUL": "Julio", "AUG": "Agosto", 
  "SEP": "Septiembre", "OCT": "Octubre", "NOV": "Noviembre", "DEC": "Diciembre"
};

function cargarCategoria(categoria) {
  desactivarModosEspeciales();
  document.getElementById('panel-izq').style.display = "flex";

  categoriaActual = baseDeDatos[categoria];
  capaSplitIzq = categoria;
  
  indiceActual = 0;
  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  if(!modoSplitActivo && event && event.currentTarget) event.currentTarget.classList.add('active');

  if(document.getElementById('home-cover')) document.getElementById('home-cover').style.display = 'none';
  document.getElementById('viewer').style.display = 'flex';

  const slider = document.getElementById('time-slider');
  slider.max = baseDeDatos[capaSplitIzq].archivos.length - 1;
  slider.value = 0;

  construirSegmentosLineaTiempo(); // 🚀 Dibuja los bloques horarios
  actualizarImagen(0);
  resetearZoom(); 
}

function cargarModoCuatroPaneles() {
  desactivarModosEspeciales();
  modoCuatroActivo = true;
  
  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  if(event && event.currentTarget) event.currentTarget.classList.add('active');
  
  const workspace = document.getElementById('workspace-id');
  workspace.classList.add('modo-cuatro-activo');

  document.getElementById('panel-izq').style.display = "flex";
  document.getElementById('panel-der').style.display = "flex";
  document.getElementById('panel-inf-izq').style.display = "flex";
  document.getElementById('panel-inf-der').style.display = "flex";

  for (let i = 0; i < 4; i++) {
    document.getElementById(`badge-c${i+1}`).innerText = etiquetasCuatro[i];
  }

  if(document.getElementById('home-cover')) document.getElementById('home-cover').style.display = 'none';
  document.getElementById('viewer').style.display = 'flex';

  categoriaActual = baseDeDatos[carpetasCuatro[0]]; 
  const slider = document.getElementById('time-slider');
  slider.max = categoriaActual.archivos.length - 1; slider.value = 0;

  construirSegmentosLineaTiempo(); // 🚀 Dibuja los bloques horarios
  actualizarImagen(0);
  resetearZoom(); 
}

function cargarModoVorticidadPaneles() {
  desactivarModosEspeciales();
  modoVorticidadActivo = true;

  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  if(event && event.currentTarget) event.currentTarget.classList.add('active');

  const workspace = document.getElementById('workspace-id');
  workspace.classList.add('modo-vorticidad-activo');

  document.getElementById('panel-vort-izq').style.display = "flex";
  document.getElementById('panel-vort-der').style.display = "flex";

  document.getElementById('badge-v1').innerText = "Adv. Vorticidad: 500 hPa";
  document.getElementById('badge-v2').innerText = "Adv. Vorticidad: 1000 hPa";

  if(document.getElementById('home-cover')) document.getElementById('home-cover').style.display = 'none';
  document.getElementById('viewer').style.display = 'flex';

  categoriaActual = baseDeDatos["vort500"]; 
  const slider = document.getElementById('time-slider');
  slider.max = categoriaActual.archivos.length - 1; slider.value = 0;

  construirSegmentosLineaTiempo(); // 🚀 Dibuja los bloques horarios
  actualizarImagen(0);
  resetearZoom();
}

function desactivarModosEspeciales() {
  pausarLoop(); // Apaga la animación si cambiamos de modo
  modoCuatroActivo = false;
  modoVorticidadActivo = false;
  
  const workspace = document.getElementById('workspace-id');
  workspace.classList.remove('modo-cuatro-activo');
  workspace.classList.remove('modo-vorticidad-activo');

  document.getElementById('panel-izq').style.display = "none";
  document.getElementById('panel-der').style.display = "none";
  document.getElementById('panel-inf-izq').style.display = "none";
  document.getElementById('panel-inf-der').style.display = "none";
  document.getElementById('panel-vort-izq').style.display = "none";
  document.getElementById('panel-vort-der').style.display = "none";

  const btnSplit = document.getElementById('btn-toggle-split');
  if(!modoSplitActivo) {
    btnSplit.innerText = "🔄 Comparar Campos";
    btnSplit.style.backgroundColor = "white"; btnSplit.style.color = "var(--primary-color)";
    workspace.classList.remove('split-activo');
  }
}

function actualizarImagen(indice) {
  indiceActual = parseInt(indice);
  let archivoReferencia = "";

  if (modoCuatroActivo) {
    archivoReferencia = baseDeDatos[carpetasCuatro[0]].archivos[indiceActual];
    document.getElementById('mapa-img').src         = baseDeDatos[carpetasCuatro[0]].ruta + baseDeDatos[carpetasCuatro[0]].archivos[indiceActual];
    document.getElementById('mapa-img-der').src     = baseDeDatos[carpetasCuatro[1]].ruta + baseDeDatos[carpetasCuatro[1]].archivos[indiceActual];
    document.getElementById('mapa-img-inf-izq').src = baseDeDatos[carpetasCuatro[2]].ruta + baseDeDatos[carpetasCuatro[2]].archivos[indiceActual];
    document.getElementById('mapa-img-inf-der').src = baseDeDatos[carpetasCuatro[3]].ruta + baseDeDatos[carpetasCuatro[3]].archivos[indiceActual];
  } 
  else if (modoVorticidadActivo) {
    archivoReferencia = baseDeDatos["vort500"].archivos[indiceActual];
    document.getElementById('mapa-img-vort-izq').src = baseDeDatos["vort500"].ruta + baseDeDatos["vort500"].archivos[indiceActual];
    document.getElementById('mapa-img-vort-der').src = baseDeDatos["vort1000"].ruta + baseDeDatos["vort1000"].archivos[indiceActual];
  } 
  else {
    archivoReferencia = baseDeDatos[capaSplitIzq].archivos[indiceActual];
    document.getElementById('mapa-img').src = baseDeDatos[capaSplitIzq].ruta + archivoReferencia;
    if (modoSplitActivo) {
      const archivoDer = baseDeDatos[capaSplitDer].archivos[indiceActual];
      document.getElementById('mapa-img-der').src = baseDeDatos[capaSplitDer].ruta + archivoDer;
    }
  }

  if (typeof colorActual !== 'undefined' && colorActual !== "") colorActual = ""; 
  if (typeof inicializarCapaDibujo === 'function') setTimeout(inicializarCapaDibujo, 50);

  // Decodificación temporal
  const dia = archivoReferencia.substring(archivoReferencia.indexOf("_") + 1, archivoReferencia.indexOf("_") + 3);
  const mesTexto = archivoReferencia.substring(archivoReferencia.indexOf("_") + 3, archivoReferencia.indexOf("_") + 6).toUpperCase();
  const hora = archivoReferencia.substring(archivoReferencia.indexOf("_") + 6, archivoReferencia.indexOf("_") + 8);
  const anio = archivoReferencia.substring(archivoReferencia.indexOf("Z") + 1, archivoReferencia.indexOf("Z") + 5);
  
  const badge = document.getElementById('timestamp');
  if (mesesEsp[mesTexto]) {
    badge.innerText = `📅 ${dia} de ${mesesEsp[mesTexto]} de ${anio} - 🕒 ${hora}:00 UTC (Z)`;
  }
  
  document.getElementById('btn-prev').disabled = (indiceActual === 0);
  document.getElementById('btn-next').disabled = (indiceActual === categoriaActual.archivos.length - 1);
  document.getElementById('time-slider').value = indiceActual;

  // Sincroniza visualmente el bloque horario iluminado en la línea de tiempo
  document.querySelectorAll('.time-tick').forEach((tick, idx) => {
    if (idx === indiceActual) tick.classList.add('tick-activo');
    else tick.classList.remove('tick-activo');
  });
}

function cambiarPaso(direccion) {
  let nuevoIndice = indiceActual + direccion;
  if (nuevoIndice >= 0 && nuevoIndice < categoriaActual.archivos.length) {
    actualizarImagen(nuevoIndice);
  } else if (animacionEnCurso && nuevoIndice >= categoriaActual.archivos.length) {
    actualizarImagen(0); // Bucle circular continuo para la animación
  }
}

function togglePantallaDividida() {
  desactivarModosEspeciales();
  modoSplitActivo = !modoSplitActivo;
  
  const btn = document.getElementById('btn-toggle-split');
  const workspace = document.getElementById('workspace-id');
  const panelDer = document.getElementById('panel-der');

  if (modoSplitActivo) {
    btn.innerText = "🛑 Modo Único"; btn.style.backgroundColor = "#D84315"; btn.style.color = "white";
    workspace.classList.add('split-activo'); 
    document.getElementById('panel-izq').style.display = "flex";
    panelDer.style.display = "flex";
    if(!categoriaActual) categoriaActual = baseDeDatos[capaSplitIzq];
  } else {
    btn.innerText = "🔄 Comparar Campos"; btn.style.backgroundColor = "white"; btn.style.color = "var(--primary-color)";
    workspace.classList.remove('split-activo'); 
    document.getElementById('panel-izq').style.display = "flex";
    panelDer.style.display = "none";
  }
  
  if(document.getElementById('viewer').style.display === 'flex') {
    actualizarImagen(indiceActual); resetearZoom();
  }
}

function cambiarCapaSplit(lado, valor) {
  if (lado === 'izq') capaSplitIzq = valor;
  if (lado === 'der') capaSplitDer = valor;
  actualizarImagen(indiceActual);
}

// --- 🚀 NUEVA: CREACIÓN DINÁMICA DE BLOQUES HORARIOS ---
function construirSegmentosLineaTiempo() {
  const contenedorTicks = document.getElementById('timeline-labels');
  if (!contenedorTicks || !categoriaActual) return;
  contenedorTicks.innerHTML = ""; 

  categoriaActual.archivos.forEach((nombreArchivo, idx) => {
    // 🚀 SOLUCIÓN: Buscamos la posición de "APR" en el nombre del archivo, sea cual sea su largo
    const posMes = nombreArchivo.toUpperCase().indexOf("APR");
    
    let dia = "--";
    let hora = "--";
    
    if (posMes !== -1) {
      // El día son los 2 caracteres que están justo ANTES de "APR"
      dia = nombreArchivo.substring(posMes - 2, posMes);
      // La hora son los 2 caracteres que están justo DESPUÉS de "APR"
      hora = nombreArchivo.substring(posMes + 3, posMes + 5);
    }
    
    const elementoTick = document.createElement('span');
    elementoTick.className = 'time-tick';
    elementoTick.innerText = `${dia}-${hora}Z`; // Ahora sí va a armar "10-00Z", "11-06Z", etc.
    elementoTick.title = `Saltar al día ${dia} a las ${hora}:00 UTC`;
    
    elementoTick.addEventListener('click', () => {
      pausarLoop();
      actualizarImagen(idx);
    });
    
    contenedorTicks.appendChild(elementoTick);
  });
}

// --- 🚀 NUEVA: REPRODUCCIÓN AUTOMÁTICA (ANIMACIÓN LOOP) ---
function togglePlayLoop() {
  const btn = document.getElementById('btn-play-loop');
  if (animacionEnCurso) {
    pausarLoop();
  } else {
    animacionEnCurso = true;
    btn.innerText = "⏸️ Pausar";
    btn.style.backgroundColor = "#2E7D32"; btn.style.color = "white";
    reproductorIntervalo = setInterval(() => {
      cambiarPaso(1);
    }, 1000); // Velocidad crucero: cambia de mapa cada 1.0 segundos
  }
}

function pausarLoop() {
  const btn = document.getElementById('btn-play-loop');
  if (!btn) return;
  animacionEnCurso = false;
  btn.innerText = "▶️ Animación";
  btn.style.backgroundColor = "white"; btn.style.color = "var(--primary-color)";
  if (reproductorIntervalo) {
    clearInterval(reproductorIntervalo);
    reproductorIntervalo = null;
  }
}

// --- 🚀 NUEVA CONSOLA DE ATAJOS DE TECLADO ---
window.addEventListener('keydown', function(e) {
  // Ignoramos los atajos si el alumno está interactuando con listas desplegables
  if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
  
  // Evitamos capturar si el visualizador está completamente oculto (en la portada)
  if (document.getElementById('viewer').style.display !== 'flex') {
    // Excepción: Permitir la tecla H para pruebas o reactivación
    return;
  }

  switch(e.key) {
    case 'ArrowLeft': // ◀ Flecha Izquierda: Hora anterior
      e.preventDefault();
      pausarLoop();
      cambiarPaso(-1);
      break;
    case 'ArrowRight': // ▶ Flecha Derecha: Hora siguiente
      e.preventDefault();
      pausarLoop();
      cambiarPaso(1);
      break;
    case ' ': // Espacio: Play / Pausa del bucle
      e.preventDefault();
      togglePlayLoop();
      break;
    case 'h':
    case 'H': // Tecla H: Volver al Home principal
      e.preventDefault();
      volverAlHome();
      break;
  }
});

// --- INTERACCIÓN DE ZOOM Y ARRASTRE ESPEJADOS ---
const imgIzq = document.getElementById('mapa-img'); const imgDer = document.getElementById('mapa-img-der');
const imgInfIzq = document.getElementById('mapa-img-inf-izq'); const imgInfDer = document.getElementById('mapa-img-inf-der');
const imgVortIzq = document.getElementById('mapa-img-vort-izq'); const imgVortDer = document.getElementById('mapa-img-vort-der');

const contenidosContenedores = [
  document.getElementById('img-container'), document.getElementById('img-container-der'),
  document.getElementById('img-container-inf-izq'), document.getElementById('img-container-inf-der'),
  document.getElementById('img-container-vort-izq'), document.getElementById('img-container-vort-der')
];

function aplicarTransformacion() {
  const transfString = `translate(${posX}px, ${posY}px) scale(${escala})`;
  imgIzq.style.transform = transfString; imgDer.style.transform = transfString;
  imgInfIzq.style.transform = transfString; imgInfDer.style.transform = transfString;
  imgVortIzq.style.transform = transfString; imgVortDer.style.transform = transfString;
}

function resetearZoom() { escala = 1; posX = 0; posY = 0; aplicarTransformacion(); }

function coordinarZoom(e) {
  e.preventDefault(); const velocidadZoom = 0.1;
  if (e.deltaY < 0) escala += velocidadZoom; else escala -= velocidadZoom;
  escala = Math.max(1, Math.min(5, escala));
  if (escala === 1) { posX = 0; posY = 0; }
  aplicarTransformacion();
}
contenidosContenedores.forEach(c => c.addEventListener('wheel', coordinarZoom));

function iniciarArrastreEspejado(e) {
  if (escala === 1) return;
  estaArrastrando = true; inicioX = e.clientX - posX; inicioY = e.clientY - posY;
}
contenidosContenedores.forEach(c => c.addEventListener('mousedown', iniciarArrastreEspejado));

window.addEventListener('mousemove', function(e) {
  if (!estaArrastrando) return;
  posX = e.clientX - inicioX; posY = e.clientY - inicioY; aplicarTransformacion();
});
window.addEventListener('mouseup', function() { estaArrastrando = false; });

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar-id'); const boton = document.getElementById('btn-colapsar-sidebar');
  if (!sidebar || !boton) return;
  sidebar.classList.toggle('oculta'); boton.classList.toggle('oculto');
  boton.title = sidebar.classList.contains('oculta') ? "Mostrar barra lateral" : "Ocultar barra lateral";
  if (typeof inicializarCapaDibujo === 'function') setTimeout(inicializarCapaDibujo, 310);
}

function volverAlHome() {
  desactivarModosEspeciales(); if (modoSplitActivo) togglePantallaDividida();
  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  document.getElementById('home-cover').style.display = 'block';
  document.getElementById('viewer').style.display = 'none';
  resetearZoom();
}
