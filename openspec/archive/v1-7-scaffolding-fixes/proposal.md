# Propuesta: Scaffolding Fixes v1.7.0

## Arquitectura de Solución

### 1. Script de Sincronización Automática
Crear un script en Node (`funky-cli/scripts/sync-templates.js`) que:
- Lea las reglas reales de `m:\funky-ai\.agents\rules\` y los archivos base canónicos de `m:\funky-ai\docs\`.
- Los copie sobre `funky-cli/src/templates/bootstrap/` aplanando los nombres (ej. `agents-rules-secops.md`).
- Agregaremos este script en el `package.json` bajo el comando `"sync"`, y lo ataremos al hook `"pretest"` para que los templates nunca se desfasen antes de una prueba o build.

### 2. Ampliación del Scaffolding (`init.js`)
Modificaremos la constante `filesToCopy` en `runInit` (`init.js`) para incluir la plantilla canónica:
- Origen: `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md` (previamente sincronizada con el script).
- Destino: `docs/funky-ai/workers/plantilla-worker-handoff.md` en el nuevo proyecto.
