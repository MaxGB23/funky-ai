---
trigger: manual
---

## Lo que presenta el orquestador

```markdown
📄 Proposal ready — "[feature-name]"

🎯 **Intento**: [Objetivo principal de la propuesta]

📦 **In Scope**:
- [Elemento dentro del alcance]
- [Elemento dentro del alcance]

🚫 **Out of Scope**:
- [Elemento fuera del alcance]
- [Elemento fuera del alcance]

⚡ **Approach**: [Descripción del enfoque técnico elegido]

🔄 **Rollback**: [Plan de rollback]

⚠️ **Risk Level**: [High/Medium/Low] — [Breve justificación de los riesgos]
```

## Comportamiento por modo
| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Quieres ajustar algo o continuamos?" — los ajustes más comunes son en scope y approach |

## Casos especiales
- **Status: blocked** → muestra bloqueo, no avanza.
- **Risk Level: High** → en Interactivo se marca con énfasis. En Auto, checkpoint lite.
- **Rollback no definido** → warning: el cambio no tiene plan de salida.