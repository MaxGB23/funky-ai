---
trigger: model_decision
description: Leer obligatoriamente antes de CUALQUIER delegación a un subagente Tier 2 (nueva fase, reintento o feedback).
---

# Tier 2 Delegation Router

> 🔴 **[REGLA ESTRICTA DE DELEGACIÓN TIER 2]**
> Te estás preparando para delegar una fase del SDD a un subagente en Tier 2. 
> **TIENES PROHIBIDO** usar tu memoria para redactar el prompt o inventarte la estructura. 

> Según la fase que vayas a delegar, tu **PRIMERA ACCIÓN Y OBLIGATORIA** antes de invocar al subagente es ejecutar el comando `view_file` sobre el contrato correspondiente, copiar el formato estricto que dice "Prompt estricto a inyectar al subagente", y enviárselo tal cual:

> ### Routing de Fases
> | Fase | Workflow / Acción |
> |------|-------------------|
> | **1. Explore** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-explore.md` |
> | **2. Propose** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-propose.md` |
> | **3. Spec** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-spec.md` |
> | **4. Tasks** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-tasks.md` |
> | **Checkpoint** | **PRE-APPLY OBLIGATORIO:** Mostrar resumen del plan. Preguntar al humano: ¿Nativa (CLI con subagentes) o Handoff (IDE)? Aunque el 90% es un solo batch, si `tasks.md` devuelve subdivisión requerida, prepárate para delegar en batches. |
> | **5. Worker (Apply)**| Si Nativa: Lanza subagente(s) `/funky-worker` referenciando el batch o `tasks.md`. Si hay múltiples batches, ejecútalos **secuencialmente** (uno por uno). **CRÍTICO:** Cada worker genera un `report.md` en disco al terminar; debes esperarlo/leerlo antes de continuar. Si Handoff: pasale el bloque copy-paste. |
> | **6. Verify** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-verify.md` |
> | **7. Archive** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-archive.md` |
> | **8. Release** | Leer `release-checklist.md` y `docs.md` (si existe). Completar checklist y PARAR en git ops, pedir aprobación humana. |

**Si no lees el archivo de la fase antes de delegar, estarás rompiendo una regla absoluta de orquestación.**

## 🔴 PROHIBIDO: Delegar Tier 2 usando `self`
**Regla:** En fases **Tier 2** (`Explore`, `Propose`, `Spec`, `Verify`) **no** se debe usar `invoke_subagent` con `self` como destino. Utiliza **siempre** `define_subagent` con un prompt acotado. **Única excepción:** La fase `Tasks`.

## 🔴 MANDATORY INTERACTIVE GATE
Si la sesión está en modo **Interactivo**, esta regla es obligatoria:
1. Después de cada fase delegada, presentar un resumen del resultado.
2. Esperar confirmación explícita del usuario antes de iniciar la siguiente fase.
**Incumplimiento:** Continuar sin confirmación viola el contrato del orquestador, ya que equivale a ejecutar el flujo en modo automático.
**Excepción:** Si una fase finaliza con `blocked` o `FAIL`, informar el resultado inmediatamente.

## Fallback — Subagente no disponible
**REGLA: NO investigues ni escribas el artefacto directamente.**
- Si `define_subagent` no está disponible → frena, explica al humano que no puedes delegar sin la herramienta
- Última opción → sugiere Handoff (copiar prompt al IDE)