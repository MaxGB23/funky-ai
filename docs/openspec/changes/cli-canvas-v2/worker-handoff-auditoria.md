# 🤖 Worker Handoff: Análisis de Templates del CLI

> **Contexto:** Estamos rediseñando `funky init` y el `PROJECT-CANVAS.md`. Antes de planificar la nueva estructura (y la posible separación entre Canvas Arquitectónico y Canvas de Infraestructura), necesitamos auditar exactamente qué hace cada uno de los archivos que genera el CLI actualmente.

## 🎯 Misión
Analizar todos los archivos dentro de `funky-cli/src/templates/bootstrap/` y generar un documento de resumen detallado sobre el rol de cada archivo dentro del ecosistema Funky AI.

## 📁 Archivos a analizar
Ubicación: `m:\funky-ai\funky-cli\src\templates\bootstrap\`
1. `ORCHESTRATOR-STATE.md`
2. `agents-rules-engram-protocol.md`
3. `agents-rules-sdd-orchestrator.md`
4. `agents-rules-secops.md`
5. `plantilla-worker-handoff.md`

## 📝 Entregable
Debes crear un archivo en `docs/funky-ai/cli/auditoria-templates-v1.7.md` que contenga por cada archivo analizado:
- **Propósito principal:** ¿Para qué sirve?
- **Público objetivo:** ¿Lo lee el humano, el orquestador, o el worker?
- **Dependencias cognitivas:** ¿Qué información necesita saber este archivo sobre el proyecto para ser útil? (Ej: ¿Necesita saber el framework? ¿Necesita saber la arquitectura?)

## 📜 Reglas Estrictas
- **NO MODIFIQUES** los templates originales. Solo léelos.
- Mantén el análisis objetivo y conciso.
- Al finalizar, genera un `report.md` en esta misma carpeta y pídele al humano que vuelva con el Orquestador.

---

> **[SISTEMA - PARA EL WORKER]** Eres un Worker LLM ejecutando esta fase. Al terminar, escribe el `report.md` y detente.
