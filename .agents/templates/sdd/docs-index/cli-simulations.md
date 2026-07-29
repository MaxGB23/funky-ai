# Índice de Secciones: `docs/funky-ai/operaciones/cli-simulations.md`

- **Vector 1: Sobreescritura Destructiva:** Comportamiento ante re-inicialización de Canvas y `--bootstrap`.
- **Vector 2: Interrupción de UX:** [OBSOLETO — modo interactivo eliminado]
- **Vector 3: Errores de Permisos:** [PENDIENTE] Manejo de `EACCES` en directorios de solo lectura.
- **Vector 4: Flags Inválidos:** Validación de `funky init`/`--bootstrap` cuando los Canvas ya existen o faltan.
- **Vector 5: Fase Destructiva:** Protección contra sobreescritura en comandos `funky phase`.
- **Vector 6: Assess Incompleto:** Assess con `[Responde aquí]` sin reemplazar — advierte pero continúa.
- **Vector 7: Estimate sin Assess:** Estimate sin `docs/architecture-decisions.md` — advierte pero genera guía parcial.
- **Vector 8: Pipeline sin context.json:** `pipeline` sin `context.json` — lo crea automáticamente.
