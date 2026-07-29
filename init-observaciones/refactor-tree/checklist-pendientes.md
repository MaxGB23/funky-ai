# Checklist de Pendientes — Refactor de Templates

> Referencia: `cosas-rotas.md`

---

## ✅ Punto 1 — `--bootstrap` injection

Arreglado. `funky init --bootstrap` ahora inyecta correctamente:
- `funky-ai-rules/` → `.agents/rules/` (24 archivos)
- `bootstrap/sdd/` → `.agents/templates/sdd/` (8 archivos)
- `000-rfc-template.md` → `openspec/rfcs/` (excepción)
- 3 root files + `docs-live-index.md` generado
- `docs-index/` directorio vacío creado

---

## ✅ Punto 2 — `docs-live-index.md` + `docs-index/`

- `docs-live-index.md` se genera con el header de la tabla
- `docs-index/` directorio vacío se crea
- Nada de init, nada de lógica extra — solo estructura
- No contiene templates, el CLI lo genera directo con:
action: 'create',
content: '# 📚 Índice de Docs Vivos (SSOT)\n\n| # | Doc | ...',
---

## ✅ Punto 3 — Canvases a templates estáticos

Los canvases ahora son templates estáticos que `funky init` copia directamente.

- `canvas.js` y `canvas.test.js` eliminados
- `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` como templates en `src/templates/bootstrap/`
- Contenido restaurado al original de `canvas.js` (preguntas guía con ejemplos en comentarios HTML)
- Tests actualizados: `init.integration.test.js` verifica "Framework Base" y "Estrategia de Testing"

---

## ✅ Punto 4 — `funky-pipeline/` reorganizado a `init/` `assess/` `estimate/`

**Completado.** `funky-pipeline/` eliminado y su contenido redistribuido en directorios por comando:

### Cambios de estructura
- `src/templates/funky-pipeline/` → **eliminado**
- `architecture-review-template.md`, `architecture-decisions-template.md` → `src/templates/assess/`
- `pricing-guide-template.md`, `pricing-decisions-template.md` → `src/templates/estimate/`
- `PROJECT-CANVAS.md`, `INFRA-CANVAS.md`, `canvas-planning-guide.md` → `src/templates/init/`
- `architecture-assessment.md` → **eliminado** (no lo usaba ningún comando)

### Cambios de output paths
- `funky init` (sin flags) → escribe canvases en `docs/funky-ai/canvas/` (antes raíz)
- `funky assess` → escribe en `docs/funky-ai/assess/` (antes `.agents/prompts/` + `docs/`)
- `funky estimate` → escribe en `docs/funky-ai/estimate/` (antes `.agents/prompts/`)
- `funky pipeline` → context.json en `docs/funky-ai/pipeline/` (antes raíz)

### Simplificaciones
- `context.js`: initContext sin canvases, writeContext auto-crea directorio, findCanvases solo lee de `docs/funky-ai/canvas/` (sin root/docs fallback)
- `assess.js`: canvases siempre leídos de filesystem, `--context` solo escribe context.json (no lee datos de contexto)
- `pipeline.js`: sin `findCanvases`, sin canvas status en `pipeline status`

### Documentación actualizada
- `diagrama-comandos.md` — rewrite completo
- `escenarios-de-uso.md` — paths corregidos
- `funky-init-flow.md` — tabla, árbol y notas
- `guia-flujo-completo.md` — todos los outputs y árbol post-init
- `funky-cli/README.md` — árbol completo con nuevos directorios
- `cli-simulations.md` — context.json path corregido
- `openspec/specs/assess/spec.md` — 4 referencias actualizadas
- `openspec/specs/estimate/spec.md` — 10 referencias actualizadas
- Templates: `architecture-review-template.md` (Fase 6), `bootstrap/README.md` (PROJECT-CANVAS path)
- `checklist-pendientes.md` — sección Punto 3 actualizada con estado ✅
- `propuestas-diagrama.md` — **eliminado** (reemplazado por diagrama-comandos.md)

---

---

## 🔲 Punto 5 — Por definir

Candidatos según pendientes actuales:

- [ ] **Opción A: Eliminar comandos obsoletos** — `funky phase`, `funky gentle`, `funky release`, `planning-handoff.md`, y sus registros en `bin/funky.js`. Referencia: `sesion-pendientes.md` PASO 2.
- [ ] **Opción B: Migrar `--bootstrap` a comando independiente** — separar la inyección del ecosistema de `funky init` para que sea `funky bootstrap` o similar.
- [ ] **Opción C: EACCES handling** — manejar excepción de permisos en `init.js` con mensaje amigable en vez de stacktrace crudo (Vector 3 de cli-simulations.md).
- [ ] **Opción D: Argentinismos** — limpiar voseo/imperativo en docs operativos (dejar solo gentle-ai-global.md).
- [ ] **Otra propuesta** — lo que el usuario quiera traer.

---
