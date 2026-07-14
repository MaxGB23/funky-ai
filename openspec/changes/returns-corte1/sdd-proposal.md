# Proposal: Returns Corte 1 — Core del Framework

## Intent

El orquestador actual usa un modelo T1-T4 desactualizado sin preflight, sin cache de sesion, y sin routing basado en Tier. Los contratos de retorno definen un envelope de 5 campos (`status/summary/artifacts/next/risks`) pero el orquestador y los workflows no lo implementan. Corte 1 establece la base: envelope comun, preflight, cache de sesion, y routing de fases por Tier.

## In Scope

- **Envelope comun**: Definir y documentar el formato `status / summary / artifacts / next / risks` como contrato unico. Eliminar `skill_resolution`, `detailed_report`, y referencias a Engram del envelope.
- **Preflight**: Paso cero donde el orquestador analiza el pedido, recomienda `{Tier, Docs, Release, Modo}`, y espera confirmacion despues de `funky feature`.
- **Cache de sesion**: Almacenar `{tier, modo, release_type, docs_impact}` para la sesion completa. Las fases se determinan por Tier.
- **Routing de fases**: El orquestador sabe que fases ejecutar por Tier:
  - T1: directo a tasks/apply (sin explore/propose/spec/design/verify)
  - T2: explore ligero → propose ligero → spec ligero → tasks → apply → verify ligero → archive
  - T3: explore SDD → propose → spec → design → tasks → apply → verify completo → archive

## Out of Scope

- **Corte 2**: Pipeline T2 end-to-end en automatico (sub-agentes Sabueso, mini-delegacion)
- **Corte 3**: Capa interactiva (templates de presentacion, pregunta de cierre entre fases)
- **Corte 4**: Fases Tier 3 (design completo, verify completo, batching)
- **Corte 5**: Modo Handoff (bloques copy-paste, Ley de Invarianza)
- Implementacion de sub-agentes o workflows internos
- Modo Handoff o Interactivo (solo se define la estructura, no el comportamiento)

## Approach

### 1. Envelope comun
Reemplazar la definicion actual en `sdd-orchestrator.md` (Return Statement con G1/G2/G3) por el envelope de 5 campos. El `sdd-phase-returns.md` ya es la fuente de verdad — el orchestrator y bootstrap deben referenciarlo.

### 2. Preflight
Reemplazar el PRE-0 del checklist (que solo pide `funky feature`) por un paso activo de analisis + recomendacion. Agregar tabla de criterios para Tier/Docs/Release/Modo. El orquestador genera el bloque de recomendacion y espera confirmacion.

### 3. Cache de sesion
Despues de la confirmacion del preflight, el orquestador declara los valores cacheados. Todos los pasos subsiguientes lean de esta cache. No hay re-pregunta.

### 4. Routing de fases
Reemplazar la Escalation Matrix T1-T4 por un mapa explicito de fases por Tier. Agregar tabla de routing: Tier → fases en orden. Mantener la regla de que T1 no tiene fases de diseno/verificacion.

## Affected Areas

| Area | Impacto | Cambio |
|------|---------|--------|
| `.agents/rules/sdd-orchestrator.md` | Modificado | Reemplazar escalation matrix, agregar preflight, cache, routing |
| `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md` | Modificado | Mismos cambios que el orchestrator (es su template) |
| `openspec/rfcs/.importantes/sdd-phase-returns.md` | Referencia | Ya contiene el envelope correcto — no requiere cambios |

## Risks

| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| Confusion entre T1-T4 (viejo) y T1-T3 (nuevo) | Alta | Renombrar explicitamente. Eliminar T4 del orchestrator. |
| Cache de sesion no persiste entre chats | Media | Documentar que la cache vive en la memoria del chat, no en disco. Si el chat se cierra, se re-ejecuta preflight. |
| Bootstrap template se desincroniza del orchestrator | Media | Cambiar ambos archivos en el mismo commit. |

## Rollback

Revertir los cambios en ambos archivos (`sdd-orchestrator.md` y bootstrap template). El `sdd-phase-returns.md` no se modifica.

## Success Criteria

- [ ] El orquestador genera recomendacion de preflight despues de analizar un pedido
- [ ] Los valores {tier, modo, release_type, docs_impact} se cachean y no se re-preguntan
- [ ] El routing de fases es correcto para cada Tier (T1/T2/T3)
- [ ] El envelope de retorno usa los 5 campos (`status/summary/artifacts/next/risks`) sin campos legacy
