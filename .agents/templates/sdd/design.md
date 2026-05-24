# Design: [Nombre de la Funcionalidad o Cambio]

> **ORCHESTRATOR GATE**: If you loaded this skill, you are the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to the dedicated design worker/sub-agent.

> **🛑 ACTION FORCING — LEER ANTES DE CONTINUAR**
> Antes de escribir una sola línea de diseño:
> 1. ¿Leíste `proposal.md` y `spec.md`? Si no → STOP.
> 2. ¿Leíste el código afectado real (entry points, interfaces, tests)? Si no → STOP.
> 3. ¿Hay decisiones arquitectónicas bloqueantes sin respuesta? Si sí → documentar en Open Questions y esperar aprobación humana.

> **Budget:** Máx 650 palabras. Usá diagramas ASCII, tablas y bullets sobre prosa.

## 1. Approach
[Una oración: qué estrategia técnica se sigue y por qué mapea a la propuesta y specs.]

## 2. Architecture Decisions

> **🛑 GATE HUMANO**: Cada decisión marcada con `[PENDING]` requiere aprobación antes de continuar con Tasks.

| Decisión | Opción elegida | Alternativas descartadas | Rationale |
|----------|---------------|--------------------------|-----------|
| [Título] | [Qué] | [Qué se rechazó] | [Por qué] |

## 3. Data Flow

```text
[Diagrama ASCII del flujo de datos. Eliminar sección si no aplica.]
Component A ──→ Component B ──→ Component C
```

## 4. File Changes

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `path/to/file` | Create / Modify / Delete | [qué cambia y por qué] |

## 5. Interfaces / Contracts
[Solo firmas de interfaces, tipos o contratos nuevos. Sin implementación. Eliminar si no hay contratos nuevos.]

## 6. Testing Strategy

| Layer | Qué testear | Approach |
|-------|-------------|----------|
| Unit | [qué] | [cómo] |
| Integration | [qué] | [cómo] |

## 7. Open Questions

> **🛑 GATE HUMANO**: Si hay ítems `[BLOCKER]` → no continuar con Tasks sin resolución explícita del humano.

- [ ] `[BLOCKER]` [pregunta que bloquea el diseño]
- [ ] `[NICE-TO-HAVE]` [pregunta que no bloquea]

---

> **[SISTEMA - PARA EL ORQUESTADOR]** Si el diseño es aprobado y no hay blockers abiertos, procedé a generar el `tasks.md`.
