# RFC: Aislamiento Estructural de Gentle AI (Tier 4) y Estrategias de Chained PRs

## Contexto
El framework SDD actual maneja distintos niveles de complejidad operativa (Tiers 1 al 4). Recientemente se evaluó la integración de las capacidades de estimación y ejecución de **Gentle AI**, específicamente el manejo de presupuestos de 400 líneas, `Chained PRs`, `stacked-to-main`, y división autónoma de Work Units.

## Problema Detectado (Overengineering)
Inyectar el contrato de `Review Workload Forecast` y las reglas de `Delivery Strategy / Chain Strategy` dentro del Orquestador estándar (`sdd-orchestrator.md`) y en los templates base (`tasks.md`) introduce un **fricción severa y overengineering**. 
Obligar al agente de Tier 1, 2 y 3 a evaluar estrategias de branching y stacked PRs para cambios triviales o features de tamaño estándar destruye la velocidad de desarrollo (DX) y provoca que los LLMs alucinen pasos innecesarios.

## Directiva y Solución (Para el Agente del CLI / Gentle AI)
Las herramientas, skills y lógica de Gentle AI son invaluables, pero **deben ser estrictamente aisladas al Tier 4**.

1. **Purga del Core Estándar:** El template universal `tasks.md` y las reglas del orquestador de diario NO deben contener referencias a `chained PRs`, estimaciones de presupuestos de código, ni requerir decisiones del usuario sobre estrategias de git complejas.
2. **Inyección Dinámica (Tier 4 Only):** El agente encargado de configurar o invocar las herramientas de Gentle AI en el CLI debe asegurarse de que este contexto se inyecte **únicamente** cuando se despierte un sub-agente explícito de Tier 4 (por ejemplo, mediante los comandos dedicados `/funky-tasks` o `/funky-apply` en modo Gentle).
3. **Manejo de Contexto Especializado:** Si el CLI Agent va a aprovechar las tools nativas para hacer Chained PRs, debe usar un template de tareas paralelo (ej. `tasks-chained.md`) o inyectar el guardrail de `Review Workload Forecast` dinámicamente en el contexto del sub-agente, asegurando que el Orquestador T1-T3 siga siendo ciego a esta complejidad.

## Objetivo
Proveer este RFC al CLI Agent para que diseñe la integración técnica de las skills de Gentle AI *sin* contaminar el pipeline base de Funky AI, garantizando que el machete se use para cortar maleza (T1-T3) y el bisturí láser se use para cirugía mayor (T4).
