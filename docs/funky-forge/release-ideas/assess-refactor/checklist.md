# Checklist de refactor — `funky assess`

> **Propósito:** seguimiento físico del refactor de `funky assess` derivado de las observaciones del smoke test. Se marca aquí, no depende del contexto de la conversación.
> **Fuente:** `docs/funky-forge/release-ideas/smoke-test-observaciones/mejoras-sugeridas.md` (§2 ASSESS, §2.1, §4 GENERALES y §1.4 observación extra sobre el patrón de prompts).
> **Estado:** Fase 1 completada (2026-08-06) — Fase 2 completada (2026-08-06, TDD 333 tests) — Fase 3 completada (2026-08-06, 3.5 validado por el usuario).

## Contrato de feedback (referencia — hereda el definido y aprobado en init)

| Caso | Comportamiento | Exit |
|---|---|---|
| Archivo nuevo | Se crea sin preguntar | 0 |
| Guía existente | Pregunta Y/N: `y` → actualiza; `n` → no actualiza (decisión válida) | 0 |
| Decisión existente (`risk-patterns.md`, `architecture-decisions.md`) | No pregunta, no sobrescribe; recomienda eliminar o mover de ubicación (backup) | 0 |
| Error real (lectura/escritura, conflicto inesperado) | Mensaje de error | 1 |

Regla clave: "el usuario decidió no actualizar" es una operación completada correctamente, nunca un error.
Sin terminal (CI): default `n` logueado — no sobrescribir guías sin input humano.

## Fase 1 — Templates de assess (contenido de la discusión)

- [x] 1.1 `assess-prompt-template.md` + `architecture-review-template.md`: la Fase 1 y el Contexto de entrada incluyen obligatoriamente `docs/funky-ai/canvas/brief-funcional.md` como contexto de negocio (obs 2.1.1). ✔ (2026-08-06)
- [x] 1.2 Instrucción anti-monólogo: "Un punto a la vez" + "Detente y espera" en Reglas de discusión (obs 2.1.2, 4). ✔ (2026-08-06)
- [x] 1.3 Regla "No modifiques nada" (brief, canvases y review son SOLO LECTURA) sin aprobación explícita (obs 2). ✔ (2026-08-06)
- [x] 1.4 Rol: NFRs, patrones y `risk-patterns.md` como REFERENCIAS que pueden no aplicar; adaptarse sin sobreingeniería; la IA es segunda validación, el humano tiene la decisión final (obs 2). ✔ (2026-08-06)
- [x] 1.5 Validación cruzada técnica vs negocio: regla 4 + Fase 3/4 del review (sobreingeniería "matar moscas a cañonazos" o stack corto) (obs 2.1.3). ✔ (2026-08-06)
- [x] 1.6 Regla "Decisiones aprobadas": anotar de INMEDIATO en `architecture-decisions.md` punto por punto; NUNCA un punto no aprobado (obs 2, 4). ✔ (2026-08-06)
- [x] 1.7 `architecture-review-template.md` reescrito como guía declarativa: elimina `{{PROJECT_CANVAS_CONTENT}}`, `{{INFRA_CANVAS_CONTENT}}`, `{{DYNAMIC_QUESTIONS}}`; referencia los archivos (brief, PROJECT, INFRA, risk-patterns) (obs 2). ✔ (2026-08-06)
- [x] 1.8 DECISIÓN TOMADA Y EJECUTADA (2026-08-06): `assess-prompt-template.md` creado siguiendo el patrón de init (`init-prompt.md`); el CLI (Fase 2) lo copiará a `docs/funky-ai/assess/assess-prompt.md` como guía. Si falta un archivo referenciado, el prompt instruye señalar y PREGUNTAR, jamás inventarlo (obs 1.4 extra, recomendación 3 validada).

## Fase 2 — CLI (TDD, tests primero)

