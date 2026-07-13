# Worker Handoff: Git-Ops (v2.0.1-context-fix)

> **Misión:** Cerrar la release v2.0.1 en el repositorio git.
> **Tier:** T1 — Operaciones git puras, sin ambigüedad.

## Contexto
Doc-Ops completada. Todos los archivos están escritos al disco. Esta fase es únicamente git: commit, merge, tag y push.

## Rama actual
`feature/v2.0.1-context-fix`

## Tareas a Ejecutar

1. **Verificar estado:** `git status` — confirmar que estamos en la rama correcta y ver los cambios pendientes.
2. **Stage all:** `git add -A`
3. **Commit:** `git commit -m "fix(orchestrator): restore Layer 2 placement and rescue Auto-Tiering (v2.0.1)"`
4. **Merge a main:** `git checkout main && git merge --no-ff feature/v2.0.1-context-fix -m "release: v2.0.1 context fix"`
5. **Tag:** `git tag -a v2.0.1 -m "v2.0.1: Fix Context Fading, rescue Feature 012 Auto-Tiering"`
6. **Push:** `git push origin main --tags`
7. **Cleanup rama:** `git branch -d feature/v2.0.1-context-fix && git push origin --delete feature/v2.0.1-context-fix`

## ⚠️ Nota sobre archivado
La carpeta `docs/openspec/changes/v2.0.1-context-fix/` quedó como duplicado (proceso del IDE la tenía bloqueada). Los archivos ya fueron copiados a `docs/openspec/archive/v2.0.1-context-fix/`. Antes del commit, eliminar el duplicado en changes/:
```
Remove-Item -Recurse -Force "docs\openspec\changes\v2.0.1-context-fix"
```
Solo si el directorio existe. Si ya fue eliminado, ignorar.

## Constraints
- Usá `pnpm` si necesitás correr tests (no npm).
- NO modificar ningún archivo de código o docs. Esta fase es SOLO git.
- Documentar en el sdd-report.md: rama mergeada, tag creado, push confirmado.

## Invocación
`/funky-worker @docs/openspec/archive/v2.0.1-context-fix/worker-handoff.md Ejecutá el Git-Ops`
