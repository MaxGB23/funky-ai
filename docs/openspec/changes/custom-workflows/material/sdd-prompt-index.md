# SDD Prompts — Índice Completo

> Todos los prompts que conforman el sistema SDD de Gentle AI.
> Cada archivo documenta un prompt o grupo de prompts del pipeline.

---

## Arquitectura General

```
                    ┌──────────────────────────┐
                    │  gentle-orchestrator      │
                    │  (COORDINATOR)            │
                    │  sdd-prompt-orchestrator  │
                    └──────┬───────┬────────────┘
                           │       │
              ┌────────────┤       ├──────────────┐
              ▼            ▼       ▼              ▼
      sdd-init    sdd-explore   sdd-propose   sdd-spec ...
      (subagent)  (subagent)    (subagent)    (subagent)

Cada subagente tiene SU PROPIO system prompt independiente.
NO heredan nada del orchestrator.
```

---

## Grafo de Dependencias SDD

```
proposal ──→ specs ──→ tasks ──→ apply ──→ verify ──→ archive
                ↑
              design
```

**Fases en paralelo**: specs y design pueden correr simultáneamente después de proposal.

---

## Archivos

| # | Archivo | Contenido | Líneas |
|---|---------|-----------|--------|
| 1 | `sdd-prompt-orchestrator` | System prompt del orchestrator: AGENTS.md (persona + engram) + `opencode.json` (SDD instructions) | ~370 |
| 2 | `sdd-prompt-commands` | Meta-comandos: init, new, ff, continue, explore, apply, verify, archive, onboard | ~260 |
| 3 | `sdd-prompt-init` | SDD Init phase — detect stack, testing capabilities, bootstrap persistence | ~64 |
| 4 | `sdd-prompt-explore` | SDD Explore phase — investigar codebase, comparar enfoques | ~136 |
| 5 | `sdd-prompt-propose` | SDD Propose phase — crear proposal con intent, scope, approach | ~177 |
| 6 | `sdd-prompt-spec` | SDD Spec phase — delta specs con requirements y scenarios Given/When/Then | ~232 |
| 7 | `sdd-prompt-design` | SDD Design phase — architecture decisions, data flow, file changes | ~172 |
| 8 | `sdd-prompt-tasks` | SDD Tasks phase — task breakdown con review workload forecast | ~242 |
| 9 | `sdd-prompt-apply` | SDD Apply phase — implementar código según specs y design | ~224 |
| 10 | `sdd-prompt-verify` | SDD Verify phase — validar implementación contra specs | ~66 |
| 11 | `sdd-prompt-archive` | SDD Archive phase — merge delta specs, mover a archive, cerrar ciclo | ~153 |
| 12 | `sdd-prompt-onboard` | SDD Onboard phase — walkthrough guiado del ciclo completo | ~218 |
| 13 | `sdd-prompt-shared` | Shared references: phase-common, skill-resolver, openspec, engram, persistence | ~568 |

---

## Resumen de Modos de Persistencia

| Modo | Read from | Write to | Project files |
|------|-----------|----------|---------------|
| `engram` | Engram | Engram | Never |
| `openspec` | Filesystem | Filesystem | Yes |
| `hybrid` | Engram (primary) + FS (fallback) | Both | Yes |
| `none` | Orchestrator prompt | Nowhere | Never |

---

## Convenciones Clave

### Engram Topic Keys

| Artifact | Topic Key |
|----------|-----------|
| Project context | `sdd-init/{project}` |
| Exploration | `sdd/{change-name}/explore` |
| Proposal | `sdd/{change-name}/proposal` |
| Spec | `sdd/{change-name}/spec` |
| Design | `sdd/{change-name}/design` |
| Tasks | `sdd/{change-name}/tasks` |
| Apply progress | `sdd/{change-name}/apply-progress` |
| Verify report | `sdd/{change-name}/verify-report` |
| Archive report | `sdd/{change-name}/archive-report` |

### OpenSpec Directory Structure

```
openspec/
├── config.yaml
├── specs/{domain}/spec.md
└── changes/
    ├── archive/YYYY-MM-DD-{change-name}/
    └── {change-name}/
        ├── state.yaml
        ├── exploration.md (optional)
        ├── proposal.md
        ├── specs/{domain}/spec.md
        ├── design.md
        ├── tasks.md
        └── verify-report.md
```

### Return Envelope (Section D)

Toda fase retorna:
- `status`: success | partial | blocked
- `executive_summary`: 1-3 sentences
- `artifacts`: lista de keys/paths
- `next_recommended`: next phase o "none"
- `risks`: risks o "None"
- `skill_resolution`: paths-injected | fallback-registry | fallback-path | none

---

## Size Budgets por Fase

| Fase | Budget máximo |
|------|---------------|
| Propose | 450 palabras |
| Spec | 650 palabras |
| Design | 800 palabras |
| Tasks | 530 palabras |
| Review workload guard | 400 líneas cambiadas |

---

## SDD Session Preflight

Antes de EJECUTAR cualquier comando SDD, preguntar:

- **Pace**: Interactive (default) | Automatic
- **Artifacts**: OpenSpec (default) | Engram | Both
- **PRs**: Ask me (default) | Single PR | Chained | Auto
- **Review budget**: 400 lines (default) | 800 lines | Other
