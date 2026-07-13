# Proposal: 012 - Auto-Tiering del Orquestador

## 1. Solución Propuesta
La solución se basa en inyectar un **Contrato de Sesión Obligatorio** (Self-Assessment) en las reglas base del Orquestador (`.agents/rules/sdd-orchestrator.md`). Al inicio de cada sesión, el Orquestador deberá ejecutar mentalmente una Matriz de Decisión y declarar explícitamente su Tier de operación antes de generar ningún artefacto en disco.

Se formaliza la resolución del debate de "Delegación vs Ejecución":
- **Tier 1 (Trivial/Flash):** El Orquestador planifica la ejecución directa. Saltea `explore` y `proposal`, y escupe directamente el `tasks.md`. El scaffolding vacío será purgado en el post-archivado.
- **Tier 2 (Standard):** Flujo orquestado normal. El Orquestador hace Explore → Propose → Spec → Tasks, y el Worker ejecuta.
- **Tier 3 (Crítico):** Aislamiento forzado. El Orquestador requiere confirmación humana para avanzar a la ejecución y frena flujos automatizados si detecta riesgo alto.

## 2. Scope (In / Out)
**✅ IN SCOPE:**
- Modificación del archivo `.agents/rules/sdd-orchestrator.md` para inyectar la matriz y flujos.
- Actualización de `ORCHESTRATOR-STATE.md` (cerrar la tarea).

**❌ OUT OF SCOPE:**
- No tocaremos el código de `funky-cli` (Scaffolding). El CLI seguirá escupiendo todos los archivos, el manejo de archivos vacíos para T1 se hará por política.
- No se implementará el protocolo formal de los 7 agentes del "Tier 4 - Deep SDD". Se reservará como concepto teórico para otro RFC.

## 3. Viabilidad y Alternativas
- **Viabilidad Absoluta:** Al ser solo un cambio en la configuración de la IA (Workspace Rule), no hay fricción técnica.
- **Alternativa Descartada:** Modificar la CLI para que pregunte el Tier antes de crear el scaffolding. **Por qué se descartó:** Va en contra de la automatización; queremos que la IA lo infiera, no que el humano lo tenga que escribir a mano cada vez.

---
> 🔴 **Cambio de Scope Detectado:** No
