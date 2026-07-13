# 🤖 Funky AI — Worker Handoff: Fase de Pulido (Release Prep)

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, correr los tests para asegurar que no rompiste nada y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/cli-canvas-v2/worker-handoff-polishing.md Ejecutá la Fase de Pulido`

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar el contexto:

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Especificación de Tarea (Los dos pendientes)
1. **Inclusión de Planning Guide:** Hay que sincronizar y copiar el archivo `docs/funky-ai/cli/canvas-planning-guide.md` al hacer el init.
2. **[BUG-03] Falso Positivo de Salteo:** `init.js` avisa "Salteando (ya existe)" al crear `INFRA-CANVAS.md` en modo legacy, porque el archivo se crea durante la lógica de migración, *antes* de que llegue el bloque de validación general `if (fs.existsSync)`. Hay que mutear ese log si el archivo es producto de la migración en esa misma corrida.

### C) Archivos a modificar
```
view_file funky-cli/scripts/sync-templates.js
view_file funky-cli/src/commands/init.js
view_file funky-cli/tests/init.test.js
view_file funky-cli/tests/init.integration.test.js
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Liquidar los últimos dos pendientes de CLI Canvas v2 antes del release.

**Acciones exactas:**
1. En `funky-cli/scripts/sync-templates.js`, agregá la sincronización de `docs/funky-ai/cli/canvas-planning-guide.md` (origen) hacia `canvas-planning-guide.md` en la carpeta `bootstrap`. (Corré `pnpm run sync` luego).
2. En `funky-cli/src/commands/init.js` (`runInit`), agregá `canvas-planning-guide.md` al array `filesToCopy` apuntando al destino `docs/funky-ai/cli/canvas-planning-guide.md`.
3. En `funky-cli/src/commands/init.js`, solucioná el BUG-03. Una forma sencilla es registrar en una variable (ej. `migratingLegacy = true`) cuando se crea el INFRA-CANVAS y, al evaluar los salteos, si fue recién migrado, evitar imprimir el `console.log('⚡ Salteando...')` para ese archivo específico.
4. Actualizar los tests en `init.test.js` e `init.integration.test.js` si es necesario (el número de archivos a copiar aumentará en 1 por la guía).
5. Correr `pnpm test` en `funky-cli/` y garantizar 18/18 tests exitosos.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. |
| 🔴 Acción Directa | Cada archivo se escribe con tools de edición o reemplazo directo. |
| 🟢 Tests Verdes | Es OBLIGATORIO que pases los tests corriendo `pnpm test` antes de cerrar. |

---

## 4. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/cli-canvas-v2/report.md` añadiendo al final:

```markdown
### Fase de Pulido — Pre-Release
- **Status:** ✅ Completada
- **Archivos creados/modificados:**
  - `funky-cli/scripts/sync-templates.js`
  - `funky-cli/src/commands/init.js`
  - [archivos de test actualizados]
- **Tests:** [Número] tests ejecutados, todos exitosos.
- **Próxima acción:** Qué debe hacer el Orquestador (Aprobar el release).
```
