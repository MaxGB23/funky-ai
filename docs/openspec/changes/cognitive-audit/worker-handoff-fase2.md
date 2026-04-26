# 🤖 Funky AI — Worker Handoff: Fase 2 (Action Forcing en Templates)

> **Instrucción para el LLM:** Sos un Worker **Tier 2** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/cognitive-audit/worker-handoff-fase2.md Ejecutá la Fase 2`

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los tres pilares de contexto:

### A) Estado Global del Proyecto
`ACTION: Execute view_file on ORCHESTRATOR-STATE.md`

### B) Memoria Persistente (Memory Polling)
`ACTION: Execute grep_search on docs/engram/discoveries.md with query "template" or "handoff"`
`ACTION: Execute grep_search on docs/engram/bugfixes.md with query "template" or "handoff"`

### C) Especificación de Tarea
`ACTION: Execute view_file on docs/openspec/changes/cognitive-audit/tasks.md`
`ACTION: Execute view_file on funky-cli/src/templates/sdd/tasks.md`
`ACTION: Execute view_file on funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md`

---

## 2. La Misión (Surgical Task)

**Objetivo:** Actualizar los templates de tareas y handoffs para incluir Action Forcing y bloquear conversación innecesaria del Worker.

**Acciones exactas:**

1. **Modificar `funky-cli/src/templates/sdd/tasks.md`:**
   - Envolver la sección de Release (FASE X) en una etiqueta `<MANDATORY_RELEASE_PROTOCOL>`.
   - En el **Return Envelope**, agregar la siguiente directiva de **Action Forcing** antes del bloque de código markdown:
     > `MANDATORY: Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de MANDATORY_RELEASE_PROTOCOL marcados como [x] o [OMITIDO: razón]. Sin este bloque, la Fase NO se considera completa.`

2. **Modificar `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md`:**
   - En la sección de Memoria Persistente (§1.B), convertir la sintaxis pseudo-bash en directivas de LLM explícitas:
     - Reemplazar `grep_search "[topic-key-relevante]" docs/engram/discoveries.md (IsRegex: false)` por `ACTION: Execute the tool 'grep_search' on docs/engram/discoveries.md with the topic-key relevant to the current task`.
     - Aplicar el mismo patrón para `bugfixes.md`.
   - Al final del documento (después del Return Envelope), agregar el siguiente bloque:
     ```
     RESPONSE_FORMAT: ONLY output the final report.md updates. NO conversational text.
     ```

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. Si algo fuera de scope está roto, documentalo en el report, no lo arregles |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa. |
| 🟡 Bugs Encontrados | Si encontrás un bug no relacionado con tu tarea → registralo en `report.md` bajo `## Bugs Encontrados` con schema engram (`What / Why / Where / Learned`) |
| 🟢 Idempotencia | Verificá si el destino ya existe antes de sobreescribir. Documentá si salteás algo |

---

## 4. Criterios de Éxito

- [ ] `funky-cli/src/templates/sdd/tasks.md` tiene la sección de Release envuelta en `<MANDATORY_RELEASE_PROTOCOL>` y el Action Forcing en el Return Envelope.
- [ ] `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md` tiene la sintaxis de tools corregida y el bloque `RESPONSE_FORMAT` al final.
- [ ] El `report.md` fue actualizado con la sección de esta Fase.
- [ ] Ningún archivo fuera de scope fue modificado.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/cognitive-audit/report.md` con:

```markdown
## Fase 2 — Action Forcing en Templates
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `funky-cli/src/templates/sdd/tasks.md` (MANDATORY_RELEASE_PROTOCOL + Action Forcing)
  - `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md` (Sintaxis tools + RESPONSE_FORMAT)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **Próxima acción:** El Orquestador debe ejecutar la Fase X de Release.
```

RESPONSE_FORMAT: ONLY output the final report.md updates. NO conversational text.
