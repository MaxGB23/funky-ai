# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador.

---

## 🏷️ Estado Actual
- **Versión:** v4.9.0
- **Rama activa:** `main`
- **Última sesión:** 2026-08-24
- **Estado:** 🟢 Publicada. Release v4.9.0: session gate binario en el Paso 0 del orquestador (pregunta ideación/implementación con respuesta vinculante para el Tier), sdd-preflight degradado a subrutina manual con check CORE y POST-CONFIRMACIÓN reforzada (metodologías antes del router), tasks-tdd.md eliminado con sus reglas migradas a metodologias.md como entrada [tasks], agente custom sdd-docs-sync validado end-to-end, bootstrap reads restringidos en global chilango, y primer test e2e del framework archivado (arbol-navidad-cli). 6 work units + docs-sync delegado.

---

## 📂 Archivos Clave

### Contextuales
| Categoría | Dónde |
|-----------|-------|
| `.agents/templates/sdd/` | Templates "golden" — **Convenciones específicas de este workspace** |
| CLI base templates (distribución) | `funky-cli/src/templates/sdd/` — **Convenciones generales para generar nuevos proyectos** |
| Living Specs + RFCs + Changes | `openspec/specs/`, `openspec/rfcs/`, `openspec/changes/` |
| Release notes completas | `docs/funky-ai/releases/` |

---

## ✅ Tareas Completadas
- [x] **v4.6.0 — funky secure v1 (doctor/init/check):** el estándar de hardening de dependencias pnpm del RFC `feature-secure.md` pasa de documento a CLI: `funky secure doctor` (diagnóstico conductual solo lectura — `pnpm config list --json`, la única vía para leer claves de workspace YAML), `init` (seed idempotente de `pnpm-workspace.yaml` con 7 claves estándar, bloque AGENTS.md, baseline SHA-256 de dev hooks, `.gitignore` `.funky/`, pin de `packageManager`; postura `fail-silent`/`fail-fast`, sin TTY `--posture` obligatorio), `check` (gate CI-ready exit 0/1, violaciones tipadas). Normalización cross-version pnpm 10.x/11.x (kebab-case vs camelCase) y dedup de shims win32 (`.exe`/`.CMD`). Refactor `funky assess` incluido (architecture-review eliminado). 412 tests / 34 archivos verdes (415 pre-refactor). Docs sync post-merge: `secure.md` + SSOT + README "Novedad". PR #40 mergeado (`d57de04`). Lanzado 2026-08-11.
- [x] **Testing-modernization:** Migración Anti-Brittle (Snapshots/Structural) y Extracción de responsabilidades en `estimateDomain.js`.
---

## ⏳ Tareas Pendientes

### FUNKY-AI
Roadmap sugerido: 2 -> 1 -> 3 -> 4 (pero esto no es mandatorio).

- [ ] 1. Revisar los archivos dentro de `./openspec/rfcs/funky-scope-propuesta` y decidir el futuro de funky-forge. Hacia dónde debe evolucionar.
- [ ] 2. Correr el smoke test manual del comando pipeline. Esto es unicamente con el proposito de entender cómo funciona el comando pipeline antes de decidir el futuro de funky-forge.
- [ ] 3. Refactor de documentaciones, separar bien por dominios.
- [ ] 4. Smoke test del comando funky secure.
- [ ] 5. Feature conjunta funkygram (minor): mejorar `funky engram add` agregando parámetros `--what`, `--why`, `--where`, `--learned` para que el CLI genere el archivo con los campos llenos (hoy genera esqueleto vacío y hay que editar manualmente), y actualizar `engram-protocol.md` con las reglas de campos flexibles: What + Why siempre obligatorios, Where solo si se tocaron archivos, Learned solo si hubo gotchas. El CLI debe respetar las mismas reglas de omisión — flag no pasado = campo ausente en el archivo generado, nunca campo vacío; evitar texto vacío que ensucie el funkygram. También arreglar el index generation — no incluye prefijo `[TYPE]` como las entradas existentes.

- [ ] 6. **funky feature: flags deterministas, matriz de validación y auto-scaffold en Pre-Flight:**                                                                     
- **CLI (funky-cli):** Agregar opciones no interactivas a `funky feature <name>` (`--tier <t1|t2|t3>`,`--docs`/`--no-docs`).     
Validar combinaciones ilegales mediante una matriz pura (ej: T1 rechaza `--docs`) con tests de integración deflags.                                                       
- **SSOT & Reglas:** Documentar la matriz de compatibilidad en `sdd-preflight.md`, `help` y docs oficiales para que el Orquestador opere con contrato formal.          
- **Orquestador (Hard-Gate & Fallback):** Mantener el enfoque *Human-First*. Si el desarrollador solo confirma los parámetros en chat y el scaffold no existe en disco,
el Hard-Gate faculta al Orquestador a ofrecer la ejecución directa del comando con los flags confirmados antes de bloquearse.   

