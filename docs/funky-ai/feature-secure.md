# feature-secure — RFC: comando `funky secure`

> Estado: **RFC / borrador de diseño** · Fecha: 2026-08-05 · Decisiones de filosofía cerradas, alcance técnico a desarrollar vía SDD. Documento de draft: describe lo que *haremos*, no lo que ya existe.

## 1. Filosofía: proteger a la persona, no solo el repo

La amenaza real de la cadena de suministro de 2026 no roba *código*: roba **credenciales personales** de la máquina del desarrollador (npm tokens, GitHub PATs, AWS keys, SSH, Vault, Stripe, Slack). El malware se ejecuta en el momento de `install` mediante lifecycle scripts de dependencias (`preinstall`/`postinstall`), exactamente en la ventana que `npm audit` no cubre: para cuando auditas, el script ya corrió.

Por eso la postura de Funky AI es **defensa en profundidad centrada en la persona**: el ecosistema debe garantizar que un usuario pueda instalar dependencias sin exponer su identidad y sus credenciales, por defecto, con configuración mínima.

### Regla de oro

> **Lo único global debe ser lo que ningún repo necesita desactivar. Todo lo que un repo podría querer anular va por-repo.**

Un setting global que rompa el flujo de algún repo (ej. bloquear todos los scripts de instalación en npm) se convierte en una regla que la gente desactiva o evade — y entonces protege a nadie. La consistencia del estándar se logra aplicándolo **por-repo de forma uniforme**, no imponiéndolo globalmente.

### Los dos planos

| Plano | Ámbito | Principio |
|---|---|---|
| **Global mínimo necesario** | Máquina personal del usuario | Solo defensas que ningún repo necesita desactivar; puro beneficio, cero fricción |
| **Proyecto blindado** | Cada repo | Estándar completo de seguridad aplicado consistentemente por `funky secure` |

## 2. Decisiones tomadas (2026-08-05)

