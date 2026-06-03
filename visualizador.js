// visualizador.js

// 🚀 EVENTO 1: Abril 2021
const listaAbril2021 = [
  "10APR00Z2021.png", "10APR06Z2021.png", "10APR12Z2021.png", "10APR18Z2021.png",
  "11APR00Z2021.png", "11APR06Z2021.png", "11APR12Z2021.png", "11APR18Z2021.png",
  "12APR00Z2021.png", "12APR06Z2021.png", "12APR12Z2021.png", "12APR18Z2021.png",
  "13APR00Z2021.png"
];

// 🚀 EVENTO 2: Noviembre de 2006 (Ciclo completo del 05 al 08 cada 6 horas)
const listaNoviembre2006 = [
  "2006110500.jpg", "2006110506.jpg", "2006110512.jpg", "2006110518.jpg",
  "2006110600.jpg", "2006110606.jpg", "2006110612.jpg", "2006110618.jpg",
  "2006110700.jpg", "2006110706.jpg", "2006110712.jpg", "2006110718.jpg",
  "2006110800.jpg", "2006110806.jpg", "2006110812.jpg", "2006110818.jpg"
];

// 🗄️ DICCIONARIO GLOBAL DE EVENTOS (Rutas actualizadas al nuevo contenedor 2006/)
const baseDeDatosGlobal = {
  'abril2021': {
    tituloSidebar: "📂 Abril de 2021",
    capas: {
      altura500:   { ruta: "500/",         archivos: listaAbril2021.map(f => `HGT500_vort_${f}`) },
      altura250:   { ruta: "250/",         archivos: listaAbril2021.map(f => `Jet_${f}`) },
      superficie:  { ruta: "superficie/",  archivos: listaAbril2021.map(f => `HGT_espesores_${f}`) },
      omega:       { ruta: "omega/",       archivos: listaAbril2021.map(f => `omega_pres_${f}`) },
      divergencia: { ruta: "divergencia/", archivos: listaAbril2021.map(f => `divergencia950_${f}`) },
      adv1000:     { ruta: "advT1000/",    archivos: listaAbril2021.map(f => `advTempHGT1000_${f}`) },
      adv900:      { ruta: "advT900/",     archivos: listaAbril2021.map(f => `advTempHGT900_${f}`) },
      adv700:      { ruta: "advT700/",     archivos: listaAbril2021.map(f => `advTempHGT700_${f}`) },
      adv400:      { ruta: "advT400/",     archivos: listaAbril2021.map(f => `advTempHGT400_${f}`) },
      vort500:     { ruta: "advVort500/",  archivos: listaAbril2021.map(f => `advVort500_${f}`) },
      vort1000:    { ruta: "advVort1000/", archivos: listaAbril2021.map(f => `advVort1000_${f}`) }
    }
  },
  'eventoNuevo': {
    tituloSidebar: "📂 Noviembre de 2006",
    capas: {
      // 🚀 CORREGIDO: Ahora apuntan adentro de la carpeta contenedora 2006/
      altura250:   { ruta: "2006/200/",    archivos: listaNoviembre2006.map(f => `200_Geop_Div_${f}`) }, 
      altura500:   { ruta: "2006/500/",    archivos: listaNoviembre2006.map(f => `500_Geop_Vort_${f}`) }, 
      superficie:  { ruta: "2006/1000/",   archivos: listaNoviembre2006.map(f => `1000_Geop_V_Esp_${f}`) } 
    }
  }
};

let baseDeDatosActual = null; 
let categoriaActual = null;
let indiceActual = 0;

let modoSplitActivo = false;
let modoCuatroActivo = false;
let modoVorticidadActivo = false; 
let modoTresActivo = false; 

let reproductorIntervalo = null;
let animacionEnCurso = false;

let capaSplitIzq = "altura250";
let capaSplitDer = "omega";

