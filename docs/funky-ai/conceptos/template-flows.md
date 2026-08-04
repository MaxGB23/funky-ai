# Flujos de Templates — Golden vs Base Distribuidos

> **Decisión (2026-08-01):** `sync-templates.js` ELIMINADO. Era dead code con dirección invertida (golden → base). Los **templates base distribuidos** (`funky-cli/src/templates/`) son la fuente única de distribución vía `funky scaffold` y `funky skills`; los **golden templates** de un repo (`.agents/`) son personalización local que NO se propaga al paquete.

## Nomenclatura

| Término | Ubicación | Rol |
|---|---|---|
| **Golden templates** | `.agents/` (en el proyecto destino) | Capa de personalización local. Si existen, ganan en runtime (`funky feature`). NO se propagan al paquete. |
| **Templates base distribuidos** | `funky-cli/src/templates/` (empaquetados con el CLI) | Fuente única de distribución. `funky scaffold` los copia a `.agents/` del proyecto destino. |

## Árbol real de `funky-cli/src/templates/` (verificado)

```
assess/            ← templates de arquitectura (sin comando que los consuma en este análisis)
bootstrap/         ← LEÍDO por scaffold.js y skills.js (funcional)
  ORCHESTRATOR-STATE.md
  README.md
  TEMPLATE_GUIDE.md
  funky-ai-rules/          ← estructura ANIDADA que lee scaffold.js
    engram-protocol.md, secops.md, sdd-*.md, tier1/2/3-*.md, tier2-delegation/, tier3-interactive/
  sdd/                     ← templates SDD del CLI (fallback de feature.js + doc compartido SDD)
    explore.md, proposal.md, spec.md, tasks.md, docs.md, report.md, release-checklist.md, release-notes.md, 000-rfc-template.md
    docs-live-index.md     ← SSOT compartido del índice vivo (scaffold y skills lo copian, R-SK-5)
    docs-index/template.md ← formato canónico de índice seccional
estimate/          ← templates de pricing (sin comando que los consuma en este análisis)
gentle/            ← LEÍDO por skills.js (funcional)
  skills/
    sdd-release/SKILL.md    ← base gentle para el repo destino
    sdd-docs-sync/SKILL.md  ← base gentle para el repo destino
init/              ← LEÍDO por init.js (funcional)
  PROJECT-CANVAS.md, INFRA-CANVAS.md, canvas-planning-guide.md

NO EXISTEN: templates/sdd/ (raíz), templates/agents-rules-*.md, scripts/sync-templates.js
```

## Los 3 flujos (con su estado real)

### Flujo 1 — Sync dev-time (canónico → paquete) — ❌ ELIMINADO (2026-08-01)

`funky-cli/scripts/sync-templates.js` (borrado)

**Nota histórica:** era un vestigio de la era funky init/gentle. Copiaba archivos planos `agents-rules-*.md` hacia `bootstrap/` que nadie leía (`scaffold.js` lee `funky-ai-rules/` anidado), referenciaba `.agents/templates/gentle/*` donde ni fuente ni destino existían, y escribía `canvas-planning-guide.md` en `bootstrap/` cuando `init.js` lo lee de `templates/init/`. La dirección (golden → base) era incorrecta: el paquete no debe derivar de un repo concreto.

```
.agents/rules/engram-protocol.md        ──► bootstrap/agents-rules-engram-protocol.md   (flat, nadie lo leía)
.agents/rules/secops.md                 ──► bootstrap/agents-rules-secops.md
.agents/rules/sdd-orchestrator.md       ──► bootstrap/agents-rules-sdd-orchestrator.md
docs/.../canvas-planning-guide.md       ──► bootstrap/canvas-planning-guide.md
.agents/templates/gentle/01-07-*.md     ──► templates/gentle/                            (dead code)
```

### Flujo 2 — Scaffold (paquete → proyecto) — ✅ FUNCIONAL

`funky-cli/src/commands/scaffold.js`

```
bootstrap/root files      ──► <proyecto>/
bootstrap/funky-ai-rules/ ──► <proyecto>/.agents/rules/          (8 base + 6 t2 + 9 t3 = 23)
bootstrap/sdd/*.md        ──► <proyecto>/.agents/templates/sdd/
bootstrap/sdd/000-rfc...  ──► <proyecto>/openspec/rfcs/
```

Lee la estructura ANIDADA que sí existe. Idempotente (skipea archivos existentes). Con esto el proyecto destino queda con **golden templates propios**.

### Flujo 3 — Feature runtime (golden primero, fallback paquete) — ✅ FUNCIONAL

`funky-cli/src/commands/feature.js`

```
funky feature <name>
    ├─ golden: .agents/templates/sdd/  (existe → se usa)
    └─ fallback: cliTemplatesDir = src/templates/bootstrap/sdd/  (fix 2026-08-01)
```

