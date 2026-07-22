# Tier 3 Router — Deep

> **Contexto:** Este archivo se carga JIT únicamente cuando el humano confirma Tier 3. Contiene el routing completo de fases para T3.

## 1. Routing de Fases

| Fase SDD | Acción T3 |
|---|---|
| **1. Explore** | Workflow `/funky-explore` (incluye NFRs si aplica) |
| **2. Propose** | Workflow `/funky-propose` — produce `proposal.md` desde cero |
| **3. Spec** | Workflow `/funky-spec` — genera requirements detallados (happy paths + edge cases + error states) |
| **4. Design** | Workflow `/funky-design` — **Exclusivo T3. OBLIGATORIO.** Documenta arquitectura, decisiones técnicas y testing strategy en `design.md`. NO SE PUEDE SALTAR salvo excepción explícita del humano |
| **5. Tasks** | Workflow `/funky-tasks` (adaptativo) |
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
