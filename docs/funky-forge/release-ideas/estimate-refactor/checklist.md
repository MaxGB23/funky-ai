# Checklist de refactor — `funky estimate` (+ unificación del patrón de feedback con init)

> **Propósito:** seguimiento físico del refactor de `funky estimate` derivado de las observaciones del smoke test. Se marca aquí, no depende del contexto de la conversación.
> **Fuente:** `docs/funky-forge/release-ideas/smoke-test-observaciones/mejoras-sugeridas.md` (§3 ESTIMATE, §4 GENERALES, §1.4 observación extra sobre el patrón de prompts y hallazgo cosmético heredado de assess) + `estimate-flags-guia-tmp.md` + `pricing-factors-analysis.md`.
> **Estado:** Fase 0 pendiente — borrador actualizado tras revisión del patrón de feedback y decisión de diseño de pricing-guide (2026-08-06).

## Contrato de feedback (referencia — hereda el definido y aprobado en init y assess)

| Caso | Comportamiento | Exit |
|---|---|---|
| Archivo nuevo (cualquiera) | Se crea sin preguntar | 0 |
| Guía SIN marcadores existente (`estimate-prompt.md`, `init-prompt.md`, `assess-prompt.md`) | Y/N con ADVERTENCIA EXPLÍCITA de pérdida: `y` → reemplaza por la versión más reciente (pierdes el progreso previo si no hay respaldo); `n` → conserva la actual (decisión válida) | 0 |
| Guía CON marcadores (`pricing-guide.md`) — incrustar flag NUEVO | Aditivo puro: añade solo su sección, no toca nada más; NO pregunta | 0 |
| Guía CON marcadores — refrescar sección existente (template del topic cambió) | Y/N SOLO si sobrescribiría ediciones en esa sección; `y` → refresca sin duplicar; `n` → conserva la sección actual | 0 |
| Guía CON marcadores — actualizar template base (cambió estructura/guía corta) | Y/N con ADVERTENCIA; `y` → reconstruye la base y REINCRUSTA todos los flags detectados por marcador (ninguno se pierde); `n` → conserva todo | 0 |
| Doc vivo existente (`pricing-decisions.md`) | No pregunta, no sobrescribe; recomienda eliminar o mover de ubicación (backup) | 0 |
| Error real (lectura/escritura, conflicto inesperado) | Mensaje de error | 1 |

Regla clave: **nunca se pregunta cuando la operación no tiene nada que perder (aditiva). El Y/N existe únicamente para advertir pérdida potencial.**

Regla clave: "el usuario decidió no actualizar" es una operación completada correctamente, nunca un error.
Sin terminal (CI): default `n` logueado — no sobrescribir guías sin input humano.

**DECISIÓN DE DISEÑO (2026-08-06, usuario):** `pricing-guide.md` es una GUÍA (no un derivado regenerable), y `--flag` es una operación **ADITIVA, no de reemplazo**. Se distinguen tres operaciones:

1. **Incrustar flag nuevo**: añade SOLO su sección arriba de `## Estructura de Discusión` (envuelta en `<!-- topic:x -->...<!-- /topic:x -->`), no toca nada más del archivo, NO pregunta (nada que perder, exit 0).
2. **Refrescar sección existente** (el template del topic cambió): pregunta Y/N solo si sobrescribiría ediciones del usuario dentro de esa sección; `y` → refresca sin duplicar; `n` → conserva la actual (exit 0).
3. **Actualizar template base** (cambió estructura/guía corta de flags): pregunta Y/N **como ADVERTENCIA de pérdida**; `y` → reconstruye desde el template fresco y REINCRUSTA las secciones de flags detectadas por marcador (los flags SE CONSERVAN); lo que se pierde sin respaldo son las anotaciones hechas FUERA de los marcadores; `n` → conserva todo tal cual (exit 0).

El mensaje del Y/N debe decir esto explícitamente, no solo "¿Quieres actualizarla?". La incrustación/detección usa marcadores tipo XML (comentarios HTML `<!-- topic:x -->...<!-- /topic:x -->`, invisibles en markdown) alrededor de cada sección de topic y de la zona de incrustación del template — esto hace que conservar los flags al actualizar sea simple (conjunto cerrado de 6 topics, detección exacta).

## Fase 0 — Unificación del patrón de feedback (toques a init, assess y estimate)

