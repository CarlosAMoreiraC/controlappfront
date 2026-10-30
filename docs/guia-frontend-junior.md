# Guía sencilla del frontend

Esta guía explica cómo se conectan las piezas principales del frontend. La idea
es poder seguir el recorrido desde el contrato de la API hasta una pantalla.

## 1. El contrato y los tipos

### `api-contract.yaml`

Es la descripción de la API del backend: qué rutas existen, qué datos reciben y
qué respuestas pueden devolver. Es la fuente de verdad; el frontend no debe
inventar rutas ni duplicar las reglas de negocio.

### `src/shared/api/generated/schema.d.ts`

Este archivo se genera desde el contrato con `npm run api:generate`. Contiene
tipos de TypeScript para las rutas, parámetros y respuestas.

Por ejemplo, TypeScript puede conocer la forma de la respuesta de
`GET /api/v1/sites`. El archivo termina convertido en tipos al compilar: no hace
una solicitud HTTP y tampoco valida los datos recibidos mientras la aplicación
se ejecuta. No se debe editar a mano; se vuelve a generar cuando cambia el
contrato.

## 2. El cliente HTTP

### `src/shared/api/client.ts`

Exporta `apiClient`, el cliente compartido para las solicitudes HTTP. Se crea con
el tipo `paths` generado:

```ts
const apiClient = createClient<paths>({ baseUrl: '' })
```

La conexión entre `paths` y el cliente permite que TypeScript compruebe que una
ruta, sus parámetros y su respuesta coinciden con el contrato. `baseUrl: ''`
significa que las solicitudes usan el mismo origen de la aplicación; en
desarrollo, Vite reenvía `/api` al backend local.

Cuando una feature necesite consultar sedes, por ejemplo, utilizará este cliente
en su módulo de API. Los componentes no deberían llamar `fetch` directamente.

### Middleware de errores

El middleware es una función que observa las respuestas antes de que lleguen al
código que hizo la solicitud:

- Si la respuesta es exitosa, la deja continuar.
- Si el servidor devuelve un error HTTP, lee el cuerpo, lo convierte en un
  `ApiError` y muestra una notificación global.
- Si la solicitud no logra conectarse, muestra un mensaje de conexión y entrega
  también un `ApiError`.

La notificación sirve para informar al usuario. El error lanzado sigue
disponible para que la pantalla o el hook que hizo la solicitud decida cómo
continuar. `error-notification-guard.ts` evita repetir la misma notificación
(mismo código HTTP y mensaje) durante cinco segundos. Esto es útil cuando varias
consultas fallan al mismo tiempo.

En `main.tsx`, TanStack Query no reintenta errores HTTP 4xx. Para otros errores,
como un fallo temporal de red o un 5xx, permite un reintento. Esto reduce
solicitudes y notificaciones repetidas sin ocultar errores distintos.

### `src/shared/api/errors.ts`

Define `ApiError`, una clase basada en el `Error` estándar de JavaScript. Añade
dos datos útiles:

- `status`: el estado HTTP, como `400` o `404`.
- `fieldErrors`: un mapa de nombres de campos a mensajes, por ejemplo
  `{ name: 'must not be blank' }`.

La función `createApiError` interpreta los dos formatos que describe el
contrato: `ErrorResponse` y `ProblemDetail`. Para el mensaje visible usa el
detalle del servidor cuando está disponible, los mensajes de validación en su
defecto y, después, el título del error.

`fieldErrors` puede enviarse a un formulario Mantine con `form.setErrors(...)`.
Así el usuario ve el error junto al campo correspondiente, además de la
notificación global.

## 3. Usuario, roles y menú

### `src/auth/types.ts` y `src/auth/hooks/use-current-user.ts`

`Role` limita los roles posibles a `ADMIN`, `SUPERVISOR`, `OPERATOR`,
`SALES_REP` y `DRIVER`. `CurrentUser` describe los datos que la interfaz conoce
del usuario.

Por ahora, `useCurrentUser()` devuelve una administradora fija. Es una solución
**TEMPORAL** mientras no exista login; más adelante el usuario deberá venir del
mecanismo real de autenticación.

### `src/app/navigation/menu.ts`

Es la lista declarativa del menú. Cada opción tiene clave, texto, ruta, icono y
roles permitidos. `filterMenuByRole(role)` devuelve solo las opciones que puede
ver ese rol:

| Opción            | Roles visibles              |
| ----------------- | --------------------------- |
| Inicio            | Todos los roles definidos   |
| Sedes             | ADMIN, SUPERVISOR           |
| Bodegas           | ADMIN, SUPERVISOR           |
| Clientes          | ADMIN, SUPERVISOR, OPERATOR |
| Tipos de cliente  | ADMIN                       |
| Productos         | ADMIN, SUPERVISOR           |
| Listas de precios | ADMIN, SUPERVISOR           |

Ocultar una opción solo ordena la interfaz: **no es una medida de seguridad**.
El backend debe autorizar cada operación.

## 4. Router y layout

### `src/app/app-router.tsx`

