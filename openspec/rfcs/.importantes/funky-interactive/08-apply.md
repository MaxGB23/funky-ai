# Funky-ai Interactive — Apply

> Implementa las tareas. Puede correr en múltiples batches secuenciales y en
> CLI o IDE según lo que el humano elija en el checkpoint pre-apply.

---

## Cuándo se usa

- **Tier 2 y Tier 3**: después de tasks.
- **Tier 1**: el orquestador delega directo a un Worker básico.

En Tier 2, apply corre con un Worker básico que sigue las tasks.
En Tier 3, apply corre con `/funky-apply` que lee `spec.md` + `design.md`
directamente (sin necesidad de microplanning del orquestador).

## Checkpoint pre-apply

**Siempre hay un checkpoint antes de apply**, incluso en modo Auto.
El orquestador presenta el plan y el humano decide dónde ejecutar:

```markdown
⚡ Plan de implementación listo — "login-con-google"

**Batch 1**: Phase 1 (OAuthAccount model + migration) — ~120 líneas
**Batch 2**: Phase 2-3 (Service + routes + tests) — ~400 líneas

¿Dónde lo corremos?

- **CLI**: lo delego directo al worker acá mismo
- **IDE**: te preparo el bloque copy-paste para ver difs
```

Esto aplica a todos los modos (Interactivo, Auto, Handoff). En Auto el
orquestador puede arrancar directo si el humano ya estableció esa preferencia,
pero el checkpoint existe como guardrail.

## Lo que devuelve el sub-agente (`funky-apply` o Worker)

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Implementación completada para tasks {X}-{Y}. {N}/{M} tareas.
**Artifacts**: `docs/openspec/changes/{change}/tasks.md` (actualizado)
**Next**: sdd-apply (más tareas) | sdd-verify (todo completo)
**Risks**: deviations del diseño, issues encontrados o None
```

**Return específico**:

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
| `prisma/schema.prisma` | Modified | Added OAuthAccount model |
| `prisma/migrations/...` | Created | Migration file |

### Deviations from Design
None — implementation matches design.

### Issues Found
None.

### Remaining Tasks
- [ ] 2.1 Crear OAuthService
- [ ] 2.2 Implementar callback route

### Workload / PR Boundary
- Mode: batch
- Current work unit: Batch 1 — Phase 1
- Batch boundary: model + migration
- Estimated review budget impact: ~120 líneas

### Status
2/10 tasks complete. Ready for next batch.
```

## Lo que presenta el orquestador

```markdown
⚡ Apply batch complete — "login-con-google"

✅ **Completado**: 2/10 tareas (Batch 1: Foundation)

📁 **Archivos cambiados**:
| Archivo | Acción |
|---------|--------|
| `prisma/schema.prisma` | Modified — OAuthAccount model |
| `prisma/migrations/20260709_oauth` | Created |

⚠️ **Desviaciones**: None
🐛 **Issues**: None

📊 **Review budget impact**: ~120 líneas

Siguiente: Aplicar Batch 2 (Service + routes + tests)

¿Querés ajustar algo o continuamos?
```

## Comportamiento por modo

| Modo | Checkpoint pre-apply | Durante apply |
|------|---------------------|---------------|
| **Interactivo** | Muestra plan + "¿CLI o IDE?" + "¿Arrancamos?" | Después de cada batch, resultado + "¿Ajustar o continuamos?" |
| **Auto** | Checkpoint lite: muestra plan, pregunta solo si quiere IDE o deja que arranque | Si hay múltiples batches, arranca el siguiente automático. Si blocked, frena |
| **Handoff** | Prepara bloque copy-paste. No pregunta CLI/IDE porque ya está en IDE | Humano trae Return Envelope después de cada batch |

## Casos especiales

- **Deviations from design** → se muestran **DESTACADAS** antes de preguntar.
- **Status: blocked** → no pregunta, explica el bloqueo y cómo resolverlo.
- **Worker Reactivo** → si el worker se satura a medio batch, hace commit parcial,
  escribe `report.md` y frena. El orquestador revisa el reporte y levanta un
  worker nuevo para el resto.
- **Strict TDD mode** → incluir tabla TDD Cycle Evidence en el return (test
  escrito, test falla, código, test pasa).
- **Review budget impact** → se muestra por batch para que el humano sepa
  cuánto está generando cada entrega.

## Dónde corre apply

| Elección del humano | Flujo | Ventaja |
|--------------------|-------|---------|
| **CLI** | Orquestador delega directo a sub-agente nativo | Rápido, sin fricción |
| **IDE** | Orquestador prepara bloque copy-paste, humano pega en chat IDE y trae resultado | Difs visuales, accept/reject, herramientas del editor |

El contenido del prompt es **idéntico** en ambos casos (Ley de Invarianza).
Solo cambia el canal.

## Tier 2 vs Tier 3

| Aspecto | Tier 2 | Tier 3 |
|---------|--------|--------|
| Worker | Worker básico (sigue tasks.md) | `/funky-apply` (lee spec + design directo) |
| Microplanning | Tasks.md es la guía | No necesita — apply tiene spec + design |
| Verify entre batches | No | Opcional si el riesgo lo justifica |
| Complejidad de batches | 2 batches fijos (A = código, B = cierre) | Por fase según forecast |

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Skill Resolution en envelope | No se usa |
| Chained PRs como mecanismo de split | Batching secuencial en misma rama |
| No tiene checkpoint CLI/IDE | Checkpoint pre-apply: humano elige dónde corre |
| Siempre en CLI | Puede correr en CLI o IDE según preferencia |
| "OpenSpec:" + "Engram:" en artifacts | Solo `docs/openspec/changes/{change}/` |
