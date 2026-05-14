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
| [sdd-failure-forensics-007] | 4 fallas de sesión 007 clasificadas por mecanismo: gate ausente, ambigüedad semántica, Lost in Middle, naming bias. Todos los fixes aplicados en v1.14–1.15. |
| [release-actor-split] | Doc-Ops = Orquestador inline (criterio + archivados). Git-Ops = Worker Flash (solo comandos git). Nunca delegar redacción a un Worker cuando el contexto está fresco. |
| [handoff-as-return-statement] | worker-handoff.md es el único Return Statement válido de la orquestación — gate G1/G2/G3 bloquea delegación sin él. |
| [rfc-semantics-enforcement] | RFC = Brain Dump, Proposal = Orquestador. Proteger con warning bloqueante en template distribuido por CLI. |
| [cli-orchestrator-circular-dependency] | Aislar rules/templates locales (backup) antes de agnostizar la versión pública distribuida por el CLI. |
| [doc-update-index-manual-drift] | Índice de Docs Vivos en OPTIONAL_DOC_UPDATE es estático — actualizar en la misma operación cuando se crea un nuevo doc de flujo. |
| [inquirer-integration] | Uso de inquirer en CLI permite flujos interactivos guiados vs comandos headless. |
| [t1-scaffolding-purge] | Si el CLI inyecta scaffolding pero el Orquestador dictamina T1, los artefactos vacíos se ignoran y purgan al archivar. |
| [cli-base-immutable] | CLI base templates deben ser agnósticos. Cambios y enforcements específicos de repo solo en templates golden locales. |
| [orchestrator-context-overload] | Sobrecarga de texto/contexto causa que el Orquestador se adelante. Solución: Arquitectura v2.0.0. |

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
| [worker-report-false-positive] | Workers Git-Ops marcan ítems Doc-Ops como [x] sin ejecutarlos — auditar tasks.md siempre |
| [test-mock-drift] | Actualizar arreglos de mocks de FS al añadir archivos a templates copiados por CLI |
| [silent-spec-skip] | `feature.js` lista `spec.md` en `filesToCopy` pero no existe en templates → se saltea silenciosamente. Pendiente crear template `spec.md` como feature separada. |
