# Proyecto
Frontend de una app de pedidos y distribución (administración: clientes, sedes, bodegas, inventario).
Backend Spring Boot 4 / Java 21, REST bajo /api/v1. Contrato: api-contract.yaml (foto del
backend; no inventes endpoints). Todavía no hay login ni órdenes.

# Stack y herramientas
Vite + React + TypeScript, React Router, TanStack Query, Mantine, openapi-typescript + openapi-fetch,
Vitest + React Testing Library, ESLint + Prettier + eslint-plugin-boundaries.
- TypeScript fijado en ~5.9 mientras openapi-typescript no acepte TypeScript 6; no subir a 6 ni a 7.
- Nunca usar --force ni --legacy-peer-deps. Si hay conflicto de dependencias, avisar y bajar de versión.
- No agregar dependencias fuera del stack aprobado sin preguntar.
- Sin Redux, Axios, Tailwind, PWA ni offline por ahora.

# Idioma
Código, archivos y variables en inglés. Textos visibles en español (Colombia), en un módulo central.

# Arquitectura
src/{app, auth, features, shared, config}. Por feature: api/, components/, hooks/, pages/, types.ts, index.ts.
1. Dependencias en un solo sentido: app -> auth/features/shared/config; shared no importa de features.
2. Una feature solo importa de otra por su index.ts, sin ciclos.
3. Los componentes no llaman a fetch: usan hooks de la feature, que usan su api/.
4. Todo HTTP pasa por el cliente de shared/api. Nada de tokens en localStorage.
5. El servidor es la fuente de verdad: no repliques reglas de negocio.

# Convenciones
- Tipos generados del contrato (npm run api:generate); sin `any` ni tipos duplicados a mano.
- Errores: mostrar tal cual el detail/mensajes del servidor; texto genérico solo si no hay mensaje.
  Los errores por campo van a los campos del formulario de Mantine.
- Listas con estados de carga, vacío y error. Eliminar siempre pide confirmación.
- Clientes: sin paginación ni búsqueda hasta que el contrato las soporte (el backend las hará).
- Menú declarativo en app/navigation/menu.ts con roles PROVISIONALES; ocultar opciones es solo UI,
  la seguridad la aplica el backend. useCurrentUser() es temporal (ADMIN fijo).

# Forma de trabajar
Después de cada paso: npm run lint, npm run build y npm test. No hacer commits. Si algo es ambiguo
o el contrato no lo respalda, preguntar antes de implementar.