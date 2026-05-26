f// generadores.js

function generarNombres(prefijo = "") {
  const lista = [];
  const año = "2021";
  const mes = "APR";
  const horas = ["00", "06", "12", "18"];

  // Iteramos del día 10 al 13
  for (let dia = 10; dia <= 13; dia++) {
    for (let h of horas) {
      // Si llegamos al día 13, cortamos después de las 12Z
      if (dia === 13 && h === "06") break; 
      
      const diaStr = dia.toString().padStart(2, '0'); // Asegura 2 caracteres (e.g., "10")
      lista.push(`${prefijo}${diaStr}${mes}${h}Z${año}.png`);
    }
  }
  return lista;
}
