# Tasks: Engram Index-Free Navigation (RFC-025)

### Suggested Work Units
| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Modificar las reglas globales y templates del CLI | PR 1 | Cambios puntuales de `view_file` a `list_dir`. O(1) impacto. |

## Phase 1: Update Agent Rules
- [ ] 1.1 Modificar `.agents/rules/sdd-orchestrator.md` para que el Stage 1 del Memory Polling use `list_dir docs/engram/` en lugar de `grep_search` o `view_file` sobre `index.md`.
- [ ] 1.2 Modificar `.agents/rules/engram-protocol.md` para que indique a los agentes que el descubrimiento de contexto se hace mediante `list_dir docs/engram/` en vez de referenciar el archivo `index.md`.

## Phase 2: Update CLI Templates
- [ ] 2.1 Sincronizar `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md` con los cambios del paso 1.1.
- [ ] 2.2 Sincronizar `funky-cli/src/templates/bootstrap/agents-rules-engram-protocol.md` con los cambios del paso 1.2.