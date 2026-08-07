# 🗺️ Guía de Planeación y Llenado de Canvas

> **Propósito:** usa este documento como referencia al iniciar un proyecto con `funky init`. Te asegura no dejar puntos ciegos al decidir la arquitectura y la infraestructura.

---

## Orden del flujo

Completa los documentos de planificación en este orden:

1. **Brief funcional** — llena `brief-funcional.md` primero. Define QUÉ se construye y PARA QUIÉN: usuarios, casos de uso, KPIs y escala. Es la base sobre la que se validan las decisiones técnicas.
2. **Canvases técnicos** — lee esta guía y llena `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con las decisiones de stack, arquitectura y operación.
3. **Validación holística** — cuando los tres archivos estén completos, abre `init-prompt.md` (ubicado junto a esta guía) y copia su contenido como primer mensaje de una sesión con tu agente de IA. El agente evalúa los tres archivos en conjunto, cuestiona punto por punto y reta las hipótesis de negocio del brief. El humano tiene la decisión final.

> La validación NO se realiza en esta guía: el prompt de validación vive en `init-prompt.md`. Esta guía no lo reproduce para que exista una única fuente de verdad.

---

## 🏗️ PROJECT-CANVAS (Core de Aplicación)

### 1. Framework Base
*Condiciona el rendering, el ruteo y el empaquetado.*
- **Next.js (App Router):** ideal para SEO, Server Components, SSR y apps full-stack nativas.
- **React + Vite:** para SPAs ultrarrápidas, paneles de administración o dashboards donde el SEO no importa.
- **Astro:** contenido hiper-estático, blogs o landing pages (arquitectura de islas).
- **NestJS / Express:** si estás iniciando un canvas estrictamente para Backend.

🏛️ *Nota del arquitecto:* Next.js es ideal para proyectos con SEO y SSR, pero es excesivo para dashboards internos o apps sin contenido público. Astro rinde mejor para sitios estáticos o con poco dinamismo. NestJS/Express tiene sentido solo si el backend es sustancialmente más complejo que el frontend.

### 2. Patrón Arquitectónico
*Condiciona la estructura de carpetas y las dependencias lógicas.*
- **Clean Architecture:** capas estrictas (`domain`, `application`, `infrastructure`). Alta testeabilidad.
- **Hexagonal (Ports & Adapters):** foco en interfaces e inyección de dependencias. Ideal para backends o lógicas agnósticas.
- **Modular / Feature-Sliced Design (FSD):** carpetas divididas por feature (ej. `/auth`, `/users`), donde cada una tiene sus propios componentes, estado y API. Ideal para frontend escalable.
- **Screaming Architecture:** la estructura grita la intención del negocio, no las herramientas tecnológicas.

🏛️ *Nota del arquitecto:* Clean Architecture brilla en dominios complejos, pero añade ceremonia. Para CRUDs simples o MVPs, Modular/FSD da mejor velocidad inicial sin deuda técnica significativa. Screaming Architecture es excelente para dominios ricos en lógica de negocio, pero confunde si el proyecto es pequeño.

### 3. Gestión de Estado (Frontend)
*Cómo fluirán los datos.*
- **React Query / SWR:** para estado remoto (caché de servidor). Útil si el proyecto consume APIs REST.
- **Zustand:** estado global simple y atómico. Reemplazo moderno de Redux.
- **Redux Toolkit:** solo para flujos de estado hiper-complejos o aplicaciones legacy.
- **Signals (@preact/signals):** reactividad fina sin re-renders masivos.
- **Ninguno:** todo viaja por props, Context nativo o Server Components.

🏛️ *Nota del arquitecto:* no agregues una librería de estado global hasta que tengas dos componentes no-hermanos que necesiten el mismo dato. Muchas apps viven bien con props + Server Components. Redux Toolkit solo si el flujo de estado es hiper-complejo o legacy.

### 4. Estrategia UI y Estilos
- **Tailwind CSS puro:** utility-first absoluto.
- **Tailwind + shadcn/ui:** componentes headless, totalmente personalizables.
- **CSS Modules / Vanilla Extract:** CSS con scope sin ensuciar el HTML.
- **Design System propio:** librería de componentes interna preexistente.

🏛️ *Nota del arquitecto:* un design system propio tiene sentido si mantienes múltiples productos con la misma marca. Para proyectos únicos, Tailwind + shadcn/ui da 80% del valor con 10% del esfuerzo. CSS Modules es ideal si el equipo ya viene de esa cultura.

### 5. Estrategia de Testing
*Define la confianza del código.*
- **Metodología:**
  - **TDD Estricto:** test primero, código después.
  - **Integration First:** priorizar tests de flujos completos por sobre unitarios puros.
  - **Smoke Testing / Happy Path:** solo cobertura de caminos críticos.
> 💡 *Si aplica* — El runner depende de la metodología de testing que definiste arriba. Si aún no la tienes clara, puedes omitir esta parte.
- **Runner:**
  - **Vitest:** el estándar actual (rápido, nativo ESM).
  - **Jest:** para bases de código legacy.
  - **Playwright / Cypress:** pruebas End-to-End (E2E) simulando el usuario real.

🏛️ *Nota del arquitecto:* TDD no es obligatorio. Muchos equipos exitosos usan Integration First: escriben integraciones primero, unitarias después. La cobertura del 80% es una guía, no una regla. Playwright para E2E solo si hay flujos críticos multi-paso.

---

## ⚙️ INFRA-CANVAS (Core Operacional)

### 1. Base de Datos / ORM
- **PostgreSQL + Prisma:** stack robusto, tipado fuerte, migraciones fáciles.
- **PostgreSQL + Drizzle:** alta performance, tipado exacto de SQL, ligero.
- **MongoDB + Mongoose:** schemaless, documentos anidados rápidos.
- **Supabase / Firebase:** Backend-as-a-Service, base de datos con APIs autogeneradas.

🏛️ *Nota del arquitecto:* SQLite es sorprendentemente capaz para equipos pequeños (menos de 5 devs) y apps monousuario. No lo descartes por "no ser enterprise": muchas apps SaaS viven bien con SQLite + backups. MongoDB es tentador, pero piensa dos veces si necesitas transacciones.

### 2. Autenticación
- **NextAuth.js / Auth.js:** estándar open-source para ecosistema React/Next.
- **Clerk:** solución gestionada llave en mano (componentes drop-in).
- **Supabase Auth / Firebase Auth:** si ya usas su base de datos.
- **JWT Custom:** manejo de tokens y cookies a mano contra un backend propio.

🏛️ *Nota del arquitecto:* Auth.js (NextAuth) es la mejor opción open-source para React/Next, pero si tu app es solo backend, JWT Custom con refresh tokens da más control. Clerk es excelente si el presupuesto lo permite y no quieres gestionar auth.

### 3. Linter / Formatter
- **Biome:** formatter y linter hiper-rápido en Rust (reemplaza Prettier + ESLint).
- **ESLint estricto + Prettier:** el estándar de la industria, con plugins por cada librería.
- **TypeScript Strict:** obligatorio activar `"strict": true` en el `tsconfig.json`.

🏛️ *Nota del arquitecto:* Biome reemplaza ESLint + Prettier con una sola herramienta y es órdenes de magnitud más rápido. Migrar de ESLint a Biome es de bajo riesgo si el equipo está abierto al cambio. TypeScript strict debería ser no negociable.

### 4. Deployment & CI/CD
- **Hosting Frontend:** Vercel, Netlify, Cloudflare Pages.
- **Hosting Backend/DB:** Railway, Render, AWS (Docker), Neon (DB Serverless).
- **CI/CD:** GitHub Actions (pipelines pre-merge), GitLab CI.
- **Contenedores:** Dockerfile obligatorio para ambientes reproducibles.

🏛️ *Nota del arquitecto:* un Junior + K8s es una receta para el desastre operativo. Si el equipo no tiene DevOps dedicado, usa PaaS (Vercel, Railway, Render). GitHub Actions es suficiente para CI/CD el 90% de los casos: no necesitas GitLab CI a menos que ya estés en GitLab.
