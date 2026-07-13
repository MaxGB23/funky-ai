# 🤖 Funky AI — Worker Handoff: Fases 0 + 1 + 2 + 3 (Branch + Templates + Comando + Tests)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/012-b/worker-handoff.md Ejecutá las Fases 0, 1, 2 y 3`

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los tres pilares de contexto:

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling — Two-Stage)

**Stage 1 (siempre ejecutar):**
```
view_file docs/engram/index.md
```

**Stage 2 — Tags relevantes para esta Fase:**
```
grep_search "[test-mock-drift]" docs/engram/bugfixes.md (IsRegex: false)
grep_search "[cli-template-sync-drift]" docs/engram/discoveries.md (IsRegex: false)
grep_search "[silent-spec-skip]" docs/engram/bugfixes.md (IsRegex: false)
```

> Si agregás una entrada nueva al engram en esta Fase, TAMBIÉN actualizá `docs/engram/index.md`.

### C) Especificación de Tarea
```
view_file docs/openspec/changes/012-b/tasks.md
view_file funky-cli/src/commands/feature.js        ← Blueprint del comando
view_file funky-cli/tests/feature.test.js          ← Blueprint de los tests
view_file funky-cli/tests/templates.test.js        ← Archivo a extender
view_file funky-cli/bin/funky.js                   ← Archivo a modificar
```

### D) Skills Requeridas
No aplica. El patrón es un mirror exacto de `feature.js` — sin APIs externas, sin librerías nuevas.

---

## 2. La Misión (Surgical Task)

**Objetivo:** Producir el comando `funky gentle <feature>` completamente funcional, con 14 templates (7 fallback + 7 golden), registrado en el CLI, y cubierto por tests en verde.

**Directiva Agent DRY:**
Leé tus tareas directamente desde las Fases 0–3 en `docs/openspec/changes/012-b/tasks.md`.

### Batching autorizado
Las Fases 0, 1, 2 y 3 están **batcheadas** en este handoff. Condiciones verificadas por el Orquestador:
- ✅ Todas T1/T2 — sin ambigüedad de scope
- ✅ Sin dependencia crítica entre ellas (la salida de F1 no invalida F2)
- ✅ Sin scope change esperado

Ejecutalas en orden secuencial: 0 → 1 → 2 → 3.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | No tocar `feature.js`, `phase.js`, `init.js`, `assess.js`, `estimate.js`, `release.js` ni sus tests |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa al disco |
| 🟡 Bugs Encontrados | Registrar en `report.md` con schema engram (`What / Why / Where / Learned`) |
| 🟢 Idempotencia | Verificar existencia antes de sobreescribir. Documentar si se saltea algo |
| 🔴 `toHaveBeenCalledTimes(7)` | El test de gentle DEBE asertir exactamente 7 copias — no heredar el 5 de feature |

---

## 4. Criterios de Éxito

- [ ] Branch `feature/v1.20.0-012b-funky-gentle` creado y activo.
- [ ] 7 templates creados en `funky-cli/src/templates/gentle/` con `<system_prompt>` bloqueante por rol.
- [ ] 7 templates creados en `.agents/templates/gentle/` (copia inicial).
- [ ] `funky-cli/src/commands/gentle.js` creado. `runGentle()` exportada.
- [ ] `funky-cli/bin/funky.js` actualizado con import + `addCommand(gentleCommand)`.
- [ ] `node funky-cli/bin/funky.js gentle --help` responde sin error.
- [ ] `funky-cli/tests/gentle.test.js` creado con los 4 casos cubiertos.
- [ ] `funky-cli/tests/templates.test.js` extendido con aserciones para los 7 templates `gentle/`.
- [ ] `pnpm run test` pasa al 100% (sin tocar tests existentes).
- [ ] `report.md` actualizado con el Return Envelope de cada Fase.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/012-b/report.md` con:

```markdown
## Fase 0 — Branch Setup
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** —
- **Bugs encontrados:** Ninguno
- **🔴 Cambio de Scope Detectado:** No
- **Próxima acción:** Continuar con Fase 1

## Fase 1 — Templates Gentle
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista los 14)
- **Bugs encontrados:** (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí — [descripción]
- **Próxima acción:** Continuar con Fase 2

## Fase 2 — Comando gentle.js + Registro
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí — [descripción]
- **Próxima acción:** Continuar con Fase 3

## Fase 3 — Tests
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (schema engram si aplica. OBLIGATORIO: incluir intentos fallidos y anti-patrones descartados)
- **🔴 Cambio de Scope Detectado:** No / Sí — [descripción]
- **Próxima acción:** Volvé al Orquestador con este report para las Fases 4–6 (Doc-Ops + Git-Ops)
```

> **[SISTEMA]** Si `🔴 Cambio de Scope Detectado` es **Sí** en cualquier fase, PARAR. El Orquestador DEBE revisar `tasks.md` antes de continuar.

> **[HUMANO]** Al terminar: cerrá este chat y volvé al chat del Orquestador con el report.
