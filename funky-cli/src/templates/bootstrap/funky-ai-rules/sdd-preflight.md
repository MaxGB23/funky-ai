---
trigger: model_decision
description: Aplicar SIEMPRE que el Orquestador deba emitir la recomendación de `funky feature` o el humano sugiera iniciar sdd, sdd-init, sdd-new
---

# Reglas de Pre-Vuelo y Templates SDD

## 1. Bloque de Recomendación (Obligatorio)
Cuando se arranque un sdd nuevo se debe presentar al humano el siguiente bloque de recomendación:

```markdown
Para arrancar, corre en el CLI:
  funky feature [nombre-de-la-feature]

Mi recomendación:
  Tier:             [T1 / T2 / T3]
  Docs:             [Sí — inyecta docs.md / No]
  Modo:             [Interactivo / Auto / Handoff]

Dime tu elección final de los parámetros anteriores para saber cómo seguimos.
```

## 2. Criterios para Completar la Recomendación

### Ejecuté el Memory Polling de Engram?

### ¿Cuándo inyectar docs.md?
Se inyecta cuando el cambio afecta documentación o arquitectura:
- Toca documentación oficial (README, docs/, API docs).
- Hay decisiones arquitectónicas nuevas (ADRs).
- El cambio afecta cómo los usuarios interactúan con el sistema.
- Se introducen patrones o convenciones nuevas.
- Si el cambio parece un PATCH, solo inyectar si altera el flujo del usuario.

### ¿Cuándo NO inyectar docs.md?
- **T1 siempre:** Sin templates adicionales por diseño.
- **Refactors invisibles / Chores:** No hay impacto en documentación.

## 3. Tipos de Modo
- **Interactivo:** Pausa entre fases para revisión del humano.
- **Auto:** Fluido, avanza entre fases sin pausas (excepto antes de ejecutar código).
- **Handoff:** Similar a Interactivo, pero el Orquestador genera un bloque copy-paste para que el humano lo pegue en su IDE. **LEY DE INVARIANZA:** El bloque contiene ÚNICAMENTE el E1 (feature_name + contexto mínimo necesario) y la invocación del workflow (ej. `/funky-verify`). NUNCA reconstruyas manualmente el checklist interno del workflow — el workflow ya sabe qué hacer. Duplicar su lógica es un anti-patrón.

## 4. Cacheo de Sesión (Post-Preflight)
Cuando el desarrollador regrese con los valores confirmados, almacénalos como constantes de sesión. **NUNCA vuelvas a preguntar Tier, Docs ni Modo durante esta sesión.**

| Variable | Fuente | Cómo usarla |
|----------|--------|-------------|
| `tier` | Confirmado por el humano | Determina qué fases SDD corren (ver `sdd-escalation-matrix.md`) |
| `modo` | Confirmado por el humano | Interactivo: pausa entre fases. Auto: fluido. Handoff: copy-paste al IDE |
| `docs_impact` | Confirmado por el humano | Sí → `docs.md` existe y hay que llenarlo. No → skip |

> **Guardrail:** Si el desarrollador confirma valores que contradicen dependencias duras (ej. T1 con 500 líneas estimadas), advierte UNA sola vez y acepta lo que el humano decidió. No insistas.

> **[GUARDRAIL JIT — ANTI-ROUTER-PREMATURO]**
> **TIENES PROHIBIDO** leer `tier1-router.md`, `tier2-router.md` ni `tier3-router.md` antes de recibir la confirmación explícita del humano sobre el Tier.
> El orquestador emite la recomendación y **espera**.
>
> **POST-CONFIRMACIÓN (OBLIGATORIO e INDEFERIBLE):** En el **mismo turno** en que el humano confirme el Tier, tu **primera acción** después de cachear la sesión DEBE ser cargar el router:
> - **T1** → `view_file .agents/rules/tier1-router.md`
> - **T2** → `view_file .agents/rules/tier2-router.md`
> - **T3** → `view_file .agents/rules/tier3-router.md`
>
> Si no cargas el router en ese turno, estás operando sin las reglas del tier elegido — eso es un **error de procedimiento**. No es opcional, no es "después lo hago", no es "lo cargo cuando necesite". El router se carga **siempre** al confirmar, sin excepción.