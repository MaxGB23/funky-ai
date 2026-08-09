# Smoke Test Manual — Flujo real de `funky estimate` (diseño)

> **Estado:** 📝 DISEÑADO — pendiente de ejecución humana (requiere sesión colaborativa con IA).
> **Antecedente:** Este doc nació pre-brief (cuando `funky init` no generaba el brief funcional y se dudaba de su existencia). Desde la release 4.2.0 el brief ES el primer output de `funky init`, y desde el issue #33 `funky estimate` lo auto-detecta. Este diseño refleja el estado actual real y cubre el pipeline completo `init → assess → estimate`.

---

## Objetivo

Probar el flujo COMPLETO de `funky assess` + `funky estimate` con un escenario REAL, paso a paso, simulando un dev o usuario que usa la herramienta de principio a fin: crear proyecto, iniciar canvases, llenarlos, revisar arquitectura, estimar, y cerrar ambas sesiones con un agente IA que refleja las decisiones en los templates.

El smoke test es 100% manual e interactivo (humano + agente IA en chat). Nada automatizado: se trata de validar la experiencia real, no solo los exit codes.

---

## Escenario

**Producto:** Dashboard interno para gestión operativa de equipos.
**Resumen:** Centralizar métricas operativas, tareas y reportes de equipos en un solo lugar para reducir trabajo manual. MVP orientado a reducir trabajo manual y centralizar información. No incluye multi-tenant ni automatizaciones complejas en la fase inicial.

---

## Precondiciones

- Repositorio de prueba en un directorio temporal (nunca en el repo real).
- CLI instalado y ejecutable: `node funky-cli/bin/funky.js` (desde el root del repo).
- Suite de tests verde como red de seguridad: `pnpm test` en `funky-cli/` (332 tests, 27 files).
- Nada de `docs/funky-ai/canvas/`, `docs/funky-ai/assess/` ni `docs/funky-ai/estimate/` preexistente en el directorio de prueba.

---

## Flujo paso a paso

### Fase A — Bootstrap del proyecto

#### Paso 1 — Crear proyecto y ejecutar `funky init`

**Acción del usuario:**
```bash
mkdir smoke-project && cd smoke-project
node <ruta>/funky-cli/bin/funky.js init
```

**Resultado esperado:**
- 4 archivos creados en `docs/funky-ai/canvas/`: `brief-funcional.md` (PRIMERO), `PROJECT-CANVAS.md`, `INFRA-CANVAS.md`, `canvas-planning-guide.md`.
- Mensaje de éxito: `✅ Canvases creados. Ejecuta funky scaffold...`
- exit 0.
- 2ª ejecución → error `❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md...`, exit 1, sin modificar archivos.

**Qué validar:** el orden de creación (brief primero), el guard, y que los 4 archivos existen con el contenido del template.

#### Paso 2 — El humano llena el brief funcional

**Acción del usuario:** editar `docs/funky-ai/canvas/brief-funcional.md` completando los 12 ítems (nombre, objetivo, tipo de usuario, caso de uso, funcionalidades principales/secundarias, roles, seguridad, integraciones, entregables, MVP vs fase 2, KPI).

**Escenario real (ejemplo):**
- Login seguro, roles básicos (Admin/Manager/Viewer), métricas en tiempo real, reportes semanales.
- Integraciones: Slack, Google Workspace (SSO).
- KPI: reducir 30% el tiempo de armado de reportes.

**Qué validar:** que el template tenga los 12 ítems y que el usuario puede completarlos sin romper la estructura (`[Completar]` reemplazado por contenido).

#### Paso 3 — El humano llena PROJECT e INFRA Canvas

**Acción del usuario:** editar `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con decisiones técnicas coherentes con el brief.

**Escenario real (ejemplo):**
- PROJECT: Next.js (App Router) + Clean Architecture + React Query/Zustand + Tailwind/shadcn + Vitest.
- INFRA: PostgreSQL + Prisma + NextAuth (OAuth Google) + Biome + Vercel + GitHub Actions.

**Qué validar:** que assess y estimate detectan las señales de tópicos a partir de estas decisiones (roles, seguridad/auth, transacciones si menciona ACID, integraciones, etc.).

### Fase B — Revisión arquitectónica (`funky assess`)

#### Paso 4 — Ejecutar `funky assess` (standalone)

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js assess
```