1. **Nombre del comando: `funky secure`** — verbo accionable que cubre aplicar, auditar y verificar.
2. **npm: mantener `ignore-scripts=true` global** en `~/.npmrc`. Decisión explícita del ecosistema: la persona decide que ningún install npm ejecute lifecycle scripts. Si algún repo npm necesitara builds nativos, la excepción se gestiona por-repo, nunca anulando el global.
3. **pnpm: tal cual está.** No se toca su configuración global. Su defensa por defecto (bloqueo de lifecycle scripts de dependencias desde v10+) es la capa global de pnpm; la gestión de `approve-builds` es una decisión **explícita y por-repo**.
4. **Cuarentena global (`minimum-release-age`) — decisión cerrada.** Aclaración técnica: `minimum-release-age` es **solo de pnpm**; npm no lo implementa (por eso npm muestra el warning *Unknown project config*). La forma de env var global **verificada empíricamente** es **`pnpm_config_minimum_release_age=4320`** — no `npm_config_...` (ver §4.1). La persistencia es **manual del usuario** (decisión 10): `funky secure` nunca la setea; solo recomienda el comando exacto y verifica la aplicación conductualmente (loop de verificación en §6). Es un cambio de máquina personal, no de código del repo: **no entra en la PR de `funky secure`**. Además se mantiene por-repo en `pnpm-workspace.yaml` (ubicación canónica de settings, decisión 9) como cinturón y tirantes.
5. **Bloqueo de npm: DESCARTADO (2026-08-05).** Las tools globales instaladas vía npm (claude-code, codegraph, gemini-cli, opencode-ai, funky-cli, pnpm@10.23.0) dependen de la vía de actualización npm; un shim las dejaría inservibles. La protección para npm accidental queda en: regla (`AGENTS.md`/`secops.md`) + detección (`funky secure check`/`doctor`) + `ignore-scripts=true` existente. Sin shims, sin bloqueo duro.
6. **`funky secure` asume pnpm como gestor estándar.** Independiente de antigravity (no toca `funky scaffold` ni su `secops.md`), pero **no agnóstico de gestor**: el estándar es pnpm. Repos con otro gestor quedan fuera del estándar por definición.
7. **Cuarentena = 4320 min (72 h / 3 días)** — decisión 2026-08-05 (debate de `ideas-secure2.md`): la ventana sube de 48 h a 72 h, con margen sobre la ventana típica de ataques (ChainDrop <48 h). **Contexto de pnpm v11 (dic-2025):** `minimumReleaseAge` ya viene con default de **1440 min (24 h)** — nuestro 4320 es un hardening por encima del default del gestor. Existe `minimumReleaseAgeExclude` para exenciones puntuales (hotfix crítico) — a definir su uso en la feature.
8. **`ignore-scripts=true` bloquea también los scripts raíz (se mantiene)** — decisión 2026-08-05: el blindaje por-repo mantiene `ignore-scripts=true`, bloqueando lifecycle scripts de dependencias **y** del proyecto raíz (`preinstall`/`prepare`/`postinstall`), verificado empíricamente (TEST B, 2026-08-05). Es la **recomendación de la comunidad** (bloqueo por defecto de scripts); quien use husky/lint-staged hace los **mínimos cambios de adaptación bajo su propio consentimiento o riesgo** (p.ej. `pnpm exec husky` manual tras clone) — **no** es una capability de la feature. Consecuencias: (a) repos con husky/lint-staged no instalan hooks vía `prepare`; (b) **`pnpm approve-builds` NO desbloquea eso** — su alcance son solo scripts de dependencias (`onlyBuiltDependencies`), el `prepare` raíz nunca entra en esa lista; (c) la alternativa pnpm-nativa `strictDepBuilds: true` (falla el install ante scripts de deps, sin bloquear raíz) se **descartó explícitamente** el 2026-08-05 como reemplazo — registrado para no re-litigar. **Matiz del 2026-08-05 (ejemplos del creador):** el creador la combina con `onlyBuiltDependencies: []` + `ignoredBuiltDependencies: []` (deny-list vacía → nada aprobado por defecto). Sigue sin reemplazar a `ignore-scripts=true`: su semántica es *fail-fast* (si una dep tiene scripts de build, el install **falla** hasta que decidas aprobarla/ignorarla en la lista), mientras `ignore-scripts=true` es *fail-silent* (no ejecuta, no falla, no bloquea el install). Y lo crítico: **no protege el `prepare`/`preinstall` del proyecto raíz** — que es justo el vector que nuestro TEST B demostró que `ignore-scripts` sí bloquea. La postura del creador es más "ruidosa" (obliga a decidir por cada paquete), la nuestra es más "opaca pero total" (no corre nada, incluido raíz); ambas son válidas como filosofía, pero no son equivalentes. **Cierre 2026-08-05:** el RFC NO elige una sola — `funky secure init` **pregunta al usuario cuál postura sembrar** (ver §5 y §6); el `approve` sirve a ambas (en fail-fast las listas deben mantenerse con él).
9. **`pnpm-workspace.yaml` es la superficie de settings de comportamiento del estándar, no `.npmrc`** — decisión 2026-08-05 (docs pnpm, fuente de config): en pnpm v10/11 los settings de comportamiento viven en `pnpm-workspace.yaml` (por-repo) o en el config global `~/.config/pnpm/config.yaml`; **`.npmrc` queda solo para registry/auth**. El hallazgo de la máquina ("pnpm 11.5.0 ignora npmrc") **no es un bug de Windows: es el diseño actual** — por eso la cuarentena por-repo se configura en YAML y la verificación de `doctor` es conductual, nunca vía `config get`.
10. **`funky secure` nunca muta la máquina del usuario** — decisión 2026-08-05: la capa global es solo **estado + recomendaciones accionables**. `funky secure global` (v2) **lee** (`npm get ignore-scripts`, sondas conductuales de la cuarentena pnpm — `pnpm config get` es ciego) y **recomienda** el comando exacto; la persona aplica manualmente y el tool **verifica** (loop detect → recomendar → verificar). Justificación: un tool de seguridad que escribe en el entorno del usuario amplía la superficie de ataque (lección ChainDrop: hooks inyectados) — sin mutación no hay superficie que explotar. Cierra la decisión abierta de persistencia de §6: la cuarentena global la aplica el usuario, no el CLI. **Alcance preciso:** la no-mutación aplica a la **máquina del usuario** (env vars, config global); `funky secure` **sí escribe en el repo** (`init`/`approve` siembran `pnpm-workspace.yaml`/`AGENTS.md`), siempre con confirmación e idempotencia.
11. **Checkpoint ligero de secretos commiteados en `funky secure check` (v1)** — decisión 2026-08-05: `check` detecta (a) archivos `.env*` trackeados por git y (b) `.env` existente sin entrada en `.gitignore` (drift). Es **presencia + estado de tracking**, no escaneo de contenido ni de historial (gitleaks/trufflehog quedan fuera de alcance). Motivo: el threat model de la sección 1 es el robo de credenciales; una vía de fuga de credenciales que no es la cadena de suministro (`.env` commiteado) no debe quedar fuera del mensaje de `check`.

