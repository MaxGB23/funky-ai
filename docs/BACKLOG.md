# 🗂️ Backlog Maestro — Funky AI

**Estado al:** Abril 2026  
**Responsable de Orquestación:** Router Humano

> Este archivo es el único punto de verdad sobre qué está pendiente. Antes de abrir un chat de Worker, consultá este backlog. Antes de cerrar una sesión de Orquestador, actualizá este backlog.

---

## 🔴 URGENTE — Patches v1.1.1 (Sin release nueva, mejoras al protocolo)

Estas tareas NO requieren desarrollar código Node.js. Son ajustes a la infraestructura de `.agents/rules/`.

- [x] **[PATCH-A]** Actualizar `.agents/rules/engram-protocol.md` con: ✅ Completado — W1
  - Trigger Taxonomy completa (cuándo guardar: después de decisiones, bugfixes, descubrimientos)
  - Self-Check Question obligatoria post-tarea
  - Topic Key / Upsert Pattern (buscar con `grep_search` antes de escribir, actualizar si ya existe)
  - Session Close Protocol (estructura de cierre de sesión Orquestador)
  - **Fuente:** `docs/funky-ai/refactor/auditoria-claude-md.md`

- [x] **[PATCH-B]** Actualizar `docs/post-mortem.md` para que refleje la convención de `topic_key` en sus headers. ✅ Completado — W2

- [x] **[PATCH-C]** Actualizar `README.md` para reflejar la nueva estructura de carpetas. ✅ Completado en esta sesión.
- [x] **[PATCH-D]** Corregir `docs/funky-ai/funky-ai.md` línea 89: Contradicción resuelta — 2 bullets diferenciados global vs workspace rules. ✅ Completado — W2
- [x] **[PATCH-E]** Crear `docs/ORCHESTRATOR-STATE.md` como archivo canónico de estado de sesión. ✅ Completado al cierre de sesión.
- [x] **[PATCH-F]** Crear Skill `.agents/skills/sdd-proposal.md` con template PRD-style. ✅ Completado — W3

---

---

## [V1.2.0] RELEASE: CLI & Sharding ✅
*Fecha: Abril 2026*
*Estado: COMPLETADO*

- [x] **[V1.2.A-F]** Core Implementation (CLI, Sharding, Slash Commands).
- [x] **[V1.2-RELEASE-1]** Documentación de Release Notes (`v1.2.0-release.md`).
- [x] **[V1.2-RELEASE-2]** Actualización de Portada (`README.md`).
- [x] **[V1.2-RELEASE-3]** Cierre de hito y merge a `main`.

---

## [V1.3] PRÓXIMO: Token Optimization & Git-Ops 🔭 (Horizonte)
- [x] **[V1.3.A]** **Token Diet Plan**: Auditoría de peso de rulesets y comprimir doctrina para ahorrar cuota (Planificado en `tasks.md`).
- [ ] **[V1.3.B]** **Git-Ops Skills**: Automatizar la creación de PRs y lectura de diffs vía CLI.
- [ ] **[V1.3.C]** Integrar con CI/CD de Gentle AI como referencia para flujo de PR validation.

---

## ✅ COMPLETADO

- [x] Crear `.agents/rules/engram-protocol.md` (Trigger topológico, formato MCP What/Why/Where/Learned)
- [x] Actualizar `GEMINI-funky-global.md` con Auto-Descubrimiento de Skills
- [x] Actualizar `funky-ai.md` con protocolo MCP y Return Envelopes
- [x] Actualizar `funky-ai-team-guide.md` con flujo de Return Envelopes
- [x] Crear `docs/funky-ai/core-concepts/filosofia.md`
- [x] Crear `docs/funky-ai/core-concepts/manifiesto.md`
- [x] Crear `docs/funky-ai/core-concepts/rules-vs-skills.md`
- [x] Crear `docs/funky-ai/journey/01-orchestrator-vs-worker-boundary.md`
- [x] Auditar skills Gentle AI (`auditoria-skills-gentle.md`, `inventario-completo-skills.md`)
- [x] Auditar CLAUDE.md Gentle AI (`auditoria-claude-md.md`)
- [x] Arrancar rama `feature/v1.2-funky-cli` y scaffoldear `funky-cli/` con Node.js
- [x] Crear `docs/funky-ai/releases/v1.1.0-release.md`
- [x] Crear `docs/funky-ai/propuestas/propuesta-v1.2-cli-ecosystem.md`
- [x] Crear `docs/post-mortem.md` (primer entry de bugfix insertado)
- [x] Crear `docs/ORCHESTRATOR-STATE.md` (Session Close Protocol aplicado)
