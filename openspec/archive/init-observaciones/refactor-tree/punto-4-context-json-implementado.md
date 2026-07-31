# Punto 4 — context.json y el flag `--context`

## ¿Qué es context.json?

context.json es el **estado compartido entre fases del pipeline**. No es un archivo que el usuario edita — lo gestionan los comandos automáticamente.

Está en `docs/funky-ai/pipeline/context.json`. Contiene **solo metadatos**:

```json
{
  "version": 1,
  "createdAt": "2026-07-29T12:00:00.000Z",
  "assess": {
    "runAt": "2026-07-29T12:30:00.000Z",
    "dynamicQuestions": [
      { "category": "SQLite", "question": "..." },
      { "category": "K8s", "question": "..." }
    ]
  },
  "estimate": {
    "runAt": "2026-07-29T13:00:00.000Z"
  },
  "pipeline": {
    "lastCommand": "all",
    "completed": ["assess", "estimate"]
  }
}
```

### Qué guarda cada campo

| Campo | Qué registra |
|-------|-------------|
| `version` | Versión del schema (para migraciones futuras) |
| `createdAt` | Cuándo se inició el pipeline |
| `assess.runAt` | Si ya se ejecutó `pipeline assess` y cuándo |
| `assess.dynamicQuestions` | Preguntas generadas en assess (para referencia futura) |
| `estimate.runAt` | Si ya se ejecutó `pipeline estimate` y cuándo |
| `pipeline.lastCommand` | Último subcomando de pipeline ejecutado |
| `pipeline.completed` | Lista de fases completadas (ej: `["assess", "estimate"]`) |

### Lo que NO guarda (ya no)

Antes guardaba el contenido completo de los canvases (project + infra) en `context.canvases.projectCanvas` e `context.canvases.infraCanvas`. Esto duplicaba datos y podía quedar stale si el usuario editaba los canvases después de crear el context.

Ahora las fases leen directamente de los archivos canónicos:

| Fase | Lee de |
|------|--------|
| assess | `docs/funky-ai/canvas/PROJECT-CANVAS.md` + `INFRA-CANVAS.md` |
| estimate | `docs/funky-ai/canvas/` + `docs/funky-ai/assess/architecture-decisions.md` |

### Quién escribe context.json y cuándo

| Comando | Cuándo escribe |
|---------|---------------|
| `pipeline assess` | Crea context.json si no existe. Escribe `assess.runAt` + `dynamicQuestions` al terminar |
| `pipeline estimate` | Escribe `estimate.runAt` al terminar. **Bloquea** si no existe `assess.runAt` |
| `pipeline all` | Ambos, secuencialmente |
| `funky assess` (standalone) | **No escribe** — solo pipeline lo usa |
| `funky estimate` (standalone) | **No escribe** — solo pipeline lo usa |

---

## ¿Qué hace el flag `--context`?

`--context` es un flag opcional en `funky assess` y `funky estimate`. Le dice al comando que **participe en el pipeline**, es decir, que actualice context.json al terminar.

### Sin `--context` (comportamiento standalone)

```bash
funky assess
# → genera outputs en docs/funky-ai/assess/
# → NO toca context.json
# → si no existen canvases, usa placeholders y sigue igual

funky estimate
# → genera outputs en docs/funky-ai/estimate/
# → NO toca context.json
# → si no existen decisions, usa placeholder y sigue igual
```

### Con `--context` (comportamiento pipeline)

```bash
funky assess --context
# → genera outputs en docs/funky-ai/assess/
# → TAMBIÉN escribe docs/funky-ai/pipeline/context.json (assess.runAt)

funky estimate --context
# → igual, pero antes valida que assess.runAt exista en context.json
# → si no existe, ERROR y no genera nada
```

**¿Quién pasa `--context`?** Nunca el usuario directo. Lo pasa automáticamente `funky pipeline assess` y `funky pipeline estimate`. El usuario que usa pipeline nunca ve el flag — es un detalle de implementación.

---

## Escenarios de uso

### Escenario 1 — Pipeline completo (recomendado)

