# Observaciones: `funky init`

## 1. Proposito del sistema

`funky init` genera PROJECT-CANVAS.md, INFRA-CANVAS.md y la guia de planeacion. El flujo es deliberadamente de 2 pasos:

1. **Planeacion** (`funky init`): Genera canvases vacios + guia. El developer llena las decisiones arquitectonicas.
2. **Bootstrap** (`funky init --bootstrap`): Cuando los canvases ya existen, inyecta toda la configuracion base de Funky AI alrededor de ellos (reglas de agentes, ORCHESTRATOR-STATE, directorios engram).

> Los canvases son para **conversación dev+IA**, no para scaffolding automático. El desarrollador puede tener mini variaciones de proyecto a proyecto aunque sean del mismo stack (ej. dos proyectos Clean Architecture con carpetas distintas). El scaffolding lo hacen ellos.

---

## 2. Los 3 archivos que inyecta `funky init`

### 2a. PROJECT-CANVAS.md (generado en runtime)

Se genera vía `generateProjectCanvasMarkdown({})` en `funky-cli/src/utils/canvas.js`. Contiene 5 secciones vacías con "No definido / Pendiente":

```markdown
# 🚀 PROJECT CANVAS

## 1. Framework Base
No definido / Pendiente

## 2. Patrón Arquitectónico
No definido / Pendiente

## 3. Gestión de Estado
No definido / Pendiente

## 4. Estrategia UI
No definido / Pendiente

## 5. Estrategia de Testing
No definido / Pendiente
```

**Propósito**: Forzar decisiones fundamentales sobre el stack de frontend/aplicación antes de arrancar.

### 2b. INFRA-CANVAS.md (generado en runtime)

Mismo patrón, 4 secciones:

```markdown
# 🏗️ INFRA CANVAS

## 1. Base de Datos / ORM
No definido / Pendiente

## 2. Autenticación
No definido / Pendiente

## 3. Linter / Formatter
No definido / Pendiente

## 4. Deployment & CI/CD
No definido / Pendiente
```

**Propósito**: Forzar decisiones sobre infraestructura operacional.

### 2c. canvas-planning-guide.md (copia directa del template)

Archivo estático de 73 líneas (`funky-cli/src/templates/bootstrap/canvas-planning-guide.md`). Funciona como "menú a la carta" con opciones y trade-offs para cada sección de ambos canvases. Cada categoría tiene 3-4 opciones con una línea de contexto sobre cuándo elegir cada una.

**Es la pieza más valiosa del sistema** — los canvases sin la guía son un formulario vacío. La guía te da el contexto para tomar decisiones informadas.

---

## 3. Proceso post-llenado: Bootstrap

Cuando los canvases ya estan llenos, `funky init --bootstrap` copia toda la estructura base del ecosistema Funky AI.

### Flujo completo

```
USUARIO                          CLI
   │                               │
   ├─ funky init                   │
   │  → Crea PROJECT-CANVAS.md     │
   │  → Crea INFRA-CANVAS.md       │
   │  → Copia guia a la raiz       │
   │  → process.exit(0)            │
   │                               │
   ├─ [llena canvases con IA]      │
   │                               │
   ├─ funky init --bootstrap       │
   │  → Detecta ambos canvases ────┤
   │                               ├─ Bootstrap activado
   │                               ├─ Ejecuta runInit()
   │                               │   ├─ 9 archivos bootstrap → copiados
   │                               │   ├─ 7 directorios engram → creados
   │                               │   ├─ index.md engram → creado
   │                               │   ├─ Canvases → SALTADOS (ya existen)
   │                               │   └─ Protocolos → copiados (si los hubiera)
   │                               ├─ executeIntentions()
   │                               │   ├─ mkdir recursivo para dirs faltantes
   │                               │   ├─ copy/create solo si destino NO existe
   │                               │   └─ NUNCA sobreescribe
   │                               │
   │  ← "✅ Funky AI inicializado" │
```

### Qué inyecta `runInit()` (9 archivos + 7 directorios)

