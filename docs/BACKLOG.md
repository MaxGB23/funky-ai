# 🗂️ Backlog Maestro — Funky AI

**Estado al:** Abril 2026  
**Responsable de Orquestación:** Router Humano

> Este archivo es el único punto de verdad sobre qué está pendiente. Antes de abrir un chat de Worker, consultá este backlog. Antes de cerrar una sesión de Orquestador, actualizá este backlog.

---

## 🔴 URGENTE — Patches v1.1.1 (Sin release nueva, mejoras al protocolo)

Estas tareas NO requieren desarrollar código Node.js. Son ajustes a la infraestructura de `.agents/rules/`.

- [ ] **[PATCH-A]** Actualizar `.agents/rules/engram-protocol.md` con:
  - Trigger Taxonomy completa (cuándo guardar: después de decisiones, bugfixes, descubrimientos)
  - Self-Check Question obligatoria post-tarea
  - Topic Key / Upsert Pattern (buscar con `grep_search` antes de escribir, actualizar si ya existe)
  - Session Close Protocol (estructura de cierre de sesión Orquestador)
  - **Fuente:** `docs/funky-ai/refactor/auditoria-claude-md.md`

- [ ] **[PATCH-B]** Actualizar `docs/post-mortem.md` para que refleje la convención de `topic_key` en sus headers (el primer entry ya existe, hay que darle el formato correcto como modelo de referencia).

- [x] **[PATCH-C]** Actualizar `README.md` para reflejar la nueva estructura de carpetas. ✅ Completado en esta sesión.
- [ ] **[PATCH-D]** Corregir `docs/funky-ai/funky-ai.md` línea 89: La instrucción *"NO debe haber restricciones de orquestación en el GEMINI.md global"* es una contradicción directa con la v1.1 actual que ya inyectó el protocolo SDD en el Global. Clarificar o eliminar.
- [x] **[PATCH-E]** Crear `docs/ORCHESTRATOR-STATE.md` como archivo canónico de estado de sesión. ✅ Completado al cierre de sesión.
- [ ] **[PATCH-F]** Crear Skill `.agents/skills/sdd-proposal.md` con template PRD-style. Campos obligatorios: `Estado` (Ideación/In Progress/Done), `Backlog IDs vinculados`, `Criterios de Aceptación`, e `Implementación` con referencia explícita a archivo destino. **Fuente:** `docs/post-mortem.md` entry `[discovery] Anti-patrón: Propuestas sin Estado Obligatorio`.

---

## 🟡 PRÓXIMO — Release v1.2 (funky-cli en Node.js)

Diseño documentado en: `docs/funky-ai/propuestas/propuesta-v1.2-cli-ecosystem.md`

- [ ] **[V1.2-A]** Auditar CI/CD de Gentle AI antes de ejecutar — Mandar Worker Analista a leer `docs/gentle-ai/.github/workflows/` y extraer políticas de QA relevantes para Node.js.
- [ ] **[V1.2-B]** Diseño técnico del CLI en Node.js (Orquestador — sin picar código).
- [ ] **[V1.2-C]** Implementar `funky init` — Worker Tier 2 crea la estructura base del Falso Engram (directorio `docs/engram/` en lugar de `post-mortem.md` monolítico).
- [ ] **[V1.2-D]** Implementar `funky phase <name>` — Worker Tier 2 crea templates de fases SDD.
- [ ] **[V1.2-E]** Documentar comandos `/sdd-*` formalmente en `funky-ai.md` y `funky-ai-team-guide.md`.
- [ ] **[V1.2-F]** Implementar Sharding de Memoria (`docs/engram/` con archivos temáticos).

---

## 🟠 FUTURO — Release v1.3 (Git-Ops)

- [ ] **[V1.3-A]** Crear Skill `git-ops.md` en `.agents/skills/`. 
- [ ] **[V1.3-B]** Integrar con CI/CD de Gentle AI como referencia para flujo de PR validation.

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
