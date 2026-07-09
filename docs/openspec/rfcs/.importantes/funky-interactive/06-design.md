# Funky-ai Interactive — Design

> Documenta **cómo** se va a implementar lo que los specs definieron.
> Decisiones técnicas, arquitectura, archivos afectados, y estrategia de testing.

---

## Cuándo se usa

- **Tier 3 únicamente.** Si el cambio justifica Tier 3, design es obligatorio.
- **Tier 2**: no hay design — el flujo es explore ligero → propose ligero → spec ligero → tasks.
- **Tier 1**: no hay design.

No hay flag `has_design`, no hay decisión del orquestador, no hay opción de
saltarlo. Tier 3 implica arquitectura que documentar.

### Excepción (muy rara)

Si el spec cubre toda la arquitectura necesaria y la implementación es mecánica
(reemplazar un provider, cambiar una URL, updatear una dependencia), el
orquestador puede proponer saltar design. Pero es excepción explícita, no la
regla — y requiere aprobación humana.

## Lo que devuelve el sub-agente (`funky-design`)

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Design creado para `{change}`. N decisiones de arquitectura, M archivos afectados.
**Artifacts**: `docs/openspec/changes/{change}/design.md`
**Next**: sdd-tasks
**Risks**: riesgos o None
```

**Return específico**:

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

**Artefacto persistido** (`docs/openspec/changes/{change}/design.md`):

```markdown
# Design: {change-name}

## Approach
{descripción técnica general}

## Key Decisions
1. {decisión} — {por qué se eligió esta opción y no otra}
2. {decisión} — {tradeoffs considerados}

## Files Affected
| File | Action | Reason |
|------|--------|--------|
| `src/auth/oauth.service.ts` | Created | Lógica de intercambio OAuth |
| `prisma/schema.prisma` | Modified | Nuevo modelo OAuthAccount |

## Testing Strategy
- **Unit**: OAuthService (mocked HTTP calls)
- **Integration**: callback flow con PostgreSQL de test
- **E2E**: Playwright — login con Google (opcional, depende del entorno)

## Open Questions
- {pregunta sin resolver, o "None"}
```

## Lo que presenta el orquestador

```markdown
🏗️ Design ready — "login-con-google"

⚡ **Approach**: OAuthService separado que intercambia código por token
vía webfetch, persiste cuenta en OAuthAccount, delega JWT creation
al AuthService existente.

🧠 **Decisiones clave** (3):
1. OAuthService separado de AuthService — SRP, fácil de testear
2. Modelo OAuthAccount con userId + provider + providerAccountId
3. Callback route handlers en nuevo archivo `oauth.routes.ts`

📁 **Archivos**: 2 nuevos, 1 modificado, 0 eliminados

🧪 **Testing**: Unit (OAuthService), Integration (callback flow)

❓ **Open Questions**: None
```

## Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Querés ajustar algo o continuamos?" — las decisiones técnicas son lo más común de ajustar acá |
| **Auto** | Avanza a tasks directo. Si hay Open Questions blocking, frena |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo. Humano corre en IDE y trae Return Envelope |

## Casos especiales

- **Open Questions blocking** → el orquestador frena y pide resolver antes de tasks.
- **Open Questions no blocking** → se marcan pero no bloquean el flujo.
- **Status: blocked** → muestra bloqueo, no avanza.
- **Files Affected vacío** → probablemente no hacía falta design.

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Skill Resolution en envelope | No se usa |
| Corre design en cualquier tier | Solo Tier 3 |
| Tiene flag has_design | No existe — Tier 3 = design siempre |
| "OpenSpec:" + "Engram:" en artifacts | Solo `docs/openspec/changes/{change}/design.md` |