| # | Acción | Destino | Propósito |
|---|---|---|---|
| 1 | copy | `ORCHESTRATOR-STATE.md` | Estado de sesión del orquestador |
| 2 | copy | `.agents/rules/engram-protocol.md` | Protocolo de memoria para agentes |
| 3 | copy | `.agents/rules/secops.md` | Reglas de seguridad (pnpm, pinning, auditoría) |
| 4 | copy | `.agents/rules/sdd-orchestrator.md` | Identidad del orquestador, matriz de escalación |
| 5 | copy | `docs/funky-ai/cli/canvas-planning-guide.md` | Guía de planeación (referencia) |
| 6 | copy | `docs/architecture-assessment.md` | Template de evaluación NFR |
| 7 | copy | `openspec/rfcs/000-TEMPLATE.md` | Template de RFC para ideas |
| 8 | copy | `TEMPLATE_GUIDE.md` | Guía de progressive disclosure |
| 9 | copy | `README.md` | README skeleton (Architecture Hub) |
| 10-16 | mkdir | `docs/engram/{architecture,pattern,discovery,decision,bugfix,session,release}/` | Directorios de engram sharded |
| 17 | create | `docs/engram/index.md` | Índice de categorías engram |

### Comportamiento del fs-adapter

- **Nunca sobreescribe** — si el destino ya existe, lo salta y cuenta como `skipped`
- **Crea directorios padre** recursivamente antes de copy/create
- **Soporta `dryRun: true`** internamente (pero no se expone al CLI como flag)
- **No valida contenido** de los archivos que copia

### Lo que el bootstrap NO hace

- **No lee el contenido de los canvases** — `canvasConfig` se construye con `projectData: {}` y `infraData: {}` (objetos vacíos)
- **No valida completitud** — un canvas con todo en "No definido" pasa silenciosamente
- **No valida compatibilidad** — Asto + NextAuth no genera warning
- **No genera scaffolding** — no crea carpetas de arquitectura, config files, ni package.json
- **No interpola variables** — `{{project_name}}` en README queda como placeholder crudo

---

## 4. Modos del init (resumen)

| Modo | Trigger | Que hace |
|---|---|---|
| `funky init` | Default | Crea canvases vacios + guia, se detiene |
| `funky init --bootstrap` | Ambos canvases existen | Inyecta config base completa |
| Migration | Solo existe PROJECT-CANVAS | Auto-genera INFRA-CANVAS con warning |

El modo por defecto genera los canvases vacios. Cuando ya existen, `--bootstrap` inyecta toda la estructura Funky AI.

---

## 5. Áreas de mejora identificadas

### Prioritarias

| # | Severidad | Problema | Estado |
|---|---|---|---|
| 1 | HIGH | Los canvases no capturan el **"por qué"** — no hay campo de rationale, alternativas consideradas, ni condiciones de revisión | Pendiente |
| 2 | HIGH | La guía y los prompts ofrecen **opciones distintas** — la guía menciona NestJS/Express, Screaming Architecture, Vitest; el prompt no los ofrece | Pendiente |
| 3 | HIGH | 4 archivos **orphaned** en `bootstrap/` que se empaquetan pero nunca se copian | Pendiente |
| 4 | HIGH | `sync-templates.js` referencia `worker-handoff.md` que **no existe** | Pendiente |
| 5 | MEDIUM | El README tiene placeholder `{{project_name}}` que nunca se interpola | Pendiente |
| 6 | MEDIUM | El `index.md` de protocolos se copia completo (incluye protocols que no se seleccionaron) | Pendiente |
| 7 | MEDIUM | Cero tests para el path `--template` | Pendiente |
| 8 | LOW | Inconsistencia de idioma (mezcla español/inglés en guía y prompts) | Pendiente |

### Pendiente: Inclusión de nuevos templates

El sistema actualmente inyecta un conjunto fijo de 9 archivos bootstrap. **Queda pendiente evaluar e incluir nuevos templates** según las necesidades que vayan surgiendo del workflow. Algunos candidatos identificados:

- Templates de scaffolding por stack (ej. configuración específica de Next.js, Astro, etc.)
- Templates de CI/CD preconfigurados según la elección de deployment
- Templates de testing específicos según la estrategia elegida
- Templates de seguridad adicionales más allá de secops

> No se priorizan ahora — el sistema actual cubre el caso base. La inclusión de nuevos templates se hará cuando el workflow lo requiera explícitamente.
- Pendiente revisar areas de mejoras en templates como por ejemplo (stack,etc)
---

## 6. Archivos clave del código

| Archivo | Función |
|---|---|
| `funky-cli/src/commands/init.js` | Commando principal (311 líneas) |
| `funky-cli/src/utils/canvas.js` | Generadores de markdown para canvases |
| `funky-cli/src/utils/fs-adapter.js` | Ejecutor de intentions (copy/create/mkdir) |
| `funky-cli/src/templates/bootstrap/` | Templates fuente (10 archivos) |
| `funky-cli/src/templates/protocols/` | Protocolos on-demand (2 archivos) |
| `funky-cli/scripts/sync-templates.js` | Pipeline de sync monorepo → CLI |
