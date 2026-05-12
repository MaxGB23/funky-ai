# 🤖 Funky AI — Worker Handoff: Fase 3 (Generación Persistente del Artefacto)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/002-cost-estimator/worker-handoff.md Ejecutá la Fase 3`

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

> Si agregás una entrada nueva al engram en esta Fase, TAMBIÉN actualizá `docs/engram/index.md`.

### C) Especificación de Tarea
```
view_file docs/openspec/changes/002-cost-estimator/tasks.md
view_file funky-cli/src/commands/estimate.js
view_file docs/openspec/changes/002-cost-estimator/spec.md
```

### D) Skills Requeridas (Explicit Routing)
```
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Crear el template interno de markdown y la lógica en `estimate.js` para generar físicamente el archivo `docs/pricing-analysis.md` con los resultados del cálculo y el prompt inyectado.

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde la Fase 3 en `tasks.md` (cargado en §1.C).

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
1. **Prioridad 1 (Skills Estrictas):** Acatá religiosamente las skills inyectadas en la sección §1.D. Son leyes absolutas para tu ejecución.
2. **Prioridad 2 (MCP context7):** Si la API es nueva/compleja, dudás de su sintaxis, y el Orquestador no te pasó ninguna skill en §1.D, estás **OBLIGADO** a usar el servidor MCP `context7` (`resolve-library-id` + `query-docs`) antes de escribir código.
3. **Extracción:** Si descubrís un patrón nuevo usando `context7`, documentalo en tu Return Envelope para que el Orquestador lo convierta en una Skill.

---

## 4. Criterios de Éxito

- [ ] Todos los archivos listados en §2 fueron creados/modificados en disco.
- [ ] El `sdd-report.md` fue actualizado con la sección de esta Fase.
- [ ] Ningún archivo fuera de scope fue modificado.
- [ ] Si se encontraron bugs no relacionados, están documentados con schema engram.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/002-cost-estimator/sdd-report.md` con:

```markdown
## Fase 3 — Generación Persistente del Artefacto
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `ruta/al/archivo.ext` (descripción del cambio)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí — [Si Sí: describir qué encontraste que invalida o modifica fases siguientes]
- **Próxima acción:** Qué debe hacer el Orquestador a continuación
```

> **[SISTEMA]** Si `🔴 Cambio de Scope Detectado` es **Sí**, el Orquestador DEBE revisar y actualizar `tasks.md` y los handoffs de fases siguientes ANTES de continuar la delegación.