## 3. Amenaza de referencia: ChainDrop / Shai-Hulud (ago-2026)

Campaña que comprometió `keyv`, `flat-cache`, `file-entry-cache`, `cacheable`, `cache-manager` y +440 paquetes (~2.000 M instalaciones/mes). Vector:

- Publicación de versiones envenenadas con `"preinstall": "node setup.mjs"` en `package.json`.
- `setup.mjs` descarga Bun y ejecuta `Math_Symbol.js` / `math_init.js` (stealer de credenciales + worm).
- Exfiltración a repos GitHub públicos y a `npm-cache[.]com`, con infiltración en `.vscode/tasks.json` y `.claude/settings.json` (hooks que se ejecutan al abrir el repo en el editor).

### IoCs que `funky secure` debe detectar

**Dos categorías con distinta vida útil — por eso el diseño las separa:**

1. **IoCs estructurales (no caducan, se mantienen localmente):**
   - Archivos: `setup.mjs`, `Math_Symbol.js`, `math_init.js`.
   - Hooks inyectados: modificaciones **inesperadas** en `.vscode/tasks.json` y `.claude/settings.json`. Se detecta por *diff* (¿cambió algo que no tocamos?), no por autor: los atacantes forjan identidades, y el autor "claude" solo es relevante como señal débil. El hook `.claude/` protege a cualquier usuario de funky-ai que use ese ecosistema, no solo a quien lo usa.
2. **Blocklist de paquetes/versiones comprometidas (caduca, se consulta en vivo):**
   - La lista crece en tiempo real (ChainDrop pasó de 11 a +440 paquetes en horas). **No se vende** en el repo: `funky secure audit` la consulta a fuentes vivas (GitHub Advisory DB / OSV), con una caché local pequeña solo como override de emergencia. El repo mantiene la lista de *ejemplos conocidos* (keyv 6.0.0, flat-cache 6.1.24, etc.) como documentación, no como fuente de verdad.

### 3.2 Registro de auditorías por incidente (capability de la feature)

Cuando sale una noticia de ataque (ChainDrop, o el próximo), `funky secure` captura los files y versiones reportados en un **doc de incidente generado desde un template integrado** y escanea el repo contra ellos. No se mantienen templates sueltos en `docs/` — el template es *output* de la feature, definido aquí como especificación:

**Output generado por `funky secure incident <slug>`** en `docs/funky-ai/security-audits/YYYY-MM-DD-<slug>.md` (ej. `2026-08-05-chaindrop.md`):

```markdown
# AUDIT — <Nombre del ataque>

> Fecha de auditoría: YYYY-MM-DD · Fuente: <URL noticia/advisory> · Severidad: <CRÍTICA|ALTA|MEDIA|BAJA>
> Resultado: <PENDIENTE | LIMPIO | COMPROMETIDO>

## Resumen del ataque
<1–3 líneas: vector, timeline, alcance>

## 1. IoCs estructurales (señales de técnica — no caducan)
### Files sospechosos
- `ruta/archivo` — <qué hace>
### Hooks inyectados (detectar por diff, no por autor)
- `.vscode/tasks.json` — <qué se inyecta>
- `.claude/settings.json` — <qué se inyecta>
### Patrones de script en dependencias
- `preinstall` → `node <script>`

## 2. Blocklist de versiones (hechos del momento — caduca)
- `paquete@version`

## 3. Escaneo del repo (reproducible)
| Repo / branch | Comando | Resultado |
|---|---|---|
Checkpoints: pnpm audit · lockfile vs §2 · node_modules vs §1 · diff hooks editor · scripts nuevos en deps
### Resultado
> **<LIMPIO / COMPROMETIDO / PENDIENTE>** — <evidencia>

## 4. Acciones tomadas
## 5. Lecciones aprendidas
```