Verificado contra el motor común `executeIntentions` (fs-adapter.js). El comportamiento central Y/N (guía), skip+recomendación (decisión) y regeneración (derivado) es idéntico entre init y assess; estimate hoy maneja a mano lo que init/assess delegan al motor. Divergencias detectadas:

- [ ] 0.1 Naming de templates unificado con sufijo `-template` (decisión del usuario 2026-08-06): renombrar en `src/templates/init/` `init-prompt.md` → `init-prompt-template.md` y `canvas-planning-guide.md` → `canvas-planning-guide-template.md`; actualizar `init.js` (rutas src, NO dest), `init.test.js` (verifica `src`) e `init.integration.test.js` (verifica `dest`, revisar qué cambia). Los destinos `docs/funky-ai/canvas/*` NO cambian. assess y estimate ya usan `-template` (patrón dominante).
- [ ] 0.2 `estimate.js` migra `pricing-decisions.md` al plan de intenciones con `kind: 'decision'` (hoy lo hace a mano con `writeFileSync` + warning corto, perdiendo la recomendación de backup del contrato). La línea "No se sobrescribió" de estimate.js:152 debe pasar al mensaje completo de fs-adapter: "Contiene decisiones del proyecto: no se sobrescriben automáticamente. Si quieres la versión más reciente, elimínalo o muévelo de ubicación para conservar un backup."
- [ ] 0.3 Aviso no-TTY unificado con el patrón de init (genérico, condicionado a que exista ≥1 guía — init.js:61-63), no el de assess (hardcodeado a `assess-prompt.md` — assess.js:127-129). Aplicar el patrón de init a estimate y corregir assess.
- [ ] 0.4 **El Y/N es una ADVERTENCIA de pérdida, y el mensaje debe decirlo explícito** (objetivo del usuario 2026-08-06): el texto actual "Ya existe X. ¿Quieres actualizarla con la versión más reciente?" (init.js:51, assess.js:121) no deja claro que actualizar REEMPLAZA el contenido actual. Nuevo mensaje (mismo en init, assess y estimate — para pricing-guide se adapta al decir que los flags se conservan): "Ya existe X. Actualizarla trae la versión más reciente, pero REEMPLAZA la actual: perderás el progreso previo (anotaciones, ajustes) si no tienes un respaldo. ¿Quieres actualizarla?" Con `y` → reemplaza; con `n` → conserva lo actual (decisión válida, exit 0).

## Fase 1 — Templates de estimate (contenido de la discusión)

- [ ] 1.1 `pricing-guide-template.md` reescrito como guía declarativa: elimina `{{DECISIONS_CONTENT}}`, `{{PROJECT_CANVAS_CONTENT}}`, `{{INFRA_CANVAS_CONTENT}}`; referencia los archivos (`architecture-decisions.md`, PROJECT-CANVAS, INFRA-CANVAS, `brief-funcional.md`) en lugar de copiar su contenido (obs 3: pricing-guide embebe todo a manera de copy paste).
- [ ] 1.2 Marcadores de incrustación en el template: zona de topics marcada (`<!-- topics -->` ... `<!-- /topics -->`) justo ANTES de `## Estructura de Discusión`; cada fragmento de topic envuelto en `<!-- topic:<key> -->` ... `<!-- /topic:<key> -->`. El CLI detecta secciones existentes por marcador exacto (conjunto cerrado de 6 topics), no por heurística sobre texto (obs 3.59). Validaciones: si el template no tiene la zona o el header de discusión, error claro de instalación.
- [ ] 1.3 `estimate-prompt-template.md` creado siguiendo el patrón de assess (`assess-prompt-template.md` → `assess-prompt.md`; mismo patrón de init pero con sufijo `-template` tras Fase 0): prompt de discusión persistente como guía en `docs/funky-ai/estimate/`, NO impreso en consola. El CLI (Fase 2) lo copia como guía. Si falta un archivo referenciado, el prompt instruye señalar y PREGUNTAR, jamás inventarlo.
- [ ] 1.4 Instrucción anti-monólogo: la sección de discusión debe hacerse punto por punto, la IA discute de a un punto y espera; guardar las decisiones aprobadas de INMEDIATO en `pricing-decisions.md`; nunca un punto no aprobado (obs 4).
- [ ] 1.5 Flags como PASO INICIAL: antes de la discusión de pricing, la IA decide primero qué flags recomienda para este proyecto y por qué (guía corta de cuándo conviene cada flag, basada en `estimate-flags-guia-tmp.md`); reemplaza la sección "## Alcance: ¿Aplica en esta fase?" de `generateScopeExclusionTable` (obs 3: la detección automática da falsos positivos). Esta guía corta de flags vive en el template base (se refresca con cada actualización Y/N aprobada).
- [ ] 1.6 Modelo de pricing obligatorio: paso explícito para decidir Fixed-Price vs Time & Materials ANTES de los factores de costo (recomendación del agente que ejecutó el flujo).
- [ ] 1.7 Buffers de contingencia: por cada flag compleja detectada (`--security`, `--concurrency`, etc.), la IA propone un buffer cuantitativo (ej. +10% a +25%) (recomendación del agente).
- [ ] 1.8 TCO como rubro separado: costos recurrentes operativos (pólizas de soporte, monitoreo, límites de proveedores) distintos del costo de desarrollo del MVP (recomendación del agente).
- [ ] 1.9 Resumen financiero final: la sesión termina generando tabla de cotización `Costo Base + Buffer de Riesgo + Margen de Ganancia = Precio de Venta del MVP` (recomendación del agente).
- [ ] 1.10 Evaluar las variables de `pricing-factors-analysis.md` (contexto geográfico del cliente, tamaño de empresa/bolsillo, presupuesto límite CapEx vs OpEx, pricing basado en valor/ROI) y decidir cuáles incorporar al prompt (leer el análisis antes de redactar).
- [ ] 1.11 NFRs, patrones y referencias: dejar en claro que no siempre aplican; la IA se adapta sin sobreingeniería; las flags condicionales son defensa contra sobreingeniería (heredado de assess).

