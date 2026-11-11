// ================================================================
// sw.js — Service worker
// Es un script que el navegador ejecuta "por detrás" de la página.
// Guarda una copia de la app para que abra aunque no haya internet.
//
// Estrategia: "primero internet, si no hay, la copia guardada".
// Así, cuando subís cambios a GitHub, el celular los recibe solo
// la próxima vez que abrís la app con conexión.
// ================================================================

// Nombre de la "caja" donde guardamos la copia de la app
const NOMBRE_CACHE = "mis-gastos-v1";

// Archivos que forman la app (se guardan apenas se instala)
const ARCHIVOS_APP = [
  "./",
  "./index.html",
  "./ahorro.html",
  "./estilos.css",
  "./datos.js",
  "./app.js",
  "./ahorro.js",
  "./icono.svg",
  "./manifest.json",
  "./iconos/icono-180.png",
  "./iconos/icono-192.png",
  "./iconos/icono-512.png",
];

// 1) Instalación: guardamos todos los archivos de la app
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(NOMBRE_CACHE).then((cache) => cache.addAll(ARCHIVOS_APP))
  );
  // Activamos esta versión enseguida, sin esperar a que se cierre la app
  self.skipWaiting();
});

// 2) Activación: borramos copias de versiones viejas (si cambiamos NOMBRE_CACHE)
self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== NOMBRE_CACHE)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

// 3) Cada vez que la app pide un archivo
self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;

  const url = new URL(pedido.url);

  // La fuente Inter (Google Fonts) casi nunca cambia: usamos la copia si la hay
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    evento.respondWith(primeroCopia(pedido));
    return;
  }

  // Archivos de nuestra app: primero internet, si falla, la copia
  if (url.origin === self.location.origin) {
    evento.respondWith(primeroInternet(pedido));
  }
});

// Intenta bajar el archivo de internet y actualiza la copia.
// Si no hay conexión, devuelve la copia guardada.
async function primeroInternet(pedido) {
  const cache = await caches.open(NOMBRE_CACHE);
  try {
    const respuesta = await fetch(pedido);
    if (respuesta.ok) {
      // Guardamos sin el "?mes=..." para no llenar la caja de copias repetidas
      const url = new URL(pedido.url);
      url.search = "";
      cache.put(url.href, respuesta.clone());
    }
    return respuesta;
  } catch (error) {
    // ignoreSearch: "ahorro.html?mes=2026-10" usa la copia de "ahorro.html"
    const copia = await cache.match(pedido, { ignoreSearch: true });
    return copia || cache.match("./index.html");
  }
}

// Usa la copia guardada si existe; si no, la baja y la guarda.
async function primeroCopia(pedido) {
  const cache = await caches.open(NOMBRE_CACHE);
  const copia = await cache.match(pedido);
  if (copia) return copia;
  try {
    const respuesta = await fetch(pedido);
    cache.put(pedido, respuesta.clone());
    return respuesta;
  } catch (error) {
    // Sin internet y sin copia: la app usa la fuente del sistema
    return Response.error();
  }
}
