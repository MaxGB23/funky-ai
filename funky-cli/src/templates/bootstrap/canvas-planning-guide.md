# 🗺️ Guía de Planeación y Llenado de Canvas

> **Propósito:** Usá este documento como un "menú a la carta" cuando inicialices un proyecto en modo headless (`funky init --template`) o cuando debatas la arquitectura con el Orquestador. Te asegura no dejar ningún punto ciego.

---

## 🏗️ PROJECT-CANVAS (Core de Aplicación)

### 1. Framework Base
*Condiciona el rendering, el ruteo y el empaquetado.*
- **Next.js (App Router):** Ideal para SEO, Server Components, SSR y apps full-stack nativas.
- **React + Vite:** Para SPAs ultrarrápidas, paneles de administración o dashboards donde el SEO no importa.
- **Astro:** Contenido hiper-estático, blogs o landing pages (arquitectura de islas).
- **NestJS / Express:** Si estás inicializando un canvas estrictamente para Backend.

🏛️ *Nota del arquitecto:* Next.js es ideal para proyectos con SEO y SSR, pero es overkill para dashboards internos o apps sin contenido público. Astro rinde mejor para sitios estáticos o con poco dinamismo. NestJS/Express tiene sentido solo si el backend es sustancialmente más complejo que el frontend.

### 2. Patrón Arquitectónico
*Condiciona la estructura de carpetas y las dependencias lógicas.*
- **Clean Architecture:** Capas estrictas (`domain`, `application`, `infrastructure`). Alta testeabilidad.
- **Hexagonal (Ports & Adapters):** Foco en interfaces e inyección de dependencias. Ideal para backends o lógicas agnósticas.
- **Modular / Feature-Sliced Design (FSD):** Carpetas divididas por "Feature" (ej. `/auth`, `/users`), donde cada una tiene sus propios componentes, estado y API. Ideal para Frontend escalable.
- **Screaming Architecture:** La estructura grita la intención del negocio, no las herramientas tecnológicas.

🏛️ *Nota del arquitecto:* Clean Architecture brilla en dominios complejos, pero añade ceremonia. Para CRUDs simples o MVPs, Modular/FSD da mejor velocidad inicial sin deuda técnica significativa. Screaming Architecture es excelente para dominios ricos en lógica de negocio, pero confunde si el proyecto es pequeño.

### 3. Gestión de Estado (Frontend)
*Cómo fluirán los datos.*
- **React Query / SWR:** Para estado remoto (caché de servidor). Obligatorio si consumís APIs REST.
- **Zustand:** Estado global simple y atómico. Reemplazo moderno de Redux.
- **Redux Toolkit:** Solo para flujos de estado hiper-complejos o aplicaciones legacy.
- **Signals (@preact/signals):** Reactividad fina sin re-renders masivos.
- **Ninguno:** Todo viaja por props, Context nativo o Server Components.

🏛️ *Nota del arquitecto:* No agregues una librería de estado global hasta que tengas dos componentes no-hermanos que necesiten el mismo dato. Muchas apps viven felices con props + Server Components. Redux Toolkit solo si el flujo de estado es hiper-complejo o legacy.

### 4. Estrategia UI y Estilos
- **Tailwind CSS puro:** Utility-first absoluto.
- **Tailwind + shadcn/ui:** Componentes headless, full personalizables.
- **CSS Modules / Vanilla Extract:** Scoped CSS sin ensuciar el HTML.
- **Design System Propio:** Librería de componentes interna preexistente.

🏛️ *Nota del arquitecto:* Design System propio tiene sentido si mantienes múltiples productos con la misma marca. Para proyectos únicos, Tailwind + shadcn/ui da 80% del valor con 10% del esfuerzo. CSS Modules es ideal si el equipo ya viene de esa cultura.

### 5. Estrategia de Testing
*Define la confianza del código.*
- **Metodología:**
  - **TDD Estricto:** Test primero, código después.
  - **Integration First:** Priorizar tests de flujos completos por sobre unitarios puros.
  - **Smoke Testing / Happy Path:** Solo cobertura de caminos críticos.
> 💡 *Si aplica* — El runner depende de la metodología de testing que definiste arriba. Si aún no lo sabes, puedes saltar esta sección.
- **Runner:**
  - **Vitest:** El estándar actual (rápido, nativo ESM).
  - **Jest:** Para bases de código legacy.
  - **Playwright / Cypress:** Pruebas End-to-End (E2E) simulando usuario real.

