# Discoveries

Aquí se registran los hallazgos técnicos y arquitectónicos que moldean el futuro de Funky AI.

### [DISCOVERY] Model Efficacy & Quota Optimization (Abril 2026)
**What:** Gemini 3 Flash es ideal para tareas de Worker (picar código/templates) por su velocidad. Gemini 3.1 Pro Low es el "punto dulce" para Orquestación, ofreciendo estabilidad sin el consumo masivo de Pro High.
**Why:** El tráfico alto genera errores de retry que pueden agotar cuotas; modelos más ligeros fallan menos y responden más rápido.
**Where:** Workflow de ruteo de modelos en Funky AI.
**Learned:** Reservar Sonnet 4.6 Thinking / Pro High solo para crisis arquitectónicas o refactors masivos.

### [DISCOVERY] Massive Consolidation
**What:** La tablerización de procesos (SDD) es mucho más eficiente que la narrativa secuencial para el modelo.
**Why:** Reduce la carga cognitiva y el "bloat" de tokens de conexión lógica.
**Where:** `funky-ai.md` y guías de equipo.
**Learned:** Priorizar tablas de decisión sobre párrafos largos.

### [DISCOVERY] In-Template Rule Injection (Zero-Token-Waste)
**What:** En lugar de inyectar reglas de orquestación en archivos de workspace globales (ej. `.agents/rules/sdd-orchestrator.md`), se deben colocar como bloques ocultos (`> **[SISTEMA]**`) al final de los propios templates SDD (`tasks.md`, `report.md`).
**Why:** Las reglas globales contaminan el contexto y consumen cuota de tokens en todos los chats irrelevantes. La inyección en el template garantiza que la regla solo se procese en el momento exacto en que se necesita.
**Where:** Protocolo de SDD y generación de Templates.
**Learned:** Las restricciones de orquestación deben vivir lo más cerca posible de la ejecución, no en configuraciones globales.
