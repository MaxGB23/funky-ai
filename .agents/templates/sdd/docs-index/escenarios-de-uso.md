# Índice de Secciones: `docs/funky-forge/escenarios-de-uso.md`

- **Tabla de Referencia Rápida:** Mapeo de estados del usuario al primer comando recomendado.
- **Escenario 1:** "No tengo claro qué quiero construir" (Debate → `funky init` → Llenado → `funky sdd install`).
  - **"No tengo claro qué quiero construir":** Debate en chat vacío, canvases, assess opcional, `sdd install` y estimate.
- **Escenario 2:** "Sé qué quiero construir, arranco desde cero" (`funky init` → Llenado → `funky sdd install`).
- **Escenario 3:** "Tengo un repo existente sin Funky AI" (`funky init` → Llenado → `funky sdd install`).
  - **"Tengo un repo existente sin Funky AI":** Canvases sobre código existente y ecosistema sin tocar nada.
- **❌ Anti-patrones a evitar:** Errores de onboarding documentados con su por qué.
- **Escenario 4:** "Quiero discutir la arquitectura o pricing" (`funky assess` / `funky estimate` / `funky pipeline all`).
  - **"Quiero discutir la arquitectura o pricing de mi proyecto":** Sesiones de assess, estimate y pipeline all en secuencia.
- **Escenario 5:** "Encontré un bug o tomé una decisión que debe ser recordada" (`funky engram add`).
  - **"Encontré un bug o tomé una decisión de arquitectura que debe ser recordada":** Wizard interactivo de `funky engram add` y flags para agentes.
