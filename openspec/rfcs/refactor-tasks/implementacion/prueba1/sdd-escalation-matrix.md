# Escalation Matrix — Tier Decision Table

**Trigger:** Este archivo se lee ÚNICAMENTE durante el Paso 0 (Pre-Vuelo) para determinar el Tier de la tarea. Una vez que el Tier está cacheado en sesión, este archivo NO debe volver a cargarse.

## Matriz de Decisión
| Tier | Criterio | Acción de Flujo |
|------|----------|-----------------|
| **T0 (Conversación)** | Conversación libre, ideación, RFCs, brainstorming — sin entrar al flujo SDD | Sin branch, sin templates, sin workers. Si surgen features concretas, el humano crea un RFC. Para ejecutarla con SDD, se recomienda un orquestador nuevo y fresco. |
| **T1 (Flash)** | 1-2 archivos, fix acotado, sin impacto arquitectónico | Sin propose/spec. Tasks redactado inline por el Orquestador. Worker regular ejecuta. |
| **T2 (Standard)** | Feature normal, 3-5 archivos, sin cambios de core | Route B (Sabueso de Lava) → Propose/Spec ligeros → tasks.md adaptativo → Worker ejecuta → Verify ligero obligatorio. |
| **T3 (Deep)** | Cambios complejos, NFRs pesados, refactors de core | Fases aisladas con custom workflows por fase. Apply secuencial. Verify completo. |

## Routing de Fases por Tier
| Fase SDD | Tier 1 (Flash) | Tier 2 (Standard) | Tier 3 (Deep) |
|---|---|---|---|
| **1. Explore** | Route A — Sabueso desechable (inline) | Route B — Sabueso de Lava (`define_subagent`, Prompt A en `jit-delegation-tier2.md`) | Workflow `/funky-explore` (NFRs opcionales) |
| **2. Propose** | 🚫 Skip | Chalán Crikoso — Propose Ligero (`define_subagent`, Prompt B en `jit-delegation-tier2.md`) | Workflow `/funky-propose` |
| **3. Spec** | 🚫 Skip | Chalán Crikoso — Spec Ligero (`define_subagent`, Prompt C en `jit-delegation-tier2.md`) | Workflow `/funky-spec` |
| **4. Design** | 🚫 Skip | 🚫 Skip | Workflow `/funky-design` |
| **5. Tasks** | Orquestador redacta `tasks.md` inline | Workflow `/funky-tasks` (adaptativo) | Workflow `/funky-tasks` (adaptativo) |
| **6. Apply** | Worker básico | Worker básico | Workflow `/funky-apply` (secuencial por batch) |
| **7. Verify** | 🚫 Skip (solo bump SemVer si aplica) | Chalán Crikoso — Verify Ligero (`define_subagent`, Prompt D en `jit-delegation-tier2.md`) | Workflow `/funky-verify` (exhaustivo: build, tests, spec compliance, NFRs) |
| **8. Archive** | 🚫 Skip | Workflow `/funky-archive` | Workflow `/funky-archive` |

