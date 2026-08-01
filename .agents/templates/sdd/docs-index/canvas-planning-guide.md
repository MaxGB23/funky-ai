# Índice de Secciones: `funky-cli/src/templates/init/canvas-planning-guide.md`

- **1. 🏗️ PROJECT-CANVAS (Core de Aplicación):** Decisiones de la aplicación: framework, patrón, estado, UI y testing.
  - **1. Framework Base:** Next.js, React + Vite, Astro o NestJS/Express según el tipo de app.
  - **2. Patrón Arquitectónico:** Clean, Hexagonal, Modular/FSD o Screaming Architecture.
  - **3. Gestión de Estado (Frontend):** React Query/SWR, Zustand, Redux Toolkit, Signals o ninguno.
  - **4. Estrategia UI y Estilos:** Tailwind, shadcn/ui, CSS Modules o Design System propio.
  - **5. Estrategia de Testing:** Metodología (TDD, Integration First, Smoke) y runner (Vitest, Jest, Playwright/Cypress).
- **2. ⚙️ INFRA-CANVAS (Core Operacional):** Decisiones operativas: base de datos, auth, linter y deployment.
  - **1. Base de Datos / ORM:** PostgreSQL + Prisma/Drizzle, MongoDB + Mongoose o Supabase/Firebase.
  - **2. Autenticación:** NextAuth/Auth.js, Clerk, Supabase/Firebase Auth o JWT Custom.
  - **3. Linter / Formatter:** Biome, ESLint + Prettier y TypeScript strict.
  - **4. Deployment & CI/CD:** Hosting frontend/backend, GitHub Actions/GitLab CI y Docker.
- **3. 🔍 Análisis de Compatibilidad (para el agente IA):** Instrucciones para detectar combinaciones problemáticas entre decisiones de ambos canvas.
