# Engram Index

Directorio unificado de conocimientos, decisiones y patrones.

## Architecture

- [[living-specs] Transición a Living Specs completada. Los deltas (ADDED/MODIFIED/REMOVED) se mergean vía workflow con validación de checksum (root-sha256). Dominios nuevos usan root-sha256: null para FULL spec.](./architecture/living-specs.md)
- [[cli-testing] Refactor CLI Testing: IO Abstraction and Template Resiliency. Se abstrajo el filesystem en pruebas y se removió la aserción de prosa en templates.](./architecture/cli-testing.md)

## Pattern


## Discovery
- [[DISCOVERY] Model Efficacy & Quota Optimization (Abril 2026)
](./discovery/model-efficacy-quota-optimization-abril-2026.md)
- [[DISCOVERY][cli-template-sync-drift] Los templates del CLI son snapshots que deben ser actualizados automaticamente
](./discovery/los-templates-del-cli-son-snapshots-que-se-pudren.md)
- [[DISCOVERY][pnpm-strict-usage] Mezclar gestores de paquetes (npm vs pnpm)
](./discovery/mezclar-gestores-de-paquetes-npm-vs-pnpm.md)
- [[DISCOVERY][documentation-vs-enforcement] Documentar no es Enforcer — El Loop Vicioso de los Fixes Textuales
](./discovery/documentar-no-es-enforcer-el-loop-vicioso-de-los-fixes-textuales.md)
- [[DISCOVERY][versioning-policy] Política de Versionado: Mayor/Menor vs Patches
](./discovery/poltica-de-versionado-mayormenor-vs-patches.md)
- [[DISCOVERY][assess-gate-context-expansion] El Readiness Gate requiere densidad de NFRs y siempre deriva en AI
](./discovery/el-readiness-gate-requiere-densidad-de-nfrs-y-siempre-deriva-en-ai.md)

## Decision


## Bugfix
- [[BUG][ci-lockfile-mismatch] CI falla con `--frozen-lockfile` al pinear versión exacta post-instalación
](./bugfix/ci-falla-con---frozen-lockfile-al-pinear-versin-exacta-post-instalacin.md)


- [[brittle-tests-filecount] Pruebas de CLI frágiles: el test de feature.js usaba toHaveBeenCalledTimes(10) para verificar copias de templates. Al remover un archivo del scaffold (worker-handoff), la prueba falló. Se ajustó a 9, pero el patrón sugiere evitar conteos hardcodeados de archivos esperados.](./bugfix/brittle-tests-filecount.md)

- [[BUG][invalid-category-validation] Falta validación de categorías desconocidas en CLI](./bugfix/invalid-category-validation.md)

## Session
- [[SESSION][add-engram-categories] Implementación de categorías Session y Release](./session/add-engram-categories-20260723.md)


## Release