**Flujo de la feature:** noticia → `funky secure incident <slug>` genera el doc desde el template integrado → se rellenan IoCs y blocklist con lo reportado → el escaneo del §3 se ejecuta (manualmente hoy, automatizado con `funky secure audit --incident <file>` en v1.1/v2) → se registra **LIMPIO / COMPROMETIDO / PENDIENTE** con evidencia. La carpeta generada es la *documentación de ejemplos conocidos* del §3; la fuente de verdad para bloquear sigue siendo la consulta viva (GitHub Advisory DB / OSV). Ejemplo real: auditoría ChainDrop de funky-ai el 2026-08-05 → **LIMPIO** (0 vulns en 98 deps, 0 coincidencias de blocklist en lockfile, sin IoCs en `node_modules`, sin diffs en hooks de editor).

## 4. Capas de defensa

### 4.1 Global mínimo necesario (máquina personal)

| Defensa | Dónde | Por qué es seguro a nivel global |
|---|---|---|
| `ignore-scripts=true` (npm) | `~/.npmrc` | Decisión de ecosistema; bloquea el vector completo en npm |
| Bloqueo por defecto de lifecycle scripts de dependencias (pnpm) | Comportamiento nativo de pnpm v10+ | Los scripts solo corren con `approve-builds` explícito por repo |
| Cuarentena de publicación (`minimum-release-age`) | Env var de usuario `pnpm_config_minimum_release_age=4320` (global — persistencia manual del usuario, decisión 10; fuera de PR) **+** `pnpm-workspace.yaml` por-repo vía `funky secure init` (`minimumReleaseAge: 4320`) | Solo pnpm; evita instalar versiones de <72 h (3 días), ventana típica de los ataques; hardening sobre el default de pnpm v11 (1440 min / 24 h) |

**Reglas globales recomendadas en la máquina del usuario** (sección dedicada — cada una cumple la regla de oro: *ningún repo necesita desactivarla*):

1. **`ignore-scripts=true` para npm** → en `~/.npmrc` (decisión 2). Recomendación de comunidad; bloquea el vector completo de lifecycle scripts en npm. Si un repo npm necesitara builds nativos, la excepción se gestiona por-repo, nunca anulando el global.
2. **Cuarentena `minimumReleaseAge: 4320` (72 h) para pnpm** → env var de usuario `pnpm_config_minimum_release_age=4320` (forma **verificada empíricamente**, §4.1) o config global nativa `~/.config/pnpm/config.yaml` (lectura en pnpm 11.5.0 a verificar en SDD — ver §6). Hardening sobre el default de pnpm v11 (1440 min / 24 h). **Persistencia manual del usuario** (decisión 10): `funky secure` solo recomienda el comando exacto y verifica la aplicación conductualmente.
3. **(v2) `funky secure global`** — **estado y recomendaciones** (nunca muta la máquina, decisión 10): lee `npm get ignore-scripts` y sondea la cuarentena pnpm conductualmente; da el comando exacto y verifica la aplicación manual. Sin shim de gestor.

**Qué NO va como regla global (va por-repo — regla de oro):**
- `engineStrict` — un repo puede querer otro contrato de versión de Node → por-repo (`pnpm-workspace.yaml`).
- `ignore-scripts` de pnpm — es blindaje **por-repo** (decisión 8), no global: quien adapte hooks (husky) lo hace bajo su consentimiento; la máquina no lo fuerza.
- Versiones exactas y `approve-builds` — decisiones de resolución por-repo.
- `registry`/auth — por-ecosistema, nunca en el global del usuario salvo intención explícita.

> **Bloqueo de npm: DESCARTADO** (decisión 2026-08-05). Las tools globales vía npm dependen de la vía de actualización npm; la protección para npm accidental es regla (`AGENTS.md`/`secops.md`) + detección (`check`/`doctor`) + `ignore-scripts=true` ya activo.

