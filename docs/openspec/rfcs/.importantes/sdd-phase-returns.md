# SDD Phase Return Contracts — Funky-ai

> Fuente de verdad única para los contratos de retorno entre subagentes y orquestador en el framework Funky-ai.
>
> Decisiones aprobadas en: `refactor-tasks/index.md`
> Implementación activa en: `funky-interactive/*`

---

## Envelope Común (TODAS las fases)

Toda fase SDD devuelve este envelope mínimo al orquestador:

```
status    → success | partial | blocked
summary   → 1-3 frases de lo que se hizo
artifacts → paths escritos (ej. `docs/openspec/changes/{change}/proposal.md`)
next      → próxima fase SDD, o "none"
risks     → riesgos descubiertos, o "None"
```

Ejemplo:

```markdown
**Status**: success
**Summary**: Proposal created for `login-con-google`. Defined scope, approach, and rollback plan.
**Artifacts**: docs/openspec/changes/login-con-google/proposal.md
**Next**: sdd-spec
**Risks**: None
```

**Notas:**
- El orquestador NUNCA recibe el contenido completo del artifact. Solo el envelope + refs (paths).
- No hay `skill_resolution`, `detailed_report`, ni referencias a Engram en el envelope.
- No hay `next_recommended` — solo `next`.
- El artifact completo se persiste al store (`docs/openspec/`) y el orquestador solo guarda la referencia.

---

## 0. Arquitectura del Return Contract

### 0.1 Dos mecanismos de entrega

| Mecanismo | Cómo se entrega el contrato | Aplica a |
|-----------|----------------------------|----------|
| **Built-in** | El return envelope ya está definido dentro del prompt interno del workflow. El orquestador NO necesita exigirlo. | Workflows (Mayormente tier 3): `funky-explore`, `funky-propose`, `funky-spec`, `funky-design`, `funky-tasks`(T2,T3), `funky-apply`, `funky-verify`(T2,T3), `funky-archive`(T2,T3). |
| **Inline** | El orquestador DEBE incluir el formato de retorno en el prompt de delegación. El subagente no tiene workflow propio. | SDD ligeros (Tier 1-2): explore ligero, propose ligero, spec ligero, verify-ligero. También tareas custom de investigación. |

Referencia: `spec-roles-subagents.md` §3.1, §4.3, Anexo.

### 0.2 Dos capas del return

1. **Envelope (subagente → orquestador):** Resumen estructurado. El orquestador recibe solo esto, nunca el artifact completo.
2. **Presentación (orquestador → humano):** Solo en modo interactivo. El orquestador renderiza el envelope como mensaje legible y espera feedback.

### 0.3 Tres modos de operación

| Modo | Cuándo se usa | Comportamiento del orquestador |
|------|--------------|-------------------------------|
| **Interactivo** | Defecto para Tier 2+ con riesgo medio o más de 5 archivos | Pausa entre fases, muestra resultado, pregunta "¿Querés ajustar algo o continuamos?" |
| **Auto** | Tier 1, Tier 2 predecible, cambios rutinarios | Corre fases seguidas. Único checkpoint obligatorio antes de apply (pre-apply) |
| **Handoff** | Humano explícitamente quiere IDE, o el cambio requiere diff visual complejo | Orquestador prepara bloque copy-paste idéntico al prompt nativo (Ley de Invarianza). Humano corre en IDE y vuelve con el Return Envelope |

Referencia: `spec-cli-ide-boundaries.md` §5, `spec-roles-subagents.md` §4.

---

## Preflight (Gate inicial)

> No es una fase SDD. Es el paso cero donde el orquestador **recomienda** valores y el humano los define ejecutando `funky feature`.

No hay sub-agente. El orquestador analiza el pedido del humano y genera una recomendación:

```markdown
Para arrancar, corre en el CLI:

  funky feature login-con-google

Mi recomendación:

  Tier:   T3 (Deep Feature) — toca lógica de auth, modelo nuevo, tests
  Docs:   No — es puro código, no cambia arquitectura documentada
  Release: Minor — nueva funcionalidad, compatible hacia atrás
  Modo:   Interactivo — tiene riesgo medio, conviene revisar fase por fase

Decime qué elegiste cuando termines para que yo sepa cómo seguimos.
```

