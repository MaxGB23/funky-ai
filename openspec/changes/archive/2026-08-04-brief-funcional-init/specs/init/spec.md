# Delta para el dominio `init` — Brief funcional obligatorio

Cambio: `brief-funcional-init`. Nueva capacidad `init-brief-funcional`; modifica `init-command` (árbol 3→4 outputs, refactor a `runInit` pura). Estilo: R-XX con bullets GIVEN/WHEN/THEN/AND, siguiendo `openspec/specs/init/spec.md`.

## ADDED Requirements

### R6: Template del brief funcional

El sistema DEBE incluir `src/templates/init/brief-funcional.md` con los 12 ítems de §13: nombre, objetivo, tipo de usuario, caso de uso principal, funcionalidades principales, funcionalidades secundarias/futuras, roles y permisos, seguridad, integraciones, entregables por fase, MVP vs fase 2 y KPI. Cada campo DEBE usar el placeholder `[Completar]`; el template NO DEBE contener `[Responde aquí]` (evita inflar `countUnfilledSections` de assess/estimate).

- GIVEN el template existe en `src/templates/init/`
- WHEN se inspecciona su contenido
- THEN contiene los 12 ítems de §13
- AND cada campo usa `[Completar]`
- AND NO contiene `[Responde aquí]`

### R7: Brief como primer output

El sistema DEBE copiar el brief como PRIMER output a `docs/funky-ai/canvas/brief-funcional.md`, antes que PROJECT/INFRA canvases (secuencia §13: primero "qué", luego "cómo"). El brief NO participa del guard de existencia (solo PROJECT/INFRA canvases). Si `brief-funcional.md` ya existe, DEBE omitirse sin error, igual que `canvas-planning-guide.md`.

- GIVEN el proyecto no tiene outputs previos
- WHEN `funky init` se ejecuta
- THEN la primera intención de copia es `brief-funcional.md`
- AND se crea `docs/funky-ai/canvas/brief-funcional.md` desde el template
- AND luego se crean PROJECT/INFRA canvases
- AND exit(0)

- GIVEN existe `brief-funcional.md` pero no los canvases
- WHEN `funky init` se ejecuta
- THEN el brief NO se sobrescribe
- AND los canvases se crean normalmente
- AND exit(0)

### R8: runInit como función pura (testabilidad)

El sistema DEBE exponer `runInit({ templatesDir, targetBase })` que retorne las intenciones ordenadas (mkdir `canvasDir`; copy brief; copy PROJECT; copy INFRA; copy guide si no existe) SIN efectos de I/O ni `process.exit`. El action DEBE conservar el guard de existencia actual (exit(1) si PROJECT o INFRA ya existen) y ejecutar `executeIntentions`. `runInit` DEBE ser testeable sin invocar el comando; el guard DEBE tener test propio.

- GIVEN `runInit({ templatesDir, targetBase })` se invoca
- WHEN se inspecciona el retorno
- THEN retorna intentions con mkdir primero y copy brief ANTES que PROJECT/INFRA
- AND no realiza I/O ni imprime

- GIVEN `PROJECT-CANVAS.md` o `INFRA-CANVAS.md` ya existe
- WHEN el action de `funky init` se ejecuta
- THEN se imprime el error actual y exit(1)
- AND no se modifica ningún archivo existente

### R9: Contrato de docs y --help

El cambio DEBE actualizar `docs/funky-forge/init.md`: árbol de outputs 3→4 con `brief-funcional.md` como primer archivo y diagrama alineado con `runInit`. `--help` DEBE actualizarse vía `enrichCommandHelp` (lee el doc).

- GIVEN el cambio implementado
- WHEN se lee `docs/funky-forge/init.md`
- THEN lista `brief-funcional.md` como primer output (4 outputs)
- AND el diagrama nombra `runInit` y la copia del brief

## MODIFIED Requirements

### R1: Creación de los outputs base (antes: "Creación de los canvases")

El sistema DEBE generar `docs/funky-ai/canvas/brief-funcional.md` (primero), `docs/funky-ai/canvas/PROJECT-CANVAS.md` e `docs/funky-ai/canvas/INFRA-CANVAS.md` a partir de las plantillas de `src/templates/init/`. DEBE crear el directorio `docs/funky-ai/canvas/` si no existe.
(Previously: solo generaba los dos canvases; sin brief.)

- GIVEN el proyecto no tiene canvases previos
- WHEN `funky init` se ejecuta
- THEN se crea el directorio `docs/funky-ai/canvas/`
- AND se crean `brief-funcional.md`, `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con el contenido de las plantillas
- AND se imprime el mensaje de éxito

## Sin cambios

R2 (guide create-if-not-exists), R3 (guard, cubierto por R8), R4 (idempotencia/error handling), R5 (mensaje de éxito) permanecen intactos: "guard y mensajes sin cambios" según proposal.
