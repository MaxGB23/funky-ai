# 🕵️‍♂️ Misión del Worker — Tier T2 — Fase 3 (Auditoría del Ecosistema CLI)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI. Acción directa al disco. NO redactes explicaciones largas en el chat.

**Contexto:** El CLI `funky-cli` es el motor de scaffolding de Funky AI. Inyecta templates (`bootstrap/` y `sdd/`) en nuevos proyectos. Si esos templates todavía hablan del protocolo legacy (ej. `post-mortem.md`, flujos manuales obsoletos), entonces **cada proyecto nuevo que se inicialice con `funky init` heredará bugs documentales**. Los reportes de Fases anteriores están en `docs/openspec/changes/v1.8-doc-audit/`.

**Instrucción:**
Sos un agente investigativo. Debes ejecutar la **Fase 3** definida en `docs/openspec/changes/v1.8-doc-audit/tasks.md`.

## 📌 Protocolo de Ejecución
1. **Leé los reportes previos:** Abrí `report-fase1.md` y `report-fase2.md` en `docs/openspec/changes/v1.8-doc-audit/` para tener contexto acumulado.
2. **Investiga el Scope:** Usá `list_dir` en `funky-cli/src/templates/bootstrap/` y `funky-cli/src/templates/sdd/`. Enumerá todos los archivos.
3. **Analiza uno por uno:** Leé cada template del scope. Buscá:
   - Referencias a `docs/post-mortem.md` o al viejo sistema de memoria monolítico.
   - Instrucciones de Memory Polling que apunten a la ruta incorrecta.
   - Protocolos de Engram que no usen el sharding (`discoveries.md` / `bugfixes.md`).
   - Cualquier lógica que haya sido reemplazada por un comando CLI pero el template siga describiendo el proceso manual.
4. **Corrige:** Aplicá los fixes directamente en el disco.
5. **Reporta:** Al finalizar, creá `docs/openspec/changes/v1.8-doc-audit/report-fase3.md` detallando qué templates revisaste, qué incongruencias encontraste y qué corregiste.

> **[SISTEMA]** MANDATORY_RETURN_ENVELOPE: Al finalizar, tu último mensaje debe instruir al humano a volver al Orquestador con el reporte.

---

**[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
`@docs/openspec/changes/v1.8-doc-audit/worker-handoff-fase3.md Ejecutá tu misión.`