| Variable | Criterio |
|----------|---------|
| **Tier** | T1 (bug/tweak < 100 líneas), T2 (standard feature < 300 líneas), T3 (deep feature, varios archivos, lógica nueva, incluye design) |
| **Docs** | Sí si toca modelos de datos, flujos existentes, o cambia comportamiento documentado |
| **Release** | Patch (bugfix), Minor (feature nueva), Major (breaking change), Ninguno |
| **Modo** | Interactivo si riesgo > Low o archivos > 5; Auto si es predecible y acotado; Handoff si el humano pidió específicamente IDE |

El humano vuelve con los valores elegidos. Si hay contradicción grande (ej. T1 con 500 líneas), el orquestador advierte. Una vez confirmado, se cachean para toda la sesión.

Referencia completa: `funky-interactive/01-preflight.md`.

---

## Init (Sugerencia a futuro)

> ⏳ No implementado aún en Funky-ai. Este archivo describe cómo debería funcionar cuando se implemente. Mientras tanto, el orquestador arranca directamente con la confirmación del preflight.

**Cuándo:** Después del preflight, una sola vez por proyecto. Detectado automáticamente (si ya existe `sdd-init/{proyecto}` en el store, no vuelve a correr).

**Envelope:**

```markdown
**Status**: success | partial | blocked
**Summary**: SDD initialized for `{project}`. Stack: {stack}. Strict TDD: {enabled/disabled}.
**Artifacts**: docs/openspec/config.yaml
**Next**: según la fase que pidió el humano
**Risks**: None o riesgos detectados
```

**Presentación (primera vez):**

```markdown
✅ SDD listo — "funky-ai"

**Stack**: Node.js v20, pnpm, Commander.js, Go 1.22
**Strict TDD**: ✅ activo — `pnpm test`
**Testing layers**: Unit (Vitest), Integration (supertest), E2E (Playwright)

**Sesión configurada**:
  Modo:     Interactivo
  Tier:     T3
  Release:  Minor

Podemos arrancar.
```

**Comportamiento por modo:**

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resumen + "¿Querés ajustar algo o continuamos?" |
| **Auto** | Muestra resumen y arranca la siguiente fase sin preguntar |
| **Handoff** | Muestra resumen y pregunta si el humano quiere llevar el init al IDE o seguir en CLI |

Referencia completa: `funky-interactive/02-init.md`.

---

## 1. Explore

> Investigación del código antes de comprometerse con un cambio.
> Existe en dos versiones: **Explore SDD** (fase formal, Tier 3+) y **Explore Ligero** (Sabueso desechable, fuera del SDD o Tier 1-2).

### Explore SDD (Tier 3+)

**Envelope (built-in en `funky-explore`):**

```markdown
**Status**: success | partial | blocked
**Summary**: Exploración de {topic} completada. N áreas afectadas, M enfoques comparados.
**Artifacts**: docs/openspec/changes/{change}/explore.md
**Next**: sdd-propose
**Risks**: riesgos encontrados o None
```

**Artefacto persistido:**

```markdown
## Exploration: {topic}
### Current State
### Affected Areas
### Approaches (con pros/cons/effort)
### Recommendation
### Risks
### Ready for Proposal: Yes/No
```

**Presentación interactiva:**

```markdown
🔍 Explore complete — "login-con-google"

📋 **Resumen**: El auth actual usa JWT con email/password vía Prisma.
No hay soporte para OAuth ni providers externos.

📁 **Áreas afectadas**:
- `src/auth/service.ts` — lógica de intercambio de código por token
- `prisma/schema.prisma` — nuevo modelo OAuthAccount
- `src/auth/routes.ts` — nueva ruta de callback OAuth

⚖️ **Enfoques**:
1. **Manual con webfetch** — sin deps externas, más control. Esfuerzo: Medio
2. **Passport.js** — más rápido, agrega dependencia pesada. Esfuerzo: Bajo

✅ **Recomendación**: Manual con webfetch
⚠️ **Riesgos**: Refresh token rotation no está cubierta actualmente
```

**Casos especiales:**
- `Ready for Proposal: No` → no ofrece continuar. Explica qué falta.
- `Status: blocked` → muestra el bloqueo, no avanza.
- Sin áreas afectadas → el explore probablemente no hizo falta. Sugerir saltar a propose.

### Explore Ligero (Sabueso)

**Cuándo:** Investigaciones rápidas fuera del SDD, o en Tier 1-2 donde `funky-explore` completo es excesivo.

**No tiene workflow.** El orquestador arma el prompt con el formato de retorno inline.

**Return estándar** — sin envelope, sin status, sin artifacts:

