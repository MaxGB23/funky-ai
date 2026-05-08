# SDD Report — 016 Semántica de RFCs vs Proposals

## Fase 0 & Fase 1 — Setup y Refactor Doc

- **Status:** ✅ Completada
- **Archivos creados/modificados:**
  - `feat/v1.16.0-016-rfc-semantics` (branch git creado y activo — confirmado con `git status`)
  - `.agents/rules/sdd-orchestrator.md` (inyección de sección "Semántica: RFC vs Proposal" con tabla y mandato de ejecución, dentro de `<ROLE_ORCHESTRATOR>`)
  - `docs/repo-map.md` (bump a v1.16.0 + nueva sección §2.2 con tabla semántica `rfcs/` vs `changes/` vs `archive/`)
  - `funky-cli/src/templates/sdd/rfc-template.md` (creado — copia exacta de `docs/openspec/rfcs/000-TEMPLATE.md`)
  - `funky-cli/src/commands/init.js` (entrada `rfc-template.md` agregada al array `filesToCopy`, apunta a `docs/openspec/rfcs/000-TEMPLATE.md` como destino)
- **Bugs encontrados:** Ninguno
- **🔴 Cambio de Scope Detectado:** No
- **Próxima acción:** Tarea 016 consolidada en main.

---

## Fase X+1 — Git-Ops

- **Status:** ✅ Completada
- **Comandos ejecutados:**
  - `git add -A`
  - `git commit -m "docs(sdd): define rfc semantics and guardrails"`
  - `git checkout main`
  - `git merge --no-ff feat/v1.16.0-016-rfc-semantics`
- **Bugs/Conflictos:** Ninguno. Merge limpio.
