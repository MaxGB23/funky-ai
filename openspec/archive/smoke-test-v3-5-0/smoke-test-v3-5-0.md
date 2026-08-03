# 🧪 Smoke Test v3.5.0 — Guía del Humano

> **Propósito:** validar la mega release **v3.5.0** del CLI `funky` de punta a punta antes del release: `init`, `scaffold`, `assess`, `estimate` y `pipeline`. Esta guía la ejecuta un **humano** en PowerShell sobre workspaces de prueba **fuera de `M:\funky-ai`**. No modifica código: solo ejecuta el CLI y verifica salida.

> **Convenciones de la guía**
> - Rutas absolutas de Windows con separador `\` (sintaxis nativa de PowerShell).
> - Rutas relativas del proyecto con separador `/` (p. ej. `docs/funky-ai/canvas/`).
> - Los mensajes de consola son **textuales** del código (v3.1.0 actual). El CLI imprime las rutas calculadas con el separador del sistema (`\` en Windows); las rutas hardcodeadas usan `/`. Ambas variantes se aceptan como válidas.
> - El exit code se lee con `$LASTEXITCODE` **inmediatamente después** del comando, sin pipes: `node ... | Select-Object -First N` puede cortar el proceso y corromper `$LASTEXITCODE`.
> - Los mensajes de error del CLI van por **stderr**. PowerShell los muestra en rojo con prefijo `node :` (como un error). Eso es ruido de presentación, NO un fallo del CLI: la fuente de verdad es `$LASTEXITCODE`.

---

## ⚠️ Advertencia crítica de versión

El comando `funky --version` imprime la versión leída de `funky-cli/package.json`.

- **Estado actual verificado en el código:** `funky-cli/package.json` declara `version: "3.5.0"` (release v3.5.0 publicada) y `funky --version` imprime `3.5.0`.
- **Condición de ejecución:** este smoke test solo tiene sentido contra la versión `3.5.0`. Si imprime otra versión, **detenerse y reportar al orquestador antes de continuar**.

---

## 0. Pre-condiciones

- [ ] **Node.js 20.12+** instalado: ejecutar `node -v` (debe imprimir `v20.12.x` o superior).
- [ ] **pnpm** instalado (`pnpm -v`).
- [ ] **CLI linkeado globalmente.** Desde `M:\funky-ai\funky-cli`:
  ```powershell
  Set-Location M:\funky-ai\funky-cli
  pnpm install
  pnpm link --global
  ```
- [ ] **Versión correcta:** ejecutar en cualquier carpeta:
  ```powershell
  funky --version
  ```
  - [ ] Imprime `3.5.0`.
  - [ ] Si imprime otra versión, **NO continuar**: reportar al orquestador.
- [ ] **Workspace base fuera del repo**:
  ```powershell
  New-Item -ItemType Directory -Force -Path C:\test\funky-smoke-v350 | Out-Null
  ```
- [ ] **Workspaces por sección** (se crean para aislar cada escenario):
  ```powershell
  @('init','assess','estimate','pipeline','e2e') | ForEach-Object {
    New-Item -ItemType Directory -Force -Path "C:\test\funky-smoke-v350\$_" | Out-Null
  }
  ```

---

## 1. Comando `funky init`

> **Nota:** el CLI **no es interactivo**. No aparecen prompts: genera los archivos y termina. La "interacción" es completar los canvases generados en un editor.

### 1.1 Happy path — generación de canvases en workspace fresco

- [ ] Abrir una terminal y posicionarse en el workspace de init:
  ```powershell
  Set-Location C:\test\funky-smoke-v350\init
  ```
- [ ] Ejecutar:
  ```powershell
  funky init
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [x ] Exit code `0`.
  - [ x] En consola (rutas con `\` en Windows, `C:\test\funky-smoke-v350\init` como `<WORKSPACE>`):
    ```
    ✅ Creado directorio: <WORKSPACE>\docs\funky-ai\canvas
    ✅ Creado: <WORKSPACE>\docs\funky-ai\canvas\PROJECT-CANVAS.md
    ✅ Creado: <WORKSPACE>\docs\funky-ai\canvas\INFRA-CANVAS.md
    ✅ Creado: <WORKSPACE>\docs\funky-ai\canvas\canvas-planning-guide.md

    ✅ Canvases creados. Ejecuta `funky scaffold` para instalar el ecosistema completo.
    ```
  - [ ] Existen los archivos:
    - [ x] `docs/funky-ai/canvas/PROJECT-CANVAS.md`
    - [ x] `docs/funky-ai/canvas/INFRA-CANVAS.md`
    - [ x] `docs/funky-ai/canvas/canvas-planning-guide.md`
  - [ ] `PROJECT-CANVAS.md` contiene `[Responde aquí]` (placeholders por completar).
  - [ ] `INFRA-CANVAS.md` contiene `[Responde aquí]` (placeholders por completar).

### 1.2 Error controlado — canvases ya existentes (Vector 1 y 3 de `cli-simulations.md`)

- [ ] En el MISMO workspace del 1.1 (los canvases ya existen), ejecutar de nuevo:
  ```powershell
  funky init
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [x ] Exit code `1`.
  - [x ] En consola (stderr, en rojo con prefijo `node :` — es normal):
    ```
    ❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md en docs/funky-ai/canvas/.
    ```
  - [ x] Ningún canvas fue sobreescrito (verificar que los archivos del 1.1 siguen intactos).

### 1.3 DESCARTADO


### 1.4 Idempotencia

- [x] Cubierta por el 1.2: re-ejecutar `init` sobre un workspace ya inicializado **falla con exit 1 de forma controlada**, sin sobreescribir nada. ✅

---

## 2. Comando `funky scaffold`

### 2.1 Happy path — instalación del ecosistema completo

- [x ] En el workspace de init (ya tiene los canvases del 1.1), ejecutar:
  ```powershell
  funky scaffold
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [x ] Exit code `0`.
  - [ x] En consola:
    ```
    🚀 Instalando estructura Funky AI...
    ```
  - [ x] 36 líneas `✅ Creado: <ruta>` (35 copias de templates + 1 archivo generado `docs-live-index.md`).
  - [x ] 8 líneas `✅ Creado directorio: <ruta>` (`docs-index/` + los 7 directorios engram).
  - [ ] Línea final (exacta):
    ```
    ✅ Funky AI instalado. 36 archivos creados, 0 ya existian.
    ```
  - [ ] Existen (spot-check):
    - [ x] `ORCHESTRATOR-STATE.md`
    - [ x] `TEMPLATE_GUIDE.md`
    - [ x] `README.md`
    - [ x] `.agents/rules/engram-protocol.md`
    - [ x] `.agents/rules/tier2-delegation/t2-spec.md`
    - [ x] `.agents/rules/tier3-interactive/risk-decision.md`
    - [ x] `.agents/templates/sdd/spec.md`
    - [ x] `.agents/templates/sdd/docs-live-index.md`
    - [ x] `.agents/templates/sdd/docs-index/`
    - [ x] `openspec/rfcs/000-rfc-template.md`
    - [ x] `docs/engram/...7resto/`

  - [x ] `funky scaffold` NO crea canvases (los canvases van a `docs/funky-ai/canvas/` solo vía `funky init`).

### 2.2 Idempotencia — segunda ejecución

- [x ] En el MISMO workspace, ejecutar de nuevo:
  ```powershell
  funky scaffold
  $LASTEXITCODE
  ```
- [ ]x **Criterios de éxito:**
  - [ x] Exit code `0`.
  - [x ] 36 líneas `⚡ Salteando (ya existe): <ruta>`.
  - [ x] Línea final (exacta):
    ```
    ✅ Funky AI instalado. 0 archivos creados, 36 ya existian.
    ```
  - [ x] Ningún archivo fue sobreescrito (p. ej. editar un archivo antes de la 2.ª corrida y verificar que el contenido sobrevive).

### 2.3 DESCARTADO

---

## 3. Comando `funky assess` [OMITIDO POR TIEMPO]

### 3.1 Happy path — guía de discusión con canvases completados

- [ ] Posicionarse en el workspace de assess:
  ```powershell
  Set-Location C:\test\funky-smoke-v350\assess
  ```
- [ ] Generar los canvases:
  ```powershell
  funky init
  ```
- [ ] **Completar los canvases.** Abrir `docs/funky-ai/canvas/PROJECT-CANVAS.md` y `docs/funky-ai/canvas/INFRA-CANVAS.md` y reemplazar cada `[Responde aquí]` por el valor sugerido de la tabla (o el script de carga automática de la Sección 7).

  | Sección (PROJECT-CANVAS.md) | Valor sugerido |
  |---|---|
  | 1. Framework Base | `Next.js (App Router) — SSR para SEO y performance en dashboard` |
  | 2. Patrón Arquitectónico | `Clean Architecture — dominio complejo, capas separadas` |
  | 3. Gestión de Estado | `React Query + Zustand — datos de servidor y estado global de UI` |
  | 4. Estrategia UI | `Tailwind + shadcn/ui — utility-first con componentes headless` |
  | 5. Estrategia de Testing | `Vitest + Testing Library — integration first, cobertura >80% en crítico` |

  | Sección (INFRA-CANVAS.md) | Valor sugerido |
  |---|---|
  | 1. Base de Datos / ORM | `SQLite + Prisma — liviano, migración a PostgreSQL prevista` |
  | 2. Autenticación | `NextAuth.js — OAuth con Google y GitHub` |
  | 3. Linter / Formatter | `Biome — todo en una herramienta, config estricta` |
  | 4. Deployment & CI/CD | `Vercel + GitHub Actions — CI con tests y lint en cada PR` |

  > El valor `SQLite` en INFRA-CANVAS dispara la **pregunta dinámica** de la regla SQLite en `assessRules.js`. Es intencional para verificar el motor de reglas.

- [ x] Ejecutar:
  ```powershell
  funky assess
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ x] Exit code `0`.
  - [ x] En consola (secuencia exacta):
    ```
    📄 Template de decisiones creado en docs/funky-ai/assess/architecture-decisions.md

    ✅ Guía de discusión generada exitosamente.
       📝 Guía: docs\funky-ai\assess\architecture-review.md
       📝 Decisiones: docs/funky-ai/assess/architecture-decisions.md

    📋 Próximos pasos:
       1. Abre una sesión de chat con la IA.
       2. Arrastra el archivo docs\funky-ai\assess\architecture-review.md a la conversación.
       3. Sigue las 6 fases de la guía para discutir la arquitectura.
       4. Documenta los acuerdos en docs/funky-ai/assess/architecture-decisions.md durante la discusión.
    ```
    (Las rutas calculadas aparecen con `\` en Windows; la línea 4 usa `/` hardcodeado en el código.)
  - [x ] Existen:
    - [x ] `docs/funky-ai/assess/architecture-review.md`
    - [ x] `docs/funky-ai/assess/architecture-decisions.md`
  - [x ] `architecture-review.md` contiene las 6 fases: `Fase 1: Contexto`, `Fase 2: Preocupaciones del Equipo`, `Fase 3: Preguntas Guía`, `Fase 4: Riesgos Detectados`, `Fase 5: Alternativas`, `Fase 6: Acuerdos`.
  - [ ] `architecture-review.md` contiene la pregunta dinámica SQLite (regla `SQLite`):
    ```
    SQLite es liviano pero tiene límites de concurrencia. Si el proyecto escala, ¿tienen pensado migrar a PostgreSQL u otro motor?
    ```

### 3.2 Edge — canvases incompletos (Vector 4 de `cli-simulations.md`)

> Se usa un workspace separado para no tocar el del 3.1.

- [ ] En `C:\test\funky-smoke-v350\assess` NO hace falta: los canvases del 3.1 ya están completos. Para reproducir este vector, dejar **sin completar** 2 secciones de INFRA-CANVAS en un workspace nuevo:
  ```powershell
  Set-Location C:\test\funky-smoke-v350\init   # ya tiene canvases con placeholders intactos
  ```
- [X ] Ejecutar assess ahí (los canvases tienen 9 `[Responde aquí]` sin reemplazar):
  ```powershell
  funky assess
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [x ] Exit code `0` (nunca bloquea).
  - [ x] En consola, antes de generar la guía:
    ```
    ⚠️  Se detectaron 9 secciones sin completar ("[Responde aquí]") en los canvases. La discusión se basará en datos parciales.
    ```
  - [x ] La guía se genera igualmente: `docs/funky-ai/assess/architecture-review.md` existe.
  - [x ] Variante de placeholders: si además faltan los canvases, advierte:
    ```
    ⚠️  No se encontró PROJECT-CANVAS.md en docs/funky-ai/canvas/. Usando placeholder.
    ⚠️  No se encontró INFRA-CANVAS.md en docs/funky-ai/canvas/. Usando placeholder.
    ```

### 3.3 Edge — `--context` sin `context.json`

> Quirk documentado: `assess -c <ruta>` imprime el error pero **termina con exit 0** (el código hace `process.exit(0)` al final del action).

- [ x] En un workspace sin `docs/funky-ai/pipeline/context.json` (el de `init` del 3.2 sirve), ejecutar:
  ```powershell
  funky assess -c docs/funky-ai/pipeline/context.json
  $LASTEXITCODE
  ```
- [x ] **Criterios de éxito:**
  - [ x] En consola (stderr):
    ```
    ❌ No se pudo leer context.json. Asegurate de haber ejecutado "funky pipeline assess" primero.
    ```
  - [x ] Exit code `0` (verificar el quirk: error impreso pero sin fallar).
  - [ x] No se escribe `context.json`.

### 3.4 Idempotencia — segunda ejecución

- [x ] En el workspace del 3.1, ejecutar de nuevo:
  ```powershell
  funky assess
  $LASTEXITCODE
  ```
- [ x] **Criterios de éxito:**
  - [ x] Exit code `0`.
  - [ x] En consola:
    ```
    ⚠️  "C:\test\funky-smoke-v350\assess\docs\funky-ai\assess\architecture-review.md" ya existe. No se sobrescribió.
    ℹ️  docs/architecture-decisions.md ya existe — no se modificó.
    ```
  - [ x] `architecture-review.md` no fue sobreescrito (verificar que sigue conteniendo la pregunta SQLite).

---

## 4. Comando `funky estimate`

### 4.1 Happy path — material de pricing completo

- [x ] Posicionarse en el workspace de estimate:
  ```powershell
  Set-Location C:\test\funky-smoke-v350\estimate
  ```
- [x ] Preparar el escenario (canvases completados + decisiones):
  ```powershell
  funky init
  # completar los canvases (tabla de la Sección 3.1 o script de la Sección 7)
  funky assess
  ```
- [ ] Ejecutar:
  ```powershell
  funky estimate
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `0`.
  - [ ] En consola (secuencia exacta):
    ```
    ✅ Material de pricing generado exitosamente.
       📝 Guía de pricing: docs\funky-ai\estimate\pricing-guide.md
       📝 Template de decisiones: docs\funky-ai\estimate\pricing-decisions.md

    📋 Próximos pasos:
       1. Copie el prompt de abajo y péguelo en una sesión de chat con la IA.
       2. La IA guiará la discusión de pricing basada en los materiales generados.
       3. Documente los acuerdos en el template de decisiones durante la discusión.

    ===== PROMPT PARA INICIAR SESIÓN DE PRICING =====
    ```
  - [ ] El prompt termina con el footer:
    ```
    ============================================
    ```
  - [ ] El prompt comienza con `Eres un asistente experto en pricing de proyectos de software...` y contiene las secciones `[PROJECT-CANVAS]` y `[INFRA-CANVAS]`.
  - [ ] Existen:
    - [ ] `docs/funky-ai/estimate/pricing-guide.md`
    - [ ] `docs/funky-ai/estimate/pricing-decisions.md`
  - [ ] `pricing-guide.md` contiene `Guía de Discusión de Pricing` y las decisiones documentadas.




### 4.2 Edge — sin `architecture-decisions.md` previo (Vector 5 de `cli-simulations.md`)

> Por diseño `estimate` **nunca falla** aunque falte contexto: genera la guía con contenido parcial y termina con exit 0.

- [ ] En el workspace `C:\test\funky-smoke-v350\init` (tiene canvases pero NO ejecutó `assess`, por lo que no existe `docs/funky-ai/assess/architecture-decisions.md`), ejecutar:
  ```powershell
  funky estimate
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `0`.
  - [ ] En consola:
    ```
    ⚠️  No se encontró docs/funky-ai/assess/architecture-decisions.md. Generando guía con contenido parcial.
    ```
  - [ ] `docs/funky-ai/estimate/pricing-guide.md` existe y contiene el placeholder `Sin decisiones documentadas.`

### 4.3 Edge — `--context` sin `context.json`

> Mismo quirk que assess: error impreso pero exit `0`.

- [ ] En el mismo workspace del 4.2, ejecutar:
  ```powershell
  funky estimate -c docs/funky-ai/pipeline/context.json
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] En consola (stderr):
    ```
    ❌ No se pudo leer context.json. Asegurate de haber ejecutado "funky pipeline assess" primero.
    ```
  - [ ] Exit code `0` (verificar el quirk).
  - [ ] No se genera `pricing-guide.md` (early return).

### 4.4 Idempotencia — segunda ejecución

- [ ] En el workspace del 4.1, ejecutar de nuevo:
  ```powershell
  funky estimate
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `0`.
  - [ ] En consola (stderr):
    ```
    ⚠️  "C:\test\funky-smoke-v350\estimate\docs\funky-ai\estimate\pricing-guide.md" ya existe. No se sobrescribió.
    ⚠️  "C:\test\funky-smoke-v350\estimate\docs\funky-ai\estimate\pricing-decisions.md" ya existe. No se sobrescribió.
    ```
  - [ ] Ningún archivo fue sobreescrito.

---

## 5. Comando `funky pipeline`

> El pipeline comparte estado vía `docs/funky-ai/pipeline/context.json`.

### 5.1 `pipeline status` — pipeline no iniciado

- [ ] Posicionarse en el workspace de pipeline (vacío):
  ```powershell
  Set-Location C:\test\funky-smoke-v350\pipeline
  ```
- [x ] Ejecutar:
  ```powershell
  funky pipeline status
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [x ] Exit code `0`.
  - [ x] En consola (exacto):
    ```
    📋 Pipeline not started.
    Run "funky pipeline assess" to begin.
    ```

### 5.2 `pipeline assess` — primera ejecución, crea el contexto

- [ ] Ejecutar:
  ```powershell
  funky pipeline assess
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `0`.
  - [ ] Se crea `docs/funky-ai/pipeline/context.json` (autogenerado por `initContext()`).
  - [ ] El `context.json` tiene `assess.runAt` con fecha ISO y `assess.dynamicQuestions` como arreglo.

### 5.3 `pipeline estimate` — bloqueado sin contexto (Vector 6 de `cli-simulations.md`)

- [ x] En un workspace SIN `context.json` (p. ej. `C:\test\funky-smoke-v350\init`), ejecutar:
  ```powershell
  funky pipeline estimate
  $LASTEXITCODE
  ```
- [x ] **Criterios de éxito:**
  - [x ] Exit code `1`.
  - [x ] En consola (stderr):
    ```
    ❌ Pipeline context not found. Run "funky pipeline assess" first.
    ```

### 5.4 `pipeline estimate` — bloqueado si assess no corrió

> En un proyecto normal este estado solo se alcanza si `context.json` existe pero `assess.runAt` es `null` (no hay comando que genere ese estado sin correr assess; se reproduce con un `context.json` mínimo).

- [ ] En `C:\test\funky-smoke-v350\pipeline`, sobrescribir temporalmente el contexto con uno sin assess (no hacerlo en proyectos reales — es anti-patrón). Se escribe con .NET UTF-8 **sin BOM** para que `JSON.parse` del CLI no falle:
  ```powershell
  New-Item -ItemType Directory -Force -Path docs\funky-ai\pipeline | Out-Null
  $ctx = @{ version = 1; createdAt = [DateTime]::UtcNow.ToString('o'); assess = @{ runAt = $null; dynamicQuestions = @() }; estimate = @{ runAt = $null }; pipeline = @{ lastCommand = $null; completed = @() } }
  $json = $ctx | ConvertTo-Json -Depth 5
  [System.IO.File]::WriteAllText((Resolve-Path 'docs\funky-ai\pipeline') + '\context.json', $json, (New-Object System.Text.UTF8Encoding($false)))
  funky pipeline estimate
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `1`.
  - [ ] En consola (stderr):
    ```
    ❌ Assess has not been run yet. Run "funky pipeline assess" first.
    ```

### 5.5 `pipeline estimate` — flujo correcto post-assess

- [ ] Restaurar el contexto válido corriendo assess de nuevo:
  ```powershell
  funky pipeline assess
  $LASTEXITCODE
  ```
- [ ] Ejecutar:
  ```powershell
  funky pipeline estimate
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `0`.
  - [ ] Se imprime el resumen de estimate (`✅ Material de pricing generado exitosamente.` + banner).
  - [ ] `context.json` ahora tiene `estimate.runAt` con fecha ISO.

### 5.6 `pipeline all` — pipeline completo

- [ ] Ejecutar:
  ```powershell
  funky pipeline all
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `0`.
  - [ ] En consola (exacto, con las advertencias de "ya existe" por la re-ejecución):
    ```
    ⚠️  "...\architecture-review.md" ya existe. No se sobrescribió.
    ℹ️  docs/architecture-decisions.md ya existe — no se modificó.

    ✅ Assess complete. Running estimate...

    ⚠️  "...\pricing-guide.md" ya existe. No se sobrescribió.
    ⚠️  "...\pricing-decisions.md" ya existe. No se sobrescribió.

    ✅ Pipeline complete!
    ```

### 5.7 `pipeline status` — estado final

- [ ] Ejecutar:
  ```powershell
  funky pipeline status
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `0`.
  - [ ] En consola (formato exacto; las fechas ISO varían):
    ```
    📋 Pipeline Status
    ──────────────────
    Created: <fecha ISO>

    🔍 Assess:
      Completed: <fecha ISO>
      Dynamic questions: 1

    💰 Estimate:
      Completed: <fecha ISO>

    📊 Progress:
      ✅ assess
      ⏳ estimate — pending
    ```
  - [ ] **Quirk conocido (anotar en el reporte):** `📊 Progress` muestra `⏳ estimate — pending` incluso después de correr `pipeline estimate`/`all`. El código nunca escribe `pipeline.completed`, por lo que la sección de progreso nunca refleja `estimate` como completado. No es un fallo bloqueante, pero hay que dejarlo constado.

### 5.8 Flags y comandos inválidos (commander)

- [ ] Ejecutar:
  ```powershell
  funky init --bogus
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `1`.
  - [ ] En consola (stderr):
    ```
    error: unknown option '--bogus'
    ```
- [ ] Ejecutar:
  ```powershell
  funky pipeline bogus
  $LASTEXITCODE
  ```
- [ ] **Criterios de éxito:**
  - [ ] Exit code `1`.
  - [ ] En consola (stderr):
    ```
    error: unknown command 'bogus'
    ```

---

## 6. Escenario end-to-end — release completo en workspace nuevo

> Workspace `C:\test\funky-smoke-v350\e2e`, limpio. Este escenario encadena los 5 comandos como lo hará un usuario real.

### 6.1 Preparación

- [ ] Posicionarse y verificar vacío:
  ```powershell
  Set-Location C:\test\funky-smoke-v350\e2e
  Get-ChildItem
  ```
- [ ] Versión del CLI:
  ```powershell
  funky --version
  ```
  - [ ] Imprime `3.5.0`.

### 6.2 `funky init`

- [ ] Ejecutar:
  ```powershell
  funky init
  $LASTEXITCODE
  ```
- [ ] Exit code `0` y `✅ Canvases creados...`.
- [ ] Completar los canvases con la tabla de la Sección 3.1 o el script de carga de la Sección 7.

### 6.3 `funky scaffold`

- [ ] Ejecutar:
  ```powershell
  funky scaffold
  $LASTEXITCODE
  ```
- [ ] Exit code `0` y `✅ Funky AI instalado. 36 archivos creados, 0 ya existian.`
- [ ] Verificar spot-check de la Sección 2.1.

### 6.4 `funky assess` (standalone, sin contexto)

- [ ] Ejecutar:
  ```powershell
  funky assess
  $LASTEXITCODE
  ```
- [ ] Exit code `0`.
- [ ] `docs/funky-ai/assess/architecture-review.md` contiene la pregunta dinámica SQLite.
- [ ] En este punto `docs/funky-ai/pipeline/context.json` **NO existe** (assess standalone no escribe contexto).

### 6.5 `funky estimate` (standalone, sin contexto)

- [ ] Ejecutar:
  ```powershell
  funky estimate
  $LASTEXITCODE
  ```
- [ ] Exit code `0`.
- [ ] Existen `docs/funky-ai/estimate/pricing-guide.md` y `pricing-decisions.md`.
- [ ] Banner `===== PROMPT PARA INICIAR SESIÓN DE PRICING =====` y footer `============================================` presentes.

### 6.6 `funky pipeline` — 4 subcomandos en secuencia

- [ ] **status** (antes de empezar):
  ```powershell
  funky pipeline status
  ```
  - [ ] `📋 Pipeline not started.` y exit `0`.
- [ ] **assess**:
  ```powershell
  funky pipeline assess
  $LASTEXITCODE
  ```
  - [ ] Exit `0`; se crea `docs/funky-ai/pipeline/context.json`.
  - [ ] `context.json` tiene `assess.runAt` con fecha y `dynamicQuestions` con al menos 1 elemento (la regla SQLite).
- [ ] **estimate**:
  ```powershell
  funky pipeline estimate
  $LASTEXITCODE
  ```
  - [ ] Exit `0`; `context.json` tiene `estimate.runAt` con fecha.
- [ ] **all**:
  ```powershell
  funky pipeline all
  $LASTEXITCODE
  ```
  - [ ] Exit `0`; en consola `✅ Assess complete. Running estimate...` y `✅ Pipeline complete!`.
- [ ] **status** (final):
  ```powershell
  funky pipeline status
  $LASTEXITCODE
  ```
  - [ ] Exit `0`; formato de la Sección 5.7 con `🔍 Assess: Completed` y `💰 Estimate: Completed`.
  - [ ] Anotar el quirk de `📊 Progress` (`estimate — pending`).

### 6.7 Verificación final de artefactos

- [ ] Archivos generados por cada etapa:
  - [ ] `docs/funky-ai/canvas/PROJECT-CANVAS.md` (init)
  - [ ] `docs/funky-ai/canvas/INFRA-CANVAS.md` (init)
  - [ ] `docs/funky-ai/canvas/canvas-planning-guide.md` (init)
  - [ ] `ORCHESTRATOR-STATE.md`, `.agents/rules/`, `.agents/templates/sdd/`, `openspec/rfcs/`, `docs/engram/` (scaffold)
  - [ ] `docs/funky-ai/assess/architecture-review.md` (assess)
  - [ ] `docs/funky-ai/assess/architecture-decisions.md` (assess)
  - [ ] `docs/funky-ai/estimate/pricing-guide.md` (estimate)
  - [ ] `docs/funky-ai/estimate/pricing-decisions.md` (estimate)
  - [ ] `docs/funky-ai/pipeline/context.json` (pipeline) — con `assess.runAt` y `estimate.runAt` poblados
- [ ] `context.json` validado:
  ```powershell
  Get-Content docs\funky-ai\pipeline\context.json -Raw
  ```
  - [ ] `assess.runAt` ≠ null; `assess.dynamicQuestions.length ≥ 1`; `estimate.runAt` ≠ null.

---

## 7. Script de carga rápida de canvases (opcional)

> Reemplaza los 9 `[Responde aquí]` (5 de PROJECT + 4 de INFRA) en el workspace actual usando los valores de la Sección 3.1. Usa .NET con UTF-8 sin BOM: `Get-Content`/`Set-Content` de PowerShell 5.1 leen mal el UTF-8 de los templates y rompen la coincidencia del placeholder. Copiar y pegar íntegro.

```powershell
function Set-CanvasValues {
  param([string]$Path, [string[]]$Values)
  $enc = New-Object System.Text.UTF8Encoding($false)
  $full = [System.IO.File]::ReadAllText((Resolve-Path $Path), $enc)
  $parts = [regex]::Split($full, '\[Responde aquí\]')
  if ($parts.Length -ne $Values.Length + 1) { throw "Se esperaban $($Values.Length) placeholders pero hay $($parts.Length - 1)" }
  $result = $parts[0]
  for ($n = 0; $n -lt $Values.Length; $n++) { $result += $Values[$n] + $parts[$n + 1] }
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $result, $enc)
}

