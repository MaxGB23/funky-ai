# Funky-ai Interactive — Propose

> Define el **contrato con el usuario**: qué se va a hacer, qué no, cómo se va
> a encarar, y cómo se vuelve atrás si algo sale mal.

---

## Cuándo se usa

- **Tier 2+**: después de explore (o directo si no hizo falta explorar).
- **Tier 1**: no hay propose — se salta directo a tasks o apply.

El orquestador decide si hace falta propose según el Tier y la complejidad
del cambio. Si el cambio es trivial (bugfix de < 50 líneas), puede saltarlo.

## Lo que devuelve el sub-agente (`funky-propose`)

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Proposal creado para `{change}`. N entregables in-scope, M deferidos.
**Artifacts**: `docs/openspec/changes/{change}/proposal.md`
**Next**: sdd-spec (o sdd-design si specs no aplican)
**Risks**: riesgos o None
```

**Return específico**:

```markdown
## Proposal Created

**Change**: {change-name}

### Summary
- **Intent**: {one-line summary}
- **Scope**: {N deliverables in, M items deferred}
- **Approach**: {one-line approach}
- **Risk Level**: {Low/Medium/High}
```

**Artefacto persistido** (`docs/openspec/changes/{change}/proposal.md`):

```markdown
# Proposal: {change-name}

## Intent
{qué problema resuelve, para quién}

## In Scope
- {deliverable 1}
- {deliverable 2}

## Out of Scope
- {deferido 1} — {por qué se difiere}
- {deferido 2} — {por qué se difiere}

## Approach
{descripción técnica de cómo se va a implementar}

## Rollback Plan
{cómo se deshace el cambio si hay problemas}

## Risk Level
{Low | Medium | High}
```

## Lo que presenta el orquestador

```markdown
📄 Proposal ready — "login-con-google"

🎯 **Intento**: Agregar login con Google OAuth manteniendo el auth actual
como fallback

📦 **In Scope** (4):
- Ruta de callback OAuth (`/auth/google/callback`)
- Modelo OAuthAccount en Prisma
- Servicio de intercambio de código por token
- UI con botón "Continue with Google"

🚫 **Out of Scope** (2):
- Refresh token rotation (postergado — no hay fecha)
- Migración de usuarios existentes (postergado)

⚡ **Approach**: Manual con webfetch + JWT existente. Sin Passport.
Servicio separado para mantener SRP.

🔄 **Rollback**: `git revert` + migration down de OAuthAccount

⚠️ **Risk Level**: Medium — Google API puede cambiar endpoints,
refresh token no cubierto
```

## Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Querés ajustar algo o continuamos?" — los ajustes más comunes son en scope y approach |
| **Auto** | Avanza a spec/design directo. Si Risk Level es High, hace checkpoint lite antes de continuar |
| **Handoff** | Prepara bloque de copy-paste para llevar `funky-propose` al IDE y espera Return Envelope |

## Casos especiales

- **Status: blocked** → muestra bloqueo, no avanza.
- **Risk Level: High** → en Interactivo se marca con énfasis. En Auto, checkpoint lite.
- **Rollback no definido** → warning: el cambio no tiene plan de salida.
- **Tier 2 (mini-delegación)** → el propose es más liviano: orquestador arma un prompt
  acotado, el sub-agente hace replace content sobre el template de `funky feature` y
  devuelve el return específico. El artefacto `proposal.md` queda escrito.

### Propose en Tier 2 con Explore Ligero

Cuando en Tier 2 se ejecutó un Explore Ligero (Sabueso) antes del propose,
el orquestador **inyecta los findings del explore en el prompt de delegación**
del propose. El prompt del propose queda:

```text
[template de funky feature]
+
[EXPLORE FINDINGS — inyectados por el orquestador]
+
Instrucción: escribí proposal.md en docs/openspec/changes/{change}/proposal.md
usando el template y los findings de abajo.
```

El sub-agente propose **no necesita leer archivos de explore** porque los
findings ya vienen en el prompt. Esto mantiene el explore sin persistir y al
propose con todo lo que necesita en un solo mensaje.

#### En modo Handoff

El flujo cambia porque el Sabueso corre en el IDE:

```
1. Orquestador prepara copy-paste del Sabueso → humano corre en IDE → trae findings
2. Humano pega los findings en el chat del orquestador
3. Orquestador prepara copy-paste del propose (template + findings inline)
4. Humano abre otro chat en IDE, pega, el sub-agente genera proposal.md
5. Humano vuelve con el Return Envelope
```

La diferencia clave: en CLI los findings viajan directo entre sub-agentes
(orquestador inyecta). En Handoff el humano es el bus de datos.

### Propose en Tier 3+

En Tier 3+, el explore **sí persiste artefacto** (`explore.md`). El propose
lo lee desde disco como parte de su workflow. No necesita inyección inline.

## Tier 2 vs Tier 3+

| Aspecto | Tier 2 | Tier 3+ |
|---------|--------|---------|
| Workflow | Mini-delegación (prompt armado por orquestador) | `funky-propose` completo |
| Artefacto | Template de `funky feature` + replace content por sub-agente | Creado desde cero por el workflow |
| Return | Solo específico, sin envelope formal | Envelope completo + return específico |
| Rollback | Simple (git revert) | Documentado con pasos concretos |
| Explore previo | Findings inyectados inline por el orquestador | Lee `explore.md` desde disco |

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Un solo propose para todos los tiers | Tier 2 (mini-delegación) vs Tier 3+ (workflow completo) |
| Skill Resolution en envelope | No se usa |
| Siempre persiste artefacto | En Tier 2 es opcional |
| "OpenSpec:" + "Engram:" en artifacts | Solo `docs/openspec/changes/{change}/proposal.md` |
