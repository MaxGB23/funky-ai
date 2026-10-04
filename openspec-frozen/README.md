# openspec-frozen — CONGELADO, NO ES SOURCE OF TRUTH

Las specs que viven aquí están **congeladas**. No son la fuente de verdad y no deben tratarse
como tal. Este directorio es un registro histórico, no un sistema activo.

## Reglas

1. **No crees specs nuevas aquí.** Ni una, ni por idea propia, ni "porque el flujo lo pedía".
2. **No actualices las existentes.** No hay revisión, no hay mantenimiento, no hay archive step.
   Un cambio aquí es ruido, no mantenimiento.
3. **No las leas para decidir cómo se implementa algo.** Si necesitas el contrato de una
   capacidad, la fuente activa es el código y sus tests.
4. **No las borres** sin una decisión explícita del usuario.

## Por qué existe

`openspec/specs/` fue el sistema de living specs de SDD (openspec). SDD está retirado en este
repo. Las specs se movieron aquí con `git mv` para que un agente que las encuentre por grep o
por exploración de directorios lea "frozen" en el path y no las tome por fuente de verdad.

`config.yaml` se movió con ellas. Antes lo consumía la regla "Strict TDD (resolución canónica)"
de `AGENTS.md`; esa regla ya no existe y strict TDD se aplica siempre, sin flag. El archivo se
conserva como registro de la configuración histórica de testing (`strict_tdd`, `pnpm test`,
`vitest`), no como configuración vigente.

## Qué usar en su lugar

| Necesitas | Ve a |
|---|---|
| Contexto de una feature en curso | `odd/tasks/<feature>.md` |
| El contrato real de una capacidad | El código y sus tests |
| Templates del workspace | `.agents/templates/` |
| Lo que se distribuye con el CLI | `funky-cli/src/` |

`openspec/` sigue existiendo con `rfcs/`, `changes/` y `archive/`, que **sí están en uso**.
Lo congelado es solo lo que está en este directorio.
