# 🤖 Funky AI — Plantilla Oficial: Worker Handoff

> **Instrucción para el LLM:** Sos un Worker **Tier [N]** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los tres pilares de contexto:

### A) Estado Global del Proyecto
Leé el archivo de estado del Orquestador:
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling)
Ejecutá `grep_search` en el post-mortem antes de tocar cualquier archivo estructural:
```
grep_search "[topic-key-relevante]" docs/post-mortem.md  (IsRegex: true)
```
> ⚠️ Usá `IsRegex: true` si el topic-key puede estar embebido en un header compuesto (`### [tipo][topic-key] Título`).

### C) Especificación de Tarea
Leé el archivo de contexto técnico correspondiente a tu tarea:
```
view_file docs/openspec/changes/{feature-name}/tasks.md   (sección Fase N)
view_file [archivo principal que vas a modificar]
```

---

## 2. La Misión (Surgical Task)

> **[EL ORQUESTADOR COMPLETA ESTA SECCIÓN]**

**Objetivo:** _Describir en una oración qué debe producir este Worker al final._

**Acciones exactas:**
1. _Acción 1 con archivo destino explícito_
2. _Acción 2_
3. _..._

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. Si algo fuera de scope está roto, **documentalo en el report, no lo arregles** |
| 🔴 Acción Directa | Cada archivo se escribe con tools. Cero borradores en chat |
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

Actualizá `docs/openspec/changes/{feature-name}/report.md` con:

```markdown
## Fase [N] — [Nombre de la Fase]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `ruta/al/archivo.ext` (descripción del cambio)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **Próxima acción:** Qué debe hacer el Orquestador a continuación
```

> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, extraé conocimiento al `post-mortem.md` e instruí al usuario a ELIMINAR FÍSICAMENTE toda la carpeta de este feature.
