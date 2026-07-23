---
trigger: model_decision
description: Leer obligatoriamente antes de CUALQUIER delegación a un subagente Tier 3 (nueva fase, reintento o feedback).
---

# Tier 3 Router — Deep

> 🔴 **[REGLA ESTRICTA DE DELEGACIÓN TIER 3]**
> Antes de delegar a un subagente Tier 3 debes leer este archivo. No construyas el prompt desde memoria ni inventes la estructura.  Nunca debes leer los prompts internos de los custom workflows. Se delega usando "self": /funky-{fase} Contrato

## 1. Routing de Fases
| Fase | Workflow |
|------|----------|
| 1. Explore | `/funky-explore` (incluye NFR si aplica) |
| 2. Propose | `/funky-propose` → `proposal.md` |
| 3. Spec | `/funky-spec` → requirements completos |
| 4. Design | `/funky-design` (**obligatorio, exclusivo T3**) → `design.md` |
| 5. Tasks | `/funky-tasks` |
| **Checkpoint** | **PRE-APPLY OBLIGATORIO:** Mostrar resumen + preguntar nativa (CLI) o Handoff (IDE). En caso de haber Risk, leer `.agents/rules/tier3-interactive/risk-decision.md`
| 6. Apply | `/funky-apply` secuencial por batch |
| 7. Verify | `/funky-verify` (build, tests, compliance, design, NFR) |
| 8. Archive | `/funky-archive` |

Post-archive: Llenar `release.md`, parar en git-ops, pedir aprobación. Llenar `docs.md` si existe.

## 2. Contratos de Presentación — Solo Interactivo
> ⚠️ **SOLO APLICA EN MODO INTERACTIVO.** En modo Auto, el orquestador no presenta resultados al humano — simplemente ejecuta la siguiente fase. En modo Handoff, prepara bloques copy-paste según su propio formato.
En modo Interactivo, después del Return Envelope, leer `.agents/rules/tier3-interactive/interactive-{fase}.md` y presentar al humano con ese formato.

## 3. Contrato de Inputs (E1)
| Input | Obligatorio |
|-------|-------------|
| `feature_name` | Sí |
| `tag` | No |

**Excepción Explore:** además de E1 recibe `Contexto a analizar` (RFC, descripción, etc.) y `Objetivo especial` (dirección táctica opcional).

## 4. Lifecycle del Subagente (Aislamiento por Fase)
> ⚠️ **NUEVA REGLA: UN SUBAGENTE POR FASE.**
> Jamás reutilices el subagente de una fase (ej. Explore) para ejecutar la siguiente (ej. Propose). Hacerlo mezcla contextos, arrastra ruido (anti-patrón) y rompe la separación de responsabilidades. Lanza un subagente NUEVO e independiente para cada workflow/fase.

> ⚠️ NO mates al subagente de la fase actual inmediatamente tras su primera respuesta.
**Interactivo:** Running → **Idle** (espera) → Feedback sobre esa misma fase → Kill (al aprobar la fase y pasar a la siguiente)  
**Auto:** Running → Kill inmediato al terminar su fase.
El estado "Idle" existe ÚNICAMENTE para iterar correcciones de la fase actual usando `send_message` sin perder sus tokens de contexto. Una vez aprobada la fase, se lanza un subagente nuevo para la siguiente.

## 5. Fallback — Workflow no disponible
Si el workflow (`/funky-*`) no es ejecutable: **NO lances subagentes.** Sugiere al humano cambiar a modo Handoff para ejecutar el prompt en su IDE.