> **Verificación obligatoria antes de aplicar (hecha el 2026-08-05 en pnpm 11.5.0):** la cuarentena solo protege si el gestor realmente lee la configuración. La doc oficial confirma la opción `minimumReleaseAge` pero no garantiza la forma concreta `npm_config_...` para esta clave — y el test empírico le dio la razón al caveat:
>
> - **`npm_config_minimum_release_age=4320` → NO bloquea** (instala paquetes de <72 h sin error). El prefijo npm solo funciona para settings compatibles con npm (ej. `ignore-scripts`); para settings propios de pnpm no vale.
> - **`pnpm_config_minimum_release_age=4320` → SÍ bloquea** (`ERR_PNPM_NO_MATURE_MATCHING_VERSION`, con el cutoff exacto), verificada con `electron-to-chromium@1.5.401` (test ejecutado con 2880; el mecanismo es independiente del valor — el estándar pasó a 4320 el 2026-08-05).
> - `pnpm config get` es **ciego** en esta versión (devuelve `undefined` incluso con la env var puesta): la verificación debe ser **conductual**, no vía `config get`.
>
> **Procedimiento para aplicarla de forma permanente:** repetir este test en la máquina destino (env var temporal + `pnpm add` de un paquete publicado <72 h (3 días) → debe fallar con el error de release age), y solo entonces persistirla en las env vars de usuario. `funky secure doctor` debe cubrir esta comprobación de forma automatizada (lección aprendida: pnpm v10/11 dejó de leer settings de comportamiento desde `.npmrc` — es diseño, no bug (decisión 9); confiar en un `.npmrc` endurecido dejaría la cuarentena silenciosamente inactiva).

### 4.2 Proyecto blindado (por-repo, estándar Funky AI)

`funky secure init` debe dejar el repo con:

- **Settings de comportamiento en `pnpm-workspace.yaml`** (decisión 9; el `.npmrc` del repo queda solo para registry/auth si acaso — pnpm v10/11 no lee settings desde npmrc):
  - `ignore-scripts=true` — bloqueo de lifecycle scripts (dependencias **y** raíz: `preinstall`/`prepare`/`postinstall`; decisión 2026-08-05 — consecuencias en §2.8)
  - `minimumReleaseAge: 4320` — cuarentena de 72 h (3 días) para paquetes recién publicados
  - `engineStrict: true` — respeto del contrato de versión de Node
  - `blockExoticSubdeps: true` — dependencias transitivas solo desde fuentes confiables (registry, local, workspace); git/tarball quedan restringidos a dependencias directas (pnpm v10.26+). Refuerzo adoptado de los ejemplos del creador (2026-08-05): el `allow-git=none` de ese material **no existe como clave real de pnpm**; el control real para el vector git es este.
  - `trustPolicy: no-downgrade` — bloquea instalar versiones con procedencia más débil que la actual (pnpm v10.16+); evita downgrades/regresiones silenciosas de fuentes. Adoptado de los ejemplos del creador (2026-08-05); el propio material lo marca como "emerging" pero ya está documentado y es real.
  - integridad del store (`verify-store-integrity`) — **clave YAML exacta a confirmar en SDD** con verificación conductual de `doctor`
- **Versiones exactas** — sin `^` ni `~` en `package.json`; lockfile obligatorio y congelado (`--frozen-lockfile` en CI).
- **Pin del gestor en `package.json`** — campo `"packageManager": "pnpm@<versión-exacta>"`: señala el gestor estándar a corepack/setup-pnpm y hace detectable el uso accidental de otro gestor (refuerzo declarativo de la política pnpm-only, decisión 6, sin shims).
- **`AGENTS.md` inyectado** (solo si no existe): regla básica pnpm-only + referencia al estándar. Es el contrato raíz fuera de antigravity. **No se sobrescribe** un `AGENTS.md` existente; en ese caso la regla queda cubierta por `check`/`doctor`.
- **Reglas de repo (antigravity)** — `.agents/rules/secops.md` sembrado si falta, solo para proyectos antigravity. `funky secure` **no toca `funky scaffold`** ni su `secops.md`: inyecciones propias e independientes.
- **Política de `approve-builds`** — aprobar builds solo con revisión explícita del paquete; mínimo absoluto en `onlyBuiltDependencies`. En pnpm v10.26+ existe **`allowBuilds`** (control granular **por versión**: `esbuild: true` o `nx@21.6.4: true`, y por URL de repo git) que **reemplaza** `onlyBuiltDependencies` — candidato preferido del flujo `approve` a confirmar en SDD (adoptado de los ejemplos del creador, 2026-08-05).
- **Secretos commiteados** — checkpoint ligero en `check` (decisión 11): `.env*` trackeado por git o `.gitignore` con drift (`.env` presente sin entrada) = fallo de estándar. Solo presencia + tracking, sin escaneo de contenido.
- **CI gate** — `funky secure check` + `funky secure audit` como paso de CI, no solo tests.

