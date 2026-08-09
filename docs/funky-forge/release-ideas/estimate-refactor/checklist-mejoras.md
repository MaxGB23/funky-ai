# Checklist de mejoras — `funky estimate` (post-smoke 2)

> **Propósito:** seguimiento físico de las mejoras derivadas del segundo smoke test de `funky estimate` (sesión real de IA: Fixed-Price $14,040 USD, TCO ~$40/mes). Se marca aquí, no depende del contexto de la conversación.
> **Fuente:** `smoke-test-observaciones2.md` (raíz del repo) + sugerencias del agente de esa sesión.
> **Estado:** ejecutado (2026-08-08) — todos los ítems implementados y verificados contra el código y los tests.

## Priorización

### ALTO — comportamiento de la sesión real

- [x] **M1 (obs 7): Flujo en 3 fases estrictas.** Reescribir la sección Fases + Inicio de `estimate-prompt-template.md` (hoy hay contradicción: Fase 3 pide "recomendar flags y buffers" pero "## Inicio" ordena "presenta el PRIMER punto de discusión (el modelo de pricing)" — el agente salta las flags) y la sección Paso Inicial de `pricing-guide-template.md`:
  - Fase 1 (Preparación): leer y analizar el contexto en silencio.
  - Fase 2 (Recomendación): proponer SOLO las flags aplicables y sus buffers. **Detenerse por completo** y pedir al humano que las inyecte con `funky estimate --flag`.
  - Fase 3 (Debate): iniciar la discusión socrática (modelo de pricing primero) SOLO tras luz verde del humano.
  - Actualizar tests de templates que verifican Fases/Inicio.

- [x] **M2 (obs 6): Unificar "Contexto de entrada".** La lista de archivos a leer está duplicada en `estimate-prompt-template.md` L15-22 y `pricing-guide-template.md` L8-15. Consolidar la lista SOLO en pricing-guide (agregar `pricing-decisions.md` a su lista — hoy la guía no lo referencia como lectura, solo como destino de escritura); `estimate-prompt-template.md` instruye únicamente "lee `pricing-guide.md` y `pricing-decisions.md`".