**Resultado esperado:**
- 3 archivos en `docs/funky-ai/assess/`: `architecture-review.md` (siempre, sobrescribe), `architecture-decisions.md` (solo si no existe, con `{{DATE}}` reemplazado) y `risk-patterns.md` (solo si no existe).
- `risk-patterns.md` con los 4 patrones de ejemplo del template (K8s, SQLite, Single Node, Junior + Infra Compleja) como candidatos editables.
- Warning si hay secciones de canvas con `[Responde aquí]` sin completar.
- exit 0.

**Qué validar:** los 3 outputs, el no-sobrescritura de `architecture-decisions.md` y `risk-patterns.md`, y que la guía embebe ambos canvases completos.

#### Paso 5 — Sesión de revisión arquitectónica con el agente IA

**Acción del usuario:** copiar el prompt de `architecture-review.md` y abrir la sesión de arquitectura con el agente IA del proyecto. Seguir las 6 fases de la guía (Contexto → Preocupaciones → Preguntas guía → Riesgos → Alternativas → Acuerdos), discutir los patrones de riesgo candidatos, y pedirle al agente que refleje las decisiones en `architecture-decisions.md`.

**Escenario real (ejemplo de decisiones):**
- Stack confirmado: Next.js + PostgreSQL + Prisma (sin K8s; Vercel abstrae la infra → patrón K8s NO aplica).
- Auth: NextAuth OAuth Google (SSO corporativo), sin gestión manual de contraseñas.
- Riesgo aceptado: SQLite NO aplica (PostgreSQL gerenciado).
- Team: 1 TL + 1 fullstack (sin DevOps dedicado; PaaS → patrón Junior + Infra Compleja mitigado).

**Resultado esperado:** `architecture-decisions.md` poblado con decisiones reales (título, decisión, rationale, alternativas consideradas, riesgos aceptados, fecha).

**Qué validar:** que el agente puede leer `architecture-review.md` + los canvases, guiar las 6 fases, evaluar los patrones de riesgo candidatos contra el stack real y documentar acuerdos en el template sin inventar datos.

### Fase C — Estimación (`funky estimate`)

#### Paso 6 — Ejecutar `funky estimate` sin flags (auto-detección del brief)

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js estimate
```

**Resultado esperado:**
- `💡 Brief funcional auto-detectado desde funky init: docs/funky-ai/canvas/brief-funcional.md`.
- SIN aviso de `architecture-decisions.md` faltante (ahora existe por el Paso 5) — el estimate consume las decisiones reales.
- Sugerencias de tópicos detectados: `💡 Se detectó X. Considerá --X para incluir su sección`.
- Secciones incluidas: ficha de alcance + brief funcional.
- Se generan `docs/funky-ai/estimate/pricing-guide.md` (sobrescribe) y `pricing-decisions.md` (no sobrescribe si existe).
- La guía embebe el contenido del brief (sección `## Brief Funcional` con los 12 ítems del canvas) y las decisiones arquitectónicas.
- exit 0.

**Qué validar:** auto-detección del brief, embebido correcto, sugerencias de tópicos, ficha de alcance con estado de los 6 tópicos, ausencia del warning de decisions faltantes, y ambos archivos generados.

#### Paso 7 — Ejecutar con flags de tópicos

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js estimate --security --transactions --roles --integrations --concurrency
```

**Resultado esperado:**
- Secciones incluidas: ficha de alcance, brief funcional, roles del equipo, transacciones, seguridad, concurrencia, integraciones.
- Cada sección en la guía con el contenido real derivado de los canvases y decisiones.
- exit 0.

**Qué validar:** que los flags agregan sus secciones y que el contenido refleja las decisiones reales (no texto genérico).

#### Paso 8 — Ejecutar con `--brief` sin valor (checklist)

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js estimate --brief
```

