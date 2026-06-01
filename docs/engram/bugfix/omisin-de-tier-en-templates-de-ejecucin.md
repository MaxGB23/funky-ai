### [bugfix][worker-tier-omission] Omisión de Tier en templates de ejecución
**What:** Se obvió la declaración explícita de Tier (ej. "Sos un Worker Tier 1") en el `worker-handoff.md`.
**Why:** Omitir el Tier elimina el pre-acondicionamiento psicológico del modelo. Sin Tier, el Worker puede sobre-arquitectar (actuar como Tier 3) en tareas simples.
**Where:** Generación de prompts de Worker Handoff.
**Learned:** Cada instrucción a un sub-agente DEBE declarar explícitamente su Tier.