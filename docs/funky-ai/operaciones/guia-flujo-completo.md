# 🧪 Guía de Testing: Flujo Completo de Funky AI CLI

> **Propósito:** Guía paso a paso para validar el ciclo de vida completo del CLI en un proyecto nuevo, desde la exploración de la idea hasta el primer commit con el ecosistema inicializado.

---

## 🗺️ Mapa del Flujo

```
[Chat virgen]  →  exploración  →  funky init  →  llenar canvases
                                          ↓
                                    funky init --bootstrap
                                          ↓
                              [funky assess (discusión arquitectónica)]
                                          ↓
                                 [funky estimate (sesión de pricing)]
                                          ↓
                              ┌─── [funky pipeline (opcional)] ───┐
                              │   (orquesta assess → estimate)    │
                              ↓                                   ↓
                         SDD planning (explore → propose → tasks)
                              ↓
                          Workers → Release
                          └─ Tier 4 → funky gentle → 7 Workers
```

---

## ETAPA 1 — Exploración de la Idea (Chat sin contexto)

**Objetivo:** Llegar a una decisión técnica concreta sobre qué construir.

### Paso 1.1 — Abrí un chat nuevo en blanco

No tagees ningún archivo. Este es el chat del **Orquestador**. No hay reglas activas todavía.

### Paso 1.2 — Describí el problema en lenguaje natural

```
"Quiero construir algo para [problema]. No sé si es una API, una CLI, 
una web app. Ayudame a pensar qué hacer."
```

El modelo actúa como Senior Architect. Explorá sin comprometerte todavía.

### Paso 1.3 — Cerrá la exploración con una decisión

Cuando tengas claridad, pedí:

```
"Ok, decidimos: [descripción de la solución]. 
¿Qué stack, qué arquitectura y cuáles son los riesgos principales?"
```

✅ **Criterio de salida:** Sabés qué construir, con qué tecnología y por qué.

---

## ETAPA 1.5 — Discusión Arquitectónica con Assess (Opcional)

**Objetivo:** Tener una sesión de discusión arquitectónica donde la IA actúa como peer informado, detecta riesgos, propone alternativas y ayuda a documentar decisiones.

### Paso 1.5.1 — Ejecutar el facilitador de assess

Una vez que los canvases están llenos (después de `funky init`):

```bash
funky assess
```

**Qué hace:** El CLI lee PROJECT-CANVAS.md e INFRA-CANVAS.md, inyecta una guía de discusión de 6 fases (Contexto → Preocupaciones → Preguntas Guía → Riesgos → Alternativas → Acuerdos), más un template para documentar decisiones. Sin reglas estáticas, sin validación binaria, nunca falla.

**Output esperado:**
```
📄 Guía de discusión generada → docs/architecture-review.md
📄 Template de decisiones → docs/architecture-decisions.md (si no existía)
```

### Paso 1.5.2 — Discutí la arquitectura con IA

Abrí un chat, copiá el contenido de `docs/architecture-review.md` y discutí:

- ¿El stack elegido es el correcto?
- ¿Hay riesgos ocultos (escalabilidad, costos, seguridad)?
- ¿Qué alternativas se descartaron y por qué?

✅ **Criterio de salida:** `docs/architecture-decisions.md` con decisiones documentadas, alternativas consideradas y riesgos aceptados.

---

## ETAPA 1.6 — Sesión de Pricing Colaborativa (Opcional)

**Objetivo:** Discutir valor real, costos y trade-offs de pricing en una sesión humano+IA, basada en decisiones arquitectónicas documentadas.

> 💡 **Prerrequisito:** Si querés que estimate incorpore las decisiones del assess, corré `funky assess` primero (ETAPA 1.5).

### Paso 1.6.1 — Ejecutar el facilitador de pricing

```bash
funky estimate
```

**Qué hace:** El CLI inyecta una guía de discusión de pricing basada en los canvases del proyecto y (si existe) el archivo de decisiones del assess. No hay fórmulas hardcodeadas — el CLI no calcula nada. Genera:

