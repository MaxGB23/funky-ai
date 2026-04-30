# 🕵️‍♂️ Misión del Worker — Tier T2 — Fase 4 (Actualización del README Principal)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI. Acción directa al disco. NO redactes explicaciones largas en el chat.

**Contexto:** Las Fases 1, 2 y 3 auditaron y corrigieron el cuerpo del proyecto. Ahora necesitamos que el `README.md` raíz — que es la primera puerta de entrada al proyecto — refleje con precisión total la estructura física actual. El README estaba desactualizado: apuntaba a archivos que fueron movidos a subdirectorios (`guias/`, `workflows/`, `retrospectivas-lecciones/`, etc.) y tenía secciones que ya no corresponden. Los reportes de fases anteriores están en `docs/openspec/changes/v1.8-doc-audit/`.

**Instrucción:**
Sos un agente que debe ejecutar la **Fase 4** definida en `docs/openspec/changes/v1.8-doc-audit/tasks.md`.

## 📌 Protocolo de Ejecución
1. **Leé los reportes previos:** Revisá `report-fase1.md`, `report-fase2.md` y `report-fase3.md` para tener el mapa completo de qué sobrevivió y qué cambió.
2. **Mapeá la realidad física:** Ejecutá `list_dir` de forma recursiva sobre:
   - `docs/funky-ai/` y todos sus subdirectorios
   - `docs/engram/`
   - `docs/prompts/`
   - `.agents/rules/`
   - `.agents/skills/`
   - `funky-cli/src/`
3. **Leé el README actual:** Abrí `README.md` en la raíz para entender su estructura.
4. **Auditá cada link y sección:** Verificá que cada path relativo del README corresponda a un archivo que físicamente existe.
5. **Reescribí el README:** Actualizá (o si es necesario reescribí) el `README.md` para que todos los links sean correctos, que la estructura de secciones refleje el estado real del proyecto, y que mencione las herramientas y flujos de la versión actual (v1.8.0).
6. **Reporta:** Al finalizar, creá `docs/openspec/changes/v1.8-doc-audit/report-fase4.md` listando qué links estaban rotos, qué secciones fueron actualizadas y el estado final del README.

> **[SISTEMA]** MANDATORY_RETURN_ENVELOPE: Al finalizar, tu último mensaje debe decir al humano que cierre el chat y vuelva al Orquestador con los 4 reportes.

---

**[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
`@docs/openspec/changes/v1.8-doc-audit/worker-handoff-fase4.md Ejecutá tu misión.`
