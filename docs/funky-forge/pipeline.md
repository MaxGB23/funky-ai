# funky pipeline — Orchestrator

## ¿Qué problema resuelve?

Orquestar los comandos `assess` y `estimate` con estado compartido a través de un archivo `docs/funky-ai/pipeline/context.json` (schema v2). Esto permite: (a) mantener trazabilidad real por fase (status `pending|running|completed|failed|skipped`, fechas, duración, artefactos, errores), (b) pasar datos contextuales entre comandos sin intervención manual, (c) retomar sesiones de trabajo interrumpidas (una fase dejada en `running` se re-ejecuta en el siguiente `all`), y (d) salida máquina-legible (`--json`) para integraciones.

## ¿Cuándo usar pipeline vs comandos individuales?

| Pipeline | Comandos individuales |
|---|---|
| Proyectos multi-fase | Proyectos chicos o exploración rápida |
| Sesiones que se retoman | Una sola fase (solo assess o solo estimate) |
| Equipos que necesitan trazabilidad | Prototipos o experimentos descartables |

## Subcomandos

### `funky pipeline assess`

1. Lee `context.json` desde `<target>/docs/funky-ai/pipeline/context.json` (typed read; v1 se migra a v2 automáticamente).
2. Si no existe, lo crea con `initContext()` (v2) y lo persiste.
3. Marca `assess` como `running` con `startedAt` y persiste (R-P10).
4. Ejecuta `assess` con `{ context: true }` (modo pipeline).
5. `assess` actualiza `context.json` vía `updatePhaseState`: `status: 'completed'`, `finishedAt`, `durationMs`, `artifacts`, `runAt`, `surfacedPatterns` y `decisionsFile`.

### `funky pipeline estimate`

1. Valida que `context.json` exista. Si no, falla con error: `❌ Contexto de pipeline no encontrado.`.
2. Valida que `assess.runAt` no sea `null`. Si no se ha ejecutado assess, falla con: `❌ Assess aún no se ha ejecutado.`.
3. Marca `estimate` como `running` con `startedAt` y persiste (R-P10).
4. Ejecuta `estimate` con `{ context: true }`.
5. `estimate` actualiza `context.json` vía `updatePhaseState`: `status: 'completed'`, `finishedAt`, `durationMs`, `artifacts` y `runAt`.

### `funky pipeline all`

1. Crea `context.json` (v2) si no existe.
2. Ejecuta la fase `assess` (marcando `running`/`startedAt`/`currentPhase` antes; la fase persiste su propia completion).
3. Si `assess` falla (lanza o devuelve `status: 'failed'`), corta la ejecución: marca `assess` como `failed` con `error`/`finishedAt`/`durationMs`, marca `estimate` como `skipped`, persiste y sale con exit 1. NO corre `estimate`.
4. Si `assess` succeede, ejecuta la fase `estimate` con el mismo protocolo.
5. Si `estimate` falla, marca `estimate` como `failed`, persiste y corta con exit 1.
6. Resume: una fase dejada en `running` (sin `finishedAt`) se re-ejecuta en el siguiente `all`; `skipped` es un snapshot veraz, nunca una instrucción de skip.

### `funky pipeline status` / `funky pipeline status --json`

1. Lee `context.json`.
2. En modo humano muestra:
   - `Creado` — cuándo se inició el pipeline.
   - `Fase actual` (`currentPhase`) si hay una en curso.
   - Estado por fase: `assess` y `estimate` con su `status`, `Completado` (fecha `runAt`) y `Error` si falló. `assess` además muestra `Patrones detectados` (cantidad de `surfacedPatterns`).
   - Ya NO muestra el bloque `pipeline.completed`/`lastCommand` (eliminado en v2).
3. En modo `--json` emite UN objeto JSON determinista en stdout (orden de claves fijo vía `statusJson`), exit 0. Ante `context.json` inválido/versión desconocida: error en stderr y exit 1.

## `context.json` — estructura y funcionamiento

### Estructura (schema v2)

```json
{
  "version": 2,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "currentPhase": null,
  "assess": {
    "status": "completed",
    "startedAt": "2026-01-15T10:31:00.000Z",
    "finishedAt": "2026-01-15T10:35:00.000Z",
    "durationMs": 240000,
    "error": null,
    "artifacts": [
      {
        "name": "architecture-review.md",
        "path": "docs/funky-ai/assess/architecture-review.md",
        "kind": "generated"
      }
    ],
    "runAt": "2026-01-15T10:35:00.000Z",
    "surfacedPatterns": ["Microservicios", "Cola Síncrona"],
    "decisionsFile": "docs/funky-ai/assess/architecture-decisions.md"
  },
  "estimate": {
    "status": "completed",
    "startedAt": "2026-01-15T10:36:00.000Z",
    "finishedAt": "2026-01-15T10:40:00.000Z",
    "durationMs": 240000,
    "error": null,
    "artifacts": [
      {
        "name": "pricing-guide.md",
        "path": "docs/funky-ai/estimate/pricing-guide.md",
        "kind": "generated"
      }
    ],
    "runAt": "2026-01-15T10:40:00.000Z"
  }
}
```

