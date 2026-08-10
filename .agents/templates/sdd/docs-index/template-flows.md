# Índice de Secciones: `docs/funky-ai/conceptos/template-flows.md`

- **Decisión raíz (2026-08-01):** `sync-templates.js` eliminado — era dead code con dirección invertida (golden → paquete).
- **Nomenclatura:** Diferencia entre _golden templates_ (`.agents/` del proyecto, personalización local) y _templates base distribuidos_ (`funky-cli/src/templates/`, fuente de distribución vía `sdd install`).
- **Árbol real de `funky-cli/src/templates/`:** Estado verificado de `init/`, `bootstrap/`, `assess/` y `estimate/`; skills movidas a `src/skills/` (fuera de templates, manifest por skill).
- **Flujo 1 — Sync dev-time:** ❌ ELIMINADO. Nota histórica: dirección incorrecta, destinos inexistentes, dead code.
- **Flujo 2 — `sdd install` (paquete → proyecto):** ✅ FUNCIONAL. `scaffold.js` copia `bootstrap/root`, `funky-ai-rules/` anidado y `sdd/*.md` al proyecto destino.
- **Flujo 3 — Feature runtime (golden primero, fallback paquete):** ✅ FUNCIONAL. `feature.js` prioriza `.agents/templates/sdd/`; fallback a `src/templates/bootstrap/sdd/` (fix 2026-08-01).
- **Flujo 4 — Skills (paquete → proyecto):** ✅ FUNCIONAL (2026-08-03, manifiesto 2026-08-04). `skills.js` inyecta las skills desde sus manifests (`src/skills/<skill>/`) a `.agents/skills/` y los docs compartidos (`bootstrap/sdd/docs-live-index.md` + `docs-index/_indice-seccional-template.md` + `release-notes.md` opcional) con paridad de bytes respecto a `sdd install` (R-SK-5).
- **Rol dual de `.agents/`:** En el repo fuente (funky-ai) es personalización local; en el proyecto destino son golden templates que ganan en runtime.
- **Evidencia en código:** Tabla de archivos y líneas clave en `scaffold.js`, `skills.js`, `feature.js`, `init.js` y `fs-adapter.js`.
- **Deuda pendiente:** Estado de ítems resueltos e ítem abierto sobre cobertura de tests de templates.
