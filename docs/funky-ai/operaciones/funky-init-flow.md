# 📘 Flujo Interno: `funky init` y `funky scaffold`

> **Versión documentada:** v3.2.0+  
> **Ultima actualizacion:** 2026-07-29  
> **Estado:** ✅ Estable

---

## 1. Vision General

El CLI tiene dos comandos de inicialización:

1. **`funky init`** — Genera PROJECT-CANVAS.md, INFRA-CANVAS.md y la guía de planeacion.
2. **`funky scaffold`** — Copia toda la estructura base del ecosistema Funky AI (reglas de agentes, ORCHESTRATOR-STATE, directorios engram, plantillas SDD). No requiere canvases, pero si existen los respeta.

No existen modos interactivos ni prompts. El CLI genera los archivos y termina. El equipo discute las decisiones en chat con IA, no en la terminal.

---

## 2. Arbol de Decision (Flujo Completo)

### `funky init`

```
funky init
│
├─ ¿existe PROJECT-CANVAS.md o INFRA-CANVAS.md?
│   ├─ SI  → Error: "ya existe" → process.exit(1)
│   └─ NO  → mkdir docs/funky-ai/canvas/
│             → copy PROJECT-CANVAS.md, INFRA-CANVAS.md
│             → copy canvas-planning-guide.md (si no existe)
│             → "Ejecuta `funky scaffold` para instalar el ecosistema"
│             → process.exit(0)
```

### `funky scaffold`

```
funky scaffold
│
├─ runScaffold({ templatesDir: bootstrap, targetBase: cwd })
│   ├─ Copia archivos root (ORCHESTRATOR-STATE.md, README.md, TEMPLATE_GUIDE.md)
│   ├─ Copia reglas de agente → .agents/rules/
│   ├─ Copia templates SDD → .agents/templates/sdd/
│   ├─ Crea docs-live-index.md
│   ├─ Crea directorio docs-index/
│   ├─ Crea directorios engram (docs/engram/{architecture,pattern,...})
│   └─ Cada archivo existente se saltea (idempotente)
│
└─ (fin)
```

---

## 3. Archivos Involucrados

### 3.1 Código fuente

| Archivo | Rol |
|---|---|
| `src/commands/init.js` | Orquestador del comando `funky init`: genera canvases, verifica duplicados |
| `src/commands/scaffold.js` | Orquestador del comando `funky scaffold`: ejecuta `runScaffold()` para copiar el ecosistema |
| `src/utils/canvas.js` | Funcion `generateCanvasMarkdown(config)`: interpola el canvas como string Markdown |

### 3.2 Templates estáticos (copiados por `funky scaffold`)

Ubicación base: `src/templates/bootstrap/`

| Archivo fuente | Destino en el proyecto | Comportamiento |
|---|---|---|
| `ORCHESTRATOR-STATE.md` | `ORCHESTRATOR-STATE.md` | Estático general |
| `funky-ai-rules/engram-protocol.md` | `.agents/rules/engram-protocol.md` | Estático |
| `funky-ai-rules/secops.md` | `.agents/rules/secops.md` | Estático |
| `funky-ai-rules/sdd-orchestrator.md` | `.agents/rules/sdd-orchestrator.md` | Estático |
| *(scaffold de directorios)* | `docs/engram/architecture/`, `pattern/`, `discovery/`, `decision/`, `bugfix/` | Creados con `fs.mkdirSync` — no son archivos copiados sino directorios vacíos |
| `TEMPLATE_GUIDE.md` | `TEMPLATE_GUIDE.md` | Estático general |
| `sdd/000-rfc-template.md` | `openspec/rfcs/000-rfc-template.md` | Estático general |

> ⚠️ Todos son **estáticos**. Se copian con `fs.copyFileSync` o `fs.writeFileSync`, sin interpolación de variables. El canvas NO alimenta ninguno de estos archivos.

### 3.3 Archivos dinámicos (generados por `funky init`)

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

El `ORCHESTRATOR-STATE.md`, las reglas de agente y los demás archivos de scaffold son copiados como archivos estáticos sin ninguna referencia al `PROJECT-CANVAS.md`. Esto significa que el ecosistema generado es genérico e independiente del tipo de proyecto configurado.

**Impacto:** Un proyecto Next.js + Clean Architecture y uno Astro + Modular reciben exactamente los mismos archivos de contexto para el agente. La IA no tiene forma de saber con qué stack está trabajando a menos que el usuario edite los archivos manualmente.

**Dirección de solución:** Migrar los templates críticos (al menos `ORCHESTRATOR-STATE.md`) a un sistema de interpolación que consuma el `canvasConfig` generado en el `init`.

---

### DT-02 — Scaffold no parsea el canvas existente

Cuando se ejecuta `funky scaffold`, el CLI respeta los canvases existentes (no los sobreescribe) pero tampoco los lee.

**Impacto:** Los archivos estaticos copiados no contienen datos del canvas. El ORCHESTRATOR-STATE.md, por ejemplo, no sabe que stack usa el proyecto.

**Direccion de solucion:** Implementar un parser de Markdown que extraiga las secciones del canvas y reconstruya el `canvasConfig` para poblar los templates copiados.

---

## 6. Idempotencia

`funky init` y `funky scaffold` son idempotentes por diseño. Ejecutarlos múltiples veces en el mismo directorio es seguro:

- Cada archivo se verifica con `fs.existsSync()` antes de copiarse o escribirse
- Si existe → `⚠️ ... ya existe. No se sobrescribió.`
- Si no existe → se crea
- El `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` nunca se sobreescriben

---

## 7. Estructura resultante post `funky init` + `funky scaffold`

```
proyecto/
├── ORCHESTRATOR-STATE.md
├── TEMPLATE_GUIDE.md
├── README.md
├── .agents/
│   ├── rules/
│   │   ├── engram-protocol.md
│   │   ├── secops.md
│   │   └── sdd-orchestrator.md
│   └── templates/sdd/
│       ├── docs.md, explore.md, proposal.md, ...
│       └── docs-index/
├── docs/
│   ├── funky-ai/
│   │   ├── canvas/                     ← funky init
│   │   │   ├── PROJECT-CANVAS.md
│   │   │   ├── INFRA-CANVAS.md
│   │   │   └── canvas-planning-guide.md
│   │   ├── assess/                     ← funky assess
│   │   │   ├── architecture-review.md
│   │   │   └── architecture-decisions.md
│   │   ├── estimate/                   ← funky estimate
│   │   │   ├── pricing-guide.md
│   │   │   └── pricing-decisions.md
│   │   └── pipeline/                   ← funky pipeline
│   │       └── context.json
│   ├── engram/                         ← funky scaffold
│   │   ├── index.md
│   │   ├── architecture/
│   │   ├── pattern/
│   │   ├── discovery/
│   │   ├── decision/
│   │   └── bugfix/
│   └── openspec/
│       └── rfcs/
│           └── 000-rfc-template.md     ← funky scaffold
```
