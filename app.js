// ================================================================
// app.js
// Lógica de la página principal: formulario de carga, lista de movimientos
// y resumen por categoría. Usa funciones y datos de datos.js (que se carga antes).
// ================================================================

// ================================================================
// DATOS PROPIOS DE ESTA PÁGINA
// ================================================================

// Nombre de la categoría especial que despliega el selector "¿Cuál?"
const CATEGORIA_FIJO = "Gasto fijo";

// Categorías disponibles según el tipo de movimiento
const categorias = {
  ingreso: ["Sueldo", "Clases"],
  gasto: [CATEGORIA_FIJO, "Comida", "Transporte", "Ocio", "Salud", "Otros"],
};

// Tipos de gasto fijo con los que arranca la app (después podés sumar los tuyos)
const TIPOS_FIJOS_INICIALES = ["Alquiler", "Expensas", "Luz", "Gas", "Agua", "Internet", "Celular", "Suscripciones"];

// Valor especial de la opción "+ Agregar otro…" del selector "¿Cuál?"
const OPCION_AGREGAR = "__agregar__";

// Lista de tipos de gasto fijo (ej: ["Alquiler", "Luz", ...])
let tiposFijos = [];

// ================================================================
// ELEMENTOS DE LA PÁGINA (los buscamos una sola vez)
// ================================================================
const enlaceAhorro = document.getElementById("enlace-ahorro");

const formulario = document.getElementById("formulario-movimiento");
const campoTipo = document.getElementById("campo-tipo");
const campoCategoria = document.getElementById("campo-categoria");
const contenedorTipoFijo = document.getElementById("contenedor-tipo-fijo");
const campoTipoFijo = document.getElementById("campo-tipo-fijo");
const campoMonto = document.getElementById("campo-monto");
const referenciaFijo = document.getElementById("referencia-fijo");
const campoFecha = document.getElementById("campo-fecha");
const etiquetaDescripcion = document.getElementById("etiqueta-descripcion");
const campoDescripcion = document.getElementById("campo-descripcion");
const mensajeError = document.getElementById("mensaje-error");

const listaMovimientos = document.getElementById("lista-movimientos");
const listaVacia = document.getElementById("lista-vacia");

const pestanas = document.querySelectorAll(".pestana");
const listaCategorias = document.getElementById("lista-categorias");
const totalGastado = document.getElementById("total-gastado");
const categoriasVacia = document.getElementById("categorias-vacia");

// ================================================================
// FUNCIONES DE AYUDA
// ================================================================

// Llena un <select> con una lista de opciones
function llenarSelector(selector, opciones) {
  selector.innerHTML = "";
  for (const nombre of opciones) {
    const opcion = document.createElement("option");
    opcion.value = nombre;
    opcion.textContent = nombre;
    selector.appendChild(opcion);
  }
}

function guardarTiposFijos() {
  guardarEnNavegador(CLAVE_TIPOS_FIJOS, tiposFijos);
}

// Fecha con la que arranca el formulario:
// hoy si estás en el mes actual, o el día 1 del mes que estás mirando
function fechaPorDefecto() {
  return mesVisible === mesActual() ? fechaDeHoy() : `${mesVisible}-01`;
}

// Se ejecuta cada vez que cambiás de mes con las flechas
function alCambiarMes() {
  campoFecha.value = fechaPorDefecto();
  mensajeError.textContent = "";
  // El link a "Mi ahorro" lleva el mes que estás mirando
  enlaceAhorro.href = "ahorro.html?mes=" + mesVisible;
  mostrarTodo();
}

// ================================================================
// FORMULARIO: categorías y gasto fijo
// ================================================================

// Llena el selector de categorías según el tipo elegido (ingreso o gasto)
function actualizarCategorias() {
  llenarSelector(campoCategoria, categorias[campoTipo.value]);
  actualizarCampoFijo();
}

// Llena el selector "¿Cuál?" con los tipos de fijo + la opción "+ Agregar otro…"
function llenarTiposFijos(tipoElegido) {
  llenarSelector(campoTipoFijo, tiposFijos);

  const opcionAgregar = document.createElement("option");
  opcionAgregar.value = OPCION_AGREGAR;
  opcionAgregar.textContent = "+ Agregar otro…";
  campoTipoFijo.appendChild(opcionAgregar);

  if (tipoElegido) campoTipoFijo.value = tipoElegido;
}

