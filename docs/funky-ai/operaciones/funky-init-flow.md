# 📘 Flujo Interno: `funky init`

> **Versión documentada:** v2.5.0+  
> **Última actualización:** 2026-05-31  
> **Estado:** ✅ Estable

---

## 1. Visión General

El comando `funky init` es el punto de entrada al ecosistema Funky AI. Su responsabilidad es generar la estructura base de un proyecto: reglas de agente, memoria persistente (engram), templates SDD y el canvas del proyecto.

Tiene **dos modos de ejecución** que se activan automáticamente según el estado del directorio:

| Modo | Condición | Comportamiento |
|---|---|---|
| **Interactivo**| No existe `PROJECT-CANVAS.md` | Lanza prompts con `@clack/prompts`, pregunta por el entorno (IDE / CLI) y genera canvas con los valores elegidos |
| **Headless** | Existe `PROJECT-CANVAS.md` | Omite prompts, asume entorno `'ide'` por defecto para retrocompatibilidad, preserva el canvas tal cual y solo copia archivos faltantes |

Además existe el flag `--template` (`-t`) para generar un canvas vacío sin ejecutar el scaffolding completo.

---

## 2. Árbol de Decisión (Flujo Completo)

```
funky init [--template?]
│
├─ ¿flag --template?
│   └─ SÍ
│       ├─ ¿existe PROJECT-CANVAS.md o INFRA-CANVAS.md?
│       │   ├─ SÍ  → ❌ Error: "ya existe" → process.exit(1)
│       │   └─ NO  → generateProjectCanvasMarkdown({}) → PROJECT-CANVAS.md
│       │           → generateInfraCanvasMarkdown({})   → INFRA-CANVAS.md
│       │           → copyFileSync(canvas-planning-guide.md) → raíz del proyecto
│       │           → process.exit(0)  ← fin, NO continúa al scaffolding
│       └─ (fin)
│
└─ ¿existen PROJECT-CANVAS.md E INFRA-CANVAS.md en cwd?
    │
    ├─ AMBOS (o SOLO PROJECT-CANVAS en Migración) → Modo Headless / Migración
    │           canvasConfig = { skipProjectCanvas: true, skipInfraCanvas: true }
    │           └─ runInit({ environment: 'ide' })  ← Forzado por retrocompatibilidad
    │               ├─ Copia 12 archivos (las reglas se leen de bootstrap/ide/)
    │               └─ ⚡ Salteando: PROJECT-CANVAS.md, INFRA-CANVAS.md
    │
    └─ NINGUNO → Modo Interactivo
                └─ @clack/prompts: Selección de Entorno
                    ├─ select: "Seleccioná el entorno de ejecución para el Agente"
                    │   ├─ "IDE (ej. Cursor, VSCode, Cline - Retorno síncrono al disco)" → environment = 'ide'
                    │   └─ "CLI / Subagente (Ejecución asíncrona / background / IPC)"   → environment = 'cli'
                │
                └─ @clack/prompts group 1 (Core):
                    ├─ select: Framework Base
                    ├─ select: Patrón Arquitectónico
                    ├─ select: Estrategia UI
                    ├─ select: Gestión de Estado
                    └─ select: Testing
                └─ @clack/prompts group 2 (Infra):
                    ├─ select: Base de Datos / ORM
                    ├─ select: Autenticación
                    ├─ select: Linter / Formatter
                    └─ select: Deployment & CI/CD
                │
                canvasConfig = { projectData: {...}, infraData: {...} }
                │
                └─ runInit({ environment })
                    ├─ Copia 12 archivos (reglas resueltas dinámicamente desde bootstrap/ide/ o bootstrap/cli/)
                    ├─ generateProjectCanvasMarkdown(projectData) → PROJECT-CANVAS.md
                    └─ generateInfraCanvasMarkdown(infraData)     → INFRA-CANVAS.md
```

---

## 3. Archivos Involucrados

### 3.1 Código fuente

| Archivo | Rol |
|---|---|
| `src/commands/init.js` | Orquestador del comando: detecta modo, lanza prompts interactivos (incluyendo selector de entorno), llama a `runInit()` |
| `src/utils/canvas.js` | Función `generateCanvasMarkdown(config)`: interpola el canvas como string Markdown |

### 3.2 Templates estáticos (copiados tal cual)

Ubicación base: `src/templates/bootstrap/`

| Archivo fuente | Destino en el proyecto | Comportamiento dinámico de ruteo |
|---|---|---|
| `ORCHESTRATOR-STATE.md` | `ORCHESTRATOR-STATE.md` | Estático general |
| `[environment]/agents-rules-engram-protocol.md` | `.agents/rules/engram-protocol.md` | Ruteado según entorno (`ide/` o `cli/`) |
| `agents-rules-secops.md` | `.agents/rules/secops.md` | Estático general |
| `[environment]/agents-rules-sdd-orchestrator.md` | `.agents/rules/sdd-orchestrator.md` | Ruteado según entorno (`ide/` o `cli/`) |
| *(Scaffold de directorios)* | `docs/engram/architecture/`, `pattern/`, `discovery/`, `decision/`, `bugfix/` | Creados con `fs.mkdirSync` — no son archivos copiados sino directorios vacíos |
| `plantilla-worker-handoff.md` | `docs/funky-ai/workers/plantilla-worker-handoff.md` | Estático general |
| `canvas-planning-guide.md` | `docs/funky-ai/cli/canvas-planning-guide.md` | Estático general |
| `../sdd/architecture-assessment.md` | `docs/architecture-assessment.md` | Estático general |
| `../sdd/rfc-template.md` | `docs/openspec/rfcs/000-TEMPLATE.md` | Estático general |
| `TEMPLATE_GUIDE.md` | `TEMPLATE_GUIDE.md` | Estático general |
| `../README.md` | `README.md` | Estático general |