`status` ∈ `pending|running|completed|failed|skipped`. Los `artifacts` tienen `kind` ∈ `generated|living` y `path` relativo al targetBase con `/` como separador.

### Cómo se crea

`initContext()` genera el estado inicial v2:

```js
{
  version: 2,
  createdAt: new Date().toISOString(),
  currentPhase: null,
  assess: { status: 'pending', startedAt: null, finishedAt: null, durationMs: null,
            error: null, artifacts: [], runAt: null, surfacedPatterns: [], decisionsFile: null },
  estimate: { status: 'pending', startedAt: null, finishedAt: null, durationMs: null,
              error: null, artifacts: [], runAt: null }
}
```

El archivo se guarda en `docs/funky-ai/pipeline/context.json` dentro del directorio base del proyecto. Si el directorio no existe, `writeContext()` lo crea automáticamente.

### Migración v1 → v2

`readContext()` migra automáticamente un archivo v1 existente, en su lugar: conserva `createdAt`/`runAt`/`decisionsFile`, deriva `surfacedPatterns` desde `dynamicQuestions`, deriva `status: 'completed'` + `finishedAt` desde `runAt`, y elimina el bloque `pipeline` (vestigial). Versiones fuera de 1–2 se rechazan: error, sin escritura, exit 1.

### Cómo se usa

- Cada comando del pipeline recibe `{ context: true }`, lo que indica a `assess` y `estimate` que deben leer y escribir `context.json` en lugar de operar de forma independiente.
- `readContext(targetBase)` devuelve un resultado tipado: `{ ok: true, ctx, migrated? }` o `{ ok: false, reason: 'missing'|'invalid'|'error', code?, message? }`.
- El estado por fase se actualiza con el helper compartido `updatePhaseState(ctx, phase, patch)`, que además es dueño de `currentPhase` (`running` lo setea; `completed/failed/skipped` lo limpia).
- `context.json` actúa como la fuente de verdad del estado del pipeline.

### Cómo NO usarlo (anti-patrones)

- **No editar `context.json` a mano.** El archivo se genera y actualiza automáticamente. Las ediciones manuales pueden producir incoherencias.
- **No esperar que contenga datos de canvases.** Los datos de `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` se manejan por separado. `context.json` solo contiene metadatos del pipeline.
- **No usar pipeline en proyectos chicos.** Para proyectos de una sola fase o exploración rápida, los comandos individuales son más simples y no requieren `context.json`.

## Diagrama de flujo

```
funky pipeline all
       │
       ├── readContext() (typed)
       │     ├── missing → initContext() → writeContext()
       │     ├── invalid/unknown version → ERROR stderr + exit 1 (sin write)
       │     └── ok → ctx v2
       │
       ├── updatePhaseState(assess, { status:'running', startedAt }) → writeContext()
       │
       ├── runAssess(targetBase, { context: true })
       │     └── Assess persiste completed + finishedAt + durationMs + artifacts
       │           + surfacedPatterns + decisionsFile (vía updatePhaseState)
       │
       │     └── ¿Falla? → updatePhaseState(assess, failed) +
       │                    updatePhaseState(estimate, skipped) → writeContext() → exit 1
       │
       ├── updatePhaseState(estimate, { status:'running', startedAt }) → writeContext()
       │
       ├── runEstimate(targetBase, { context: true })
       │     └── Estimate persiste completed + finishedAt + durationMs + artifacts
       │
       │     └── ¿Falla? → updatePhaseState(estimate, failed) → writeContext() → exit 1
       │
       └── all --json → process.stdout.write(runJson(ctx, results)) → exit 0
```

## Reglas

1. `pipeline assess` DEBE ejecutarse antes que `pipeline estimate`. Si no, `estimate` falla con un error claro.
2. `pipeline all` ejecuta ambos en secuencia; si `assess` falla, `estimate` no se ejecuta (se marca `skipped`).
3. `context.json` se almacena en `docs/funky-ai/pipeline/context.json`, no en la raíz del proyecto.
4. `context.json` solo contiene metadatos de ejecución: estado por fase, fechas, artefactos y errores. No incluye datos de canvases ni artefactos de dominio.
5. `pipeline status --json` y `pipeline all --json` emiten UN solo JSON en stdout (texto humano a stderr/suprimido), con orden de claves determinista y antes de `process.exit`.
