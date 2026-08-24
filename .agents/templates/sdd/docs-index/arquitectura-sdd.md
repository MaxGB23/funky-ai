# Índice de Secciones: `docs/funky-ai/conceptos/arquitectura-sdd.md`

- **¿Qué es Funky AI y el Framework SDD?:** Introducción al ecosistema agéntico y la metodología Spec Driven Development.
- **🏛️ Tiers de Orquestación:** Jerarquía regida por la Carga JIT de contexto.
  - **Tier 1 (Flash):** Cambios rápidos de 1-2 archivos con ejecución inline.
  - **Tier 2 (Standard - Subagentes Ligeros):** Features de 3-5 archivos con delegación estricta por fases.
  - **Tier 3 (Insano - Custom Workflows):** Cambios arquitectónicos mayores con subagentes nativos aislados.
- **🤖 Modos de Ejecución:** Modos Auto, Interactivo y Handoff (Legacy IDE) según el entorno y el nivel de confianza.
- **🏗️ Estructura Inyectada por `funky sdd install`:** Propósito de cada directorio materializado.
  - **1. `.agents/rules/`:** El "cerebro operativo" con 27 reglas de comportamiento (globales, metodologías/exploración, tier2-delegation con `t2-apply`, tier3-interactive).
  - **2. `.agents/templates/sdd/`:** Plantillas Markdown para las fases T2/T3 e índice dinámico.
  - **3. `docs/funky-ai/prompts/sdd/`:** Workflows T3 (custom workflows) que lee cada subagente nativo.
  - **4. `docs/engram/`:** Memoria persistente dividida en 7 shards.
  - **5. `openspec/rfcs/`:** Request For Comments del dominio del equipo de ingeniería.
  - **6. Archivos Raíz (`ORCHESTRATOR-STATE.md`):** Anclas del estado global del proyecto.
