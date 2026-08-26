---
trigger: manual
---

## Lo que presenta el orquestador

```markdown
📋 Specs ready — "[feature-name]"

| Dominio    | Tipo  | Requirements | Escenarios |
|------------|-------|-------------|------------|
| [dominio]  | [New/Delta] | [n added/modified] | [n] |
| [dominio]  | [New/Delta] | [n added/modified] | [n] |

**Cobertura**:
- Happy paths: [✅ / ❌ / ⚠️] [estado]
- Edge cases: [✅ / ❌ / ⚠️] [estado]
- Error states: [✅ / ❌ / ⚠️] [estado]

**Siguiente**: Design
```

## Casos especiales
- **Coverage baja en error states** → se marca como warning, pero no bloquea.
- **Specs MODIFIED** (no solo new) → el orquestador menciona qué cambió respecto
  a la versión anterior.
- **Status: blocked** → muestra el bloqueo, no avanza.
- **Sin dominios nuevos** → si el propose ya cubría todo, quizás no hizo falta spec.