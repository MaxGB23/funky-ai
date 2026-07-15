# Orchestrator Rules (Drafts)

> **Regla estricta:** Este es el punto de entrada para las reglas del Orquestador. Carga SOLO los submódulos necesarios según tu tarea actual.

| Módulo | Cuándo usarlo |
|--------|---------------|
| `01-identidad-y-routing.md` | Core behavior, Escalation Matrix y Routing de Fases. |
| `02-preflight-y-contexto.md` | Recomendación Paso 0 y Cacheo de sesión. |
| `03-delegacion-tier2.md` | Contratos estrictos para invocar "Chalanes Crikosos" en T2 (Sabueso, Propose, Spec, Verify). |
| `04-ejecucion-sdd.md` | Guardrails de delegación, Orchestration Checklist, Phase Batching. |
| `05-persistencia.md` | Protocolo Engram y cierre de sesión. |

*Estas reglas se consolidarán eventualmente en `.agents/rules/sdd-orchestrator.md`.*
