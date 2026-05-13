# 🧪 Guía de Testing: Flujo Completo de Funky AI CLI

> **Propósito:** Guía paso a paso para validar el ciclo de vida completo del CLI en un proyecto nuevo, desde la exploración de la idea hasta el primer commit con el ecosistema inicializado.

---

## 🗺️ Mapa del Flujo

```
[Chat virgen]  →  exploración  →  [funky estimate (Opcional)]  →  funky init  →  funky feature <name>  →  Workers  →  Release
                                                                                        └─ (Tier 4 hipercrítico) →  funky gentle <name>  →  7 Workers secuenciales  →  Release
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

## ETAPA 1.5 — Estimación de Costo y Pricing (Opcional)

**Objetivo:** Obtener un piso base orientativo para presupuestar el proyecto basándose en la complejidad de los Canvas.

### Paso 1.5.1 — Ejecutar el Estimador

Si ya tenés los archivos `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` creados, podés correr:

```bash
funky estimate
```

La CLI extraerá los factores técnicos, te hará preguntas de contexto de negocio y generará `docs/pricing-analysis.md`. Usá ese archivo en el chat del Orquestador para debatir el Value-Based Pricing final.

---

## ETAPA 2 — Preparar el Repositorio

**Objetivo:** Tener un directorio limpio y el ecosistema Funky AI inicializado.

### Paso 2.1 — Crear el directorio del proyecto

```bash
mkdir mi-nuevo-proyecto
cd mi-nuevo-proyecto
git init
```

### Paso 2.2 — Inicializar el ecosistema Funky AI

> 💡 **¿No tenés claro el stack todavía?** Ejecutá `funky init --template` primero. Te genera los Canvas vacíos y la guía de llenado. Completá los Canvas, después continuá con el paso siguiente. Ver [Escenario 1 en escenarios-de-uso.md](./escenarios-de-uso.md).

```bash
funky init
```

**Output esperado:**
```
🚀 Inicializando Funky AI...
✅ Creado: ORCHESTRATOR-STATE.md
✅ Creado: .agents/rules/engram-protocol.md
✅ Creado: .agents/rules/secops.md
✅ Creado: .agents/rules/sdd-orchestrator.md
✅ Creado: docs/engram/discoveries.md
✅ Creado: docs/engram/bugfixes.md
✅ Creado: docs/funky-ai/cli/canvas-planning-guide.md
✅ Creado: docs/funky-ai/workers/plantilla-worker-handoff.md
✅ Creado: docs/architecture-assessment.md
✅ Creado: docs/openspec/rfcs/000-TEMPLATE.md
✅ Creado: TEMPLATE_GUIDE.md
✅ Creado: README.md
✅ Creado: PROJECT-CANVAS.md (Dinámico)
✅ Creado: INFRA-CANVAS.md (Dinámico)

✅ Funky AI inicializado. 14 archivos creados, 0 ya existían.
```

### Paso 2.3 — Verificar la estructura creada

```
mi-nuevo-proyecto/
├── ORCHESTRATOR-STATE.md          ← Estado del Orquestador
├── PROJECT-CANVAS.md              ← Canvas Core: Framework, Arquitectura, Testing
├── INFRA-CANVAS.md                ← Canvas Infra: DB, Auth, Deployment
├── TEMPLATE_GUIDE.md
├── README.md
├── .agents/
│   └── rules/
│       ├── engram-protocol.md     ← Protocolo de memoria
│       ├── secops.md              ← Reglas de seguridad
│       └── sdd-orchestrator.md   ← Protocolo SDD
└── docs/
    ├── architecture-assessment.md
    ├── engram/
    │   ├── discoveries.md         ← Registro de descubrimientos
    │   └── bugfixes.md            ← Registro de bugs
    ├── funky-ai/
    │   ├── cli/
    │   │   └── canvas-planning-guide.md
    │   └── workers/
    │       └── plantilla-worker-handoff.md
    └── openspec/
        └── rfcs/
            └── 000-TEMPLATE.md
```

### Paso 2.4 — Crear la rama de feature

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

En el nuevo chat, tageá el handoff:

```
@sdd-worker-handoff.md Ejecutá tu misión.
```

### Paso 4.3 — El Worker ejecuta y escribe el reporte

El Worker debe crear o actualizar `sdd-report.md` al terminar. No debe responderte en el chat — todo va al disco.

### Paso 4.4 — Volvé al chat del Orquestador

Revisá el `sdd-report.md`. Si hay bugs documentados → registralos en `docs/engram/bugfixes.md`. Si hay descubrimientos → en `docs/engram/discoveries.md`.

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
| `funky init` | Una sola vez al crear el proyecto |
| `funky feature <name>` | Al iniciar cualquier feature SDD (Tier 1–3) — inyecta todos los templates de golpe |
| `funky gentle <name>` | Al iniciar una tarea hipercrítica (Tier 4) — inyecta los 7 templates de roles aislados |
| `funky phase explore` | Si preferís inyectar templates individualmente |
| `funky phase proposal` | Después de explorar — decisiones técnicas |
| `funky phase tasks` | Después de la propuesta — checklist de Fases |
| `funky phase worker-handoff` | Antes de cada delegación a un Worker |
| `funky phase report` | Al finalizar — el Worker lo completa |

---

## ❌ Anti-patrones a Evitar

| Anti-patrón | Por qué es un problema |
|-------------|------------------------|
| Planificar en `main` sin rama | Contamina el historial y rompe Git-Ops |
| Usar el mismo chat para Orquestador y Worker | El Worker hereda contexto que interfiere con su ejecución |
| Pedirle al Worker que "te devuelva" el reporte | Lo imprime en el chat, no lo persiste en disco |
| Saltear el `funky init` y crear archivos a mano | Rompe la consistencia de versiones entre proyectos |
| Omitir el Tier en el Worker Handoff | El modelo puede sobre-arquitectar en lugar de ejecutar |