- La ruta golden es correcta: `path.join(cwd, '.agents', 'templates', 'sdd')` + `fs.existsSync`.
- El fallback apunta a `src/templates/bootstrap/sdd/`, donde viven los templates SDD reales.
- `resolveFiles()` inyecta `release-checklist.md` (que sí existe en `bootstrap/sdd/` y en `.agents/templates/sdd/`) para T2/T3, nunca en T1.

### Flujo 4 — Skills (paquete → proyecto) — ✅ FUNCIONAL (2026-08-03)

`funky-cli/src/commands/skills.js`

```
gentle/skills/sdd-release/SKILL.md    ──► <proyecto>/.agents/skills/sdd-release/SKILL.md
gentle/skills/sdd-docs-sync/SKILL.md  ──► <proyecto>/.agents/skills/sdd-docs-sync/SKILL.md
bootstrap/sdd/docs-live-index.md      ──► <proyecto>/.agents/templates/sdd/docs-live-index.md
bootstrap/sdd/docs-index/template.md  ──► <proyecto>/.agents/templates/sdd/docs-index/template.md
```

- `runSkills()` es puro: 4 intentions de copia (2 skills gentle + 2 docs compartidos SDD) con `templatesDir` en la raíz `src/templates/` (fuente única base, nunca los goldens `.agents/` del repo — R-SK-2).
- Idempotente (R-SK-3): `executeIntentions` salta destinos existentes — no sobreescribe la personalización local.
- **Paridad (R-SK-5):** `docs-live-index.md` y `docs-index/template.md` se copian desde el MISMO src que `funky scaffold` (create-inline → `add()` extraído en 2026-08-03), garantizando bytes idénticos en ambos caminos.
- `--help` enriquecido (R-HL-1/2): `funky <cmd> --help` inyecta `docs/funky-ai/<cmd>.md` (fallback `docs/funky-forge/<cmd>.md`) vía `src/utils/help.js`; sin doc, vacío o con placeholder `<ruta-del-doc>` → no-op.

## Rol dual de `.agents/`

| Contexto | Rol de `.agents/` |
|---|---|
| Repo funky-ai (fuente) | Personalización local del propio repo. NO se empaqueta (Flujo 1 eliminado). |
| Proyecto destino (usuario) | Golden templates que ganan en runtime (Flujo 3). Se crean con `funky scaffold` (Flujo 2). |

## Evidencia en código

| Archivo | Línea | Rol |
|---|---|---|
| `funky-cli/src/commands/scaffold.js` | 37-60, 62-70 | Flujo 2: lee `funky-ai-rules/` anidado + `sdd/` |
| `funky-cli/src/commands/scaffold.js` | — | `add('sdd/docs-live-index.md', ...)` + `add('sdd/docs-index/template.md', ...)` (extraído 2026-08-03, R-SK-5) |
| `funky-cli/src/commands/skills.js` | — | Flujo 4: `runSkills` 4 intentions copy + `skillsCommand` |
| `funky-cli/src/utils/help.js` | — | R-HL-1/2: `resolveDocCandidates`/`loadCommandDoc`/`enrichCommandHelp` (help enriquecido) |
| `funky-cli/src/commands/feature.js` | 91-92 | Golden vs fallback (`templatesToUse`) |
| `funky-cli/src/commands/feature.js` | 121 | Fallback `src/templates/bootstrap/sdd/` (fix 2026-08-01) |
| `funky-cli/src/commands/feature.js` | 69 | Inyecta `release-checklist.md` (fix 2026-08-01) |
| `funky-cli/src/commands/feature.js` | 157-158 | `hasGoldenTemplates = fs.existsSync(...)` |
| `funky-cli/src/commands/init.js` | 13, 27-36 | Lee `templates/init/` (funcional) |
| `funky-cli/src/utils/fs-adapter.js` | — | `copyFileSync` sin fallback → ENOENT crashea |

## Deuda pendiente

1. ~~**sync-templates.js**: alinear destinos con `funky-ai-rules/` anidado; eliminar bloque `gentle`~~ → **RESUELTO:** script eliminado (dead code).
2. ~~**feature.js línea 121**: apuntar fallback a `src/templates/bootstrap/sdd/`~~ → **RESUELTO:** fallback corregido.
3. **feature.js / templates**: la pregunta `release.md` vs `release-notes.md`/`release-checklist.md` → **RESUELTA:** el matrix usa `release-checklist.md` (lleva el contrato máquina `<MANDATORY_RELEASE_PROTOCOL>`), que existe en `bootstrap/sdd/` y `.agents/templates/sdd/`. `release-notes.md` se mantiene como template de notas, no se inyecta en feature.
4. **Cobertura de tests de templates**: el guard silencioso (`if (fs.existsSync(...))`) de `templates.test.js` fue corregido (2026-08-01) para que la aserción corra siempre y falle alto si el template falta de nuevo.
