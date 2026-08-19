---
trigger: model_decision
description: "Solo CLI (`App Data Directory` incluye `antigravity-cli`). Ignorar en IDE `antigravity-ide` (sin subagentes nativos). Activa al explorar múltiples archivos o búsquedas complejas donde el ruido degrade el contexto actual."
---

# Regla JIT — Investigación ligera y delegación segura

## Precondición de Entorno

Verifica tu `App Data Directory` antes de aplicar:

| Valor | Acción |
|---|---|
| contiene `antigravity-cli` | ✅ Aplica esta regla |
| contiene `antigravity-ide` | 🚫 Ignora esta regla por completo |

**Objetivo:** Mantener el contexto principal limpio, reducir ruido y separar la investigación de la toma de decisión.
**Regla:**
Si una tarea requiere explorar múltiples archivos, documentación o búsquedas que añadan ruido al contexto, **delega** la exploración al Sabueso Regular mediante `invoke_subagent (TypeName: research)`.

> **No confundir con Explore SDD (Route B):** Route A investiga y resume; Route B investiga y genera artefactos SDD.

## Contrato de retorno (estricto)
> **Prohibido devolver explicaciones largas.** Solo devuelve el bloque de markdown especificado. Si no encuentras nada, devuelve explícitamente `Hallazgo: Ninguno`.

```markdown
## Hallazgo: {título corto}
**Qué**: {hallazgo concreto}
**Dónde**: `path/to/file.ext[:línea]`
**Contexto**: {2–3 líneas de relevancia}
```

## Criterios de Activación Estricta
Solo invoca al subagente si se cumplen **todas** estas condiciones:
- La tarea **DEBE** requerir la exploración de 3 o más archivos o múltiples búsquedas complejas.
- La información no se puede resolver con un par de lecturas rápidas.
- La decisión final requiere sintetizar múltiples señales dispersas en el código.
- Es vital mantener limpio el contexto actual sin contaminarlo con logs o lecturas en crudo.