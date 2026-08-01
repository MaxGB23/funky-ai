---
trigger: manual
---

# Escalation Matrix — Tier Decision Table

**Trigger:** Este archivo se lee ÚNICAMENTE durante el Paso 0 (Pre-Vuelo) para determinar el Tier de la tarea. Una vez que el Tier está cacheado en sesión, este archivo NO debe volver a cargarse.

## Matriz de Decisión
| Tier | Criterio | Acción de Flujo |
|------|----------|-----------------|
| **T0 (Conversación)** | Conversación libre, ideación, brainstorming — sin entrar al flujo SDD | Sin branch, sin templates, sin workers. Si surgen ideas de features concretas, se debe crear un RFC. Para ejecutarlo con SDD, se recomienda un orquestador nuevo y fresco. |
| **T1 (Flash)** | 1-2 archivos, fix acotado, sin impacto arquitectónico | Sin propose/spec. Tasks redactado inline por el Orquestador. Worker regular ejecuta. |
| **T2 (Standard)** | Feature normal, 3-5 archivos, sin cambios de core | Route B (Sabueso de Lava) → Propose/Spec ligeros → funky-tasks adaptativo → Worker ejecuta → Verify ligero obligatorio → funky-archive |
| **T3 (Insano 👻)** | Cambios complejos, NFRs pesados, refactors de core | Fases aisladas con custom workflows por fase. Apply secuencial. Verify completo. |