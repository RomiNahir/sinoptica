// visualizador.js

// 🚀 SOLUCIÓN COMPATIBILIDAD ABSOLUTA: Lista fija de archivos de Abril de 2021 grabada en memoria
const listaCronologicaFija = [
  "10APR00Z2021.png", "10APR06Z2021.png", "10APR12Z2021.png", "10APR18Z2021.png",
  "11APR00Z2021.png", "11APR06Z2021.png", "11APR12Z2021.png", "11APR18Z2021.png",
  "12APR00Z2021.png", "12APR06Z2021.png", "12APR12Z2021.png", "12APR18Z2021.png",
  "13APR00Z2021.png"
];

// Mapeamos la base de datos aplicando las subcarpetas y prefijos de forma directa
const baseDeDatos = {
  altura500:   { ruta: "500/",         archivos: listaCronologicaFija.map(f => `HGT500_vort_${f}`) },
  altura250:   { ruta: "250/",         archivos: listaCronologicaFija.map(f => `Jet_${f}`) },
  superficie:  { ruta: "superficie/",  archivos: listaCronologicaFija.map(f => `HGT_espesores_${f}`) },
  omega:       { ruta: "omega/",       archivos: listaCronologicaFija.map(f => `omega_pres_${f}`) },
  divergencia: { ruta: "divergencia/", archivos: listaCronologicaFija.map(f => `divergencia950_${f}`) },
  
  adv1000:     { ruta: "advT1000/",    archivos: listaCronologicaFija.map(f => `advTempHGT1000_${f}`) },
  adv900:      { ruta: "advT900/",     archivos: listaCronologicaFija.map(f => `advTempHGT900_${f}`) },
  adv700:      { ruta: "advT700/",     archivos: listaCronologicaFija.map(f => `advTempHGT700_${f}`) },
  adv400:      { ruta: "advT400/",     archivos: listaCronologicaFija.map(f => `advTempHGT400_${f}`) },

  vort500:     { ruta: "advVort500/",  archivos: listaCronologicaFija.map(f => `advVort500_${f}`) },
  vort1000:    { ruta: "advVort1000/", archivos: listaCronologicaFija.map(f => `advVort1000_${f}`) }
};

let categoriaActual = null;
let indiceActual = 0;

let modoSplitActivo = false;
let modoCuatroActivo = false;
let modoVorticidadActivo = false; 

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

function cargarCategoria(categoria, elementoBoton) {
  desactivarModosEspeciales();
  document.getElementById('panel-izq').style.display = "flex";

  categoriaActual = baseDeDatos[categoria];
  capaSplitIzq = categoria;
  indiceActual = 0;
  
  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  if (elementoBoton) elementoBoton.classList.add('active');
  
  if(document.getElementById('home-cover')) document.getElementById('home-cover').style.display = 'none';
  document.getElementById('viewer').style.display = 'flex';

  const slider = document.getElementById('time-slider');
  slider.max = baseDeDatos[capaSplitIzq].archivos.length - 1;
  slider.value = 0;

  construirSegmentosLineaTiempo(); 
  actualizarImagen(0);
  resetearZoom(); 
}

function cargarModoCuatroPaneles(elementoBoton) {
  desactivarModosEspeciales();
  modoCuatroActivo = true;
  
  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  if (elementoBoton) elementoBoton.classList.add('active');
  
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

  construirSegmentosLineaTiempo(); 
  actualizarImagen(0);
  resetearZoom(); 
}

function cargarModoVorticidadPaneles(elementoBoton) {
  desactivarModosEspeciales();
  modoVorticidadActivo = true;

  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  if (elementoBoton) elementoBoton.classList.add('active');

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

  construirSegmentosLineaTiempo(); 
  actualizarImagen(0);
  resetearZoom();
}

function desactivarModosEspeciales() {
  pausarLoop(); 
  modoCuatroActivo = false;
  modoVorticidadActivo = false;
  
  const workspace = document.getElementById('workspace-id');
  workspace.classList.remove('modo-cuatro-activo');
  workspace.classList.remove('modo-vorticidad-activo');

  document.getElementById('panel-izq').style.display = "flex";
  document.getElementById('panel-der').style.display = modoSplitActivo ? "flex" : "none";
  
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
  if (document.getElementById('viewer').style.display === 'none') return;
  if (!categoriaActual || !categoriaActual.archivos || !categoriaActual.archivos.length) return;
  
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

  // Decodificación directa del formato temporal de los strings guardados
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
    actualizarImagen(0); 
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
    
    if(!categoriaActual) {
      categoriaActual = baseDeDatos[capaSplitIzq];
      construirSegmentosLineaTiempo();
    }
  } else {
    btn.innerText = "🔄 Comparar Campos"; btn.style.backgroundColor = "white"; btn.style.color = "var(--primary-color)";
    workspace.classList.remove('split-activo'); 
    document.getElementById('panel-izq').style.display = "flex";
    panelDer.style.display = "none";
  }
  
  document.getElementById('split-sel-izq').style.display = modoSplitActivo ? "block" : "none";
  const selectoresPanelDer = panelDer.querySelector('.selector-mapa-split');
  if(selectoresPanelDer) selectoresPanelDer.style.display = modoSplitActivo ? "block" : "none";

  if(document.getElementById('viewer').style.display === 'flex') {
    actualizarImagen(indiceActual); resetearZoom();
  }
}

function cambiarCapaSplit(lado, valor) {
  if (lado === 'izq') capaSplitIzq = valor;
  if (lado === 'der') capaSplitDer = valor;
  actualizarImagen(indiceActual);
}

function construirSegmentosLineaTiempo() {
  const contenedorTicks = document.getElementById('timeline-labels');
  if (!contenedorTicks || !categoriaActual) return;
  contenedorTicks.innerHTML = ""; 

  categoriaActual.archivos.forEach((nombreArchivo, idx) => {
    const dia = nombreArchivo.substring(nombreArchivo.indexOf("_") + 1, nombreArchivo.indexOf("_") + 3);
    const hora = nombreArchivo.substring(nombreArchivo.indexOf("_") + 6, nombreArchivo.indexOf("_") + 8);
    
    const elementoTick = document.createElement('span');
    elementoTick.className = 'time-tick';
    elementoTick.innerText = `${dia}-${hora}Z`;
    elementoTick.title = `Saltar al día ${dia} a las ${hora}:00 UTC`;
    
    elementoTick.addEventListener('click', () => {
      pausarLoop();
      actualizarImagen(idx);
    });
    
    contenedorTicks.appendChild(elementoTick);
  });
}

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
    }, 1000); 
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

window.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
  if (document.getElementById('viewer').style.display !== 'flex') return;

  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault(); pausarLoop(); cambiarPaso(-1);
      break;
    case 'ArrowRight':
      e.preventDefault(); pausarLoop(); cambiarPaso(1);
      break;
    case ' ':
      e.preventDefault(); togglePlayLoop();
      break;
    case 'h':
    case 'H':
      e.preventDefault(); volverAlHome();
      break;
  }
});

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

window.addEventListener('DOMContentLoaded', () => {
  volverAlHome(); 
});