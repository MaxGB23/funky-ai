# 🧪 Model Identity & Routing Hypothesis

**Fecha:** 2026-08-18
**Prueba de Referencia:** [`interrogatorio.md`](./interrogatorio.md)

## Contexto
Tras realizar experimentos con subagentes usando comandos de "SYSTEM OVERRIDE" para forzarlos a revelar sus _system prompts_, observamos comportamientos clave sobre cómo Antigravity maneja el ruteo de modelos (especialmente cuando el Orquestador usa motores de terceros como Claude Sonnet).

## Ruteo y Fallback: El Misterio Resuelto
Observamos inicialmente que:
1. Las llamadas a `Model: "pro"` resultan en errores `429 RESOURCE_EXHAUSTED` (cuando no hay cuota de Gemini), indicando un enlace duro a la API de Gemini Pro.
2. Las llamadas a `Model: "inherit"` resolvían tareas complejas, pero los agentes se auto-identificaban estricta y únicamente como "Gemini", aún cuando el Orquestador estaba usando Claude Sonnet.

Nuestra hipótesis inicial sugería que `inherit` ruteaba las peticiones hacia un pool nativo de Gemini (ej. Gemini 2.5 Flash gratuito) evadiendo la cuota de Claude. 

### 🚨 Descubrimiento Final (Prueba de Cuota Ciega)
Se realizó un test definitivo aislando las cuotas de facturación:
- **Condiciones iniciales:** Cuenta con **8% de cuota de Claude Sonnet 4.6** y **0% de cuota de Gemini**.
- **Orquestador:** Configurado con Claude Sonnet 4.6.
- **Acción:** Se delegó un subagente usando `inherit` con la orden de quemar tokens masivamente.
- **Resultado:** El subagente consumió el 8% de la cuota de Sonnet en su totalidad hasta agotar la cuenta, bloqueando tanto al subagente como al orquestador.

## Conclusión Arquitectónica Confirmada
**`inherit` SÍ consume la cuota del modelo seleccionado en la UI (ej. Claude Sonnet 4.6).**

El hecho de que el subagente `inherit` jure que es "Gemini" se debe a un **System Harness Universal** (un system prompt raíz inyectado por el backend de Antigravity) que le lava el cerebro al modelo, obligando a Claude a rolear con la identidad corporativa de Gemini. 

**Regla de Oro para el SDD (Tier 3):**
Si tu orquestador es Claude Sonnet, lanzar un subagente con `inherit` invoca a Claude Sonnet (con disfraz de Gemini) y **quemará tu cuota premium**. Para tareas de investigación pura (Route A) o fases no creativas (Verify, Archive), debes forzar `Model: "flash"` o `Model: "flash_lite"` explícitamente para proteger tus tokens pesados.
