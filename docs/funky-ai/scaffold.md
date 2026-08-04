# funky scaffold — Framework Installation

## ¿Qué problema resuelve?

`funky scaffold` copia toda la estructura base del ecosistema agéntico de funky-ai dentro del proyecto destino: reglas para agentes, archivo `ORCHESTRATOR-STATE.md`, plantillas SDD, RFC seed y directorios engram. Es el paso que materializa el framework sobre un repositorio ya inicializado.

Sin `scaffold` el proyecto no tiene las reglas de comportamiento que los agentes necesitan para operar con el protocolo SDD, ni los templates para generar documentos, ni la estructura engram para memoria persistente.

## ¿Cuándo usarlo?

Preferentemente después de `funky init`. Se ejecuta una sola vez por repositorio, aunque es idempotente: los archivos existentes se skipean sin sobrescribirse.

```bash
funky scaffold
```

## Árbol completo de inyección

### Root files (3)

| Destino | Origen | Propósito |
|---|---|---|
| `ORCHESTRATOR-STATE.md` | `bootstrap/ORCHESTRATOR-STATE.md` | Estado global del proyecto y orquestador |
| `README.md` | `bootstrap/README.md` | Documentación principal y punto de entrada |
| `TEMPLATE_GUIDE.md` | `bootstrap/TEMPLATE_GUIDE.md` | Guía para customizar golden templates locales (sobrescriben los base del CLI en el proyecto actual) |

### `.agents/rules/` (23 archivos)

#### Reglas base (8)

| Archivo | Propósito |
|---|---|
| `engram-protocol.md` | Protocolo de memoria persistente Engram |
| `sdd-escalation-matrix.md` | Matriz de escalamiento entre tiers |
| `sdd-orchestrator.md` | Orquestador del ciclo SDD |
| `sdd-preflight.md` | Validaciones pre-vuelo antes de ejecutar |
| `secops.md` | Reglas de seguridad operacional |
| `tier1-router.md` | Enrutador Tier 1 (autónomo) |
| `tier2-router.md` | Enrutador Tier 2 (delegación) |
| `tier3-router.md` | Enrutador Tier 3 (interactivo) |

#### Tier 2 — Delegation (6)

| Archivo | Propósito |
|---|---|
| `tier2-delegation/t2-archive.md` | Archivar cambios completados |
| `tier2-delegation/t2-explore.md` | Explorar requerimientos |
| `tier2-delegation/t2-propose.md` | Proponer enfoques de cambio |
| `tier2-delegation/t2-spec.md` | Escribir especificaciones delta |
| `tier2-delegation/t2-tasks.md` | Planificar tareas de implementación |
| `tier2-delegation/t2-verify.md` | Verificar implementación contra spec |

#### Tier 3 — Interactive (8)

| Archivo | Propósito |
|---|---|
| `tier3-interactive/interactive-apply.md` | Aplicar tareas de implementación |
| `tier3-interactive/interactive-archive.md` | Archivar cambios con interacción |
| `tier3-interactive/interactive-design.md` | Diseñar arquitectura del cambio |
| `tier3-interactive/interactive-explore.md` | Explorar con validación humana |
| `tier3-interactive/interactive-propose.md` | Proponer con revisión |
| `tier3-interactive/interactive-spec.md` | Especificar con colaboración |
| `tier3-interactive/interactive-tasks.md` | Planificar tareas con supervisión |
| `tier3-interactive/interactive-verify.md` | Verificar con aprobación humana |

#### Riesgo y decisión (1)

| Archivo | Propósito |
|---|---|
| `tier3-interactive/risk-decision.md` | Evaluación de riesgo para decisiones críticas |

### `.agents/templates/sdd/` (8 + 2 copiados)

#### Templates SDD (8 copiados)

| Archivo |
|---|
| `docs.md` |
| `explore.md` |
| `proposal.md` |
| `release-checklist.md` |
| `release-notes.md` |
| `report.md` |
| `spec.md` |
| `tasks.md` |

#### Docs compartidos (2 copiados del template base)

| Elemento | Tipo | Propósito |
|---|---|---|
| `docs-live-index.md` | Copiado (`add`) desde `bootstrap/sdd/` | Índice de documentación viva (SSOT) con tabla de referencias |
| `docs-index/_indice-seccional-template.md` | Copiado (`add`) desde `bootstrap/sdd/` | Formato canónico de índice seccional |

> Ambos usan el MISMO src que `funky skills` (R-SK-5): `scaffold` y `skills` producen bytes idénticos.

### `openspec/rfcs/` — Excepción de ruta

| Archivo | Destino |
|---|---|
| `000-rfc-template.md` | `openspec/rfcs/000-rfc-template.md` |

A diferencia del resto de templates SDD que van a `.agents/templates/sdd/`, el RFC template se inyecta en `openspec/rfcs/` porque los RFCs son artefactos del dominio abierto del proyecto, no del andamiaje interno de agentes.

### `docs/engram/` — 7 directorios

```
docs/engram/
├── architecture/
├── pattern/
├── discovery/
├── decision/
├── bugfix/
├── session/
└── release/
```

Cada subdirectorio se crea vacío. Son los shards donde el protocolo Engram persiste observaciones estructuradas por categoría.

## Diagrama de flujo

```
runScaffold({ templatesDir, targetBase })
  │
  ├── 3 root files ───────────────────────── copy
  │   ├── ORCHESTRATOR-STATE.md  →  raíz
  │   ├── README.md              →  raíz
  │   └── TEMPLATE_GUIDE.md      →  raíz
  │
  ├── 23 reglas ───────────────────────────── copy
  │   ├── 8 base                 →  .agents/rules/
  │   ├── 6 tier-2-delegation    →  .agents/rules/tier2-delegation/
  │   ├── 8 tier-3-interactive   →  .agents/rules/tier3-interactive/
  │   └── 1 risk-decision        →  .agents/rules/tier3-interactive/
  │
  ├── 8 templates SDD ─────────────────────── copy
  │   └── *.md                   →  .agents/templates/sdd/
  │
  ├── 1 RFC template ──────────────────────── copy
  │   └── 000-rfc-template.md    →  openspec/rfcs/
  │
  ├── 2 docs compartidos ──────────────────── copy
  │   ├── docs-live-index.md      →  .agents/templates/sdd/
  │   └── docs-index/_indice-seccional-template.md  →  .agents/templates/sdd/
  │
  └── 7 engram dirs ───────────────────────── mkdir
      ├── architecture/
      ├── pattern/
      ├── discovery/
      ├── decision/
      ├── bugfix/
      ├── session/
      └── release/
      └── todos en              →  docs/engram/
```

La función `runScaffold()` es pura: no escribe nada directamente. Ensambla un arreglo de *intenciones* (`{ action, src, dest, content }`) que luego `executeIntentions()` procesa. Esto permite unit-testear la lógica sin tocar el filesystem.

Cada intención es de uno de tres tipos:

- **`copy`** — copia un archivo desde `templatesDir` hacia `targetBase` respetando la subruta relativa.
- **`create`** — genera un archivo con `content` inline (solo `README.md`, interpolando `{{project_name}}`).
- **`mkdir`** — crea un directorio vacío si no existe.