- `docs/pricing-guide.md` — guía de discusión con factores de costo, contexto del proyecto y preguntas guía
- `docs/pricing-decisions.md` — template para documentar los acuerdos de pricing
- Un prompt IA en español neutro para iniciar la sesión en el chat

**Output esperado:**
```
📄 Guía de pricing generada → docs/pricing-guide.md
📄 Template de decisiones → docs/pricing-decisions.md
🤖 Prompt IA listo para copiar al chat
```

### Paso 1.6.2 — Abrí el chat con el prompt IA

Copiá el prompt que `funky estimate` imprime en consola, pegálo en un chat con la IA y discutí:

- Costo real de las decisiones arquitectónicas
- Alternativas más económicas (si las hay)
- Trade-offs entre precio y performance
- Value-Based Pricing final

✅ **Criterio de salida:** Tenés `docs/pricing-decisions.md` con los acuerdos documentados.

**Objetivo:** Tener una sesión de discusión arquitectónica donde la IA actúa como peer informado, detecta riesgos, propone alternativas y ayuda a documentar decisiones.

### Paso 1.6.1 — Ejecutar el facilitador de assess

Una vez que los canvases están llenos (después de `funky init`):

```bash
funky assess
```

**Qué hace:** El CLI lee PROJECT-CANVAS.md e INFRA-CANVAS.md, inyecta una guía de discusión de 6 fases (Contexto → Preocupaciones → Preguntas Guía → Riesgos → Alternativas → Acuerdos), más un template para documentar decisiones. Sin reglas estáticas, sin validación binaria, nunca falla.

**Output esperado:**
```
📄 Guía de discusión generada → docs/architecture-review.md
📄 Template de decisiones → docs/architecture-decisions.md (si no existía)
```

### Paso 1.6.2 — Discutí la arquitectura con IA

Abrí un chat, copiá el contenido de `docs/architecture-review.md` y discutí:

- ¿El stack elegido es el correcto?
- ¿Hay riesgos ocultos (escalabilidad, costos, seguridad)?
- ¿Qué alternativas se descartaron y por qué?

✅ **Criterio de salida:** `docs/architecture-decisions.md` con decisiones documentadas, alternativas consideradas y riesgos aceptados.

---

## ETAPA 2 — Preparar el Repositorio

**Objetivo:** Tener un directorio limpio y el ecosistema Funky AI inicializado.

### Paso 2.1 — Crear el directorio del proyecto

```bash
mkdir mi-nuevo-proyecto
cd mi-nuevo-proyecto
git init
```

### Paso 2.2 — Generar los canvases

> 💡 **¿No tenés claro el stack todavía?** Primero pasá por la ETAPA 1 de exploración para definir qué construir.

```bash
funky init
```

**Output esperado:**
```
🚀 Funky AI — Inicializando...
✅ Creado: PROJECT-CANVAS.md
✅ Creado: INFRA-CANVAS.md
✅ Creado: canvas-planning-guide.md

📘 Canvases generados. Completa PROJECT-CANVAS.md e INFRA-CANVAS.md
   usando canvas-planning-guide.md como referencia.
   Luego ejecuta `funky init --bootstrap` para inicializar el ecosistema completo.
```

### Paso 2.3 — Llenar los canvases (discusión con IA)

Usá `canvas-planning-guide.md` como referencia y completá PROJECT-CANVAS.md e INFRA-CANVAS.md. La mejor forma es discutir cada sección con la IA en el chat, aprovechando las preguntas guía y Architect Notes incorporadas en los templates.

✅ **Criterio de salida:** Ambos canvases tienen valores concretos en todos los campos (sin `[Responde aquí]`).

### Paso 2.4 — Inicializar el ecosistema completo

Con los canvases llenos, ejecutá `--bootstrap` para copiar toda la estructura del ecosistema Funky AI:

```bash
funky init --bootstrap
```