### 4.3 Más allá de la máquina de desarrollo: CI, Dependabot y producción

Fuente: debate de `docs/funky-ai/ideas-secure2.md` (2026-08-05). La política de dependencias debe ser **la misma** en desarrollo, CI y producción — un entorno con controles más débiles anula el resto.

**Política común de entorno:**
- **pnpm exclusivo** en CI y producción; `npm` no se usa como alternativa (política declarativa, decisión 5).
- Lockfile único y commiteado: `pnpm-lock.yaml`. Los workflows instalan con `pnpm install --frozen-lockfile` (o `--prod --frozen-lockfile` en producción) — el lockfile garantiza que CI/prod usan exactamente las versiones fijadas, sin resolución.
- **`minimum-release-age` es config de entorno, no viaja en el lockfile** (correcto en `ideas-secure2.md`): debe establecerse explícitamente donde viva la resolución (dev y `pnpm install` no-frozen), no solo en la config local del proyecto. En CI con `--frozen-lockfile` no hay resolución, por lo que la cuarentena es **mayormente inerte** ahí — las protecciones reales de CI son frozen + gate de audit + revisión del diff del lockfile. Verificación empírica pendiente de si el check dispara en installs frozen (ver §6).
- **`ignore-scripts=true` en runners/servidores:** llega vía el `pnpm-workspace.yaml` commiteado (decisión 9) — en CI/prod **no rompe nada** (los hooks de git no corren en runners), pero ojo: un `preinstall` raíz que el proyecto necesite (ej. codegen) se saltaría silenciosamente. `approve-builds` no lo desbloquea (solo cubre scripts de dependencias); la decisión es por-repo.
- **Pinning del propio CI:** GitHub Actions con SHA (no tags) y la instalación de pnpm con versión exacta (`pnpm/action-setup` + version). El supply-chain de CI no son solo las deps.

**Revisión de PRs de Dependabot** (política de merge, nunca auto-aceptar solo porque la generó una herramienta):
- El diff debe afectar únicamente dependencias y lockfile esperado: `package.json` (incluidos rangos) y `pnpm-lock.yaml`.
- **No debe aparecer `package-lock.json`** ni ningún lockfile no autorizado.
- Atención extra a updates mayores y a **deps nuevas** en el diff del lockfile (el vector ChainDrop entraba por deps nuevas en paquetes existentes).
- Ejecutar `pnpm audit` y los tests; `funky secure check`/`audit` como gate.
- Si la update introduce paquetes con build scripts → la PR debe incluir la decisión de `approve-builds`, no dejarla implícita.
- **Tensión cuarentena ↔ Dependabot:** si la versión propuesta tiene <72 h, el check de CI/install fallará (`ERR_PNPM_NO_MATURE_MATCHING_VERSION`) hasta pasar la cuarentena — es el control funcionando, no un bug; no "arreglar" el check.
- La configuración de Dependabot vive en `.github/dependabot.yml` (grouping, update types) — parte del estándar a validar por `check`.

## 5. Alcance de desarrollo — `funky secure`

