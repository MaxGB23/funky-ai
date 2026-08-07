# Checklist de refactor — `funky init`

> **Propósito:** seguimiento físico del refactor de `funky init` derivado de las observaciones del smoke test. Se marca aquí, no depende del contexto de la conversación.
> **Fuente:** `docs/funky-forge/release-ideas/smoke-test-observaciones/mejoras-sugeridas.md` (§1 INIT y §4 GENERALES)
> **Estado:** Fase 1 completada (2026-08-06) — Fase 2 completada (2026-08-06) — Fase 3 pendiente

## Contrato de feedback (referencia)

| Caso | Comportamiento | Exit |
|---|---|---|
| Archivo nuevo | Se crea sin preguntar | 0 |
| Guía existente (`canvas-planning-guide.md`, `init-prompt.md`) | Pregunta Y/N: `y` → actualiza; `n` → no actualiza (decisión válida) | 0 |
| Decisión existente (`brief-funcional.md`, `PROJECT-CANVAS.md`, `INFRA-CANVAS.md`) | No pregunta, no sobrescribe; recomienda eliminar o mover de ubicación (backup) | 0 |
| Error real (lectura/escritura, conflicto inesperado) | Mensaje de error | 1 |

Regla clave: "el usuario decidió no actualizar" es una operación completada correctamente, nunca un error.
Sin terminal (CI): default `n` logueado — no sobrescribir guías sin input humano.

## Fase 1 — Templates (contenido, define el contrato de archivos)

- [x] 1.1 Crear `funky-cli/src/templates/init/init-prompt.md`: prompt holístico que evalúa brief + PROJECT + INFRA en conjunto; lee el brief PRIMERO; discute punto por punto (un tema a la vez, espera respuesta); no modifica nada sin aprobación; al final reta las hipótesis de negocio del brief (obs 1.3, 1.4, 1.5).
- [x] 1.2 `PROJECT-CANVAS.md`: quitar prompt embebido → template 100% declarativo (obs 1.4).
- [x] 1.3 `INFRA-CANVAS.md`: quitar prompt embebido → template 100% declarativo (obs 1.4).
- [x] 1.4 `canvas-planning-guide.md`: reescribir — instruye leer brief primero, referenciar `init-prompt.md`, sin prompt embebido (obs 1.3, 1.4).
- [x] 1.5 `brief-funcional.md`: agregar ejemplo corto al final de cada comentario de los 12 ítems (obs 1.5).
- [x] 1.6 Revisar español neutro y ortografía en todos los templates de init (obs 3 estimate + decisión usuario).

## Fase 2 — CLI (TDD, tests primero)

- [x] 2.1 Tests: guard por archivo — crear faltantes, omitir existentes (obs 1.1).
- [x] 2.2 Implementar guard por archivo reemplazando el guard grueso actual (obs 1.1).
- [x] 2.3 Feedback de guías: pregunta Y/N, `y` actualiza exit 0, `n` no actualiza exit 0 (obs 4).
- [x] 2.4 Feedback de decisiones: recomendación eliminar/mover, nunca sobrescribir, exit 0 (obs 4).
- [x] 2.5 Error real de I/O → mensaje claro y exit 1 (contrato).
- [x] 2.6 Sin TTY: default `n` logueado (CI) (contrato, propuesto).
- [x] 2.7 `runInit` con 5 intenciones: incluir `init-prompt.md` (obs 1.4).
- [x] 2.8 Mensajes de consola en español neutro (obs 3 estimate + decisión usuario).
- [x] 2.9 Actualizar tests existentes que asumen el guard grueso y 4 archivos: `init.test.js`, `init.integration.test.js`.

## Fase 3 — Verificación

- [ ] 3.1 `pnpm test` verde en `funky-cli/`.
- [ ] 3.2 Smoke: creación limpia en `.tmp/` — 5 archivos, brief primero.
- [ ] 3.3 Smoke: creación parcial — brief existe → se omite con recomendación; canvases se crean.
- [ ] 3.4 Smoke: todo existe — guías con Y/N, decisiones con recomendación, exit 0.
- [ ] 3.5 Smoke: error simulado (sin permisos de escritura) → exit 1.

## Trazabilidad con las observaciones

| Observación | Ítems |
|---|---|
| 1.1 (guard por archivo) | 2.1, 2.2 |
| 1.3 (prompt brief-primero, no modificar sin discutir) | 1.1, 1.4 |
| 1.4 (init-prompt.md, canvases declarativos, orden) | 1.1, 1.2, 1.3, 1.4, 2.7 |
| 1.5 (brief con ejemplos, agente reta hipótesis) | 1.1, 1.5 |
| 4 (feedback por comando, español neutro) | 2.3, 2.4, 2.8 |
