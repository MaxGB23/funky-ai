# Funky-ai Interactive — Archive

> Cierra el ciclo. Fusiona los delta specs al root spec / source of truth y
> mueve el cambio a archive.

---

## Cuándo se usa

- **Tier 2 y Tier 3**: obligatorio después de verify.
- **Tier 1**: archive es opcional (no hay delta specs que fusionar).

El flujo es el mismo para ambos tiers — archive no requiere template, el
sub-agente recibe un prompt directo con los artefactos del cambio y devuelve
el reporte.

## Lo que devuelve el sub-agente

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Cambio `{change}` archivado. N specs sincronizados.
**Artifacts**: `docs/openspec/changes/archive/{YYYY-MM-DD}-{change}/`
**Next**: none (ciclo SDD completo)
**Risks**: None
```

**Return específico**:

El sub-agente lee los artefactos del cambio (spec, design, tasks, verify-report,
apply-progress), compara con los root specs, y produce la fusión:

```markdown
## Change Archived

**Change**: {change-name}
**Archived to**: `docs/openspec/changes/archive/2026-07-09-{change}/`

### Specs Synced
| Domain | Action | Details |
|--------|--------|---------|
| oauth | Created | 4 added, 0 modified, 0 removed |
| user-auth | Updated | 0 added, 2 modified, 0 removed |

### Source of Truth Updated
- `docs/openspec/specs/oauth/spec.md`
- `docs/openspec/specs/user-auth/spec.md`

### SDD Cycle Complete
```

**Qué produce**:

1. Mueve los artefactos del cambio a `docs/openspec/changes/archive/{YYYY-MM-DD}-{change}/`
2. Actualiza los root specs con los deltas del cambio
3. Persiste el archive-report

No borra el directorio de trabajo del cambio — lo mueve a archive.

## Lo que presenta el orquestador

```markdown
📦 Archive complete — "login-con-google"

✅ **Specs sincronizados**:
| Dominio   | Acción   |
|-----------|----------|
| oauth     | Created — 4 requirements |
| user-auth | Updated — 2 requirements modificados |

📁 **Source of truth actualizado**:
- `docs/openspec/specs/oauth/spec.md`
- `docs/openspec/specs/user-auth/spec.md`

🎉 **SDD Cycle Complete**

¿Listo para arrancar otro cambio o necesitás algo más?
```

## Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Listo para arrancar otro cambio o necesitás algo más?" |
| **Auto** | Muestra resultado. No pregunta — el ciclo terminó |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo |

## Diferencia clave con otras fases

No pregunto "¿Querés ajustar algo o continuamos?" porque el ciclo terminó
(verify ya fue el último guardrail). Pregunto qué quiere hacer después:

- Arrancar otro cambio
- Algo no relacionado
- Nada, cerrar sesión

## Tier 2 vs Tier 3

| Aspecto | Tier 2 | Tier 3 |
|---------|--------|--------|
| ¿Obligatorio? | Sí (fusiona delta specs) | Sí |
| Template | No — prompt directo | No — prompt directo |
| ¿Qué mueve? | spec.md + tasks.md + verify-report.md | spec.md + design.md + tasks.md + verify-report.md + apply-progress |

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Skill Resolution en envelope | No se usa |
| Dos artifact stores (OpenSpec + Engram) | Solo `docs/openspec/changes/{change}/` |
| Mueve a `openspec/changes/archive/` | Mueve a `docs/openspec/changes/archive/` |
| El sub-agente decide sync por dominio | Idéntico |
