# funky secure — Hardening de dependencias (pnpm)

## ¿Qué problema resuelve?

Endurece el manejo de dependencias del repo frente a la cadena de suministro: lifecycle scripts maliciosos que corren en el `install`, versiones recién publicadas (cuarentena) y secretos commiteados. Es la capa "Proyecto blindado" del estándar Funky AI: pnpm seguro, **por-repo**, idempotente y CI-ready. La filosofía y las decisiones del estándar viven en el [RFC `feature-secure.md`](feature-secure.md); este doc describe lo que el CLI hace hoy.

## ¿Cuándo usarlo?

- En un repo pnpm nuevo, arranca con `funky secure init` para sembrar la política (idempotente, re-ejecutable).
- Para diagnosticar el estado de hardening sin tocar nada, `funky secure doctor`.
- En CI o antes de mergear, `funky secure check` como gate (exit 0/1).

## Comandos

### `funky secure doctor`

Diagnostica el estado de hardening del repo. **No escribe nada** (ni en la máquina ni en el repo): solo sondas de lectura y recomendaciones. Exit 0 si el diagnóstico completa.

Detecta y reporta:

- Versión de pnpm activa, leída de forma **conductual** (`pnpm config list --json` — `config get` es ciego en pnpm v10/11 para las claves del workspace).
- **Cuarentena conductual** (`minimumReleaseAge`): activa o inactiva. Si está inactiva, recomienda el comando exacto: `pnpm config set minimum-release-age 4320 --location=global`.
- Instalaciones duplicadas de pnpm en el PATH (se deduplican los shims del mismo install).
- Señales del repo: `package-lock.json` presente, rangos flotantes (`^`/`~`) en `package.json`, `.env*` trackeados por git, baseline de hooks (seedeado / con drift), marcador de `AGENTS.md`, `allowBuilds` pendiente de aprobación.

Salida de ejemplo (repo virgen):

```
ℹ️ pnpm activo: 11.5.0
⚠️ Cuarentena conductual INACTIVA: nada bloquea dependencias <72h. Aplica: pnpm config set minimum-release-age 4320 --location=global.
ℹ️ AGENTS.md sin marcador funky-secure: inicia con `funky secure init`.
ℹ️ Diagnóstico completo. `funky secure init` aplica la política.
```

### `funky secure init`

Aplica la política pnpm de forma **idempotente** (re-ejecutable sin romper nada):

1. **`pnpm-workspace.yaml`** — merge del seed de la postura (7 claves estándar): `ignoreScripts: true`, `minimumReleaseAge: 4320`, `engineStrict: true`, `blockExoticSubdeps: true`, `trustPolicy: no-downgrade`, `verifyStoreIntegrity: true`, `allowBuilds: []`. El merge preserva `packages:`, comentarios y claves desconocidas; un valor existente distinto se **conserva** y se reporta como "conservado (distinto)".
2. **`AGENTS.md`** — bloque de package manager (marcador `<!-- funky-secure -->`), conservador: no sobrescribe el contenido, appenda al final y no se duplica (idempotencia por marcador). Con TTY pide confirmación; sin TTY agrega el bloque con warning.
3. **Baseline de hooks** — snapshot de `.vscode/tasks.json` y `.claude/settings.json` en `.funky/secure-state.json`, para detectar inyecciones por drift.
4. **`.gitignore`** — agrega `.funky/` (append-only, una sola vez).
5. **Pin de `packageManager`** — `"packageManager": "pnpm@<versión activa>"` en `package.json`.

**Postura obligatoria**: con TTY se pregunta (selector **sin default**); sin TTY `--posture` es obligatorio (`fail-silent` | `fail-fast`) — sin él, exit 1 y **ninguna escritura**. Postura inválida → exit 1.

Resumen de salida (veredictos `applied`/`skipped`/`conflicted`/`pending`):

```
✅ Repo endurecido (postura fail-silent).
  Aplicado: ignoreScripts (workspace), minimumReleaseAge (workspace), … , AGENTS.md (creado), baseline de hooks (2 archivos), .gitignore (.funky/ agregado)
```

### `funky secure check`

Valida que el repo **conforme** la política pnpm. CI-ready:

- **Exit 0** — repo conforme.
- **Exit 1** — violaciones, o *fail-closed* si falla el probe de pnpm/git.
- **Exit 0 con WARN** — repos npm/yarn sin `pnpm-workspace.yaml`: solo se informa, no se bloquea.

Flags: `--rebaseline` re-seedea el baseline de hooks y revalida contra el baseline fresco.

Salida conforme: `✅ El repo conforma la política pnpm segura.`

Salida con violaciones:

```
❌ Violaciones:
  - missing-lockfile: pnpm-lock.yaml ausente: sin lockfile no hay inmutabilidad reproducible.
```

## Violaciones que detecta `check`

| Code | Significado |
|------|-------------|
| `missing-lockfile` | `pnpm-lock.yaml` ausente: sin lockfile no hay inmutabilidad reproducible |
| `package-lock` | `package-lock.json` presente en un repo pnpm (mezcla npm/pnpm) |
| `floating-ranges` | Rangos `^`/`~` en `package.json` |
| `config-mismatch` | Claves estándar de la postura ausentes o distintas en `pnpm-workspace.yaml` |
| `quarantine-inactive` | Cuarentena conductual inactiva (recomienda el comando exacto) |
| `pending-approval` | `allowBuilds` con el placeholder de pnpm tras un install fallido |
| `env-tracked` | `.env*` trackeado por git |
| `env-unignored` | `.env` presente sin entrada en `.gitignore` |
| `hook-drift` | Hooks de editor cambiados vs baseline |
| `pnpm-probe` / `git-probe` | Probe de pnpm/git no disponible (fail-closed) |

## Posturas de hardening

| Postura | Semilla | Comportamiento |
|---------|---------|----------------|
| `fail-silent` | 7 claves estándar | `ignoreScripts: true`: no ejecuta lifecycle scripts de dependencias **ni** del proyecto raíz. Opaca pero total. |
| `fail-fast` | 7 claves estándar + `strictDepBuilds: true`, `onlyBuiltDependencies: []`, `ignoredBuiltDependencies: []` | El install **falla** ante scripts de build de dependencias hasta decidir aprobar/ignorar en las listas. **No cubre** los scripts de la raíz del repo. Al sembrarla, `init` muestra un warning RFC sobre el mantenimiento de las listas. |

## Estado local (`.funky/`)

`funky secure init` crea `.funky/secure-state.json` (gitignored, por máquina): guarda el baseline de hooks (sha256 o `absent`) y la postura sembrada. `check` compara contra él para detectar drift; el rebaseline es **siempre explícito** (`--rebaseline`).

## Referencias

- RFC y decisiones del estándar: [`feature-secure.md`](feature-secure.md).
