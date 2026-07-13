# Proposal: Engram Sharding y Comando Add

## Intent
Resolver la saturación de contexto (Lost in the Middle) y los problemas de encoding al leer los archivos monolíticos del Engram (`discoveries.md` y `bugfixes.md`). Dividir el historial en archivos atómicos (sharding por tipo) e implementar un comando nativo en el CLI (`funky engram add`) para escritura directa, reduciendo los costos de tokens (lectura en O(1)) y previniendo el Agentic Drift.

## Scope
### In Scope
- Script de migración masiva para fragmentar los archivos actuales.
- Creación de los directorios de sharding (`architecture/`, `pattern/`, `discovery/`, `decision/`, `bugfix/`).
- Desarrollo del comando `funky engram add` (flags e interactivo).
- Refactorización de directivas `grep_search` en `.agents/rules/` y templates.
- Actualización de `funky init` para generar el nuevo scaffolding.

### Out of Scope
- Integración con el MCP oficial de Gentle AI.
- Visualizador de engramas por consola (lectura vía IDE y `grep`).
- Alteración de la estructura interna del bloque de engrama (`**What:**`, `**Why:**`, etc.).

## Capabilities
### New Capabilities
- `engram-sharding`: Almacenamiento fragmentado donde cada engrama es un archivo individual en su categoría correspondiente.
- `engram-add-command`: Comando CLI (`funky engram add`) para la inyección atómica de conocimiento al sistema de archivos, con validación de tags duplicados.

### Modified Capabilities
- `agent-engram-read`: Los agentes de IA ahora deben buscar conocimiento usando `grep -ril` sobre los múltiples directorios en lugar de buscar en un solo archivo plano.
- `cli-scaffolding`: `funky init` creará los subdirectorios del Engram en lugar de archivos monolíticos vacíos.

## Approach
1. **Migración:** Crear un script que extraiga cada `### [tag]` de `discoveries.md` y `bugfixes.md`, categorizándolo por heurística en su directorio correspondiente y generando un archivo `<tag>.md`.
2. **CLI Add:** Implementar `src/commands/engram.js` usando `commander` para flags y `@inquirer/prompts` para el asistente interactivo. El comando escribirá atómicamente el archivo nuevo en la carpeta del tipo especificado y actualizará `index.md`.
3. **Refactorización:** Ejecutar un barrido (`grep_search`) en `.agents/` y templates para actualizar las rutas hardcodeadas de `discoveries.md`.
4. **CLI Init:** Modificar `init.js` para que el scaffolding inicial refleje la nueva estructura.

## Affected Areas
| Área | Impacto | Descripción |
|------|---------|-------------|
| CLI (`funky-cli/src/`) | Alto | Nuevo comando `engram.js`, modificación de `init.js` y `package.json` (bin). |
| Templates / Reglas | Alto | Cambian los prompts de búsqueda (ej. en `worker-handoff.md` y `sdd-orchestrator.md`). |
| Storage (`docs/engram/`) | Alto | Reestructuración total de datos e historia. |

## Risks
| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Prompt Breakage | Alta | Reemplazo exhaustivo de `discoveries.md` en todo el `.agents/` y templates antes del release. |
| Clasificación Errónea | Media | Clasificación por heurística de tags, permitiendo ajustes manuales post-migración. |

## Rollback Plan
1. Revertir el commit completo vía `git revert` para restaurar los archivos monolíticos viejos.
2. Hacer rollback de la versión del CLI reinstalando la versión anterior.

## Dependencies
- `@inquirer/prompts` (Ya presente en `funky-cli`).
- `commander`.

## Success Criteria
- [ ] Directorios `architecture/`, `pattern/`, etc. creados y poblados en `docs/engram/`.
- [ ] Los archivos originales (`discoveries.md`, `bugfixes.md`) son eliminados sin pérdida de información.
- [ ] Ejecutar `funky engram add --tag "[test]"` crea el archivo exitosamente.
- [ ] El menú interactivo de `funky engram add` solicita correctamente los campos y genera el archivo.
- [ ] Prompts y templates de IA referencian la nueva estructura con `grep -ril`.
