---
trigger: model_decision
description: Leer obligatoriamente antes de CUALQUIER delegación a un subagente Tier 3 (nueva fase, reintento o feedback).
---

# Tier 3 Router — Deep

> 🔴 **[REGLA ESTRICTA DE DELEGACIÓN TIER 3]**
> Antes de delegar a un subagente Tier 3 debes leer este archivo. No construyas el prompt desde memoria ni inventes la estructura.

## 1. Routing de Fases
| Fase | Workflow |
|------|----------|
| 1. Explore | `/funky-explore` (incluye NFR si aplica) |
| 2. Propose | `/funky-propose` → `proposal.md` |
| 3. Spec | `/funky-spec` → requirements completos |
| 4. Design | `/funky-design` (**obligatorio, exclusivo T3**) → `design.md` |
| 5. Tasks | `/funky-tasks` |
| **Checkpoint** | **PRE-APPLY OBLIGATORIO:** Mostrar resumen + preguntar nativa (CLI) o Handoff (IDE) |
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

## 4. Lifecycle del Subagente
> ⚠️ NO mates al subagente al terminar. Esto es lo que diferencia T3 de tiers inferiores.
**Interactivo:** Running → **Idle** (espera) → Feedback → Kill (solo con aprobación humana)  
**Auto:** Running → Kill inmediato
Relanzar un subagente desde cero para una corrección es tirar miles de tokens a la basura. En modo interactivo, reactivarlo con `send_message` preserva todo su contexto.

## 5. Fallback — Workflow no disponible
Si el workflow (`/funky-*`) no es ejecutable: **NO lances subagentes.** Sugiere al humano cambiar a modo Handoff para ejecutar el prompt en su IDE.
