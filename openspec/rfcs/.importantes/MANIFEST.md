# MANIFEST — `.importantes`

> Mapa de archivos relevantes para la feature de **returns** (interactive phase handoff + phase return contracts).  
> Cada entrada describe qué contiene el archivo, cómo se relaciona con secciones aprobadas en `refactor-tasks/index.md`, y qué rol juega en el framework.

---

## 📄 `return.md`

**Propósito:** Fragmento extraído del contrato Return Envelope (sección 3.1 de `spec-roles-subagents.md`).  
**Contenido:** Define cómo los subagentes devuelven datos estructurados al orquestador:
- Fases SDD: el envelope ya viene definido en el prompt interno del workflow.
- `funky-worker`: genera `report.md` físico.
- Tareas custom: el orquestador exige formato Markdown estricto.

**Relación con aprobado en `index.md`:**
- `spec-roles-subagents.md` — Punto 3: Ciclo de Vida, Retorno y Persistencia (el Return Envelope).

**Estado:** Fragmento — no es un documento completo. Complementa a `funky-interactive/`.

---

## 📄 `sdd-phase-returns.md`

**Propósito:** RFC que define el **contrato de retorno** (envelope + contenido específico) para cada fase SDD.  
**Contenido:**
- Envelope común (Section D): `status`, `executive_summary`, `detailed_report`, `artifacts`, `next_recommended`, `risks`, `skill_resolution`.
- Envelope específico por fase (explore, propose, spec, design, tasks, apply, verify, archive).
- Formato exacto del forecast en `tasks` (con las líneas literales para guards downstream).
- Resumen visual del flujo de envelopes.

**Estado:** ⚠️ **DESACTUALIZADO.** Basado en Gentle AI. Las decisiones del framework están ahora en `funky-interactive/`. Pendiente de reescribir.

---

## 📂 `sdd-interactive/` (HISTÓRICO)

**Propósito:** Inspiración original de Gentle AI. **Ya no se utiliza como referencia activa.**  
**Contenido:** 10 archivos (01–10) con templates de presentación del orquestador Gentle AI entre fases SDD.

**Estado:** 🗄️ Histórico. Reemplazado por `funky-interactive/`.

---

## 📂 `funky-interactive/` (ACTIVO)

**Propósito:** Define los contratos de retorno y presentación interactiva para el framework **Funky-ai**. Es el resultado del debate de diseño.

**Contenido:** 10 archivos (01–10), cada uno documenta **tres cosas** por fase:
1. **Lo que devuelve el sub-agente** — el envelope / return contract (built-in para workflows, inline para ligeros).
2. **Lo que presenta el orquestador** — template de presentación al humano (modo interactivo).
3. **Comportamiento por modo** — cómo se comporta en Interactive, Auto, y Handoff.

Además, cada archivo incluye:
- Tabla **Tier 2 vs Tier 3** cuando aplica.
- Tabla **Diferencias con Gentle AI** al final.
- **Casos especiales** (blocked, deviations, risk, etc.).

### `01-preflight.md`

**Propósito:** Paso cero — el orquestador **recomienda** valores para los Inquirers de `funky feature` (Tier, Docs, Release, Modo) y espera confirmación.  
**Contenido clave:**
- No es un formulario. El orquestador analiza el pedido y recomienda.
- El humano ejecuta `funky feature` en el CLI con esos valores (o modificados).
- Tres modos: **Interactivo** (defecto T2+), **Auto** (T1, T2 predecible), **Handoff** (IDE explícito).
- El orquestador cachea Tier, Docs, Release, Modo para toda la sesión.
- Si el humano elige valores contradictorios (ej. T1 con 500 líneas), el orquestador advierte.

**Diferencia clave con Gentle AI:** No pregunta 4 grupos (Ritmo, Artefactos, PRs, Revisión). Recomienda y confirma.

### `02-init.md`

**Propósito:** Bootstrap del proyecto SDD (inicialización).  
**Contenido clave:**
- ⏳ **Sugerencia a futuro** — no implementado aún en Funky-ai.
- Corre después del preflight, una sola vez por proyecto.
- Envelope: status, summary, artifacts, next, risks.
- Presentación: stack, Strict TDD, sesión configurada.

**Comportamiento por modo:** Interactivo (pregunta), Auto (sigue), Handoff (prepara copy-paste).

### `03-explore.md`

**Propósito:** Investigación del código antes de comprometerse con un cambio.  
**Contenido clave:**
- **Dos versiones:** Explore SDD (fase formal, Tier 3+) y **Explore Ligero** (Sabueso desechable, fuera SDD o Tier 1-2).
- Explore Ligero: **no persiste artefacto**, return inline (hallazgo: qué, dónde, contexto).
- El Sabueso se invoca con prompt hiper-estricto, devuelve solo findings.
- En Tier 2, los findings del Sabueso se **inyectan en el prompt del propose** (no hay archivo intermedio).
- En Tier 3+, explore persiste artefacto y propose lo lee desde disco.

**Casos especiales:** `Ready for Proposal: No`, `Status: blocked`, sin áreas afectadas.

### `04-propose.md`

**Propósito:** Contrato con el usuario: qué se va a hacer, qué no, cómo, y cómo se vuelve atrás.  
**Contenido clave:**
- **Tier 2:** Mini-delegación (prompt armado por orquestador, template de funky feature + replace content).
- **Tier 3+:** Workflow `funky-propose` completo.
- En Tier 2, si hay Explore Ligero previo, los findings se inyectan inline en el prompt del propose.
- Rollback plan obligatorio.

**Casos especiales:** Risk Level High (checkpoint lite en Auto), rollback no definido (warning).

### `05-spec.md`

