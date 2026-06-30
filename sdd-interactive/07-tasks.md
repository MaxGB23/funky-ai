# SDD Interactive — Tasks

> Desglosa el cambio en tareas concretas por fase.
> Incluye el Review Workload Forecast, que puede redirigir el flujo.

## Lo que devuelve el sub-agente

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Tasks creadas para `{change}`. N tareas en M fases.
**Artifacts**:
  - Engram: `sdd/{change}/tasks`
  - OpenSpec: `openspec/changes/{change}/tasks.md`
**Next**: sdd-apply | ask-user (si forecast indica chained PRs)
**Risks**: riesgos o None
**Skill Resolution**: paths-injected
```

**Return específico** (Step 5 de la skill):

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
- Chained PRs recommended: Yes
- Delivery strategy: ask-on-risk
- Decision needed before apply: Yes
- Suggested split: PR 1 (model), PR 2 (service+routes), PR 3 (tests)
```

## Lo que presenta el orchestrator

```markdown
📋 Tasks ready — "login-con-google"

**Fases y tareas**:
- Phase 1 (Foundation): 3 tareas — modelo OAuthAccount + migration
- Phase 2 (Core): 4 tareas — OAuthService + callback
- Phase 3 (Tests): 3 tareas — unit, integration, e2e
- **Total**: 10 tareas

**⚠️ Review Workload**: ~520 líneas estimadas — ALTO
**Chained PRs recommended**: Yes

→ Este cambio necesita decisión antes de apply.

**¿Querés ajustar algo o continuamos?**
```

## Review Workload Guard (flujo especial)

Si `Decision needed before apply: Yes`, el orchestrator NO pregunta
"ajustar o continuar" directamente. En vez de eso:

```markdown
⚠️ Este cambio se estima en ~520 líneas (supera las 400).

¿Cómo querés manejarlo?

1. **Stacked PRs to main** — cada PR mergea a main secuencialmente
2. **Feature Branch Chain** — PRs encadenados contra feature branch
3. **Size exception** — un solo PR, aceptás el reviewer burden

O ajusto las tasks para que entren en 400 líneas.
```

La respuesta define `delivery_strategy` y `chain_strategy` para todo
el ciclo de apply.

## Comportamiento por delivery strategy

| Estrategia | ¿Pregunta? | Acción |
|------------|-----------|--------|
| `ask-on-risk` | ✅ Sí | Pregunta al usuario qué hacer |
| `auto-chain` | ❌ No | Toma la primer slice y arranca |
| `single-pr` | ✅ Sí | Requiere `size:exception` |
| `exception-ok` | ❌ No | Ya tiene aprobación, arranca |
