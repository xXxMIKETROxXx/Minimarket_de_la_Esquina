# Cobertura de pruebas Jasmine/Karma

## Estado de ejecución

El ejecutor está configurado en `karma.conf.cjs`; `npm.cmd test` compila las pruebas y las ejecuta mediante Jasmine/Karma en jsdom. Resultado real de la última ejecución: **21 de 21 pruebas aprobadas**.

## Casos implementados

| ID | Componente o funcionalidad | Caso de prueba | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| JAS-01 | `Home` | Montar la portada con Router y proveedor de tienda | Presenta texto principal, destacados e imagen principal | Se renderizaron título, destacados e imagen | Aprobada |
| JAS-02 | `ProductGrid` | Renderizar una lista recibida por props | Muestra nombre, categoría, oferta e imagen de producto | Se mostraron las propiedades e imagen recibidas | Aprobada |
| JAS-03 | `ProductCard` | Recibir un producto por props | Muestra nombre, categoría y precio formateado | Se mostró nombre, categoría y `$1.500` | Aprobada |
| JAS-04 | `ProductFilters` | Introducir texto en el buscador | Conserva coincidencias y excluye otros productos | Conservó leche y excluyó arroz | Aprobada |
| JAS-05 | `LoginForm` | Enviar correo/datos no admitidos | Presenta aviso accesible de validación | Se presentó el aviso con `role=alert` | Aprobada |
| JAS-06 | `ContactForm` | Cambiar campos y enviar contacto correcto | Refleja estado del campo y confirmación de envío | Campo actualizado y confirmación visible | Aprobada |
| JAS-07 | `AdminProductForm` | Enviar formulario de producto vacío | Muestra error y no agrega registro | Mostró error y no creó producto | Aprobada |
| JAS-08 | Fuente de datos | Validar producto correcto, negativo, decimal y vacío | Acepta datos válidos y rechaza los inválidos | Validaciones correctas para los cuatro casos | Aprobada |
| JAS-09 | CRUD de productos | Crear, actualizar y eliminar producto | Cada cambio aparece en la fuente persistida | Alta, edición y eliminación verificadas | Aprobada |
| JAS-10 | Carrito | Agregar unidades, leer subtotal/total y eliminar | Persiste cantidad, calcula monto y elimina al llegar a cero | Cantidad 3, total $3.570 y eliminación verificados | Aprobada |
| JAS-11 | Stock | Agregar más unidades que las disponibles | Lanza error y no altera el carrito | Se rechazó la cantidad superior al stock | Aprobada |
| JAS-12 | Compra aprobada | Crear orden desde el carrito | Registra orden, reduce stock y vacía carrito | Orden, descuento de stock y carrito vacío verificados | Aprobada |
| JAS-13 | Compra rechazada | Simular pago rechazado | Registra estado de error y conserva carrito | Orden rechazada y carrito conservado | Aprobada |
| JAS-14 | `PurchaseResult` exitoso | Renderizar ruta de orden aprobada | Muestra confirmación, id y estado | Confirmación, número y estado visibles | Aprobada |
| JAS-15 | `PurchaseResult` fallido | Renderizar ruta de orden rechazada | Muestra error, reintento y carrito persistente | Error, reintento y carrito visibles | Aprobada |
| JAS-16 | CRUD de productos | Intentar crear un identificador repetido | Rechaza duplicado y mantiene un único registro | Duplicado rechazado; registro original preservado | Aprobada |
| JAS-17 | Migración local | Leer productos/usuarios con claves de la versión anterior | Importa los datos y normaliza la comuna | Datos y comuna migrados a las nuevas claves | Aprobada |
| JAS-18 | Protección administrativa | Abrir `/admin` con una sesión de cliente | Redirige al inicio de sesión y no renderiza el panel | Login visible; panel administrativo ausente | Aprobada |
| JAS-19 | Sesión anterior | Migrar `usuarioActivo` y cerrar sesión | Migra la sesión una vez y no la restaura al salir | Sesión migrada y eliminada al cerrar sesión | Aprobada |
| JAS-20 | Detalle administrativo | Abrir el detalle de un producto existente | Muestra sus datos y enlace explícito a edición | Ficha y enlace de edición visibles | Aprobada |
| JAS-21 | Imágenes de productos | Comprobar JPG iniciales y migrar un SVG anterior | Asigna los ocho JPG y actualiza la imagen anterior | Mapeo completo y migración verificados | Aprobada |

Los resultados corresponden a la ejecución real de `npm.cmd test` en Karma/jsdom: `Executed 21 of 21 SUCCESS`.