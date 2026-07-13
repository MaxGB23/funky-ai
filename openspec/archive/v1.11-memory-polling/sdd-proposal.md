# SDD Proposal — Memory Polling v2

> **Feature:** `memory-polling-v2`
> **Fecha:** 2026-05-01
> **Estado:** ✅ Aprobado para especificación

---

## 1. Propuesta Seleccionada: Two-Stage Polling + Engram Index

### Descripción

Introducir una capa de índice liviano (`docs/engram/index.md`) que funcione como tabla de contenidos del engram. El protocolo de polling pasa de un acceso de fuerza bruta a un acceso quirúrgico en dos etapas.

### Flujo Actual (v1.x)

```
[Inicio de sesión]
  → grep_search "topic" discoveries.md  ← carga hasta 129 líneas
  → grep_search "topic" bugfixes.md     ← carga hasta 46 líneas
```

### Flujo Propuesto (v2)

```
[Inicio de sesión]
  → view_file docs/engram/index.md       ← siempre: ~30 líneas, costo fijo
      ↓
  ¿Hay un tag relevante para la tarea actual?
      ├─ NO  → Continuar sin polling adicional
      └─ SÍ  → grep_search "[TAG-EXACTO]" discoveries.md
               grep_search "[TAG-EXACTO]" bugfixes.md
               (solo el entry específico, ~6-8 líneas)
```

---

## 2. Estructura del Engram Index

```markdown
# Engram Index — Funky AI
<!-- Actualizar cada vez que se agregue una entrada al engram -->

## Discoveries
| Tag | Resumen (1 línea) |
|-----|-------------------|
| [model-efficacy-quota] | Gemini Flash para Workers, Pro Low para Orquestación |
| [massive-consolidation] | Tablas > narrativa para reducir tokens |
| [in-template-rule-injection] | Reglas cerca de la ejecución, no globales |
| ... | ... |

## Bugfixes
| Tag | Resumen (1 línea) |
|-----|-------------------|
| [ci-lockfile-mismatch] | Regenerar pnpm-lock al pinar versiones |
| ... | ... |
```

**Tamaño estimado:** ~30-35 líneas. Costo fijo independientemente de cuántas entradas tenga el engram.

---

## 3. Protocolo de Mantenimiento del Índice

**Regla de consistencia:** Cuando un Worker o Orquestador agregue una entrada al engram (`discoveries.md` o `bugfixes.md`), DEBE también agregar la línea correspondiente al índice (`index.md`).

Esto se enforcea en:
1. El template `worker-handoff.md` §1.B (instrucción explícita)
2. El `sdd-orchestrator.md` en la sección de "Engram — Proactive Save Triggers"
3. El protocolo de "Session Close"

---

## 4. Alternativas Evaluadas

| Opción | Pros | Contras | Decisión |
|--------|------|---------|----------|
| **Two-Stage + Index** (propuesta) | Costo fijo, quirúrgico, mantenible | Requiere disciplina de mantenimiento del índice | ✅ Seleccionada |
| Sharding por tema (ej. `engram/testing.md`, `engram/ci.md`) | Archivos más pequeños | Más archivos = más complejidad, discovery cross-tema difícil | ❌ Rechazada |
| Grep sin modificar protocolo | Sin cambios | No resuelve el costo de tokens ni el compliance | ❌ Rechazada |
| view_file con StartLine/EndLine | Precisión total | Requiere saber la línea exacta — imposible sin índice previo | ❌ Solo como Stage 3 si necesario |

---

## 5. Impacto en el Protocolo

### `sdd-orchestrator.md` — Memory Polling Section

**Antes:**
```
ACTION: Execute grep_search on docs/engram/discoveries.md
ACTION: Execute grep_search on docs/engram/bugfixes.md
```

**Después:**
```
ACTION: Execute view_file on docs/engram/index.md
→ Si tag relevante detectado:
  ACTION: Execute grep_search "[TAG]" on docs/engram/discoveries.md
  ACTION: Execute grep_search "[TAG]" on docs/engram/bugfixes.md
```

### `worker-handoff.md` template — §1.B Memory Polling

Mismo reemplazo. El Worker también usa el índice primero.

---

## 6. Definition of Done

- [ ] `docs/engram/index.md` creado con todas las 25 entradas existentes indexadas
- [ ] `sdd-orchestrator.md` actualizado con protocolo Two-Stage
- [ ] `worker-handoff.md` template actualizado con protocolo Two-Stage
- [ ] `discoveries.md` contiene entry del nuevo patrón `[memory-polling-index-layer]`
- [ ] `ORCHESTRATOR-STATE.md` bumpeado a v1.11.0

---

*Siguiente paso: `sdd-spec.md`*
