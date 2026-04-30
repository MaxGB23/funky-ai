# 👷‍♂️ Misión del Worker: Fase 1 (Auditoría de Incongruencias)

**Contexto:** El proyecto Funky AI ha migrado su sistema de memoria (Engram) para que use `docs/engram/discoveries.md` y `bugfixes.md`, en lugar del viejo `docs/post-mortem.md`. Algunas de nuestras plantillas y configuraciones aún apuntan a la ruta legacy.

**Instrucción:**
Debes ejecutar la Fase 1 definida en `docs/openspec/changes/v1.8-doc-audit/tasks.md`.

## 📌 Tareas a Ejecutar
1. Busca en `docs/prompts/gemini-funky-backup.md` y `docs/prompts/GEMINI-funky-global.md` (si existe) referencias a `post-mortem.md`. Reemplazalas por `docs/engram/discoveries.md` o `docs/engram/bugfixes.md` o `docs/engram/` según corresponda.
2. Actualiza `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`. Actualiza el "Manual Engram Protocol" para que apunte a `discoveries.md` y `bugfixes.md`.
3. Elimina físicamente `.agents/skills/sdd-proposal.md`.
4. Al finalizar, crea (o actualiza) `docs/openspec/changes/v1.8-doc-audit/report.md` con un resumen estructurado (estado, archivos modificados, bugs encontrados si los hubiera).

> **[SISTEMA]** MANDATORY_RETURN_ENVELOPE: Al finalizar, el último mensaje debe instruir al humano a volver al Orquestador con el reporte.

---

**[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá: 
`@docs/openspec/changes/v1.8-doc-audit/worker-handoff.md Ejecutá tu misión.`