> ⚠️ Todos son **estáticos**. Se copian con `fs.copyFileSync`, sin interpolación de variables. El canvas NO alimenta ninguno de estos archivos.

### 3.3 Archivos dinámicos

| Archivo | Generado por | Con datos de |
|---|---|---|
| `PROJECT-CANVAS.md` | `generateProjectCanvasMarkdown(config)` | Respuestas del grupo 1 de prompts (framework, patrón, UI, estado, testing) o vacío `{}` (modo `--template`) |
| `INFRA-CANVAS.md` | `generateInfraCanvasMarkdown(config)` | Respuestas del grupo 2 de prompts (DB, auth, linter, deployment) o vacío `{}` (modo `--template`) |

---

## 4. Bugs Históricos

### ~~BUG-01 — Mismatch de clave `ui` → `styling`~~ [RESUELTO en v1.7.0]

El campo de UI del canvas mostraba `No definido` porque `init.js` guardaba con clave `ui` pero `canvas.js` leía `styling`. Corregido unificando a `styling` en ambos archivos.

---

### ~~BUG-02 — `testing` se guarda como `boolean`, no como texto~~ [RESUELTO en v1.7.0]

El prompt `p.confirm()` devolvía `true/false` que se interpolaba literal en el canvas. Corregido con transformación a texto descriptivo antes de pasarlo al generador.

---

## 5. Deuda Técnica Identificada

### DT-01 — Los templates estáticos no consumen el canvas

El `ORCHESTRATOR-STATE.md`, las reglas de agente y los demás archivos de bootstrap son copiados como archivos estáticos sin ninguna referencia al `PROJECT-CANVAS.md`. Esto significa que el ecosistema generado es genérico e independiente del tipo de proyecto configurado.

**Impacto:** Un proyecto Next.js + Clean Architecture y uno Astro + Modular reciben exactamente los mismos archivos de contexto para el agente. La IA no tiene forma de saber con qué stack está trabajando a menos que el usuario edite los archivos manualmente.

**Dirección de solución:** Migrar los templates críticos (al menos `ORCHESTRATOR-STATE.md`) a un sistema de interpolación que consuma el `canvasConfig` generado en el `init`.

---

### DT-02 — Modo Headless no parsea el canvas existente

Cuando se detecta un `PROJECT-CANVAS.md`, el CLI lo respeta (no lo sobreescribe) pero tampoco lo lee. El `canvasConfig` en modo headless es `{ fromHeadless: true }` — un flag vacío.

**Impacto:** En una re-inicialización headless, no es posible poblar los archivos estáticos con los datos que ya estaban definidos en el canvas.

**Dirección de solución:** Implementar un parser de Markdown que extraiga las secciones del canvas y reconstruya el `canvasConfig`, para que el headless pueda usarlo igual que el interactivo.

---

### DT-03 — Preguntas del CLI insuficientes para proyectos de escala real

Los prompts actuales cubren solo 3 dimensiones (patrón, UI y TDD). No capturan información sobre framework base, runner de testing, gestión de estado ni estrategia de deployment, que son decisiones arquitectónicas fundamentales que deberían quedar registradas en el canvas desde el inicio.

Ver observación completa: `testeo-de-features/v1.7/interactive/observaciones-interactive.md` → OBS-03.

---

## 6. Idempotencia

`funky init` es idempotente por diseño. Ejecutarlo múltiples veces en el mismo directorio es seguro:

- Cada archivo de la lista estática se verifica con `fs.existsSync()` antes de copiarse
- Si existe → `⚡ Salteando (ya existe): <archivo>`
- Si no existe → `✅ Creado: <archivo>`
- El `PROJECT-CANVAS.md` nunca se sobreescribe en modo headless

---

## 7. Estructura resultante post `funky init`

```
proyecto/
├── .agents/
│   └── rules/
│       ├── engram-protocol.md
│       ├── secops.md
│       └── sdd-orchestrator.md
├── docs/
│   ├── architecture-assessment.md
│   ├── engram/
│   │   ├── index.md
│   │   ├── architecture/
│   │   ├── pattern/
│   │   ├── discovery/
│   │   ├── decision/
│   │   └── bugfix/
│   ├── funky-ai/
│   │   ├── cli/
│   │   │   └── canvas-planning-guide.md
│   │   └── workers/
│   │       └── plantilla-worker-handoff.md
│   └── openspec/
│       └── rfcs/
│           └── 000-TEMPLATE.md
├── ORCHESTRATOR-STATE.md
├── PROJECT-CANVAS.md
├── INFRA-CANVAS.md
├── TEMPLATE_GUIDE.md
└── README.md
```

> ⚠️ En modo `--template`, solo se generan `PROJECT-CANVAS.md`, `INFRA-CANVAS.md` y `canvas-planning-guide.md` en la raíz. El resto de la estructura se crea al ejecutar `funky init` (sin flag) con los Canvas ya llenos.
