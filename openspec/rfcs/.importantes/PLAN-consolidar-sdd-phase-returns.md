# Plan: Reescribir `sdd-phase-returns.md`

> El RFC viejo está desactualizado (basado en Gentle AI). Las decisiones del framework ya están tomadas en `funky-interactive/`.  
> Este plan detalla cómo reescribir `sdd-phase-returns.md` para que sea la fuente de verdad única, alineada con `funky-interactive/` y `refactor-tasks/`.

---

## Estado actual después del debate

| Situación | Estado |
|-----------|--------|
| `refactor-tasks/` | ✅ Corregido (incongruencias arregladas durante el debate) |
| `funky-interactive/` | ✅ Creado con todas las decisiones del framework |
| `sdd-interactive/` | 🗄️ Histórico (inspiración Gentle AI, no se usa más) |
| `sdd-phase-returns.md` | ❌ Desactualizado — hay que reescribirlo |

---

## Qué debe cambiar en `sdd-phase-returns.md`

### 1. Header y origen

- ❌ "Referencia extraída del orchestrator Gentle AI (skill `_shared/sdd-phase-common.md`)"
- ✅ "Fuente de verdad del framework Funky-ai. Decisiones en `refactor-tasks/` y `funky-interactive/`."

### 2. Envelope común (Section D)

- ❌ `skill_resolution` — no se usa en Funky-ai
- ❌ Referencia a `_shared/sdd-phase-common.md`
- ❌ `detailed_report` — no se usa, el orquestador solo ve el envelope
- ❌ Ejemplo con Engram + OpenSpec — Funky-ai solo usa `docs/openspec/`
- ✅ Envelope simplificado: `status`, `summary`, `artifacts`, `next`, `risks`
- ✅ Ejemplo actualizado con paths de Funky-ai

### 3. Preflight — sección nueva

Basado en `funky-interactive/01-preflight.md`:
- No es formulario de 4 grupos. Es recomendación + confirmación.
- El orquestador recomienda Tier, Docs, Release, Modo.
- El humano ejecuta `funky feature` y vuelve con la confirmación.
- Tres modos: Interactivo, Auto, Handoff.

### 4. Init — sección nueva (sugerencia a futuro)

Basado en `funky-interactive/02-init.md`:
- ⏳ No implementado aún. El orquestador arranca con el stack que conoce.
- Cuando exista: corre después del preflight, una sola vez por proyecto.

### 5. Explore — dos niveles

Basado en `funky-interactive/03-explore.md`:
- **Explore SDD (Tier 3+):** Workflow `funky-explore`, persiste artefacto, envelope completo.
- **Explore Ligero (Sabueso, fuera del SDD o Tier 1-2):** Subagente desechable de solo lectura, NO persiste artefacto, return inline sin envelope formal.
- En Tier 2: findings del Sabueso se inyectan en el prompt del propose.

### 6. Propose — dos niveles

Basado en `funky-interactive/04-propose.md`:
- **Tier 3+:** Workflow `funky-propose`, envelope completo, artefacto `proposal.md`.
- **Tier 2:** Mini-delegación, prompt armado por orquestador, template de `funky feature` + replace content.
- En Tier 2 con Explore Ligero: findings inyectados inline en el prompt del propose.
- Artifact path: `docs/openspec/changes/{change}/proposal.md`

### 7. Spec — dos niveles

Basado en `funky-interactive/05-spec.md`:
- **Tier 3+:** Workflow `funky-spec`, envelope completo, coverage completa (happy + edge + error).
- **Tier 2:** Mini-delegación, solo happy paths + error principal.
- Coverage baja en error states → warning pero no bloquea.

### 8. Design — solo Tier 3

Basado en `funky-interactive/06-design.md`:
- ❌ No existe `has_design`. ❌ No existe versión ligera.
- ✅ Tier 3 = design siempre. Excepción rara con aprobación humana.

