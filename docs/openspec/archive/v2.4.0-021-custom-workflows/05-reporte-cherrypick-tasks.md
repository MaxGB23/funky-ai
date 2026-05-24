# Reporte Cherry-Pick: `tasks.md`

**Fuente oficial:** `docs/openspec/changes/021-custom-workflows/gentle-templates/skills/sdd-tasks/SKILL.md`  
**Template local:** `.agents/templates/sdd/tasks.md`  
**Criterio de selección:** Context Economy — solo lo que elimine ambigüedad real.

---

## 1. Action Forcing

### Oficial

| Mecanismo | Ubicación | Qué fuerza |
|-----------|-----------|------------|
| Orchestrator Gate explícito | L13–17 | El orquestador NO ejecuta inline — STOP y delega. Literal: *"Do NOT execute these instructions inline."* |
| Persist Step MANDATORY | L190 | `sdd-phase-common.md §C` es obligatorio. No hay salida opcional. |
| Return Summary estructurado | L197–228 | El sub-agente DEBE devolver un envelope con tabla de fases + forecast al orquestador. Fuerza handoff limpio. |
| TDD task order explícito | L239 | Si el proyecto usa TDD: RED → GREEN → REFACTOR como tareas separadas, no como intención. |

### Local

| Mecanismo | Ubicación | Qué fuerza |
|-----------|-----------|------------|
| PREREQUISITO explícito | L9 | Si no existe `sdd-spec.md` → PARAR. No continúa sin plano arquitectónico. |
| Tick-and-save inmediato | L16–18 | Marcar `[x]` + guardar al disco antes de pasar al siguiente ítem. Evita sesión ciega. |
| Fase 0 Branch Setup T1 | L22–31 | Git ops aisladas con verificaciones paso a paso antes de tocar código. Restricciones explícitas en cada fase. |
| Git-Ops delegada al humano | L99–112 | Los comandos git finales van al humano local. Razón arquitectónica documentada (Context Pollution). |
| Return Envelope con MANDATORY_RELEASE_PROTOCOL | L123 | La última respuesta del worker DEBE incluir el bloque completo marcado. Sin él, la fase no se considera completa. |

**Delta útil:** El oficial tiene un Orchestrator Gate más fuerte (evita ejecución inline del skill completo). El local tiene el PREREQUISITO de spec.md que el oficial asume implícito.

---

## 2. Guardrails contra Tasks Ambiguas

### Oficial — tabla de criterios

| Criteria | ✅ | ❌ |
|----------|----|----|
| Specific | `"Create internal/auth/middleware.go with JWT validation"` | `"Add auth"` |
| Actionable | `"Add ValidateToken() method to AuthService"` | `"Handle tokens"` |
| Verifiable | `"Test: POST /login returns 401 without token"` | `"Make sure it works"` |
| Small | Un archivo o una unidad lógica | `"Implement the feature"` |

**Reglas de escritura (L232–240):**
- Siempre rutas de archivo concretas.
- Ordenadas por dependencia — Phase 1 no depende de Phase 2.
- Testing referencia escenarios específicos del spec.
- Una tarea = una sesión.
- Numeración jerárquica: 1.1, 1.2, 2.1...
- `NEVER`: "implement feature" / "add tests" sin contexto.
- **Size budget**: artifact ≤ 530 palabras. Cada tarea: 1–2 líneas max.

### Local

El local **no tiene tabla de criterios** ni reglas de escritura explícitas para tasks individuales. Solo tiene restricciones por fase (`🚫 Restricciones`), que acotan el scope pero no el formato de la tarea.

**Delta:** El oficial provee el guardrail más fuerte aquí. El local no tiene equivalente. **Cherry-pick recomendado.**

---

## 3. Mecanismos de Estimación y Priorización

### Oficial — Review Workload Forecast (L129–163)

Señales de estimación: número de archivos, fases, puntos de integración, tests, docs, artefactos generados, migraciones, concerns cruzados.

**Contrato de texto plano** (parseable por guards downstream):
```text
Decision needed before apply: Yes|No
Chained PRs recommended: Yes|No
Chain strategy: stacked-to-main|feature-branch-chain|size-exception|pending
400-line budget risk: Low|Medium|High
```

**Trigger de cadena:**
- `High` o probable >400 líneas → Chained PRs: Yes → Split en work units con scope autónomo.
- Delivery strategy mapea directamente a `Decision needed before apply`.

**Tabla Suggested Work Units:**
```
| Unit | Goal | Likely PR | Notes |
```
Cada unidad: inicio claro, fin claro, verificación, scope autónomo.

**Chain strategies con tradeoffs documentados:**
- `stacked-to-main`: velocidad, iteración rápida.
- `feature-branch-chain`: rollback, releases coordinadas.
- `size:exception`: PR único con aprobación del maintainer.

### Local

Sin mecanismo equivalente. No hay estimación de líneas, no hay forecast, no hay decisión de cadena de PRs.

**Delta:** El Forecast del oficial es el mecanismo más valioso de los tres. No existe en el local. **Cherry-pick crítico.**

---

## 4. Resumen de Cherry-Picks por Prioridad

| Prioridad | Qué traer | Origen |
|-----------|-----------|--------|
| 🔴 Crítico | Review Workload Forecast completo con contrato de texto plano | Oficial |
| 🔴 Crítico | Tabla de criterios SPEC/ACT/VER/SMALL + size budget (≤530 words) | Oficial |
| 🟡 Alto | Orchestrator Gate (STOP, no ejecutes inline) | Oficial |
| 🟡 Alto | Return Summary estructurado (tabla de fases + forecast) | Oficial |
| 🟢 Mantener | PREREQUISITO spec.md antes de tasks | Local |
| 🟢 Mantener | Tick-and-save inmediato por ítem | Local |
| 🟢 Mantener | Git-Ops delegada al humano (Context Pollution guard) | Local |
| 🟢 Mantener | MANDATORY_RELEASE_PROTOCOL como bloque de cierre | Local |

---

## 5. Lo que el Local tiene que el Oficial NO tiene

| Elemento | Valor |
|----------|-------|
| Fase 0 Branch Setup T1 | Verificaciones git antes de tocar código. Elimina ambigüedad de estado de repo. |
| Doc-Update Index (📚) | Decisión explícita sobre qué docs vivos actualizar, con regla de Safe-Contexting. |
| MANDATORY_RELEASE_PROTOCOL | Protocolo de cierre de release completo (tests, release notes, archivado, bump de versión). |
| Git-Ops para el humano | Separación arquitectónica clara: criterio → Orquestador, mecánica → Humano. |

Estos no existen en el oficial porque el oficial es agnóstico al proyecto. Son específicos de `funky-ai` y **deben conservarse**.

---

> **Conclusión operativa:** Dos cherry-picks críticos cambian la naturaleza del template local: el Forecast y la tabla de criterios de tarea. Ambos eliminan ambigüedad que hoy se resuelve tardíamente (al momento del PR o durante la ejecución). Todo lo demás en el local es contexto específico del proyecto que el oficial no pretende cubrir.
