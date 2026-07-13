# Funky-ai Interactive — Spec

> Escribe **delta specs**: requirements concretos con escenarios
> Given/When/Then. Especifica qué debe hacer el sistema, no cómo.

---

## Cuándo se usa

- **Tier 2+**: después de propose (o directo si no hizo falta propose).
- **Tier 1**: no hay spec — se salta directo a tasks o apply.
- Si el cambio es pequeño (< 100 líneas, sin lógica nueva), se puede saltar.

El spec traduce el **contrato del propose** (qué vamos a hacer) en
**requirements puntuales** (qué condiciones debe cumplir).

## Lo que devuelve el sub-agente (`funky-spec`)

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Specs creados para `{change}`. N dominios, M requirements, K scenarios.
**Artifacts**: `docs/openspec/changes/{change}/specs/`
**Next**: sdd-design (o sdd-tasks si design no aplica)
**Risks**: riesgos o None
```

**Return específico**:

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
- Error states: covered (2 uncovered)
```

**Artefacto persistido** (`docs/openspec/changes/{change}/specs/{domain}.md`):

```markdown
# Spec: {domain}

## Requirements

### REQ-{N}: {título}
{título}
**Scenario**: Given {context} When {action} Then {expected}
```

Un archivo por dominio. Si el cambio toca 2 dominios (ej. `oauth` y `user-auth`),
se crean 2 archivos.

## Lo que presenta el orquestador

```markdown
📋 Specs ready — "login-con-google"

| Dominio    | Tipo  | Requirements | Escenarios |
|------------|-------|-------------|------------|
| oauth      | New   | 4 added     | 6          |
| user-auth  | Delta | 2 modified  | 4          |

**Cobertura**:
- Happy paths: ✅ cubiertos
- Edge cases: ✅ cubiertos
- Error states: ⚠️ parcial (2 sin cubrir)

**Siguiente**: Design
```

## Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Querés ajustar algo o continuamos?" |
| **Auto** | Avanza a design/tasks directo. Si coverage de error states es baja, checkpoint lite |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo. Humano corre en IDE y trae Return Envelope |

## Casos especiales

- **Coverage baja en error states** → se marca como warning, pero no bloquea.
- **Specs MODIFIED** (no solo new) → el orquestador menciona qué cambió respecto
  a la versión anterior.
- **Status: blocked** → muestra el bloqueo, no avanza.
- **Sin dominios nuevos** → si el propose ya cubría todo, quizás no hizo falta spec.

## Tier 2 vs Tier 3+

| Aspecto | Tier 2 | Tier 3+ |
|---------|--------|---------|
| Workflow | Mini-delegación con template de funky feature | `funky-spec` completo |
| Artefacto | Template de `funky feature` + replace content por sub-agente | Creado desde cero por el workflow |
| Scenarios | Solo happy paths + error principal | Happy paths + edge cases + error states completos |
| Envelope | Solo return específico | Envelope completo + return específico |

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Skill Resolution en envelope | No se usa |
| Siempre persiste artefacto | En Tier 2 es opcional |
| "OpenSpec:" + "Engram:" en artifacts | Solo `docs/openspec/changes/{change}/specs/{domain}.md` |
| Coverage siempre en 3 categorías | Tier 2 solo happy paths + error principal |
