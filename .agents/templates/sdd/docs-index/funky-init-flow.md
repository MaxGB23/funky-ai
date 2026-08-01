# Índice de Secciones: `docs/funky-forge/funky-init-flow.md`

- **1. Vision General:** Flujo de `funky init` (canvases) y `funky scaffold` (ecosistema); sin modos interactivos.
- **2. Arbol de Decision (Flujo Completo):** Diagramas de `funky init` y `funky scaffold` con ruteo por canvas existentes.
  - **`funky init`:** Error con `exit(1)` si existe un canvas, o genera canvases y recomienda `funky scaffold`.
  - **`funky scaffold`:** Copia del ecosistema con salteo de archivos existentes (idempotente).
- **3. Archivos Involucrados:** Código fuente, templates estáticos copiados y canvas dinámicos generados.
  - **3.1 Código fuente:** `init.js`, `scaffold.js` y `canvas.js` con su rol.
  - **3.2 Templates estáticos (copiados por `funky scaffold`):** Archivos de `bootstrap/` copiados sin interpolación.
  - **3.3 Archivos dinámicos (generados por `funky init`):** `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` según el config.
- **4. Idempotencia:** Criterios de verificación con `existsSync` y comportamiento ante re-ejecución.
