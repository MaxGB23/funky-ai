# Reporte Cherry-Pick — `sdd-propose` vs `proposal.md`
> **Criterio de selección:** Context Economy — solo lo que elimine ambigüedad real o prevenga errores costosos en tokens.

---

## 1. Análisis Delta

| Dimensión | `gentle-templates/sdd-propose/SKILL.md` (oficial) | `.agents/templates/sdd/proposal.md` (local) |
|---|---|---|
| **Guardrail de rol** | `ORCHESTRATOR GATE` bloqueante: si cargaste este skill sos el orquestador → STOP, delegar. | ❌ Ninguno. El template es pasivo. |
| **Sección de capacidades (Capabilities)** | Contrato explícito con la fase sdd-spec. Fuerza mapeo New/Modified capabilities → spec files. | ❌ Ausente. Decisiones técnicas sin contrato descendente. |
| **Budget de tamaño** | Hard limit: `< 450 palabras`. Fuerza bullets/tablas sobre prosa. | ❌ Sin límite. Riesgo de propuestas novelísticas. |
| **Rollback Plan** | Campo obligatorio. El agente no puede omitirlo. | ❌ Ausente. |
| **Success Criteria** | Checklist `[ ]` obligatorio. | ❌ Ausente. |
| **Modo de persistencia** | 4 modos explícitos (`engram / openspec / hybrid / none`). Cada modo define exactamente qué leer y qué escribir. | ❌ Asume siempre filesystem. Sin lógica condicional. |
| **Risks table** | Tabla estructurada con `Likelihood` + `Mitigation`. | ✅ Presente pero sin estructura de likelihood. |
| **Instrucción al orquestador** | Return envelope estandarizado (resumen 4 campos + Next Step). | ✅ Presente pero como bloque suelto sin schema. |
| **Fuera de Scope (Out of Scope)** | Sección dedicada explícita. | ✅ Presente como "Non-Goals". |

---

## 2. Action Forcing Mechanisms (lo que previene decisiones sin validación humana)

### 2.1 `ORCHESTRATOR GATE` — Hard Stop
```markdown
> **ORCHESTRATOR GATE**: If you loaded this skill via the `skill()` tool, you are
> the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to
> the dedicated `sdd-propose` sub-agent…
```
**Por qué importa:** Previene el patrón de "Batching" donde el orquestador ejecuta fases inline en lugar de delegar. Sin este guardrail, el orquestador puede generar la propuesta en su propio contexto, acumulando tokens y violando el aislamiento de fases.

**Veredicto:** ✅ Cherry-pick. Es la defensa más importante contra el Agentic Drift.

---

### 2.2 Sección `Capabilities` como Contrato Inter-Fase
```markdown
> This section is the CONTRACT between proposal and specs phases.
> The sdd-spec agent reads this to know exactly which spec files to create or update.
```
Con subsecciones `New Capabilities` y `Modified Capabilities` que mapean directamente a `openspec/specs/<name>/spec.md`.

**Por qué importa:** Sin este contrato, el agente de specs tiene que *inferir* qué archivos tocar. Eso es ambigüedad costosa: el agente explorer re-lee todo el filesystem, gasta tokens, y puede equivocarse de scope. Esta sección transforma la propuesta en un handoff preciso.

**Veredicto:** ✅ Cherry-pick. Alta densidad de valor, cero tokens de overhead en ejecución.

---

### 2.3 Hard Budget `< 450 palabras`
```markdown
- **Size budget**: Proposal artifact MUST be under 450 words. Use bullet points and tables over prose.
```

**Por qué importa:** Propuestas largas = contexto cargado innecesariamente por todos los agentes que leen la propuesta en fases posteriores (sdd-spec, sdd-tasks). Es un multiplicador de costo. El límite fuerza densidad semántica.

**Veredicto:** ✅ Cherry-pick como regla de redacción.

---

### 2.4 `Rollback Plan` Obligatorio
**Por qué importa:** Si no existe plan de rollback en la propuesta, el agente de tasks nunca lo va a generar. El costo de descubrirlo tarde (en producción) es órdenes de magnitud mayor. El campo forzado previene ese agujero.

**Veredicto:** ✅ Cherry-pick.

---

### 2.5 `Success Criteria` como Checklist `[ ]`
**Por qué importa:** Sin criterios de éxito explícitos, el agente de QA/verificación no tiene contrato qué cumplir. El orquestador tampoco puede saber si la fase terminó correctamente. Genera loops de "¿ya está listo?" costosos.

**Veredicto:** ✅ Cherry-pick.

---

## 3. Lo que NO cherry-pickeamos

| Elemento | Razón |
|---|---|
| Modos de persistencia `engram/openspec/hybrid/none` | Funky AI usa filesystem (`openspec`) por defecto. El selector multi-modo agrega complejidad sin beneficio en el contexto actual. |
| `Return envelope` completo del template oficial | El local ya tiene su equivalente funcional. No hay delta de valor real. |
| `Affected Areas` tabla con `path/to/area` | Útil pero no previene errores críticos. El scope ya lo cubre la sección Capabilities. Diferir. |

---

## 4. Resumen Ejecutivo — Qué llevar al template local

| # | Mecanismo | Impacto | Costo de no tenerlo |
|---|---|---|---|
| 1 | **ORCHESTRATOR GATE** bloqueante | Previene Batching / Agentic Drift | Orquestador ejecuta inline, contexto contaminado |
| 2 | **Capabilities (New / Modified)** como contrato | Handoff preciso a sdd-spec | Agente spec re-lee filesystem, tokens desperdiciados |
| 3 | **Hard budget 450 palabras** | Propuestas densas, carga mínima | Propuestas novelísticas multiplicadas en fases downstream |
| 4 | **Rollback Plan** campo obligatorio | Fuerza pensamiento de reversión en diseño | Rollback inexistente descubierto en producción |
| 5 | **Success Criteria `[ ]`** | Contrato de QA explícito | Loops de verificación costosos y subjetivos |

---

> **Siguiente paso sugerido:** Llevar estos 5 mecanismos al template local `proposal.md` en una task aislada de Worker (sin modificar el template oficial).
