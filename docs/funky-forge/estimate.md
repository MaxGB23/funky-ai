# funky estimate — Cost Estimation

## ¿Qué problema resuelve?

Estimar costos de infraestructura y servicios basados en las decisiones de arquitectura del proyecto. Cruza los datos de `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con las decisiones arquitectónicas para generar una guía de discusión de pricing y un template donde documentar los acuerdos de costos.

## ¿Cuándo usarlo standalone?

Cuando ya existen decisiones arquitectónicas y canvases definidos y se necesita una sesión de pricing independiente. Recomendado para proyectos sin pipeline activo o cuando se quiere revisar costos fuera del flujo principal.

## ¿Cuándo usarlo con pipeline?

Como paso final del pipeline, después de `assess`. El flag `--context` integra la ejecución con `pipeline context.json` para mantener trazabilidad entre fases. En modo pipeline, el comando lee la ruta del archivo de decisiones desde el contexto en lugar de usar la default.

## Requisitos previos

- `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` en `docs/funky-ai/canvas/`
- `docs/funky-ai/assess/architecture-decisions.md` (recomendado, no obligatorio)
- Directorio de salida `docs/funky-ai/estimate/` se crea automáticamente si no existe

## Inputs

| Input | Ruta | Requerido |
|---|---|---|
| PROJECT-CANVAS.md | `docs/funky-ai/canvas/PROJECT-CANVAS.md` | Sí (advierte si falta; la guía lo referencia) |
| INFRA-CANVAS.md | `docs/funky-ai/canvas/INFRA-CANVAS.md` | Sí (advierte si falta; la guía lo referencia) |
| architecture-decisions.md | `docs/funky-ai/assess/architecture-decisions.md` | No (advierte si falta) |
| Template: pricing-guide-template.md | `funky-cli/src/templates/estimate/pricing-guide-template.md` | Interno |
| Template: pricing-decisions-template.md | `funky-cli/src/templates/estimate/pricing-decisions-template.md` | Interno |
| Template: brief-questions-template.md | `funky-cli/src/templates/estimate/brief-questions-template.md` | Interno (sección `--brief`) |
| Templates: topics/*.md | `funky-cli/src/templates/estimate/topics/` | Interno (6 secciones opcionales editables, R14) |
| Template: team-cost-reference-template.md | `funky-cli/src/templates/estimate/team-cost-reference-template.md` | Interno (sección `--pricing-team`) |

Si los canvases contienen secciones sin completar (`[Responde aquí]`), se muestra una advertencia indicando cuántas están pendientes.

## Outputs

| Output | Ruta | Descripción |
|---|---|---|
| pricing-guide.md | `docs/funky-ai/estimate/pricing-guide.md` | Guía de discusión declarativa con contexto del proyecto (referencias a brief, canvases y decisiones), factores de costo, buffers, TCO y estructura de sesión. Las secciones de flags (tópicos) se incrustan por marcadores `<!-- topic:x -->` arriba de `## Estructura de Discusión`. Es una GUÍA (no un derivado regenerable): la incrustación es ADITIVA y conserva las secciones previas (ver contrato de feedback abajo). |
| estimate-prompt.md | `docs/funky-ai/estimate/estimate-prompt.md` | Prompt para iniciar la sesión de IA del proyecto (guía kind guide, patrón de assess). Se copia desde el template; si ya existe, confirma Y/N antes de reemplazar (default `n` sin TTY). |
| pricing-decisions.md | `docs/funky-ai/estimate/pricing-decisions.md` | Template para documentar acuerdos de pricing durante la sesión colaborativa. Doc vivo del equipo: no se sobrescribe si ya existe. |
| stdout | Consola | Terminal limpia: resumen con estado por archivo (creado/conservado/generado), rutas y secciones incluidas, checks y warnings. Los warnings de archivos faltantes indican el comando correctivo (`funky init` para brief/canvases, `funky assess` para decisiones arquitectónicas). NO imprime el prompt gigante (el material vive en estimate-prompt.md). |

Con `--context`, además actualiza el estado de fase v2 en `docs/funky-ai/pipeline/context.json`: `estimate.status: 'completed'`, `startedAt`, `finishedAt`, `durationMs`, `artifacts` y `runAt`.

## Contrato de feedback por archivo

