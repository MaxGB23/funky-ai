### [DISCOVERY] Model Efficacy & Quota Optimization (Abril 2026)
**What:** Gemini 3 Flash es ideal para tareas de Worker (picar código/templates) por su velocidad. Gemini 3.1 Pro Low es el "punto dulce" para Orquestación, ofreciendo estabilidad sin el consumo masivo de Pro High.
**Why:** El tráfico alto genera errores de retry que pueden agotar cuotas; modelos más ligeros fallan menos y responden más rápido.
**Where:** Workflow de ruteo de modelos en Funky AI.
**Learned:** Reservar Sonnet 4.6 Thinking / Pro High solo para crisis arquitectónicas o refactors masivos.