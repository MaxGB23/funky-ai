# Archive Report — brief-funcional-init

## Change

- **Change**: brief-funcional-init
- **Type**: Brief funcional obligatorio en `funky init` — template de 12 ítems §13 como primer output, refactor a `runInit` pura, docs (R1 MOD + R6–R9)
- **Archived**: 2026-08-04 → `openspec/changes/archive/2026-08-04-brief-funcional-init/`
- **Artifact store**: hybrid (openspec + engram) — artefactos de fase en Engram (obs #336–#342); spec vivo en `openspec/specs/init/spec.md`

## Delivery Gate (kill switch)

- `gentle-ai review mode status` → `receipt-driven development: off (decided by global)` (global: off, clone-local: unset)
- No hay artefactos de review que gobiernen este cambio: `mem_search` de topics `sdd/brief-funcional-init/review/*` → 0 resultados; sin transacciones compact-v2 para este candidato.
- **Gate resolution**: Native Review Receipt Gate satisfecho vía la relajación `disabled/unmanaged` (kill switch OFF + sin review que gobierne el cambio; la decisión la toma el gate nativo). No se fabricó aprobación; la entrega sigue la política ordinaria del repo.

## Final State (authority: verify-report obs #342 + final-state facts del orquestador)

- Requirements: **5/5** implementados; scenarios: **7/7** COMPLIANT (R1-MOD, R6, R7 s1/s2, R8 s1/s2, R9)
- Veredicto: **PASS** — `gentle-ai.verify-result/v1`, `evidence_revision: sha256:e1319229...`, test_exit_code 0, build N/A (ESM puro)
- Suite completa: **302/302** tests, **22 files** (`pnpm test`, exit 0, output sha256 `ad0bea2b...`) — refrescada por verify, no confiada
- Tasks: **7/7** completas — todas `[x]` en el topic persistido de tasks (obs #340). Task Completion Gate passed; sin stale checkboxes; sin reconciliación
- CRITICAL: **None**; WARNING: **None**; SUGGESTION: 2 no bloqueantes (ver Contradictions/Notes)
- Commits en main (T1–T6): `90556f9`, `53ffd05`, `217b3e5`, `bd145f4`, `50cf012`, `62f5b48` — confirmados en `git log`. T7 verificación pura, sin commit. **Sin push ni PR** (lo decide el orquestador tras archive)

## Specs Synced (delta → source of truth)

- **Updated**: `openspec/specs/init/spec.md`
  - **MODIFIED** R1 → "Creación de los outputs base" (antes: "Creación de los canvases"): genera `brief-funcional.md` (primero), `PROJECT-CANVAS.md` e `INFRA-CANVAS.md`; crea el directorio `docs/funky-ai/canvas/` si no existe. Reemplazado el **bloque completo** (heading + descripción + escenario); la anotación no normativa del delta "(Previously: solo generaba los dos canvases; sin brief.)" se descartó en el spec vivo (mismo criterio que estimate-redesign).
  - **ADDED** R6 (template del brief funcional), R7 (brief como primer output), R8 (runInit pura), R9 (contrato docs y `--help`) — insertadas después de R5, antes de la sección NFR.
  - **R2–R5 preservados verbatim** (guide create-if-not-exists, guard, idempotencia/error handling, mensaje de éxito). Verificación por re-lectura del archivo: bloques R2–R5 idénticos al pre-merge, sin pérdida ni renumeración. GIVEN bullets: 7 originales + 6 del delta (R6:1, R7:2, R8:2, R9:1) = **13**.
  - Cabecera de proveniencia actualizada (mención de `brief-funcional-init`).
- Headings: el delta ya usaba el formato del spec vivo (`### R#: Título`) → sin normalización necesaria.
- `openspec/config.yaml` no define `rules.archive` → sin restricciones de archive que aplicar.

## Archive Move

- Este cambio se persistió SOLO en Engram: no existía `openspec/changes/brief-funcional-init/` en disco. El archive materializó el audit trail siguiendo el patrón del archive más reciente (`openspec/changes/archive/2026-08-03-estimate-redesign/`): artefactos de fase en markdown limpio + delta bajo `specs/<domain>/` + `archive-report.md`.
- Contenido verificado: `proposal.md`, `exploration.md`, `specs/init/spec.md` (delta), `design.md`, `tasks.md`, `verify-report.md`, `archive-report.md`
- `tasks.md` archivado: 7/7 `[x]`, sin unchecked stale
- El directorio de cambios activos no contiene este cambio (nunca lo contuvo en disco; vive en Engram)
- El archive es audit trail — no se modifica tras sellado

## Implementation & PR State (delivery pendiente)

- 6 commits en `main` (T1–T6) verificados en `git log`; T7 sin cambios.
- **NOTA**: sin push, sin PR — el orquestador coordina la entrega después del archive.
- Worktree ajeno intencional intacto (NO stageado): `D docs/issues/closed/sdd_deviations_report.md`, `?? docs/funky-forge/release-ideas/` — verificado con `git status --porcelain` antes y después del archive. Nunca `git add -A`.
- No se modificó código ni tests durante el archive (reglas respetadas).

## Contradictions / Notes

- SUGGESTIONs del verify-report (obs #342): (1) test real-file del contenido de `init.md` para cerrar regresión silenciosa de R9; (2) drift de lockfile pre-existente (vitest 4.1.10 declarado vs 4.1.4 resuelto; commander ^15.0.0 vs 14.0.3). No bloquean; ambas fuera del alcance del cambio.
- Redacción R8 del delta ("copy guide si no existe") vs D2 del design (guía SIEMPRE en el array, skip delegado a `executeIntentions`): sin contradicción de estado final — ambas fuentes coinciden en el comportamiento observable (la guía nunca se sobrescribe, skip log cuando existe). La semántica operativa la fija D2, aplicado y verificado (R8 s1 COMPLIANT).
- El delta #338 no toca `## Propósito` ni la tabla NFR del spec vivo; se mantienen verbatim por fidelidad al delta. Nota para un futuro cambio de docs: `Propósito` aún describe solo los dos canvases ("genera los canvases iniciales del proyecto") y no menciona el brief — actualización opcional, fuera del scope del delta.
- Engram traceability (observation IDs): explore #336, proposal #337, spec #338, design #339, tasks #340, apply-progress #341, verify-report #342. Este archive-report: topic `sdd/brief-funcional-init/archive-report`.

## Verdict

SDD cycle completo para `brief-funcional-init`: planificado, implementado (6 commits), verificado (PASS 5/5, 7/7, suite 302/22), archivado con specs sincronizadas a la fuente de verdad (R1 reemplazado + R6–R9 agregadas, R2–R5 intactos). Delivery (push/PR) pendiente de coordinación del orquestador.
