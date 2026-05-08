# Tasks: 016 Semántica de RFCs vs Proposals

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/v1.16.0-016-rfc-semantics`
**Ref:** `proposal.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Generá un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `spec.md` en esta misma carpeta (`docs/openspec/changes/016-rfc-semantics/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

---

## ✅ Checklist de Ejecución

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [ ] Verificar que git está disponible: `git --version`
- [ ] Verificar que el branch NO existe: `git branch --list feat/v1.16.0-016-rfc-semantics`
- [ ] Crear y cambiar al branch: `git checkout -b feat/v1.16.0-016-rfc-semantics`
- [ ] Confirmar branch activo: `git status`
- [ ] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código.

---

### FASE 1 — Doc Refactor & Template (Worker)
> Objetivo: Actualizar las reglas del Orquestador y el Repo Map.

- [ ] Actualizar `.agents/rules/sdd-orchestrator.md` inyectando la regla de semántica RFC vs Proposal en `<ROLE_ORCHESTRATOR>`.
- [ ] Actualizar `docs/repo-map.md` para separar conceptualmente `rfcs/` (Brain Dumps) de `changes/` (Proposals formales).
- [ ] Copiar `docs/openspec/rfcs/000-TEMPLATE.md` a `funky-cli/src/templates/sdd/rfc-template.md`.
- [ ] Modificar `funky-cli/src/commands/init.js` agregando el rfc-template al array de `filesToCopy` para que la CLI distribuya el template en `docs/openspec/rfcs/000-TEMPLATE.md` durante el init.

**🚫 Restricciones:** Modificar solo archivos de texto, documentación y `init.js` (no romper lógica pura).

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline]
> **Objetivo:** Artefactos de release y archivado.

**🚨 CHECKLIST DOC-OPS:**
- [x] **Release Notes:** N/A (Patch menor, no genera release individual).
- [x] **README:** N/A.
- [x] **CLI Docs:** N/A.
- [x] **Package.json:** N/A.
- [x] **Archivado:** Mover `docs/openspec/changes/016-rfc-semantics/` → `docs/openspec/archive/v1.16.0-016-rfc-semantics/`.
- [x] **RFCs:** Mover RFC de origen si existiera.
- [x] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (marcar 016 como completada).
- [x] **Preparar Git-Ops:** Declarar commit: `docs(sdd): define rfc semantics and guardrails`.

---

### FASE X+1 — Git-Ops [Worker T1]
> **Objetivo:** Comandos git puros.

**🚨 CHECKLIST GIT-OPS:**
- [ ] `git status`
- [ ] `git add -A && git commit -m "docs(sdd): define rfc semantics and guardrails"`
- [ ] `git checkout main && git merge --no-ff feat/v1.16.0-016-rfc-semantics`

</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `sdd-report.md`.