**Resultado esperado:**
- Sección "Brief Funcional" = checklist de preguntas del template (`brief-questions-template.md`): ¿Qué problema resuelve?, ¿Cuál es la funcionalidad principal?, ¿Quiénes son los usuarios?, ¿Cuántos usuarios se esperan?, ¿Qué es imprescindible para el MVP?, ¿Qué queda fuera de alcance?, complejidad técnica, deuda técnica, integraciones/dependencias, fecha objetivo, hitos.
- NO embebe el brief del canvas (fuerza el checklist aunque exista auto-detección).
- exit 0.

**Qué validar:** que `--brief` sin valor fuerza el checklist y NO el brief auto-detectado (distinción clave del issue #33).

### Fase D — Cierre de la sesión de pricing

#### Paso 9 — Copiar el prompt y abrir la sesión de pricing con el agente IA

**Acción del usuario:** copiar el prompt impreso en consola ("PROMPT PARA INICIAR SESIÓN DE PRICING") y pegarlo en el chat del agente IA del proyecto.

**Resultado esperado:** el agente responde iniciando la sesión: revisa contexto (guía + decisiones arquitectónicas), pregunta por presupuesto/rango, y guía la discusión de factores de costo (infraestructura, complejidad, equipo, timeline).

**Qué validar:** que el prompt es completo y autocontenido (referencia los archivos correctos, da estructura de sesión, pregunta inicial clara).

#### Paso 10 — Discusión colaborativa de pricing (el corazón del smoke test)

**Acción del usuario:** conversar con el agente IA, tomar decisiones de pricing (presupuesto, alcance, equipo, timeline), y pedirle que refleje los acuerdos en `pricing-decisions.md`.

**Escenario real (ejemplo de decisiones):**
- Presupuesto: USD 40k–60k.
- Timeline: 3 meses (MVP) + 1 mes (fase 2).
- Equipo: 1 TL + 1 fullstack + 1 design (part-time).
- Infra: Vercel Pro + PostgreSQL gerenciado + plan de monitoreo.
- Fuera de alcance: multi-tenant, automatizaciones complejas, mobile app.

**Resultado esperado:** el agente escribe/actualiza `pricing-decisions.md` con los acuerdos estructurados (alcance, costo estimado, riesgos, decisiones).

**Qué validar:** que el agente puede leer los archivos generados, guiar la discusión, y documentar acuerdos reales en el template sin inventar datos ni romper la estructura.

#### Paso 11 — Idempotencia del template de decisiones

**Acción del usuario:** ejecutar `funky estimate` (cualquier variante) de nuevo.

**Resultado esperado:**
- `pricing-guide.md` se sobrescribe (nuevo contenido).
- `pricing-decisions.md` NO se sobrescribe (conserva los acuerdos de la sesión anterior).
- Igual que `architecture-review.md` (sobrescribe) vs `architecture-decisions.md` y `risk-patterns.md` (no).
- exit 0.

**Qué validar:** la regla sobrescribe/no-sobrescribe de los artefactos de assess y estimate.

### Fase E — Pipeline (`funky pipeline`) e integración con `context.json`

> **Nota de diseño:** esta fase valida el flujo REAL del comando `pipeline` (subcomandos `assess`, `estimate`, `all`, `status`), que orquesta las fases con estado compartido en `docs/funky-ai/pipeline/context.json` (schema v2). El flag `--context <path>` de los comandos individuales `assess`/`estimate` también se cubre, pero NO es el camino del pipeline: `pipeline` maneja el archivo por sí mismo en su ruta canónica. El smoke test original mencionaba `pipeline init`, que no existe como subcomando.

#### Paso 12 — Estado inicial: `pipeline status` (sin ejecutar nada)

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js pipeline status
```

**Resultado esperado:**
- `📋 Pipeline no iniciado.` + `Ejecuta "funky pipeline assess" para comenzar.`
- exit 0 (NO es error; es estado not-started).
- Con `--json`: un único JSON con shape v2 not-started en stdout (`version: 2`, ambas fases `pending`), exit 0.

**Qué validar:** que `status` distingue "nunca iniciado" (exit 0) de "context inválido" (exit 1), y que `--json` siempre emite exactamente un objeto JSON en stdout.

#### Paso 13 — Pipeline completo: `pipeline all`

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js pipeline all
```

**Resultado esperado:**
- Crea `docs/funky-ai/pipeline/context.json` (v2) si no existe.
- Ejecuta assess → estimate en secuencia, con logs `✅ Assess completado. Ejecutando estimate...` y `✅ Pipeline completado.`
- `context.json` queda con: `assess.status: 'completed'` (`runAt`, `surfacedPatterns`, `decisionsFile`, `artifacts`), `estimate.status: 'completed'` (`runAt`, `artifacts`), `currentPhase: null` (se limpia al completar).
- exit 0.

**Qué validar:** el archivo de contexto (ruta canónica `docs/funky-ai/pipeline/context.json`), las dos fases `completed`, y que `decisionsFile` apunta a `docs/funky-ai/assess/architecture-decisions.md` (lo que estimate usará en ejecuciones posteriores).

#### Paso 14 — Con `--json` en stdout limpio

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js pipeline all --json
```

**Resultado esperado:**
- UN único JSON en stdout (shape `statusJson` + `run` con `status`/`durationMs`/`artifacts`/`warnings` por fase).
- Texto humano (logs) en stderr, NO en stdout — stdout solo recibe el JSON (R-P11).
- exit 0.

**Qué validar:** parseable con `node -e "const s=JSON.parse(require('fs').readFileSync(0)); console.log(s.estimate.status)"` → `completed`, y que no haya líneas humanas mezcladas en stdout.

#### Paso 15 — Estado después: `pipeline status` y `pipeline status --json`

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js pipeline status
node <ruta>/funky-cli/bin/funky.js pipeline status --json
```

**Resultado esperado:**
- Humano: `🔍 Assess:` con `Estado: completed`, `Completado: <runAt>`, `Patrones detectados: N`; `💰 Estimate:` con `Estado: completed`, `Completado: <runAt>`. Sin bloque `pipeline.completed` (eliminado en v2).
- JSON: objeto con claves en orden determinista `version, createdAt, currentPhase, assess, estimate`; cada fase con su orden de claves fijo (`status, startedAt, finishedAt, durationMs, error, artifacts, runAt` + `surfacedPatterns, decisionsFile` en assess).
- exit 0.

**Qué validar:** que `status` refleja el estado REAL del archivo (no un cache), que `assess` muestra patrones y `estimate` no (shape distinto por fase).

#### Paso 16 — Fases por separado y retomar sesión interrumpida

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js pipeline assess
node <ruta>/funky-cli/bin/funky.js pipeline status --json   # assess completed, estimate pending
node <ruta>/funky-cli/bin/funky.js pipeline estimate
node <ruta>/funky-cli/bin/funky.js pipeline status --json   # ambas completed
```

**Resultado esperado:**
- `pipeline assess` solo: `assess.status: 'completed'`, `estimate.status: 'pending'`.
- `pipeline estimate` después: valida que `assess.runAt` exista, ejecuta, y deja `estimate.status: 'completed'`.
- En el medio (después de `assess`), el JSON de status muestra `currentPhase: null` (se limpia al completar assess) y `estimate` pendiente — esto representa una sesión retomable.

**Qué validar:** el guard de orden (`estimate` requiere `assess.runAt`), la retomabilidad (una fase en `running` sin `finishedAt` se re-ejecuta en el siguiente `all`), y que cada fase persiste su propia completion.

#### Paso 17 — Errores esperados del pipeline

**Acción del usuario:**
```bash
# 1. estimate SIN contexto (borrar docs/funky-ai/pipeline/context.json previamente)
node <ruta>/funky-cli/bin/funky.js pipeline estimate
# 2. estimate sin assess previo (crear context.json con initContext: borrar context.json y ejecutar pipeline assess? NO: borrar context.json y ejecutar pipeline estimate directo ya cubre 1; para este caso: pipeline assess borrando el archivo de decisiones no aplica — ver abajo)
```

**Resultado esperado:**
1. Sin `context.json`: `❌ Contexto de pipeline no encontrado. Ejecuta "funky pipeline assess" primero.` → exit 1.
2. Con `context.json` pero `assess.runAt` nulo (ejecutar `pipeline all` con `assess` fallando a propósito — p. ej. renombrar `docs/funky-ai/canvas/` a `_canvas`): `❌ Assess aún no se ha ejecutado.` → exit 1, y en `all` el archivo queda `assess.status: 'failed'` + `estimate.status: 'skipped'`.
3. `context.json` inválido (escribir `{"version": 99}` a mano): `❌ context.json inválido` → exit 1, SIN escribir nada (validación antes de mutar).

**Qué validar:** que los tres casos fallan con mensaje claro, que el fallo de `assess` corta la cadena (`estimate: skipped`), y que la validación de versión rechaza sin escribir.

#### Paso 18 — Comandos individuales con `--context` (integración punto a punto)

> El pipeline usa sus subcomandos y la ruta canónica; `--context <path>` es para integraciones que apuntan a un context custom. Se valida que ambos comandos individuales SÍ respetan el archivo compartido cuando se les pasa la misma ruta.

**Acción del usuario:**
```bash
node <ruta>/funky-cli/bin/funky.js assess --context docs/funky-ai/pipeline/context.json
node <ruta>/funky-cli/bin/funky.js estimate --context docs/funky-ai/pipeline/context.json
node <ruta>/funky-cli/bin/funky.js pipeline status --json
```

**Resultado esperado:**
- `assess --context`: escribe en el context canónico (`assess.status: 'completed'`, `decisionsFile` seteado).
- `estimate --context`: lee `decisionsFile` desde el context (NO cae al default) y escribe `estimate.status: 'completed'`.
- `status --json`: refleja ambas fases completed (mismo archivo compartido).
- `--context` con archivo inexistente/inválido: `❌ No se pudo leer context.json. Asegúrate de haber ejecutado "funky pipeline assess" primero.` → exit 1 (en assess) / mismo error en estimate.

**Qué validar:** que `--context` en comandos individuales lee/escribe el MISMO archivo que el pipeline, que estimate usa `decisionsFile` del context (no el default) y que el error de archivo inexistente es claro.

---

## Criterios de éxito

| # | Criterio | Evidencia |
|---|----------|-----------|
| C1 | `funky init` genera 4 outputs con brief primero | Salida consola + ls del directorio |
| C2 | `funky assess` genera 3 outputs; decisions y risk-patterns no se sobrescriben | ls + timestamps antes/después |
| C3 | Sesión IA de arquitectura documenta decisiones reales | `architecture-decisions.md` poblado (decisión, rationale, riesgos) |
| C4 | Brief auto-detectado sin flag | Log `💡 Brief funcional auto-detectado` + sección embebida en la guía |
| C5 | `estimate` consume las decisiones del Paso 5 sin warning | Ausencia del aviso de `architecture-decisions.md` faltante + contenido de la guía |
| C6 | Flags de tópicos agregan secciones | Log de secciones incluidas + contenido de la guía |
| C7 | `--brief` sin valor fuerza checklist | Sección con preguntas, no con el brief del canvas |
| C8 | `pricing-guide.md` se sobrescribe, `pricing-decisions.md` no | Timestamps/contenido antes y después |
| C9 | Sesión IA de pricing documenta acuerdos | `pricing-decisions.md` poblado con decisiones reales |
| C10 | `pipeline all` crea context.json v2 y completa assess + estimate | `context.json` con ambas fases `completed`, `currentPhase: null`, exit 0 |
| C11 | `pipeline all --json` emite UN JSON en stdout (humano a stderr) | stdout parseable a JSON con `run`; sin líneas humanas mezcladas |
| C12 | `pipeline status`/`--json` refleja el estado real del archivo | Estado humano + JSON determinista; sin `pipeline.completed` en v2 |
| C13 | Guards de orden: estimate sin contexto/assess previo falla claro | exit 1 con mensajes `Contexto de pipeline no encontrado` / `Assess aún no se ha ejecutado`; assess fallido ⇒ estimate `skipped` |
| C14 | `assess --context` y `estimate --context` comparten el mismo context | `decisionsFile` respetado por estimate; archivo inexistente → error claro exit 1 |

---

## Restricciones

- Directorio de trabajo: temporal (nunca el repo real). Los comandos mutadores generan archivos en cwd.
- El smoke test NO se ejecuta como parte de la suite automatizada; es manual y requiere ~45–60 min de tiempo humano (Pasos 5 y 10 son conversacionales).
- No crear issues ni commits por este diseño; la ejecución validará si hay bug.
