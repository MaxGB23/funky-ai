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
git clone <url-del-repositorio> # o usar el repo local si ya lo tenés
cd funky-cli
pnpm install
pnpm link --global
```

## Comandos

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `funky init` | Inicia el ecosistema Funky AI en el directorio actual. Si no existen Canvas, ejecuta un wizard de setup inicial con `@clack/prompts` para definir el stack. Si ya existen Canvas, activa modo Headless y copia la estructura completa. | `funky init` -> "🚀 Funky Ecosystem inicializado!" |
| `funky estimate` | Calcula el costo estimado y riesgo cruzando el Canvas técnico con factores de negocio. Genera un análisis de Pricing. | `funky estimate` -> "💰 Piso Base Calculado..." |
| `funky feature <nombre>` | Inicializa el scaffolding para una feature SDD en `openspec/changes/<nombre>`. Ejecuta 3 inquirers interactivos (Tier T1/T2/T3, docs core, tipo de release) para inyectar condicionalmente solo los templates necesarios según la matriz de inyección. `docs.md` y `release.md` se inyectan solo si corresponde. T1 nunca recibe `release.md`. | `funky feature auth` → prompts → "🚀 Scaffolding de feature creado... Archivos inyectados: 8 — tasks.md, ..." |
| `funky gentle <nombre>` | Inicializa el scaffolding de **Tier 4 Deep SDD** en `openspec/gentle/<nombre>`. Genera los 7 templates de roles aislados (Explorer → Verifier) para tareas hipercríticas. | `funky gentle db-migration` -> "🚀 Scaffolding de Tier 4 Deep SDD creado..." |
| `funky phase <nombre>` | Inyecta el template correspondiente a la fase SDD indicada en el directorio activo. | `funky phase explore` -> "📄 Template 'explore' inyectado!" |
| `funky release <version>` | Genera las notas de release estandarizadas automáticamente basándose en templates. | `funky release v1.12.0` -> "🚀 Release Notes v1.12.0 creados" |
| `funky assess` | Architecture Readiness Gate. Evalúa `docs/architecture-assessment.md` contra el motor de reglas y genera challenges para el LLM. | `funky assess` -> "✅ Arquitectura validada..." |
| `funky engram add` | Inyecta un nuevo engrama al sistema de conocimiento persistente. Soporta setup inicial (sin flags) y modo headless con flags para automatización de Agentes. | `funky engram add --tag "[mi-tag]" --category discovery --desc "..."` |

## Fases SDD Disponibles

| Fase | Archivo Inyectado | Cuándo usarlo |
|------|-------------------|---------------|
| `explore` | `explore.md` | Cuando el problema no está claro. Para evaluar opciones arquitectónicas con sus pros/contras antes de proponer una solución. |
| `proposal` | `proposal.md` | Cuando ya se eligió una opción arquitectónica. Define el scope, las decisiones técnicas concretas y los riesgos. |
| `tasks` | `tasks.md` | Al aprobar una propuesta. Desglosa la solución en fases ejecutables con checklists precisos para humanos y workers. |
| `worker-handoff` | `worker-handoff.md` | Al delegar una fase del `tasks.md` a un Worker LLM. Contiene inyección de contexto (Safe-Contexting), misión y reglas estrictas. |
| `report` | `report.md` | Al finalizar un Worker Handoff. Resume archivos modificados, bugs encontrados y los próximos pasos. |

## Estructura generada por `funky init`

Al ejecutar `funky init`, se generará la siguiente estructura en el directorio actual:

```text
.
├── .agents/
│   └── rules/             (Reglas de agente adaptadas al entorno seleccionado IDE o CLI)
│       ├── engram-protocol.md       (Protocolo de Engram asíncrono/síncrono según entorno)
│       ├── secops.md                 (Auditoría de dependencias y NPM segura)
│       └── sdd-orchestrator.md      (Reglas de orquestación adaptadas al workflow seleccionado)
├── docs/
│   ├── engram/            (Memoria persistente sharded por categoría)
│   │   ├── index.md             (Resumen tabla de todos los engramas)
│   │   ├── architecture/        (Decisiones de arquitectura)
│   │   ├── pattern/             (Patrones establecidos)
│   │   ├── discovery/           (Hallazgos y evaluaciones)
│   │   ├── decision/            (Decisiones con impacto en el proyecto)
│   │   └── bugfix/              (Bugs corregidos)
│   ├── openspec/          (Carpeta para tus cambios y fases SDD)
│   └── funky-ai/cli/      (Contiene la guía canvas-planning-guide.md)
├── ORCHESTRATOR-STATE.md  (Estado global del proyecto)
├── PROJECT-CANVAS.md      (Canvas Core: Framework, Arquitectura, Testing)
└── INFRA-CANVAS.md        (Canvas Operacional: DB, Auth, Deployment)
```
