# 📘 Flujo Interno: `funky init`

> **Versión documentada:** v3.2.0+  
> **Ultima actualizacion:** 2026-07-28  
> **Estado:** ✅ Estable

---

## 1. Vision General

El comando `funky init` genera PROJECT-CANVAS.md, INFRA-CANVAS.md y la guia de planeacion. El flujo es de 2 pasos:

1. **Inicializacion** (`funky init`): Genera canvases vacios + guia en el directorio actual.
2. **Bootstrap** (`funky init --bootstrap`): Copia toda la estructura base del ecosistema Funky AI (reglas de agentes, ORCHESTRATOR-STATE, directorios engram, plantillas). No requiere canvases, pero si existen los respeta.

No existen modos interactivos ni prompts. El CLI genera los archivos y termina. El equipo discute las decisiones en chat con IA, no en la terminal.

---

## 2. Arbol de Decision (Flujo Completo)

```
funky init [--bootstrap?]
│
├─ ¿flag --bootstrap?
│   └─ NO  (default)
│       ├─ ¿existe PROJECT-CANVAS.md o INFRA-CANVAS.md?
│       │   ├─ SI  → Error: "ya existe" → process.exit(1)
│       │   └─ NO  → generateProjectCanvasMarkdown({}) → PROJECT-CANVAS.md
│       │           → generateInfraCanvasMarkdown({})   → INFRA-CANVAS.md
│       │           → copyFileSync(canvas-planning-guide.md) → raiz del proyecto
│       │           → "Ejecuta funky init --bootstrap para inicializar el ecosistema"
│       │           → process.exit(0)
│       └─ (fin)
│
└─ ¿flag --bootstrap?
    └─ SI
        ├─ ¿existen PROJECT-CANVAS.md E INFRA-CANVAS.md en cwd?
        │   ├─ AMBOS → Bootstrap completo:
        │   │       canvasConfig = { skipProjectCanvas: true, skipInfraCanvas: true }
        │   │       └─ runInit({})
        │   │           ├─ Copia archivos bootstrap
        │   │           ├─ Crea directorios engram
        │   │           └─ Saltea: PROJECT-CANVAS.md, INFRA-CANVAS.md
        │   │
        │   ├─ SOLO PROJECT-CANVAS → Migracion
        │   │       ├─ Genera INFRA-CANVAS.md con warning legacy
        │   │       └─ Continua con bootstrap
        │   │
        │   └─ NINGUNO → Bootstrap solo (sin canvases):
        │           canvasConfig = null
        │           └─ runInit({})
        │               ├─ Copia archivos bootstrap
        │               ├─ Crea directorios engram
        │               └─ Sin canvases (canvasConfig=null)
        └─ (fin)
```

---

## 3. Archivos Involucrados

### 3.1 Código fuente

| Archivo | Rol |
|---|---|
| `src/commands/init.js` | Orquestador del comando: detecta --bootstrap, genera canvases por defecto, llama a `runInit()` |
| `src/utils/canvas.js` | Funcion `generateCanvasMarkdown(config)`: interpola el canvas como string Markdown |

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
| `../sdd/rfc-template.md` | `openspec/rfcs/000-TEMPLATE.md` | Estático general |
| `TEMPLATE_GUIDE.md` | `TEMPLATE_GUIDE.md` | Estático general |
| `../README.md` | `README.md` | Estático general |

> ⚠️ Todos son **estáticos**. Se copian con `fs.copyFileSync`, sin interpolación de variables. El canvas NO alimenta ninguno de estos archivos.

### 3.3 Archivos dinámicos

| Archivo | Generado por | Con datos de |
|---|---|---|
| `PROJECT-CANVAS.md` | `generateProjectCanvasMarkdown(config)` | `projectData` del canvasConfig. Por defecto vacio `{}` con placeholders guia |
| `INFRA-CANVAS.md` | `generateInfraCanvasMarkdown(config)` | `infraData` del canvasConfig. Por defecto vacio `{}` con placeholders guia |

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

### DT-02 — Bootstrap no parsea el canvas existente

Cuando se ejecuta `funky init --bootstrap`, el CLI respeta los canvases existentes (no los sobreescribe) pero tampoco los lee. El `canvasConfig` tiene todos los skips en `true`.

**Impacto:** Los archivos estaticos copiados no contienen datos del canvas. El ORCHESTRATOR-STATE.md, por ejemplo, no sabe que stack usa el proyecto.

**Direccion de solucion:** Implementar un parser de Markdown que extraiga las secciones del canvas y reconstruya el `canvasConfig` para poblar los templates copiados.

---

### DT-03 — Preguntas del CLI insuficientes para proyectos de escala real (OBSOLETO)

> **Nota:** Este DT-03 corresponde al antiguo modo interactivo eliminado. El CLI ya no pregunta nada — genera canvases con placeholders guia y el equipo discute en chat con IA. La observacion `observaciones-interactive.md` es historica.

---

## 6. Idempotencia

`funky init` es idempotente por diseño. Ejecutarlo múltiples veces en el mismo directorio es seguro:

- Cada archivo de la lista estática se verifica con `fs.existsSync()` antes de copiarse
- Si existe → `⚡ Salteando (ya existe): <archivo>`
- Si no existe → `✅ Creado: <archivo>`
- El `PROJECT-CANVAS.md` nunca se sobreescribe en bootstrap

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
│   ├── funky-ai/
│   │   ├── canvas/
│   │   │   ├── PROJECT-CANVAS.md        ← funky init (sin flags)
│   │   │   ├── INFRA-CANVAS.md
│   │   │   └── canvas-planning-guide.md
│   │   └── workers/
│   │       └── plantilla-worker-handoff.md
│   ├── engram/
│   │   ├── index.md
│   │   ├── architecture/
│   │   ├── pattern/
│   │   ├── discovery/
│   │   ├── decision/
│   │   └── bugfix/
│   └── openspec/
│       └── rfcs/
│           └── 000-TEMPLATE.md
├── ORCHESTRATOR-STATE.md
├── TEMPLATE_GUIDE.md
└── README.md
```

> ⚠️ `funky init` sin flags genera los canvases en `docs/funky-ai/canvas/`. `funky init --bootstrap` copia el resto del ecosistema (reglas, directorios engram, templates). No requiere canvases para bootstrap, pero si existen los respeta.
