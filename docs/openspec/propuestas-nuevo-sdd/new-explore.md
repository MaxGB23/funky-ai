Que el prompt refleje lo que ya hacés, en vez de tener features muertas:
## Lo que recibes
Del orquestador humano (formato estándar de copy-paste):
- `/funky-explore`
- **Feature:** {nombre del cambio}
- **Contexto a analizar:** {path a RFC, engram entry, o descripción directa}
- **Objetivo Especial (opcional):** {dirección táctica o puntos críticos}
- **Tags engram (opcional):** {tags para búsqueda dirigida}

## Prerequisitos
1. Leer el RFC o contexto que te pasó el orquestador (si existe)
2. view_file docs/openspec/changes/{feature-name}/explore.md (target)
3. **Opcional — si hay tags:** buscar en `docs/engram/` solo esos tags
4. Investigar el codebase
Le sacás ORCHESTRATOR-STATE.md, le sacás el grep genérico al index, le sacás [TAG] muerto, y todo lo que está alineado con lo que ya escribís cuando copypasteás.
Sobre si necesitás engram o no
Con el RFC y el objetivo especial que le pasás, el sub-agente ya tiene 80% de lo que necesita. El engram suma si hay decisiones arquitectónicas previas sobre el mismo dominio. Ejemplo:
**Feature:** `023-deprecate-worker-handoff`
**Contexto:** docs/openspec/rfcs/023-deprecate-worker-handoff.md
**Objetivo Especial:** mapear inyección del CLI
**Tags:** worker, cli, deprecation
Con worker, cli, deprecation el sub-agente busca engram y se encuentra con "ah, ya habíamos decidido X cosa sobre workers", "hubo un bug Y en el CLI el mes pasado". Eso sí suma. Sin tags, la búsqueda engram es ruleta.

# Resumen final del explore
El prompt está funcional. Los únicos cambios que haría:
1. Sacar ORCHESTRATOR-STATE.md del prerequisito (no lo necesitás)
2. Sacar el grep genérico al index.md (ruido)
3. Sacar el [TAG] muerto o reemplazarlo por un slot real
4. Agregar **Tags:** al formato de copy-paste del orquestador
El núcleo está bien: recibe RFC, investiga codebase, sintetiza, devuelve envelope. No hay nada roto.
Sobre los tags en la delegación
Tal cual, agregá una línea al formato de copy-paste:
/funky-explore
**Feature:** `023-deprecate-worker-handoff`
**Contexto:** docs/openspec/rfcs/023-deprecate-worker-handoff.md
**Objetivo Especial:** mapear inyección del CLI
**Tags:** worker, cli, deprecation
Y el sub-agente, en vez de grep_search docs/engram/index.md al pedo, hace grep_search "tag: worker\|tag: cli\|tag: deprecation" en docs/engram/. Búsqueda chica, precisa, sin ruido.