Es el encargado de relacionar las rutas del navegador con las páginas de React.
Consulta el rol actual, filtra el menú y crea rutas solo para las opciones
permitidas. Si se navega a una ruta no disponible, vuelve a Inicio.

Las páginas usan `lazy()` y `Suspense`: el código de cada sección se descarga
cuando hace falta, en vez de incluir todas las páginas desde el primer momento.
Las features se importan a través de su `index.ts`, que funciona como su entrada
pública.

### `src/app/layout/admin-layout.tsx`

Es la estructura compartida alrededor de las páginas:

- En escritorio muestra una barra lateral que se puede plegar.
- En móvil la navegación aparece en un menú lateral izquierdo.
- La cabecera muestra la ruta, el nombre y el rol temporal.
- `<Outlet />` es el espacio donde React Router dibuja la página seleccionada.

El menú móvil usa un drawer izquierdo para navegación. Los formularios de alta y
edición usan un drawer contextual derecho, separado de la navegación.

### `src/App.tsx` y `src/main.tsx`

`App.tsx` monta el router. `main.tsx` inicia React y envuelve la aplicación con
Mantine, además de montar el contenedor global de notificaciones.

## 5. Recorrido completo

Al abrir una ruta, el recorrido simplificado es:

1. `main.tsx` inicia React y Mantine.
2. `App.tsx` monta `AppRouter`.
3. `AppRouter` lee el rol temporal y consulta `menu.ts`.
4. React Router elige la página autorizada y la carga bajo demanda.
5. `AdminLayout` dibuja la navegación y la cabecera; `<Outlet />` muestra la
   página.
6. La página usa un hook de TanStack Query para consultar o modificar datos.
7. El hook llama al módulo de API de su feature; ese módulo usa `apiClient`.
8. `apiClient` devuelve datos tipados según `schema.d.ts` o convierte un error
   del servidor en `ApiError` y muestra una notificación no duplicada.
9. Cuando una mutación tiene éxito, el hook invalida la consulta relacionada
   para que TanStack Query vuelva a cargar los datos actualizados.

## 6. Qué está implementado y qué falta

### Organización

La feature `organization` administra sedes y bodegas. Sus componentes usan hooks
de `hooks/`, que llaman a `api/organization-api.ts`; las solicitudes pasan por
`apiClient`.

- **Sedes:** listar, crear, editar y eliminar. El formulario requiere nombre y
  estado activo. Antes de eliminar, la interfaz pide confirmación.
- **Bodegas:** listar, crear, editar y eliminar. La lista puede enviar `siteId`
  para que el backend filtre por sede. Al crear se elige una sede; al editar no
  se puede cambiar, porque el contrato no lo permite. También se puede informar
  el código TNS.
- Ambas listas muestran estados de carga, error y vacío. Después de una
  mutación, el hook invalida la consulta correspondiente.

### Clientes y tipos

La feature `customers` administra clientes y tipos de cliente:

- **Clientes:** lista el arreglo que devuelve el backend, sin paginación ni
  búsqueda. El formulario requiere código TNS, razón social, tipo, sede, lista de
  precios y estado. Dirección, teléfono y descuento son opcionales según el
  contrato. Los errores por campo pueden mostrarse en Mantine.
- **Tipos de cliente:** tienen su propia pantalla CRUD y formulario con nombre y
  porcentaje de descuento. La opción de administración aparece solo para
  `ADMIN` en el menú.
- Tanto clientes como tipos piden confirmación antes de eliminar y muestran
  estados de carga, error y vacío.

El formulario de clientes obtiene sus opciones mediante las entradas públicas
de `organization` y `catalog`. Así no importa archivos internos de otras
features.

### Catálogo y trabajo pendiente

La feature `catalog` administra productos, listas de precios e ítems:

- **Productos:** listar, crear, editar y eliminar. El formulario usa código TNS,
  nombre, unidad, porcentaje de IVA y estado activo.
- **Listas de precios:** listar, crear, editar y eliminar. Una lista tiene nombre
  y fecha inicial; puede asociarse a una sede y tener fecha final. Desde cada
  fila se abre la administración de sus ítems.
- **Ítems:** se consultan y administran dentro de una lista específica. Cada
  ítem asocia un producto con un precio y su período de vigencia. El servidor
  valida que los períodos no se solapen; el frontend no duplica esa regla.
- Los formularios muestran errores del servidor y las listas tienen estados de
  carga, error y vacío. Toda eliminación pide confirmación.

Las listas de precios también alimentan el selector del formulario de clientes.
El inventario sigue pendiente; se implementará usando las operaciones de stock,
ajustes y movimientos que defina el contrato.

### Qué no resuelve el frontend

El cliente y los tipos de `schema.d.ts` no sustituyen la validación del backend.
Ocultar una opción del menú tampoco autoriza ni protege una operación: el
servidor debe comprobar permisos y reglas de negocio. El usuario actual sigue
siendo temporal porque todavía no hay login.

Las pruebas existentes verifican la conversión de errores y la deduplicación de
notificaciones. Aún faltan pruebas de formularios, renderizado de listas y
filtrado del menú por rol.