### 9. Tasks — sin chained PRs

Basado en `funky-interactive/07-tasks.md`:
- ❌ No hay `Chained PRs recommended`, `Decision needed before apply`, `Chain strategy`.
- ❌ No hay líneas literales para guards de PR strategies.
- ✅ Forecast >400 líneas → batching secuencial en misma rama.
- ✅ Review Workload Guard: en Interactivo pregunta "¿Dividimos en batches?". En Auto subdivide automático.
- ✅ Verify parcial entre batches solo si riesgo lo justifica (Tier 3).
- ✅ No escala Tier por riesgo de tasks. Riesgo CRITICAL frena y alerta al humano.

### 10. Apply — checkpoint pre-apply siempre

Basado en `funky-interactive/08-apply.md`:
- ✅ Checkpoint pre-apply SIEMPRE (incluso en Auto). Humano elige CLI o IDE.
- ✅ Batch boundary: qué incluye cada batch.
- ❌ No más `PR boundary` con `chained PR slice`.
- ✅ Worker Reactivo: commit parcial + `report.md` si el worker se satura.

### 11. Verify — veredictos granulados + Acción

Basado en `funky-interactive/09-verify.md`:
- ✅ Veredictos: PASS / PASS WITH FUNCTIONAL WARNINGS / PASS WITH COSMETIC WARNINGS / FAIL.
- ✅ **Acción para el orquestador:** campo explícito que guía el siguiente paso.
- ✅ CRITICAL + FUNCTIONAL WARNING → re-apply. COSMETIC → fix inline si <5 líneas.
- ✅ Tier 2 (ligero): build + tests + issues. Sin compliance matrix.
- ✅ Tier 3 (completo): + compliance matrix + design coherence + NFR tracing.

### 12. Archive

Basado en `funky-interactive/10-archive.md`:
- ✅ Mueve a `docs/openspec/changes/archive/`.
- ✅ No pregunta "ajustar o continuar". Pregunta qué sigue.

---

## Orden de reescritura

1. Header + envelope común (simplificado, sin skill_resolution, sin Engram)
2. Sección 0: Arquitectura del Return Contract (built-in vs inline, dos niveles)
3. Preflight (no es fase SDD)
4. Init (sugerencia a futuro)
5. Explore → Propose → Spec → Design → Tasks → Apply → Verify → Archive
6. Resumen visual actualizado
7. Tabla de comportamientos por modo (Interactive / Auto / Handoff)

---

## Fuentes activas

| Para escribir | Usar como referencia |
|--------------|---------------------|
| Envelope de cada fase | `funky-interactive/*` → "Lo que devuelve el sub-agente" |
| Presentación interactiva | `funky-interactive/*` → "Lo que presenta el orquestador" |
| Comportamiento por modo | `funky-interactive/*` → "Comportamiento por modo" |
| Tier 2 vs Tier 3 | `funky-interactive/*` → tabla comparativa |
| Mecanismo built-in vs inline | `spec-roles-subagents.md` §3.1, §4.3, Anexo |
| Phase batching | `spec-orchestrator-rules.md` §7 |
| Modos de operación | `spec-cli-ide-boundaries.md` §5 |
| Todo el detalle fino | `funky-interactive/*` — es la fuente de verdad actual |

---

## Gaps resueltos (vs el plan anterior)

| Gap anterior | Resolución |
|-------------|-----------|
| Modo interactive/auto lo decide el Tier o el humano? | Lo recomienda el orquestador, el humano lo define en `funky feature` |
| Explore Ligero sin artifact persistido | Return inline sin envelope formal. Findings pasan al propose inline. |
| Design tiene versión ligera? | No. Solo Tier 3. |
| Chained PRs o batching? | Batching secuencial en misma rama. No hay chained PRs. |
| Skill Resolution? | No se usa en Funky-ai. |
| Engram + OpenSpec? | Solo `docs/openspec/`. |
