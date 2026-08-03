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
| PROJECT-CANVAS.md | `docs/funky-ai/canvas/PROJECT-CANVAS.md` | Sí (usa placeholder si falta) |
| INFRA-CANVAS.md | `docs/funky-ai/canvas/INFRA-CANVAS.md` | Sí (usa placeholder si falta) |
| architecture-decisions.md | `docs/funky-ai/assess/architecture-decisions.md` | No (advierte si falta) |
| Template: pricing-guide-template.md | `funky-cli/src/templates/estimate/pricing-guide-template.md` | Interno |
| Template: pricing-decisions-template.md | `funky-cli/src/templates/estimate/pricing-decisions-template.md` | Interno |
| Template: brief-questions-template.md | `funky-cli/src/templates/estimate/brief-questions-template.md` | Interno (sección `--brief`) |
| Templates: topics/*.md | `funky-cli/src/templates/estimate/topics/` | Interno (6 secciones opcionales editables, R14) |
| Template: team-cost-reference-template.md | `funky-cli/src/templates/estimate/team-cost-reference-template.md` | Interno (sección `--pricing-team`) |

Si los canvases contienen secciones sin completar (`[Responde aquí]`), se muestra una advertencia indicando cuántas están pendientes.

## Sugerencias

`funky estimate` detecta señales de tópicos (roles, multi-tenant, transacciones, seguridad, concurrencia, integraciones) en los canvases y en las decisiones arquitectónicas. Por cada tópico con señal detectada cuyo flag NO se pasó, imprime en consola una sugerencia como:

`💡 Se detectó Seguridad (jwt). Considerá --security para incluir su sección en la guía.`

Las sugerencias son SOLO de consola: nunca agregan secciones a la guía automáticamente. Para incluir una sección hay que pasar su flag explícitamente.

## Outputs

| Output | Ruta | Descripción |
|---|---|---|
| pricing-guide.md | `docs/funky-ai/estimate/pricing-guide.md` | Guía de discusión con contexto del proyecto, factores de costo y estructura de sesión. Incluye SIEMPRE la ficha de alcance ("¿Aplica en esta fase?") con el estado de los 6 tópicos. Las secciones opcionales (brief, tópicos, referencia de costos de equipo) se incluyen solo cuando se pasan sus flags. Artefacto derivado: se regenera (sobrescribe) en cada ejecución. |
| pricing-decisions.md | `docs/funky-ai/estimate/pricing-decisions.md` | Template para documentar acuerdos de pricing durante la sesión colaborativa. Doc vivo del equipo: no se sobrescribe si ya existe. |
| stdout | Consola | Prompt completo para la IA (banner + cuerpo + footer), resumen con rutas generadas y secciones incluidas, y sugerencias de tópicos detectados (R11). |

Con `--context`, además actualiza `docs/funky-ai/pipeline/context.json` registrando el timestamp de ejecución en `estimate.runAt`.

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
                    │  Interpolar templates│
                    │  → pricing-guide.md  │
                    │  → pricing-decisions │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Escribir archivos   │
                    │  guía: sobrescribe   │
                    │  decisiones: no      │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Actualizar context  │
                    │  (si --context)      │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  stdout: banner +    │
                    │  prompt IA + footer  │
                    └──────────────────────┘
```

## Flags

| Flag | Tipo | Descripción |
|---|---|---|
| `--context`, `-c` | `<path>` | Ruta a `context.json` para integración con pipeline. Activa lectura de ruta de decisiones desde el contexto y registro del timestamp de ejecución. |
| `--brief` | `[path]` | Sin valor: embebe el checklist de preguntas del brief funcional. Con valor: embebe el contenido de ese archivo. Si el archivo no existe, advierte y usa el checklist de todas formas. |
| `--roles` | boolean | Incluye la sección "Roles del equipo" en la guía. |
| `--multi-tenant` | boolean | Incluye la sección "Multi-tenant" en la guía. |
| `--transactions` | boolean | Incluye la sección "Transacciones" en la guía. |
| `--security` | boolean | Incluye la sección "Seguridad" en la guía. |
| `--concurrency` | boolean | Incluye la sección "Concurrencia" en la guía. |
| `--integrations` | boolean | Incluye la sección "Integraciones" en la guía. |
| `--pricing-team` | boolean | Incluye la referencia de costos de equipo (rol × seniority × dedicación × duración). Solo referencia, no es una calculadora. |

La ficha de alcance ("¿Aplica en esta fase?") se incluye SIEMPRE en la guía, sin flag: no es configurable desde la CLI. Las secciones opcionales (brief, tópicos, referencia de costos) solo se incluyen cuando se pasan sus flags.

## Próximos pasos

Después de ejecutar `funky estimate`, el usuario debe:

1. Copiar el prompt de IA impreso en consola y usarlo en la sesión de IA del proyecto. El prompt referencia `docs/funky-ai/estimate/pricing-guide.md` y `docs/funky-ai/estimate/pricing-decisions.md`; la IA puede leer esos archivos directamente.
2. La IA guía la discusión de pricing basada en los materiales generados.
3. Documentar los acuerdos en `pricing-decisions.md` durante la discusión colaborativa.