const carpetasCuatro = ["adv1000", "adv900", "adv700", "adv400"];
const etiquetasCuatro = ["Nivel: 1000 hPa", "Nivel: 900 hPa", "Nivel: 700 hPa", "Nivel: 400 hPa"];

let escala = 1; let posX = 0; let posY = 0;
let estaArrastrando = false; let inicioX = 0; let inicioY = 0;

const mesesEsp = {
  "APR": "Abril", "NOV": "Noviembre"
};

// ==========================================================
// 🚀 LÓGICA DE EVENTOS (LANDING PAGE DINÁMICA)
// ==========================================================
function seleccionarEvento(idEvento) {
  const evento = baseDeDatosGlobal[idEvento];
  baseDeDatosActual = evento.capas;
  
  document.getElementById('titulo-sidebar-evento').innerText = evento.tituloSidebar;
  document.getElementById('sidebar-id').style.display = 'flex';
  document.getElementById('btn-colapsar-sidebar').style.display = 'flex';

  if(document.getElementById('panel-ecuaciones')) document.getElementById('panel-ecuaciones').style.display = 'none';

  // Control adaptativo de botones según los campos disponibles
  if (idEvento === 'eventoNuevo') {
    document.getElementById('btn-250').innerText = "📁 Mapas de 200hPa";
    document.getElementById('btn-sup').innerText = "📁 Mapas de 1000hPa";
    
    document.getElementById('btn-omega').style.display = 'none';
    document.getElementById('btn-div').style.display = 'none';
    document.getElementById('btn-advT').style.display = 'none';
    document.getElementById('btn-advV').style.display = 'none';
    document.getElementById('btn-modo-3').style.display = 'block';
  } else {
    document.getElementById('btn-250').innerText = "📁 Mapas de 250hPa";
    document.getElementById('btn-sup').innerText = "📁 Mapas de superficie";
    
    document.getElementById('btn-omega').style.display = 'block';
    document.getElementById('btn-div').style.display = 'block';
    document.getElementById('btn-advT').style.display = 'block';
    document.getElementById('btn-advV').style.display = 'block';
    document.getElementById('btn-modo-3').style.display = 'none';
  }

  let botonSuperficie = document.getElementById('btn-sup');
  cargarCategoria('superficie', botonSuperficie);
}

function volverAlInicioAbsoluto() {
  desactivarModosEspeciales(); 
  if (modoSplitActivo) togglePantallaDividida();
  
  document.getElementById('home-cover').style.display = 'block';
  document.getElementById('viewer').style.display = 'none';
  if(document.getElementById('panel-ecuaciones')) document.getElementById('panel-ecuaciones').style.display = 'none';
  
  document.getElementById('sidebar-id').style.display = 'none';
  document.getElementById('btn-colapsar-sidebar').style.display = 'none';
  
  baseDeDatosActual = null;
  resetearZoom();
}

function mostrarEcuaciones() {
  desactivarModosEspeciales();
  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  
  if(document.getElementById('home-cover')) document.getElementById('home-cover').style.display = 'none';
  if(document.getElementById('viewer')) document.getElementById('viewer').style.display = 'none';
  
  const panelEcs = document.getElementById('panel-ecuaciones');
  if(panelEcs) panelEcs.style.display = 'block';
}

// ==========================================================
// 🌍 VISTAS ESPECIALES (MODO 3 PANELES SINCRONIZADOS)
// ==========================================================
function cargarModoTresPaneles(elementoBoton) {
  if (!baseDeDatosActual) return;
  desactivarModosEspeciales();
  modoTresActivo = true;
  
  if(document.getElementById('panel-ecuaciones')) document.getElementById('panel-ecuaciones').style.display = 'none';
  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  if (elementoBoton) elementoBoton.classList.add('active');
  
  const workspace = document.getElementById('workspace-id');
  workspace.classList.add('split-activo'); 
  workspace.style.display = 'flex';
  workspace.style.flexDirection = 'row';
  workspace.style.gap = '10px';

  document.getElementById('panel-izq').style.display = "flex";
  document.getElementById('panel-der').style.display = "flex";
  document.getElementById('panel-inf-izq').style.display = "flex";

  document.getElementById('badge-c1').innerText = "Nivel: 200 hPa";
  document.getElementById('badge-c2').innerText = "Nivel: 500 hPa";
  document.getElementById('badge-c3').innerText = "Nivel: 1000 hPa";

  if(document.getElementById('home-cover')) document.getElementById('home-cover').style.display = 'none';
  document.getElementById('viewer').style.display = 'flex';

  categoriaActual = baseDeDatosActual["altura500"]; 
  const slider = document.getElementById('time-slider');
  slider.max = categoriaActual.archivos.length - 1; slider.value = 0;

  construirSegmentosLineaTiempo(); 
  actualizarImagen(0);
  resetearZoom();
}

