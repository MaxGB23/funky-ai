Objetivo para la siguiente sesión: Refactorizar `jit-delegation-tier3.md` aplicando el patrón de "State Machine Context Injection" (archivos atómicos por fase de delegación) y un Router Condicional (`tier3-router.md`). 
**Contexto Arquitectónico:** El archivo principal `sdd-orchestrator.md` tiene UNA SOLA RESPONSABILIDAD (orquestar a alto nivel) y está estrictamente prohibido ensancharlo con mamadas operativas que no ocupa todo el tiempo. Para evitar el ruido de contexto y que el LLM alucine comandos CLI, toda instrucción específica de delegación DEBE extraerse y cargarse en tiempo real (JIT) únicamente en el milisegundo que se necesite.

[x] sdd-orchestrator -> Dividido en sdd-escalation-matrix y sdd-preflight
[ ] jit-interactive-handoff
[x] jit-delegation-tier2 -> Reemplazado por `tier2-router.md` y archivos atómicos en `tier2-delegation/`.
[ ] jit-delegation-tier3