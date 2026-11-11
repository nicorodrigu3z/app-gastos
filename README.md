# Mis gastos del mes

App web para llevar las finanzas del mes: cargar ingresos y gastos, ver en qué se va la plata y saber cuánto se puede ahorrar.

**👉 Probala online:** [nicorodrigu3z.github.io/app-gastos](https://nicorodrigu3z.github.io/app-gastos/)

Hecha con HTML, CSS y JavaScript puro: sin frameworks, sin librerías y sin instalar nada.

---

## Qué hace

- **Cargar ingresos y gastos** con fecha, descripción, monto y categoría.
  - Ingresos: Sueldo, Clases.
  - Gastos: Gasto fijo, Comida, Transporte, Ocio, Salud, Otros.
- **Gastos fijos** (alquiler, luz, internet…): al elegir "Gasto fijo" aparece un selector para indicar cuál es, con la opción de agregar nuevos. Como los montos cambian todos los meses, la app muestra **cuánto se pagó la última vez** como referencia.
- **Resumen por categoría**: cuánto se gastó en cada categoría del mes, con porcentaje y barra.
- **Meta de ahorro** (en una página aparte, "Mi ahorro"):
  - Ahorro posible = ingresos − gastos.
  - Si vas bien o te estás pasando de la meta.
  - Cuánto queda para gastar sin romper la meta.
  - La meta se define por mes y se mantiene en los meses siguientes hasta que la cambies.
- **Meses anteriores**: con las flechas ‹ › se navega entre meses para ver el historial.
- **Modo oscuro automático** y diseño adaptado a **celular y computadora**.

## Cómo usarla

**Online:** entrá al link de arriba.

**En tu compu:** descargá el proyecto (botón verde *Code → Download ZIP*), descomprimilo y abrí `index.html` con doble clic.

> Los datos se guardan en tu navegador (con `localStorage`), así que nadie más los ve. Si abrís la app en otro navegador o dispositivo, empieza vacía.

## Tecnologías

- **HTML** semántico (`<dl>`, `<details>`, roles ARIA en las pestañas).
- **CSS** con variables (custom properties), grid, flexbox, media queries para celular y `prefers-color-scheme` para el modo oscuro.
- **JavaScript** sin librerías: manejo del DOM, eventos, `localStorage`, `Intl.NumberFormat` para el formato de pesos argentinos y el evento `storage` para sincronizar las pestañas.

## Estructura del proyecto

```
├── index.html    Página principal: formulario de carga y lista del mes
├── ahorro.html   Página "Mi ahorro": resumen, meta y cuánto queda para gastar
├── estilos.css   Diseño (lo usan las dos páginas)
├── datos.js      Código compartido: guardar/leer datos, formatos, fechas y cálculos
├── app.js        Lógica de la página principal
├── ahorro.js     Lógica de la página de ahorro
└── icono.svg     Ícono de la pestaña
```

## Decisiones técnicas

- **Sin frameworks**: el objetivo era aprender las bases de la web antes de sumar herramientas.
- **Código compartido en `datos.js`**: las dos páginas usan las mismas funciones de datos y cálculo, así no se repite código.
- **La meta de ahorro se guarda como historial de cambios** (`[{ mes: "2026-10", monto: 200000 }, …]`): cada mes usa el último cambio hecho ese mes o antes. Así, cambiar la meta no modifica los meses pasados.
- **El mes viaja por la dirección** (`ahorro.html?mes=2026-10`), así "Mi ahorro" se abre en el mismo mes que estabas mirando.
- **Las pestañas se sincronizan solas**: si cargás un gasto con "Mi ahorro" abierta en otra pestaña, el resumen se actualiza sin recargar.
- **Accesibilidad**: foco visible al usar el teclado, contrastes revisados y mensajes que leen los lectores de pantalla (`aria-live`).

## Qué aprendí

Este es mi primer proyecto de programación. Lo armé por etapas: primero la carga de datos, después el guardado, los gastos fijos, el resumen por categoría, la meta de ahorro y la navegación entre meses. En el camino cambié varias veces de idea según cómo lo usaba de verdad (por ejemplo, los gastos fijos primero se sumaban solos y después pasaron a cargarse a mano, porque los montos aumentan todos los meses).
