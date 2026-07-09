# Funky-ai Interactive — Tasks

> Desglosa el cambio en tareas concretas por fase. Incluye el **Review Workload
> Forecast** que determina si el orquestador necesita subdividir batches antes
> de apply.

---

## Cuándo se usa

- **Tier 2 y Tier 3**: siempre después de spec (o design si aplica).
- **Tier 1**: se salta — el orquestador genera tasks inline.

En ambos tiers (2 y 3), `funky-tasks` trabaja sobre el **template de `funky feature`**.
La diferencia está en qué otros archivos coexisten:

| Archivo | Tier 2 | Tier 3 |
|---------|--------|--------|
| `tasks.md` | ✅ Template + replace content | ✅ Template + replace content |
| `docs.md` | Condicional (si impacta docs core) | ✅ **Obligatorio** (MAJOR = toca docs) |
| `release.md` | ✅ Obligatorio (MINOR+) | ✅ Obligatorio |

Además, Tier 3 recibe `spec.md` + `design.md` como input para generar tasks
más ricas. Tier 2 solo recibe spec ligero.

## Lo que devuelve el sub-agente (`funky-tasks`)

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Tasks creadas para `{change}`. N tareas en M fases.
**Artifacts**: `docs/openspec/changes/{change}/tasks.md`
**Next**: sdd-apply
**Risks**: riesgos o None
```

**Return específico**:

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

**Artefactos persistidos** en `docs/openspec/changes/{change}/`:

| Archivo | Rol |
|---------|-----|
| `tasks.md` | **Siempre.** Desglose de tareas operativas. Template de funky feature |
| `docs.md` | **Condicional (T2) / Obligatorio (T3).** Checklist de documentación estructural |
| `release.md` | **Obligatorio si MINOR+.** Checklist de release (SemVer, changelog, GitOps) |

El template de `tasks.md` incluye:

```markdown
# Tasks: {change-name}

## Phase 0: Branch Setup
- [ ] Crear rama feature desde main

## Phase 1: {nombre}
- [ ] {task 1.1}
- [ ] {task 1.2}

## Phase N: Cierre y Merge
- Si hay `release.md`: [transición a release]
- Si no: merge a main + limpieza

## Docs
{Sí hay docs.md → checklist de documentación}

## Release
{Sí hay release.md → checklist de release}
```

## Lo que presenta el orquestador

```markdown
📋 Tasks ready — "login-con-google"

**Fases y tareas**:
- Phase 1 (Foundation): 3 tareas — modelo OAuthAccount + migration
- Phase 2 (Core): 4 tareas — OAuthService + callback
- Phase 3 (Tests): 3 tareas — unit, integration, e2e
- **Total**: 10 tareas

⚠️ **Review Workload**: ~520 líneas estimadas — ALTO
```

## Review Workload Guard

Cuando el forecast supera 400 líneas estimadas o 5+ archivos, el orquestador
aplica **batching proactivo**: subdivide el trabajo antes de apply.

### Flujo del Guard

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

### Criterios de subdivisión

| Señal | Acción |
|-------|--------|
| > 400 líneas | Dividir en 2+ batches |
| > 5 archivos | Dividir en 2+ batches |
| 3+ fases en breakdown | Cada fase puede ser un batch |
| Risk Level High del propose | Batch más chicos, verificar después de cada uno |
| Worker reporta saturación | Worker Reactivo: commit parcial + report.md, orquestador levanta nuevo worker |

### Diferencia con Gentle AI

Gentle AI ofrece chained PRs, feature branch chains, size exceptions como
opciones. Funky-ai **no tiene esos mecanismos** — acá la subdivisión es en
**batches de ejecución secuencial** dentro de la misma rama feature.

El >400 líneas no activa estrategias de PRs encadenados. Activa batching:

```
Sin batching:   [apply → apply → ... → verify → archive]
Con batching:   [Batch 1 → verify parcial? → Batch 2 → verify → archive]
```

## Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra breakdown + workload. Si forecast >400, pregunta si subdividir. Si no, "¿Querés ajustar algo o continuamos?" |
| **Auto** | Si forecast >400, subdivide automático y arranca apply. Si no, arranca apply directo |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo. Incluye recomendación de split si aplica |

## Casos especiales

- **Status: blocked** → muestra bloqueo, no avanza.
- **Forecast bajo (< 100 líneas)** → el orquestador puede proponer saltar tasks e ir directo a apply.
- **Worker Reactivo** → si un worker se satura a medio batch, frena con commit parcial + `report.md`.
  El orquestador revisa y levanta un worker nuevo para continuar.

## Riesgo detectado por funky-tasks: NO escala Tier

El workflow `funky-tasks` puede devolver riesgos en su Return Envelope
(ej. "esta tarea modifica auth, revisar antes de continuar"). La pregunta es
si ese riesgo debería gatillar una escalación de Tier (ej. T2 → T3).

**Decisión: NO escalar Tier basado en riesgo de tasks.** El Tier se define una
vez en el preflight (recomendación del orquestador + confirmación del humano)
y se respeta durante todo el ciclo. Las razones:

1. **El Tier ya pasó dos filtros** (orquestador + humano). Si tasks detecta
   riesgo, no invalida el Tier — pide más cuidado dentro del Tier actual.
2. **Escalar es caro.** Pasar de T2 a T3 requiere descartar artefactos ligeros
   y rehacerlos. Trabajo perdido. El humano ya aprobó esos artefactos.
3. **Falsa red de seguridad.** Si el orquestador sabe que tasks puede escalar,
   se vuelve menos riguroso al recomendar el Tier. "Total, después me salva
   tasks". Es delegar responsabilidad al workflow equivocado.

### Entonces, ¿qué hace el riesgo de tasks?

El riesgo detectado influye **en el batching, no en el Tier**:

- Batch más chicos
- Verify parcial entre batches si el riesgo lo justifica
- El orquestador añade guardrails extra en el prompt del worker

### Única excepción

Riesgo **CRITICAL** (seguridad, pérdida de datos, breaking change no detectado
por el propose). En ese caso el orquestador **frena y alerta al humano**, no
para escalar automáticamente, sino para que el humano decida el curso de acción.

## Tier 2 vs Tier 3

| Aspecto | Tier 2 | Tier 3 |
|---------|--------|--------|
| Input | Spec ligero + template | Spec + Design + template |
| Artefactos | `tasks.md` + `release.md` (si MINOR+) + `docs.md` (si aplica) | `tasks.md` + `release.md` + `docs.md` (obligatorio) |
| Flujo de tasks | Template + replace content | Template + replace content |
| Verify parcial entre batches | No | Opcional si el riesgo lo justifica |

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Skill Resolution en envelope | No se usa |
| Chained PRs como opción de split | Batching secuencial en misma rama |
| "Decision needed before apply: Yes" con 3 opciones (stacked, chain, exception) | Forecast alto → batching proactivo o pregunta simple |
| PR strategies definidas upfront | Se deciden en tasks según forecast |
| "OpenSpec:" + "Engram:" en artifacts | Solo `docs/openspec/changes/{change}/tasks.md` |
