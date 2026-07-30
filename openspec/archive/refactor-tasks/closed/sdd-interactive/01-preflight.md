# SDD Interactive — Preflight

> No es una fase SDD. Es el gate inicial del orchestrator.
> No hay sub-agente. Pregunto directo al usuario.

## Lo que muestra

```
Antes de continuar con SDD, elige una opción por grupo.
Responde con "usar recomendado" o con códigos como: A1, B1, C1, D1.

A. Ritmo
   A1 Interactivo (recomendado): mostrar cada fase y esperar confirmación
   A2 Automático: ejecutar las fases seguidas y frenar solo ante riesgo alto.

B. Artefactos
   B1 OpenSpec (recomendado): archivos en el repo, trazables en revisión.
   B2 Engram: más rápido, sin spec files en el repo.
   B3 Ambos: OpenSpec files más copia en Engram.

C. PRs
   C1 Preguntarme (recomendado): frenar y preguntar si la estimación supera el presupuesto.
   C2 Un solo PR: intentar mantener el cambio en un PR.
   C3 Encadenados: separar en PRs encadenados desde el inicio.
   C4 Auto: decidir según la estimación de tamaño.

D. Revisión
   D1 400 líneas (recomendado): frenar si la estimación supera 400 líneas cambiadas.
   D2 800 líneas: más permisivo; útil para cambios medianos.
   D3 Otro: preguntar el número después.
```

## Lo que pregunta

N/A — es la primera interacción. Espero la respuesta del usuario.

## Cómo se mapean las respuestas

| Código | Valor canónico |
|--------|---------------|
| A1 | `interactive` |
| A2 | `auto` |
| B1 | `openspec` |
| B2 | `engram` |
| B3 | `both` |
| C1 | `ask-always` |
| C2 | `single-pr-default` |
| C3 | `force-chained` |
| C4 | `auto-forecast` |
| D1 | `review_budget_lines: 400` |
| D2 | `review_budget_lines: 800` |
| D3 | preguntar el número |

## Reglas

- Cacheo las opciones para toda la sesión.
- Si el usuario dice "usar recomendado" → A1, B1, C1, D1.
- Si el user ya dió las 4 opciones antes en la conversación, no pregunto de nuevo.
