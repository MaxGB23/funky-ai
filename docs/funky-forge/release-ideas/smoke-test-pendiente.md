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
- Suite de tests verde como red de seguridad: `pnpm test` en `funky-cli/` (308 tests, 22 files).
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

### Fase E — Pipeline con `--context`

#### Paso 12 — Flujo encadenado con estado compartido

**Acción del usuario (si aplica al flujo de CI):**
```bash
node <ruta>/funky-cli/bin/funky.js pipeline init  # o crear context.json manualmente
node <ruta>/funky-cli/bin/funky.js assess --context docs/funky-ai/pipeline/context.json
node <ruta>/funky-cli/bin/funky.js estimate --context docs/funky-ai/pipeline/context.json
```

**Resultado esperado:**
- `assess` actualiza `context.json`: `assess.status: 'completed'`, `runAt`, `surfacedPatterns` (nombres de patrones superfíciados), `decisionsFile`, `artifacts`.
- `estimate` lee las rutas de decisiones desde el contexto y actualiza `estimate.status: 'completed'`, `startedAt`, `finishedAt`, `durationMs`, `artifacts`, `runAt`.
- `--context` con archivo inexistente → error y exit 1.

**Qué validar:** la integración encadenada assess → estimate con estado de fase v2 en el contexto.

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
| C10 | Pipeline `--context` encadena assess → estimate con estado v2 | `context.json` con ambas fases `completed` y `decisionsFile` |

---

## Restricciones

- Directorio de trabajo: temporal (nunca el repo real). Los comandos mutadores generan archivos en cwd.
- El smoke test NO se ejecuta como parte de la suite automatizada; es manual y requiere ~45–60 min de tiempo humano (Pasos 5 y 10 son conversacionales).
- No crear issues ni commits por este diseño; la ejecución validará si hay bug.
