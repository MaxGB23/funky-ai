# Proposal: 009 - Base Project Templates & Customization

## Solución Propuesta

### Fase 1: Aislamiento y Backup Legacy
Antes de purgar los templates públicos del CLI, clonaremos el contenido completo de `funky-cli/src/templates/` (incluyendo `sdd/`, `bootstrap/` y raíces) a un directorio interno `.agents/templates/`. Esta copia funcionará con doble propósito:
1. Actuar como el motor seguro y exclusivo de `funky-ai`, preservando sus reglas específicas.
2. Servir como un **backup inmutable** de los templates "legacy" para referencias futuras o comparativas (previniendo la pérdida de conocimiento operativo y estructural).
Se actualizará el `.agents/rules/sdd-orchestrator.md` local para que apunte a estas nuevas rutas protegidas.

### Fase 2: Creación de la Guía de Customización
Se redactará el artefacto `TEMPLATE_GUIDE.md` dentro de `funky-cli/src/templates/bootstrap/`. Esta guía dictará las reglas para que, post-inicialización, el equipo (o el Orquestador AI) mute los templates base (ej. `tasks.md`) según las respuestas del Project Canvas y Arch-Assessment.

### Fase 3: Agnostización de Templates del CLI
Se purgarán los templates distribuidos en `funky-cli/src/templates/` (especialmente `tasks.md` y `README.md`) eliminando cualquier referencia estricta a la lógica interna de `funky-cli` o reglas acopladas. Quedarán reducidos a esqueletos genéricos y limpios (invariantes como la FASE 0 y el Return Envelope).

### Fase 4: Refactor de `funky init`
El comando `init` se actualizará para asegurar la inyección de estos templates agnósticos junto con la `TEMPLATE_GUIDE.md`, aplicando el principio de *progressive disclosure* (es decir, sin inyectar flujos documentales pesados por defecto).

> *Nota: El scaffolding dinámico y la adaptación del comando `funky phase ff` han sido diferidos a una iteración futura (009.b) para mantener el scope actual enfocado exclusivamente en la inicialización.*
