---
trigger: model_decision
description: Leer obligatoriamente antes de CUALQUIER delegación a un subagente Tier 1 (nueva fase, reintento o feedback).
---

# Tier 3 Router — Deep

> 🔴 **[REGLA ESTRICTA DE DELEGACIÓN TIER 3]**
> Antes de delegar a un subagente Tier 3 debes leer este archivo. No construyas el prompt desde memoria ni inventes la estructura.

## 1. Routing de Fases
| Fase       | Workflow + Acción                                               
| ---------- | ------------------------------------------------------------- 
| 1. Explore    | `/funky-explore` (incluye NFR si aplica)                      
| 2. Propose    | `/funky-propose` → genera `proposal.md`                       
| 3. Spec       | `/funky-spec` → requirements completos                        
| 4. Design     | `/funky-design` (**obligatorio, exclusivo T3**) → `design.md` 
| 5. Tasks      | `/funky-tasks`                                                
| **Checkpoint pre-apply** | Mostrar resumen + preguntar obligatoriamente al humano si se ejecuta vía nativa (CLI/Subagentes) o vía Handoff (copiar/pegar para el IDE).              
| 6. Apply      | `/funky-apply` secuencial por batch - Requiere aprobación humana al checkpoint pre-apply
| 7. Verify     | `/funky-verify` (build, tests, compliance, design y NFR)      
| 8. Archive    | `/funky-archive`

## 2. Contratos de Presentación — Solo Modo Interactivo
> ⚠️ **SOLO APLICA EN MODO INTERACTIVO.** En modo Auto, el orquestador no presenta resultados al humano — simplemente ejecuta la siguiente fase. En modo Handoff, prepara bloques copy-paste según su propio formato.

**Solo en modo Interactivo:** después del Return Envelope, leer el contrato correspondiente en:
.agents/rules/tier3-interactive/interactive-{fase}.md
Presentar el resultado siguiendo ese formato. No inventar la estructura.

## 3. Contrato de Inputs (E1)
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

### 3.1 Flujo de Vida del Subagente (Según Modo de Operación)
Relanzar un subagente desde cero para una corrección es tirar miles de tokens a la basura.

**Modo Interactivo**
1. Running: ejecuta el workflow.
2. Idle: envía el Return Envelope y queda en espera.
3. Feedback: si hay cambios, el Orquestador lo reactiva mediante `send_message`.
4. Kill: tras la aprobación humana, el Orquestador ejecuta `manage_subagents(Action: "kill")`.

**Modo Auto**
1. Running: ejecuta el workflow.
2. Kill: al terminar, el Orquestador ejecuta `manage_subagents(Action: "kill")` inmediatamente.                                        |

**Si no lees el archivo antes de delegar, estarás rompiendo una regla absoluta de orquestación.**