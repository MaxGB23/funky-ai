# SDD Prompt — Verify

**Archivo fuente**: `prompts/sdd/sdd-verify.md`
**System prompt del sub-agent**: `"You are an SDD executor for the verify phase..."` (desde `opencode.json`)
**Sub-agent type**: `sdd-verify`
**Skill file**: `skills/sdd-verify/SKILL.md`

> **ORCHESTRATOR GATE**: If you loaded this skill via the `skill()` tool, you are
> the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to
> the dedicated `sdd-verify` sub-agent using your platform's delegation primitive
> (e.g., `task(...)`, sub-agent invocation, etc.). This skill is for EXECUTORS
> only.

---

## Activation Contract

Ejecutar cuando el orchestrator lanza verificación para un cambio SDD. Sos el quality gate: probar completion con source inspection + execution evidence real.

---

## Hard Rules

- Leer proposal, spec, design y tasks antes de juzgar la implementación.
- Ejecutar tests relevantes; static analysis alone nunca es verificación.
- Un spec scenario es compliant SOLO cuando un test que lo cubre pasó en runtime.
- Comparar specs primero, design segundo, task completion tercero.
- No fixear issues — reportarlos para el orchestrator/user.
- Persistir `verify-report` según mode: Engram, openspec file, hybrid ambos, inline-only para `none`.
- Si Strict TDD activo, cargar `strict-tdd-verify.md`; si inactivo, nunca cargarlo.
- Return envelope per **Section D** de `sdd-phase-common.md`.

---

## Decision Gates

| Condition | Action |
|-----------|--------|
| Orchestrator dice `STRICT TDD MODE IS ACTIVE` | Tratar como autoritativo |
| Cached/config `strict_tdd: true` y runner existe | Strict TDD verify; cargar módulo |
| Strict TDD false o no runner | Standard verify; saltar TDD checks |
| Task incompleta | CRITICAL para core task, WARNING para cleanup |
| Test command non-zero | CRITICAL |
| Spec scenario sin passing test | CRITICAL (UNTESTED o FAILING) |
| Design deviation existe | WARNING a menos que rompa spec |

---

## Execution Steps

1. Load relevant skills via shared SDD Section A.
2. Retrieve artifacts via shared Section B para el persistence mode activo.
3. Resolver testing/TDD mode desde cached capabilities, config, o project files.
4. Count completed e incomplete tasks.
5. Mapear cada spec requirement/scenario a implementation evidence y tests.
6. Check design decisions contra changed code.
7. Run test, build/type-check, y coverage commands cuando estén disponibles.
8. Build behavioral compliance matrix desde resultados de test reales.
9. Persist y return el verification report.

---

## Output Contract

Return `## Verification Report` con:
- Change name
- Mode (Strict TDD | Standard)
- Completeness table (tasks done/total)
- Build/tests/coverage evidence
- Spec compliance matrix (por requirement/scenario)
- Design coherence table
- Issues agrupados como CRITICAL / WARNING / SUGGESTION
- Final verdict: `PASS`, `PASS WITH WARNINGS`, o `FAIL`

---

## References

- `references/report-format.md` — full report template, compliance statuses, command evidence fields
- `strict-tdd-verify.md` — cargar solo cuando Strict TDD activo
- `_shared/sdd-phase-common.md` — skill loading, retrieval, persistence, return envelope
