# Funky-ai Interactive — Init

> ⏳ **SUGERENCIA A FUTURO** — No implementar aún.
> Funky-ai no tiene `sdd-init` como sub-agente hoy. Este archivo describe
> cómo debería funcionar cuando se implemente. Mientras tanto, el orquestador
> arranca directamente con la confirmación del preflight.

## Propósito

El Init Guard es el bootstrap del proyecto SDD. Corre una sola vez por
proyecto (detectado automáticamente por el orquestador al arrancar cualquier
sesión SDD). Si ya se ejecutó antes, no vuelve a correr — solo muestra el
resumen del contexto guardado.

En Funky-ai, init ocurre **después** del preflight (recomendación + `funky feature`
+ confirmación), porque ya tenemos el contexto del modo, tier, etc.

## Lo que devuelve el sub-agente (`sdd-init`)

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: SDD initialized for `{project}`. Stack: {stack}. Strict TDD: {enabled/disabled}.
**Artifacts**:
  - OpenSpec: `openspec/config.yaml`
  - Engram (si aplica): `sdd-init/{project}`
**Next**: según la fase que pidió el humano (explore, new, ff, etc.)
**Risks**: None o riesgos detectados
**Skill Resolution**: paths-injected
```

## Lo que presenta el orquestador

Cuando init corre por primera vez:

```markdown
✅ SDD listo — "funky-ai"

**Stack**: Node.js v20, pnpm, Commander.js, Go 1.22
**Strict TDD**: ✅ activo — `pnpm test`
**Testing layers**: Unit (Vitest), Integration (supertest), E2E (Playwright)

**Sesión configurada**:
  Modo:     Interactivo
  Tier:     T3
  Release:  Minor

Podemos arrancar.
```

Cuando init ya se había corrido antes (sesión recurrente):

```markdown
✅ SDD ya estaba inicializado — "funky-ai"

**Stack**: Node.js v20, pnpm, Commander.js, Go 1.22
**Strict TDD**: ✅ activo
**Último init**: 2026-07-08

**Sesión actual**:
  Modo:     Auto (recomendado para este cambio)
  Tier:     T2

Arrancamos con lo que pidió el cambio o necesitás algo antes?
```

## Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resumen + "¿Querés ajustar algo o continuamos?" |
| **Auto** | Muestra resumen y arranca la siguiente fase sin preguntar (solo si es la primera vez que corre init) |
| **Handoff** | Muestra resumen y pregunta si el humano quiere llevar el init al IDE o seguir en CLI |

### Handoff

Si el humano elige Handoff, el orquestador prepara:

```markdown
Iniciá un chat nuevo en el IDE y pegá:

  Acabo de ejecutar sdd-init para funky-ai. Stack: Node.js v20 + Go 1.22.
  Strict TDD activo. Modo: Handoff. Tengo que ejecutar la siguiente fase
  del SDD (explore/propose/etc.). Devolveme el Return Envelope cuando termines.
```

## Reglas

- Inline si engram ya tiene `sdd-init/{proyecto}` — no delegar init de nuevo.
- Si el init falla (Status: partial o blocked), mostrar el error y no continuar.
- Strict TDD es informativo en esta etapa — no bloquea el flujo, pero se debe
  pasar a las fases siguientes (apply, verify) cuando corresponda.

## Comportamiento actual (sin init)

Hoy Funky-ai no tiene init. El orquestador arranca con el stack que conoce por
defecto y las skills cargadas. Cuando esto se implemente, debería:

- Detectar stack real del proyecto (package.json, go.mod, etc.)
- Detectar test runner configurado
- Detectar skills instaladas y cargarlas al registro
- Persistir para no repetir en cada sesión