**Output esperado:**
```
🚀 Inicializando estructura completa del ecosistema...
✅ Creado: .agents/rules/engram-protocol.md
✅ Creado: .agents/rules/secops.md
✅ Creado: .agents/rules/secops-setup.md
✅ Creado: .agents/rules/sdd-orchestrator.md
✅ Creado: docs/engram/index.md
✅ Creado: docs/engram/architecture/
✅ Creado: docs/engram/pattern/
✅ Creado: docs/engram/discovery/
✅ Creado: docs/engram/decision/
✅ Creado: docs/engram/bugfix/
✅ Creado: docs/engram/discoveries.md
✅ Creado: docs/engram/bugfix/bugfixes.md
✅ Creado: docs/funky-ai/cli/canvas-planning-guide.md
✅ Creado: docs/funky-ai/workers/plantilla-worker-handoff.md
✅ Creado: docs/architecture-assessment.md
✅ Creado: docs/architecture-assessment-guide.md
✅ Creado: openspec/rfcs/000-TEMPLATE.md
✅ Creado: TEMPLATE_GUIDE.md
✅ Creado: README.md

✅ Funky AI inicializado. ~20 archivos/directorios creados.
```

### Paso 2.5 — Verificar la estructura creada

```
mi-nuevo-proyecto/
├── ORCHESTRATOR-STATE.md          ← Estado del Orquestador
├── PROJECT-CANVAS.md              ← Canvas Core: Framework, Arquitectura, Testing
├── INFRA-CANVAS.md                ← Canvas Infra: DB, Auth, Deployment
├── canvas-planning-guide.md       ← Guía de referencia para llenar canvases
├── TEMPLATE_GUIDE.md
├── README.md
├── .agents/
│   └── rules/
│       ├── engram-protocol.md     ← Protocolo de memoria
│       ├── secops.md              ← Reglas de seguridad
│       ├── secops-setup.md        ← Setup inicial de seguridad
│       └── sdd-orchestrator.md    ← Protocolo SDD
└── docs/
    ├── architecture-assessment.md
    ├── architecture-assessment-guide.md
    ├── engram/
    │   ├── index.md               ← Índice tabla de todos los engramas
    │   ├── architecture/          ← Decisiones de arquitectura
    │   ├── pattern/               ← Patrones establecidos
    │   ├── discovery/             ← Hallazgos y evaluaciones
    │   ├── discoveries.md         ← Registro plano de descubrimientos
    │   ├── decision/              ← Decisiones con impacto en el proyecto
    │   └── bugfix/
    │       └── bugfixes.md        ← Bugs corregidos
    ├── funky-ai/
    │   ├── cli/
    │   │   └── canvas-planning-guide.md
    │   └── workers/
    │       └── plantilla-worker-handoff.md
    └── openspec/
        └── rfcs/
            └── 000-TEMPLATE.md
```

### Paso 2.6 — Crear la rama de feature

> ⚠️ NUNCA planifiques ni ejecutes Workers estando en `main`.

```bash
git add -A
git commit -m "chore: init funky ai ecosystem"
git checkout -b feature/nombre-de-la-feature
```

---

## ETAPA 3 — Planificación SDD (Orquestador)

**Objetivo:** Materializar el plan como archivos físicos en disco.

### Paso 3.1 — Inyectar el template de exploración

Dentro del directorio del proyecto:

```bash
funky phase explore
```

Esto crea `sdd-explore.md` en el directorio actual. Completá el archivo con el contexto de la exploración de la Etapa 1.

### Paso 3.2 — Inyectar el template de propuesta

```bash
funky phase proposal
```

Esto crea `sdd-proposal.md`. Completá: Contexto, Decisiones Técnicas, Stack, Riesgos.

### Paso 3.3 — Inyectar el template de tareas

```bash
funky phase tasks
```

Esto crea `sdd-tasks.md`. Dividí el trabajo en Fases ejecutables por Workers.

### Paso 3.4 — Crear el Worker Handoff para la primera Fase

```bash
funky phase worker-handoff
```

Esto crea `sdd-worker-handoff.md`. Completá la sección **La Misión** con las acciones quirúrgicas exactas de la Fase 1.