function cargarCategoria(categoria, elementoBoton) {
  if (!baseDeDatosActual) return;
  desactivarModosEspeciales();
  
  if(document.getElementById('panel-ecuaciones')) document.getElementById('panel-ecuaciones').style.display = 'none';
  document.getElementById('panel-izq').style.display = "flex";

  categoriaActual = baseDeDatosActual[categoria];
  capaSplitIzq = categoria;
  indiceActual = 0;
  
  document.querySelectorAll('.carpeta-boton').forEach(btn => btn.classList.remove('active'));
  if (elementoBoton) elementoBoton.classList.add('active');
  
  if(document.getElementById('home-cover')) document.getElementById('home-cover').style.display = 'none';
  document.getElementById('viewer').style.display = 'flex';

  const slider = document.getElementById('time-slider');
  slider.max = baseDeDatosActual[capaSplitIzq].archivos.length - 1;
  slider.value = 0;

  construirSegmentosLineaTiempo(); 
  actualizarImagen(0);
  resetearZoom(); 
}

function cargarModoCuatroPaneles(elementoBoton) {
  if (!baseDeDatosActual) return;
  desactivarModosEspeciales();
  modoCuatroActivo = true;
  
  if(document.getElementById('panel-ecuaciones')) document.getElementById('panel-ecuaciones').style.display = 'none';
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

  categoriaActual = baseDeDatosActual[carpetasCuatro[0]]; 
  const slider = document.getElementById('time-slider');
  slider.max = categoriaActual.archivos.length - 1; slider.value = 0;

  construirSegmentosLineaTiempo(); 
  actualizarImagen(0);
  resetearZoom(); 
}

function cargarModoVorticidadPaneles(elementoBoton) {
  if (!baseDeDatosActual) return;
  desactivarModosEspeciales();
  modoVorticidadActivo = true;

  if(document.getElementById('panel-ecuaciones')) document.getElementById('panel-ecuaciones').style.display = 'none';
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

  categoriaActual = baseDeDatosActual["vort500"]; 
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
  modoTresActivo = false;
  
  const workspace = document.getElementById('workspace-id');
  workspace.classList.remove('modo-cuatro-activo');
  workspace.classList.remove('modo-vorticidad-activo');
  workspace.classList.remove('split-activo');
  workspace.style.display = '';
  workspace.style.flexDirection = '';
  workspace.style.gap = '';

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
  }
}

