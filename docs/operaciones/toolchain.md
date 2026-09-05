# Toolchain: pnpm, Node y mantenimiento del repo

> Última actualización: 2026-09-05 · Verificado en este entorno: Node v24.16.0, pnpm global 12.3.4, pin del proyecto pnpm@11.5.0, vitest 4.1.10 (36 archivos / 411 tests PASS)

## Resumen — la respuesta primero

Este proyecto **no depende de la versión global de pnpm que tengas instalada**. El campo `packageManager` en `funky-cli/package.json` es el pin de verdad: cualquier `pnpm install` ejecuta la versión exacta declarada (hoy `pnpm@11.5.0`), descargándola si hace falta. El lockfile nunca se migra por accidente al cambiar de versión global.

Este documento describe cómo funciona ese mecanismo, qué protege, qué puede romperse a futuro y cómo migrar de versión sin dolor.

## Quick path — el día a día

1. Instalar: `pnpm install` desde `funky-cli/` (o la raíz). Usará la versión del pin, no la global.
2. Verificar que el pin sigue activo: `pnpm exec pnpm -v` dentro de `funky-cli/` debe mostrar `11.5.0`, aunque `pnpm -v` fuera del proyecto muestre otra cosa.
3. Migrar de versión de pnpm: **nunca** como efecto secundario. Usar el checklist de abajo.
4. Si el lockfile cambia en un commit sin intención → parar y revisar: algo no respetó el pin.

## Cómo funciona el pin (verificado)

| Capa | Qué es | Dónde vive |
|------|--------|-----------|
| Origen de verdad | `packageManager: pnpm@11.5.0` | `funky-cli/package.json` |
| Política cuando el global no coincide | `pmOnFail: download` (default desde v11.0.0) | `funky-cli/pnpm-workspace.yaml` |
| Prevención de Node incompatible | `engine-strict=true` + `engines: ^22.13.0 \|\| >=23.5.0` | `.npmrc` + `package.json` |
| Lockfile | `pnpm-lock.yaml` commiteado | `funky-cli/` |

Historia: en pnpm ≤10 esto se configuraba en `.npmrc` como `manage-package-manager-versions` y `package-manager-strict`. En pnpm v11.0.0 ambos se **removieron** y se unificaron en `pmOnFail` (`download` = antiguo `manage-package-manager-versions: true`). En pnpm 12+ los settings ya **no se leen de `.npmrc`** (solo auth y registry); viven en `pnpm-workspace.yaml`.

Evidencia observada (2026-09-05): con pnpm 12.3.4 en el PATH, `pnpm install` en `funky-cli/` ejecutó pnpm 11.5.0 exacto (`Done in 4.9s using pnpm v11.5.0`) y dejó el lockfile intacto (`Lockfile is up to date, resolution step is skipped`).

## Decisiones de configuración actuales

| Área | Decisión | Por qué |
|------|----------|---------|
| Versión de pnpm | Pin exacto via `packageManager` + `pmOnFail: download` | Installs reproducibles, lockfile estable |
| Scripts post-instalación | `ignore-scripts=true` | SecOps: bloquear ejecución de scripts maliciosos en install |
| Cuarentena supply-chain | `minimum-release-age=2880` (48h) | Bloquear paquetes recién publicados |
| Integridad del store | `verify-store-integrity=true` | Detectar corrupción/adulteración del store |
| Node | `engines` estricto (`engine-strict=true`) | Nadie instala deps con Node incompatible |
| Versionado de deps | devDeps con versión exacta (`4.1.10` sin `^`) | Reproducibilidad total |

## Riesgos a futuro (ordenados por impacto)

| Riesgo | Cuándo | Impacto si se ignora | Mitigación |
|--------|--------|----------------------|------------|
| Settings de `.npmrc` dejan de leerse | Al subir el pin a pnpm 12.x | `engine-strict`, `ignore-scripts`, `minimum-release-age` y `verify-store-integrity` se vuelven **inertes** | Migrar esas claves a `pnpm-workspace.yaml` (nombres camelCase: `engineStrict`, `ignoreScripts`, `minimumReleaseAge`, `verifyStoreIntegrity`) como parte de la migración de versión |
| Corepack fuera de Node 25+ | Al actualizar Node (hoy 24.16.0, última línea con corepack) | Proyectos que dependían de corepack para su pin pierden el mecanismo | Este repo NO depende de corepack: el pin lo aplica `pmOnFail` del propio pnpm. Verificar entorno al subir de Node |
| Lockfile forward-only | Cualquier install accidental sin pin | Migrado a v12 no vuelve a v11 sin regenerar | Revisar diffs del lockfile en commits/PR; nunca correr `pnpm install --force` por inercia |
| Instalación dual de pnpm (global + versiones gestionadas) | Ya presente en la máquina | Fragilidad si se tocan las carpetas de Node/corepack | Elegir UNA vía de instalación (standalone pnpm) y no mezclar con corepack |
| Dos librerías de prompts (`@clack/prompts` + `@inquirer/prompts`) | Decisión de mantenimiento pendiente | Doble API, doble superficie de breaking changes | Consolidar en una sola librería en algún momento |
| `ci-cd.md` documenta un CI inexistente | Ya verificado: no hay `.github/workflows/` en el repo | Docs desincronizados con la realidad | Verificar dónde vive el CI real (o si se desactivó) y actualizar el doc |

## Checklist de migración de pnpm (siempre deliberada)

- [ ] Decidir la nueva versión (`corepack use pnpm@X` actualiza `packageManager` y el hash)
- [ ] Nota: en pnpm 12+, migrar también las settings del `.npmrc` a `pnpm-workspace.yaml`
- [ ] `pnpm install` en `funky-cli/` (migra el lockfile)
- [ ] Revisar el diff completo del lockfile antes de commitear
- [ ] `pnpm test` (suite completa: hoy 36 archivos / 411 tests)
- [ ] Commit separado solo para la migración (nunca mezclada con features)

## Siguiente paso

- Verificar coherencia del CI (el `ci-cd.md` referencia pnpm 10.23.0 / Node 20 y un workflow que no existe en el repo).
- Decidir la consolidación de prompts (`@clack` vs `@inquirer`).
- Al llegar a pnpm 12.x: migrar settings del `.npmrc` a `pnpm-workspace.yaml` (riesgo #1 de la tabla).