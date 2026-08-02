# Índice de Secciones: `docs/funky-ai/feature.md`

- **1. ¿Qué problema resuelve?:** Scaffolding de cambios SDD bajo `openspec/changes/<name>/`.
- **2. Tiers de inyección:** Selector interactivo gobernado por `INJECTION_MATRIX` y `resolveFiles()`.
  - **T1 — Fix / Hotfix / Cambio trivial:** `tasks.md` y `report.md` (2 archivos).
  - **T2 — Feature / SDD ligero:** Base + `explore`, `proposal`, `spec`, `release-checklist.md` y `docs.md` condicional.
  - **T3 — Feature compleja / Archivo viviente:** `tasks.md`, `release-checklist.md` y `docs.md` condicional.
- **3. Golden templates vs Fallback:** Prioridad a `.agents/templates/sdd/`; fallback a `src/templates/bootstrap/sdd/` con warning.
- **4. Diagrama de flujo:** Sanitización del nombre, resolución de templates y ejecución de intenciones.
- **5. Flags y argumentos:** `<featureName>` posicional; el resto se resuelve con prompts interactivos.
