# ideas-secure — Recomendaciones para el debate

> Estado: **documento de debate — decisiones cerradas el 2026-08-05** · Fecha: 2026-08-05 · `ideas-secure.md` y `feature-secure.md` ya reflejan el consenso (RFC actualizado); este doc queda como registro del debate.

## 1. Resumen ejecutivo

El objetivo del documento de ideas (npm → bloqueado, pnpm → único gestor) es correcto, pero confunde **tres capas distintas** que deben decidirse por separado:

| Capa | Pregunta | Respuesta corta |
|---|---|---|
| **Política** | "¿pnpm es el único gestor permitido?" | Ya existe en `secops.md` (scaffold). Se puede elevar a `AGENTS.md` inyectado. |
| **Enforcement** | "¿Cómo se hace *fallar* npm?" | **Abierta** — es el hueco central. No hay mecanismo definido. |
| **Detección** | "¿Cómo verificamos que no hay drift?" | `funky secure check/doctor` (agnóstico). |



La evidencia de hoy (sección 2) muestra que un **bloqueo duro global de npm tiene un blast radius real y concreto**: 6 herramientas globales instaladas vía npm, incluida la vía de actualización de las tools que usas a diario.

## 2. Evidencia recogida (2026-08-05)

### 2.1 Máquina (inventario npm)

- Node `v24.16.0`, npm `11.13.0` en `M:\Programs\nodejs` (sin nvm-windows, sin yarn, sin bun).
- **Paquetes globales instalados vía npm** en `C:\Users\cb147\AppData\Roaming\npm`:
  - `@anthropic-ai/claude-code@2.1.81`
  - `@colbymchenry/codegraph@1.5.0`
  - `@google/gemini-cli@0.34.0`
  - `funky-cli@4.2.0` (link local)
  - `opencode-ai@1.3.0`
  - `pnpm@10.23.0`
- **Implicación directa:** un shim que bloquee `npm.cmd` rompe la vía de actualización de todas esas herramientas. El blast radius NO es hipotético: es tu flujo de updates de hoy.
- **Hallazgo lateral:** hay **dos pnps** en la máquina — `pnpm@10.23.0` global (instalado vía npm) y `pnpm 11.5.0` standalone en `%LOCALAPPDATA%\pnpm` (el que gana en PATH). La instalación se movió de ubicación porque el disco C: carecía de espacio disponible. **Pendiente:** revisar la duplicidad y decidir la instalación canónica (ver `feature-secure.md` §6).

### 2.2 Scaffold (funky-cli) — qué inyecta hoy

`runScaffold` (`funky-cli/src/commands/scaffold.js`) NO inyecta `AGENTS.md`. Inyecta:

- Root: `README.md` (interpolado), `ORCHESTRATOR-STATE.md`, `TEMPLATE_GUIDE.md`.
- `.agents/rules/`: `secops.md` (incluye la regla pnpm-only), engran protocol, routers tier1-3, delegation tier2, interactive tier3.
- `.agents/templates/sdd/`, `openspec/rfcs/`, directorios engram.

Conclusión: "inyectar un `AGENTS.md` con la regla básica" es una **funcionalidad nueva del scaffold** (template nuevo), no un ajuste.

## 3. Encuadre acordado

- `secops.md` es del **comando scaffold** → solo proyectos antigravity de funky-ai.
- `funky secure` es **agnóstico al framework**: no debe asumir pnpm-only ni depender de `secops.md`.
- La regla pnpm **no es parte de la feature**; es política del ecosistema (repo/scaffold).
- Distinción clave: la **cuarentena** (`minimum-release-age` vía `pnpm_config_`) sí es defensa de la feature (protege al usuario en cualquier repo que use pnpm); la **política de gestor** (npm bloqueado / pnpm único) es decisión del ecosistema.

## 4. Recomendaciones

### R1. Separar política, enforcement y detección (tabla del §1)

La política se declara; el enforcement se implementa; la detección se automatiza. Mezclarlas lleva a discutir el mecanismo sin haber decidido la política, y viceversa.

### R2. No bloqueo duro global por defecto (blast radius real)

Opciones, de más conservadora a más agresiva:

1. **Regla + detección** *(recomendada como base)*: `AGENTS.md` + `secops.md` declaran la política; `funky secure check` detecta `package-lock.json` a la deriva / uso de npm. Cero blast radius, enforcement real para agentes (que es ~90% del riesgo real de supply chain: agentes ejecutando `npm install` accidental).
2. **Shim de fricción** (wrapper `npm.ps1`/`npm.cmd` en PATH con mensaje + mapeo a pnpm): frena al humano, es bypasseable con la ruta completa (`& "M:\Programs\nodejs\npm.cmd" install`), y — si bloquea — **rompe las actualizaciones de los globales del §2.1**. Necesitaría allowlist de mantenimiento.
3. **Bloqueo duro + allowlist de mantenimiento**: solo aceptable si decides que las updates de las tools globales pasan por otra vía o con flag explícito.

**Recomendación:** empezar por (1). El shim (2) puede existir como "modo duro" opcional de `funky secure global`, activable tras un inventario — nunca por defecto. El bloqueo duro puro (3) viola la regla de oro del RFC ("lo único global debe ser lo que ningún repo necesita desactivar"): aquí *algo* necesita npm (el mantenimiento de las tools).

