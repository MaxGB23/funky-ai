---
trigger: model_decision
---

### Risk Decision Table — Tier 3 (post fase Tasks)

> **Scope:** Aplica exclusivamente a Tier 3. El ejecutor siempre es el subagente de Apply (workflow `funky-apply.md`). NUNCA delegar batches en paralelo — uno termina, se recibe su envelope, se lanza el siguiente.

| Señal en `Riesgos`           | Status    | Acción del Orquestador                                                                    |
|-------------------------------|-----------|-------------------------------------------------------------------------------------------|
| Sin riesgos                   | `success` | **Checkpoint:** Preguntar al humano → delegar Batch único al subagente de Apply.               |
| >5 archivos ó >400 líneas     | `success` | Subdividir el `tasks.md` en Batches (A.1, A.2…). **Checkpoint** → delegar secuencialmente. |
| 3+ fases                      | `success` | **Checkpoint** → Delegación Fase por Fase: cada subagente de Apply muere al terminar su batch.|
| Risk Level High (del propose) | `success` | Subdividir en Batches pequeños. **Checkpoint** → delegar secuencialmente.|
| Combinación de los anteriores | `success` | Aplicar la regla más restrictiva (ej. Fase por Fase + batches pequeños). **Checkpoint**.  |
| `partial`                     | `partial` | **Breakdown incompleto.** Mostrar fases con tareas vs fases vacías. Dar recomendación y preguntar cómo proceder (ej. relanzar con más contexto). |
| `blocked`                     | `blocked` | **STOP.** Mostrar el motivo del block + recomendación y preguntar al humano cómo continuar. |

---

### 🚨 Reglas de Ejecución de Batches (Fase Apply)

1. **Aislamiento Estricto:** NUNCA reutilices el mismo subagente para el siguiente batch. Cada batch (A.1, A.2 o Fase 1, Fase 2) DEBE ejecutarse en un **NUEVO subagente independiente** de la Fase Apply. Reutilizar el agente pudre el contexto.
2. **Circuit Breaker (Fallo en cascada):** Si un subagente de Apply retorna `blocked`, `partial`, encuentra cambios "out of scope", o no logra terminar su batch asignado: **CORTA LA CADENA INMEDIATAMENTE**. NO delegues el siguiente batch. Documenta el estado actual y escala al humano.