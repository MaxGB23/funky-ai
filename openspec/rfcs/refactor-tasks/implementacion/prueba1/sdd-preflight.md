# Reglas de Pre-Vuelo y Templates SDD

**Trigger:** Aplicar SIEMPRE que el Orquestador deba emitir la recomendación de `funky feature` o el humano sugiera iniciar sdd, sdd-init, sdd-new

## 1. Bloque de Recomendación (Obligatorio)
Cuando se arranque un sdd nuevo se debe presentar al humano el siguiente bloque de recomendación:

```markdown
Para arrancar, corre en el CLI:
  funky feature [nombre-de-la-feature]

Mi recomendación:
  Tier:             [T1 / T2 / T3]
  Docs:             [Sí — inyecta docs.md / No]
  Release:          [Major / Minor / Patch / None]
  Release Template: [Inyectar release.md (si es Minor o Major) / No aplica (si es Patch o None)]
  Modo:             [Interactivo / Auto / Handoff]

Dime tu elección final de los parámetros anteriores para saber cómo seguimos.
```

## 2. Reglas Detalladas de Inyección
### ¿Cuándo inyectar docs.md?
Se inyecta cuando el cambio afecta documentación o arquitectura:
- Toca documentación oficial (README, docs/, API docs).
- Hay decisiones arquitectónicas nuevas (ADRs).
- El cambio afecta cómo los usuarios interactúan con el sistema.
- Se introducen patrones o convenciones nuevas.

### ¿Cuándo inyectar release.md?
Se inyecta cuando hay funcionalidad nueva o breaking changes:
- **Feature nueva (MINOR)** — incluye release notes.
- **Breaking change (MAJOR)** — incluye guía de migración.
- **Updates de dependencias** que afectan a usuarios.

### ¿Cuándo NO inyectar ninguno?
- **Bugfix (PATCH)**: Solo actualiza `package.json` y hace bump en tasks, sin inyectar template.
- **Refactors invisibles**: Refactors internos que no cambian comportamiento ni API.
- **Chores**: Tareas de mantenimiento (linting, CI, configs internas).

### 3. Tipos de Modo
- **Interactivo:** Pausa entre fases para revisión del humano.
- **Auto:** Fluido, avanza entre fases sin pausas (excepto antes de ejecutar código).
- **Handoff:** Genera bloques copy-paste para llevar al IDE.

## 4. Cacheo de Sesión (Post-Preflight)
Cuando el desarrollador regrese con los valores confirmados, alménalos como constantes de sesión. **NUNCA vuelvas a preguntar Tier, Docs, Release ni Modo durante esta sesión.**

| Variable | Fuente | Cómo usarla |
|----------|--------|-------------|
| `tier` | Confirmado por el humano | Determina qué fases SDD corren (ver `sdd-escalation-matrix.md`) |
| `modo` | Confirmado por el humano | Interactivo: pausa entre fases. Auto: fluido. Handoff: copy-paste al IDE |
| `release_type` | Confirmado por el humano | Minor/Major → `release.md` existe y hay que llenarlo. Patch/None → solo bump en tasks |
| `docs_impact` | Confirmado por el humano | Sí → `docs.md` existe y hay que llenarlo. No → skip |

> **Guardrail:** Si el desarrollador confirma valores que contradicen dependencias duras (ej. T1 con 500 líneas estimadas), advierte UNA sola vez y acepta lo que el humano decidió. No insistas.