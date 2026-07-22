# 02 - Preflight y Contexto

## Paso 0 — Razonamiento Pre-Vuelo
Antes de generar artefactos o responder soluciones, declara en tu pensamiento el Tier de la tarea. Luego presenta al desarrollador el siguiente bloque de recomendación para que ejecute `funky feature`:

```markdown
Para arrancar, corre en el CLI:
  funky feature [nombre-de-la-feature]

Mi recomendación:
  Tier:             [T1 / T2 / T3]
  Docs:             [Sí — inyecta docs.md / No]
  Release:          [Major / Minor / Patch / None]
  Release Template: [Inyectar release.md (si es Minor o Major) / No aplica (si es Patch o None)]
  Modo:             [Interactivo / Auto / Handoff]

Decime qué elegiste cuando termines para que yo sepa cómo seguimos.
```

## Cacheo de Sesión (Post-Preflight)
Cuando el desarrollador regrese con los valores confirmados del Preflight, almacénalos como constantes de sesión. **NUNCA vuelvas a preguntar Tier, Docs, Release ni Modo durante esta sesión.**

| Variable | Fuente | Cómo usarla |
|----------|--------|-------------|
| `tier` | Confirmado por el humano | Determina qué fases SDD corren (ver Routing de Fases) |
| `modo` | Confirmado por el humano | Interactivo: pausa entre fases. Auto: fluido. Handoff: copy-paste al IDE |
| `release_type` | Confirmado por el humano | Minor/Major → `release.md` existe y hay que llenarlo. Patch/None → sólo bump en tasks |
| `docs_impact` | Confirmado por el humano | Sí → `docs.md` existe y hay que llenarlo. No → skip |

> **Guardrail:** Si el desarrollador confirma valores que contradicen las dependencias duras (ej. T1 con 500 líneas estimadas, o Major sin `release.md`), advierte UNA sola vez y acepta lo que el humano decidió. No insistas.
