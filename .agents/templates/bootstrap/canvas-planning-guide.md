# 🗺️ Guía de Planeación y Llenado de Canvas

> **Propósito:** Usa este documento como un "menu a la carta" cuando inicialices un proyecto con `funky init` o cuando debatas la arquitectura con el Orquestador. Te asegura no dejar ningun punto ciego.

---

## 🏗️ PROJECT-CANVAS (Core de Aplicación)

### 1. Framework Base
*Condiciona el rendering, el ruteo y el empaquetado.*
- **Next.js (App Router):** Ideal para SEO, Server Components, SSR y apps full-stack nativas.
- **React + Vite:** Para SPAs ultrarrápidas, paneles de administración o dashboards donde el SEO no importa.
- **Astro:** Contenido hiper-estático, blogs o landing pages (arquitectura de islas).
- **NestJS / Express:** Si estás inicializando un canvas estrictamente para Backend.

### 2. Patrón Arquitectónico
*Condiciona la estructura de carpetas y las dependencias lógicas.*
- **Clean Architecture:** Capas estrictas (`domain`, `application`, `infrastructure`). Alta testeabilidad.
- **Hexagonal (Ports & Adapters):** Foco en interfaces e inyección de dependencias. Ideal para backends o lógicas agnósticas.
- **Modular / Feature-Sliced Design (FSD):** Carpetas divididas por "Feature" (ej. `/auth`, `/users`), donde cada una tiene sus propios componentes, estado y API. Ideal para Frontend escalable.
- **Screaming Architecture:** La estructura grita la intención del negocio, no las herramientas tecnológicas.

### 3. Gestión de Estado (Frontend)
*Cómo fluirán los datos.*
- **React Query / SWR:** Para estado remoto (caché de servidor). Obligatorio si consumís APIs REST.
- **Zustand:** Estado global simple y atómico. Reemplazo moderno de Redux.
- **Redux Toolkit:** Solo para flujos de estado hiper-complejos o aplicaciones legacy.
- **Signals (@preact/signals):** Reactividad fina sin re-renders masivos.
- **Ninguno:** Todo viaja por props, Context nativo o Server Components.

### 4. Estrategia UI y Estilos
- **Tailwind CSS puro:** Utility-first absoluto.
- **Tailwind + shadcn/ui:** Componentes headless, full personalizables.
- **CSS Modules / Vanilla Extract:** Scoped CSS sin ensuciar el HTML.
- **Design System Propio:** Librería de componentes interna preexistente.

### 5. Estrategia de Testing
*Define la confianza del código.*
- **Metodología:**
  - **TDD Estricto:** Test primero, código después.
  - **Integration First:** Priorizar tests de flujos completos por sobre unitarios puros.
  - **Smoke Testing / Happy Path:** Solo cobertura de caminos críticos.
- **Runner:**
  - **Vitest:** El estándar actual (rápido, nativo ESM).
  - **Jest:** Para bases de código legacy.
  - **Playwright / Cypress:** Pruebas End-to-End (E2E) simulando usuario real.

---

## ⚙️ INFRA-CANVAS (Core Operacional)

### 1. Base de Datos / ORM
- **PostgreSQL + Prisma:** Stack robusto, tipado fuerte, migraciones fáciles.
- **PostgreSQL + Drizzle:** Alta performance, tipado exacto de SQL, ligero.
- **MongoDB + Mongoose:** Schemaless, documentos anidados rápidos.
- **Supabase / Firebase:** Backend-as-a-Service, base de datos con APIs autogeneradas.

### 2. Autenticación
- **NextAuth.js / Auth.js:** Estándar open-source para ecosistema React/Next.
- **Clerk:** Solución gestionada llave en mano (drop-in components).
- **Supabase Auth / Firebase Auth:** Si ya usás su base de datos.
- **JWT Custom:** Manejo de tokens y cookies a mano contra un backend propio.

### 3. Linter / Formatter
- **Biome:** Formatter y linter hiper-rápido en Rust (Reemplaza Prettier + ESLint).
- **ESLint estricto + Prettier:** El estándar de la industria, con plugins por cada librería.
- **TypeScript Strict:** Obligatorio activar `"strict": true` en el `tsconfig.json`.

### 4. Deployment & CI/CD
- **Hosting Frontend:** Vercel, Netlify, Cloudflare Pages.
- **Hosting Backend/DB:** Railway, Render, AWS (Docker), Neon (DB Serverless).
- **CI/CD:** GitHub Actions (pipelines pre-merge), GitLab CI.
- **Contenedores:** Dockerfile obligatorio para ambientes reproducibles.
