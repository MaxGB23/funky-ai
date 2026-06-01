# Explore: Engram Sharding y Comando Add (RFCs 016 & 017)
**TIER DE ORQUESTACIÓN ELEGIDO: "2"**

## 1. Contexto del Problema
Los archivos del engrama (`discoveries.md` y `bugfixes.md`) crecen sin límite, lo que genera alto consumo de tokens y problemas de retención ("Lost in the Middle") cuando los agentes leen el historial. Además, la carga cognitiva de agregar y buscar en un archivo monolítico provoca drift (índice desincronizado) y problemas de encoding. Se necesita una solución híbrida: particionar el almacenamiento (sharding) e implementar un comando `funky engram add` para inyectar nuevo conocimiento atómicamente.

## 2. Estado Actual del Codebase
- **Almacenamiento:** Tres archivos principales en `docs/engram/`: `index.md`, `discoveries.md` (241 líneas) y `bugfixes.md` (57 líneas).
- **CLI:** No existe actualmente el comando `funky engram add` en `funky-cli/src/commands/`.
- **Scaffolding:** `init.js` copia los templates iniciales estáticos de los archivos monolíticos.
- **Acoplamiento:** Templates (ej. `plantilla-worker-handoff.md`) y reglas `.agents/rules/` asumen la existencia de `discoveries.md` y usan `grep_search` directamente contra él.

## 3. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **Opción A: Monolítico + CLI** | Mantener `discoveries.md` e implementar `funky engram add` para apends. | - Cero migración.<br>- Estructura actual intacta. | - No resuelve el costo O(N) al leer.<br>- Persisten problemas de context overflow. |
| **Opción B: Sharding por Tipo (Recomendada)** | Migrar a `docs/engram/<tipo>/<tag>.md` (architecture, pattern, discovery, decision, bugfix). | - Lecturas O(1).<br>- Git diffs limpios.<br>- Alineado con schema del MCP oficial. | - Requiere script de migración.<br>- Hay que actualizar reglas y templates que asumen un solo archivo. |
| **Opción C: Sharding + Index JSON** | Igual a B, pero usando `index.json` en vez de `index.md` para metadatos. | - 100% programático y determinista. | - Introduce complejidad extra e inconsistencia con el paradigma Markdown. |

## 4. Recomendación + Riesgos
**Opción recomendada:** Opción B.

**Justificación:**
Es la única solución que ataca de raíz el consumo de tokens y el Agentic Drift durante las lecturas. Dividir en pequeños archivos por categoría facilita el escalado a cientos de entradas y emula el comportamiento del MCP original (actualmente inactivo). Se acompaña de `funky engram add` (RFC 016) para escribir atómicamente a estos fragmentos.

**Riesgos mitigables:**
- **Rotura de prompts y reglas:** Las instrucciones actuales apuntan a `discoveries.md`. *Mitigación:* Refactorizar en la misma feature todas las referencias (`grep_search`) en `.agents/rules/` y `.agents/templates/` para que apunten a los nuevos directorios de forma recursiva (`grep -ril`).
- **Complejidad de Migración:** Clasificar entradas existentes a sus subcategorías. *Mitigación:* Incluir un script de migración con heurísticas o categorización manual inicial.
