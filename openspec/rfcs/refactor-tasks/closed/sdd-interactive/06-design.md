# SDD Interactive — Design

> Documenta decisiones técnicas, arquitectura, data flow, y archivos afectados.

## Lo que devuelve el sub-agente

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Design creado para `{change}`. N decisiones de arquitectura, M archivos afectados.
**Artifacts**:
  - Engram: `sdd/{change}/design`
  - OpenSpec: `openspec/changes/{change}/design.md`
**Next**: sdd-tasks
**Risks**: riesgos o None
**Skill Resolution**: paths-injected
```

**Return específico** (Step 5 de la skill):

```markdown
## Design Created

**Change**: {change-name}

### Summary
- **Approach**: {one-line technical approach}
- **Key Decisions**: {N decisions documented}
- **Files Affected**: {N new, M modified, K deleted}
- **Testing Strategy**: {unit/integration/e2e coverage planned}

### Open Questions
{List or "None"}
```

## Lo que presenta el orchestrator

```markdown
🏗️ Design ready — "login-con-google"

**⚡ Approach**: Agregar OAuthService que intercambia código por token
vía webfetch, persiste cuenta en OAuthAccount, y delega JWT creation
al AuthService existente.

**🧠 Decisiones clave** (3):
1. OAuthService separado de AuthService — SRP, fácil de testear
2. Modelo OAuthAccount con userId + provider + providerAccountId
3. Callback route handlers en nuevo archivo `oauth.routes.ts`

**📁 Archivos**: 2 nuevos, 1 modificado, 0 eliminados

**🧪 Testing**: Unit (OAuthService), Integration (callback flow), E2E (Playwright)

**❓ Open Questions**: None

**¿Querés ajustar algo o continuamos?**
```

## Notas

- Si hay `Open Questions`, el orchestrator las destaca y puede frenar
  si son blocking.
- Si se detectó Strict TDD, el testing strategy es obligatorio y se marca.
