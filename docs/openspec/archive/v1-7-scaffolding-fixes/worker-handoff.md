# 🤖 Funky AI — Worker Handoff: Scaffolding Fixes v1.7.0

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@m:\funky-ai\openspec\changes\v1-7-scaffolding-fixes\worker-handoff.md Ejecutá la Misión Completa (Fase 1 a 3)`

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los tres pilares de contexto:

### A) Estado Global del Proyecto
```
view_file m:\funky-ai\ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling)
```
grep_search "Template Sync Drift" m:\funky-ai\docs\engram\bugfixes.md (IsRegex: false)
grep_search "CLI" m:\funky-ai\docs\engram\discoveries.md (IsRegex: false)
```

### C) Especificación de Tarea
```
view_file m:\funky-ai\openspec\changes\v1-7-scaffolding-fixes\tasks.md
view_file m:\funky-ai\openspec\changes\v1-7-scaffolding-fixes\spec.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Crear un script de sincronización (`sync-templates.js`) para evitar el *Template Sync Drift*, y actualizar `init.js` para que el scaffolding inyecte la plantilla canónica `plantilla-worker-handoff.md` en los nuevos ecosistemas.

**Acciones exactas:**
1. Crear `funky-cli/scripts/sync-templates.js` y actualizar `package.json` según la Fase 1.
2. Actualizar `funky-cli/src/commands/init.js` según la Fase 2, escribiendo y corriendo los tests de integración correspondientes.
3. Actualizar `report.md` según la Fase 3.

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

- [ ] `sync-templates.js` está creado y atado a `package.json`.
- [ ] `init.js` modificado para copiar la plantilla canónica.
- [ ] Tests en verde (`pnpm test`).
- [ ] El `report.md` fue creado y llenado.

---

## 5. Return Envelope (Al terminar)

Actualizá `m:\funky-ai\openspec\changes\v1-7-scaffolding-fixes\report.md` con:

```markdown
## Fase 1, 2 y 3 — Scaffolding Fixes
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `ruta/al/archivo` (descripción)
- **Bugs encontrados:** (schema engram si aplica)
- **Próxima acción:** Volver al Orquestador para actualizar el ORCHESTRATOR-STATE.md y lanzar el Smoke Test final.
```
