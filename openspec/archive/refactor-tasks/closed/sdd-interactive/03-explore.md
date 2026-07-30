# SDD Interactive — Explore

> Investigación del código. No crea archivos de propuesta,
> solo analiza y devuelve hallazgos.

## Lo que devuelve el sub-agente

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Exploración de {topic} completada. N áreas afectadas, M enfoques comparados.
**Artifacts**:
  - Engram: `sdd/{change}/explore`
  - OpenSpec: `openspec/changes/{change}/exploration.md`
**Next**: sdd-propose
**Risks**: riesgos encontrados o None
**Skill Resolution**: paths-injected
```

**Artifact persistido** (Step 6 de la skill):

```markdown
## Exploration: {topic}
### Current State
### Affected Areas
### Context Preservation
### Reglas del RFC
### Definiciones clave
### Scope no-negociable
### Approaches (con pros/cons/effort)
### Recommendation
### Risks
### Ready for Proposal: Yes/No
```

## Lo que presenta el orchestrator

```markdown
🔍 Explore complete — "login con Google"

📋 **Resumen**: El auth actual usa JWT con email/password vía Prisma + PostgreSQL.
No hay soporte para OAuth ni providers externos.

📁 **Áreas afectadas**:
- `src/auth/middleware.ts` — hay que agregar ruta de callback OAuth
- `prisma/schema.prisma` — nuevo modelo OAuthAccount
- `src/auth/service.ts` — lógica de intercambio de código por token

⚖️ **Enfoques considerados**:
1. **Passport.js** — más rápido, pero agrega heavy dependency
2. **Manual con webfetch** — sin deps, más control, más código

✅ **Recomendación**: Manual con webfetch

⚠️ **Riesgos**: refresh token no testea expiración actualmente

**¿Quieres ajustar algo o continuamos?**
```

## Casos especiales

- **`Ready for Proposal: No`** → el orchestrator NO ofrece continuar, explica qué falta.
- **`Status: blocked`** → muestro el bloqueo y no avanzo.