```bash
# 1. Inicializar proyecto
funky init
# → docs/funky-ai/canvas/ creado

# 2. Sesión humano+IA para llenar canvases
# (el equipo discute stack, rationale, alternativas)

# 3. Pipeline completo de una sola invocación
funky pipeline all
# → pipeline assess: docs/funky-ai/assess/ creado
# → pipeline estimate: docs/funky-ai/estimate/ creado
# → docs/funky-ai/pipeline/context.json actualizado

# 4. Ver estado
funky pipeline status
# 📋 Pipeline Status
# Created: 2026-07-29T12:00:00.000Z
# Assess: Completed at 2026-07-29T12:30:00.000Z
# Estimate: Completed at 2026-07-29T13:00:00.000Z
```

### Escenario 2 — Solo assess (sin estimate)

```bash
funky init
# (llenar canvases en chat)

funky pipeline assess
# → genera guía de discusión + template de decisiones
# → context.json: assess.runAt seteado

# (sesión de discusión arquitectónica con IA)
# (documentar decisiones en docs/funky-ai/assess/architecture-decisions.md)

funky pipeline status
# 📋 Pipeline Status
# Assess: Completed
# Estimate: ⏳ Pending
```

### Escenario 3 — Comandos standalone (sin pipeline)

Útil cuando quieres regenerar solo una guía sin el estado compartido:

```bash
funky assess
# regenera architecture-review.md, sobreescribe si existe
# no crea ni toca context.json

funky estimate
# regenera pricing-guide.md + prompt IA
# no valida que assess se haya corrido antes
```

### Escenario 4 — Error: estimate sin assess previo

```bash
funky pipeline estimate
# ❌ Assess has not been run yet. Run "funky pipeline assess" first.
# → no genera nada, no toca archivos
```

### Escenario 5 — Canvases faltantes

```bash
funky init (nunca se ejecutó)

funky pipeline assess
# ⚠️ PROJECT-CANVAS.md no encontrado. Usando placeholder.
# ⚠️ INFRA-CANVAS.md no encontrado. Usando placeholder.
# ⚠️ 5 secciones sin completar detectadas.
# → genera guía igual pero con datos parciales
# → no bloquea, solo advierte
```

---

## ¿Por qué usar `funky pipeline` en vez de los comandos individuales?

### Beneficio 1 — Validación de orden

Los comandos standalone no saben si ya ejecutaste la fase anterior. `pipeline estimate` **bloquea** si assess no se ha corrido antes:

```
funky pipeline estimate
❌ Assess has not been run yet. Run "funky pipeline assess" first.
```

Con comandos standalone, nadie te detiene de estimatear canvases vacíos sin una discusión arquitectónica previa.

### Beneficio 2 — Estado compartido

context.json permite que el pipeline entienda el progreso sin tener que re-descubrir todo cada vez. `pipeline status` te da una vista rápida de dónde estás sin tener que inspeccionar directorios.

### Beneficio 3 — Un solo comando para todo

`pipeline all` ejecuta assess → estimate secuencialmente con una sola invocación. Si assess falla, estimate no corre. Sin pipeline, tendrías que:

```bash
funky assess --context
funky estimate --context  # acordarte del flag y del orden
```

### Beneficio 4 — Salida predecible

Los outputs del pipeline SIEMPRE van a `docs/funky-ai/{fase}/`. Los comandos standalone no garantizan ubicación porque pueden ejecutarse desde cualquier directorio.

---

## Limitaciones actuales

- `funky init` no está integrado al pipeline. `pipeline assess` no valida que init se haya corrido — asume que los canvases existen en `docs/funky-ai/canvas/`. Si no existen, genera placeholders y advierte.
- pipeline **no reemplaza** los comandos standalone. assess y estimate sin `--context` funcionan exactamente como hoy. Pipeline es una capa opcional de orquestación.
- context.json solo trackea metadatos. Si borrás manualmente un archivo de canvas, pipeline no lo detecta hasta que intenta leerlo y falla.
- No hay `--context` en `funky init` (no tiene sentido — init no es una fase del pipeline).
