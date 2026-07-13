# 🤖 Funky AI — Worker Handoff: Memory Polling v2

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/memory-polling-v2/worker-handoff.md Ejecutá la Fase N`
> (reemplazá N con 0, 1, 2 o 3 según corresponda)

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los tres pilares de contexto:

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling — Two-Stage)

**Stage 1 (siempre ejecutar):**
```
view_file docs/engram/index.md
```

**Stage 2 (solo si encontrás un tag relevante en Stage 1):**
```
grep_search "[TAG-EXACTO-DEL-INDICE]" docs/engram/discoveries.md (IsRegex: false)
grep_search "[TAG-EXACTO-DEL-INDICE]" docs/engram/bugfixes.md (IsRegex: false)
```

Tags probablemente relevantes para esta feature: `[agent-cognitive-load]`, `[in-template-rule-injection]`, `[documentation-vs-enforcement]`, `[agent-dry-handoffs]`

### C) Especificación de Tarea
```
view_file docs/openspec/changes/memory-polling-v2/sdd-tasks.md
view_file docs/openspec/changes/memory-polling-v2/sdd-spec.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo general:** Implementar el protocolo Two-Stage Memory Polling: crear el índice liviano del engram y actualizar las reglas de orquestación para usarlo.

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde la Fase actual en `sdd-tasks.md` (cargado en §1.C).

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. Si algo fuera de scope está roto, documentalo en el report, no lo arregles |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa. |
| 🟡 Bugs Encontrados | Si encontrás un bug no relacionado con tu tarea → registralo en `sdd-report.md` bajo `## Bugs Encontrados` con schema engram (`What / Why / Where / Learned`) |
| 🟢 Idempotencia | Verificá si el destino ya existe antes de sobreescribir. Documentá si salteás algo |

### 🔍 Jerarquía de Conocimiento (Doc-Ops)
No aplica para esta feature — es puramente protocolo de documentación. No se usan librerías externas.

---

## 4. Criterios de Éxito

- [ ] Todos los archivos listados en `sdd-tasks.md` para la Fase correspondiente fueron creados/modificados en disco.
- [ ] El `sdd-report.md` fue actualizado con la sección de esta Fase.
- [ ] Ningún archivo fuera de scope fue modificado.
- [ ] Si se encontraron bugs no relacionados, están documentados con schema engram.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/memory-polling-v2/sdd-report.md` con:

```markdown
## Fase [N] — [Nombre de la Fase]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `ruta/al/archivo.ext` (descripción del cambio)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí — [Si Sí: describir qué encontraste que invalida o modifica fases siguientes]
- **Próxima acción:** Qué debe hacer el Orquestador a continuación
```

> **[SISTEMA]** Si `🔴 Cambio de Scope Detectado` es **Sí**, el Orquestador DEBE revisar y actualizar `sdd-tasks.md` y los handoffs de fases siguientes ANTES de continuar la delegación.
