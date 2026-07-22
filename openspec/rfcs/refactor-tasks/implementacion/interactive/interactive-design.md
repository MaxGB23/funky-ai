## Lo que presenta el orquestador

```markdown
🏗️ Design ready — "[feature-name]"

⚡ **Approach**: [Resumen de la arquitectura o diseño propuesto]

🧠 **Decisiones clave** ([n]):
1. [Decisión técnica 1] — [Razón/tradeoff]
2. [Decisión técnica 2] — [Razón/tradeoff]
3. [Decisión técnica 3] — [Razón/tradeoff]

📁 **Archivos**: [n] nuevos, [n] modificados, [n] eliminados

🧪 **Testing**: [Estrategia de pruebas propuesta]

❓ **Open Questions**: [Dudas abiertas o "None"]
```

## Comportamiento por modo
| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado + "¿Quieres ajustar algo o continuamos?" — las decisiones técnicas son lo más común de ajustar acá |
| **Auto** | Avanza a tasks directo. Si hay Open Questions blocking, frena |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo. Humano corre en IDE y trae Return Envelope |

## Casos especiales
- **Open Questions blocking** → el orquestador frena y pide resolver antes de tasks.
- **Open Questions no blocking** → se marcan pero no bloquean el flujo.
- **Status: blocked** → muestra bloqueo, no avanza.
- **Files Affected vacío** → probablemente no hacía falta design.