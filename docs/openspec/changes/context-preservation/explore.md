# Explore: Context Preservation
**TIER DE ORQUESTACIÓN ELEGIDO: "N"**

## 1. Contexto del Problema

El pipeline SDD tiene un **anti-patrón de Teléfono Descompuesto** (broken telephone) entre Explore y Propose. Explore optimiza por riesgos arquitectónicos y omite contexto factual (reglas, definiciones, scope no-negociable) porque eso no es "interesante arquitectónicamente". Propose solo lee explore.md y arranca ciego — nunca supo que existían constraints que el RFC ya definía.

**No es culpa de Explore.** Su definición actual es "explorar riesgos y opciones de arquitectura". El LLM lee el RFC, ve "convenciones de nombres", "FULL vs DELTA", y con justa razón lo poda porque **eso no es un riesgo arquitectónico**. El problema es que Explore no sabe qué necesita Propose.

## 2. Estado Actual del Codebase

### Archivos afectados

- **`docs/prompts/sdd/funky-explore.md`** (114 líneas) — Prompt/orquestador de la fase Explore. Define identidad, prerequisitos, y template de output.
  - Output template actual tiene 4 secciones: Contexto del Problema, Estado Actual del Codebase, Opciones de Arquitectura, Recomendación + Riesgos.
  - **NO tiene sección de Context Preservation.**
  - Reglas estrictas incluyen: solo lectura, un solo artefacto, código real, concisión, honestidad.

- **`docs/prompts/sdd/funky-propose.md`** (76 líneas) — Prompt/orquestador de la fase Propose.
  - Lee explore.md como prerequisito (step 4).
  - Output template: Intent, Scope, Capabilities, Approach, Affected Areas, Risks, Rollback, Dependencies, Success Criteria.
  - **NO verifica ni menciona Context Preservation.**

- **`funky-cli/src/templates/sdd/explore.md`** (25 líneas) — Template scaffolding generado por CLI.
  - Template simplificado para nuevos archivos explore.
  - **NO incluye Context Preservation.**

- **`docs/openspec/rfcs/.importantes/sdd-interactive/03-explore.md`** (60 líneas) — Referencia del formato de output de Explore para el orchestrador.
  - Lista las secciones del output: Current State, Affected Areas, Approaches, Recommendation, Risks.
  - **NO incluye Context Preservation.**

### Flujo actual (con el problema)

```
RFC → EXPLORE → explore.md (sin Context Preservation) → PROPOSE → proposal.md
                                     ↓
                              Propose solo ve esto
                              y arranca ciego
```

## 3. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **Opción A: Context Preservation en Explore** | Agregar sección obligatoria de volcado factual al output de Explore + instrucción a Propose para verificarla | Simple (cambio de templates), bajo costo (~5-10 líneas por feature), no rompe abstracción del pipeline | Si Explore es descuidado puede omitir cosas (mitigar con regla estricta) |
| **Opción B: Propose lee RFC + Explore** | Hacer que Propose lea tanto el RFC original como explore.md | Garantiza que Propose tenga todo el contexto | 2x tokens, dos LLMs interpretan el mismo RFC → inconsistencia, rompe abstracción del pipeline |
| **Opción C: Fidelity Check opcional** | Agente rápido entre Explore y Propose que compara explore.md vs RFC buscando hechos omitidos | Catch de omisiones para features grandes | Complejidad adicional, nuevo agente, solo justificado para features > 400 líneas |

## 4. Recomendación + Riesgos

**Opción recomendada: Opción A** (con Opción C como plan de contingencia futuro)

**Justificación:**
- Es el cambio más simple y directo que resuelve el problema core
- No rompe la abstracción del pipeline (cada fase sigue dependiendo solo de la fase anterior)
- El costo es lineal con la cantidad de reglas del RFC, no con el tamaño del RFC
- La Opción B fue explícitamente rechazada en el RFC por romper la abstracción
- La Opción C se puede agregar después si se demuestra necesario para features grandes

**Riesgos mitigables:**
- **Explore omite cosas a pesar de la sección**: Mitigar con regla estricta "siempre llenar, aunque no haya reglas explícitas escribir 'Ninguna regla explícita identificada'"
- **Propose no verifica la sección**: Mitigar con instrucción explícita en funky-propose.md
- **Template CLI no incluye la sección**: Mitigar actualizando funky-cli/src/templates/sdd/explore.md

## Context Preservation (para fases siguientes)

### Reglas del RFC / input fuente
- Explore tiene una función objetivo dual: (1) analizar riesgos arquitectónicos, (2) preservar contexto factual para fases siguientes
- La sección Context Preservation es **obligatoria** — no es opcional aunque no haya reglas explícitas
- El volcado factual (~5-10 líneas) es lineal con la cantidad de reglas, no con el tamaño del RFC
- Propose NO debe leer el RFC original — depende exclusivamente de lo que Explore le pase

### Definiciones clave
- **Context Preservation**: Volcado factual no-analítico de reglas, definiciones y scope del documento fuente
- **Teléfono Descompuesto**: Anti-patrón donde cada fase del pipeline pierde información factual de la anterior
- **Fidelity Check**: (futuro) Agente opcional que compara explore.md vs RFC buscando hechos omitidos

### Scope no-negociable
- La sección Context Preservation va en funky-explore.md (template de output)
- Propose debe verificar que la sección esté completa antes de escribir proposal.md
- El fidelity check (Opción C) NO se implementa en este cambio — es plan de contingencia
- No se crean nuevos agentes ni scripts — solo se modifican templates existentes

---

### Ready for Proposal: Yes

El cambio está bien definido, es puramente aditivo (templates), y no tiene dependencias ni blockers. Se puede proceder directamente a la fase Propose.

## 5. Áreas Afectadas (Resumen para Propose)

| Área | Archivo | Cambio |
|------|---------|--------|
| Explore prompt | `docs/prompts/sdd/funky-explore.md` | Agregar sección Context Preservation al template de output + regla estricta |
| Propose prompt | `docs/prompts/sdd/funky-propose.md` | Agregar verificación de Context Preservation como prerequisito |
| CLI template | `funky-cli/src/templates/sdd/explore.md` | Agregar sección Context Preservation al scaffolding |
| Reference interactive | `docs/openspec/rfcs/.importantes/sdd-interactive/03-explore.md` | Actualizar formato de output para incluir Context Preservation |
