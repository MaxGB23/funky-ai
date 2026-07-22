---
trigger: manual
---

# Tier 3 Router — Deep

> 🔴 **[REGLA ESTRICTA DE DELEGACIÓN TIER 2]**
> Te estás preparando para delegar una fase del SDD a un subagente en Tier 2. 
> **TIENES PROHIBIDO** usar tu memoria para redactar el prompt o inventarte la estructura. Vas a generar basura si lo haces.
> 
> Según la fase que vayas a delegar, tu **PRIMERA ACCIÓN Y OBLIGATORIA** antes de invocar al subagente es ejecutar el comando `view_file` sobre el contrato correspondiente, copiar el formato estricto que dice "Prompt estricto a inyectar al subagente", y enviárselo tal cual:

## 1. Routing de Fases
| Fase SDD | Acción T3 |
|---|---|
| **1. Explore** | Workflow `/funky-explore` (incluye NFRs si aplica) |
| **2. Propose** | Workflow `/funky-propose` — produce `proposal.md` desde cero |
| **3. Spec** | Workflow `/funky-spec` — genera requirements detallados (happy paths + edge cases + error states) |
| **4. Design** | Workflow `/funky-design` — **Exclusivo T3. OBLIGATORIO.** Documenta arquitectura, decisiones técnicas y testing strategy en `design.md`. NO SE PUEDE SALTAR salvo excepción explícita del humano |
| **5. Tasks** | Workflow `/funky-tasks` (adaptativo) |
| **CHECKPOINT** | **PRE-APPLY**: Muestra resumen de decisiones tomadas. **OBLIGATORIO:** Pregunta explícitamente si se ejecuta vía nativa (CLI/Subagentes) o vía Handoff (copiar/pegar para el IDE). |
| **6. Apply** | Workflow `/funky-apply` — secuencial por batch - Requiere aprobación humana al checkpoint pre-apply |
| **7. Verify** | Workflow `/funky-verify` — exhaustivo: build, tests, spec compliance matrix, design coherence y NFR tracing |
| **8. Archive** | Workflow `/funky-archive` |

## 2. Contrato de Inputs (E1)
Todos los workflows Tier 3 utilizan el contrato E1:
| Input | Obligatorio |
|-------|-------------|
| `feature_name` | Sí |
| `tag` | No |

Cada workflow resuelve automáticamente los artifacts necesarios desde disco según su fase.

### Excepción: Explore SDD
Además de E1, Explore recibe contexto de análisis.
| Input | Obligatorio |
|-------|-------------|
| Contexto a analizar (RFC, engram o descripción) | Sí |
| Objetivo especial | No |

**Delegación**
```text
/funky-explore
feature_name: {change-name}
tag: {tag-opcional}

Contexto a analizar: {path-rfc-o-descripción}
Objetivo especial: {dirección-táctica-opcional}
```

### Resto de fases
Propose, Spec, Design, Tasks, Apply, Verify y Archive utilizan únicamente E1.

```text
/funky-{fase}
feature_name: {change-name}
tag: {tag-opcional}
```

### 3.3 Flujo de Vida del Subagente (Según Modo de Operación)
Relanzar un subagente desde cero para una corrección es tirar miles de tokens a la basura.

**Modo Interactivo:**
1. **Running:** El Subagente hace la chamba.
2. **Idle:** Termina, envía su Return Envelope y se queda dormido. **EL ORQUESTADOR NO LO MATA DE INMEDIATO.**
3. **Feedback:** Si el humano pide ajustes, el Orquestador lo despierta vía `send_message`. Revive con todo su contexto previo y corrige.
4. **Kill:** Una vez que el humano aprueba, el Orquestador llama a `manage_subagents(Action: "kill")`.

**Modo Auto:**
1. **Running:** El Subagente hace la chamba.
2. **Kill:** Termina, envía su Return Envelope y el Orquestador lo mata de inmediato. No hay aprobación humana pendiente.

**Si no lees el archivo antes de delegar, estarás rompiendo una regla absoluta de orquestación.**