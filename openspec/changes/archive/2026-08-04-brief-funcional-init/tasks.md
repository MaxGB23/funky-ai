# Tasks: brief-funcional-init — Brief funcional obligatorio en `funky init`

## Review Workload Forecast

- **400-line budget risk**: Low (~300 lines)
- **Chained PRs recommended**: No
- **Decision needed before apply**: No

## Suggested Work Units (PR único, 1 commit por unidad)

1. **T1** — Rename de tests (prep pura, unit) → commit `test(...)` ✅ `90556f9`
2. **T2** — Template + test real-file (R6, unit) ✅ `53ffd05`
3. **T3** — Refactor init.js a runInit pura (R8, unit) ✅ `217b3e5`
4. **T4** — Guard tests (R8, unit) ✅ `bd145f4`
5. **T5** — Integración (R1/R7, integration) ✅ `50cf012`
6. **T6** — Docs (R9) ✅ `62f5b48`
7. **T7** — Suite completa + contratos manuales ✅ (verificación, sin commit)

## Phase 1: Foundation

- [x] T1 — Rename init.test.js → scaffold.test.js (git mv, contenido intacto). Suite 287/20 verde.
- [x] T2 — Crear tests/init.test.js + template brief-funcional.md (12 ítems §13, formato D4, `[Completar]`, sin `[Responde aquí]`). Test real-file 4/4.

## Phase 2: Core

- [x] T3 — Extraer runInit pura (5 intentions: mkdir, brief, PROJECT, INFRA, guide). Unit 5 tests nuevos (9/9).
- [x] T4 — Cubrir guard (exit(1) + mensaje exacto + copyFileSync NO llamado). Unit 3 tests nuevos (12/12).

## Phase 3: Integration

- [x] T5 — Integración: 4 outputs, brief primero, no-overwrite, skip guide. Integration 3/3 (22/302 suite).

## Phase 4: Docs & Verification

- [x] T6 — Actualizar docs/funky-forge/init.md (árbol, diagrama runInit, salida esperada). help.test.js 9/9 + `--help` verificado.
- [x] T7 — Suite completa 302/22 verde + contratos manuales R1 (4 archivos exit(0); 2ª ejecución exit(1) mensaje exacto). Sin cambios → sin commit.

## Acceptance Criteria Mapping

| Task | Spec Scenario | Notes |
|---|---|---|
| T1 | R8 (puros, sin regresión) | rename puro; runScaffold tests intactos |
| T2 | R6 (template) | test real-file; 12 headers exactos |
| T3 | R8 (refactor) | runInit sin fs/console/exit; orden R7 |
| T4 | R3 (guard) | mensaje byte-exacto; approval test |
| T5 | R1/R7 (outputs/orden) | integración real, tmp bajo cwd |
| T6 | R9 (docs) | help test + --help runtime |
| T7 | R1/R3/R6/R8 | suite 302/22 + contratos manuales |

## Estado

SUCCESS — 7/7 tareas completas. Suite: 22 test files, 302 passed. Detalles en `sdd/brief-funcional-init/apply-progress` (obs #341).
