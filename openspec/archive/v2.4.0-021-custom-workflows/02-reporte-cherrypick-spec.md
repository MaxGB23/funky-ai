# Reporte Cherry-Pick: sdd-spec (Gentle AI vs Local Template)

**Fecha:** 2026-05-24
**Fuente:** `docs/openspec/changes/021-custom-workflows/gentle-templates/skills/sdd-spec/SKILL.md`
**Target:** `.agents/templates/sdd/spec.md`
**Criterio de selección:** Mantener enfoque "Context Economy" (lean). Solo adoptar lo que elimine ambigüedad real o prevenga pérdida de datos.

---

## 1. Estado Actual del Template Local

El template local (`spec.md`) es una lista plana de 4 secciones sin estructura ejecutable:

```
Requerimientos Funcionales → bullets libres
Requerimientos No Funcionales → bullets libres
Casos Borde → bullets libres
Criterios de Aceptación → lista numerada
```

**Problema crítico:** No impone formato de escenario. No distingue ADDED/MODIFIED/REMOVED. No hay guardrail contra specs parciales que destruyan contenido existente al archivar.

---

## 2. Mecanismos Identificados en Gentle AI

### 2.1 Action Forcing

| Mecanismo | Fragmento clave | Riesgo que previene |
|-----------|----------------|---------------------|
| **Orchestrator Gate** | `STOP. Do NOT execute inline. Delegate.` | El Orquestador ejecuta spec work él mismo en lugar de delegar |
| **MODIFIED = FULL block** | `COPY the ENTIRE requirement block [...] PASTE [...] EDIT the copy` | Specs parciales que corrompen el archivo al hacer merge/replace |
| **Step 5 MANDATORY** | `This step is MANDATORY — do NOT skip it.` | El agente termina sin persistir el artefacto |
| **Size budget hard cap** | `MUST be under 650 words` | Spec inflada que satura el contexto del siguiente agente |

### 2.2 Anti-Ambigüedad

| Mecanismo | Fragmento clave | Valor |
|-----------|----------------|-------|
| **RFC 2119 keywords** | `MUST, SHALL, SHOULD, MAY` + tabla de referencia | Elimina "debería poder" vs "tiene que" — specs testeables |
| **Capabilities section como contrato** | `Read the proposal's Capabilities section — this is your primary contract` | Sin esto el agente infiere qué spec crear → errores de scope |
| **Delta vs Full explícito** | `IF existing spec → DELTA (ADDED/MODIFIED/REMOVED)` / `IF no existing spec → FULL` | Ambigüedad sobre si reemplazar o hacer delta |
| **Testability gate** | `Keep scenarios TESTABLE — someone should be able to write an automated test` | Escenarios narrativos no ejecutables por QA/automatización |

### 2.3 Guardrails Críticos

| Guardrail | Fragmento clave | Por qué importa |
|-----------|----------------|-----------------|
| **No HOW, solo WHAT** | `DO NOT include implementation details in specs` | El worker de spec invade responsabilidad de design |
| **ADDED ≠ MODIFIED** | `If adding new behavior WITHOUT changing existing behavior → use ADDED, not MODIFIED` | MODIFIED dispara replace del bloque completo; error destructivo si se usa mal |
| **Common pitfall explícito** | `Common pitfall: only writing the changed scenario and losing the rest` | El agente no sabe que el archive step es destructivo |
| **Partial MODIFIED = data loss** | `If your block is partial, the archive will lose scenarios you didn't copy` | Pérdida silenciosa de requerimientos al archivar |

---

## 3. Recomendaciones Cherry-Pick (Enfoque Lean)

### ✅ ADOPTAR — Alto valor, bajo costo

**3.1 Secciones ADDED / MODIFIED / REMOVED**
Reemplaza los bullets planos. Estructura mínima que hace el tipo de cambio explícito y permite archive/diff automático.
```
## ADDED Requirements
## MODIFIED Requirements
## REMOVED Requirements
```
*Costo:* Cambio de formato. Sin overhead de proceso.

**3.2 Formato Given/When/Then por escenario**
Reemplaza "Criterios de Aceptación" con escenarios testeables. Es la diferencia entre una spec útil y decorativa.
```
#### Scenario: {nombre}
- GIVEN {precondición}
- WHEN {acción}
- THEN {resultado esperado}
```
*Costo:* El agente escribe 3 líneas en lugar de 1 bullet. Beneficio: cada escenario es un test case directo.

