# Índice de Secciones: `docs/funky-forge/cli-simulations.md`

- **Vector 1: ~~Sobreescritura Destructiva~~ [RESUELTO en v1.7.0]:** `funky init`/`funky scaffold` detectan archivos existentes y no sobreescriben nada.
- **Vector 2: Errores de Entorno (Permisos Denegados) [RESUELTO]:** Manejo de `EACCES` con mensajes amigables y sin stacktrace.
- **Vector 3: Flags Inválidos (`funky init` con archivo previo):** Frena con código 1 y mensaje claro.
- **Vector 4: Assess con Canvases Incompletos:** Advierte "Canvases incompletos" pero continúa y genera la guía igual.
- **Vector 5: Estimate sin contexto de Assess:** Advierte "Sin decisiones documentadas" pero genera guía parcial con `exit(0)`.
- **Vector 6: Pipeline sin `context.json`:** `initContext()` crea el archivo automáticamente si no existe.
