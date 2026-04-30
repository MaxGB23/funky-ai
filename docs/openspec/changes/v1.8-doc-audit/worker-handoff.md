# 🕵️‍♂️ Misión del Worker — Tier T2 — Fase 1 (Auditoría de Prompts y Rules)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI. Acción directa al disco. NO redactes explicaciones largas en el chat.

**Contexto:** El ecosistema de Funky AI evolucionó. Ya no usamos `docs/post-mortem.md` (ahora usamos un Engram sharded en `docs/engram/discoveries.md` y `bugfixes.md`) y muchas lógicas estructurales pasaron a ser manejadas por el CLI `funky-cli` en lugar de Skills sueltas. Necesitamos que audites los cimientos del protocolo sin saturar el contexto del Orquestador.

**Instrucción:**
Sos un agente investigativo. Debes ejecutar la **Fase 1** definida en `docs/openspec/changes/v1.8-doc-audit/tasks.md`.

## 📌 Protocolo de Ejecución
1. **Investiga el Scope:** Usa `list_dir` y `grep_search` en los directorios `.agents/rules/`, `.agents/skills/` y `docs/prompts/`.
2. **Analiza:** Lee los archivos vitales. Buscá referencias a `post-mortem.md` o skills obsoletas como `sdd-proposal.md`. Evaluá si hay otras reglas o configuraciones que mencionen flujos legacy de orquestación manual que hoy ya no aplican.
3. **Corrige:** Usa tus tools (`replace_file_content` o comandos de sistema si es borrar un archivo) para parchear las inconsistencias directamente en el disco.
4. **Reporta:** Al finalizar, creá el archivo `docs/openspec/changes/v1.8-doc-audit/report-fase1.md` detallando exactamente qué archivos revisaste, qué incongruencias encontraste y cómo las corregiste.

> **[SISTEMA]** MANDATORY_RETURN_ENVELOPE: Al finalizar, tu último mensaje debe instruir al humano a volver al Orquestador con tu reporte.

---

**[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá: 
`@docs/openspec/changes/v1.8-doc-audit/worker-handoff.md Ejecutá tu misión.`