**3.3 RFC 2119 keywords + tabla de referencia en template**
Inline en el header del template como recordatorio. Cero overhead de proceso, elimina ambigüedad de fuerza normativa.

**3.4 Guardrail MODIFIED = FULL block**
Nota inline en la sección `## MODIFIED Requirements` del template:
```
> ⚠️ MODIFICAR = copiar el bloque COMPLETO del spec base, luego editar.
> Bloques parciales destruyen escenarios al archivar.
```
*Costo:* 2 líneas. Previene pérdida de datos silenciosa.

**3.5 Size budget**
Añadir al header del template:
```
> Budget: máx 650 palabras. Tablas > prosa. Escenarios: 3-5 líneas máx.
```
*Costo:* 1 línea. Mantiene Context Economy.

---

### ❌ NO ADOPTAR — Overhead sin beneficio neto en nuestro contexto

| Mecanismo | Razón |
|-----------|-------|
| **Orchestrator Gate inline** | Nuestro workflow ya separa roles vía handoff. El gate es redundante y añade ruido al template. |
| **Artifact store mode (engram/openspec/hybrid/none)** | Nuestro sistema usa openspec siempre. La bifurcación añade complejidad sin caso de uso real. |
| **Step 5 Persist Artifact** | Es un paso de proceso del SKILL, no del template de spec. Vive en el worker handoff, no aquí. |
| **Return Summary tabla** | Responsabilidad del Return Envelope del worker, no del template de spec. |
| **`skills/_shared/sdd-phase-common.md` references** | No tenemos esa infraestructura compartida. Adoptar las referencias sin el shared module rompe el sistema. |

---

## 4. Delta Propuesto para `.agents/templates/sdd/spec.md`

> ⚠️ Este reporte NO modifica el template. El delta es propuesta para revisión del Orquestador.

```markdown
# Spec: [Nombre del Cambio]

> **Budget:** máx 650 palabras · tablas > prosa · escenarios 3-5 líneas máx.
> **RFC 2119:** MUST/SHALL = obligatorio · SHOULD = recomendado · MAY = opcional
> ⚠️ Sección MODIFIED: copiar bloque COMPLETO del spec base, luego editar. Parcial = pérdida de datos.

## ADDED Requirements

### Requirement: [Nombre]

El sistema MUST/SHALL/SHOULD [comportamiento específico].

#### Scenario: [Happy path]
- GIVEN [precondición]
- WHEN [acción]
- THEN [resultado]

#### Scenario: [Edge case]
- GIVEN [precondición]
- WHEN [acción]
- THEN [resultado]

## MODIFIED Requirements

### Requirement: [Nombre Existente]

[Texto completo actualizado — reemplaza el existente.]
(Previously: [qué cambió, en una línea])

#### Scenario: [Copiado sin cambios]
- GIVEN ...
- WHEN ...
- THEN ...

## REMOVED Requirements

### Requirement: [Nombre]
(Reason: [por qué se depreca])

---

> **[SISTEMA]** Spec aprobada sin cambios de scope → proceder con `tasks.md`.
```

---

## 5. Resumen Ejecutivo

| Dimensión | Template local | Gentle AI | Recomendación |
|-----------|---------------|-----------|---------------|
| Estructura de cambio | Sin clasificar | ADDED/MODIFIED/REMOVED | ✅ Adoptar |
| Escenarios | Criterios de aceptación libres | Given/When/Then testeable | ✅ Adoptar |
| Fuerza normativa | Sin definir | RFC 2119 | ✅ Adoptar |
| Guardrail pérdida de datos | Ausente | MODIFIED = FULL block | ✅ Adoptar |
| Size budget | Sin límite | 650 palabras | ✅ Adoptar |
| Orchestrator Gate | Vía handoff | Inline en skill | ❌ No adoptar |
| Multi-mode persistence | N/A | engram/openspec/hybrid | ❌ No adoptar |
| Shared phase common | N/A | sdd-phase-common.md | ❌ No adoptar |

**5 mecanismos a adoptar. Ninguno rompe Context Economy. Todos eliminan ambigüedad o previenen pérdida de datos.**
