# Especificación de Requisitos del Software (ERS) V2

## 1. Propósito

Definir la versión React de Minimarket La Esquina, continuación del sitio académico de la Prueba 1. El sistema representa la venta y administración simulada de un minimarket de una sola sucursal, con productos de alimentación, bebidas, snacks y hogar.

## 2. Alcance

La aplicación ofrece catálogo, categorías, productos en oferta, detalle de producto, contenidos institucionales y blogs, contacto, registro e inicio de sesión. El cliente puede mantener un carrito local, completar datos de entrega y probar resultados de pago aprobado o rechazado, sin pasarela ni datos bancarios.

El rol administrador accede a dashboard, operaciones CRUD de productos/categorías/usuarios, órdenes y su detalle, historial de compras, reportes y perfil. La persistencia se simula exclusivamente en `localStorage`; no hay servidor, API ni sincronización entre navegadores.

## 3. Usuarios

- Visitante: consulta productos, categorías, ofertas, información y blogs; puede registrarse.
- Cliente: inicia sesión, consulta el catálogo y usa el flujo simulado de carrito y compra.
- Administrador: gestiona datos simulados y consulta órdenes/reportes locales.
- Estudiante/evaluador: instala, ejecuta y revisa la aplicación y las pruebas.

## 4. Requisitos funcionales

- RF-01: mostrar una portada con identidad, información y productos destacados.
- RF-02: listar productos con imagen, nombre, categoría, precio y detalle; buscar y filtrar.
- RF-03: mostrar detalle del producto y stock disponible.
- RF-04: navegar por categorías y consultar productos asociados.
- RF-05: mostrar únicamente ofertas identificadas por el campo del producto.
- RF-06: validar RUN chileno, dominios de correo permitidos, contraseña de 4 a 10 caracteres, campos y límites antes del registro.
- RF-07: validar credenciales locales y distinguir roles en la sesión simulada.
- RF-08: conservar información de nosotros, contacto y los dos artículos de blog previos.
- RF-09: agregar, aumentar, disminuir, retirar y vaciar productos del carrito; calcular subtotales/total y respetar stock.
- RF-10: completar dirección de entrega con regiones y comunas locales dependientes.
- RF-11: registrar una orden simulada con identificador y detalle; el rechazo conserva el carrito, el éxito lo vacía y actualiza stock.
- RF-12: restringir rutas administrativas por una comprobación frontend de rol.
- RF-13: ofrecer operaciones CRUD locales para productos, categorías y usuarios, reflejadas en la UI.
- RF-14: consultar órdenes, boletas, historial y reportes derivados de datos guardados.
- RF-15: importar las claves compatibles con productos, usuarios y sesión de la Prueba 1.

## 5. Requisitos no funcionales

- RNF-01: interfaz adaptable con Bootstrap para celular, tablet y escritorio.
- RNF-02: navegación por rutas directas con React Router.
- RNF-03: separación comprensible entre presentación, estado compartido y fuente de datos.
- RNF-04: persistencia local después de recargar en el mismo navegador.
- RNF-05: suite ejecutable con Jasmine/Karma y comando documentado.
- RNF-06: no guardar datos bancarios ni afirmar que los roles o datos de navegador proporcionan seguridad de producción.
- RNF-07: no mostrar ventas reales inventadas; reportes únicamente basados en órdenes registradas.

## 6. Reglas y restricciones

- El comercio mantiene el nombre Minimarket La Esquina y una sola sucursal.
- Los dominios admitidos son `duoc.cl`, `profesor.duoc.cl` y `gmail.com`, conforme a la versión anterior.
- Precio y stock deben ser valores válidos; stock y stock crítico son enteros no negativos.
- Una categoría asociada a productos no se elimina hasta reasignar esos productos.
- El stock se vuelve a revisar al crear la orden; una orden aprobada descuenta unidades.
- La simulación es demostrativa: credenciales, rol, órdenes y datos residen en el navegador.

## 7. Herramientas y propuesta técnica

- JavaScript, React 18, React Router 6, Vite y Bootstrap 5.
- `src/data/tiendaData.js`: repositorio local, valores iniciales, validación, CRUD, carrito y órdenes.
- `src/components/StoreContext.jsx`: estado React compartido y actualización de las vistas tras mutaciones.
- `src/components/` y `src/pages/`: elementos comunes, formularios y vistas públicas/administrativas.
- Jasmine + Karma + jsdom: pruebas unitarias de componentes y operaciones del dominio.
- Vite: servidor local y bundle de producción.

No se configura una API ni se requiere base de datos de servidor. La comprobación de administrador solo evita la navegación accidental en el cliente; un producto real necesita autorización y persistencia en servidor.

## 8. Criterios de aceptación

- Las rutas públicas y administrativas previstas renderizan la vista asociada.
- Un producto de catálogo puede recorrer el carrito y checkout simulado; el resultado es consultable como orden.
- Los formularios rechazan los datos inválidos y muestran mensajes junto a la operación.
- CRUD modifica la fuente local y los componentes reflejan los cambios.
- Se conservan los recursos SVG y contenidos válidos de la versión anterior.
- `npm test` ejecuta Jasmine/Karma y `npm run build` produce el bundle de Vite.

## 9. Supuestos y limitaciones

Los datos están aislados por navegador. El administrador inicial es una credencial académica de demostración. La pauta y el Anexo 1 en PDF no estaban disponibles al elaborar este documento; verificar requisitos y nomenclatura directamente contra esos documentos antes de la entrega.