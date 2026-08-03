# Spec — Init Domain
> Domain: init | Status: Living | Source of Truth: `openspec/specs/init/spec.md`

Living spec canónico para el dominio `init`. Refleja el estado actual del comando `funky init`.

---

## Propósito

`funky init` genera los canvases iniciales del proyecto (PROJECT-CANVAS.md e INFRA-CANVAS.md) en el directorio canónico `docs/funky-ai/canvas/`, para iniciar la planificación del proyecto dentro del protocolo Funky AI. Es el punto de entrada del pipeline (`init → assess → estimate`). Es headless: no pregunta nada al usuario.

---

## Requirements

### R1: Creación de los canvases

El sistema DEBE generar `docs/funky-ai/canvas/PROJECT-CANVAS.md` e `docs/funky-ai/canvas/INFRA-CANVAS.md` a partir de las plantillas de `src/templates/init/`. DEBE crear el directorio `docs/funky-ai/canvas/` si no existe.

- GIVEN el proyecto no tiene canvases previos
- WHEN `funky init` se ejecuta
- THEN se crea el directorio `docs/funky-ai/canvas/`
- AND se crean `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con el contenido de las plantillas
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

---

## Non-Functional Requirements

| Área | Especificación |
|------|---------------|
| Headless | NO DEBE usar prompts interactivos ni `@inquirer/prompts`. Todo headless, sin preguntas al usuario |
| Idioma | Mensajes del CLI en español neutro, con emojis (✅/❌) consistentes con los demás comandos |
| Ubicación canónica | Los canvases se escriben SIEMPRE en `docs/funky-ai/canvas/` |
| Exit codes | exit(0) en éxito; exit(1) si los canvases ya existen o hay error de I/O |
| Performance | Creación de los canvases DEBE completar en <500ms en inicio frío |