## Fase 2 — CLI (TDD, tests primero)

- [ ] 2.1 Tests: `pricing-guide.md` ya NO contiene el copy paste de decisiones ni canvases; referencia los archivos en su lugar (obs 3).
- [ ] 2.2 Tests: ya NO se imprimen en consola las sugerencias automáticas de flags (línea "💡 Se detectó ... Considerá --flag") ni el prompt gigante; la terminal queda limpia para checks y warnings (obs 3: cualquier flag ensucia la terminal con información innecesaria).
- [ ] 2.3 Tests del mecanismo de incrustación (aditiva + actualización): (a) primera corrida sin pricing-guide → crea con la sección del flag, arriba de `## Estructura de Discusión`, con marcadores; (b) segunda corrida con OTRO flag → incrusta la sección nueva SIN preguntar (aditiva), conserva las secciones previas, orden estable, exit 0; (c) template del topic existente cambió → Y/N; `n` → se conserva la sección actual (exit 0); (d) mismo flag de nuevo sin cambios en el template → no se duplica ni se toca (idempotente); (e) template base cambió (estructura/guía corta) → Y/N con advertencia; `y` → reconstruye la base y reincrusta TODOS los flags detectados por marcador (ninguno se pierde); `n` → no se toca nada (exit 0); (f) sin TTY → incrustación aditiva se ejecuta (segura), actualización base/refresco con cambios → default `n` logueado.
- [ ] 2.4 Implementar en `estimate.js` y `estimateDomain.js`: eliminar interpolación de los 3 placeholders; reemplazar la ficha de alcance por la guía corta de flags; `estimate-prompt.md` se copia como guía (kind 'guide', Y/N interactivo, default `n` sin TTY); `pricing-guide.md` como guía con el flujo de incrustación de la 2.3 (obs 3, 1.4 extra).
- [ ] 2.5 Español neutro en los mensajes de estimate: corregido "Asegurate" → "Asegúrate" (estimate.js:41) y "Considerá" → "Considera" (sugerencias de consola) (obs 3, 4).
- [ ] 2.6 Verificar ortografía: "sobbrescribió" no existe en el código actual (solo citado en las observaciones); confirmar que los mensajes de no-sobrescritura usan "sobrescribió" correctamente (obs 3).
- [ ] 2.7 Normalizar separadores en el summary: las rutas de la guía y del template de decisiones usan `path.relative(...).split(path.sep).join('/')` (fix heredado del hallazgo cosmético de assess; actualmente las líneas 203-204 de estimate.js no lo aplican).
- [ ] 2.8 Tests actualizados por comportamiento (convención command-level, cap 800): `estimateCommand.integration.test.js`, `estimateDomain.test.js`, `estimateCommand.flags.integration.test.js` y `pipeline.integration.test.js` según corresponda (naming behavior-first).
- [ ] 2.9 Actualizar `docs/funky-forge/estimate.md` (doc del comando): outputs (pricing-guide declarativo con marcadores + `estimate-prompt.md` como guía), contrato de feedback por archivo (pricing-guide Y/N), próximo paso (pegar `estimate-prompt.md` como primer mensaje).

