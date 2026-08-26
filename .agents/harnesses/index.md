# Harnesses — Índice

> Documentación de conducta real de la plataforma Antigravity (CLI e IDE): qué inyecta el sistema al arrancar, cómo inyecta las reglas condicionales, y hallazgos experimentales sobre custom agents.
> Cada documento nace de introspección o experimentos verificados contra la plataforma, no de supuestos.

---

## Documentos

| Archivo | Descripción |
|---------|-------------|
| [`antigravity-cli.md`](./antigravity-cli.md) | Inventario de directivas, frameworks y restricciones que el sistema inyecta en Antigravity CLI al arrancar. |
| [`antigravity-ide.md`](./antigravity-ide.md) | Ídem para Antigravity IDE: incluye directivas de comportamiento fuerte y modos bloqueantes que el CLI no tiene. |
| [`comparativa-ide-vs-cli.md`](./comparativa-ide-vs-cli.md) | Análisis side-by-side IDE vs CLI: harnesses, costo en tokens y autonomía arquitectónica de cada entorno. |
| [`context_rules_injection.md`](./context_rules_injection.md) | Arquitectura de inyección de reglas condicionales: evaluación de triggers y manejo de contexto (tokens) entre IDE y CLI. |
| [`custom-agents-and-model-tiers.md`](./custom-agents-and-model-tiers.md) | Aliases de modelo disponibles en `invoke_subagent` (`flash_lite`, `flash`, `pro`, `inherit`) y herencia de prompts en custom agents. |
| [`custom-agents-inheritance.md`](./custom-agents-inheritance.md) | Hallazgo: los custom agents NO heredan prompts globales — su `agent.md` reemplaza el system prompt completo (~25k → ~10k tokens). |
| [`modelo-por-fase.md`](./modelo-por-fase.md) | **[DRAFT]** Optimización de costo asignando un modelo distinto por fase SDD. Experimental; requiere autorización humana explícita. |
| [`rule-discovery-subdirs.md`](./rule-discovery-subdirs.md) | Experimento: las conditional rules en subdirectorios de `.agents/rules/` **no** son detectadas como tales — solo cuentan las del raíz. |

---

## Relacionado

- Consumo y costos medidos: [`comparativas-tokens/`](../../comparativas-tokens/index.md) en root.