// Muestra u oculta lo que es solo para gastos fijos, según la categoría elegida
function actualizarCampoFijo() {
  const esFijo = campoCategoria.value === CATEGORIA_FIJO;

  contenedorTipoFijo.hidden = !esFijo;
  // En un gasto fijo la descripción es opcional (si la dejás vacía, se usa el nombre del fijo)
  etiquetaDescripcion.textContent = esFijo ? "Descripción (opcional)" : "Descripción";
  campoDescripcion.placeholder = esFijo ? "Ej: Alquiler noviembre" : "Ej: Supermercado";

  actualizarReferencia();
}

// Escribe debajo del monto cuánto se pagó la última vez del fijo elegido
function actualizarReferencia() {
  const esFijo = campoCategoria.value === CATEGORIA_FIJO;
  if (!esFijo) {
    referenciaFijo.hidden = true;
    return;
  }

  // Buscamos el gasto más reciente de ese mismo fijo
  const anteriores = movimientos
    .filter((m) => m.categoria === CATEGORIA_FIJO && m.tipoFijo === campoTipoFijo.value)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (anteriores.length === 0) {
    referenciaFijo.textContent = "Todavía no cargaste este gasto fijo.";
  } else {
    const ultimo = anteriores[0];
    referenciaFijo.textContent = `Última vez: ${formatearPesos(ultimo.monto)} (${nombreDelMes(ultimo.fecha)})`;
  }
  referenciaFijo.hidden = false;
}

// Se llama cuando cambiás el selector "¿Cuál?"
function alCambiarTipoFijo() {
  if (campoTipoFijo.value === OPCION_AGREGAR) {
    agregarTipoFijo();
  }
  actualizarReferencia();
}

// Pide el nombre de un tipo de gasto fijo nuevo y lo agrega a la lista
function agregarTipoFijo() {
  const respuesta = prompt("¿Cómo se llama el nuevo gasto fijo? (ej: Gimnasio)");
  const nombre = respuesta === null ? "" : respuesta.trim();

  if (nombre === "") {
    // Canceló o no escribió nada: volvemos a la primera opción
    llenarTiposFijos(tiposFijos[0]);
    return;
  }

  // Si ya existe (sin importar mayúsculas), elegimos ese en vez de repetirlo
  const existente = tiposFijos.find((t) => t.toLowerCase() === nombre.toLowerCase());
  if (existente) {
    llenarTiposFijos(existente);
    return;
  }

  tiposFijos.push(nombre);
  guardarTiposFijos();
  llenarTiposFijos(nombre);
}

// ================================================================
// MOVIMIENTOS
// ================================================================

// Lee el formulario, valida los datos y agrega el movimiento a la lista
function agregarMovimiento(evento) {
  // Evita que el formulario recargue la página (es lo que hace por defecto)
  evento.preventDefault();
  // Por si antes había un aviso gris, volvemos al estilo normal de error (rojo)
  mensajeError.className = "mensaje-error";

  const esFijo = campoCategoria.value === CATEGORIA_FIJO;
  const tipoFijo = campoTipoFijo.value;
  let descripcion = campoDescripcion.value.trim();
  const monto = Number(campoMonto.value);

  // En un gasto fijo, si no escribiste descripción usamos el nombre del fijo
  if (esFijo && descripcion === "") {
    descripcion = tipoFijo;
  }

  // Validaciones básicas
  if (esFijo && (tipoFijo === "" || tipoFijo === OPCION_AGREGAR)) {
    mensajeError.textContent = "Elegí cuál es el gasto fijo.";
    return;
  }
  if (!(monto > 0)) {
    mensajeError.textContent = "El monto tiene que ser mayor a 0.";
    return;
  }
  if (campoFecha.value === "") {
    mensajeError.textContent = "Elegí una fecha.";
    return;
  }
  if (descripcion === "") {
    mensajeError.textContent = "Escribí una descripción.";
    return;
  }

  const nuevoMovimiento = {
    id: generarId(),
    fecha: campoFecha.value,
    descripcion: descripcion,
    monto: monto,
    tipo: campoTipo.value,
    categoria: campoCategoria.value,
  };
  if (esFijo) nuevoMovimiento.tipoFijo = tipoFijo;

  movimientos.push(nuevoMovimiento);
  guardarMovimientos();

  // Si la fecha es de otro mes, no va a aparecer en la lista: avisamos dónde se guardó
  const mesDelMovimiento = nuevoMovimiento.fecha.slice(0, 7);
  if (mesDelMovimiento !== mesVisible) {
    mensajeError.className = "mensaje-error aviso";
    // toLowerCase() pasa el mes a minúscula porque va en medio de la frase
    mensajeError.textContent = `Guardado en ${textoDelMes(mesDelMovimiento).toLowerCase()}. Usá las flechas ‹ › para verlo.`;
  } else {
    mensajeError.textContent = "";
  }

  // Limpiamos solo descripción y monto (lo demás queda para cargar más rápido)
  campoDescripcion.value = "";
  campoMonto.value = "";
  campoMonto.focus();

  mostrarTodo();
}