```
funky secure doctor     Diagnóstico de postura de seguridad de la máquina/repo.
                        Detecta: config leída o ignorada, cuarentena global y por-repo activas,
                        duplicidad/ambigüedad de la instalación de pnpm en PATH (decisión abierta §6),
                        lockfile vs blocklist, IoCs estructurales, ^/~ en package.json.
funky secure init       Aplica el blindaje estándar pnpm: settings de comportamiento en pnpm-workspace.yaml
                        (minimumReleaseAge 4320, engineStrict, blockExoticSubdeps, trustPolicy) + AGENTS.md
                        (regla pnpm, solo si no existe) + policy approve-builds + reglas antigravity si aplica.
                        PREGUNTA la postura de build scripts (decisión 8, cierre 2026-08-05):
                        (a) fail-silent — ignore-scripts=true (no corre nada, incluido raíz; la nuestra)
                        (b) fail-fast — strictDepBuilds=true + onlyBuiltDependencies[]/ignoredBuiltDependencies[]
                            (falla el install ante scripts de deps hasta decidir; NO cubre raíz — documenta
                            el hueco y sugiere complemento manual ignore-scripts si el usuario lo quiere total).
                            ADVERTENCIA (mostrada en la pregunta y en la doc del estándar): esta postura
                            obliga a mantener las listas onlyBuiltDependencies/ignoredBuiltDependencies al
                            día — cada paquete con scripts de build no listado rompe el install; un repo
                            que no las mantiene empieza a fallar installs silenciosamente "por mantenimiento",
                            y hay riesgo de aprobar por costumbre sin revisar (fatiga de aprobaciones).
                        Idempotente: no sobrescribe config ni AGENTS.md existentes sin confirmación.
funky secure incident <slug>  Genera el doc de incidente desde el template integrado (§3.2) y, si se le pasan
                        los IoCs, deja el repo escaneado contra ellos. Output: docs/funky-ai/security-audits/YYYY-MM-DD-<slug>.md.
funky secure audit      pnpm audit + blocklist consultada en vivo (GitHub Advisory DB / OSV, con caché local
                        de emergencia) + escaneo de IoCs estructurales. Acepta --incident <file> para escanear
                        contra un doc de incidente concreto. Pensado para CI: salida máquina-legible y exit code.
funky secure check      Valida el estándar pnpm (lockfile único, sin ^/~, settings de pnpm-workspace.yaml,
                        cuarentena activa, secretos commiteados — .env* trackeado / drift de .gitignore —,
                        ausencia de package-lock.json a la deriva) con exit code para CI.
                        Las reglas R1/R2/R3 de secops.md son la versión antigravity de este estándar.
funky secure approve    Flujo explícito de aprobación de builds (pnpm approve-builds con revisión).
funky secure global     Estado + recomendaciones de la capa global mínima (defensas de máquina).
                        Solo lectura: npm get ignore-scripts, sondas conductuales de la cuarentena pnpm.
                        NUNCA setea nada en la máquina del usuario (decisión 10) — recomienda el
                        comando exacto y verifica que la persona lo haya aplicado. Sin shim de gestor.
```

### Fases objetivo

1. **v1 mínimo:** `doctor` + `init` (blindaje de settings en `pnpm-workspace.yaml` + AGENTS.md idempotente) + `check` con exit code.
2. **v1.1:** `audit` con blocklist e IoCs + `incident <slug>` (generación de doc desde template integrado) y consumo vía `--incident <file>`.
3. **v2:** `approve` + `global` (cuarentena — solo estado + recomendaciones, nunca setea; decisión 10) + integración en CI template del ecosistema.

### Fuera de alcance v1 (decisión explícita)

- **Socket Firewall** — descartado por el usuario por complejidad.
- **NPQ** — es npm-céntrico y el estándar de la feature es pnpm; no aporta al flujo pnpm.
- **Bloqueo de npm / shims de gestor** — descartado (2026-08-05): las tools globales vía npm dependen de la vía de actualización npm.
- **Tocar `funky scaffold` o su `secops.md`** — `funky secure` tiene inyecciones propias e independientes.
- **Soportar otros gestores como estándar** — la feature asume pnpm-only.
- Cambios a la configuración global de pnpm.
- **Mutar la máquina del usuario** — `funky secure` nunca setea env vars ni config de usuario (decisión 10): solo diagnostica, recomienda y verifica.
- **Escaneo de contenido/historial de secretos** (gitleaks, trufflehog) — fuera de alcance; el estándar solo detecta presencia + tracking de `.env*` (decisión 11).

## 6. Decisiones abiertas

