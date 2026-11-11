// ================================================================
// datos.js
// Código que comparten las dos páginas (index.html y ahorro.html):
// los datos guardados, cómo leerlos/guardarlos, formatos y cálculos.
// Se carga ANTES que app.js o ahorro.js, así ellos pueden usar todo lo de acá.
// ================================================================

// ================================================================
// DATOS
// ================================================================

// Movimientos cargados. Cada uno es un objeto así:
// { id, fecha: "2026-11-11", descripcion, monto, tipo: "gasto" | "ingreso", categoria }
// Si es un gasto fijo, además tiene "tipoFijo" (ej: "Alquiler").
let movimientos = [];

// Cambios de la meta de ahorro. Cada vez que definís la meta de un mes se guarda acá:
// [{ mes: "2026-11", monto: 200000 }, { mes: "2027-01", monto: 250000 }]
// La meta de un mes es la del último cambio hecho ese mes o antes (así se "arrastra").
let metas = [];

// Mes que estás mirando, como "AAAA-MM" (ej: "2026-10"). Arranca en el mes actual
// y cambia con las flechas ‹ ›. Todas las listas y cuentas usan este mes.
let mesVisible = mesActual();

// Nombres con los que guardamos cada lista en localStorage
const CLAVE_MOVIMIENTOS = "app-gastos-movimientos";
const CLAVE_TIPOS_FIJOS = "app-gastos-tipos-fijos";
const CLAVE_METAS = "app-gastos-metas";

// ================================================================
// FORMATOS Y FECHAS
// ================================================================

// Convierte un número en texto con formato de pesos argentinos.
// Ej: 1250000 -> "$ 1.250.000"   |   35000.5 -> "$ 35.000,50"
function formatearPesos(monto) {
  // Si el monto es redondo no mostramos decimales; si tiene centavos, mostramos siempre 2
  const decimales = Number.isInteger(monto) ? 0 : 2;
  const numeroFormateado = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(monto);
  return "$ " + numeroFormateado;
}

// Igual que formatearPesos, pero si el número es negativo le pone "−" adelante.
// Ej: -5000 -> "− $ 5.000"
function formatearPesosConSigno(monto) {
  return monto < 0 ? "− " + formatearPesos(-monto) : formatearPesos(monto);
}

// Devuelve la fecha de hoy como texto "AAAA-MM-DD" (el formato que usa el campo de fecha)
function fechaDeHoy() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Devuelve el mes actual como "AAAA-MM" (ej: "2026-11")
function mesActual() {
  return fechaDeHoy().slice(0, 7);
}