✅ **Criterio de salida:** Tenés 4 archivos físicos con el plan completo en disco.

---

## ETAPA 4 — Ejecución (Workers)

**Objetivo:** Delegar la ejecución a Workers en chats separados.

### Paso 4.1 — Abrir un chat nuevo (el Worker)

> ⚠️ NO uses el mismo chat del Orquestador. El Worker necesita contexto limpio.

### Paso 4.2 — Inyectar el contexto al Worker

En el nuevo chat, llamá al workflow de Antigravity tageando el handoff:

```
/funky-worker @sdd-worker-handoff.md Ejecutá la Fase N
```

### Paso 4.3 — El Worker ejecuta y escribe el reporte

El Worker debe crear o actualizar `sdd-report.md` al terminar. No debe responderte en el chat — todo va al disco.

### Paso 4.4 — Volvé al chat del Orquestador

Revisá el `sdd-report.md`. Si hay hallazgos o bugs documentados → registralos en el Engram usando `funky engram add --tag "[tag]" --category <categoría> --desc "..."` (categorías: `architecture`, `pattern`, `discovery`, `decision`, `bugfix`).

Repetí los pasos 3.4 → 4.4 para cada Fase del `sdd-tasks.md`.

---

## ETAPA 5 — Release

**Objetivo:** Cerrar la feature y limpiar el openspec.

### Paso 5.1 — Commit final y merge

```bash
git add -A
git commit -m "feat: [descripción de la feature]"
git checkout main
git merge --no-ff feature/nombre-de-la-feature -m "release: vX.Y.Z - [descripción]"
git tag -a vX.Y.Z -m "release: vX.Y.Z"
```

### Paso 5.2 — Actualizar ORCHESTRATOR-STATE.md

Actualizá la versión, las tareas completadas y el historial de versiones.

### Paso 5.3 — Limpiar el openspec (opcional pero recomendado)

Eliminá los archivos `sdd-*.md` del directorio raíz una vez mergeado. Son artefactos de proceso, no código productivo.

---

## 🔁 Referencia Rápida de Comandos

| Comando | ¿Cuándo usarlo? |
|---------|-----------------|
| `funky init` | Una sola vez al crear el proyecto. Sin flags genera canvases vacíos + guía; `--bootstrap` copia el ecosistema completo |
| `funky assess` | Después de llenar los canvases — facilita una discusión arquitectónica y genera template de decisiones |
| `funky estimate` | Después del assess (o con canvases llenos) — facilita una sesión de pricing colaborativa |
| `funky pipeline all` | Alternativa a ejecutar assess + estimate manualmente — los orquesta en secuencia con estado compartido |
| `funky pipeline status` | Consulta el estado del pipeline (qué fases se ejecutaron) |
| `funky feature <name>` | Al iniciar cualquier feature SDD (Tier 1–3) — inyecta templates de planificación |
| `funky gentle <name>` | Al iniciar una tarea hipercrítica (Tier 4) — inyecta los 7 templates de roles aislados |
| `funky phase explore` | Template individual de exploración SDD |
| `funky phase proposal` | Template individual de propuesta técnica |
| `funky phase tasks` | Template individual de desglose de tareas |
| `funky phase worker-handoff` | Template individual de handoff para Workers |
| `funky phase report` | Template de reporte de Worker |
| `funky engram add` | Registrar un hallazgo, decisión o bug en la memoria persistente |

---

## ❌ Anti-patrones a Evitar

| Anti-patrón | Por qué es un problema |
|-------------|------------------------|
| Planificar en `main` sin rama | Contamina el historial y rompe Git-Ops |
| Usar el mismo chat para Orquestador y Worker | El Worker hereda contexto que interfiere con su ejecución |
| Pedirle al Worker que "te devuelva" el reporte | Lo imprime en el chat, no lo persiste en disco |
| Saltear el `funky init` y crear archivos a mano | Rompe la consistencia de versiones entre proyectos |
| Omitir el Tier en el Worker Handoff | El modelo puede sobre-arquitectar en lugar de ejecutar |
