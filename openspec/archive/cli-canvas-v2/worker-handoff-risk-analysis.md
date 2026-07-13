# 🤖 Worker Handoff: Análisis de Riesgos e Inconsistencias (CLI Canvas v2)

> **Contexto:** Hemos propuesto separar la inicialización en dos archivos (`PROJECT-CANVAS.md` e `INFRA-CANVAS.md`) y expandir los prompts de `funky init`. Antes de escribir las tareas de código, necesitamos una revisión cruzada (cross-check) para garantizar que la nueva arquitectura no rompa funcionalidades existentes ni introduzca estados inválidos.

## 🎯 Misión
Actuar como un QA Arquitectónico. Tu tarea es cruzar la nueva propuesta con el flujo actual del sistema y buscar **agujeros de lógica, problemas de idempotencia o casos borde** que no hayamos contemplado.

## 📁 Archivos a analizar
1. **Flujo actual:** `docs/funky-ai/cli/funky-init-flow.md`
2. **Observaciones:** `docs/funky-ai/cli/cli-init-mejoras-pendientes.md`
3. **Propuesta nueva:** `docs/openspec/changes/cli-canvas-v2/proposal.md`
4. **Código fuente base:** `funky-cli/src/commands/init.js` y `funky-cli/src/utils/canvas.js`

## 🔍 Foco del Análisis (Qué buscar)
- **Modo Headless:** ¿Qué pasa si el usuario ejecuta `funky init` y existe `PROJECT-CANVAS.md` pero falta `INFRA-CANVAS.md`? ¿Cómo se maneja ese estado parcial?
- **Idempotencia:** Si el usuario corre `funky init` dos veces, ¿se sobreescriben los canvases o se saltean?
- **Flujo de clack/prompts:** Con tantos prompts nuevos (Fase 1 y Fase 2), si el usuario presiona `Ctrl+C` en la mitad, ¿se captura bien el onCancel?
- **Compatibilidad hacia atrás:** ¿Qué pasa con los repositorios que ya tienen el v1.7.0 inicializado con un solo `PROJECT-CANVAS.md` viejo?

## 📝 Entregable
Debes crear un archivo en `docs/openspec/changes/cli-canvas-v2/risk-analysis.md`.
El documento debe listar cada inconsistencia encontrada y proponer una solución técnica específica que luego podamos incluir en nuestro `tasks.md`.

## 📜 Reglas Estrictas
- **NO ESCRIBAS CÓDIGO** en el código fuente de la CLI.
- No modifiques la propuesta.
- Sé extremadamente crítico. Si ves un escenario donde el CLI puede explotar, documéntalo.
- Al finalizar, genera un `report.md` en esta carpeta y pídele al humano que vuelva con el Orquestador.

---

> **[SISTEMA - PARA EL WORKER]** Eres un Worker LLM ejecutando esta fase de QA. Al terminar, escribe el `report.md` y detente.
