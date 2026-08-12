## Resumen de una línea por fase

| Fase | Pregunta central |
|------|-----------------|
| **init (canvas)** | ¿Qué construimos y cómo? |
| **assess** | ¿Las decisiones del canvas son arquitectónicamente coherentes con el brief? |
| **estimate** | ¿Cuánto cuesta construir lo que el canvas define, dados sus riesgos operativos? |

---

## Fase 1: init (canvas)

### Qué hace
- Define el producto: usuarios, caso de uso principal, KPIs, escala y fases (`brief-funcional.md`).
- Define el stack técnico: framework, patrón arquitectónico, estado, UI y testing (`PROJECT-CANVAS.md`).
- Define las decisiones operativas: DB, auth, linter, despliegue (`INFRA-CANVAS.md`).
- Registra correcciones aprobadas en sesiones de diseño previas con marca `✅ Aprobado`.

### Qué NO hace
- No evalúa si las decisiones son coherentes entre sí (eso es assess).
- No estima costos ni define el equipo (eso es estimate).
- No levanta riesgos operativos ni buffers de contingencia.

### Output
`brief-funcional.md`, `PROJECT-CANVAS.md`, `INFRA-CANVAS.md` con decisiones documentadas.

---

## Fase 2: assess

### Qué hace
- Lee el brief y los canvases como un sistema único.
- Analiza el diseño bajo **Los 4 Ejes de Validación Arquitectónica**:
  1. **Sobreingeniería:** Decisiones técnicas que exceden por mucho el volumen y KPIs del brief (K8s para un CRUD interno).
  2. **Decisiones de datos incorrectas:** Ej. persistir blobs pesados en DB relacional, calcular métricas on-the-fly sin pre-cómputo.
  3. **Incompatibilidades estructurales:** Fallas que producirían un bug, deploy roto o que impidan escalar independientemente del costo.
  4. **Hipótesis de negocio dudosas:** KPIs que el canvas elegido no puede soportar, o proyecciones de escala que contradicen la infraestructura.
- **Valida la viabilidad técnica de requisitos complejos** (multi-tenancy, concurrencia, seguridad) para asegurar que el diseño soporte estos requisitos.
- **Manejo del Risk Patterns (Read-Only):** Usa el `risk-patterns.md` (inyectado por el CLI) como barrido de completitud *al final* del análisis interno, no al inicio, para no sesgar. **NO escribe en este archivo**. Si detecta nuevos anti-patrones, los propone al cierre de la sesión para que el humano evalúe llevarlos al repo del CLI.
- **Aplica correcciones (Patch):** Si detecta una falla crítica (ej. Mongo para transacciones complejas), DEBE actualizar el `PROJECT-CANVAS.md` o `INFRA-CANVAS.md` con aprobación del humano, para mantenerlos como la Única Fuente de Verdad (SSOT) y evitar el "Split Brain".
- Usa `architecture-decisions.md` también como un *changelog* o bitácora para justificar los cambios hechos a los canvases.

### Qué NO hace
- **No define buffers de tiempo/costo** por complejidad (ej. "el multi-tenant nos tomará 20% más") → eso lo cubre `estimate` con sus flags.
- **No evalúa seniority ni composición del equipo** → eso lo cubre `estimate` con `--roles`.
- **No estima costos**.
- No re-abre decisiones marcadas como `✅ Aprobado` en los canvases, *salvo* que encuentre una incompatibilidad estructural directa.
- No modifica `brief-funcional.md` (requisitos de negocio) ni `risk-patterns.md`.

### Criterio de pertenencia a assess (test rápido)
> Si el problema, de no corregirse, produce un bug o un diseño fundamentalmente roto → es de assess.
> Si el problema agrega costo o complejidad operativa que puede mitigarse con un buffer → es de estimate.

### Output
`architecture-decisions.md` con decisiones arquitectónicas aprobadas.

---

## Fase 3: estimate

### Qué hace
- Lee brief, canvases y `architecture-decisions.md` como insumos.
- Define el **modelo de pricing** (Fixed-Price vs Time & Materials).
- Evalúa **variables de negocio**: contexto geográfico, tamaño de empresa, CapEx vs OpEx, ROI del cliente.
- Estima el **costo base del MVP** por factores: infra, complejidad técnica, equipo (seniority, tamaño, dedicación), timeline.
- Calcula el **TCO recurrente** como rubro separado del precio de venta.
- Aplica **buffers de contingencia por flag** (`--multi-tenant`, `--security`, `--concurrency`, `--integrations`, `--roles`, `--transactions`, `--observability`, `--e2e-testing`). Aquí se cobra el esfuerzo de implementar las arquitecturas complejas validadas por `assess`. Cada flag añade un +10%–+25% sobre el costo base según la complejidad.
- Registra cada decisión aprobada en `pricing-decisions.md` con su impacto en el presupuesto.

### Qué NO hace
- **No re-valida decisiones arquitectónicas** — eso ya lo hizo assess.
- No re-debate el stack técnico ni el patrón arquitectónico.
- No evalúa si el brief y el canvas son coherentes (eso es assess).
- No modifica `brief-funcional.md`, los canvases ni `architecture-decisions.md`.

### Output
`pricing-decisions.md` con la tabla de cotización: Costo Base + Buffer de Riesgo + Margen = Precio de Venta del MVP, y TCO mensual por separado.

---

## Mapa de responsabilidades por tema

| Tema | canvas | assess | estimate |
|------|--------|--------|----------|
| Definir el producto y el stack | ✅ | — | — |
| Coherencia brief ↔ canvas | — | ✅ | — |
| Sobreingeniería del stack | — | ✅ | — |
| Incompatibilidades arquitectónicas | — | ✅ | — |
| Multi-tenancy operativo y aislamiento de datos | ✅ (Define si aplica) | ✅ (Valida patrón arquitectónico, ej. RLS) | ✅ `--multi-tenant` (Cobra el esfuerzo) |
| Seguridad y autenticación | ✅ (Define requisito) | ✅ (Valida que el Auth Provider embone) | ✅ `--security` (Buffer de costo) |
| Concurrencia, colas, workers | ✅ (Define si hay volumen) | ✅ (Valida diseño asíncrono/DB locks) | ✅ `--concurrency` (Buffer de costo) |
| Integraciones externas | ✅ (Lista de APIs) | ✅ (Valida rate limits y webhooks) | ✅ `--integrations` (Buffer de costo) |
| Observabilidad y E2E Testing | — | — | ✅ `--observability`, `--e2e-testing` |
| Seniority y composición del equipo | — | — | ✅ `--roles` |
| Costo base del MVP | — | — | ✅ |
| Buffers de contingencia | — | — | ✅ |
| TCO recurrente | — | — | ✅ |

> ℹ️ **Sobre la complejidad progresiva:** `assess` resuelve el **cómo** técnico (ej. si hay multi-tenant, valida la arquitectura de la base de datos). `estimate` asume que el diseño ya es correcto gracias a `assess`, y usa los flags exclusivamente para **calcular el costo de implementar** esa complejidad. Si es un MVP pequeño sin multi-tenant, el flag no se usa y no hay costo extra.