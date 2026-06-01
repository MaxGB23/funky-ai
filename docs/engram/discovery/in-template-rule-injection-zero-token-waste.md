### [DISCOVERY] In-Template Rule Injection (Zero-Token-Waste)
**What:** En lugar de inyectar reglas de orquestación en archivos de workspace globales (ej. `.agents/rules/sdd-orchestrator.md`), se deben colocar como bloques ocultos (`> **[SISTEMA]**`) al final de los propios templates SDD (`tasks.md`, `report.md`).
**Why:** Las reglas globales contaminan el contexto y consumen cuota de tokens en todos los chats irrelevantes. La inyección en el template garantiza que la regla solo se procese en el momento exacto en que se necesita.
**Where:** Protocolo de SDD y generación de Templates.
**Learned:** Las restricciones de orquestación deben vivir lo más cerca posible de la ejecución, no en configuraciones globales.