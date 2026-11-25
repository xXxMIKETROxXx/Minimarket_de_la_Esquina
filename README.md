# Minimarket La Esquina

## Descripción y objetivo

Aplicación académica de comercio y administración para un minimarket de una sola sucursal. Esta versión continúa la Prueba 1: conserva el nombre, las ilustraciones locales, catálogo y textos válidos; migra las vistas a React e incorpora carrito, checkout simulado y panel CRUD.

La información del proyecto se guarda en `localStorage`. No existe una API ni un backend en el repositorio. La autenticación, los roles y el pago son simulaciones de frontend y no deben utilizarse como seguridad o procesamiento de producción.

## Tecnologías

- React 18 con JavaScript y componentes funcionales.
- Vite para servidor de desarrollo y compilación.
- React Router 6 para rutas directas y navegación entre vistas.
- Bootstrap 5 y CSS propio para diseño adaptable.
- Jasmine y Karma para pruebas unitarias.
- `localStorage` como fuente de datos simulada.

No se usan TypeScript, Tailwind, Jest, Vitest ni endpoints inventados.

## Estructura

```text
src/
  App.jsx
  main.jsx
  components/
    Forms.jsx
    Layout.jsx
    StoreContext.jsx
  data/
    tiendaData.js
  pages/
    AdminPages.jsx
    PublicPages.jsx
  styles/
    style.css
  tests/
    components.spec.jsx
    runner.js
    store.spec.js
    testHelpers.jsx
img/                    Recursos SVG heredados de la Prueba 1
docs/
  ERS_V2.md
  cobertura-testing.md
```

## Vistas

Públicas: inicio, productos con búsqueda y categoría, detalle de producto, categorías, ofertas, registro, inicio de sesión, nosotros, blogs y sus dos artículos, contacto, carrito, checkout y resultados de pago exitoso o rechazado.

Administrativas: dashboard, CRUD de productos, CRUD de categorías, órdenes y detalle/boleta, usuarios con edición e historial de compras, reportes calculados y perfil.

## React, props y estado

`App.jsx` declara las rutas y protege `/admin/*` con el rol guardado de la sesión simulada. `StoreProvider` expone productos, categorías, usuarios, órdenes, carrito y sesión a las vistas; vuelve a leer los datos después de cada operación para sincronizar la interfaz con `localStorage`.

Componentes como `ProductGrid` entregan cada producto por `props` a `ProductCard`. Los campos, filtros y modo de pago usan `useState`; `useEffect` administra el aviso temporal. `tiendaData.js` separa las operaciones CRUD, validaciones, migración de datos, carrito y órdenes de la presentación.

## Datos simulados y migración

`src/data/tiendaData.js` inicializa productos y categorías de Minimarket La Esquina y ofrece operaciones para productos, categorías, usuarios, carrito, sesión y órdenes. Al primer acceso, intenta importar `productos`, `usuarios` y `usuarioActivo` desde las claves del sitio anterior. Los cambios permanecen en el navegador usado.

Cuenta administradora inicial para demostración: `admin@duoc.cl` / `admin1`. Cambia o elimina este acceso antes de cualquier demostración compartida. Las contraseñas se guardan en texto local porque no hay servidor; esto no es autenticación segura.

Las ofertas se determinan mediante el campo `oferta` de los productos. Los reportes usan exclusivamente órdenes almacenadas; los importes son simulados. El pago nunca solicita información bancaria. El resultado aprobado descuenta stock y vacía el carrito; el rechazado conserva el carrito. Ambos resultados se eligen en checkout.

## Instalación y ejecución

Requisito: Node.js 18 o posterior y npm disponibles en la terminal.

```bash
npm install
npm run dev
```

Vite muestra la URL local en la terminal. Comandos adicionales:

```bash
npm test
npm run build
npm run preview
```

`npm test` genera el bundle de pruebas y lo ejecuta en Karma con Jasmine y jsdom. No se debe instalar `node_modules` dentro del repositorio.

En Windows PowerShell, si la política del equipo bloquea `npm.ps1`, usa el lanzador `.cmd`; no necesitas cambiar la política de ejecución:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

## Pruebas

La suite incluye 21 casos Jasmine: renderizado de inicio y componentes con `props`, filtro de productos, interacción y validación de formularios, validación y CRUD, detalle administrativo, límites/cálculos del carrito, ambos resultados de compra, importación de datos/sesión e imágenes de la Prueba 1 y protección de rutas.

**Ejecución comprobada:** Jasmine/Karma ejecutó correctamente 20 de 20 pruebas en jsdom. `npm.cmd run build` completó correctamente. Consulta la matriz de [cobertura](docs/cobertura-testing.md) para el resultado de cada caso.

## Materiales de evaluación

Se revisó el Anexo 3 HTML y se consultaron ejemplos de componentes y datos del ZIP `mi-tienda`, sin copiar su negocio ni su stack. Los PDF de la pauta oficial y del Anexo 1 no estaban disponibles en el workspace ni en Descargas durante esta actualización. La implementación se basó en los requisitos detallados en la instrucción recibida; contrástala con los PDF antes de entregar.