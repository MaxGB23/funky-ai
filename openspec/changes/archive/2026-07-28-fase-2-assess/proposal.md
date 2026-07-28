# Propuesta: Fase 2 — Assess (Discusión Arquitectónica Humano + IA)

> **Change:** `fase-2-assess`
> **Estado:** Propuesta
> **Fecha:** 2026-07-28
> **Precedido por:** [Exploración (Engram obs #150)](https://github.com/funky-ai)
> **Depende de:** Fase 1 completada — canvases con placeholders pedagógicos y sección LLM-driven de compatibilidades

---

## Intención

El comando `funky assess` actual evalúa arquitectura con 3 reglas hardcodeadas (budget+K8s, RPS+SQLite, SLA+SingleNode), genera un prompt adversarial de "Devil's Advocate" y termina. No hay discusión, no hay intercambio de ideas, no hay contexto de los canvases. El output es un checklist binario de "pasaste o no pasaste".

**Esta fase transforma `funky assess` de evaluador binario a facilitador de discusión.** El CLI inyecta una guía de discusión arquitectónica que el equipo humano + IA usan como estructura para conversar. En vez de reglas que fallan, hay preguntas guía que exploran. En vez de un prompt adversarial, hay un marco colaborativo con fases: contexto → preocupaciones → riesgos → alternativas → acuerdos.

La filosofía es simple: **el CLI nunca resuelve nada solo — solo inyecta el material. El trabajo real pasa en la discusión entre humano + IA.**

---

## Alcance

### Incluido

| # | Mejora | Descripción |
|---|--------|-------------|
| 1 | **Flujo de assess rediseñado** | `funky assess` lee PROJECT-CANVAS + INFRA-CANVAS y genera una guía de discusión + template de decisiones. Sin dependencia del YAML de architecture-assessment.md |
| 2 | **Reglas estáticas → preguntas guía** | Las 3 reglas existentes se convierten en preguntas de exploración dentro de la guía, con el mismo poder de detección pero tono colaborativo |
| 3 | **Dynamic C2 questions** | JS genera 1-2 preguntas adicionales si los datos del assessment YAML + canvases coinciden con patrones conocidos (ej: seniority baja + infra compleja) |
| 4 | **Discussion guide template** | Nuevo template `architecture-discussion-guide.md` con estructura de 6 fases, preguntas guía estáticas, slots para preguntas dinámicas, y contexto embedido de canvases |
| 5 | **Decisions template** | Nuevo template `architecture-decisions-template.md` para que el equipo documente decisiones, alternativas descartadas, y riesgos aceptados |
| 6 | **Validación de canvases** | Si los canvases están sin editar (contienen "[Responde aquí]"), el CLI advierte que la discusión será sobre datos pobres pero continúa |
| 7 | **Reemplazar architecture-review-template.md** | El template antiguo de prompt adversarial se reemplaza por el nuevo discussion guide template |

### Excluido explícitamente

| Elemento | Razón |
|----------|-------|
| **Assessment YAML (`architecture-assessment.md`)** | Se elimina como input del CLI. La discusión se basa puramente en los canvases (PROJECT-CANVAS + INFRA-CANVAS), que ya tienen campos de contexto en sus placeholders mejorados de Fase 1. |
| **Reglas de compatibilidad estáticas en el CLI** | La sección LLM-driven compatibility de `canvas-planning-guide.md` ya instruye al agente para detectar incompatibilidades. No duplicamos eso en JS. |
| **Modo interactivo para assess** | assess no tiene prompts interactivos hoy y no los tendrá. Todo es headless: CLI inyecta → equipo discute en chat. |
| **Scoring o ratings** | No hay nota, score, ni rating. El output son decisiones documentadas, no una calificación. |
| **context.json (pipeline output)** | El formato estructurado reutilizable entre comandos se diseña en Fase 4. Por ahora assess produce archivos markdown. |
| **Integración con estimate** | assess y estimate siguen siendo comandos independientes. La integración pipeline es Fase 4. |

---

## Enfoque

### Flujo nuevo de `funky assess`

```
funky assess
  │
  ├── 1. Buscar PROJECT-CANVAS.md e INFRA-CANVAS.md
  │     ├── Location: raíz del proyecto primero, fallback a docs/
  │     ├── Si ambos faltan: warning (la discusión perderá contexto)
  │     ├── Si existen: leer contenido completo
  │     └── Validar si aún contienen "[Responde aquí]" — warning de canvas incompleto
  │
  ├── 2. Ejecutar generateGuideQuestions(canvasData)
  │     └── Convierte las 3 reglas estáticas → preguntas guía (C1 en template + C2 dinámicas)
  │     └── + Detección de patrones adicionales basados en contenido de canvases
  │
  ├── 3. Interpolar template architecture-review.md
  │     ├── Template con contexto embedido de canvases
  │     ├── Preguntas guía estáticas (C1 — en el template mismo)
  │     └── Preguntas dinámicas inyectadas (C2 — desde JS)
  │     └── Destino: .agents/prompts/architecture-review.md (sobrescribe si existe)
  │
  ├── 4. Generar docs/architecture-decisions.md
  │     ├── Template de decisiones copiado (solo si no existe)
  │     └── Destino: docs/architecture-decisions.md
  │
  └── 5. Print summary + instrucciones para abrir sesión de discusión
```

### Discusión vs Review: el cambio de tono

| Aspecto | Antes (review-template) | Después (discussion-guide) |
|---------|------------------------|----------------------------|
| **Tono** | Adversarial: "Devil's Advocate", "Destrozá la propuesta" | Colaborativo: "Peer informado", "Exploremos juntos" |
| **Output** | Prompt para agente de revisión | Guía para sesión de discusión |
| **Estructura** | Lista de challenges + instrucciones | 6 fases progresivas (contexto → acuerdos) |
| **Input** | Solo NFRs del YAML | Canvases completos + NFRs |
| **Destino** | Archivo de prompt que ejecuta un agente solo | Documento que el equipo + IA usan juntos en chat |
| **Evaluación** | Binaria: challenges sí/no | Exploratoria: preguntas abiertas |

### Estructura de la Discussion Guide (6 fases)

La guía de discusión organiza la conversación en fases secuenciales:

```
Fase 1: Contexto (5 min)
  ──────────────────────────────────────
  Confirmar stack elegido y NFRs.
  Leer PROJECT-CANVAS e INFRA-CANVAS.

Fase 2: Preocupaciones del Equipo (10 min)
  ──────────────────────────────────────
  ¿Qué les preocupa? ¿Dónde ven riesgos?
  ¿Hay algo que no esté claro?

Fase 3: Preguntas Guía (15 min)
  ──────────────────────────────────────
  Preguntas estáticas del template (C1):
    - Budget + Infra: ¿El presupuesto alcanza para la infraestructura elegida?
    - RPS + DB: ¿La base de datos soporta la concurrencia esperada?
    - SLA + Redundancia: ¿La arquitectura elegida cumple el SLA?
  Preguntas dinámicas de JS (C2):
    [inyectadas según datos del proyecto]

Fase 4: Riesgos Detectados (15 min)
  ──────────────────────────────────────
  La IA analiza el stack completo:
    - Incompatibilidades conocidas
    - Trade-offs no documentados
    - Riesgos operacionales

Fase 5: Alternativas (10 min)
  ──────────────────────────────────────
  Para cada riesgo, al menos una alternativa
  con pros/cons concretos.

Fase 6: Acuerdos (5 min)
  ──────────────────────────────────────
  Documentar en docs/architecture-decisions.md:
    - Decisiones finales y rationale
    - Alternativas descartadas
    - Riesgos aceptados con mitigaciones
```

### C1 + Light C2: Cómo funcionan las preguntas

**C1 — Preguntas estáticas en el template** (~80% de las preguntas):

Son parte fija del `architecture-discussion-guide.md` template. No requieren lógica JS. Son preguntas generales que la IA usa para guiar la discusión, independientemente del contenido específico de los canvases.

**C2 — Preguntas dinámicas desde JS** (~20%):

Son preguntas adicionales que `generateGuideQuestions()` produce SOLO si los datos del proyecto coinciden con patrones conocidos. Ejemplos:

| Patrón detectado en canvas | Pregunta generada |
|--------|------------------|
| Infraestructura incluye K8s/Kubernetes | "Elegiste Kubernetes. ¿Ya evaluaron los costos operativos de un clúster? En proyectos pequeños puede ser más caro que usar un PaaS." |
| Base de datos es SQLite | "SQLite es liviano pero tiene límites de concurrencia. Si el proyecto escala, ¿tienen pensado migrar a algo como PostgreSQL?" |
| Redundancia es Single Node | "Con un solo nodo, cualquier deploy o fallo causa downtime. ¿Tienen ventanas de mantenimiento o toleran downtime?" |
| Seniority del equipo es baja + infraestructura compleja | "El equipo es principalmente **Junior** y eligieron **K8s**. ¿Tienen DevOps dedicado o planean usar un PaaS que abstraiga la orquestación?" |

### Template files: contenido esperado

#### `architecture-review-template.md` (reemplaza al template anterior — mismo nombre, contenido completamente nuevo)

```
# 🗣️ Guía de Discusión Arquitectónica

> Generado por `funky assess`. Usá este documento como estructura para tu sesión
> de discusión entre el equipo y la IA.

## Contexto del Proyecto

### PROJECT-CANVAS
{{PROJECT_CANVAS_CONTENT}}

### INFRA-CANVAS
{{INFRA_CANVAS_CONTENT}}

Los NFRs se discuten durante la sesión — la IA los descubre preguntando al equipo.

## Fases de la Discusión

### Fase 1: Contexto
[Descripción de la fase + preguntas de arranque...]

### Fase 2: Preocupaciones del Equipo
...

### Fase 3: Preguntas Guía

#### Budget e Infraestructura
{{QUESTION_BUDGET_INFRA}}

#### Concurrencia y Base de Datos
{{QUESTION_RPS_DB}}

#### SLA y Redundancia
{{QUESTION_SLA_REDUNDANCY}}

{{DYNAMIC_QUESTIONS}}

### Fase 4: Riesgos Detectados
...

### Fase 5: Alternativas
...

### Fase 6: Acuerdos
Completar docs/architecture-decisions.md con los acuerdos.
```

#### `architecture-decisions-template.md` (nuevo — template auxiliar)

```
# Decisiones Arquitectónicas

> Completar durante o después de la sesión de discusión.
> Cada decisión debe incluir: qué se decidió, por qué, qué alternativas se
> consideraron, y qué riesgos se aceptaron.

## Decisiones

### [Decisión 1: Título breve]
- **Decisión:** ...
- **Rationale:** ...
- **Alternativas consideradas:** ...
- **Riesgos aceptados:** ...
- **Fecha:** {{DATE}}

### [Decisión 2: Título breve]
...
```

---

## Inputs / Outputs

### Inputs (lectura)

| Archivo | Fuente | Propósito |
|---------|--------|-----------|
| `PROJECT-CANVAS.md` (raíz o `docs/`) | Target project | Contexto de stack y decisiones de frontend con rationale |
| `INFRA-CANVAS.md` (raíz o `docs/`) | Target project | Contexto de stack operacional y arquitectura |

### Outputs (generación)

| Archivo | Contenido | Propósito |
|---------|-----------|-----------|
| `.agents/prompts/architecture-review.md` | Guía de discusión con contexto del proyecto + fases + preguntas (sobrescribe si existe) | Lo usa el equipo + IA durante la sesión de assess |
| `docs/architecture-decisions.md` | Template de decisiones vacío | Se completa durante la discusión y queda como artefacto permanente |

### Exit codes

| Código | Significado |
|--------|-------------|
| 0 | Éxito — guía y template generados |

El exit code 1 (que existía cuando había challenges) desaparece. Ya no hay "fallo" en el assess — solo discusión.

---

## Decisiones Clave

### D1. Deprecar assessment YAML — la discusión se basa solo en canvases

**Contexto:** El `architecture-assessment.md` tiene un YAML frontmatter con datos hardcodeados (budget:0, rps:0, sla:0.0) que el CLI usaba para validar contra reglas estáticas. Con la nueva filosofía de discusión, esos datos no aportan valor — la IA debe descubrir los NFRs durante la conversación.

**Decisión:** Se elimina `architecture-assessment.md` como input del CLI. El comando `funky assess` ya no lo lee ni lo valida. La discusión se basa puramente en PROJECT-CANVAS e INFRA-CANVAS. El archivo `architecture-assessment.md` existente en el proyecto del usuario no se toca — simplemente el CLI deja de referenciarlo.

**Rationale:**
- La IA en la sesión de discusión puede preguntar sobre NFRs directamente al equipo
- Los canvases tienen contexto más rico que cualquier YAML hardcodeado
- Si el usuario quiere documentar NFRs, lo hace en los canvases o durante la discusión — no a través de YAML que el CLI valida

### D2. C1 (template) + light C2 (JS) para preguntas guía

**Contexto:** Evaluamos tres enfoques: solo template (C1), solo JS (C2), o ambos.

**Decisión:** C1 + light C2. Las preguntas base (budget+infra, RPS+DB, SLA+redundancy, seniority+complejidad) vienen en el template como preguntas estáticas con placeholders. JS genera 1-2 preguntas adicionales solo si los datos coinciden con patrones específicos.

**Rationale:**
- C1 cubre el 80% de los casos sin lógica JS — las preguntas son siempre relevantes
- C2 aporta valor donde hay patrones detectables (ej: budget bajo + DB no SQLite)
- Separar toda la lógica a JS haría el sistema menos transparente y más difícil de mantener
- El template es editable por el usuario — si quiere agregar sus propias preguntas, puede

### D3. Generar discusión guide siempre, con validación

**Contexto:** ¿Generar la guía aunque los canvases estén vacíos o no existan?

**Decisión:** Siempre generar. Si los canvases no existen o contienen "[Responde aquí]", el CLI muestra una advertencia clara pero genera la guía igual (con "Canvas no disponible" como contenido). La IA detectará la falta de contexto y comenzará la discusión preguntando para llenar los vacíos.

**Rationale:**
- El equipo puede tener los canvases en otro lado o estar empezando la discusión desde cero
- La guía con NFRs solos sigue siendo útil — la IA puede preguntar "no veo los canvases, ¿me cuentan su stack?"
- Cortar el flujo con un error sería frustrante

### D4. Decisions template creado por `funky assess` (no por `funky init`)

**Contexto:** ¿Quién crea el template de decisiones? Podría ser `funky init --template` (junto a los canvases) o `funky assess` (al empezar la discusión).

**Decisión:** `funky assess` lo crea. El template de decisiones solo tiene sentido cuando hay una discusión arquitectónica — crearlo en `init` lo dejaría como archivo huérfano.

**Rationale:**
- Sigue el patrón "comando inyecta → equipo discute": assess inyecta las herramientas que la discusión necesita
- Si se creara en init, pasaría meses sin usarse y generaría confusión ("¿qué hago con este archivo?")
- Coherente con Fase 3 (estimate), que también creará su propio template

### D5. Reemplazar architecture-review-template.md (no coexistir)

**Contexto:** ¿Dejar el review template antiguo para compatibilidad o reemplazarlo?

**Decisión:** Reemplazar. El archivo `architecture-review-template.md` se elimina y su lugar lo ocupa `architecture-discussion-guide.md`.

**Rationale:**
- El review template ya no se usará — el nuevo flujo de assess genera la discussion guide
- Mantener ambos crearía ambigüedad ("¿cuál uso?")
- El review template era específico para el flujo anterior (prompt adversarial + challenges)
- Si alguien lo necesita, está en el historial de git

---

## Riesgos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-------------|---------|------------|
| R1 | **Canvases vacíos o sin editar** al ejecutar assess | Alta | Medio | Warning claro + generación continúa. La IA puede guiar la discusión para llenar vacíos. |
| R2 | **Canvases incompletos sin NFRs explícitos** — la IA no tiene datos estructurados de budget/RPS/SLA | Media | Medio | La guía embedé los canvases completos; la IA pregunta durante la discusión. La falta de NFRs estructurados se compensa con la conversación. |
| R4 | **Review budget de 400 líneas excedido** | Baja | Alto | Estimación: ~250-300 líneas delta. Ver sección de estimación abajo. |
| R5 | **Tests existentes de assessRules.js se rompen** | Alta | Medio | `evaluateAssessment()` se reemplaza por `generateGuideQuestions()`. Los tests se actualizan para probar el nuevo contrato. |

### Estimación de líneas

| Archivo | Cambio | Líneas estimadas |
|---------|--------|-----------------|
| `funky-cli/src/commands/assess.js` | Reescribir flujo: solo lee canvases (sin YAML assessment), genera guía + decisions template | ~80 (+4 neto sobre 76 actuales) |
| `funky-cli/src/utils/assessRules.js` | Refactor: `evaluateAssessment` → `generateGuideQuestions` (misma lógica de detección, output como preguntas) | ~55 (+20 neto sobre 35 actuales) |
| `funky-cli/src/templates/sdd/architecture-review-template.md` | **Reemplazar** — template de 6 fases con placeholders de canvases (reemplaza el contenido adversarial anterior) | ~80 |
| `funky-cli/src/templates/sdd/architecture-decisions-template.md` | **Nuevo** — template de decisiones | ~35 |
| `funky-cli/src/templates/sdd/architecture-review-template.md` | **Eliminar** | -22 |
| `funky-cli/tests/assess.test.js` | Agregar tests para canvas reading, discusión guide generation | ~40 |
| `funky-cli/tests/assessRules.test.js` | Actualizar tests para `generateGuideQuestions` | ~85 |
| **Total delta** | | **~257 líneas netas** |

Bien dentro del budget de 400 líneas.

---

## Archivos a modificar

### Crear

| Archivo | Propósito |
|---------|-----------|
| `funky-cli/src/templates/sdd/architecture-decisions-template.md` | Template ligero para documentar decisiones arquitectónicas: decisión, rationale, alternativas, riesgos |

### Modificar

| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/commands/assess.js` | Reescribir `action()`: (1) buscar canvases (raíz, fallback docs/), (2) validar estado, (3) generar guide questions, (4) interpolar template architecture-review.md con contexto de canvases, (5) generar decisions template, (6) imprimir resumen |
| `funky-cli/src/utils/assessRules.js` | Renombrar `evaluateAssessment()` → `generateGuideQuestions()`. Cambiar return de `challenges[]` a `{ static: [{category, question, context}], dynamic: [{category, question}] }`. Patrones basados en datos de canvas en vez de YAML. |
| `funky-cli/src/templates/sdd/architecture-review-template.md` | Reemplazar contenido adversarial por guía de discusión de 6 fases con placeholders de contexto de canvases. Mismo nombre de archivo, contenido completamente nuevo. |

### Sin cambios

| Archivo | Razón |
|---------|--------|
| `architecture-assessment.md` (template) | Ya no se referencia desde el CLI. Se deja como template standalone por si el usuario quiere documentar NFRs manualmente. |

### Tests afectados

| Archivo | Cambio |
|---------|--------|
| `funky-cli/tests/assess.test.js` | Agregar tests: `parseFrontmatter` se mantiene (sin cambios). Nuevos tests: lectura de canvases, validación de canvas vacío, generación de discussion guide, generación de decisions template. |
| `funky-cli/tests/assessRules.test.js` | Refactor completo: `evaluateAssessment` → `generateGuideQuestions`. Tests existentes se actualizan para verificar preguntas en vez de challenges. |

---

## Preguntas Abiertas

### Q1. Canvas location strategy

PROJECT-CANVAS.md e INFRA-CANVAS.md pueden estar en la raíz del proyecto o dentro de `docs/`. ¿Dónde buscamos? ¿Buscamos en ambas ubicaciones con prioridad?

**Opción A:** Solo raíz del proyecto (donde los coloca `funky init --template` hoy).
**Opción B:** Buscar en raíz primero, luego en `docs/`.
**Opción C:** Usar configuración o flag `--canvas-dir`.

> Recomendación: **Opción B** — es la más tolerante sin agregar configuración.

### Q2. Decisions template: strict vs flexible

¿El template de decisiones debe ser un formulario estructurado (campos obligatorios por decisión) o un documento libre con una sección de ejemplo?

**Opción A:** Estructurado con secciones fijas y placeholders para cada campo (decisión, rationale, alternativas, riesgos, fecha).
**Opción B:** Libre con un ejemplo de una decisión documentada y espacio para más.
**Opción C:** Checklist simple (lista de verificación de temas a cubrir).

> Recomendación: **Opción A** (estructurado). Coincide con el patrón de los templates actuales y da un formato consistente que las fases futuras (estimate, integración) pueden parsear.

### Q3. ¿Qué hacemos con un `.agents/prompts/architecture-review.md` preexistente?

**Resuelto:** Sobrescribir. El nuevo flujo genera en el mismo path (`.agents/prompts/architecture-review.md`) con el nuevo contenido de guía de discusión.
