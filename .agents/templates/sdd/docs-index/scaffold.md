# Índice de Secciones: `docs/funky-ai/scaffold.md`

- **1. ¿Qué problema resuelve?:** Base documental agnóstica OpenSpec/SDD: README interpolado (`{{project_name}}`, hub = `ORCHESTRATOR-STATE.md`), `release-notes.md` y RFC template. Framework-agnostic: sin reglas de agentes ni templates de proceso.
- **2. ¿Cuándo usarlo?:** Proyectos que adoptan la convención documental OpenSpec/SDD sin instalar el framework completo. Idempotente: archivos existentes se skipean.
- **3. Árbol completo de inyección (4 archivos):** `README.md` (create, interpolado), `ORCHESTRATOR-STATE.md`, `.agents/templates/sdd/release-notes.md` y `openspec/rfcs/000-rfc-template.md`. El README es el único template generalizado y se comparte byte a byte con `funky sdd install` (paridad de bytes).
- **4. Diferencia con `funky sdd install`:** Tabla comparativa de alcance: scaffold = 4 archivos; `sdd install` = framework completo (23 reglas, 8+2 templates SDD, 7 directorios engram, `TEMPLATE_GUIDE.md`).
- **5. Diagrama de flujo:** `runAgnosticScaffoldCommand()` → `runAgnosticScaffold()` ensambla intenciones (`create` README + `copy` ×3) que procesa `executeIntentions()`; función pura sin I/O directo.
