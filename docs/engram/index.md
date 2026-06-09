# Engram Index

Directorio unificado de conocimientos, decisiones y patrones.

## Architecture

- [[worker-handoff-deprecation] Deprecación de worker-handoff.md a favor de Message Passing directo. Los templates estáticos fueron eliminados para liberar I/O de disco. El return envelope schema ahora vive en el template del report.md.](./architecture/worker-handoff-deprecation.md)

## Pattern


## Discovery
- [[DISCOVERY] Model Efficacy & Quota Optimization (Abril 2026)
](./discovery/model-efficacy-quota-optimization-abril-2026.md)
- [[DISCOVERY] Massive Consolidation
](./discovery/massive-consolidation.md)
- [[DISCOVERY] In-Template Rule Injection (Zero-Token-Waste)
](./discovery/in-template-rule-injection-zero-token-waste.md)
- [[DISCOVERY][sdd-template-quality-gap] Gap entre Plantilla Canónica y Templates del CLI
](./discovery/gap-entre-plantilla-cannica-y-templates-del-cli.md)
- [[DISCOVERY][cli-missing-readme] CLI sin README de Instalación/Uso
](./discovery/cli-sin-readme-de-instalacinuso.md)
- [[DISCOVERY][release-dod-gap] Template de tasks.md sin pasos de documentación de Release
](./discovery/template-de-tasksmd-sin-pasos-de-documentacin-de-release.md)
- [[DISCOVERY][worker-invocation-prompt] La Invocación del Worker no está en el Template
](./discovery/la-invocacin-del-worker-no-est-en-el-template.md)
- [[DISCOVERY][cli-testing-pure-functions] Testear CLI Commands: Extraer Funciones Puras vs. Mockear el Framework
](./discovery/testear-cli-commands-extraer-funciones-puras-vs-mockear-el-framework.md)
- [[DISCOVERY][tty-headless-e2e-limitation] Agentes Headless no pueden ejecutar CLIs Interactivos vía TTY
](./discovery/agentes-headless-no-pueden-ejecutar-clis-interactivos-va-tty.md)
- [[DISCOVERY][worker-return-envelope-compliance] Workers omiten la sección de Bugs en el Return Envelope
](./discovery/workers-omiten-la-seccin-de-bugs-en-el-return-envelope.md)
- [[DISCOVERY][smoke-test-is-dod] El Smoke Test es la única verdad, no los tests unitarios
](./discovery/el-smoke-test-es-la-nica-verdad-no-los-tests-unitarios.md)
- [[DISCOVERY][cli-template-sync-drift] Los templates del CLI son snapshots que se pudren
](./discovery/los-templates-del-cli-son-snapshots-que-se-pudren.md)
- [[DISCOVERY][agent-cognitive-load] La sobrecarga cognitiva del agente omite protocolos críticos
](./discovery/la-sobrecarga-cognitiva-del-agente-omite-protocolos-crticos.md)
- [[DISCOVERY][pnpm-strict-usage] Mezclar gestores de paquetes (npm vs pnpm)
](./discovery/mezclar-gestores-de-paquetes-npm-vs-pnpm.md)
- [[DISCOVERY][agent-dry-handoffs] El síndrome del Teléfono Descompuesto en Orquestación Manual
](./discovery/el-sndrome-del-telfono-descompuesto-en-orquestacin-manual.md)
- [[DISCOVERY][skills-obsolescence-vs-templates] Las Skills de Plantillas son redundantes con el CLI
](./discovery/las-skills-de-plantillas-son-redundantes-con-el-cli.md)
- [[DISCOVERY][documentation-vs-enforcement] Documentar no es Enforcer — El Loop Vicioso de los Fixes Textuales
](./discovery/documentar-no-es-enforcer-el-loop-vicioso-de-los-fixes-textuales.md)
- [[DISCOVERY][versioning-policy] Política de Versionado: Mayor/Menor vs Patches
](./discovery/poltica-de-versionado-mayormenor-vs-patches.md)
- [[DISCOVERY][phase0-t1-automation] Phase 0 siempre es T1
](./discovery/phase-0-siempre-es-t1.md)
- [[DISCOVERY][release-template-ssot] Release Templates SSOT
](./discovery/release-templates-ssot.md)
- [[DISCOVERY][openspec-backlog-lifecycle] La carpeta backlog/ es un fantasma para el Orquestador
](./discovery/la-carpeta-backlog-es-un-fantasma-para-el-orquestador.md)
- [[DISCOVERY][readme-template-context-drift] El clonaje ciego de READMEs
](./discovery/el-clonaje-ciego-de-readmes.md)
- [[DISCOVERY][orchestrator-planning-checklist] Las instrucciones de enforcement deben vivir al inicio, no al final
](./discovery/las-instrucciones-de-enforcement-deben-vivir-al-inicio-no-al-final.md)
- [[DISCOVERY][assess-gate-context-expansion] El Readiness Gate requiere densidad de NFRs y siempre deriva en AI
](./discovery/el-readiness-gate-requiere-densidad-de-nfrs-y-siempre-deriva-en-ai.md)
- [[DISCOVERY][sdd-failure-forensics-007] Análisis Forense de Fallas SDD — Sesión 007
](./discovery/anlisis-forense-de-fallas-sdd-sesin-007.md)
- [[DISCOVERY][release-actor-split] Estrategia de Release: Split Orquestador / Worker Flash
](./discovery/estrategia-de-release-split-orquestador-worker-flash.md)
- [[DISCOVERY][ghost-directory-accumulation] Acumulación de Directorios Fantasma por Refactors Incompletos
](./discovery/acumulacin-de-directorios-fantasma-por-refactors-incompletos.md)
- [[DISCOVERY][handoff-as-return-statement] El worker-handoff.md como único Return Statement válido
](./discovery/el-worker-handoffmd-como-nico-return-statement-vlido.md)
- [[DISCOVERY][rfc-semantics-enforcement] Semántica Estricta: RFCs como Brain Dumps vs Proposals
](./discovery/semntica-estricta-rfcs-como-brain-dumps-vs-proposals.md)
- [[DISCOVERY][cli-orchestrator-circular-dependency] Dependencia Circular entre Orquestador y Templates del CLI
](./discovery/dependencia-circular-entre-orquestador-y-templates-del-cli.md)
- [[DISCOVERY][doc-update-index-manual-drift] El índice de Docs Vivos en OPTIONAL_DOC_UPDATE es mantenimiento manual
](./discovery/el-ndice-de-docs-vivos-en-optional_doc_update-es-mantenimiento-manual.md)
- [[DISCOVERY][inquirer-integration] Interacción Humano-LLM en Herramientas de CLI
](./discovery/interaccin-humano-llm-en-herramientas-de-cli.md)
- [[t1-scaffolding-purge]
](./discovery/entry-1780270378079-511.md)
- [[cli-base-immutable]
](./discovery/entry-1780270378079-571.md)
- [[orchestrator-context-overload]
](./discovery/entry-1780270378079-649.md)
- [[system-prompt-vs-chat-history]
](./discovery/entry-1780270378079-808.md)
- [[context-economy]
](./discovery/entry-1780270378079-75.md)
- [[orchestrator-role-boundary]
](./discovery/entry-1780270378079-393.md)
- [[model-assessment-gemini-3.5-flash]](./discovery/entry-1780270378079-369.md)

