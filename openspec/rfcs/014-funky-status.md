# RFC: 014 - Comando `funky status`

> **Estado:** Draft
> **Tipo:** Feature (CLI)
> **Complejidad:** Baja — 1 archivo nuevo, 1 dependencia (fs)

## 1. El Problema
Cuando estoy en medio de un cambio SDD, no hay forma rápida de ver en qué fase estoy sin abrir archivos manualmente. Quiero saber de un vistazo: ¿qué change estoy trabajando, qué fases tiene, y cuál es la última completada?

## 2. La Propuesta
Un comando `funky status [change-name]` que:

1. Si se pasa `change-name`: lee `openspec/changes/{change-name}/` y muestra el estado.
2. Si NO se pasa: lista todos los directorios en `openspec/changes/` como cambios disponibles.
3. Para cada change, detecta qué archivos existen (`explore.md`, `proposal.md`, `specs/`, `design.md`, `tasks.md`, `verify-report.md`) y marca ✅ o ❌.
4. Muestra la última fase completada como "Siguiente: {fase}".

### Output esperado
```
$ funky status auth-migration

  Change: auth-migration
  ─────────────────────
  ✅ explore.md
  ✅ proposal.md
  ✅ specs/
  ❌ design.md
  ❌ tasks.md
  ❌ verify-report.md

  Siguiente: design

$ funky status

  Cambios disponibles:
  • auth-migration
  • dark-mode
  • i18n-support
```

## 3. Alcance
- **Solo lectura** — el comando no modifica nada.
- **Sin dependencias externas** — solo `fs` y `path`.
- **1 archivo nuevo** en `funky-cli/src/commands/status.js`.
- **1 test** en `funky-cli/tests/status.test.js`.

## 4. Qué NO es esto
- No es un dashboard en tiempo real.
- No lee contenido de los archivos, solo detecta presencia/ausencia.
- No modifica el estado de ningún change.

## 5. Criterios de Éxito
- `funky status` sin args lista cambios disponibles.
- `funky status <name>` muestra checklist de fases.
- `funky status nonexistent` muestra error claro.
- Tests pasan con `pnpm test status`.
