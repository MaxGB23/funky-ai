### [BUG][stale-post-mortem-ref] sdd-orchestrator.md apuntaba a archivo DEPRECATED en Memory Polling
**What:** `.agents/rules/sdd-orchestrator.md` referenciaba `docs/post-mortem.md` como destino del Memory Polling y la consolidación de Engram. Este archivo está marcado como `DEPRECATED` en `ORCHESTRATOR-STATE.md` desde v1.2.
**Why:** La regla global nunca fue actualizada cuando se migró al sharded engram (`discoveries.md` + `bugfixes.md`) en v1.2.
**Where:** `.agents/rules/sdd-orchestrator.md` — sección de Memory Polling y Session Close.
**Learned:** Cada vez que un archivo de infraestructura se depreca, hacer `grep_search` sobre `.agents/rules/` para detectar referencias stale. El riesgo real: el agente busca en el lugar equivocado y silencia memoria acumulada sin ningún error visible.