```markdown
## Hallazgo: {título corto del finding}
**Qué**: {una línea — el finding concreto}
**Dónde**: `path/to/file.ext[:línea]`
**Contexto**: {2-3 líneas — por qué importa, cómo se relaciona}
```

Si hay múltiples hallazgos, se repite el bloque. Cada Sabueso resuelve una sola investigación.

**No persiste artefacto.** Los findings se pasan al propose inline en el prompt de delegación (Tier 2) o se usan como respuesta directa (fuera del SDD).

**Consumo por el propose (Tier 2):**

```
Prompt del propose = template de funky feature + EXPLORE FINDINGS
```

**En Handoff:** el orquestador prepara bloque copy-paste, el humano corre el Sabueso en el IDE, trae los findings de vuelta, y el orquestador los inyecta en el bloque del propose.

**Lo que NO hace el Explore Ligero:**
- No persiste artefacto
- No tiene status / return envelope formal
- No bloquea el flujo SDD
- No pregunta "Ready for Proposal"
- No recibe skills — es desechable y no escribe código

### Comportamiento por modo

| Modo | Explore SDD | Explore Ligero |
|------|------------|----------------|
| **Interactivo** | Muestra resultado + "¿Querés ajustar algo o continuamos?" | Disponible (CLI nativo) |
| **Auto** | Si `Ready for Proposal: Yes`, arranca propose directo. Si `No`, frena | Disponible (CLI nativo) |
| **Handoff** | Prepara bloque copy-paste para IDE, espera Return Envelope | Prepara bloque copy-paste con prompt de Sabueso, humano trae findings |

Referencia completa: `funky-interactive/03-explore.md`.

---

## 2. Propose

> Define el **contrato con el usuario**: qué se va a hacer, qué no, cómo se va a encarar, y cómo se vuelve atrás.

**Cuándo:** Tier 2+ después de explore (o directo si no hizo falta explorar). Tier 1 no tiene propose.

### Tier 3+ (workflow `funky-propose`)

**Envelope (built-in):**

```markdown
**Status**: success | partial | blocked
**Summary**: Proposal creado para `{change}`. N entregables in-scope, M deferidos.
**Artifacts**: docs/openspec/changes/{change}/proposal.md
**Next**: sdd-spec (o sdd-design si specs no aplican)
**Risks**: riesgos o None
```

**Return específico:**

```markdown
## Proposal Created

**Change**: {change-name}

### Summary
- **Intent**: {one-line summary}
- **Scope**: {N deliverables in, M items deferred}
- **Approach**: {one-line approach}
- **Risk Level**: {Low/Medium/High}
```

**Artefacto persistido:**

```markdown
# Proposal: {change-name}

## Intent
{qué problema resuelve, para quién}

## In Scope
- {deliverable 1}
- {deliverable 2}

## Out of Scope
- {deferido 1} — {por qué se difiere}

## Approach
{descripción técnica de cómo se va a implementar}

## Rollback Plan
{cómo se deshace el cambio si hay problemas}

## Risk Level
{Low | Medium | High}
```

### Tier 2 (mini-delegación)

- El orquestador arma un prompt acotado con el template de `funky feature`.
- El sub-agente hace replace content sobre el template y escribe `proposal.md`.
- Si hay Explore Ligero previo, los findings se inyectan inline en el prompt.
- Return: solo el específico, sin envelope formal.

**Flujo Tier 2 con Explore Ligero:**

```
1. Sabueso devuelve findings (inline, sin artifact)
2. Orquestador inyecta findings en el prompt del propose
3. Prompt del propose = template de funky feature + EXPLORE FINDINGS
4. Sub-agente escribe proposal.md y devuelve el return específico
```

**En Handoff (Tier 2):** el humano hace de bus de datos:
```
1. Orquestador prepara Sabueso → humano corre en IDE → trae findings
2. Orquestador prepara propose (template + findings inline)
3. Humano abre otro chat en IDE, pega, sub-agente genera proposal.md
4. Humano vuelve con el Return Envelope
```

### Presentación (ambos tiers)

```markdown
📄 Proposal ready — "login-con-google"

🎯 **Intento**: Agregar login con Google OAuth manteniendo el auth actual
como fallback

📦 **In Scope** (4):
- Ruta de callback OAuth (`/auth/google/callback`)
- Modelo OAuthAccount en Prisma
- Servicio de intercambio de código por token
- UI con botón "Continue with Google"

🚫 **Out of Scope** (2):
- Refresh token rotation (postergado)
- Migración de usuarios existentes (postergado)

⚡ **Approach**: Manual con webfetch + JWT existente. Sin Passport.

🔄 **Rollback**: `git revert` + migration down de OAuthAccount

⚠️ **Risk Level**: Medium — Google API puede cambiar endpoints
```

### Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Querés ajustar algo o continuamos?" |
| **Auto** | Avanza a spec/design directo. Si Risk Level es High, checkpoint lite |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo |

**Casos especiales:**
- `Status: blocked` → muestra bloqueo, no avanza.
- Risk Level High → en Interactivo se marca con énfasis. En Auto, checkpoint lite.
- Rollback no definido → warning.

Referencia completa: `funky-interactive/04-propose.md`.

---

## 3. Spec

> Escribe **delta specs**: requirements concretos con escenarios Given/When/Then.

**Cuándo:** Tier 2+ después de propose (o directo si no hizo falta propose). Tier 1 no tiene spec.

### Tier 3+ (workflow `funky-spec`)

**Envelope (built-in):**

```markdown
**Status**: success | partial | blocked
**Summary**: Specs creados para `{change}`. N dominios, M requirements, K scenarios.
**Artifacts**: docs/openspec/changes/{change}/specs/
**Next**: sdd-design
**Risks**: riesgos o None
```

**Return específico:**

```markdown
## Specs Created

**Change**: {change-name}

### Specs Written
| Domain | Type | Requirements | Scenarios |
|--------|------|-------------|-----------|
| oauth | New | 4 added | 6 |
| user-auth | Delta | 2 modified | 4 |

### Coverage
- Happy paths: covered
- Edge cases: covered
- Error states: covered (2 uncovered)
```

**Artefacto persistido:** Un archivo por dominio en `docs/openspec/changes/{change}/specs/{domain}.md`.

### Tier 2 (mini-delegación)

- Prompt armado por orquestador con template de `funky feature`.
- Solo happy paths + error principal (no edge cases completos).
- Return: solo el específico, sin envelope formal.

### Presentación (ambos tiers)

```markdown
📋 Specs ready — "login-con-google"

| Dominio    | Tipo  | Requirements | Escenarios |
|------------|-------|-------------|------------|
| oauth      | New   | 4 added     | 6          |
| user-auth  | Delta | 2 modified  | 4          |

**Cobertura**:
- Happy paths: ✅ cubiertos
- Edge cases: ✅ cubiertos
- Error states: ⚠️ parcial (2 sin cubrir)

**Siguiente**: Design
```

### Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Querés ajustar algo o continuamos?" |
| **Auto** | Avanza a design/tasks directo. Si coverage de error states es baja, checkpoint lite |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo |

**Casos especiales:**
- Coverage baja en error states → warning, no bloquea.
- Specs MODIFIED → el orquestador menciona qué cambió.
- `Status: blocked` → muestra bloqueo, no avanza.

Referencia completa: `funky-interactive/05-spec.md`.

---

## 4. Design

> Documenta **cómo** se va a implementar lo que los specs definieron. Decisiones técnicas, arquitectura, archivos afectados, testing.

**Cuándo:** Solo Tier 3. No existe `has_design`, no hay versión ligera. Tier 3 = design obligatorio.

Excepción (muy rara): si el spec cubre toda la arquitectura necesaria y la implementación es mecánica, se puede saltar con aprobación humana explícita.

**Envelope (built-in en `funky-design`):**

```markdown
**Status**: success | partial | blocked
**Summary**: Design creado para `{change}`. N decisiones de arquitectura, M archivos afectados.
**Artifacts**: docs/openspec/changes/{change}/design.md
**Next**: sdd-tasks
**Risks**: riesgos o None
```

**Return específico:**

```markdown
## Design Created

**Change**: {change-name}

### Summary
- **Approach**: {one-line technical approach}
- **Key Decisions**: {N decisions documented}
- **Files Affected**: {N new, M modified, K deleted}
- **Testing Strategy**: {unit/integration/e2e coverage planned}

### Open Questions
{List or "None"}
```

**Presentación interactiva:**