| Archivo | Comportamiento | Exit |
|---|---|---|
| `pricing-guide.md` nuevo | Se crea con las secciones de flags solicitadas incrustadas por marcador, sin preguntar (aditivo puro) | 0 |
| `pricing-guide.md` — flag NUEVO | Incrusta solo su sección (aditiva), conserva las previas, orden canónico, sin preguntar | 0 |
| `pricing-guide.md` — flag existente sin cambios | Idempotente: no duplica ni toca la sección | 0 |
| `pricing-guide.md` — template base o fragmento de topic cambió | Y/N con advertencia; `y` → reconstruye la base y REINCRUSTA todos los flags detectados por marcador (ninguno se pierde); `n` → conserva la guía actual (decisión válida) | 0 |
| `pricing-guide.md` — guía legacy sin marcadores | Se regenera con el template declarativo | 0 |
| `estimate-prompt.md` nuevo | Se crea sin preguntar (guía kind guide) | 0 |
| `estimate-prompt.md` existente | Y/N con advertencia de pérdida; `y` → reemplaza; `n` → conserva la versión actual (decisión válida) | 0 |
| `pricing-decisions.md` existente | No pregunta, no sobrescribe; recomienda eliminar o mover de ubicación (backup) | 0 |
| Sin terminal (CI) / `--json` | Incrustación aditiva corre (segura); actualizaciones con cambios → default `n` logueado, nunca Y/N en stdout de `--json` | 0 |
| Error real (lectura/escritura, conflicto inesperado) | Mensaje de error | 1 |

Regla clave: **nunca se pregunta cuando la operación no tiene nada que perder (aditiva). El Y/N existe únicamente para advertir pérdida potencial.**

## Diagrama de flujo

```
                    ┌──────────────────────┐
                    │  Inicio               │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  ¿--context?         │
                    │  → leer context.json │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Leer architecture-  │
                    │  decisions.md        │
                    │  (opcional)          │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Descubrir canvases  │
                    │  PROJECT / INFRA     │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  pricing-guide.md    │
                    │  ¿existe con zona de │
                    │  marcadores?         │
                    └──────┬──────┬────────┘
                   no       │      │  sí
                    ┌───────▼──┐   ┌▼───────────────────────────┐
                    │ crear con│   │ incrustar flags nuevos     │
                    │ marcadores│   │ (aditivo, sin preguntar)   │
                    └──────┬───┘   └──────┬─────────────────────┘
                           │              │  ¿drift base/fragmento?
                           │              │  → Y/N (y: reincrustar
                           │              │    todos; n: conservar)
                           │              │
                    ┌───────▼─────────────▼──┐
                    │  estimate-prompt.md    │
                    │  ¿existe? → Y/N guía   │
                    │  (default n sin TTY)   │
                    └───────┬───────────────┘
                            │
                    ┌───────▼───────────────┐
                    │  pricing-decisions.md │
                    │  (no sobrescribe)     │
                    └───────┬───────────────┘
                            │
                    ┌───────▼───────────────┐
                    │  Actualizar context   │
                    │  (si --context)       │
                    └───────┬───────────────┘
                            │
                    ┌───────▼───────────────┐
                    │  stdout: resumen con  │
                    │  rutas y secciones    │
                    └──────────────────────┘
```

## Flags

| Flag | Tipo | Descripción |
|---|---|---|
| `--context`, `-c` | `<path>` | Ruta a `context.json` para integración con pipeline. Activa lectura de ruta de decisiones desde el contexto y la escritura del estado de fase v2 (`estimate.status`/`runAt`/`artifacts`). Si el archivo no existe, error y exit 1. |
| `--brief` | `[path]` | Sin flag: auto-detecta `docs/funky-ai/canvas/brief-funcional.md` (el brief generado por `funky init`) y lo embebe si existe. Sin valor: fuerza el checklist de preguntas del brief funcional. Con valor: embebe el contenido de ese archivo. Si el archivo explícito no existe, advierte y usa el checklist de todas formas. |
| `--roles` | boolean | Incluye la sección "Roles del equipo" en la guía. |
| `--multi-tenant` | boolean | Incluye la sección "Multi-tenant" en la guía. |
| `--transactions` | boolean | Incluye la sección "Transacciones" en la guía. |
| `--security` | boolean | Incluye la sección "Seguridad" en la guía. |
| `--concurrency` | boolean | Incluye la sección "Concurrencia" en la guía. |
| `--integrations` | boolean | Incluye la sección "Integraciones" en la guía. |
| `--pricing-team` | boolean | Incluye la referencia de costos de equipo (rol × seniority × dedicación × duración). Solo referencia, no es una calculadora. |

La guía corta de flags (cuándo conviene cada flag y su buffer) vive en el template base `pricing-guide-template.md`: la IA decide primero qué flags recomienda para el proyecto, antes de la discusión de pricing. Los tópicos se incrustan solo cuando se pasan sus flags; sin flags, la guía es base declarativa.

## Próximos pasos

Después de ejecutar `funky estimate`, el usuario debe:

1. Abrir `docs/funky-ai/estimate/estimate-prompt.md` y usarlo como primer mensaje en la sesión de IA del proyecto (reemplaza al prompt impreso en consola).
2. La IA guía la discusión de pricing basada en los materiales generados (`pricing-guide.md` con las secciones incrustadas y las decisiones documentadas).
3. Documentar los acuerdos en `pricing-decisions.md` durante la discusión colaborativa, punto por punto.
