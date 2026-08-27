---
trigger: manual
---

## Lo que presenta el orquestador

```markdown
📋 Tasks ready — "[feature-name]"

**Fases y tareas**:
- Phase 1 ([Nombre]): [n] tareas — [resumen breve]
- Phase 2 ([Nombre]): [n] tareas — [resumen breve]
- Phase 3 ([Nombre]): [n] tareas — [resumen breve]
- **Total**: [n] tareas

⚠️ **Review Workload**: ~[n] líneas estimadas — [ALTO/MEDIO/BAJO]

**Docs:** [N checkboxes generados en docs.md / No hay docs que actualizar / Docs no existe]
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

## Comportamiento por modo
| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra breakdown + workload. Si forecast >400, pregunta si subdividir. Si no, "¿Quieres ajustar algo o continuamos?" |

## Casos especiales
- **Status: blocked** → muestra bloqueo, no avanza.