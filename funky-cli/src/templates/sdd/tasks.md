# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`
**Ref:** `sdd-proposal.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Generá un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

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

### FASE X — Release y Doc-Ops [T1 — Modelo Estándar]
> **Objetivo:** Producir los artefactos de documentación de la release.
> **Modelo recomendado:** Estándar (Pro Low / Sonnet) — requiere redacción y criterio.

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Package.json:** Actualizar el campo `"version"` en `funky-cli/package.json` con la nueva versión.
- [ ] **Release Notes:** Generar `docs/funky-ai/releases/vX.Y.Z-release.md` usando como base `funky-cli/src/templates/release.md`. *(SISTEMA: Redactar para consumo humano. IGNORAR Token Diet aquí).*
- [ ] **README:** Actualizar `README.md` en la raíz del proyecto manteniéndolo como Architecture Hub (template: `funky-cli/src/templates/README.md`).
- [ ] **CLI Docs:** SI la release incluyó nuevos comandos o flags, actualizar la tabla en `funky-cli/README.md`.
- [ ] **Archivado:** Mover `docs/openspec/changes/{feature}/` → `docs/openspec/archive/{version}-{feature}/`.
- [ ] **RFCs:** Revisar `docs/openspec/rfcs/` para mover cualquier RFC que haya sido implementado en esta release hacia `docs/openspec/archive/`. (`docs/openspec/proposals/` está deprecado — no usar).
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (rama activa, estado estable, versión actualizada).

---

### FASE X+1 — Git-Ops [T1 — ⚡ Modelo Liviano]
> **Objetivo:** Commit, merge, tag y push. Sin redacción, sin criterio — pura ejecución mecánica.
> **Modelo recomendado:** Liviano (Flash / Haiku) — comandos sin ambigüedad, sin escritura creativa.

**🚨 CHECKLIST GIT-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Verificar estado:** `git status` — confirmar que todos los archivos están listos.
- [ ] **Commit:** `git add -A && git commit -m "feat: descripcion (vX.Y.Z)"`
- [ ] **Merge:** `git checkout main && git merge --no-ff feat/vX.Y-{name}`
- [ ] **Tag:** `git tag -a vX.Y.Z -m "release: vX.Y.Z"`
- [ ] **Push:** `git push origin main --tags` (OBLIGATORIO usar `--tags` para asegurar que el tag se suba al remoto).

> ⚠️ Esta fase NO produce artefactos de texto. Si algo falla, documentar el error en `sdd-report.md` y PARAR.


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