// Borra un movimiento de la lista usando su id
function borrarMovimiento(id) {
  const confirmado = confirm("¿Seguro que querés borrar este movimiento?");
  if (!confirmado) return;

  movimientos = movimientos.filter((movimiento) => movimiento.id !== id);
  guardarMovimientos();
  mostrarTodo();
}

// Vuelve a dibujar todo lo que depende de los datos (se usa cada vez que cambian)
function mostrarTodo() {
  actualizarReferencia();
  mostrarMovimientos();
  mostrarResumenPorCategoria();
}

// Dibuja en pantalla los movimientos del mes actual
function mostrarMovimientos() {
  // Ordenamos del más nuevo al más viejo
  const delMes = movimientosDelMes();
  delMes.sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Vaciamos la lista antes de volver a dibujarla
  listaMovimientos.innerHTML = "";

  for (const movimiento of delMes) {
    const item = document.createElement("li");
    item.className = "movimiento";

    // Info: descripción + fecha y categoría (y cuál fijo, si es un gasto fijo)
    const info = document.createElement("div");
    info.className = "movimiento-info";

    const descripcion = document.createElement("p");
    descripcion.className = "movimiento-descripcion";
    // Usamos textContent (y no innerHTML) para que el texto se muestre tal cual, sin riesgos
    descripcion.textContent = movimiento.descripcion;

    let textoDetalle = `${formatearFecha(movimiento.fecha)} · ${movimiento.categoria}`;
    // Si la descripción es distinta del nombre del fijo, mostramos cuál fijo es
    if (movimiento.tipoFijo && movimiento.tipoFijo !== movimiento.descripcion) {
      textoDetalle += ` · ${movimiento.tipoFijo}`;
    }
    const detalle = document.createElement("p");
    detalle.className = "movimiento-detalle";
    detalle.textContent = textoDetalle;

    info.appendChild(descripcion);
    info.appendChild(detalle);

    // Monto: verde con "+" si es ingreso, rojo con "−" si es gasto
    const monto = document.createElement("span");
    const esIngreso = movimiento.tipo === "ingreso";
    monto.className = "movimiento-monto " + (esIngreso ? "monto-ingreso" : "monto-gasto");
    monto.textContent = (esIngreso ? "+ " : "− ") + formatearPesos(movimiento.monto);

    // Botón para borrar
    const botonBorrar = document.createElement("button");
    botonBorrar.className = "boton-borrar";
    botonBorrar.textContent = "✕";
    botonBorrar.title = "Borrar movimiento";
    botonBorrar.setAttribute("aria-label", "Borrar " + movimiento.descripcion);
    botonBorrar.addEventListener("click", () => borrarMovimiento(movimiento.id));

    item.appendChild(info);
    item.appendChild(monto);
    item.appendChild(botonBorrar);
    listaMovimientos.appendChild(item);
  }

  // Si no hay movimientos, mostramos el mensaje de lista vacía
  listaVacia.style.display = delMes.length === 0 ? "block" : "none";
}

// ================================================================
// RESUMEN POR CATEGORÍA
// ================================================================

// Suma los gastos del mes por categoría.
// Devuelve una lista ordenada de mayor a menor, ej: [{ categoria: "Gasto fijo", total: 470000 }, ...]
function calcularGastosPorCategoria() {
  const gastos = movimientosDelMes().filter((m) => m.tipo === "gasto");

  // Usamos un objeto como "planilla": la clave es la categoría y el valor es lo que va sumando
  // Ej: { "Gasto fijo": 470000, "Comida": 80000 }
  const totales = {};
  for (const gasto of gastos) {
    if (totales[gasto.categoria] === undefined) {
      totales[gasto.categoria] = 0;
    }
    totales[gasto.categoria] += gasto.monto;
  }

  // Pasamos el objeto a una lista para poder ordenarla
  const resultado = [];
  for (const categoria in totales) {
    resultado.push({ categoria: categoria, total: totales[categoria] });
  }
  resultado.sort((a, b) => b.total - a.total);
  return resultado;
}

