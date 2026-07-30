# SDD Interactive — Archive

> Mergea delta specs al source of truth, mueve el cambio a archive,
> completa el ciclo SDD.

## Lo que devuelve el sub-agente

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Cambio `{change}` archivado. N specs sincronizados.
**Artifacts**:
  - Engram: `sdd/{change}/archive-report`
  - OpenSpec: `openspec/changes/archive/{YYYY-MM-DD}-{change}/`
**Next**: none (ciclo SDD completo)
**Risks**: None
**Skill Resolution**: paths-injected
```

**Return específico** (Step 6 de la skill):

```markdown
## Change Archived

**Change**: {change-name}
**Archived to**: `openspec/changes/archive/2026-06-27-{change}/`

### Specs Synced
| Domain | Action | Details |
|--------|--------|---------|
| oauth | Created | 4 added, 0 modified, 0 removed |
| user-auth | Updated | 0 added, 2 modified, 0 removed |

### Source of Truth Updated
- `openspec/specs/oauth/spec.md`
- `openspec/specs/user-auth/spec.md`

### SDD Cycle Complete
```

## Lo que presenta el orchestrator

```markdown
📦 Archive complete — "login-con-google"

**✅ Specs sincronizados**:
| Dominio     | Acción   |
|-------------|----------|
| oauth       | Created — 4 requirements |
| user-auth   | Updated — 2 requirements modificados |

**📁 Source of truth actualizado**:
- `openspec/specs/oauth/spec.md`
- `openspec/specs/user-auth/spec.md`

**🎉 SDD Cycle Complete**

¿Listo para arrancar otro cambio o necesitás algo más?
```

## Diferencia clave con otras fases

**No pregunto "¿Quieres ajustar algo o continuamos?"** porque el ciclo
terminó. Pregunto qué quiere hacer después:

- Arrancar otro SDD change
- Algo no relacionado
- Nada, cerrar sesión
