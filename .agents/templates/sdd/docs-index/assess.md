# Índice de Secciones: `docs/funky-forge/assess.md`

- **1. ¿Qué problema resuelve?:** Evaluación del stack, detección de riesgos arquitectónicos y guía de discusión.
- **2. ¿Cuándo usarlo standalone?:** Revisión arquitectónica aislada sin encadenar con otros comandos.
- **3. ¿Cuándo usarlo con pipeline?:** Como paso intermedio compartiendo estado con `estimate` vía `context.json`.
- **4. Requisitos previos:** Canvases en `docs/funky-ai/canvas/` (o placeholders con advertencia).
- **5. Inputs:** Canvases, template de guía y template de decisiones.
  - **Validación de canvases:** `findCanvases()` cuenta secciones con `[Responde aquí]` pendientes.
- **6. Outputs:** Guía de discusión, template de decisiones y `context.json` con `--context`.
  - **architecture-review.md:** Canvases embebidos y guía de discusión en 6 fases.
  - **architecture-decisions.md:** Template por decisión con rationale, alternativas y riesgos.
- **7. Preguntas dinámicas:** Reglas por regex que generan preguntas según el contenido de los canvases.
- **8. Diagrama de flujo:** Proceso de `runAssess()` desde el contexto hasta la escritura de salidas.
- **9. Flags:** `--context, -c <path>` para integración con pipeline.