// Dibuja el resumen: cada categoría con su monto, porcentaje y barra
function mostrarResumenPorCategoria() {
  const porCategoria = calcularGastosPorCategoria();

  // Total gastado en el mes (sumamos los totales de todas las categorías)
  let total = 0;
  for (const fila of porCategoria) {
    total += fila.total;
  }

  listaCategorias.innerHTML = "";

  for (const fila of porCategoria) {
    // Qué parte del total es esta categoría (ej: 0.82 -> 82%)
    const porcentaje = (fila.total / total) * 100;

    const item = document.createElement("li");
    item.className = "categoria";

    // Fila de arriba: nombre, monto y porcentaje
    const filaTexto = document.createElement("div");
    filaTexto.className = "categoria-fila";

    const nombre = document.createElement("span");
    nombre.className = "categoria-nombre";
    nombre.textContent = fila.categoria;

    const monto = document.createElement("span");
    monto.className = "movimiento-monto";
    monto.textContent = formatearPesos(fila.total);

    const textoPorcentaje = document.createElement("span");
    textoPorcentaje.className = "categoria-porcentaje";
    textoPorcentaje.textContent = Math.round(porcentaje) + "%";

    filaTexto.appendChild(nombre);
    filaTexto.appendChild(monto);
    filaTexto.appendChild(textoPorcentaje);

    // Barra: el ancho de la parte negra es el porcentaje
    const barra = document.createElement("div");
    barra.className = "barra";
    const relleno = document.createElement("div");
    relleno.className = "barra-relleno";
    relleno.style.width = porcentaje + "%";
    barra.appendChild(relleno);

    item.appendChild(filaTexto);
    item.appendChild(barra);
    listaCategorias.appendChild(item);
  }

  // Total al final, o el mensaje de "no hay gastos"
  const hayGastos = porCategoria.length > 0;
  totalGastado.innerHTML = "";
  if (hayGastos) {
    const etiqueta = document.createElement("span");
    etiqueta.textContent = "Total gastado";
    const monto = document.createElement("span");
    monto.className = "monto-gasto";
    monto.textContent = formatearPesos(total);
    totalGastado.appendChild(etiqueta);
    totalGastado.appendChild(monto);
  }
  totalGastado.hidden = !hayGastos;
  categoriasVacia.hidden = hayGastos;
}

// ================================================================
// PESTAÑAS
// ================================================================

// Marca como activa la pestaña tocada y muestra su panel (y oculta el otro)
function cambiarPestana(pestanaElegida) {
  for (const pestana of pestanas) {
    const esLaElegida = pestana === pestanaElegida;
    pestana.classList.toggle("activa", esLaElegida);
    pestana.setAttribute("aria-selected", esLaElegida ? "true" : "false");
    // Cada pestaña sabe cuál es su panel gracias al atributo data-panel del HTML
    document.getElementById(pestana.dataset.panel).hidden = !esLaElegida;
  }
}

// ================================================================
// ARRANQUE DE LA APP
// ================================================================
function iniciar() {
  // Arrancamos en el mes que diga la dirección (si venís de "Mi ahorro") o en el actual
  mesVisible = leerMesDeLaUrl();
  prepararNavegacionMes(alCambiarMes);
  enlaceAhorro.href = "ahorro.html?mes=" + mesVisible;

  // En la app instalada no hay pestañas: "Mi ahorro" se abre en la misma pantalla
  // (si no, el celular la abriría en el navegador, fuera de la app)
  if (estaInstalada()) {
    enlaceAhorro.removeAttribute("target");
    enlaceAhorro.textContent = "Ver mi ahorro →";
  }

  // Recuperamos lo que se haya guardado la última vez
  cargarDatos();
  tiposFijos = leerDelNavegador(CLAVE_TIPOS_FIJOS, [...TIPOS_FIJOS_INICIALES]);

  // Preparamos el formulario
  campoFecha.value = fechaPorDefecto();
  llenarTiposFijos(tiposFijos[0]);
  actualizarCategorias();

  // Conectamos los eventos: qué pasa cuando el usuario hace algo
  campoTipo.addEventListener("change", actualizarCategorias);
  campoCategoria.addEventListener("change", actualizarCampoFijo);
  campoTipoFijo.addEventListener("change", alCambiarTipoFijo);
  formulario.addEventListener("submit", agregarMovimiento);
  for (const pestana of pestanas) {
    pestana.addEventListener("click", () => cambiarPestana(pestana));
  }

  // Si algo cambia en otra pestaña (ej: la página de ahorro), redibujamos
  escucharCambiosDeOtraPestana(() => {
    // También releemos los tipos de fijo, manteniendo el que estaba elegido
    const elegido = campoTipoFijo.value;
    tiposFijos = leerDelNavegador(CLAVE_TIPOS_FIJOS, [...TIPOS_FIJOS_INICIALES]);
    llenarTiposFijos(tiposFijos.includes(elegido) ? elegido : tiposFijos[0]);
    mostrarTodo();
  });

  mostrarTodo();
}

iniciar();