```markdown
🏗️ Design ready — "login-con-google"

⚡ **Approach**: OAuthService separado que intercambia código por token
vía webfetch, persiste cuenta en OAuthAccount, delega JWT creation
al AuthService existente.

🧠 **Decisiones clave** (3):
1. OAuthService separado de AuthService — SRP, fácil de testear
2. Modelo OAuthAccount con userId + provider + providerAccountId
3. Callback route handlers en nuevo archivo `oauth.routes.ts`

📁 **Archivos**: 2 nuevos, 1 modificado, 0 eliminados

🧪 **Testing**: Unit (OAuthService), Integration (callback flow)

❓ **Open Questions**: None
```

### Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Querés ajustar algo o continuamos?" |
| **Auto** | Avanza a tasks directo. Si hay Open Questions blocking, frena |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo |

**Casos especiales:**
- Open Questions blocking → frena y pide resolver antes de tasks.
- Open Questions no blocking → se marcan pero no bloquean.
- `Status: blocked` → muestra bloqueo, no avanza.

Referencia completa: `funky-interactive/06-design.md`.

---

## 5. Tasks

> Desglosa el cambio en tareas concretas por fase. Incluye el **Review Workload Forecast** para batching proactivo.

**Cuándo:** Tier 2 y Tier 3 después de spec (o design si aplica). Tier 1 se salta (tasks inline).

**No hay chained PRs.** El split es batching secuencial en la misma rama feature.

### Envelope (built-in en `funky-tasks`)

```markdown
**Status**: success | partial | blocked
**Summary**: Tasks creadas para `{change}`. N tareas en M fases.
**Artifacts**: docs/openspec/changes/{change}/tasks.md
**Next**: sdd-apply
**Risks**: riesgos o None
```

### Return específico

```markdown
## Tasks Created

**Change**: {change-name}

### Breakdown
| Phase | Tasks | Focus |
|-------|-------|-------|
| Phase 1 | 3 | OAuthAccount model + migration |
| Phase 2 | 4 | OAuthService + callback route |
| Phase 3 | 3 | Tests + integration |
| Total | 10 | |

### Review Workload Forecast
- Estimated changed lines: ~520
- 400-line budget risk: High
- Suggested batch split: Phase 1 → Batch 1, Phase 2-3 → Batch 2

### Next Step
Ready for implementation (sdd-apply).
```

### Artefactos persistidos

| Archivo | Rol |
|---------|-----|
| `tasks.md` | **Siempre.** Desglose de tareas operativas. Template de funky feature |
| `docs.md` | **Condicional (T2) / Obligatorio (T3).** Checklist de documentación estructural |
| `release.md` | **Obligatorio si MINOR+.** Checklist de release (SemVer, changelog, GitOps) |

### Review Workload Guard

Cuando el forecast supera 400 líneas estimadas o 5+ archivos, el orquestador aplica **batching proactivo**:

```text
funky-tasks devuelve forecast > 400 líneas
  │
  ├─ Interactivo → muestra warning + pregunta:
  │   "El forecast es de ~520 líneas.
  │    ¿Dividimos en batches o lo dejamos en uno solo?"
  │
  ├─ Auto        → orquestador subdivide automáticamente
  │   (Batch 1: Phase 1, Batch 2: Phase 2-3)
  │
  └─ Handoff     → incluye la recomendación de split
      en el bloque copy-paste
```

**Criterios de subdivisión:**

| Señal | Acción |
|-------|--------|
| > 400 líneas | Dividir en 2+ batches |
| > 5 archivos | Dividir en 2+ batches |
| 3+ fases en breakdown | Cada fase puede ser un batch |
| Risk Level High del propose | Batch más chicos, verificar después de cada uno |
| Worker reporta saturación | Worker Reactivo: commit parcial + report.md, orquestador levanta nuevo worker |

### Riesgo detectado por tasks: NO escala Tier

El riesgo detectado influye **en el batching, no en el Tier**:
- Batch más chicos
- Verify parcial entre batches si el riesgo lo justifica
- El orquestador añade guardrails extra en el prompt del worker

Única excepción: riesgo **CRITICAL** (seguridad, pérdida de datos, breaking change no detectado) → el orquestador frena y alerta al humano para que decida.

### Presentación interactiva

```markdown
📋 Tasks ready — "login-con-google"

**Fases y tareas**:
- Phase 1 (Foundation): 3 tareas — modelo OAuthAccount + migration
- Phase 2 (Core): 4 tareas — OAuthService + callback
- Phase 3 (Tests): 3 tareas — unit, integration, e2e
- **Total**: 10 tareas

⚠️ **Review Workload**: ~520 líneas estimadas — ALTO
```

Si forecast >400, en Interactivo pregunta si subdividir. Si no, "¿Querés ajustar algo o continuamos?"

### Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra breakdown + workload. Si forecast >400, pregunta si subdividir. Si no, "¿Querés ajustar algo o continuamos?" |
| **Auto** | Si forecast >400, subdivide automático y arranca apply. Si no, arranca apply directo |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo. Incluye recomendación de split si aplica |

Referencia completa: `funky-interactive/07-tasks.md`.

---

## 6. Apply

> Implementa las tareas en batches secuenciales. Puede correr en CLI o IDE.

### Checkpoint pre-apply (SIEMPRE)

Incluso en modo Auto. El orquestador presenta el plan y el humano decide dónde ejecutar:

```markdown
⚡ Plan de implementación listo — "login-con-google"

**Batch 1**: Phase 1 (OAuthAccount model + migration) — ~120 líneas
**Batch 2**: Phase 2-3 (Service + routes + tests) — ~400 líneas

¿Dónde lo corremos?

- **CLI**: lo delego directo al worker acá mismo
- **IDE**: te preparo el bloque copy-paste para ver diffs
```

### Envelope (built-in en `funky-apply` o Worker)

```markdown
**Status**: success | partial | blocked
**Summary**: Implementación completada para tasks {X}-{Y}. {N}/{M} tareas.
**Artifacts**: docs/openspec/changes/{change}/tasks.md (actualizado)
**Next**: sdd-apply (más tareas) | sdd-verify (todo completo)
**Risks**: deviations del diseño, issues encontrados o None
```

### Return específico

```markdown
## Implementation Progress

**Change**: {change-name}
**Mode**: {Standard | Strict TDD}

### Completed Tasks
- [x] 1.1 Crear modelo OAuthAccount en Prisma
- [x] 1.2 Generar migration

### Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| prisma/schema.prisma | Modified | Added OAuthAccount model |
| prisma/migrations/... | Created | Migration file |

### Deviations from Design
None — implementation matches design.

### Issues Found
None.

### Remaining Tasks
- [ ] 2.1 Crear OAuthService
- [ ] 2.2 Implementar callback route

### Workload / Batch Boundary
- Mode: batch
- Current work unit: Batch 1 — Phase 1
- Batch boundary: model + migration
- Estimated review budget impact: ~120 líneas

### Status
2/10 tasks complete. Ready for next batch.
```

### Presentación interactiva

```markdown
⚡ Apply batch complete — "login-con-google"

✅ **Completado**: 2/10 tareas (Batch 1: Foundation)

📁 **Archivos cambiados**:
| Archivo | Acción |
|---------|--------|
| prisma/schema.prisma | Modified — OAuthAccount model |
| prisma/migrations/20260709_oauth | Created |

⚠️ **Desviaciones**: None
🐛 **Issues**: None

📊 **Review budget impact**: ~120 líneas

Siguiente: Aplicar Batch 2 (Service + routes + tests)

¿Querés ajustar algo o continuamos?
```

### Comportamiento por modo

| Modo | Checkpoint pre-apply | Durante apply |
|------|---------------------|---------------|
| **Interactivo** | Muestra plan + "¿CLI o IDE?" + "¿Arrancamos?" | Después de cada batch, resultado + "¿Ajustar o continuamos?" |
| **Auto** | Checkpoint lite: muestra plan, pregunta solo si quiere IDE o deja que arranque | Si hay múltiples batches, arranca el siguiente automático. Si blocked, frena |
| **Handoff** | Prepara bloque copy-paste. No pregunta CLI/IDE porque ya está en IDE | Humano trae Return Envelope después de cada batch |

**Casos especiales:**
- Deviations from design → se muestran **DESTACADAS** antes de preguntar.
- `Status: blocked` → no pregunta, explica el bloqueo.
- Worker Reactivo → commit parcial + `report.md`, orquestador levanta worker nuevo.
- Strict TDD → incluir tabla TDD Cycle Evidence en el return.
- Review budget impact → se muestra por batch.

Referencia completa: `funky-interactive/08-apply.md`.

---

## 7. Verify

> **Quality gate.** Corre build + tests, valida contra specs/design, y devuelve un veredicto con **Acción** sugerida para el orquestador.

**Cuándo:** Tier 2 (ligero, obligatorio) y Tier 3 (completo, obligatorio) después de apply. Tier 1 no tiene verify.

### Envelope (built-in en `funky-verify`)

