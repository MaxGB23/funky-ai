# AGENTS.md — funky-ai

Convenciones de proyecto para el orquestador y los sub-agentes.

## Directorio temporal (`.tmp/`)

- Los sub-agentes (task/general/explore) **no** deben escribir en `C:\Users\cb147\AppData\Local\Temp\opencode` ni en rutas fuera del workspace: en Windows cada acceso a una ruta externa pide confirmación de permisos.
- Cuando un sub-agente necesite scratch, sandbox o archivos temporales que el repo no debe trackear — proyectos de prueba scaffold, fixtures, reproducciones de bugs, bundles de evidencia para revisión — debe usar `M:\funky-ai\.tmp\` (dentro del workspace y gitignored, línea 21 de `.gitignore`).
- Excepciones que **NO** usan `.tmp/`:
  - Review: los bytes del candidato viajan por el transport del provider (árboles Git), nunca por archivos externos.
  - Worktrees: `M:\funky-ai-worktrees` (sibling del repo, con su propio índice `.codegraph`).
  - Artefactos nativos (verify-report, receipts): rutas del provider.

## Strict TDD (resolución canónica)

Este proyecto usa **Strict TDD como default**. Esta regla prevalece sobre cualquier flag de engram o formato que cambie el framework en syncs, y aplica tanto al orquestador como a los sub-agentes.

Resolución del flag (en este orden):

1. Leer `openspec/config.yaml` → `testing.strict_tdd`.
2. Si el archivo o el campo no existen, consultar engram (`sdd/{project}/testing-capabilities` o `sdd-init/{project}`) con heurística tolerante: `strict_tdd: true` o `Strict TDD Mode: enabled`.
3. Si no hay flag pero existe test runner (Vitest / `pnpm test`), usar `strict_tdd: true` (regla de fallback del skill `sdd-init`).

Cuando el flag resuelve a `true`, las fases `sdd-apply` y `sdd-verify` DEBEN recibir la instrucción `STRICT TDD MODE IS ACTIVE` con test runner `pnpm test`.

## Flujo post-SDD (docs y release)

Tras `sdd-archive`, sugerir en orden, solo si aplica:

1. `sdd-docs-sync` — si el cambio tocó comandos, flags, templates o estructura (docs = CLI real).
2. `sdd-release` — si el cambio merece release (feature → MINOR, breaking → MAJOR, fix significativo → PATCH).

El usuario decide si corre el flujo; no es obligatorio en cada cambio. Skills: `.agents/skills/sdd-docs-sync-gentle-ai/` y `.agents/skills/sdd-release-gentle-ai/`.
