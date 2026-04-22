# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`
**Ref:** `proposal.md`

---

## ✅ Checklist de Ejecución

### FASE 0 — Setup (Humano)
- [ ] `git checkout -b feature/nombre-del-branch`
- [ ] [Otras tareas de configuración manual inicial]

---

### FASE 1 — [Nombre de la Fase 1] (Worker)
> Objetivo: [Objetivo de esta fase]

- [ ] [Tarea específica 1]
- [ ] [Tarea específica 2]

**🚫 Restricciones:** [Ej: No modificar código fuente, solo tests.]

---

### FASE X — Release y Doc-Ops (Humano u Orquestador)
> Objetivo: Merge de la funcionalidad, tageo de versión y actualización de deuda técnica documental.

**🚨 CHECKLIST DE RELEASE (OBLIGATORIO - NO OMITIR):**
- [ ] **Release Notes:** Crear archivo de notas en `docs/funky-ai/releases/vX.Y.Z-release.md`.
- [ ] **README:** Actualizar `README.md` con la nueva versión y/o cambios en los comandos.
- [ ] **Archivado:** Mover directorio de feature de `openspec/changes/` hacia `openspec/archive/` para preservar las decisiones arquitectónicas (ADRs).
- [ ] **Git:** `git add -A && git commit -m "feat/fix: descripcion"`
- [ ] **Git:** `git checkout main && git merge --no-ff feature/nombre-del-branch`
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
