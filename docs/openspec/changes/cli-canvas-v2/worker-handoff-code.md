# 🤖 Funky AI — Worker Handoff: Fase 1 (Codificación CLI Canvas v2)

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/cli-canvas-v2/worker-handoff-code.md Ejecutá la Fase 1`

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los tres pilares de contexto:

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling)
*(No se requiere polling específico para esta refactorización, el contexto está en las specs)*

### C) Especificación de Tarea
```
view_file docs/openspec/changes/cli-canvas-v2/tasks.md
view_file docs/openspec/changes/cli-canvas-v2/proposal.md
view_file funky-cli/src/commands/init.js
view_file funky-cli/src/utils/canvas.js
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Implementar la división del Canvas en `PROJECT-CANVAS` e `INFRA-CANVAS`, expandir los prompts usando `@clack/prompts` con cancelación transaccional, y corregir los bugs de legacy (v1.7.0) manteniendo la idempotencia, tal como especifica el `tasks.md`.

**Acciones exactas:**
1. Refactorizar `funky-cli/src/utils/canvas.js` para exponer dos funciones exportadas: `generateProjectCanvasMarkdown` y `generateInfraCanvasMarkdown`.
2. Modificar `funky-cli/src/commands/init.js` para ejecutar las 5 Fases definidas en `tasks.md` (Detección separada, Prompts de Fase 1, Prompts de Fase 2, Escritura condicional).

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. Si algo fuera de scope está roto, documentalo en el report, no lo arregles |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa. |
| 🟡 Bugs Encontrados | Si encontrás un bug no relacionado con tu tarea → registralo en `report.md` bajo `## Bugs Encontrados` con schema engram (`What / Why / Where / Learned`) |
| 🟢 Idempotencia | Verificá si el destino ya existe antes de sobreescribir. Documentá si salteás algo |

### 🔍 Jerarquía de Conocimiento (Doc-Ops)
1. **Prioridad 1 (Skills):** Antes de codear para una librería/framework, verificá si hay un estándar en `.agents/skills/`. Si existe, usalo.
2. **Prioridad 2 (MCP context7):** Si NO hay Skill, y la API es nueva/compleja, o dudás de su sintaxis, estás **OBLIGADO** a usar el servidor MCP `context7` (`resolve-library-id` + `query-docs`) antes de escribir código.
3. **Extracción:** Si descubrís un patrón nuevo usando `context7`, documentalo en tu Return Envelope para convertirlo en Skill.

---

## 4. Criterios de Éxito

- [ ] Todos los archivos listados en §2 fueron creados/modificados en disco.
- [ ] El `report.md` fue actualizado con la sección de esta Fase.
- [ ] Ningún archivo fuera de scope fue modificado.
- [ ] Si se encontraron bugs no relacionados, están documentados con schema engram.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/cli-canvas-v2/report.md` con:

```markdown
## Fase 1 — Codificación CLI Canvas v2
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `ruta/al/archivo.ext` (descripción del cambio)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **Próxima acción:** Qué debe hacer el Orquestador a continuación
```
