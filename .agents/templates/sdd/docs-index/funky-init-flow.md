# Índice de Secciones: `docs/funky-forge/funky-init-flow.md`

- **1. Vision General:** Flujo de `funky init` (brief + canvases + guías) y `funky sdd install` (ecosistema); sin modos interactivos obligatorios.
- **2. Arbol de Decision (Flujo Completo):** Diagramas de `funky init` y `funky sdd install` con manejo por kind (decision/guide).
  - **`funky sdd install`:** Copia del ecosistema con salteo de archivos existentes (idempotente).
- **3. Archivos Involucrados:** Código fuente, templates estáticos copiados y archivos generados.
  - **3.1 Código fuente:** `init.js`, `scaffold.js` y `fs-adapter.js` con su rol.
  - **3.2 Templates estáticos (copiados por `funky sdd install`):** Archivos de `bootstrap/` copiados sin interpolación.
  - **3.3 Archivos generados por `funky init`:** `brief-funcional.md`, `PROJECT-CANVAS.md`, `INFRA-CANVAS.md` (decisiones) y `canvas-planning-guide.md`, `init-prompt.md` (guías) desde templates con sufijo `-template`.
- **4. Idempotencia:** Verificación con `existsSync`, comportamiento por kind ante re-ejecución.