- [x] **M3 (obs 10): Quitar `--brief` de la tabla de flags de `pricing-guide-template.md` (L26).** Es un flag fantasma en la tabla: no es topic (sin marcador `topic:brief`, no se incrusta), no tiene buffer, y recomendarlo no agrega nada visible (el brief se auto-detecta). **El flag CLI NO se depreca**: conserva override de ruta (`--brief <path>`), checklist forzado (`--brief` sin valor, R7) y auto-detección (issue #33) — todo con tests (estimateCommand.flags.integration.test.js L328-338, estimateDomain.test.js L130-154).

### MEDIO — limpieza y UX

- [x] **M4 (obs 2): Limpiar pares de marcadores vacíos.** La zona de topics trae los 6 pares y los no usados quedan como `<!-- topic:x -->\n<!-- /topic:x -->` vacíos, que confunden al agente. Opciones: (a) eliminar los pares vacíos de la salida final en el dominio; (b) sustituirlos por un comentario único de zona tipo `<!-- topics disponibles: roles, multi-tenant, transactions, security, concurrency, integrations -->`. `detectEmbeddedTopics` ya ignora pares vacíos, así que no rompe el refresco. **Decidir (a) o (b).**

- [x] **M5 (obs 8): Referencia de tarifas base SIEMPRE en la guía.** El agente inventó el Costo Base ($8,000) porque sin `--pricing-team` no hay quién ni tarifa. Incluir una tabla base de tarifas por rol (Senior/Mid/Jr, USD/hora) en `pricing-guide-template.md` para que el cálculo del Costo Base use números; `--pricing-team` la enriquece con los rangos reales del equipo. **Definir rangos base por defecto** y revisar la relación con `--pricing-team` (qué aporta cada uno).

- [x] **M6 (obs 1): Eliminar warnings obsoletos de `estimate.js`.** `decisions` (L66) es variable muerta: solo alimenta el warning "Generando guía con contenido parcial" que ya es FALSO post-refactor (la guía referencia archivos, no embebe contenido). Los "Usando placeholder" de canvases (L73-76) tampoco describen la realidad actual. Reescribir como avisos útiles ("archivo referenciado no existe, la IA preguntará el contexto") o eliminar. Mantener el aviso de `unfilledCount` (sí es informativo).

- [x] **M7 (obs 3): Summary con estado por archivo.** Hoy: "⚡ Omitiendo (ya existe): estimate-prompt.md" y luego "✅ Material de pricing generado exitosamente" con los 3 archivos listados sin estado. Mostrar estado por archivo (creado / conservado / omitido) o matizar el título ("listo: N creados, M conservados").

- [x] **M10: Revisión rápida de limpieza y UX de `init` y `assess`.** Aplicar el mismo criterio que M6/M7 a init.js/assess.js y sus templates: warnings obsoletos o engañosos, variables muertas, mensajes contradictorios ("generado" cuando hubo omisiones), summary con estado por archivo. Solo limpieza y UX — sin cambio de comportamiento.

- [x] **M11 AÑADIDO POR HUMANO EN PARALELO (análisis de arquitectura): Warns de `estimate.js` con comando correctivo.** init/assess NO son bloqueantes en flujo directo (estimate degrada con placeholders/contenido parcial), pero los warns actuales (L73-78 "Usando placeholder") no dicen cómo resolverlo — inconsistencia con `assess.js` que sí dice "créalo con `funky init`" (L61/65). Añadir el comando correctivo a los warns de estimate: canvases/brief → "ejecuta `funky init`"; `architecture-decisions.md` → "ejecuta `funky assess`". Sin cambio de comportamiento. (Evaluación `funky pipeline`: MANTENER — orquestador con estado + --json CI + 546 líneas de tests; deprecar sería change SDD con issue, no micro-cambio.)

- [x] **M12 (añadido post-PR, revisión del autor): Tabla de Costo Operativo Mensual en `pricing-decisions-template.md`.** El smoke 2 documentó el bloque "Costo Operativo Mensual (Infraestructura)" (Vercel ~$20, Neon ~$20, Inngest $0 → ~$40/mes) pero la plantilla de decisiones solo lo mencionaba como nota al pie. Agregar la tabla con componentes y Total Mensual Estimado, dejando claro que el OpEx no se incluye en la factura de desarrollo. Fuente: `smoke-test-observaciones2.md` L59-67.

### BAJO — avisos y brief

- [x] **M8 (obs 5): Aviso cuando NO hay brief.** `estimate.js` L121-125 solo loguea cuando SÍ detecta el brief de init; sin `brief-funcional.md` y sin `--brief` no hay aviso ni sección (el agente termina preguntando según la guía). Agregar aviso info ("no se encontró brief-funcional.md, la IA preguntará el contexto de negocio") cuando no hay brief y no se pasó `--brief`.

- [x] **M9 (obs 9): KPI a lana en el brief de init.** El template `brief-funcional.md` (init) ya tiene "KPI o Éxito del Producto" (L61-64) pero no su equivalente monetario. Agregar pregunta opcional: "¿Cuánto le cuesta este problema hoy al cliente (horas/dinero)?" — alimenta la variable de negocio ROI/valor del pricing-guide. Solo aplica a inits NUEVOS (brief es kind 'decision', no se sobrescribe).

## Decidido (sin acción)

- **Obs 4**: `estimate --flag` inyecta la guía declarativa completa + la sección del flag. No deseado en diseño, pero el usuario VALIDA el funcionamiento actual. No se cambia.

## Trazabilidad

| Observación / sugerencia | Ítem |
|---|---|
| 1 (warnings contenido parcial/placeholder) | M6 |
| 2 (marcadores vacíos) | M4 |
| 3 (mensaje "generado" vs "omitido") | M7 |
| 5 (brief no detectado) | M8 |
| 6 (contexto de entrada duplicado) | M2 |
| 7 (pausa tras recomendar flags) | M1 |
| 8 (quién en el Costo Base) | M5 |
| 9 (KPI a lana en brief) | M9 |
| 10 (--brief flag fantasma) | M3 |
| 4 (funcionamiento validado) | — (decidido) |
| smoke 2 L59-67 (costo operativo mensual en tabla de cotización) | M12 |
| — (análisis flujo init→assess→estimate) | M11 |
