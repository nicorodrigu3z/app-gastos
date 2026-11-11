// ================================================================
// ahorro.js
// Lógica de la página "Mi ahorro": muestra el resumen del mes y permite cambiar la meta.
// Usa funciones y datos de datos.js (que se carga antes).
// ================================================================

// ================================================================
// ELEMENTOS DE LA PÁGINA
// ================================================================
const enlaceVolver = document.getElementById("enlace-volver");
const resumenIngresos = document.getElementById("resumen-ingresos");
const resumenGastos = document.getElementById("resumen-gastos");
const resumenAhorro = document.getElementById("resumen-ahorro");
const resumenMeta = document.getElementById("resumen-meta");
const botonCambiarMeta = document.getElementById("boton-cambiar-meta");
const formularioMeta = document.getElementById("formulario-meta");
const campoMeta = document.getElementById("campo-meta");
const botonCancelarMeta = document.getElementById("boton-cancelar-meta");
const errorMeta = document.getElementById("error-meta");
const estadoMeta = document.getElementById("estado-meta");

// ================================================================
// RESUMEN
// ================================================================

// Dibuja el resumen del mes con la meta y el mensaje de cómo vas
function mostrarResumenAhorro() {
  const { ingresos, gastos, ahorroPosible, meta, disponible } = calcularAhorro();

  resumenIngresos.textContent = "+ " + formatearPesos(ingresos);
  resumenGastos.textContent = "− " + formatearPesos(gastos);
  resumenAhorro.textContent = formatearPesosConSigno(ahorroPosible);
  // Si el ahorro posible es negativo (gastaste más de lo que entró), lo mostramos en rojo
  resumenAhorro.className = ahorroPosible < 0 ? "monto-gasto" : "";

  // Un mes pasado ya terminó: el mensaje habla en pasado ("Cumpliste…", "No llegaste…")
  const esMesPasado = mesVisible < mesActual();

  if (meta === null) {
    // Todavía no hay meta
    resumenMeta.textContent = "sin definir";
    botonCambiarMeta.textContent = "definir";
    estadoMeta.textContent = "Definí una meta de ahorro para saber cuánto podés gastar en el mes.";
    estadoMeta.className = "estado-meta";
  } else {
    resumenMeta.textContent = formatearPesos(meta);
    botonCambiarMeta.textContent = "cambiar";

    if (disponible >= 0) {
      estadoMeta.textContent = esMesPasado
        ? `Cumpliste la meta: ahorraste ${formatearPesos(disponible)} de más.`
        : `Vas bien: te quedan ${formatearPesos(disponible)} para gastar en el mes sin romper la meta.`;
      estadoMeta.className = "estado-meta estado-bien";
    } else {
      estadoMeta.textContent = esMesPasado
        ? `No llegaste a la meta: te faltaron ${formatearPesos(-disponible)}.`
        : `Te pasaste: estás ${formatearPesos(-disponible)} por debajo de tu meta.`;
      estadoMeta.className = "estado-meta estado-mal";
    }
  }
}

// El link "← Mis gastos" vuelve al mismo mes que estás mirando
function actualizarEnlaceVolver() {
  enlaceVolver.href = "index.html?mes=" + mesVisible;
}

// ================================================================
// CAMBIAR LA META
// ================================================================

// Muestra el mini formulario para escribir la meta de este mes
function abrirFormularioMeta() {
  const metaActual = metaDelMes(mesVisible);
  campoMeta.value = metaActual === null ? "" : metaActual;
  formularioMeta.hidden = false;
  botonCambiarMeta.hidden = true;
  errorMeta.hidden = true;
  campoMeta.focus();
}

// Oculta el mini formulario sin guardar nada
function cerrarFormularioMeta() {
  formularioMeta.hidden = true;
  botonCambiarMeta.hidden = false;
  errorMeta.hidden = true;
}

// Guarda la meta para el mes que estás mirando (y, por arrastre, para los siguientes)
function guardarMeta(evento) {
  evento.preventDefault();

  const monto = Number(campoMeta.value);
  if (campoMeta.value === "" || !(monto >= 0)) {
    errorMeta.textContent = "Escribí un monto (puede ser 0).";
    errorMeta.hidden = false;
    return;
  }

  // La meta se guarda para el mes que estás mirando
  const mes = mesVisible;
  // Si ya había una meta para este mes la reemplazamos; si no, la agregamos
  metas = metas.filter((meta) => meta.mes !== mes);
  metas.push({ mes: mes, monto: monto });
  guardarMetas();

  cerrarFormularioMeta();
  mostrarResumenAhorro();
}

// ================================================================
// ARRANQUE DE LA PÁGINA
// ================================================================
function iniciar() {
  // Arrancamos en el mes que diga la dirección (ej: ahorro.html?mes=2026-10) o en el actual
  mesVisible = leerMesDeLaUrl();
  prepararNavegacionMes(() => {
    cerrarFormularioMeta();
    actualizarEnlaceVolver();
    mostrarResumenAhorro();
  });
  actualizarEnlaceVolver();

  cargarDatos();

  botonCambiarMeta.addEventListener("click", abrirFormularioMeta);
  botonCancelarMeta.addEventListener("click", cerrarFormularioMeta);
  formularioMeta.addEventListener("submit", guardarMeta);

  // Si cargás un gasto en la otra pestaña, este resumen se actualiza solo
  escucharCambiosDeOtraPestana(mostrarResumenAhorro);

  mostrarResumenAhorro();
}

iniciar();