- [x] 2.1 Tests: `architecture-review.md` ya NO contiene el copy paste de los canvases; referencia los archivos en su lugar (obs 2). ✔ (2026-08-06)
- [x] 2.2 Tests: ya NO se inyecta `{{DYNAMIC_QUESTIONS}}` con el contenido de patrones en el review; se referencia `risk-patterns.md`. Verificado (2026-08-06): `surfaceRiskPatterns` solo lee `risk-patterns.md` del proyecto y devuelve su contenido + nombres; `surfacedPatterns` (nombres) solo lo consume `pipeline status --json`, `estimate` NO lo usa → eliminar la inyección no rompe nada. DECISIÓN TOMADA (2026-08-06): conservar `surfacedPatterns` como metadata del status; su futuro se debate junto al comando `pipeline` en la fase estimate (obs 2). ✔ (2026-08-06)
- [x] 2.3 Implementar los cambios en `assess.js` (eliminar interpolación de canvas y de patrones; mensajes de feedback por archivo). `assess-prompt.md` se copia como guía (kind 'guide', Y/N interactivo, default `n` sin TTY) (obs 2). ✔ (2026-08-06)
- [x] 2.4 Feedback por archivo siguiendo el contrato: `architecture-review.md` (guía generada) se regenera; `risk-patterns.md` y `architecture-decisions.md` existentes → no sobrescribir, recomendación eliminar/mover con backup (obs 4). ✔ (2026-08-06)
- [x] 2.5 Español neutro en los mensajes de `assess.js`: corregido "Asegurate" → "Asegúrate" y revisados el resto de mensajes (warnings de canvas, summary) (obs 3 estimate, 4). ✔ (2026-08-06)
- [x] 2.6 Tests actualizados: `assess.test.js` renombrado a `assess.integration.test.js` (convención command-level, cap 800) y reescrito con tests por comportamiento (333 total en la suite). `assessRules.test.js` y `pipeline.integration.test.js` NO requerían cambios (no asumían interpolación). ✔ (2026-08-06)
- [x] 2.7 Actualizar `docs/funky-forge/assess.md` (doc del comando): outputs (review declarativo + `assess-prompt.md`), contrato de feedback por archivo y próximo paso (pegar `assess-prompt.md` como primer mensaje). ✔ (2026-08-06)

## Fase 3 — Verificación

- [x] 3.1 `pnpm test` verde en `funky-cli/` (333 tests, 27 files). ✔ (2026-08-06)
- [x] 3.2 Smoke: `funky assess` con canvas → `architecture-review.md` con referencias (no copy paste) y sin patrones inyectados. ✔ (2026-08-06, `.tmp/smoke-init-clean2`)
- [x] 3.3 Smoke: feedback por archivo — primera ejecución crea todo; segunda ejecución no sobrescribe decisiones y lo informa (recomendación eliminar/mover). ✔ (2026-08-06)
- [x] 3.4 Smoke: `risk-patterns.md` y `architecture-decisions.md` existentes → recomendación eliminar/mover, exit 0; `assess-prompt.md` sin TTY → default `n` logueado. ✔ (2026-08-06)
- [x] 3.5 Validación del flujo de discusión punto por punto en sesión real de IA: la IA abrió con UN solo punto ("la fuente de las métricas no está definida") y esperó respuesta — anti-monólogo confirmado. ✔ (2026-08-06, validado por el usuario)

## Hallazgos del smoke de assess (2026-08-06)

1. Inconsistencia menor de separadores en el summary del CLI: "📝 Guía: docs\funky-ai\assess\architecture-review.md" usa backslash (de `path.relative` en Windows) mientras las demás rutas usan "/" hardcodeado. Cosmético; pendiente de decisión si se normaliza (puede ir en el refactor de estimate).

## Trazabilidad con las observaciones

| Observación | Ítems |
|---|---|
| 2 (review con copy paste; referencias; no modificar sin aprobación; risk-patterns referenciado; decisiones en architecture-decisions.md) | 1.3, 1.4, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4 |
| 2.1.1 (falta brief en Fase 1) | 1.1 |
| 2.1.2 (anti-monólogo, punto por punto) | 1.2 |
| 2.1.3 (validación cruzada técnica vs negocio) | 1.5 |
| 1.4 extra (patrón de prompts por comando) | 1.8 |
| 4 (feedback por comando, español neutro, decisiones no sobrescritas) | 2.4, 2.5, 1.2, 1.6 |
