# Proposal: [Nombre de la Funcionalidad o Cambio]

> **ORCHESTRATOR GATE**: If you loaded this skill, you are the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to the dedicated worker/sub-agent.

> **Budget:** Máx 450 palabras. Usá bullets/tablas sobre prosa.

## 1. Contexto
[Resumen ejecutivo de lo que se va a construir, derivado de la exploración aprobada.]

## 2. Capabilities (CONTRATO CON SPECS)
> Esta sección es el contrato primario para la fase sdd-spec. Define exactamente qué specs crear o actualizar.

**New Capabilities:**
- [Capacidad nueva 1] -> Mapea a `openspec/specs/...`

**Modified Capabilities:**
- [Capacidad modificada 1] -> Mapea a `openspec/specs/...`

## 3. Decisiones Técnicas

| Área | Decisión | Justificación Corta |
|------|----------|---------------------|
| Arquitectura | [Ej: Hexagonal] | [Por qué se eligió] |
| Dependencias | [Ej: Vite, Zustand] | [Por qué se eligió] |
| Almacenamiento | [Ej: LocalStorage] | [Por qué se eligió] |

## 4. Stack / Scope
**Stack Tecnológico:**
- [Tecnología 1]
- [Tecnología 2]

**Fuera de Scope (Non-Goals):**
- [Lo que NO se va a hacer en esta iteración]

## 5. Riesgos y Rollback
**Riesgos:**
| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| [Riesgo 1] | Alta/Media/Baja | [Estrategia] |

**Rollback Plan (OBLIGATORIO):**
- [Paso exacto para revertir si falla en producción]

## 6. Success Criteria
- [ ] [Criterio de éxito 1 verificable]
- [ ] [Criterio de éxito 2 verificable]

> **[SISTEMA - PARA EL ORQUESTADOR]** Si la propuesta es aprobada, procedé a generar el `sdd-spec.md` basado en las Capabilities, o directo a `sdd-tasks.md` si no requiere specs.
