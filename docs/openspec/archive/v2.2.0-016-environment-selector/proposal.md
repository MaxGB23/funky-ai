# Proposal: 016 Environment Selector

## Propuesta Técnica

1. **Modificación Estructural en Templates:**
   - Crear las carpetas `ide/` y `cli/` dentro de `funky-cli/src/templates/bootstrap/`.
   - Mantener reglas globales como `agents-rules-secops.md` en el root de `bootstrap/`.
   - Copiar el `agents-rules-sdd-orchestrator.md` y `agents-rules-engram-protocol.md` actual en `ide/`.
   - Crear la versión mutada de ambos para `cli/` incluyendo soporte asíncrono y warm-up directo.

2. **Refactorización del Motor de Inicialización (`runInit`):**
   - Ampliar la firma de la función pura `runInit` en `init.js` para aceptar un nuevo parámetro: `environment` (con default a `'ide'`).
   - Modificar la constante `filesToCopy` para que la ruta de origen de las reglas condicionales de agente incluya dinámicamente el `environment`.

3. **Inyección Interactiva (`initCommand`):**
   - En el bloque interactivo principal (antes de los frameworks), añadir un prompt de `p.select` que consulte al usuario: "Selecciona el entorno operativo para Funky AI: (IDE / CLI)".
   - Pasar esta variable al contexto final de `runInit`.

## Trade-offs
- **Pros:** Aislamiento perfecto entre arquitecturas de agentes, retrocompatibilidad del 100% en modo Headless, y código robusto.
- **Contras:** Duplicación leve de dos archivos base de Markdown, pero el costo de mantenimiento es menor que el de manejar condicionales caóticos (if/else) dentro de un único archivo Markdown leíble por IA.