// Escribe un mes lindo: "2026-11" -> "Noviembre de 2026"
function textoDelMes(mes) {
  const [anio, numeroMes] = mes.split("-").map(Number);
  const texto = new Date(anio, numeroMes - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  // Ponemos en mayúscula solo la primera letra
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Suma (o resta, con números negativos) meses a un mes.
// Ej: sumarMeses("2026-12", 1) -> "2027-01"   |   sumarMeses("2026-01", -1) -> "2025-12"
function sumarMeses(mes, cantidad) {
  const [anio, numeroMes] = mes.split("-").map(Number);
  // new Date se encarga de pasar de año solo (el mes 13 es enero del año siguiente)
  const fecha = new Date(anio, numeroMes - 1 + cantidad, 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

// Lee el mes de la dirección de la página (ej: "ahorro.html?mes=2026-10").
// Si no hay mes, o no tiene el formato correcto, devuelve el mes actual.
function leerMesDeLaUrl() {
  const mes = new URLSearchParams(window.location.search).get("mes");
  // Revisamos que sea "AAAA-MM" con un mes del 01 al 12
  const esValido = mes !== null && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes);
  return esValido ? mes : mesActual();
}

// Convierte "2026-11-05" en "05/11/2026" para mostrarlo más lindo
function formatearFecha(fechaTexto) {
  const [anio, mes, dia] = fechaTexto.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Convierte "2026-10-31" en "octubre" (o "octubre de 2025" si es de otro año)
function nombreDelMes(fechaTexto) {
  const [anio, mes] = fechaTexto.split("-").map(Number);
  const mismoAnio = anio === new Date().getFullYear();
  return new Date(anio, mes - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: mismoAnio ? undefined : "numeric",
  });
}

// Genera un identificador único para cada movimiento (sirve para poder borrarlo)
function generarId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

// ================================================================
// GUARDAR Y LEER DATOS (localStorage)
// ================================================================

// Guarda cualquier lista en el navegador bajo un nombre (clave).
// localStorage solo guarda texto, así que convertimos la lista a texto con JSON.stringify.
function guardarEnNavegador(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
  } catch (error) {
    // Puede fallar si el navegador no deja guardar (ej: modo privado muy restrictivo)
    alert("No se pudieron guardar los datos en este navegador.");
  }
}

// Lee una lista guardada y la vuelve a convertir en array con JSON.parse.
// Si no hay nada guardado (o está dañado), devuelve "valorPorDefecto".
function leerDelNavegador(clave, valorPorDefecto) {
  try {
    const textoGuardado = localStorage.getItem(clave);
    if (textoGuardado === null) return valorPorDefecto;

    const datos = JSON.parse(textoGuardado);
    // Por seguridad, revisamos que lo guardado sea realmente una lista
    return Array.isArray(datos) ? datos : valorPorDefecto;
  } catch (error) {
    // Si lo guardado está dañado, arrancamos con el valor por defecto en vez de romper la app
    return valorPorDefecto;
  }
}

// Lee los movimientos y las metas guardados
function cargarDatos() {
  movimientos = leerDelNavegador(CLAVE_MOVIMIENTOS, []);
  metas = leerDelNavegador(CLAVE_METAS, []);
}

function guardarMovimientos() {
  guardarEnNavegador(CLAVE_MOVIMIENTOS, movimientos);
}

function guardarMetas() {
  guardarEnNavegador(CLAVE_METAS, metas);
}

// Si la app está abierta en dos pestañas y en una cambian los datos,
// el navegador le avisa a la otra con el evento "storage".
// Cuando pasa, volvemos a leer los datos y ejecutamos "alCambiar" para redibujar.
function escucharCambiosDeOtraPestana(alCambiar) {
  window.addEventListener("storage", (evento) => {
    // Solo nos interesan las claves de esta app
    if (evento.key === null || evento.key.startsWith("app-gastos-")) {
      cargarDatos();
      alCambiar();
    }
  });
}

// ================================================================
// CÁLCULOS
// ================================================================

// Devuelve solo los movimientos del mes que estás mirando
function movimientosDelMes() {
  return movimientos.filter((movimiento) => movimiento.fecha.slice(0, 7) === mesVisible);
}

// Devuelve la meta de un mes: la del último cambio hecho ese mes o antes.
// Si nunca definiste una meta, devuelve null.
function metaDelMes(mes) {
  // Nos quedamos con los cambios de ese mes o anteriores ("2026-10" < "2026-11" funciona porque son textos con el mismo formato)
  const anteriores = metas.filter((meta) => meta.mes <= mes);
  if (anteriores.length === 0) return null;

  // Ordenamos del más nuevo al más viejo y devolvemos el primero
  anteriores.sort((a, b) => b.mes.localeCompare(a.mes));
  return anteriores[0].monto;
}

// Hace todas las cuentas del mes.
// Ahorro posible = ingresos − gastos (fijos + variables)
// Disponible = ahorro posible − meta (lo que todavía podés gastar sin romper la meta)
function calcularAhorro() {
  let ingresos = 0;
  let gastos = 0;
  for (const movimiento of movimientosDelMes()) {
    if (movimiento.tipo === "ingreso") {
      ingresos += movimiento.monto;
    } else {
      gastos += movimiento.monto;
    }
  }

  const ahorroPosible = ingresos - gastos;
  const meta = metaDelMes(mesVisible);
  const disponible = meta === null ? null : ahorroPosible - meta;

  return { ingresos, gastos, ahorroPosible, meta, disponible };
}

// ================================================================
// APP INSTALADA EN EL CELULAR (PWA)
// ================================================================

// Devuelve true si la app se abrió desde el ícono instalado (pantalla completa)
// y false si se abrió en una pestaña del navegador.
function estaInstalada() {
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

// Registra el service worker (sw.js), que guarda una copia de la app para usarla sin internet.
// Solo funciona en una página web de verdad (https o localhost): si abrís index.html
// con doble clic, el navegador no lo permite y simplemente seguimos sin él.
if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {
    // Si falla, la app funciona igual (solo que sin modo sin conexión)
  });
}

// ================================================================
// NAVEGACIÓN ENTRE MESES (flechas ‹ › y "Volver a hoy")
// Las dos páginas tienen estos mismos botones en el encabezado.
// ================================================================

// Conecta las flechas. Cada vez que cambia el mes, ejecuta "alCambiarMes" para redibujar.
function prepararNavegacionMes(alCambiarMes) {
  const tituloMes = document.getElementById("titulo-mes");
  const botonAnterior = document.getElementById("mes-anterior");
  const botonSiguiente = document.getElementById("mes-siguiente");
  const botonHoy = document.getElementById("volver-a-hoy");

  // Escribe el mes en el título y muestra "Volver a hoy" solo si no estás en el mes actual
  function actualizarTitulo() {
    tituloMes.textContent = textoDelMes(mesVisible);
    botonHoy.hidden = mesVisible === mesActual();
  }

  function irAlMes(mesNuevo) {
    mesVisible = mesNuevo;
    actualizarTitulo();
    alCambiarMes();
  }

  botonAnterior.addEventListener("click", () => irAlMes(sumarMeses(mesVisible, -1)));
  botonSiguiente.addEventListener("click", () => irAlMes(sumarMeses(mesVisible, 1)));
  botonHoy.addEventListener("click", () => irAlMes(mesActual()));

  actualizarTitulo();
}
