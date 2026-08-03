# Roadmap de evolución — funky-forge

> **Estado: PLAN DE TRABAJO — no es spec vigente ni release anunciada.**
> Define los movimientos acordados para la evolución del CLI funky (init, assess, estimate, pipeline).
> Cada movimiento se ejecuta por separado, con su propia ronda de diseño.

---

## Movimiento 1 — v3.6.0 (minor): cerrar la deuda

**Objetivo:** que spec, código y docs digan lo mismo. Sin features nuevas de producto.

### Bloque A — Alinear specs living con código

| # | Carencia | Corrección |
|---|---|---|
| A1 | Spec estimate R3/R4 dice "DEBE sobrescribir" `pricing-guide.md` y `pricing-decisions.md`; el código no sobrescribe | Definir semántica (recomendado: `pricing-guide.md` sobrescribe — es generado; `pricing-decisions.md` NO — es doc vivo del equipo) y alinear spec + código |
| A2 | `assess` nunca escribe `assess.decisionsFile` en `context.json`; el escenario R-E1 de estimate (pipeline) cae siempre al default | `assess` escribe la ruta real resuelta de decisiones en `context.json` |
| A3 | Spec assess R1 manda discovery `root → docs/`; docs y código usan `docs/funky-ai/canvas/` | Fijar `docs/funky-ai/canvas/` como canónica y alinear spec + código + mensajes |

### Bloque B — Deuda residual de init (verificado contra código/templates)

| # | Carencia | Corrección |
|---|---|---|
| B1 | `bootstrap/README.md` copia `{{project_name}}` literal | Interpolar con el nombre real del proyecto en `scaffold` |
| B2 | `pipeline.js` emite mensajes en inglés | Normalizar a español neutro (igual que assess/estimate/init) |

> Nota: el resto de observaciones del smoke test de init (rationale en canvases, guía vs prompts, orphaned, sync-templates, index.md, tests --template) está **resuelto u obsoleto** — verificado contra el código y templates actuales.

### Bloque C — Spec de init

- No existe `openspec/specs/init/spec.md`. Crear spec living de init con la estructura de assess/estimate (propósito, requirements con escenarios GIVEN/WHEN/THEN, NFR).

### Explícitamente fuera del Movimiento 1

- ❌ Rediseño de estimate (brief funcional, plantillas condicionales, "No aplica en esta fase") → Movimiento 2
- ❌ Pipeline con estado real de progreso ni salida machine-readable → Movimiento 2
- ❌ Warnings hardcodeados de compatibilidad de stack (Astro+NextAuth, etc.) — **rechazado**: la compatibilidad la determina el equipo + discusión con IA, y ya vive en `canvas-planning-guide.md` (sección "Análisis de Compatibilidad")

**Resultado:** specs = código = docs en estimate, assess e init; deuda de init cerrada; init con spec propio. Todo sigue en v3.x.

---

## Movimiento 2 — v4.0.0 (major): salto de propuesta de valor

**Objetivo:** redefinir qué hace la herramienta. Los cambios de contrato (outputs y context) justifican el major.

### Estimate — rediseño (según [`estimate-redesign-strategy.md`](./estimate-redesign-strategy.md))

- Brief funcional **opcional** (nunca bloqueante): el CLI ofrece guiar producto/usuarios/alcance MVP como referencia
- Plantillas condicionales (roles, multi-tenant, transacciones, seguridad, concurrencia, integraciones) como **opciones a demanda**, no batería fija
- Patrón "No aplica en esta fase" = heurísticas condicionales (ya incorporado en assess con risk-patterns)
- Costos de equipo y pricing por fases como **opciones** de referencia, no secciones obligatorias
- Principios: el CLI facilita, no dictamina; docs vivos; sin ceremonia monolítica; resiliencia headless (exit 0)

### Pipeline — estado real

- `context.json` con estado de progreso real (no solo timestamps/nombres)
- Salida machine-readable (JSON) además del markdown para la conversación
- "Retomar sesiones" con estado efectivo, no solo `runAt`

### Assess

- Ya refactorizado (markdown vivo con risk-patterns). Solo alineación de spec si queda pendiente.

### Criterio semver

La major se lanza cuando estimate y pipeline tengan su rediseño implementado: los cambios de outputs y contrato de context.json lo justifican. **No antes** — un major solo con deuda sería "un major con contenido de minor".

---

## Decisiones registradas (memoria Engram)

| Tema | Memoria | Estado |
|---|---|---|
| Rescate recomendaciones-agente (brief opcional, plantillas condicionales, "No aplica") | #238 | Acordado |
| Alcance: rediseño estimate = discusión futura | #241 | Acordado |
| Estrategia estimate consolidada | #253 + [`estimate-redesign-strategy.md`](./estimate-redesign-strategy.md) | Acordado |
| Mapeo de carencias v3.5.0 + Bloque B verificado | #254 | Acordado |
| A1: semántica de sobrescritura estimate | #254 (sesión 2026-08-02) | **Decidido**: guía sobrescribe, decisiones no |

---

## Fuentes

- `docs/funky-forge/release-ideas/estimate-redesign-strategy.md` — estrategia del Movimiento 2 (estimate)
- `openspec/specs/{assess,estimate}/spec.md` — specs vigentes a alinear
- `openspec/archive/init-observaciones/observaciones.md` — observaciones del smoke test (mayoría obsoletas)
- Memoria Engram #238, #241, #253, #254
