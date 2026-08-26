---
trigger: manual
---

# Tier 3 Router — Deep

> 🔴 **[REGLA ESTRICTA DE DELEGACIÓN TIER 3]**
> 🚫 **PROHIBIDO:** usar `self` (arrastra ruido).
> 🚫 **PROHIBIDO:** leer los `.md` de workflows tú mismo (100+ líneas que ensucian tu contexto) — solo pasas el **path** al subagente.
> ✅ **DELEGAR:** Invoca un subagente en blanco `define_subagent`. En su prompt, indícale leer el path de su workflow (`docs/funky-ai/prompts/sdd/funky-{fase}.md`) para adoptar el rol, pasándole los inputs E1.
> ⚠️ **METODOLOGÍAS:** incluye las metodologías cacheadas como bloque `Contexto Previo` en TODO prompt de delegación.
> ⚠️ **PERSISTENCIA:** Exige en el prompt que guarde entregables con `write_to_file` en el workspace (`openspec/changes/{feature_name}...`), NUNCA en su directorio brain local. Tu archivo de workflow te dirá la estructura exacta de carpetas, respétala.

## Routing de Fases
| Fase | Workflow |
|------|----------|
| 1. Explore | `docs/funky-ai/prompts/sdd/funky-explore.md` (incluye NFR si aplica) |
| 2. Propose | `docs/funky-ai/prompts/sdd/funky-propose.md` → `proposal.md` |
| 3. Spec | `docs/funky-ai/prompts/sdd/funky-spec.md` → requirements completos |
| 4. Design | `docs/funky-ai/prompts/sdd/funky-design.md` (**obligatorio, exclusivo T3**) → `design.md` |
| 5. Tasks | `docs/funky-ai/prompts/sdd/funky-tasks.md` |
| **Checkpoint** | **PRE-APPLY obligatorio:** Mostrar resumen y confirmar **Nativo (CLI)** o **Handoff (IDE)**. Si existe **Risk**, consultar `.agents/rules/tier3-interactive/risk-decision.md`. El cambio a **Handoff** sólo aplica para `Apply`; las fases siguientes permanecen en modo interactivo. |
| 6. Apply | `docs/funky-ai/prompts/sdd/funky-apply.md` secuencial por batch, no confundir con Worker (tier 2) |
| 7. Verify | `docs/funky-ai/prompts/sdd/funky-verify.md` (build, tests, compliance, design, NFR) |
| 8. Archive | `docs/funky-ai/prompts/sdd/funky-archive.md` |
| **Checkpoint** | **PRE-RELEASE OBLIGATORIO:** Antes de release, parar y pedir confirmación para continuar, tanto en modo Auto como Interactivo.
| 9. Release | 1. Leer `docs.md` (si existe) y completarlo. 2. Leer `release-checklist.md` completar checklist y PARAR en git ops, pedir aprobación humana. |

## Contratos de Presentación — Solo Interactivo
> ⚠️ **SOLO APLICA EN MODO INTERACTIVO.** En Auto no presentas resultados — ejecutas la siguiente fase directamente.

- **Interactivo:** tras el Return Envelope, lee `.agents/rules/tier3-interactive/interactive-{fase}.md` y presenta al humano con ese formato.
- **Handoff (IDE):** el bloque copy-paste es `/funky-{fase}` + inputs E1 — nada más (Ley de Invarianza). El IDE ya trae los workflows cargados como slash commands; el prompt de "leer path y tomar rol" es mecánica EXCLUSIVA del CLI para `define_subagent`.

## Contrato de Inputs (E1)
| Input | Obligatorio |
|-------|-------------|
| `feature_name` | Sí |
| `Contexto Previo` | No — bloque redactado por TI: digest del funkygram según el tag de sesión + metodologías cacheadas que apliquen a la fase ([siempre] y las que coincidan). NUNCA pases el tag crudo ni pidas al subagente buscar en `docs/engram/`. |

**Excepción Explore:** además de E1 recibe `Contexto a analizar` (RFC, descripción, etc.) y `Objetivo especial` (dirección táctica opcional).

## 🔴 MANDATORY INTERACTIVE GATE
En modo **Interactivo**:
1. Tras cada fase delegada, presenta al humano un resumen del Return Envelope del subagente (status, entregables, riesgos). Nunca leas artefactos completos: hazlo solo si el resumen no basta para decidir o el humano lo pide.
2. Esperar confirmación del usuario antes de continuar.
**Excepción:** Si una fase termina en `blocked` o `FAIL`, informar el resultado inmediatamente.

## Ciclo de Vida del Subagente
> ⚠️ **UN SUBAGENTE POR FASE.** Jamás reutilices el subagente de una fase anterior. Lanza siempre uno NUEVO e independiente, instruido exclusivamente para leer su archivo de workflow e instanciarse en ese rol.

> ⚠️ NO mates al subagente de la fase actual inmediatamente tras su primera respuesta.
**Interactivo:** Running → **Idle** (espera) → Feedback sobre esa misma fase → Kill (al aprobar la fase y pasar a la siguiente)  
**Auto:** Running → Kill inmediato al terminar su fase.
El estado "Idle" existe ÚNICAMENTE para iterar correcciones de la fase actual usando `send_message` sin perder sus tokens de contexto. Una vez aprobada la fase, se lanza un subagente nuevo para la siguiente.

## Fallback — Subagente no disponible
**REGLA: NO investigues ni escribas el artefacto directamente.**
- Si `define_subagent` no está disponible → frena, explica al humano que no puedes delegar.
- Cuota agotada (lo más común en free tier) → sugiere al humano reintentar con otro `Model`.
- Si el workflow (`docs/funky-ai/prompts/sdd/funky-*.md`) no es ejecutable → NO lances subagentes; sugiere cambiar a modo Handoff para ejecutar el prompt en el IDE.
- Última opción → sugiere Handoff (copiar prompt al IDE)