- [ ] DRAFT: He pensado en hacer un custom agent para sdd-orchestrator, ya que depende de que el trigger sea activado. custom-agents-inheritance.md menciona algo pero es mucho trabajo como para implementarlo ahora, ya que no hereda prompts globales y requiere dejarle claro todo con referencias u otra estrategia.

### EXTERNOS
- [ ] EXT-1. Reinstalar todo y verificar si el mcp de Engram funciona en antigravity cli, esto nos ahorraría mucho trabajo ya que el usar el mcp es mejor que usar el funkygram. Si el mcp funciona, debemos migrar todo el "engram" que no sea mcp a "funkygram", esto evitaría confusiones y tendrían su rol en específico. Engram MCP sqlite y Funkygram basado en files md.
- [ ] EXT-2. Añadir colores al repo funky-theme para git untracked/modified/deleted en terminal, actualmente se usa default "rojo". 

---

## 🐛 Bugs Activos


---

## 📋 Historial de Versiones (Resumen)
| Versión | Descripción |
|---------|-------------|
| v4.2.0 | **MINOR** — funky skills v2: instalador interactivo (multiselect "Todas"/cancel, autodetección `src/skills/` por manifest-per-skill); índice seccional 3 niveles; `sdd-release` inyecta `release-notes.md`; regla doc-nuevo en `sdd-docs-sync`; gap docs v4.1.0 cerrado. 284 tests verdes. Lanzado 2026-08-04. |
| v4.3.1 | **PATCH** — refactor de organización de tests: `estimate.test.js` partido en 4 archivos por unidad bajo prueba; meta-test `organization.test.js` (cohesión + topes de tamaño, `LEGACY_EXCEPTIONS` vacío); deuda legacy migrada (`pipeline`→`.integration`, `assess` split, `context` trim, `skills` cohesionado); convención en skill `vitest`; `AGENTS.md` recortado a 26 líneas. 311 tests / 27 archivos verdes con vitest 4.1.10. Lanzado 2026-08-05. |
| v4.6.0 | **MINOR** — funky secure v1 (PR #40): `doctor` (diagnóstico conductual), `init` (seed idempotente de la política pnpm: 7 claves estándar, bloque AGENTS, baseline SHA-256 de hooks, `.gitignore`, pin packageManager; posturas fail-silent/fail-fast), `check` (gate CI-ready exit 0/1); normalización pnpm 10.x/11.x + dedup win32; refactor assess (architecture-review eliminado); docs sync post-merge (secure.md en SSOT, README "Novedad"). 412 tests / 34 archivos verdes. Lanzado 2026-08-11. |
| v4.7.0 | **MINOR** — refactor canvas-phase-1: canvas es recolector pasivo, assess asume rol de juez arquitectónico definitivo validado contra 4 ejes (se elimina architecture-review.md). estimate mejora DX en tópicos, severidad y reglas multiplicativas. 412 tests verdes (más tests de integración/dominio agregados). Docs sync: assess.md alineado al CLI. Lanzado 2026-08-12. |
| v4.8.0 | **MINOR** — refactor del framework SDD: Route A sabueso (subagente flash_lite + MCP codegraph), metodologías data-driven, contrato t2-apply con slots unificados, Contexto Previo pasivo (workers desacoplados de funkygram), routers T1/T2/T3 alineados, harness modelo-por-fase, custom-workflows T3 inyectables vía sdd-install (27 reglas). Modernización anti-brittle de tests (~150 aserciones → snapshots/golden/tokens) y RFC 014 aplicado (spec.template.md). 411 tests / 36 archivos verdes. Docs-sync delegado con contrato de rango de commits. Lanzado 2026-08-24. |
| v4.9.0 | **MINOR** — session gate binario: Paso 0 abre preguntando ideación/implementación, respuesta humana vinculante para el Tier (ideación siempre T0); sdd-preflight manual-only con check CORE; POST-CONFIRMACIÓN ordena metodologías→router mismo turno; tasks-tdd.md eliminado (reglas → metodologias [tasks]); agente custom sdd-docs-sync validado; bootstrap reads restringidos; test e2e archivado (arbol-navidad-cli). Docs-sync delegado verificado byte-parity de mirrors. Lanzado 2026-08-24. |