## Fase 3 — Verificación

- [ ] 3.1 `pnpm test` verde en `funky-cli/`.
- [ ] 3.2 Smoke: `funky estimate --security` → pricing-guide con referencias (no copy paste), sección `## Seguridad` marcada arriba de `## Estructura de Discusión`, sin prompt gigante en consola.
- [ ] 3.3 Smoke: segunda corrida `funky estimate --concurrency` → incrusta `## Concurrencia` SIN preguntar (aditiva), `## Seguridad` se conserva, exit 0. Tercera corrida con template base modificado → pregunta Y/N con advertencia; `n` → no cambia nada (exit 0, decisión válida); `y` → reconstruye la base y REINCRUSTA Seguridad + Concurrencia (ningún flag se pierde).
- [ ] 3.4 Smoke: `pricing-decisions.md` existente no se sobrescribe (recomendación eliminar/mover con backup, exit 0); sin TTY → default `n` logueado.
- [ ] 3.5 Smoke init/assess: tras Fase 0, los tres comandos responden igual al mismo escenario (guía existente Y/N, decisión existente skip+recomendación, no-TTY aviso genérico).
- [ ] 3.6 Validación del flujo de discusión en sesión real de IA: punto por punto, modelo de pricing primero, buffers por flag, TCO separado y tabla de cotización final — anti-monólogo confirmado (patrón del 3.5 de assess).

## Pendientes arrastrados de assess (a resolver en este refactor)

1. **RESUELTO (verificado 2026-08-07 contra el código): `surfaceEstimateTopics` NO lo consume pipeline.** La obs 2.2 de assess ("solo pipeline status --json lo consume") era incorrecta: `pipeline status` muestra `ctx.assess.surfacedPatterns` que viene de ASSESS (`surfaceRiskPatterns` → risk-patterns.md), no de estimateTopics. `surfaceEstimateTopics` tiene 2 consumidores, ambos en estimate: (a) sugerencias de consola estimate.js:71 (se eliminan en 2.2) y (b) ficha de alcance en estimateDomain.js (se reemplaza en 1.5). **DECISIÓN del usuario (2026-08-07): eliminar** `estimateTopics.js` completo (`surfaceEstimateTopics`, `TOPIC_PATTERNS`, `TOPICS`, `DISPLAY_NAMES`, `STATUS`) con `estimateTopics.test.js` en Fase 2 — la guía corta de flags del template es la única guía para decidir flags; la IA decide con contexto, sin heurísticas de texto.
2. Hallazgo cosmético de separadores (ya incluido como 2.7).
3. **RIESGO NUEVO (pipeline + Y/N de pricing-guide en Fase 2):** `pipeline all --json` promete un único JSON en stdout (R-P11). Cuando pricing-guide pase a guía con Y/N (Fase 2), una actualización de template base podría disparar un confirm interactivo de @clack/prompts y ensuciar el JSON. Mitigación a definir en Fase 2: en modo `--json` estimate corre sin preguntar (default `n` logueado, como no-TTY) o el Y/N va a stderr. Anotar como sub-ítem de 2.4/2.9.

## Trazabilidad con las observaciones

| Observación | Ítems |
|---|---|
| 3 (prompt gigante en consola; copy paste de init/assess; argentinismos; falsos positivos en detección de flags; flags como paso inicial; incrustar secciones sin sobrescribir) | 1.1, 1.2, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5 |
| 3 recomendaciones del agente (modelo de pricing, buffers, TCO, tabla de cotización) | 1.6, 1.7, 1.8, 1.9 |
| 1.4 extra (patrón de prompts por comando) | 1.3, 2.4 |
| 4 (feedback por comando, español neutro, decisiones no sobrescritas, punto por punto) | 1.4, 2.5, 2.6, contrato |
| pricing-factors-analysis.md (variables estratégicas de negocio) | 1.10 |
| Revisión del patrón de feedback (2026-08-06): naming -template, pricing-decisions a executeIntentions, aviso no-TTY genérico | 0.1, 0.2, 0.3, 3.5 |
| Decisión de diseño pricing-guide (2026-08-06): guía Y/N + marcadores + incrustación ADITIVA con conservación de flags al actualizar | contrato, 1.2, 2.3, 2.4, 3.2, 3.3 |
