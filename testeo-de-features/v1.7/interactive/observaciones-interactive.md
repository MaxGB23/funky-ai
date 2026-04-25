primer ejecucion
funky init
T  🚀 Bienvenido a Funky AI CLI
|
o  Elige el Patrón Arquitectónico Base:
|  Clean Architecture
|
o  Framework UI:
|  Tailwind
|
o  ¿Configurar Testing estricto (TDD)?
|  Yes
|
—  📝 Generando Canvas...

🚀 Inicializando Funky AI...
✅ Creado: ORCHESTRATOR-STATE.md
✅ Creado: .agents\rules\engram-protocol.md
✅ Creado: .agents\rules\secops.md
✅ Creado: .agents\rules\sdd-orchestrator.md
✅ Creado: docs\engram\discoveries.md
✅ Creado: docs\engram\bugfixes.md
✅ Creado: docs\funky-ai\workers\plantilla-worker-handoff.md
✅ Creado: PROJECT-CANVAS.md (Dinámico)

✅ Funky AI inicializado. 8 archivos creados, 0 ya existían.


segunda vez
funky init
📄 PROJECT-CANVAS.md detectado, inicializando en modo Headless...
🚀 Inicializando Funky AI...
⚡ Salteando (ya existe): ORCHESTRATOR-STATE.md
⚡ Salteando (ya existe): .agents\rules\engram-protocol.md
⚡ Salteando (ya existe): .agents\rules\secops.md
⚡ Salteando (ya existe): .agents\rules\sdd-orchestrator.md
⚡ Salteando (ya existe): docs\engram\discoveries.md
⚡ Salteando (ya existe): docs\engram\bugfixes.md
⚡ Salteando (ya existe): docs\funky-ai\workers\plantilla-worker-handoff.md
⚡ Salteando (ya existe): PROJECT-CANVAS.md

✅ Funky AI inicializado. 0 archivos creados, 8 ya existían.


**CANVAS GENERADO EN MODO INTERACTIVE**
# 🚀 PROJECT CANVAS

## 1. Patrón Arquitectónico Base
Clean Architecture

## 2. Gestión de Estado y Datos
No definido

## 3. Ecosistema y Tooling
No definido

## 4. Estrategia de Estilos y UI
No definido

## 5. Testing y CI/CD
true

## 6. SecOps y Entornos
No definido

## 🔍 Observaciones

### OBS-01 — Desacoplamiento entre prompts y canvas (Modo Interactivo)

Las respuestas capturadas por el CLI no se están mapeando correctamente a las secciones del `PROJECT-CANVAS.md`. En esta ejecución, el usuario seleccionó `Tailwind` como framework UI y `Yes` para TDD, pero el canvas resultante muestra `No definido` en la sección de estilos y el literal `true` en la de testing.

**Impacto en cadena:** Si el canvas queda con datos incorrectos o incompletos, todos los archivos generados a partir de él (ej. `ORCHESTRATOR-STATE.md`, reglas de agentes) tampoco van a reflejar fielmente el tipo de proyecto que el usuario quiere construir. El canvas es la fuente de verdad — si está mal, todo lo que depende de él está mal.

---

### OBS-02 — Falta de esquema compartido entre modo Headless e Interactivo

El modo headless genera un `PROJECT-CANVAS.md` con un template propio (secciones vacías con `No definido`), mientras que el modo interactivo genera el canvas de forma dinámica desde las respuestas del CLI. No existe un esquema o contrato compartido entre ambos modos que garantice que el canvas resultante siempre tenga la misma estructura y las mismas secciones.

**Riesgo:** Si un usuario empieza en modo interactivo y luego otro colaborador corre `funky init` en modo headless (o viceversa), los canvas generados pueden ser estructuralmente inconsistentes, lo que rompe la coherencia del sistema.

---

### OBS-03 — Prompts del CLI demasiado superficiales para proyectos de escala real

Las preguntas actuales del flujo interactivo son demasiado genéricas y no capturan la información suficiente para definir un proyecto con seriedad. Por ejemplo, elegir entre "Clean Architecture" o "Tailwind" con una sola selección no dice nada sobre cómo se va a estructurar el proyecto en la práctica.

Un CLI a la altura de proyectos reales debería cubrir las siguientes dimensiones, **en orden de impacto arquitectónico** (el framework condiciona todo lo demás):

- **Framework base:** ¿Next.js (App Router / Pages)? ¿React + Vite? ¿Astro? ¿SvelteKit? Esta es la decisión más fundamental — condiciona el routing, el rendering y la estructura de carpetas. Debe ser la primera pregunta.
- **Arquitectura:** ¿Clean Architecture con qué variante? ¿Hexagonal? ¿Screaming? ¿Módulos por dominio o por feature? (hoy se elige el nombre del patrón pero no se define nada más)
- **Estado y datos:** ¿Redux, Signals, Zustand, React Query? ¿Backend propio o API externa? ¿REST, GraphQL o tRPC?
- **UI/Estilos:** ¿Tailwind puro, con shadcn/ui, con una librería de componentes propia, o con un Design System existente?
- **Testing — estrategia:** ¿TDD (test-first)? ¿BDD? ¿Integration-first? ¿Solo cobertura mínima? No alcanza con un "Sí/No" a TDD.
- **Testing — runner y herramientas:** ¿Vitest, Jest? ¿Playwright o Cypress para E2E? ¿Storybook para componentes?
- **Deployment y entornos:** ¿Vercel, Netlify, Docker propio? ¿Ambientes de staging/producción separados? ¿Variables de entorno por ambiente?
- **Lenguaje:** ¿TypeScript estricto (`strict: true`)? ¿Nivel de tipado esperado en el proyecto?

**Conclusión:** El CLI actual da la sensación de un wizard de ejemplo, no de una herramienta de inicialización seria. Cada elección debería estar acompañada de una descripción breve de lo que implica y, donde corresponda, ofrecer sub-opciones con granularidad real. El objetivo es que al terminar el `funky init`, el canvas refleje decisiones arquitectónicas genuinas — no labels vacíos.

