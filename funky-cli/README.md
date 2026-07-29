# Funky AI CLI

## ¿Qué es Funky AI CLI?
El CLI oficial de Funky AI es la herramienta encargada de hacer andamiaje (scaffolding) de la arquitectura del proyecto, reglas canónicas, y templates del ciclo Spec-Driven Development (SDD). Elimina la configuración manual, asegurando un ecosistema estandarizado y libre de errores en cada proyecto.

## Prerequisitos
- **Node.js**: Instalado (recomendado v18 o superior).
- **pnpm**: Gestor de paquetes.
- Habilitar el uso global de pnpm ejecutando `pnpm setup` si es la primera vez que lo utilizas y reiniciar la terminal.

## Instalación
Para instalar el CLI de manera local y linkearlo globalmente:

```bash
git clone <url-del-repositorio> # o usar el repo local si ya lo tienes
cd funky-cli
pnpm install
pnpm link --global
```

## Comandos

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `funky init` | Genera PROJECT-CANVAS.md e INFRA-CANVAS.md para iniciar la planificacion del proyecto. Usa `--bootstrap` para copiar toda la estructura del ecosistema Funky AI. | `funky init` -> genera canvases vacios + guia |
| `funky estimate` | Facilita una sesión de pricing colaborativa humano+IA. Inyecta una guía de discusión basada en decisiones arquitectónicas y canvases del proyecto, más un template para documentar acuerdos. Sin fórmulas hardcodeadas. | `funky estimate` -> guía de pricing + prompt IA + template de decisiones |
| `funky pipeline` | Orquesta el flujo unificado `assess → estimate` con estado compartido vía `context.json`. Subcomandos: `assess`, `estimate`, `all`, `status`. | `funky pipeline all` -> assess → estimate secuencial |
| `funky feature <nombre>` | Inicializa el scaffolding para una feature SDD en `openspec/changes/<nombre>`. Ejecuta 3 inquirers interactivos (Tier T1/T2/T3, docs core, tipo de release) para inyectar condicionalmente solo los templates necesarios según la matriz de inyección. `docs.md` y `release.md` se inyectan solo si corresponde. T1 nunca recibe `release.md`. | `funky feature auth` → prompts → "🚀 Scaffolding de feature creado... Archivos inyectados: 8 — tasks.md, ..." |
| `funky gentle <nombre>` | Inicializa el scaffolding de **Tier 4 Deep SDD** en `openspec/gentle/<nombre>`. Genera los 7 templates de roles aislados (Explorer → Verifier) para tareas hipercríticas. | `funky gentle db-migration` -> "🚀 Scaffolding de Tier 4 Deep SDD creado..." |
| `funky phase <nombre>` | Inyecta el template correspondiente a la fase SDD indicada en el directorio activo. | `funky phase explore` -> "📄 Template 'explore' inyectado!" |
| `funky release <version>` | Genera las notas de release estandarizadas automáticamente basándose en templates. | `funky release v1.12.0` -> "🚀 Release Notes v1.12.0 creados" |
| `funky assess` | Facilita una sesión de discusión arquitectónica entre el equipo humano y la IA. Inyecta una guía de discusión basada en PROJECT-CANVAS e INFRA-CANVAS con preguntas C1/C2, más un template para documentar decisiones. Sin reglas estáticas, nunca falla. | `funky assess` -> guía de discusión + template de decisiones |
| `funky engram add` | Inyecta un nuevo engrama al sistema de conocimiento persistente. Soporta entrada interactiva (sin flags) y flags directos para automatizacion. | `funky engram add --tag "[mi-tag]" --category discovery --desc "..."` |

## Fases SDD Disponibles

| Fase | Archivo Inyectado | Cuándo usarlo |
|------|-------------------|---------------|
| `explore` | `explore.md` | Cuando el problema no está claro. Para evaluar opciones arquitectónicas con sus pros/contras antes de proponer una solución. |
| `proposal` | `proposal.md` | Cuando ya se eligió una opción arquitectónica. Define el scope, las decisiones técnicas concretas y los riesgos. |
| `tasks` | `tasks.md` | Al aprobar una propuesta. Desglosa la solución en fases ejecutables con checklists precisos para humanos y workers. |
| `worker-handoff` | `worker-handoff.md` | Al delegar una fase del `tasks.md` a un Worker LLM. Contiene inyección de contexto (Safe-Contexting), misión y reglas estrictas. |
| `report` | `report.md` | Al finalizar un Worker Handoff. Resume archivos modificados, bugs encontrados y los próximos pasos. |

## Estructura generada por `funky init`

`funky init` (sin flags) genera solo **PROJECT-CANVAS.md**, **INFRA-CANVAS.md** y **canvas-planning-guide.md**.
`funky init --bootstrap` copia toda la estructura del ecosistema. A continuación, la estructura completa post-bootstrap:

```text
.
├── .agents/
│   └── rules/
│       ├── engram-protocol.md       (Protocolo de memoria Engram)
│       ├── secops.md                 (Reglas de seguridad)
│       ├── secops-setup.md          (Setup inicial de seguridad)
│       └── sdd-orchestrator.md      (Reglas de orquestación SDD)
├── docs/
│   ├── architecture-assessment.md  (Assessment legado — ya no se usa desde CLI)
│   ├── architecture-assessment-guide.md (Guía de assessment para discusión humano+IA)
│   ├── engram/
│   │   ├── index.md             (Índice de todos los engramas)
│   │   ├── architecture/        (Decisiones de arquitectura)
│   │   ├── pattern/             (Patrones establecidos)
│   │   ├── discovery/           (Hallazgos)
│   │   ├── discoveries.md       (Registro plano de descubrimientos)
│   │   ├── decision/            (Decisiones con impacto)
│   │   └── bugfix/
│   │       └── bugfixes.md      (Registro de bugs corregidos)
│   ├── funky-ai/
│   │   └── workers/
│   │       └── plantilla-worker-handoff.md (Template de handoff para workers)
│   └── openspec/
│       └── rfcs/
│           └── 000-TEMPLATE.md   (Template de RFC)
├── ORCHESTRATOR-STATE.md  (Estado global del proyecto)
├── PROJECT-CANVAS.md      (Canvas Core: Framework, Arquitectura, Testing)
├── INFRA-CANVAS.md        (Canvas Operacional: DB, Auth, Deployment)
├── TEMPLATE_GUIDE.md      (Guía de uso de templates)
└── README.md              (README del proyecto)
```
