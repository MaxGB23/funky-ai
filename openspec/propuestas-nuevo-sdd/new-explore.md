Que el prompt refleje lo que ya hacés, en vez de tener features muertas:
## Lo que recibes
- `/funky-explore`
- **Feature:** {nombre del cambio}
- **Contexto a analizar:** {path a RFC, engram entry, o descripción directa}
- **Objetivo Especial (opcional):** {dirección táctica o puntos críticos}
- **Tags engram (opcional):** {tags para búsqueda dirigida}

El núcleo está bien: recibe RFC, investiga codebase, sintetiza, devuelve envelope. No hay nada roto.

Ej:
/funky-explore
**Feature:** `023-deprecate-worker-handoff`
**Contexto:** docs/openspec/rfcs/023-deprecate-worker-handoff.md
**Objetivo Especial:** mapear inyección del CLI
**Tags:** worker, cli, deprecation

Justificación del tag: el sub-agente custom workflow, en vez de grep_search docs/engram/index.md al pedo, hace grep_search "tag: worker\|tag: cli\|tag: deprecation" en docs/engram/. Búsqueda chica, precisa, sin ruido. El orquestador es el que sabe del proyecto y delega tags relevantes a cada fase sdd.