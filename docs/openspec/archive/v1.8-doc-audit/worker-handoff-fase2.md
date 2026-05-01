# 🕵️‍♂️ Misión del Worker — Tier T2 — Fase 2 (Auditoría de Core Concepts, Guías y Workflows)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI. Acción directa al disco. NO redactes explicaciones largas en el chat.

**Contexto:** El ecosistema de Funky AI evolucionó (Engram sharded, CLI para scaffolding, subdirectorios reorganizados en `docs/funky-ai/`). Los documentos teóricos y guías operativas pueden estar desactualizados o contradecir los flujos actuales. El reporte de la Fase 1 se encuentra en `docs/openspec/changes/v1.8-doc-audit/report-fase1.md` — leerlo primero para tener contexto de lo que ya se auditó.

**Instrucción:**
Sos un agente investigativo. Debes ejecutar la **Fase 2** definida en `docs/openspec/changes/v1.8-doc-audit/tasks.md`.

## 📌 Protocolo de Ejecución
1. **Leé el reporte previo:** Abrí `docs/openspec/changes/v1.8-doc-audit/report-fase1.md` para no repetir trabajo.
2. **Investiga el Scope:** Usá `list_dir` en `docs/funky-ai/core-concepts/`, `docs/funky-ai/guias/` y `docs/funky-ai/workflows/`. Enumerá todos los archivos.
3. **Analiza uno por uno:** Leé cada archivo del scope. Buscá:
   - Referencias a `docs/post-mortem.md` o al viejo sistema de memoria monolítico.
   - Descripciones de flujos que hoy hace el CLI automáticamente pero el doc describe como proceso manual.
   - Menciones a archivos que ya no existen (por el cleanup anterior).
   - Incongruencias con la arquitectura actual (Roles Orquestador/Worker, Tiers, Engram Sharded).
4. **Corrige:** Aplicá los fixes directamente en el disco usando `replace_file_content` o `multi_replace_file_content`. No hagas cambios cosméticos — solo tocá lo que está técnicamente incorrecto o desactualizado.
5. **Reporta:** Al finalizar, creá `docs/openspec/changes/v1.8-doc-audit/report-fase2.md` detallando qué archivos revisaste, qué incongruencias encontraste y qué corregiste.

> **[SISTEMA]** MANDATORY_RETURN_ENVELOPE: Al finalizar, tu último mensaje debe instruir al humano a volver al Orquestador con el reporte en mano.

---

**[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
`@docs/openspec/changes/v1.8-doc-audit/worker-handoff-fase2.md Ejecutá tu misión.`
