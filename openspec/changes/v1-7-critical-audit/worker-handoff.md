# 🤖 Funky AI — Worker Handoff: Auditoría Crítica v1.7.0 (Fase 1)

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@m:\funky-ai\openspec\changes\v1-7-critical-audit\worker-handoff.md Ejecutá la Misión (Fase 1)`

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los tres pilares de contexto:

### A) Estado Global del Proyecto
```
view_file m:\funky-ai\ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling)
```
grep_search "Headless Canvas Overwrite" m:\funky-ai\docs\engram\bugfixes.md (IsRegex: false)
grep_search "CLI" m:\funky-ai\docs\engram\discoveries.md (IsRegex: false)
```

### C) Especificación de Tarea
```
view_file m:\funky-ai\openspec\changes\v1-7-critical-audit\tasks.md
view_file m:\funky-ai\openspec\changes\v1-7-critical-audit\spec.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Implementar los fixes de código respaldados por TDD para los Vectores 1, 2 y 3 aprobados en la matriz de simulaciones, y consolidar el reporte.

**Acciones exactas (Fase 2 y 3):**
1. Implementar la Fase 2 de `tasks.md`: Escribir tests de integración, fixear `init.js` y correr `pnpm test`.
2. Implementar la Fase 3 de `tasks.md`: Actualizar el Return Envelope (`report.md`) con el listado final de bugs fixeados.

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
2. **Prioridad 2 (MCP context7):** Si NO hay Skill, y la API es nueva/compleja, o dudás de su sintaxis, estás **OBLIGADO** a usar el servidor MCP `context7` antes de escribir código.

---

## 4. Criterios de Éxito

- [ ] `docs/funky-ai/cli-simulations.md` fue creado en disco con formato correcto.
- [ ] Ningún archivo de código (`init.js`) fue modificado en esta Fase.
- [ ] El `report.md` fue creado/actualizado con la sección de Fase 1.

---

## 5. Return Envelope (Al terminar)

Actualizá `m:\funky-ai\openspec\changes\v1-7-critical-audit\report.md` con:

```markdown
## Fase 1 — Análisis Estático y Simulaciones
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `docs/funky-ai/cli-simulations.md` (Matriz creada)
- **Bugs encontrados:** (schema engram si aplica)
- **Próxima acción:** Se requiere aprobación del Orquestador/Humano para iniciar Fase 2 (Fix & TDD).
```
