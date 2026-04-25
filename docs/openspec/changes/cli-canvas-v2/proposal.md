# 📄 Spec / Proposal: CLI Canvas v2 (Split & Rich Prompts)

## 1. Visión General
Tras analizar el flujo interno de `funky init` y la auditoría de los templates estáticos, confirmamos que los templates actuales (`ORCHESTRATOR-STATE.md`, `.agents/rules/`) definen **la metodología de trabajo (SDD)**, independientemente del stack tecnológico. 

El conocimiento sobre el *stack tecnológico* reside enteramente en el Canvas. Dado que un proyecto moderno tiene muchas decisiones técnicas, consolidarlas todas en un solo archivo genera ruido cognitivo para el agente. Por lo tanto, dividiremos el modelo mental en dos dominios bajo los principios de Arquitectura Hexagonal (Core vs Infraestructura).

## 2. Objetivos
1. **Resolver Bugs (v1.7.x):** Corregir el mapping de `ui/styling` y el literal `boolean` de testing.
2. **Dividir el Canvas:** Separar las decisiones core (`PROJECT-CANVAS.md`) de las operacionales (`INFRA-CANVAS.md`).
3. **Mejorar la Recolección de Datos (Rich Prompts):** Ampliar las preguntas del CLI para capturar información arquitectónica de calidad industrial.

---

## 3. Arquitectura del Nuevo Flujo (`funky init`)

### Fase 1: Prompts Core (El Núcleo)
Se preguntará por las decisiones inmutables de la aplicación.
- **Framework Base:** Next.js (App Router), React+Vite, Astro.
- **Patrón Arquitectónico:** Clean Architecture, Hexagonal, Modular.
- **Estrategia UI:** Tailwind CSS, CSS Modules, Design System.
- **Gestión de Estado:** Redux, Zustand, React Query, Signals, etc.
- **Estrategia de Testing:** TDD, BDD + Runner (Vitest, Jest, Playwright).

👉 **Salida:** Genera `PROJECT-CANVAS.md`.

### Fase 2: Prompts Infra (La Periferia)
Se preguntará por las integraciones y el entorno operacional.
- **Base de Datos / ORM:** Prisma, Drizzle, Mongoose, Supabase, Ninguna.
- **Autenticación:** NextAuth, Clerk, Firebase, Custom JWT.
- **Linter/Formatter:** ESLint + Prettier Estricto, Biome, Standard.
- **Deployment & CI/CD:** Vercel, AWS/Docker, GitHub Actions, GitLab CI.

👉 **Salida:** Genera `INFRA-CANVAS.md`.

---

## 4. Estructura de Archivos (Post-Init)

```text
proyecto/
├── .agents/
│   └── rules/ (Reglas SDD estáticas)
├── docs/
│   └── engram/ (Memoria del orquestador)
├── ORCHESTRATOR-STATE.md (Estado efímero)
├── PROJECT-CANVAS.md     (Core Arquitectónico)  <-- NUEVO SCHEMA
└── INFRA-CANVAS.md       (Core Operacional)     <-- NUEVO ARCHIVO
```

### Ventaja Cognitiva para la IA
Cuando el Orquestador planifica una "Feature de UI", solo lee `PROJECT-CANVAS.md`. 
Cuando el Orquestador planifica un "Pipeline de Deploy" o "Modelo de DB", lee `INFRA-CANVAS.md`.
Se reduce el contexto innecesario y se mejoran las inferencias de los LLMs.

---

## 5. Tareas de Implementación (Plan de Acción)

- [ ] **Fix Bugs Rápidos:** Ajustar `init.js` para corregir `ui` -> `styling` y el boolean de `testing`.
- [ ] **Actualizar `generateCanvasMarkdown`:** Renombrar/dividir en dos funciones (`generateProjectCanvas` y `generateInfraCanvas`).
- [ ] **Expandir `@clack/prompts`:** Agregar las nuevas dimensiones en `init.js` separadas en dos flujos visuales.
- [ ] **Modificar el engine de archivos:** Hacer que `runInit()` guarde ambos archivos. Si se ejecuta en modo headless (`--template`), generar ambos vacíos.

## 6. Riesgos y Mitigaciones
- **Riesgo:** Hacer el `init` muy largo y tedioso.
- **Mitigación:** Proveer opciones de tipo "No definido / Decidir luego" en todas las preguntas de Infraestructura, ya que suelen definirse después del andamiaje inicial.
