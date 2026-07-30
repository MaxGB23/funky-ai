# funky pipeline — Orchestrator

## ¿Qué problema resuelve?

Orquestar los comandos `assess` y `estimate` con estado compartido a través de un archivo `context.json`. Esto permite: (a) mantener trazabilidad de cuándo se ejecutó cada fase, (b) pasar datos contextuales entre comandos sin intervención manual, y (c) retomar sesiones de trabajo interrumpidas.

## ¿Cuándo usar pipeline vs comandos individuales?

| Pipeline | Comandos individuales |
|---|---|
| Proyectos multi-fase | Proyectos chicos o exploración rápida |
| Sesiones que se retoman | Una sola fase (solo assess o solo estimate) |
| Equipos que necesitan trazabilidad | Prototipos o experimentos descartables |

## Subcomandos

### `funky pipeline assess`

1. Lee `context.json` desde `<target>/docs/funky-ai/pipeline/context.json`.
2. Si no existe, lo crea con `initContext()` y lo persiste.
3. Ejecuta `assess` con la opción `--context` (modo pipeline).
4. `assess` actualiza `context.json` internamente: establece `assess.runAt` con la fecha ISO y escribe las `dynamicQuestions` que haya generado.

### `funky pipeline estimate`

1. Valida que `context.json` exista. Si no, falla con error: `❌ Pipeline context not found.`.
2. Valida que `assess.runAt` no sea `null`. Si no se ha ejecutado assess, falla con: `❌ Assess has not been run yet.`.
3. Ejecuta `estimate` con la opción `--context`.
4. `estimate` actualiza `context.json` internamente: establece `estimate.runAt`.

### `funky pipeline all`

1. Crea `context.json` si no existe.
2. Ejecuta `pipeline assess`.
3. Si `assess` falla (lanza excepción), corta la ejecución y NO corre `estimate`.
4. Si `assess` succeede, ejecuta `pipeline estimate`.
5. Si `estimate` falla, corta con error.

### `funky pipeline status`

1. Lee `context.json`.
2. Muestra:
   - `CreatedAt` — cuándo se inició el pipeline.
   - Estado de `assess` (completado con fecha o "Not run yet") y cantidad de `dynamicQuestions` si existen.
   - Estado de `estimate` (completado con fecha o "Not run yet").
   - Progreso general: lista de fases completadas o indicador de "Not started".

## `context.json` — estructura y funcionamiento

### Estructura

```json
{
  "version": 1,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "assess": {
    "runAt": "2026-01-15T10:35:00.000Z",
    "dynamicQuestions": [
      "¿Cómo manejas la autenticación?",
      "¿Qué base de datos usas?"
    ]
  },
  "estimate": {
    "runAt": "2026-01-15T10:40:00.000Z"
  },
  "pipeline": {
    "lastCommand": "estimate",
    "completed": ["assess", "estimate"]
  }
}
```

### Cómo se crea

`initContext()` genera los metadatos iniciales:

```js
{
  version: 1,
  createdAt: new Date().toISOString(),
  assess: { runAt: null, dynamicQuestions: [] },
  estimate: { runAt: null },
  pipeline: { lastCommand: null, completed: [] }
}
```

El archivo se guarda en `docs/funky-ai/pipeline/context.json` dentro del directorio base del proyecto. Si el directorio no existe, `writeContext()` lo crea automáticamente.

### Cómo se usa

- Cada comando del pipeline recibe `{ context: true }`, lo que indica a `assess` y `estimate` que deben leer y escribir `context.json` en lugar de operar de forma independiente.
- El archivo se lee con `readContext(targetBase)` y se escribe con `writeContext(targetBase, ctx)`.
- `context.json` actúa como la fuente de verdad del estado del pipeline.

### Cómo NO usarlo (anti-patrones)

- **No editar `context.json` a mano.** El archivo se genera y actualiza automáticamente. Las ediciones manuales pueden producir incoherencias.
- **No esperar que contenga datos de canvases.** Los datos de `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` se manejan por separado. `context.json` solo contiene metadatos del pipeline.
- **No usar pipeline en proyectos chicos.** Para proyectos de una sola fase o exploración rápida, los comandos individuales son más simples y no requieren `context.json`.

## Diagrama de flujo

```
funky pipeline assess
       │
       ├── ¿Existe context.json?
       │     ├── No  → initContext() → writeContext()
       │     └── Sí  → readContext()
       │
       ├── runAssess(targetBase, { context: true })
       │     └── Assess escribe assess.runAt + dynamicQuestions en context.json
       │
       ▼
  context.json actualizado
       │
       ▼
funky pipeline estimate
       │
       ├── ¿Existe context.json?
       │     └── No  → ERROR: "Pipeline context not found"
       │
       ├── ¿assess.runAt es válido?
       │     └── No  → ERROR: "Assess has not been run yet"
       │
       ├── runEstimate(targetBase, { context: true })
       │     └── Estimate escribe estimate.runAt en context.json
       │
       ▼
  Pipeline completo
```

## Reglas

1. `pipeline assess` DEBE ejecutarse antes que `pipeline estimate`. Si no, `estimate` falla con un error claro.
2. `pipeline all` ejecuta ambos en secuencia; si `assess` falla, `estimate` no se ejecuta.
3. `context.json` se almacena en `docs/funky-ai/pipeline/context.json`, no en la raíz del proyecto.
4. `context.json` solo contiene metadatos de ejecución: fechas, preguntas dinámicas y estado del pipeline. No incluye datos de canvases ni artefactos de dominio.