## Decision

## Bugfix
- [[BUG][ci-lockfile-mismatch] CI falla con `--frozen-lockfile` al pinear versión exacta post-instalación
](./bugfix/ci-falla-con---frozen-lockfile-al-pinear-versin-exacta-post-instalacin.md)
- [[bugfix][worker-prompt-persistence] Semántica de escritura en Prompts de Workers
](./bugfix/semntica-de-escritura-en-prompts-de-workers.md)
- [[bugfix][git-ops-orchestrator] Generación de planes sobre rama principal (main)
](./bugfix/generacin-de-planes-sobre-rama-principal-main.md)
- [[bugfix][worker-tier-omission] Omisión de Tier en templates de ejecución
](./bugfix/omisin-de-tier-en-templates-de-ejecucin.md)
- [[bugfix][phase-template-path] Mismatch de ruta en `phase.js` tras mover templates a subcarpeta
](./bugfix/mismatch-de-ruta-en-phasejs-tras-mover-templates-a-subcarpeta.md)
- [[bugfix][cli-headless-overwrite] Sobreescritura de Canvas en modo Headless
](./bugfix/sobreescritura-de-canvas-en-modo-headless.md)
- [[BUG][stale-post-mortem-ref] sdd-orchestrator.md apuntaba a archivo DEPRECATED en Memory Polling
](./bugfix/sdd-orchestratormd-apuntaba-a-archivo-deprecated-en-memory-polling.md)
- [[bugfix][worker-report-false-positive] Worker Git-Ops marca ítems Doc-Ops como completados sin ejecutarlos
](./bugfix/worker-git-ops-marca-tems-doc-ops-como-completados-sin-ejecutarlos.md)
- [[bugfix][test-mock-drift] Desincronización de mocks de FS con templates inyectados
](./bugfix/desincronizacin-de-mocks-de-fs-con-templates-inyectados.md)
- [[bugfix][feature-scaffolding-bug] Omisión de inyección de templates SDD nuevos en `funky feature`
](./bugfix/omisin-de-inyeccin-de-templates-sdd-nuevos-en-funky-feature.md)

- [[brittle-tests-filecount] Pruebas de CLI frágiles: el test de feature.js usaba toHaveBeenCalledTimes(10) para verificar copias de templates. Al remover un archivo del scaffold (worker-handoff), la prueba falló. Se ajustó a 9, pero el patrón sugiere evitar conteos hardcodeados de archivos esperados.](./bugfix/brittle-tests-filecount.md)