- **Revisar la duplicidad de instalaciones de pnpm** — la instalación se movió de ubicación porque el disco C: carecía de espacio disponible: `pnpm@10.23.0` global instalado vía npm en `C:\Users\cb147\AppData\Roaming\npm` vs `pnpm 11.5.0` standalone en `%LOCALAPPDATA%\pnpm` (el que gana en PATH). Decidir cuál es la canónica y reconciliar (duplicidad lateral detectada el 2026-08-05).
- **Cuarentena global — mecanismo resuelto, loop de verificación pendiente:** `funky secure` **nunca setea** (decisión 10); la persistencia es **manual del usuario** (env var `pnpm_config_minimum_release_age=4320` — verificada empíricamente — o `~/.config/pnpm/config.yaml` — lectura en pnpm 11.5.0 a verificar en SDD). Pendiente: diseñar el loop **detect → recomendar comando exacto → verificar aplicación conductual** (la lección de la cuarentena silenciosamente inactiva: sin verificación, la recomendación puede quedar sin aplicar).
- **Documentar la adaptación mínima para hooks en repos blindados** — con `ignore-scripts=true` (decisión 8), quien use husky/lint-staged lo adapta **bajo su propio consentimiento o riesgo** (p.ej. `pnpm exec husky` manual tras clone); **no** es capability de la feature — solo documentar la adaptación mínima en la doc del estándar. **`approve-builds` no cubre el `prepare` raíz** (solo scripts de dependencias) — aclarado 2026-08-05.
- **Claves YAML exactas de pnpm-workspace.yaml a confirmar en SDD** — `ignoreScripts` (¿nombre en YAML?), `verifyStoreIntegrity`, `engineStrict`, `minimumReleaseAge`, `blockExoticSubdeps`, `trustPolicy`, `allowBuilds`; confirmar lectura real con verificación conductual de `doctor` (decisión 9: npmrc no es superficie de settings en pnpm v10/11). `blockExoticSubdeps`, `trustPolicy` y `allowBuilds` están **documentados y son reales** (pnpm v10.16+/v10.26+) — incorporados a §4.2 el 2026-08-05 desde los ejemplos del creador; el `allow-git=none` de ese material quedó descartado por no existir como clave.
- **Postura de build scripts preguntada por `init` (resuelta)** — el RFC no elige entre fail-silent (`ignore-scripts=true`) y fail-fast (`strictDepBuilds=true` + listas): `funky secure init` **pregunta al usuario** cuál sembrar (decisión 8, cierre 2026-08-05; §5). La opción fail-fast lleva **advertencia explícita** (mantenimiento de listas, riesgo de fatiga de aprobaciones — §5). Pendiente en SDD: diseño de la pregunta (2 opciones, sin default silencioso, con la advertencia embebida), qué hace `doctor`/`check` ante cada postura (validar consistencia de las listas en fail-fast), y si la documentación del estándar explica ambos contratos (incluido el hueco de raíz en fail-fast).
- **Verificación empírica** de si `minimum-release-age` dispara en `pnpm install --frozen-lockfile` (si no dispara, en CI la cuarentena es solo cosmética — confirmar y documentarlo en §4.3).
- **Política de `minimumReleaseAgeExclude`** — la decisión 7 menciona las exenciones puntuales pero no define su uso: ¿quién autoriza una exención, cómo se registra, caduca? (riesgo: una exención mal gestionada convierte la cuarentena en cosmética).
- **Baseline de hooks de editor** — §3.2 detecta "modificaciones inesperadas" en `.vscode/tasks.json`/`.claude/settings.json` por *diff*, pero el RFC no define contra qué: ¿diff vs HEAD (si están trackeados) o snapshot tomado por `init`? A especificar en SDD.
- **Formas de la recomendación por plataforma** — la env var global se recomienda distinto en Windows (`setx`) que en POSIX (export en shell profile); la recomendación exacta de `global` debe cubrir ambas.
- Diseño del template `AGENTS.md` inyectado por `init` (contenido mínimo + idempotencia) a especificar en SDD.
- Elección de la fuente viva de blocklist (GitHub Advisory DB vs OSV) y política de caché local para `funky secure audit`.
- Wiring de `funky secure check` en el `ci.yml` del ecosistema y en los templates de CI.
- La siembra de settings de comportamiento (`pnpm-workspace.yaml`) es responsabilidad de `funky secure init`, **no** de `funky scaffold` (que no se toca).
- Formato legible por máquina del template integrado de incidentes (§3.2) para que `incident` y `audit --incident` puedan parsearlo de forma fiable.
- Formalización del alcance técnico completo vía SDD (proposal → spec → design → tasks).
