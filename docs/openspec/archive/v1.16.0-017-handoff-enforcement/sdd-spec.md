# SDD Spec — 017 Handoff Enforcement (Agent DRY)

> **Feature:** 017 — Enforcement de Handoff Contract
> **Fecha:** 2026-05-07
> **Estado:** ✅ Listo para tasking

---

## 1. Objetivo

Modificar `.agents/rules/sdd-orchestrator.md` para que la generación del `worker-handoff.md`
sea el **único Return Statement válido** que habilita la delegación al Worker.
El cambio debe ser estructuralmente imposible de ignorar por el modelo.

---

## 2. Archivo a Modificar

**Un solo archivo:** `.agents/rules/sdd-orchestrator.md`

### 2.1 Sección: "Protocolo de Delegación (MANDATORY)" — REEMPLAZAR

**Ubicación actual (aprox. línea 62-64):**
```markdown
## Protocolo de Delegación (MANDATORY)
Cuando el plan esté en disco, PARAR y decir:
> "El plan está listo. Cerrá este chat..."
```

**Reemplazo requerido:**

```markdown
## 🔴 Return Statement — Delegación (MANDATORY — BLOCKING)

Este bloque es el **único punto de salida válido** de la fase de orquestación.
El Orquestador NO puede emitir el prompt de delegación sin antes verificar:

### Pre-Gate (verificar en orden — NO omitir)

| # | Verificación | Si falla |
|---|-------------|----------|
| G1 | `worker-handoff.md` existe físicamente en `openspec/changes/{name}/` | **Generarlo AHORA** usando el template canónico (ver §Protocolo Obligatorio) |
| G2 | El campo `Tier [⚠️ COMPLETAR]` está reemplazado por T1, T2 o T3 | **Completarlo AHORA** |
| G3 | La sección §1.C del handoff tiene la ruta exacta del `sdd-tasks.md` de esta feature | **Completarlo AHORA** |

> 🔴 **REGLA:** Si G1, G2 o G3 fallan → el Orquestador NO emite el prompt de delegación.
> Genera o completa lo que falta. Solo entonces emite:

> "El plan está listo. Cerrá este chat, abrí uno nuevo y decime:
> `@docs/openspec/changes/{name}/worker-handoff.md Ejecutá la Fase N`."
```

### 2.2 Sección: "Planning Checklist" — SIMPLIFICAR

El Planning Checklist actual contiene el ítem #2 referente al handoff.
Al moverlo al Return Statement como gate bloqueante, el checklist queda redundante
en ese punto. **Eliminar el ítem #2 del Planning Checklist** para evitar duplicación
(respeta `[agent-dry-handoffs]`).

**Ítem a eliminar del Planning Checklist:**
```markdown
| 2 | ¿Generé un `worker-handoff.md` basado en el template canónico? | `view_file funky-cli/src/templates/sdd/worker-handoff.md` y crear el archivo |
```

---

## 3. Engram — Nueva Entrada

Agregar en `docs/engram/discoveries.md`:

```markdown
### [handoff-as-return-statement]
- **What:** El `worker-handoff.md` es el único Return Statement válido de la fase de orquestación.
- **Why:** La condición vaga "cuando el plan esté listo" permitía al Orquestador delegar sin generar el handoff, dejando al Worker ciego.
- **Where:** `.agents/rules/sdd-orchestrator.md` — sección "Return Statement"
- **Learned:** El enforcement estructural (gate bloqueante con verificación explícita) es más robusto que documentar el paso en un checklist. Ref: `[documentation-vs-enforcement]`.
```

Agregar en `docs/engram/index.md`:
```
| [handoff-as-return-statement] | worker-handoff.md es el único Return Statement válido de la orquestación |
```

---

## 4. Criterios de Aceptación

- [ ] La sección "Protocolo de Delegación" fue reemplazada por "🔴 Return Statement" con los 3 gates (G1/G2/G3).
- [ ] El ítem #2 del Planning Checklist fue eliminado (evitar duplicación).
- [ ] La entrada `[handoff-as-return-statement]` existe en `docs/engram/discoveries.md`.
- [ ] La entrada `[handoff-as-return-statement]` existe en `docs/engram/index.md`.
- [ ] El texto del Return Statement referencia el template canónico sin duplicar su contenido.

---

## 5. NFRs

| NFR | Criterio |
|-----|---------|
| **Token Diet** | El bloque nuevo NO debe exceder 20 líneas en la regla. Tabla de gates: máximo 3 filas. |
| **DRY** | El Return Statement referencia el template por nombre de sección. No copia instrucciones del template. |
| **Idempotencia** | Si el Worker ya generó el handoff en una sesión anterior, G1 pasa sin acción. |
