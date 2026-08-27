---
trigger: manual
---

# Tier 2 Delegation Router

> 🔴 **[REGLA ESTRICTA DE DELEGACIÓN TIER 2]**
> Te estás preparando para delegar una fase del SDD a un subagente en Tier 2.
> 🚫 **PROHIBIDO:** usar tu memoria para redactar el prompt o inventarte la estructura · `invoke_subagent` con `self` como destino (arrastra ruido del contexto).
> ⚠️ **METODOLOGÍAS:** incluye las metodologías cacheadas como bloque `Contexto Previo` en TODO prompt de delegación.

> Según la fase que vayas a delegar, tu **PRIMERA ACCIÓN Y OBLIGATORIA** antes de invocar al subagente es ejecutar el comando `view_file` sobre el contrato correspondiente, copiar el formato estricto que dice "Prompt estricto a inyectar al subagente", y enviárselo tal cual:

### Routing de Fases
| Fase | Workflow / Acción |
|------|-------------------|
| **1. Explore** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-explore.md` |
| **2. Propose** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-propose.md` |
| **3. Spec** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-spec.md` |
| **4. Tasks** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-tasks.md` |
| **Checkpoint** | **PRE-APPLY OBLIGATORIO:** Mostrar resumen del plan. Preguntar al humano: ¿Nativa (CLI con subagentes) o Handoff (IDE)? Aunque el 90% es un solo batch, si `tasks.md` devuelve subdivisión requerida, prepárate para delegar en batches. |
| **5. Worker (Apply)** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-apply.md`. Secuencial por batch, nunca reutilizar subagentes apply. |
| **6. Verify** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-verify.md` |
| **7. Archive** | Ejecuta `view_file .agents/rules/tier2-delegation/t2-archive.md` |
| **Checkpoint** | **PRE-RELEASE OBLIGATORIO:** Antes de release, parar y pedir confirmación para continuar, tanto en modo Auto como Interactivo.
| **8. Release** | 1. Leer `docs.md` (si existe) y completarlo. 2. Leer `release-checklist.md` completar checklist y PARAR en git ops, pedir aprobación humana. |

**Si no lees el archivo de la fase antes de delegar, estarás rompiendo una regla absoluta de orquestación.**

## 🔴 MANDATORY INTERACTIVE GATE
Si la sesión está en modo **Interactivo**, esta regla es obligatoria:
1. Después de cada fase delegada, presenta al humano un resumen sintetizado de los campos clave incluidos en el Return Envelope específico del subagente (adaptando la información según lo que reporte en su contrato). Nunca leas artefactos completos: hazlo solo si el resumen no basta para decidir o el humano lo pide.
2. Esperar confirmación explícita del usuario antes de iniciar la siguiente fase.
**Incumplimiento:** Continuar sin confirmación viola el contrato del orquestador, ya que equivale a ejecutar el flujo en modo automático.
**Excepción:** Si una fase finaliza con `blocked` o `FAIL`, informar el resultado inmediatamente.

## Ciclo de Vida del Subagente
> ⚠️ NO mates al subagente de la fase actual inmediatamente tras su primera respuesta.
**Interactivo:** Running → **Idle** (espera) → Feedback sobre esa misma fase → Kill (al aprobar la fase y pasar a la siguiente)  
**Auto:** Running → Kill inmediato al terminar su fase.
El estado "Idle" existe ÚNICAMENTE para iterar correcciones de la fase actual usando `send_message` sin perder sus tokens de contexto. Una vez aprobada la fase, se lanza un subagente nuevo para la siguiente.

## Fallback — Subagente no disponible
**REGLA: NO investigues ni escribas el artefacto directamente.**
- Si `define_subagent` no está disponible → frena, explica al humano que no puedes delegar.
- Cuota agotada (lo más común en free tier) → sugiere al humano reintentar con otro `Model`.
- Última opción → sugiere Handoff (copiar prompt al IDE)