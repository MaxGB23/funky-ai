# Tasks: Documentación — Escenarios de Uso y Parches de Docs Desactualizados

**Estado:** 🟡 PENDIENTE
**Tier:** T1 — Solo docs/markdown. Sin cambios en código fuente. Orquestador inline.
**Rama:** `main` (sin branch — solo docs)
**Ref:** Sesión de auditoría documental 2026-05-11

> **[SISTEMA]** Todo el trabajo es doc-only. No requiere Workers. El Orquestador lo ejecuta inline en la sesión actual mientras el contexto está fresco.

---

## ✅ Checklist de Ejecución

### TAREA 1 — Crear `escenarios-de-uso.md` [NUEVO]
> **Archivo destino:** `docs/funky-ai/operaciones/escenarios-de-uso.md`
> **Propósito:** Guía de referencia que mapea el estado inicial del usuario al flujo concreto de comandos recomendado.

- [ ] Crear el archivo con al menos 3 escenarios:
  - **Escenario 1 — Proyecto sin definir:** Chat vacío → debate con el agente → decisión → `funky init --template` → llenar Canvas con `canvas-planning-guide.md` → `funky assess` → `funky init` (Headless)
  - **Escenario 2 — Proyecto definido, arranque directo:** `funky init` interactivo → responder prompts → estructura generada → `funky phase explore` → flujo SDD estándar
  - **Escenario 3 — Repo existente sin ecosistema Funky:** `funky init --template` en directorio poblado → modo migración INFRA-CANVAS → `funky init` Headless
- [ ] Cada escenario debe incluir: condición de entrada, flujo de comandos paso a paso, output esperado, criterio de salida ("cuándo estás listo para el siguiente paso")
- [ ] Agregar tabla resumen al inicio del doc como referencia rápida

---

### TAREA 2 — Actualizar `funky-init-flow.md` [PARCHE — v1.7.0 → current]
> **Archivo:** `docs/funky-ai/operaciones/funky-init-flow.md`
> **Problema:** Doc congelado en v1.7.0. Faltan 4+ archivos en la tabla de templates estáticos, el árbol de decisión del `--template` no menciona `canvas-planning-guide.md`, y los bugs documentados ya están resueltos.

- [ ] Actualizar header de versión a current (v1.18.x)
- [ ] Actualizar tabla §3.2 "Templates estáticos" — agregar los archivos faltantes:
  - `canvas-planning-guide.md` → `docs/funky-ai/cli/canvas-planning-guide.md`
  - `TEMPLATE_GUIDE.md` → `TEMPLATE_GUIDE.md`
  - `architecture-assessment.md` (desde `../sdd/`) → `docs/architecture-assessment.md`
  - `rfc-template.md` (desde `../sdd/`) → `docs/openspec/rfcs/000-TEMPLATE.md`
- [ ] Actualizar árbol de decisión §2 — el nodo `--template` ahora también copia `canvas-planning-guide.md` antes del `process.exit(0)`
- [ ] Actualizar §3.3 "Archivo dinámico" — ahora son DOS archivos dinámicos: `PROJECT-CANVAS.md` e `INFRA-CANVAS.md`
- [ ] Sección §4 "Bugs Conocidos" — marcar BUG-01 y BUG-02 como `[RESUELTO en v1.7.0]`
- [ ] Actualizar §7 "Estructura resultante" — agregar `INFRA-CANVAS.md`, `canvas-planning-guide.md`, `TEMPLATE_GUIDE.md` y los nuevos archivos en `docs/`

---

### TAREA 3 — Parche menor en `guia-flujo-completo.md`
> **Archivo:** `docs/funky-ai/operaciones/guia-flujo-completo.md`
> **Problema:** El Paso 2.2 solo muestra `funky init` directo. No menciona cuándo usar `--template` ni el modo Headless. El output esperado está desactualizado (6 archivos vs los actuales).

- [ ] Agregar **Paso 2.1.b** (opcional/condicional) antes del `funky init`:
  > "Si no tenés claro el stack → ejecutá `funky init --template` primero. Te genera los Canvas vacíos y la guía de llenado. Completá los Canvas y luego continuá con el Paso 2.2."
- [ ] Actualizar el output esperado del Paso 2.2 para reflejar los archivos actuales (incluyendo `INFRA-CANVAS.md`, `canvas-planning-guide.md`, `TEMPLATE_GUIDE.md`, etc.)
- [ ] Actualizar el árbol de carpetas en Paso 2.3 para que coincida con la estructura real generada por `funky init` en v1.17+

---

### TAREA 4 — Agregar entrada al Índice de Docs Vivos
> Una vez creado `escenarios-de-uso.md`, agregar su entrada al índice `<OPTIONAL_DOC_UPDATE>` en `.agents/templates/sdd/tasks.md`

- [ ] Agregar fila al índice:
  | 7 | `docs/funky-ai/operaciones/escenarios-de-uso.md` | Escenarios de uso del CLI mapeados a estado inicial del usuario | Se agrega un nuevo comando/modo al CLI que cambia alguno de los flujos de entrada |

---

## 📋 Notas de Auditoría — Estado actual de cada doc

| Doc | Estado | Acción requerida |
|-----|--------|-----------------|
| `funky-init-flow.md` | ❌ Desactualizado (v1.7.0) | Parche mayor — Tarea 2 |
| `guia-flujo-completo.md` | ⚠️ Parcialmente desactualizado | Parche menor — Tarea 3 |
| `escenarios-de-uso.md` | ❌ No existe | Crear — Tarea 1 |
| `funky-cli/README.md` | ✅ Al día | Sin cambios |
| `funky-ai.md` | ✅ Al día (conceptual, no cambia con releases) | Sin cambios |
| `funky-ai-team-guide.md` | ✅ Al día | Sin cambios |
| `sdd-survival-guide.md` | ✅ Al día (guía de estudio, no operacional) | Sin cambios |
| `cli-simulations.md` | ⚠️ Vector 1 describe bug ya resuelto sin marcarlo | Podría marcar como `[RESUELTO]` — baja prioridad |
| `canvas-planning-guide.md` | ✅ Al día | Sin cambios |
