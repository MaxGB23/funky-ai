# Índice de Secciones: `docs/funky-forge/init.md`

- **1. ¿Qué problema resuelve?:** Pasar de idea difusa a proyecto esbocelado generando 5 archivos base en `docs/funky-ai/canvas/`.
- **2. ¿Cuándo usarlo?:** Paso 1 del proyecto; re-ejecutable para actualizar guías sin tocar decisiones.
- **3. ¿Cuándo NO usarlo?:** Sin guard de bloqueo: decisiones existentes se omiten (nunca error).
- **4. Árbol de archivos:** Templates de entrada (`-template`) y archivos generados (decisiones vs guías).
- **5. Diagrama de flujo:** `runInit` → intenciones ordenadas → `executeIntentions` con confirmación Y/N para guías.
- **6. canvas-planning-guide.md y init-prompt.md:** Guías actualizables con Y/N (sin TTY: default `n`).
- **7. Contrato de feedback:** Archivo nuevo, guía existente, decisión existente, error real de I/O.
- **8. Salida esperada:** Ejemplos por estado (creación limpia, parcial, todo existente).