```markdown
**Status**: success | partial | blocked
**Summary**: Verificación completada. N/M escenarios compliant. Verdict: {PASS/FAIL}.
**Artifacts**: docs/openspec/changes/{change}/verify-report.md
**Next**: sdd-archive | sdd-apply | fix inline
**Risks**: issues CRITICAL/WARNING/SUGGESTION
```

### Return específico

```markdown
## Verification Report

**Change**: {change-name}
**Mode**: {Tier 2 Light | Tier 3 Full}
**Verdict**: PASS | PASS WITH FUNCTIONAL WARNINGS | PASS WITH COSMETIC WARNINGS | FAIL

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 10 |
| Tasks complete | 10 |
| Tasks incomplete | 0 |

### Build & Tests
**Build**: ✅ Passed
**Tests**: ✅ 24 passed / 0 failed / 2 skipped
**Coverage**: 87% / threshold: 80% → ✅ Above

### Issues
#### CRITICAL
- {issue} — {evidence, si aplica}

#### FUNCTIONAL WARNING
- {issue} — {afecta comportamiento}

#### COSMETIC WARNING
- {issue} — {solo estilo, naming, comentarios}

#### SUGGESTION
- {issue} — {mejora no crítica}

### Verdict
{veredicto}

### Acción para el Orquestador
PASS                 → /funky-archive
CRITICAL | FUNC WARN → /funky-apply (issues como tareas) → re-verify
COSMETIC WARN        → fix inline si <5 líneas / 1 archivo · sino /funky-apply
SUGGESTION           → anotar en archive, sin acción
```

### Tier 3 extra — Compliance + Design + NFRs

En Tier 3, el return incluye **además**:

```markdown
### Spec Compliance Matrix
| Requirement | Scenario | Result |
|-------------|----------|--------|
| OAUTH-01 | Happy: login with Google | ✅ COMPLIANT |
| OAUTH-02 | Error: invalid code | ✅ COMPLIANT |

### Design Coherence
| Decision | Status | Notes |
|----------|--------|-------|
| OAuthService separado | ✅ | Followed |
```

Y si las tasks incluyeron tags NFR (ej. `nfr:latency`, `nfr:security`), verify confirma umbrales.

### Acción del orquestador según veredicto

| Veredicto | Acción |
|-----------|--------|
| **PASS** | Archive directo |
| **CRITICAL** | NO archivar. Delega `/funky-apply` con los issues como tareas → re-verify |
| **FUNCTIONAL WARNING** | Delega `/funky-apply` con los issues como tareas → re-verify |
| **COSMETIC WARNING** | Fix inline si <5 líneas / 1 archivo. Si no, `/funky-apply` |
| **SUGGESTION** | Anota en archive, no requiere acción |
| **FAIL** | No pregunta. Explica que hay que re-aplicar |

### Presentación interactiva

```markdown
✅ Verify complete — "login-con-google"

🧪 **Tests**: 24 passed / 0 failed / 2 skipped
📊 **Coverage**: 87% (threshold 80%) ✅
✅ **Build**: Passed

🎯 **Verdict**: PASS WITH COSMETIC WARNINGS

🔧 **Cosmetic**: 2 warnings — los arreglo inline ahora (son <5 líneas)
```

### Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado. Según veredicto: pasa a archive, pregunta "¿arreglo inline?", o explica que hay que re-aplicar |
| **Auto** | PASS → archive directo. CRITICAL/FUNC WARN → aplica la acción sin preguntar. COSMETIC → fix inline si aplica. FAIL → frena |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo |

Referencia completa: `funky-interactive/09-verify.md`.

---

## 8. Archive

> Cierra el ciclo. Fusiona los delta specs al source of truth y mueve el cambio a archive.

**Cuándo:** Tier 2 y Tier 3 (obligatorio después de verify). Tier 1 opcional (no hay delta specs).

### Envelope

```markdown
**Status**: success | partial | blocked
**Summary**: Cambio `{change}` archivado. N specs sincronizados.
**Artifacts**: docs/openspec/changes/archive/{YYYY-MM-DD}-{change}/
**Next**: none (ciclo SDD completo)
**Risks**: None
```

### Return específico

```markdown
## Change Archived

**Change**: {change-name}
**Archived to**: docs/openspec/changes/archive/2026-07-09-{change}/

### Specs Synced
| Domain | Action | Details |
|--------|--------|---------|
| oauth | Created | 4 added, 0 modified, 0 removed |
| user-auth | Updated | 0 added, 2 modified, 0 removed |

### Source of Truth Updated
- docs/openspec/specs/oauth/spec.md
- docs/openspec/specs/user-auth/spec.md

### SDD Cycle Complete
```

