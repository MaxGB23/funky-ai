# 🤖 Funky AI — Worker Handoff: Fase 3 y Fase 4 (Prompt de Clack y Cobertura de Tests)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `/funky-worker @docs/openspec/changes/016-environment-selector/worker-handoff.md Ejecutá la Fase 3 y Fase 4`

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

**Stage 2 (solo si encontrás un tag relevante en Stage 1):**
```
grep_search "[TAG-EXACTO-DEL-INDICE]" docs/engram/discoveries.md (IsRegex: false)
grep_search "[TAG-EXACTO-DEL-INDICE]" docs/engram/bugfixes.md (IsRegex: false)
```

### C) Especificación de Tarea
```
view_file docs/openspec/changes/016-environment-selector/tasks.md
view_file docs/openspec/changes/016-environment-selector/spec.md
view_file funky-cli/src/commands/init.js
view_file funky-cli/tests/init.test.js
```

### D) Skills Requeridas (Explicit Routing)
* `vitest` (para ejecutar y escribir tests unitarios)
* `C:\Users\cb147\.gemini\config\global_workflows\funky-worker.md` (Workflow activo)

---

## 2. La Misión (Surgical Task)

**Objetivo:** 
1. **Fase 3:** Añadir un prompt interactivo `p.select` de Clack al inicio de la ejecución interactiva del `initCommand` en `funky-cli/src/commands/init.js` para consultar al usuario por el entorno objetivo (IDE vs CLI), y pasarlo a `runInit`.
2. **Fase 4:** Crear pruebas unitarias explícitas en `funky-cli/tests/init.test.js` que verifiquen que `runInit` inyecta las rutas correctas dependiendo de si recibe `'cli'`, `'ide'` o si no recibe ningún parámetro (default retrocompatible).

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde la **FASE 3** y **FASE 4** en `tasks.md` (cargado en §1.C).

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. Si algo fuera de scope está roto, documentalo en el report, no lo arregles |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa. |
| 🟡 Bugs Encontrados | Si encontrás un bug no relacionado con tu tarea → registralo en `sdd-report.md` bajo `## Bugs Encontrados` con schema engram (`What / Why / Where / Learned`) |
| 🟢 Idempotencia | Verificá si el destino ya existe antes de sobreescribir. Documentá si salteás algo |

### 🔍 Guardrail Clave (Retrocompatibilidad en Prompt)
- **Headless Mode / CLI Flags:** En `initCommand`, si los Canvas ya existen (Headless Mode) o si se ejecuta en modo no interactivo, el flujo interactivo no debe correr y `environment` debe asumir `'ide'` determinísticamente sin llamar a Clack. No rompas la retrocompatibilidad.

---

## 4. Criterios de Éxito

- [ ] Prompt de selección interactivo implementado al inicio del `initCommand` interactivo en `init.js`.
- [ ] La variable `environment` resultante se pasa de forma transparente al motor puro `runInit(...)`.
- [ ] Tests en `tests/init.test.js` actualizados con aserciones específicas:
  - Una prueba para `environment: 'cli'` comprobando que llama a copiar las rutas que contienen el subdirectorio `/cli/`.
  - Una prueba para `environment: 'ide'` comprobando que llama a copiar las rutas con `/ide/`.
  - Una prueba de default comprobando que asume `/ide/` sin romper tests existentes.
- [ ] Ejecutar `pnpm run test` localmente y verificar que los 39+ tests unitarios y de integración están en verde.
- [ ] El `sdd-report.md` fue actualizado con la sección de Fase 3 y Fase 4, incluyendo el campo `- **Detalle de Ejecución:**`.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/016-environment-selector/sdd-report.md` con:

```markdown
## Fase 3 & 4 — Inyección de Prompt e Integración de Tests
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `funky-cli/src/commands/init.js` (ruteo dinámico con UI)
  - `funky-cli/tests/init.test.js` (cobertura unitaria para IDE/CLI)
- **Detalle de Ejecución:**
  - [Lista de lo implementado: cambios de lógica, algoritmos, convenciones o reglas agregadas]
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí — [Si Sí: describir qué encontraste que invalida o modifica fases siguientes]
- **Próxima acción:** Qué debe hacer el Orquestador a continuación
```

---

> **[SISTEMA — ORQUESTADOR — LEER ANTES DE COMUNICAR AL HUMANO]**
> Antes de escribir cualquier instrucción al humano, verificar **en este orden**:
> 1. ¿`worker-handoff.md` generado en `docs/openspec/changes/{feature}/`? Si **NO** → generarlo AHORA. No se delega ninguna fase sin handoff.
> 2. ¿Revisaste el Planning Checklist (items 0–4) en `.agents/rules/sdd-orchestrator.md`? Si **NO** → leerlo antes de continuar.
> 3. Solo después de confirmar los dos puntos anteriores, instruir al humano: *"Cerrá este chat, abrí uno nuevo y decíme: `/funky-worker @docs/openspec/changes/016-environment-selector/worker-handoff.md Ejecutá la Fase 3 y Fase 4`"*
