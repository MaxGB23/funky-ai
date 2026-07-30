# SDD Interactive — Spec

> Escribe delta specs: requirements con escenarios Given/When/Then.

## Lo que devuelve el sub-agente

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Specs creados para `{change}`. N dominios, M requirements, K scenarios.
**Artifacts**:
  - Engram: `sdd/{change}/spec`
  - OpenSpec: `openspec/changes/{change}/specs/**/spec.md`
**Next**: sdd-design (o sdd-tasks si design no aplica)
**Risks**: riesgos o None
**Skill Resolution**: paths-injected
```

**Return específico** (Step 6 de la skill):

```markdown
## Specs Created

**Change**: {change-name}

### Specs Written
| Domain | Type | Requirements | Scenarios |
|--------|------|-------------|-----------|
| oauth | New | 4 added | 6 |
| user-auth | Delta | 2 modified | 4 |

### Coverage
- Happy paths: covered
- Edge cases: covered
- Error states: covered
```

## Lo que presenta el orchestrator

```markdown
📋 Specs ready — "login-con-google"

| Dominio    | Tipo  | Requirements | Escenarios |
|------------|-------|-------------|------------|
| oauth      | New   | 4 added     | 6          |
| user-auth  | Delta | 2 modified  | 4          |

**Cobertura**:
- Happy paths: ✅ cubiertos
- Edge cases: ✅ cubiertos
- Error states: ⚠️ parcial

**Siguiente**: Design (o tasks si design no aplica)

**¿Quieres ajustar algo o continuamos?**
```

## Notas

- Si hay specs MODIFIED, menciono qué cambió.
- Si coverage es baja en error states, lo marco como warning.
