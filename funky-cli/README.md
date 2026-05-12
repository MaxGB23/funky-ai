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
| `funky init` | Inicia el ecosistema Funky AI en el directorio actual. Genera el `PROJECT-CANVAS.md` interactivo, copia reglas de agente, `ORCHESTRATOR-STATE.md`, y una guía de planeación. | `funky init` -> "🚀 Funky Ecosystem inicializado!" |
| `funky estimate` | Calcula el costo estimado y riesgo cruzando el Canvas técnico con factores de negocio. Genera un análisis de Pricing. | `funky estimate` -> "💰 Piso Base Calculado..." |
| `funky feature <nombre>` | Inicializa el scaffolding completo para una nueva feature SDD en `docs/openspec/changes/<nombre>`, copiando todos los templates necesarios. | `funky feature auth` -> "🚀 Scaffolding de feature creado..." |
| `funky phase <nombre>` | Inyecta el template correspondiente a la fase SDD indicada en el directorio activo. | `funky phase explore` -> "📄 Template 'explore' inyectado!" |
| `funky release <version>` | Genera las notas de release estandarizadas automáticamente basándose en templates. | `funky release v1.12.0` -> "🚀 Release Notes v1.12.0 creados" |
| `funky assess` | Architecture Readiness Gate. Evalúa `docs/architecture-assessment.md` contra el motor de reglas y genera challenges para el LLM. | `funky assess` -> "✅ Arquitectura validada..." |

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
│   └── rules/             (Reglas canónicas SDD, secops, etc.)
├── docs/
│   ├── engram/            (Memoria persistente: discoveries.md, bugfixes.md)
│   ├── openspec/          (Carpeta para tus cambios y fases SDD)
│   └── funky-ai/cli/      (Contiene la guía canvas-planning-guide.md)
├── ORCHESTRATOR-STATE.md  (Estado global del proyecto)
├── PROJECT-CANVAS.md      (Canvas Core: Framework, Arquitectura, Testing)
└── INFRA-CANVAS.md        (Canvas Operacional: DB, Auth, Deployment)
```
