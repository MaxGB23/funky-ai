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
- **Próxima acción:** El Orquestador debe ejecutar la FASE X (Doc-Ops) inline:
  - Marcar 016 como completada en `ORCHESTRATOR-STATE.md`
  - Declarar commit: `docs(sdd): define rfc semantics and guardrails`
  - Luego delegar FASE X+1 (Git-Ops / Worker T1) para `git add -A`, commit y merge a `main`
