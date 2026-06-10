# Explore: 025-engram-index-free-navigation

> **GUARDRAILS (Context Economy):**
> - **Budget**: Keep analysis CONCISE - the orchestrator needs a summary, not a novel.
> - ALWAYS read real code, never guess about the codebase.
> - If you can't find enough information, say so clearly.
> - The ONLY file you MAY create/edit is this exploration document. DO NOT modify any existing code or files.

> **INVESTIGATE GUIDELINES:**
> - Read entry points and key files
> - Search for related functionality
> - Check existing tests (if any)
> - Look for patterns already in use
> - Identify dependencies and coupling

## 1. Contexto del Problema
Actualmente, el Stage 1 del Memory Polling obliga a los agentes a ejecutar un `view_file docs/engram/index.md`. Dado que el archivo crece continuamente al añadir nuevos engramas, esto genera un alto gasto de tokens por sesión para obtener apenas unos tags relevantes. La propuesta es reemplazar este `view_file` con un `list_dir docs/engram/`, para lograr el "discovery" de tags (basado en nombres de archivos/directorios) de manera ultra-ligera y con costo O(1) en tokens.

## 2. Estado Actual del Codebase
Al investigar las reglas de agentes y plantillas del CLI en búsqueda de los requerimientos para el "Stage 1" del Memory Polling, se encontraron los siguientes archivos afectados que tienen hardcodeado `view_file docs/engram/index.md`:

**Reglas de Agentes (`.agents/rules/`)**:
1. `.agents/rules/sdd-orchestrator.md` (líneas 26 y 33)
2. `.agents/rules/engram-protocol.md` (línea 10)

**Plantillas del CLI (`funky-cli/src/templates/`)**:
3. `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md` (líneas 26 y 33)
4. `funky-cli/src/templates/bootstrap/agents-rules-engram-protocol.md` (línea 10)

*(Nota: `.agents/templates/` fue analizado pero no contiene referencias al index.md relacionadas al polling).*

## 3. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **Opción A: list_dir y mantener index.md** | Reemplazar `view_file` por `list_dir` en los 4 archivos detectados. El archivo `index.md` se deja en el proyecto para lectura exclusiva de humanos. | - Reduce drásticamente el gasto de tokens por sesión. <br> - Resuelve el token waste sin romper el discovery humano de documentación. | - Aún mantendremos un index.md propenso a desincronizarse manualmente (`doc-update-index-manual-drift`). |
| **Opción B: list_dir y deprecar index.md** | Implementar `list_dir` y eliminar `index.md` del workspace y de las convenciones. | - Reduce tokens. <br> - Elimina un origen crónico de drift documental. | - Fuerza a los desarrolladores humanos a acostumbrarse a navegar el directorio en lugar de un índice estructurado. |

## 4. Recomendación + Riesgos
**Opción recomendada:** Opción A

**Justificación:**
Como se sugiere en el RFC, la Opción A es el camino a corto plazo más sensato. Nos permite probar si el `list_dir` proporciona información suficiente al agente sin eliminar de golpe un artefacto de navegación usado por los humanos. Si en la práctica el agente navega exitosamente con `list_dir`, se puede deprecar el index en un futuro RFC.

**Riesgos mitigables:**
- **Nombres de archivo poco descriptivos:** Si los nombres en `docs/engram/` no proveen suficiente contexto semántico, el agente no sabrá qué tag usar en el Stage 2. *Mitigación:* Se podría adoptar una convención de prefijos semánticos (ej: `[arquitectura]-...md`) en el futuro.
- **Bootstrap inconsistente:** Fallar al aplicar los cambios en las plantillas del CLI (`funky-cli/src/templates/`) causaría que nuevos proyectos nazcan con la convención antigua. *Mitigación:* Localizamos exactamente qué templates actualizar para evitar el drift.

> **[SISTEMA - PARA EL ORQUESTADOR]** Una vez finalizada la exploración, espera aprobación del humano, y luego utilizá este documento como base para generar el `proposal.md`
