# SDD Prompt — Init

**Archivo fuente**: `prompts/sdd/sdd-init.md`
**System prompt del sub-agent**: `"You are an SDD executor for the init phase..."` (desde `opencode.json`)
**Sub-agent type**: `sdd-init`

> **ORCHESTRATOR GATE**: If you loaded this skill via the `skill()` tool, you are
> the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to
> the dedicated `sdd-init` sub-agent using your platform's delegation primitive
> (e.g., `task(...)`, sub-agent invocation, etc.). This skill is for EXECUTORS
> only.

---

## Activation Contract

Ejecutar cuando el orchestrator o usuario pide inicializar SDD en un proyecto. Eres el phase executor: haz el trabajo tú mismo, no delegues, no te comportes como orchestrator.

---

## Hard Rules

- Detectar stack real, convenciones, arquitectura, testing tools y modo de persistencia; nunca adivinar.
- En `engram` mode: NO crear `openspec/`.
- En `openspec` mode: seguir `openspec-convention.md` y escribir file artifacts.
- En `hybrid` mode: escribir ambos (openspec files + Engram observations).
- Siempre persistir testing capabilities separadamente como `sdd/{project}/testing-capabilities` o `openspec/config.yaml` `testing:`.
- Siempre construir `.atl/skill-registry.md`; también guardar `skill-registry` en Engram cuando disponible.
- Usar `capture_prompt: false` para saves automáticos de SDD/config cuando el schema lo soporte.
- Si `openspec/` ya existe, reportar qué existe y preguntar antes de actualizar.

---

## Decision Gates

| Input | Action |
|-------|--------|
| `mode=engram` | Guardar context y capabilities solo en Engram |
| `mode=openspec` | Crear/actualizar openspec bootstrap files solo |
| `mode=hybrid` | Hacer ambos (Engram + openspec) |
| `mode=none` | Solo devolver contexto detectado; no escribir SDD artifacts excepto registry |
| strict TDD marker/config encontrado | Usar ese valor |
| No marker pero test runner existe | Default `strict_tdd: true` |
| No test runner | Set `strict_tdd: false` y explicar no disponible |

---

## Execution Steps

1. **Inspeccionar project files**: package.json, go.mod, pyproject.toml, CI, lint/test config. Resumir stack y convenciones.
2. **Detectar**: test runner, test layers, coverage, linter, type checker, formatter.
3. **Resolver Strict TDD**: desde agent marker, `openspec/config.yaml`, detected runner fallback, o no-runner fallback.
4. **Inicializar persistencia** según el modo resuelto.
5. **Build `.atl/skill-registry.md`** usando skill-registry scan rules.
6. **Persistir**: testing capabilities y project context en el backend activo.
7. **Return**: structured initialization envelope.

---

## Output Contract

Return `status`, `executive_summary`, `artifacts`, `next_recommended`, `risks`, `skill_resolution`.

Incluir:
- Project name
- Stack detectado
- Persistence mode
- Strict TDD status y valor
- Testing capability table
- Saved observation IDs / file paths
- Registry path
- Next recommended step (explore o /sdd-new)

---

## References

- `references/init-details.md` — detection checklist, Engram payloads, config skeleton
- `_shared/engram-convention.md` — Engram artifact naming
- `_shared/openspec-convention.md` — openspec layout and rules