> **DECISIÓN CERRADA (2026-08-05):** bloqueo de npm **descartado** — las tools no pueden quedar inservibles. Se adopta (1) regla + detección. Sin shim, sin modo duro.

### R3. Límite del bloqueo (si se hace shim)

> **DECISIÓN CERRADA (2026-08-05):** no aplica — sin bloqueo no hay límite que configurar. El mapeo de comandos queda como referencia de la política, no como enforcement.

- **Allowlist read-only:** `view`, `ls`, `info`, `search`, `ping`, `whoami`, `config` — no escriben ni ejecutan código.
- **Bloqueo write/execute:** `install`/`i`, `ci`, `uninstall`, `update`, `exec`, `npx`, `run`, `test`, `start`, `init`, `pack`, `link`, `publish`…
- **Decisión explícita pendiente: `npm run`/`npm test`** — tu doc los trata como riesgo menor (líneas 8–14) pero los mapea a pnpm. Mi voto: **bloquearlos** (ejecutan scripts del `package.json`, que pueden correr código comprometido; es el mismo vector de ChainDrop).
- Sobre la "alternativa descartada" `npm_config_minimum_release_age`: **correcta, y reforzada por evidencia** — npm ni siquiera la implementa (warning *Unknown project config*). La cuarentena vive en pnpm (`pnpm_config_minimum_release_age=4320`, verificado empíricamente). El bloqueo de npm no compite con la cuarentena: la cuarentena se queda, el bloqueo es otra capa.

### R4. `AGENTS.md` inyectado por `funky secure init` (nueva capability)

> **DECISIÓN CERRADA (2026-08-05):** AGENTS.md lo inyecta `funky secure init`, **no** `funky scaffold` (que no se toca). Solo si no existe; nunca se sobrescribe.

- Scaffold hoy **no** inyecta `AGENTS.md` (§2.2), y **no debe hacerlo**: su `secops.md` es una rule del path antigravity. `AGENTS.md` es el estándar fuera de antigravity → lo inyecta `funky secure`.
- Contenido: **una o dos líneas** (regla pnpm-only + referencia al estándar). `AGENTS.md` se carga en el contexto de cada agente: va lo esencial, el detalle vive en `secops.md` (antigravity) o en la propia feature.
- **Idempotencia:** inyectar solo si no existe (no sobrescribir el `AGENTS.md` de un repo destino). Si existe, la protección queda en `check`/`doctor`.

### R5. Límites de la feature (`funky secure`, estándar pnpm)

> **DECISIÓN CERRADA (2026-08-05):** `funky secure` **asume pnpm-only** (independiente de antigravity, pero no agnóstico de gestor). No toca `funky scaffold`.

- `funky secure init` aplica el blindaje **estándar pnpm**: settings de comportamiento en `pnpm-workspace.yaml` (minimumReleaseAge 4320, ignore-scripts, engineStrict — decisión 9: en pnpm v10/11 `.npmrc` ya no es superficie de settings, solo registry/auth) + `AGENTS.md` (regla pnpm, solo si no existe) + política approve-builds + reglas antigravity si aplica.
- `check`/`doctor` detectan drift de lockfile no autorizado (`package-lock.json` en un repo pnpm) como señal de incidente — la red de seguridad cuando el `AGENTS.md` ya existe.
- La cuarentena `pnpm_config_` queda en la capa global de la feature (defensa de máquina), implementación **pendiente de decidir**.
- La política "npm bloqueado / pnpm único" NO se implementa como enforcement: queda como regla declarativa (`AGENTS.md`/`secops.md`) + detección.
- Consecuencia honesta: repos que usen legítimamente otro gestor quedan **fuera del estándar** por definición.

### R6. Proceso

1. Debatir con este documento; no tocar `ideas-secure.md` ni `feature-secure.md` hasta consenso.
2. Decisiones a tomar: **(D1)** enforcement (regla+detección / shim / duro); **(D2)** límite read-only vs write/execute; **(D3)** `npm run`/`test` bloqueados; **(D4)** `AGENTS.md` inyectado por scaffold (sí/no, idempotente); **(D5)** dónde vive el mapeo de comandos y el mensaje de error (feature vs scaffold/`ideas-secure.md`).
3. Con consenso: actualizar `ideas-secure.md`; volcar al RFC solo lo que le corresponda (capa global, agnóstica).

> **ESTADO DEL CONSENSO (2026-08-05):** D1 → regla + detección (sin shim); D2 → no aplica (sin bloqueo); D3 → no aplica como enforcement (queda como referencia de política); D4 → `AGENTS.md` lo inyecta `funky secure init`, solo si no existe, **sin tocar `funky scaffold`**; D5 → sin enforcement de bloqueo, el mapeo queda como referencia de la política. RFC actualizado en consecuencia; `ideas-secure.md` pendiente de actualizar con el consenso.

## 5. Preguntas abiertas para el debate

- ¿Aceptas que el bloqueo duro rompa la vía de updates de las 6 tools globales? Si no: shim con allowlist, o regla+detección.
- ¿`npm run`/`npm test` se bloquean también? (mi voto: sí).
- ¿`AGENTS.md` inyectado siempre o solo si no existe? (mi voto: solo si no existe).
- ¿El mapeo/mensaje de error vive en la feature o en el scaffold?
