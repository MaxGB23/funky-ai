# 🤖 Funky AI — Worker Handoff: Fase X (Release y Doc-Ops)

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

---

## 1. Inyección de Contexto (Safe-Contexting)

### A) Estado Global del Proyecto
`ACTION: Execute view_file on ORCHESTRATOR-STATE.md`

### B) Memoria Persistente (Memory Polling)
`ACTION: Execute grep_search on docs/engram/discoveries.md with query "release"`
`ACTION: Execute grep_search on docs/engram/bugfixes.md with query "release"`

### C) Especificación de Tarea
`ACTION: Execute view_file on docs/openspec/changes/cognitive-audit/tasks.md`
`ACTION: Execute view_file on docs/openspec/changes/cognitive-audit/report.md`

---

## 2. La Misión (Surgical Task)

**Objetivo:** Ejecutar el Doc-Ops de Release para la feature `cognitive-audit`: crear release notes, commitear, y archivar el openspec.

**Acciones exactas:**
1. **Crear** `docs/funky-ai/releases/v1.8.0-release.md` con el siguiente contenido:

```markdown
# Release v1.8.0 — Auditoría de Sobrecarga Cognitiva

**Fecha:** 2026-04-25
**Rama:** feature/cognitive-audit → main

## Cambios
- `.agents/rules/sdd-orchestrator.md` — Token Diet aplicado. Roles encapsulados en `<ROLE_ORCHESTRATOR>` y `<ROLE_WORKER>` con directiva IGNORE. Bugfix: referencia stale a `docs/post-mortem.md` eliminada.
- `.agents/rules/engram-protocol.md` — Reducido a schema puro y triggers. Eliminada narrativa filosófica.
- `funky-cli/src/templates/sdd/tasks.md` — Release envuelta en `<MANDATORY_RELEASE_PROTOCOL>`. Action Forcing agregado al Return Envelope.
- `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md` — Sintaxis de tools corregida a directivas `ACTION:`. Bloque `RESPONSE_FORMAT` agregado.

## Motivación
Los Workers omitían pasos críticos (Release, generación de handoffs) por saturación de contexto. Esta release aplica técnicas de Prompt Engineering estructural para reducir el "Lost in the Middle".
```

2. **Ejecutar en terminal** los siguientes comandos Git en orden:
   ```
   git add -A
   git commit -m "feat: cognitive audit — token diet, XML roles, action forcing"
   git checkout main
   git merge --no-ff feature/cognitive-audit -m "merge: feature/cognitive-audit into main"
   git tag -a v1.8.0 -m "release: v1.8.0 — cognitive audit"
   ```

3. **Actualizar** `ORCHESTRATOR-STATE.md`:
   - Cambiar **Versión** a `v1.8.0`
   - Cambiar **Rama activa** a `main`
   - Cambiar **Estado** a `🟢 Completada. Release v1.8.0 — Auditoría de Sobrecarga Cognitiva aplicada.`
   - Agregar en **Historial de Versiones**: `| v1.8.0 | Cognitive Audit: Token Diet en reglas globales, XML Roles, Action Forcing en templates. |`

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Acción Directa | Cada archivo se escribe con tools. Los comandos Git se ejecutan con `run_command`. |
| 🔴 Orden Estricto | Crear el release notes ANTES de ejecutar los comandos Git. |

---

## 4. Criterios de Éxito

- [ ] `docs/funky-ai/releases/v1.8.0-release.md` existe en disco.
- [ ] `git log --oneline -3` muestra el commit y el merge.
- [ ] `git tag` lista `v1.8.0`.
- [ ] `ORCHESTRATOR-STATE.md` refleja v1.8.0 y rama `main`.
- [ ] `report.md` actualizado con la Fase X.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/cognitive-audit/report.md` con:

```markdown
## Fase X — Release y Doc-Ops
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `docs/funky-ai/releases/v1.8.0-release.md` (creado)
  - `ORCHESTRATOR-STATE.md` (versión y estado actualizados)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **Próxima acción:** Orquestador debe archivar openspec/changes/cognitive-audit/ → openspec/archive/
```

RESPONSE_FORMAT: ONLY output the final report.md updates. NO conversational text.
