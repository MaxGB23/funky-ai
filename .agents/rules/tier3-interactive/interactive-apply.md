---
trigger: manual
---

## Lo que presenta el orquestador

```markdown
⚡ Apply batch complete — "[feature-name]"

✅ **Completado**: [n]/[total] tareas (Batch [n]: [Nombre])

📁 **Archivos cambiados**:
| Archivo | Acción |
|---------|--------|
| `[ruta/al/archivo]` | [Created/Modified/Deleted] — [descripción breve] |
| `[ruta/al/archivo]` | [Created/Modified/Deleted] |

⚠️ **Desviaciones**: [Desviaciones o "None"]
🐛 **Issues**: [Issues o "None"]

📊 **Review budget impact**: ~[n] líneas

Siguiente: [Siguiente batch o Fase Verify, dependiendo si quedan tareas]

¿Quieres ajustar algo o continuamos?
```

## Comportamiento por modo
| Modo | Checkpoint pre-apply | Durante apply |
|------|---------------------|---------------|
| **Interactivo** | Muestra plan + "¿CLI o IDE?" + "¿Arrancamos?" | Después de cada batch, resultado + "¿Ajustar o continuamos?" |

## Casos especiales
- **Deviations from design** → se muestran **DESTACADAS** antes de preguntar.
- **Status: blocked** → no pregunta, explica el bloqueo y cómo resolverlo.
- **If orchestrator sets Strict TDD mode On** → incluir tabla TDD Cycle Evidence en el return (test
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