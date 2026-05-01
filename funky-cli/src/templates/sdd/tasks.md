# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`
**Ref:** `sdd-proposal.md`

---

## ✅ Checklist de Ejecución

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [ ] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [ ] Verificar que el branch NO existe: `git branch --list feat/vX.Y-{name}`
- [ ] Crear y cambiar al branch: `git checkout -b feat/vX.Y-{name}`
- [ ] Confirmar branch activo: `git status`
- [ ] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — [Nombre de la Fase 1] (Worker)
> Objetivo: [Objetivo de esta fase]

- [ ] [Tarea específica 1]
- [ ] [Tarea específica 2]

**🚫 Restricciones:** [Ej: No modificar código fuente, solo tests.]

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Release y Doc-Ops (Humano u Orquestador)
> Objetivo: Merge de la funcionalidad, tageo de versión y actualización de deuda técnica documental.

**🚨 CHECKLIST DE RELEASE (OBLIGATORIO - NO OMITIR):**
- [ ] **Release Notes:** Generar archivo de notas ejecutando `funky release <version>`. Si no es posible, usar como base estricta `funky-cli/src/templates/release.md`. *(SISTEMA: Redactar para consumo humano. IGNORAR Token Diet aquí).* 
- [ ] **README:** Actualizar `README.md` en la raíz del proyecto. Asegurar de mantenerlo como un Architecture Hub siguiendo el estándar del template `funky-cli/src/templates/README.md`.
- [ ] **Archivado:** Mover directorio de feature de `openspec/changes/` hacia `openspec/archive/` para preservar las decisiones arquitectónicas (ADRs).
- [ ] **Git:** `git add -A && git commit -m "feat/fix: descripcion"`
- [ ] **Git:** `git checkout main && git merge --no-ff feature/nombre-del-branch`
- [ ] **Git:** `git tag -a vX.Y.Z -m "release: vX.Y.Z"`
- [ ] **Git:** `git push origin main && git push origin vX.Y.Z`
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (estado estable, versión actualizada, asegurar que no quede stale).

</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `sdd-report.md` con:

> **MANDATORY:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de `MANDATORY_RELEASE_PROTOCOL` marcados como `[x]` o `[OMITIDO: razón]`. Sin este bloque, la Fase NO se considera completa.

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, usar schema engram. OBLIGATORIO: incluir intentos fallidos y anti-patrones descartados, no solo bugs finales)
- **Próxima acción:** (qué debe hacer el Orquestador)
```

> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, estás obligado a crear un archivo físico `worker-handoff.md` para cada fase de Worker. NO redactes prompts en chat.
