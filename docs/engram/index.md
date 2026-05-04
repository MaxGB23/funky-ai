# Engram Index — Funky AI
<!-- 
  Fuente de verdad para el Memory Polling Two-Stage.
  Actualizar CADA VEZ que se agregue una entrada a discoveries.md o bugfixes.md.
  Formato: | [tag-exacto] | resumen de una línea máximo |
-->

## Discoveries
| Tag | Resumen |
|-----|---------|
| [model-efficacy-quota] | Flash=Worker, Pro Low=Orquestador, Sonnet=crisis |
| [massive-consolidation] | Tablas > narrativa — reduce carga cognitiva y tokens |
| [in-template-rule-injection] | Reglas cerca de ejecución (en template), no en globales |
| [sdd-template-quality-gap] | Templates CLI son esqueletos — siempre adjuntar canónico como referencia |
| [cli-missing-readme] | Cada paquete publicable necesita README como DoD |
| [release-dod-gap] | tasks.md sin pasos de release notes/README → drift garantizado |
| [worker-invocation-prompt] | Incluir bloque [HUMANO] en handoff con el prompt exacto de invocación |
| [cli-testing-pure-functions] | Testear CLI = extraer función pura, nunca mockear commander/process |
| [tty-headless-e2e-limitation] | Agentes headless no pueden enviar keystrokes a CLIs interactivos |
| [worker-return-envelope-compliance] | Return Envelope debe pedir intentos fallidos, no solo resultado final |
| [smoke-test-is-dod] | Tests en verde ≠ software funcionando. Smoke test en directorio virgen es DoD |
| [cli-template-sync-drift] | Templates estáticos de CLI necesitan script de sync automático (pretest) |
| [agent-cognitive-load] | Token Diet + XML Tags + Action Forcing para evitar Lost in the Middle |
| [pnpm-strict-usage] | Auditar archivo lock antes de sugerir comandos de paquetes |
| [agent-dry-handoffs] | Handoff como puntero a tasks.md — nunca duplicar instrucciones |
| [skills-obsolescence-vs-templates] | Skills para lógica dinámica, no para estructuras de documentos |
| [documentation-vs-enforcement] | Documentar ≠ enforcer — el fix correcto hace el error estructuralmente imposible |
| [versioning-policy] | Release notes para Mayor/Menor. Patches solo en Engram + ORCHESTRATOR-STATE |
| [phase0-t1-automation] | Fase 0 siempre T1 Worker — nunca tarea del Humano |
| [release-template-ssot] | Template canónico release.md + funky release <version> |
| [readme-template-context-drift] | README raíz = Architecture Hub, no clon del CLI README |
| [memory-polling-index-layer] | Two-Stage Polling: index.md primero, grep por tag solo si relevante |
| [openspec-backlog-lifecycle] | backlog/ → changes/ → archive/: mover items implementados al archive en el release |
| [orchestrator-planning-checklist] | Enforcement al inicio del artefacto, no al final — Planning Checklist antes de delegar |
| [assess-gate-context-expansion] | assess requiere prompt AI siempre; template exige NFRs (Hosting, Compliance, Seniority) |

## Bugfixes
| Tag | Resumen |
|-----|---------|
| [ci-lockfile-mismatch] | Regenerar pnpm-lock al pinar versiones, antes del commit |
| [worker-prompt-persistence] | Nunca "devolveme" — siempre "escribí el archivo en ruta X" |
| [git-ops-orchestrator] | Crear branch ANTES de generar el primer handoff |
| [worker-tier-omission] | Declarar Tier explícito en cada handoff |
| [phase-template-path] | Al mover templates, actualizar rutas en comandos JS en la misma Fase |
| [cli-headless-overwrite] | Validar flags en función pura, no solo en command handler |
| [stale-post-mortem-ref] | Al deprecar un archivo, grep_search en .agents/rules/ para limpiar refs |