**Propósito:** Delta specs con requirements y escenarios Given/When/Then.  
**Contenido clave:**
- **Tier 2:** Mini-delegación, solo happy paths + error principal.
- **Tier 3+:** Workflow `funky-spec` completo, happy + edge + error states.
- Coverage se marca con warning si error states están parciales.

**Casos especiales:** Specs MODIFIED (mencionar cambios), coverage baja (warning).

### `06-design.md`

**Propósito:** Decisiones técnicas, arquitectura, archivos afectados, testing strategy.  
**Contenido clave:**
- **Solo Tier 3.** No existe flag `has_design`. Tier 3 = design siempre.
- Excepción rara: si el spec cubre toda la arquitectura y la implementación es mecánica, se puede saltar con aprobación humana.
- Open Questions blocking → frena.

### `07-tasks.md`

**Propósito:** Desglose en tareas + Review Workload Forecast.  
**Contenido clave:**
- **No hay chained PRs.** El split es batching secuencial en la misma rama.
- Forecast >400 líneas → batching proactivo, no estrategias de PR.
- **Review Workload Guard:** en Interactivo pregunta si subdividir, en Auto subdivide automático.
- Tier 2 vs Tier 3: T2 recibe solo spec ligero, T3 recibe spec + design.
- **No escala Tier por riesgo de tasks.** El riesgo influye en el batching, no en el Tier. Única excepción: riesgo CRITICAL (seguridad, pérdida de datos) — frena y alerta al humano.

**Relación directa con:** `spec-orchestrator-rules.md` §7 (Phase Batching).

### `08-apply.md`

**Propósito:** Implementación de tareas en batches secuenciales.  
**Contenido clave:**
- **Checkpoint pre-apply SIEMPRE** (incluso en Auto). El humano elige CLI o IDE.
- Tres modos con comportamientos distintos.
- Batch boundary claro: qué incluye cada batch y su impacto en review budget.
- **Worker Reactivo:** si el worker se satura, commit parcial + `report.md` + frena.

**Casos especiales:** Deviations destacadas, Strict TDD (tabla TDD Cycle Evidence), blocked.

### `09-verify.md`

**Propósito:** Quality gate — build + tests + validación contra specs.  
**Contenido clave:**
- **Tier 2 (ligero):** Obligatorio. Build + tests + clasificación de issues. Sin compliance matrix.
- **Tier 3 (completo):** Build + tests + compliance matrix + design coherence + NFR tracing.
- **Veredictos:** PASS / PASS WITH FUNCTIONAL WARNINGS / PASS WITH COSMETIC WARNINGS / FAIL.
- **Acción para el orquestador:** Campo explícito que guía el siguiente paso (archive, re-apply, fix inline, anotar).
- CRITICAL y FUNCTIONAL WARNING → re-apply. COSMETIC WARNING → fix inline si <5 líneas.

### `10-archive.md`

**Propósito:** Cierre del ciclo — fusiona delta specs al source of truth.  
**Contenido clave:**
- Mueve artefactos a `docs/openspec/changes/archive/`.
- No borra el directorio de trabajo.
- **No pregunta "ajustar o continuar".** Pregunta qué sigue (otro cambio, otra cosa, cerrar sesión).

---

## Relaciones entre archivos

| Concepto | Dónde se define | Dónde se implementa (Funky-ai) |
|----------|----------------|----------------------------------|
| Envelope común + fase-específico | Pendiente de actualizar en `sdd-phase-returns.md` | `funky-interactive/*` (cada archivo) |
| Preflight (recomendación + confirmación) | `spec-cli-ide-boundaries.md` §5 | `funky-interactive/01-preflight.md` |
| Return Envelope como mecanismo | `spec-roles-subagents.md` §3 | `return.md`, `funky-interactive/*` |
| Modos del orquestador (Interactivo/Auto/Handoff) | `spec-roles-subagents.md` §4 | Todo `funky-interactive/*` |
| Phase batching / task budgeting | `spec-orchestrator-rules.md` §7 | `funky-interactive/07-tasks.md`, `08-apply.md` |
| Explore Ligero (Sabueso) | `spec-roles-subagents.md` Anexo | `funky-interactive/03-explore.md` |
| Checkpoint pre-apply | `spec-roles-subagents.md` §4.4 | `funky-interactive/08-apply.md` |
| Verify con Acción explícita | — | `funky-interactive/09-verify.md` |
| **Delegación Tier 2 (ligeros + workflows)** | `tier2-delegation-rules.md` | `funky-inputs.md` (§2, §3, §6, §8, §9) |

## Gaps resueltos vs el manifiesto anterior

| Gap anterior | Estado actual |
|-------------|---------------|
| No había `sdd-auto/` | `funky-interactive/*` incluye comportamiento por modo (Interactive / Auto / Handoff) en cada fase |
| No se especificaba CLI vs IDE | `funky-interactive/*` incluye Handoff como tercer modo, con Ley de Invarianza y bloque copy-paste |

## Estado de los archivos

| Archivo | Estado |
|---------|--------|
| `return.md` | ✅ Fragmento histórico — útil como referencia |
| `sdd-phase-returns.md` | ⚠️ **Desactualizado** — pendiente de reescribir con datos de `funky-interactive/` |
| `sdd-interactive/` | 🗄️ **Histórico** — inspiración Gentle AI, ya no se usa |
| `funky-interactive/` | ✅ **Activo** — fuente de verdad del framework |
| `funky-inputs.md` | ✅ **Activo** — estructura de fases ligeras (Tier 2) + Explore Tier 3 |
| `tier2-delegation-rules.md` | ✅ **Activo** — contrato inline para ligeros, regla del tag, templates por fase |
| `MANIFEST.md` | ✅ Actualizado |
| `PLAN-consolidar-sdd-phase-returns.md` | ⚠️ Pendiente de actualizar |
