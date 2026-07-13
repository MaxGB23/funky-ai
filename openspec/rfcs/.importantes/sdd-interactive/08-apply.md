# SDD Interactive — Apply

> Implementa tareas. Puede correr múltiples batches (chained PRs).

## Lo que devuelve el sub-agente

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Implementación completada para tasks {X}-{Y}. {N}/{M} tareas.
**Artifacts**:
  - Engram: `sdd/{change}/apply-progress`
  - OpenSpec: `openspec/changes/{change}/tasks.md` (update)
**Next**: sdd-apply (más tareas) | sdd-verify (todo completo)
**Risks**: deviations del diseño, issues encontrados o None
**Skill Resolution**: paths-injected
```

**Return específico** (Step 7 de la skill):

```markdown
## Implementation Progress

**Change**: {change-name}
**Mode**: {Strict TDD | Standard}

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

### Workload / PR Boundary
- Mode: chained PR slice
- Current work unit: Phase 1
- Boundary: model + migration
- Estimated review budget impact: ~150 lines

### Status
2/10 tasks complete. Ready for next batch.
```

## Lo que presenta el orchestrator

```markdown
⚡ Apply batch complete — "login-con-google"

**✅ Completado**: 2/10 tareas (Phase 1: Foundation)

**📁 Archivos cambiados**:
| Archivo | Acción |
|---------|--------|
| `prisma/schema.prisma` | Modified — OAuthAccount model |
| `prisma/migrations/...` | Created |

**⚠️ Desviaciones**: None
**🐛 Issues**: None

**📊 Review budget impact**: ~150 líneas

**Siguiente**: Aplicar Phase 2 (OAuthService + callback) | Verificar lo hecho

**¿Querés ajustar algo o continuamos?**
```

## Casos especiales

- **Hay deviations from design** → las muestro DESTACADAS antes de preguntar.
- **Status: blocked** → no pregunto, explico el bloqueo.
- **Strict TDD mode** → incluyo la tabla TDD Cycle Evidence.
- **PR boundary** → muestro si es single PR, chained slice, o size:exception.
