# SDD Interactive — Init

> Bootstrap del proyecto. Se corre una sola vez por proyecto.
> Init Guard: el orchestrator intercepta antes de cualquier comando SDD
> y si `sdd-init` no se corrió, lo delega primero.

## Lo que devuelve el sub-agente

**Envelope** (Section D de `sdd-phase-common.md`):

```markdown
**Status**: success | partial | blocked
**Summary**: SDD initialized for `{project}`. Stack: {stack}. Strict TDD: {enabled/disabled}.
**Artifacts**:
  - Engram: `sdd-init/{project}`, `sdd/{project}/testing-capabilities`, `skill-registry`
  - OpenSpec: `openspec/config.yaml`
**Next**: sdd-explore or sdd-new
**Risks**: None o riesgos detectados
**Skill Resolution**: paths-injected
```

## Lo que presenta el orchestrator

```markdown
✅ Init complete — "funky-ai"

**Stack**: Node.js v20, pnpm, Commander.js, Vitest
**Strict TDD**: ✅ activo — `pnpm test`
**Testing layers**: Unit (Vitest), Integration (supertest), E2E (Playwright)
**Persistence**: Engram (`sdd-init/funky-ai`)

**¿Quieres ajustar algo o continuamos?**
```

## Comportamiento en interactivo

- Muestro el resultado.
- Pregunto si quiere ajustar algo o continuar.
- Si el user elige continuar, el Init Guard queda satisfecho y ejecuto el comando SDD original (explore, new, ff, etc.).
