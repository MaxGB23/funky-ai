### [SESSION][add-engram-categories] Implementación de categorías Session y Release
**What:** Se implementó exitosamente el soporte para categorías `session` y `release` en el CLI (`engram add`, `funky init`), las reglas del orquestador y los archivos de indexación.
**Why:** El modelo anterior forzaba a guardar los resúmenes de sesión bajo "architecture" o categorías no semánticas. Ahora tenemos apartados dedicados para agrupar mejor el contexto efímero y los cierres de feature.
**Where:** 
- `M:\funky-ai\.agents\rules\engram-protocol.md`
- `M:\funky-ai\docs\engram\index.md`
- `M:\funky-ai\funky-cli\src\commands\engram.js`
- `M:\funky-ai\funky-cli\src\commands\init.js`
- `M:\funky-ai\funky-cli\tests\engram.test.js`
**Learned:** 
1. **Delegación Estricta:** Usar `self` en lugar de `define_subagent` en Tier 2 rompe el contrato de ligereza y hace que los agentes alucinen contexto del chat en lugar de escribir a disco.
2. **Modo Interactivo:** Nunca saltar las pausas entre fases (Explore -> Propose -> Spec); el humano DEBE validar la salida.
3. El Handoff nativo (copypaste al IDE) funciona perfectamente como fallback cuando los agentes nativos fallan por permisos de escritura o setup.
