# Spec — Init Domain
> Domain: init | Status: Living | Source of Truth: `openspec/specs/init/spec.md`

Living spec canónico para el dominio `init`. Refleja el estado actual del comando `funky init` tras `brief-funcional-init`.

---

## Propósito

`funky init` genera los canvases iniciales del proyecto (PROJECT-CANVAS.md e INFRA-CANVAS.md) en el directorio canónico `docs/funky-ai/canvas/`, para iniciar la planificación del proyecto dentro del protocolo Funky AI. Es el punto de entrada del pipeline (`init → assess → estimate`). Es headless: no pregunta nada al usuario.

---

## Requirements

### R1: Creación de los outputs base

El sistema DEBE generar `docs/funky-ai/canvas/brief-funcional.md` (primero), `docs/funky-ai/canvas/PROJECT-CANVAS.md` e `docs/funky-ai/canvas/INFRA-CANVAS.md` a partir de las plantillas de `src/templates/init/`. DEBE crear el directorio `docs/funky-ai/canvas/` si no existe.

- GIVEN el proyecto no tiene canvases previos
- WHEN `funky init` se ejecuta
- THEN se crea el directorio `docs/funky-ai/canvas/`
- AND se crean `brief-funcional.md`, `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con el contenido de las plantillas
- AND se imprime el mensaje de éxito

### R2: Guide de planificación create-if-not-exists

El sistema DEBE crear `docs/funky-ai/canvas/canvas-planning-guide.md` a partir de la plantilla SOLO si no existe. Si ya existe, DEBE reutilizarlo sin sobrescribirlo.

- GIVEN `canvas-planning-guide.md` no existe
- WHEN `funky init` se ejecuta
- THEN se crea a partir de la plantilla `src/templates/init/canvas-planning-guide.md`

- GIVEN `canvas-planning-guide.md` ya existe
- WHEN `funky init` se ejecuta
- THEN el archivo NO se modifica
- AND la ejecución continúa sin error

### R3: Error cuando ya existen canvases

Si `PROJECT-CANVAS.md` o `INFRA-CANVAS.md` ya existen en `docs/funky-ai/canvas/`, el sistema DEBE imprimir un error y salir con exit(1). El comando NO debe sobrescribir canvases existentes (son la fuente de verdad del equipo).

- GIVEN `docs/funky-ai/canvas/PROJECT-CANVAS.md` o `INFRA-CANVAS.md` ya existe
- WHEN `funky init` se ejecuta
- THEN se imprime un error indicando que los canvases ya existen
- AND exit(1)
- AND no se modifica ningún canvas existente

### R4: Idempotencia y error handling

El comando DEBE ser seguro de re-ejecutar: la creación de directorios es idempotente y la guía se reutiliza si existe. Cualquier error de I/O (permisos, plantilla faltante) DEBE imprimir un mensaje de error y salir con exit(1).

- GIVEN `canvas-planning-guide.md` ya existe y los canvases no existen
- WHEN `funky init` se ejecuta
- THEN los canvases se crean normalmente
- AND `canvas-planning-guide.md` se saltea (ya existe)
- AND exit(0)

- GIVEN ocurre un error de I/O al ejecutar las intenciones (ej. sin permisos de escritura)
- WHEN `funky init` se ejecuta
- THEN se imprime un mensaje de error
- AND exit(1)

### R5: Mensaje de éxito

En caso de éxito, el sistema DEBE imprimir un resumen con el resultado y sugerir el siguiente paso (`funky scaffold`).

- GIVEN los canvases se crean exitosamente
- WHEN `funky init` termina
- THEN se imprime el mensaje de éxito
- AND se sugiere ejecutar `funky scaffold`

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

---

## Non-Functional Requirements

| Área | Especificación |
|------|---------------|
| Headless | NO DEBE usar prompts interactivos ni `@inquirer/prompts`. Todo headless, sin preguntas al usuario |
| Idioma | Mensajes del CLI en español neutro, con emojis (✅/❌) consistentes con los demás comandos |
| Ubicación canónica | Los canvases se escriben SIEMPRE en `docs/funky-ai/canvas/` |
| Exit codes | exit(0) en éxito; exit(1) si los canvases ya existen o hay error de I/O |
| Performance | Creación de los canvases DEBE completar en <500ms en inicio frío |