function actualizarImagen(indice) {
  if (document.getElementById('viewer').style.display === 'none') return;
  if (!categoriaActual || !categoriaActual.archivos || !categoriaActual.archivos.length) return;
  
  indiceActual = parseInt(indice);
  let archivoReferencia = "";

  if (modoTresActivo) {
    archivoReferencia = baseDeDatosActual["altura500"].archivos[indiceActual];
    document.getElementById('mapa-img').src         = baseDeDatosActual["altura250"].ruta + baseDeDatosActual["altura250"].archivos[indiceActual];
    document.getElementById('mapa-img-der').src     = baseDeDatosActual["altura500"].ruta + baseDeDatosActual["altura500"].archivos[indiceActual];
    document.getElementById('mapa-img-inf-izq').src = baseDeDatosActual["superficie"].ruta + baseDeDatosActual["superficie"].archivos[indiceActual];
  } 
  else if (modoCuatroActivo) {
    archivoReferencia = baseDeDatosActual[carpetasCuatro[0]].archivos[indiceActual];
    document.getElementById('mapa-img').src         = baseDeDatosActual[carpetasCuatro[0]].ruta + baseDeDatosActual[carpetasCuatro[0]].archivos[indiceActual];
    document.getElementById('mapa-img-der').src     = baseDeDatosActual[carpetasCuatro[1]].ruta + baseDeDatosActual[carpetasCuatro[1]].archivos[indiceActual];
    document.getElementById('mapa-img-inf-izq').src = baseDeDatosActual[carpetasCuatro[2]].ruta + baseDeDatosActual[carpetasCuatro[2]].archivos[indiceActual];
    document.getElementById('mapa-img-inf-der').src = baseDeDatosActual[carpetasCuatro[3]].ruta + baseDeDatosActual[carpetasCuatro[3]].archivos[indiceActual];
  } 
  else if (modoVorticidadActivo) {
    archivoReferencia = baseDeDatosActual["vort500"].archivos[indiceActual];
    document.getElementById('mapa-img-vort-izq').src = baseDeDatosActual["vort500"].ruta + baseDeDatosActual["vort500"].archivos[indiceActual];
    document.getElementById('mapa-img-vort-der').src = baseDeDatosActual["vort1000"].ruta + baseDeDatosActual["vort1000"].archivos[indiceActual];
  } 
  else {
    archivoReferencia = baseDeDatosActual[capaSplitIzq].archivos[indiceActual];
    document.getElementById('mapa-img').src = baseDeDatosActual[capaSplitIzq].ruta + archivoReferencia;
    if (modoSplitActivo) {
      const archivoDer = baseDeDatosActual[capaSplitDer].archivos[indiceActual];
      document.getElementById('mapa-img-der').src = baseDeDatosActual[capaSplitDer].ruta + archivoDer;
    }
  }

  if (typeof colorActual !== 'undefined' && colorActual !== "") colorActual = ""; 
  if (typeof inicializarCapaDibujo === 'function') setTimeout(inicializarCapaDibujo, 50);

  // Decodificación Temporal Inteligente (Multiformato)
  const posMesRef = archivoReferencia.toUpperCase().indexOf("APR");
  let dia = "--", mesTexto = "APR", hora = "--", anio = "2021";
  
  if (posMesRef !== -1) {
    dia = archivoReferencia.substring(posMesRef - 2, posMesRef);
    hora = archivoReferencia.substring(posMesRef + 3, posMesRef + 5);
    anio = archivoReferencia.substring(posMesRef + 7, posMesRef + 11);
    mesTexto = "APR";
  } else {
    const match2006 = archivoReferencia.match(/2006\d{6}/);
    if (match2006) {
      const ts = match2006[0];
      anio = ts.substring(0, 4);
      mesTexto = "NOV"; 
      dia = ts.substring(6, 8);
      hora = ts.substring(8, 10);
    }
  }
  
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
      categoriaActual = baseDeDatosActual[capaSplitIzq];
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
    const posMes = nombreArchivo.toUpperCase().indexOf("APR");
    let dia = "--"; let hora = "--";
    
    if (posMes !== -1) {
      dia = nombreArchivo.substring(posMes - 2, posMes);
      hora = nombreArchivo.substring(posMes + 3, posMes + 5);
    } else {
      const match2006 = nombreArchivo.match(/2006\d{6}/);
      if (match2006) {
        const ts = match2006[0];
        dia = ts.substring(6, 8);
        hora = ts.substring(8, 10);
      }
    }
    
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
      e.preventDefault(); volverAlInicioAbsoluto();
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
contenidosContenedores.forEach(c => c.addEventListener('mousedown', inicioX));

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

window.addEventListener('DOMContentLoaded', () => {
  volverAlInicioAbsoluto(); 
});