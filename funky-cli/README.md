# Funky AI CLI

## ¿Qué es Funky AI CLI?
El CLI oficial de Funky AI es la herramienta encargada de hacer andamiaje (scaffolding) de la arquitectura del proyecto, reglas canónicas, y templates del ciclo Spec-Driven Development (SDD). Elimina la configuración manual, asegurando un ecosistema estandarizado y libre de errores en cada proyecto.

## Prerequisitos
- **Node.js**: Instalado (recomendado v20.12 o superior).
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

| Comando | Descripción |
|---------|-------------|
| `funky init` | Genera PROJECT-CANVAS.md e INFRA-CANVAS.md en `docs/funky-ai/canvas/` para iniciar la planificación del proyecto. |
| `funky scaffold` | Copia la estructura base del ecosistema Funky AI: reglas de agentes (.agents/rules/), templates SDD (.agents/templates/sdd/), ORCHESTRATOR-STATE.md, directorios engram (docs/engram/) y el template de RFC (openspec/rfcs/). |
| `funky assess` | Facilita una sesión de discusión arquitectónica humano+IA. Inyecta una guía de discusión basada en PROJECT-CANVAS e INFRA-CANVAS con preguntas C1/C2, más un template para documentar decisiones. Genera `docs/funky-ai/assess/architecture-review.md`. |
| `funky estimate` | Facilita una sesión de pricing colaborativa humano+IA. Inyecta una guía de discusión basada en decisiones arquitectónicas y canvases, más un template para documentar acuerdos. Sin fórmulas hardcodeadas. Genera `docs/funky-ai/estimate/pricing-guide.md`. |
| `funky pipeline` | Orquesta el flujo unificado `assess → estimate` con estado compartido vía `context.json`. Subcomandos: `assess`, `estimate`, `all`, `status`. |
| `funky feature <nombre>` | Inicializa el scaffolding de una feature SDD en `openspec/changes/<nombre>`. Ejecuta inquirers interactivos (Tier T1/T2/T3, docs core, tipo de release) e inyecta condicionalmente los templates según la matriz: T1 → tasks + report; T2 → tasks + report + explore + proposal + spec + (docs opcional) + release; T3 → tasks + (docs opcional) + release. |
| `funky engram add` | Inyecta un nuevo engrama al sistema de conocimiento persistente. Soporta entrada interactiva (sin flags) y flags directos (`--tag`, `--category`, `--desc`). En modo standalone inyecta la regla `engram-protocol.md` en `.agents/rules/` si falta. |
| `funky skills` | Inyecta las skills base de gentle-ai (`sdd-release`, `sdd-docs-sync`) en `.agents/skills/` del proyecto destino y bootstrapa los docs compartidos de SDD (`docs-live-index.md` + formato canónico de índice seccional). Idempotente: no sobrescribe archivos existentes. |

## Templates SDD Disponibles

| Template | Cuándo se usa |
|----------|---------------|
| `explore.md` | Cuando el problema no está claro; evalúa opciones arquitectónicas con pros/contras. |
| `proposal.md` | Cuando se eligió una opción arquitectónica; define scope, decisiones técnicas y riesgos. |
| `spec.md` | Especificación detallada de requisitos del cambio. |
| `tasks.md` | Desglose de la solución en fases ejecutables con checklists. |
| `report.md` | Reporte de ejecución: archivos modificados, bugs encontrados, próximos pasos. |
| `release-checklist.md` / `release-notes.md` | Notas y checklist de release (inyectados por `funky feature` en T2/T3). |
| `docs.md` | Documentación de feature (inyectado solo si el cambio afecta docs). |

## Estructura generada por `funky init` y `funky scaffold`

`funky init` genera los canvases en **`docs/funky-ai/canvas/`**.
`funky scaffold` copia toda la estructura base del ecosistema. A continuación, la estructura completa post-init + post-scaffold:

```text
proyecto/
├── ORCHESTRATOR-STATE.md
├── TEMPLATE_GUIDE.md
├── README.md
├── .agents/
│   ├── rules/
│   │   ├── engram-protocol.md
│   │   ├── sdd-escalation-matrix.md
│   │   ├── sdd-orchestrator.md
│   │   ├── sdd-preflight.md
│   │   ├── secops.md
│   │   ├── tier1-router.md
│   │   ├── tier2-router.md
│   │   ├── tier3-router.md
│   │   ├── tier2-delegation/        (t2-archive, t2-explore, t2-propose, t2-spec, t2-tasks, t2-verify)
│   │   └── tier3-interactive/       (interactive-apply, interactive-archive, interactive-design, ...)
│   └── templates/sdd/
│       ├── docs.md, explore.md, proposal.md, spec.md, tasks.md
│       ├── report.md, release-checklist.md, release-notes.md
│       └── docs-index/
├── docs/
│   ├── funky-ai/
│   │   ├── canvas/                  ← funky init
│   │   │   ├── PROJECT-CANVAS.md
│   │   │   ├── INFRA-CANVAS.md
│   │   │   └── canvas-planning-guide.md
│   │   ├── assess/                  ← funky assess
│   │   │   └── architecture-review.md
│   │   ├── estimate/                ← funky estimate
│   │   └── pipeline/                ← funky pipeline
│   │       └── context.json
│   └── engram/                      ← funky scaffold
│       ├── index.md
│       ├── architecture/  pattern/  discovery/
│       ├── decision/  bugfix/  session/  release/
└── openspec/
    └── rfcs/
        └── 000-rfc-template.md      ← funky scaffold
```
