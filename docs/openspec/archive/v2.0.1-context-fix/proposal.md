# Proposal: v2.0.1 Context Fix

## Propuesta Técnica
Pivotar hacia un modelo asimétrico donde el Orquestador vive en el IDE (System Prompt) y el Worker vive en la Terminal (Slash Commands).

1. **Unificación de Capa 2:** Destruir el comando `/funky-orchestrator` y fusionar todas las reglas de checklist y G1/G2/G3 en `.agents/rules/sdd-orchestrator.md`. Se elimina el archivo `core` para evitar confusión de nombres.
2. **Rescate de Feature 012:** Recuperar la *Escalation Matrix* y el "Paso 0" desde los archivos archivados e inyectarlos de nuevo en la regla principal.
3. **Dogfooding:** Probar el comportamiento localmente en el repositorio Funky AI antes de impactar el código fuente del CLI.
4. **Fijar el Source of Truth:** Reemplazar `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md` con el nuevo Golden Template y realizar un Diff Analysis para prevenir la pérdida de más datos.

## Trade-offs
- **Pros:** Elimina el Context Fading; el Orquestador jamás olvida sus reglas. El Worker sigue limpio y ciego. Se recupera el Auto-Tiering.
- **Cons:** Aumenta marginalmente el uso de tokens base al estar en el System Prompt, pero es asimilado por el Context Caching de APIs modernas.
