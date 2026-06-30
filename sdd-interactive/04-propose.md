# SDD Interactive — Propose

> Define intent, scope, approach, y rollback del cambio.

## Lo que devuelve el sub-agente

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Proposal creado para `{change}`. N entregables in-scope, M deferidos.
**Artifacts**:
  - Engram: `sdd/{change}/proposal`
  - OpenSpec: `openspec/changes/{change}/proposal.md`
**Next**: sdd-spec (o sdd-design si specs no aplican)
**Risks**: riesgos o None
**Skill Resolution**: paths-injected
```

**Return específico** (Step 6 de la skill):

```markdown
## Proposal Created

**Change**: {change-name}
**Location**: {artifact path}

### Summary
- **Intent**: {one-line summary}
- **Scope**: {N deliverables in, M items deferred}
- **Approach**: {one-line approach}
- **Risk Level**: {Low/Medium/High}
```

## Lo que presenta el orchestrator

```markdown
📄 Proposal ready — "login-con-google"

**🎯 Intento**: Agregar login con Google OAuth manteniendo el auth
actual como fallback

**📦 In Scope** (4):
- Ruta de callback OAuth (`/auth/google/callback`)
- Modelo OAuthAccount en Prisma
- Servicio de intercambio de código por token
- UI con botón "Continue with Google"

**🚫 Out of Scope** (2):
- Refresh token rotation (postergado)
- Migración de usuarios existentes

**⚡ Approach**: Manual con webfetch + JWT existente. Sin Passport.

**🔄 Rollback**: `git revert` + `DELETE TABLE OAuthAccount` migration down

**⚠️ Risk Level**: Medium — Google API puede cambiar endpoints

**¿Querés ajustar algo o continuamos?**
```

## Diferencia clave

El proposal es el **contrato** con el usuario. Si el user ajusta algo, es
común que sea en el scope (sacar/meter deliverables) o en el approach.