$proyecto = @(
  'Next.js (App Router) — SSR para SEO y performance en dashboard',
  'Clean Architecture — dominio complejo, capas separadas',
  'React Query + Zustand — datos de servidor y estado global de UI',
  'Tailwind + shadcn/ui — utility-first con componentes headless',
  'Vitest + Testing Library — integration first, cobertura >80% en crítico'
)
Set-CanvasValues -Path 'docs/funky-ai/canvas/PROJECT-CANVAS.md' -Values $proyecto

$infra = @(
  'SQLite + Prisma — liviano, migración a PostgreSQL prevista',
  'NextAuth.js — OAuth con Google y GitHub',
  'Biome — todo en una herramienta, config estricta',
  'Vercel + GitHub Actions — CI con tests y lint en cada PR'
)
Set-CanvasValues -Path 'docs/funky-ai/canvas/INFRA-CANVAS.md' -Values $infra

Write-Host 'Placeholders restantes (debe ser 0):'
([regex]::Matches([System.IO.File]::ReadAllText((Resolve-Path 'docs/funky-ai/canvas/PROJECT-CANVAS.md'), (New-Object System.Text.UTF8Encoding($false))), '\[Responde aquí\]')).Count +
([regex]::Matches([System.IO.File]::ReadAllText((Resolve-Path 'docs/funky-ai/canvas/INFRA-CANVAS.md'), (New-Object System.Text.UTF8Encoding($false))), '\[Responde aquí\]')).Count
```

---

## 8. 📋 Fase de reporte y cierre

- [ ] Volver a **este chat (Orquestador)** pegando el output completo de cada sección y el resultado por escenario (las casillas marcadas).
- [ ] Indicar si la pre-condición de versión pasó (`funky --version` → `3.5.0`) o si imprimió otra cosa (hoy imprime `3.1.0`).
- [ ] **Si todo pasó:** marcamos el Smoke Test como ✅ en el `ORCHESTRATOR-STATE.md` y procedemos al release de `v3.5.0`.
- [ ] **Si algo falló:** reportar acá el error con el output completo y levantamos un worker para fixearlo. NO hacer release con fallos conocidos.
- [ ] Registrar en el reporte los **quirks observados** aunque no sean bloqueantes:
  - `pipeline status` → `📊 Progress` nunca muestra `estimate` como completado (campo `pipeline.completed` sin poblar).
  - `assess -c` / `estimate -c` imprimen error de contexto faltante pero terminan con exit `0`.
  - Mensajes del CLI que usan "Asegurate", "ya existian" (tuteo/sin acentos en strings del código) — verificar si se quieren normalizar en una release futura.

### Resumen de cobertura de esta guía

- [ ] `funky init` (happy path, error de canvas existente, error EACCES, idempotencia)
- [ ] `funky scaffold` (happy path, idempotencia, error EACCES)
- [ ] `funky assess` (happy path, canvases incompletos, `--context` sin contexto, idempotencia)
- [ ] `funky estimate` (happy path, sin decisiones, `--context` sin contexto, idempotencia)
- [ ] `funky pipeline` (`status`/`assess`/`estimate`/`all`, 2 errores de contexto, flags inválidos)
- [ ] Escenario end-to-end completo con verificación de `context.json`
- [ ] 8+ escenarios de error/edge sobre los vectores de `cli-simulations.md` y guards del código