**Qué produce:**
1. Mueve los artefactos del cambio a `docs/openspec/changes/archive/{YYYY-MM-DD}-{change}/`
2. Actualiza los root specs con los deltas del cambio
3. Persiste el archive-report

No borra el directorio de trabajo del cambio — lo mueve a archive.

### Presentación interactiva

```markdown
📦 Archive complete — "login-con-google"

✅ **Specs sincronizados**:
| Dominio   | Acción   |
|-----------|----------|
| oauth     | Created — 4 requirements |
| user-auth | Updated — 2 requirements modificados |

📁 **Source of truth actualizado**:
- docs/openspec/specs/oauth/spec.md
- docs/openspec/specs/user-auth/spec.md

🎉 **SDD Cycle Complete**

¿Listo para arrancar otro cambio o necesitás algo más?
```

**Diferencia clave con otras fases:** No pregunta "¿Querés ajustar algo o continuamos?" porque el ciclo terminó. Pregunta qué quiere hacer después: arrancar otro cambio, algo no relacionado, o cerrar sesión.

### Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Listo para arrancar otro cambio o necesitás algo más?" |
| **Auto** | Muestra resultado. No pregunta — el ciclo terminó |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo |

Referencia completa: `funky-interactive/10-archive.md`.

---

## Resumen visual

```
                    ┌──────────────────────────────────┐
                    │       ENVELOPE COMÚN              │
                    │  status, summary, artifacts,      │
                    │  next, risks                      │
                    └──────┬───────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
     explore:          propose:          spec:
     Approaches        Intent, Scope     Domain table
     Recommendation    Risk Level        Coverage
   + Explore Ligero   + Tier 2 inline   + Tier 2 light
          │                │                │
     design:            tasks:           apply:
     Solo Tier 3       Breakdown         Completed tasks
     Key Decisions     Batching guard    Files Changed
     Open Questions    No chained PRs    Deviations
          │                │                │
     verify:                          archive:
     Verdicts × 4                    Specs Synced
     Acción explícita                Archive Contents
     CRITICAL/FUNC/COSMETIC/SUG      SDD Cycle Complete
```

## Comportamiento por modo (transversal)

| Fase | Interactivo | Auto | Handoff |
|------|------------|------|---------|
| Preflight | Recomienda + espera confirmación | Recomienda + espera confirmación | Recomienda + espera confirmación |
| Init (futuro) | Muestra + "¿Ajustar o continuamos?" | Muestra y sigue | Prepara copy-paste |
| Explore SDD | Muestra + pregunta | Avanza si Ready, frena si No | Copy-paste + espera envelope |
| Explore Ligero | Responde findings | Responde findings | Copy-paste Sabueso, humano trae findings |
| Propose | Muestra + pregunta | Avanza directo (checkpoint si High) | Copy-paste + espera envelope |
| Spec | Muestra + pregunta | Avanza directo (checkpoint si baja coverage) | Copy-paste + espera envelope |
| Design | Muestra + pregunta | Avanza (frena si Open Questions blocking) | Copy-paste + espera envelope |
| Tasks | Muestra + pregunta. Si >400, pregunta split | Subdivide auto si >400, arranca apply | Copy-paste + recomendación de split |
| Apply | Checkpoint CLI/IDE + "¿Arrancamos?" + resultado por batch | Checkpoint lite + arranca, sigue automático | Copy-paste + espera envelope por batch |
| Verify | Muestra + según veredicto | PASS → archive. FAIL → frena. Aplica acción | Copy-paste + espera envelope |
| Archive | Muestra + "¿Qué sigue?" | Muestra (ciclo terminó) | Copy-paste + espera envelope |

---

## Referencias

| Documento | Contenido |
|-----------|-----------|
| `funky-interactive/01-preflight.md` a `10-archive.md` | Implementación activa de cada fase |
| `spec-roles-subagents.md` §3.1 | Mecanismo built-in vs inline |
| `spec-roles-subagents.md` §4.3 | Mini-delegación en Tier 2 |
| `spec-roles-subagents.md` Anexo | Explore Ligero (Sabueso) |
| `spec-cli-ide-boundaries.md` §5 | Modos de ejecución (Interactivo/Auto/Handoff) |
| `spec-orchestrator-rules.md` §7 | Phase batching y task budgeting |
