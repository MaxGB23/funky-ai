# Índice de Secciones: `docs/funky-ai/conceptos/template-flows.md`

- **Decisión raíz (2026-08-01):** `sync-templates.js` eliminado — era dead code con dirección invertida (golden → paquete).
- **Nomenclatura:** Diferencia entre _golden templates_ (`.agents/` del proyecto, personalización local) y _templates base distribuidos_ (`funky-cli/src/templates/`, fuente de distribución vía scaffold).
- **Árbol real de `funky-cli/src/templates/`:** Estado verificado de `assess/`, `bootstrap/`, `estimate/`, `init/`; lista explícita de lo que NO existe.
- **Flujo 1 — Sync dev-time:** ❌ ELIMINADO. Nota histórica: dirección incorrecta, destinos inexistentes, dead code.
- **Flujo 2 — Scaffold (paquete → proyecto):** ✅ FUNCIONAL. `scaffold.js` copia `bootstrap/root`, `funky-ai-rules/` anidado y `sdd/*.md` al proyecto destino.
- **Flujo 3 — Feature runtime (golden primero, fallback paquete):** ✅ FUNCIONAL. `feature.js` prioriza `.agents/templates/sdd/`; fallback a `src/templates/bootstrap/sdd/` (fix 2026-08-01).
- **Rol dual de `.agents/`:** En el repo fuente (funky-ai) es personalización local; en el proyecto destino son golden templates que ganan en runtime.
- **Evidencia en código:** Tabla de archivos y líneas clave en `scaffold.js`, `feature.js`, `init.js` y `fs-adapter.js`.
- **Deuda pendiente:** Estado de ítems resueltos e ítem abierto sobre cobertura de tests de templates.
