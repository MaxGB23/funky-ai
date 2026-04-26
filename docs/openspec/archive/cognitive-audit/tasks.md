# Tasks: Auditoría de Sobrecarga Cognitiva

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/cognitive-audit`
**Ref:** `explore.md`

---

## ✅ Checklist de Ejecución

### FASE 0 — Setup (Humano)
- [ ] `git checkout -b feature/cognitive-audit`

---

### FASE 1 — Token Diet y Roles (Worker)
> Objetivo: Refactorizar las reglas globales del orquestador y el protocolo de engrams para eliminar el ruido narrativo e incluir condicionales inquebrantables y XML tags.

- [ ] Modificar `.agents/rules/sdd-orchestrator.md` para reducir explicaciones y aplicar formato imperativo estricto con etiquetas `<ROLE_ORCHESTRATOR>` y `<ROLE_WORKER>`.
- [ ] **Data Stale (Bugfix):** Dentro de `sdd-orchestrator.md`, eliminar cualquier referencia obsoleta a `docs/post-mortem.md` y reemplazarla por el sharded engram actual (`docs/engram/discoveries.md` y `docs/engram/bugfixes.md`).
- [ ] Modificar `.agents/rules/engram-protocol.md` para eliminar la teoría y dejar solo la estructura esperada y las órdenes directas.

**🚫 Restricciones:** Mantener la lógica de ruteo y el flujo SDD intacto. Modificar únicamente la redacción y la estructura XML/Markdown.

---

### FASE 2 — Action Forcing en Templates (Worker)
> Objetivo: Actualizar los templates de tareas y handoffs para incluir Action Forcing y obligar al Worker a validar el checklist de Release.

- [ ] Modificar `funky-cli/src/templates/sdd/tasks.md` para envolver la fase de Release en `<MANDATORY_RELEASE_PROTOCOL>` y agregar la directiva de validación en el Return Envelope.
- [ ] Modificar `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md` para forzar un formato de respuesta único sin texto conversacional.
- [ ] **Sintaxis de Tools:** En `plantilla-worker-handoff.md`, corregir las referencias de Memoria Persistente para que no parezcan comandos Bash (ej. `grep_search "[topic]"`), sino directivas explícitas de LLM (ej. `ACTION: Execute the tool 'grep_search'...`).

---

### FASE X — Release y Doc-Ops (Humano u Orquestador)
> Objetivo: Merge de la funcionalidad, tageo de versión y actualización de deuda técnica documental.

**🚨 CHECKLIST DE RELEASE (OBLIGATORIO - NO OMITIR):**
- [ ] **Release Notes:** Crear archivo de notas en `docs/funky-ai/releases/vX.Y.Z-release.md`.
- [ ] **README:** Actualizar `README.md` con la nueva versión y/o cambios en los comandos.
- [ ] **Archivado:** Mover directorio de feature de `openspec/changes/` hacia `openspec/archive/` para preservar las decisiones arquitectónicas (ADRs).
- [ ] **Git:** `git add -A && git commit -m "feat/fix: cognitive audit optimizations"`
- [ ] **Git:** `git checkout main && git merge --no-ff feature/cognitive-audit`
- [ ] **Git:** `git tag -a vX.Y.Z -m "release: vX.Y.Z"`
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (estado estable, versión actualizada, asegurar que no quede stale).

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `report.md` con:

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, usar schema engram. OBLIGATORIO: incluir intentos fallidos y anti-patrones descartados, no solo bugs finales)
- **Próxima acción:** (qué debe hacer el Orquestador)
```

> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, estás obligado a crear un archivo físico `worker-handoff.md` para cada fase de Worker. NO redactes prompts en chat.
