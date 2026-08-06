# AGENTS.md — funky-ai

Convenciones de proyecto para el orquestador y los sub-agentes.

## Directorio temporal (`.tmp/`)

- Sub-agentes NO escriben en rutas externas al workspace (en Windows cada acceso pide confirmación de permisos). Scratch/sandbox/fixtures/reproducciones → `M:\funky-ai\.tmp\` (gitignored).
- Excepciones: Review (bytes vía árboles Git del provider), Worktrees (`M:\funky-ai-worktrees`), artefactos nativos (verify-report, receipts).

## Strict TDD (resolución canónica)

Strict TDD es el default y prevalece sobre cualquier flag de engram/syncs; aplica a orquestador y sub-agentes.

Resolución: 1) `openspec/config.yaml` → `testing.strict_tdd`; 2) si no, engram (`sdd-init/{project}`); 3) si no hay flag pero existe runner (Vitest / `pnpm test`), `strict_tdd: true` (fallback del skill `sdd-init`).

Si resuelve a `true`, `sdd-apply` y `sdd-verify` DEBEN recibir `STRICT TDD MODE IS ACTIVE` con runner `pnpm test`.

## Flujo post-SDD (docs y release)

Tras `sdd-archive`, sugerir en orden, solo si aplica (el usuario decide; no es obligatorio):
1. `sdd-docs-sync` — si tocó comandos, flags, templates o estructura (docs = CLI real).
2. `sdd-release` — feature → MINOR, breaking → MAJOR, fix significativo → PATCH.

Skills: `.agents/skills/sdd-docs-sync-gentle-ai/` y `.agents/skills/sdd-release-gentle-ai/`.