🏛️ *Nota del arquitecto:* TDD no es obligatorio. Muchos equipos exitosos usan Integration First: escriben integraciones primero, unitarias después. La cobertura del 80% es una guía, no una regla. Playwright para E2E solo si hay flujos críticos multi-paso.

---

## ⚙️ INFRA-CANVAS (Core Operacional)

### 1. Base de Datos / ORM
- **PostgreSQL + Prisma:** Stack robusto, tipado fuerte, migraciones fáciles.
- **PostgreSQL + Drizzle:** Alta performance, tipado exacto de SQL, ligero.
- **MongoDB + Mongoose:** Schemaless, documentos anidados rápidos.
- **Supabase / Firebase:** Backend-as-a-Service, base de datos con APIs autogeneradas.

🏛️ *Nota del arquitecto:* SQLite es sorprendentemente capaz para equipos pequeños (<5 devs) y apps monousuario. No lo descartes por "no ser enterprise" — muchas apps SaaS viven felices con SQLite + backups. MongoDB es tentador pero piensa dos veces si necesitas transacciones.

### 2. Autenticación
- **NextAuth.js / Auth.js:** Estándar open-source para ecosistema React/Next.
- **Clerk:** Solución gestionada llave en mano (drop-in components).
- **Supabase Auth / Firebase Auth:** Si ya usás su base de datos.
- **JWT Custom:** Manejo de tokens y cookies a mano contra un backend propio.

🏛️ *Nota del arquitecto:* Auth.js (NextAuth) es la mejor opción open-source para React/Next, pero si tu app es solo backend, JWT Custom con refresh tokens da más control. Clerk es excelente si el presupuesto lo permite y no quieres gestionar auth.

### 3. Linter / Formatter
- **Biome:** Formatter y linter hiper-rápido en Rust (Reemplaza Prettier + ESLint).
- **ESLint estricto + Prettier:** El estándar de la industria, con plugins por cada librería.
- **TypeScript Strict:** Obligatorio activar `"strict": true` en el `tsconfig.json`.

🏛️ *Nota del arquitecto:* Biome reemplaza ESLint + Prettier con una sola herramienta y es órdenes de magnitud más rápido. Migrar de ESLint a Biome es de bajo riesgo si el equipo está abierto al cambio. TypeScript strict debería ser no-negociable.

### 4. Deployment & CI/CD
- **Hosting Frontend:** Vercel, Netlify, Cloudflare Pages.
- **Hosting Backend/DB:** Railway, Render, AWS (Docker), Neon (DB Serverless).
- **CI/CD:** GitHub Actions (pipelines pre-merge), GitLab CI.
- **Contenedores:** Dockerfile obligatorio para ambientes reproducibles.

🏛️ *Nota del arquitecto:* Un Junior + K8s es una receta para el desastre operativo. Si el equipo no tiene DevOps dedicado, usa PaaS (Vercel, Railway, Render). GitHub Actions es suficiente para CI/CD el 90% de los casos — no necesitas GitLab CI a menos que ya estés en GitLab.

---

## 🔍 Análisis de Compatibilidad (para el agente IA)

*Esta sección contiene instrucciones para que el agente de IA analice los canvases completados. No es para el desarrollador.*

Cuando el equipo haya completado PROJECT-CANVAS.md e INFRA-CANVAS.md, el agente IA debe:

1. Leer ambas secciones de "Decisión y Rationale" y extraer el stack elegido.
2. Identificar combinaciones problemáticas conocidas:
   - Framework + Auth (ej: sitio estático + NextAuth requiere API route)
   - Base de datos + Escala (ej: SQLite + alto throughput)
   - Patrón + Stack (ej: Clean Architecture + bundle mínimo)
   - Senioridad del equipo + Complejidad operacional (ej: Junior + K8s)
   - Base de datos + Tipo de app (ej: MongoDB + transacciones financieras)
3. Evaluar cada par de decisiones y documentar:
   - Si son compatibles sin observaciones
   - Si tienen trade-offs conocidos (con sugerencia de mitigación)
   - Si son incompatibles (con sugerencia de alternativa viable)
4. Generar una sección "Riesgos Detectados" con los hallazgos, priorizados por impacto.

> **Nota:** Este análisis es el punto de partida. A medida que el equipo use el sistema, surgirán nuevos patrones de incompatibilidad que documentar. No intentes cubrir todos los casos ahora.
