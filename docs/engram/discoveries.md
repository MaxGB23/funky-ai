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

### [DISCOVERY][sdd-template-quality-gap] Gap entre Plantilla Canónica y Templates del CLI
**What:** Los templates SDD generados por `funky phase` (en `src/templates/sdd/`) son esqueletos mínimos de ~14 líneas, mientras que la plantilla canónica oficial (`docs/funky-ai/workers/plantilla-worker-handoff.md`) tiene 83 líneas con estructura completa: Memory Polling, Reglas de Ejecución, Return Envelope.
**Why:** La Fase 3 de v1.4 fue ejecutada por un Worker con instrucciones demasiado vagas sobre el nivel de detalle esperado. El Worker interpretó "template" como "esqueleto vacío".
**Where:** `funky-cli/src/templates/sdd/` — todos los 5 archivos afectados.
**Learned:** Al instruir a un Worker para crear templates, el Orquestador DEBE adjuntar un ejemplo de referencia concreto o especificar explícitamente el nivel de detalle. "Template con estructura X" no es suficiente — hay que mostrar el modelo canónico.

### [DISCOVERY][cli-missing-readme] CLI sin README de Instalación/Uso
**What:** `funky-cli/` no tiene `README.md`. Un nuevo colaborador que clone el repo no tiene ninguna guía de cómo instalar el CLI (pnpm link), qué comandos existen ni qué hace cada uno.
**Why:** La v1.4 estuvo enfocada en implementar la funcionalidad. La documentación de superficie del paquete fue omitida.
**Where:** `funky-cli/README.md` — archivo inexistente.
**Learned:** Cada paquete publicable debe tener su README como criterio de Done (DoD). Agregar al checklist de release: "¿Existe README con instalación + comandos + ejemplos?".

### [DISCOVERY][release-dod-gap] Template de tasks.md sin pasos de documentación de Release
**What:** La Fase de Release en todos los `tasks.md` generados hasta v1.4 solo incluía `git commit + merge + tag + actualizar ORCHESTRATOR-STATE.md`. Nunca incluyó: crear `docs/funky-ai/releases/vX.Y.Z-release.md`, actualizar `README.md` con la nueva versión, ni verificar que ORCHESTRATOR-STATE.md quedara sincronizado post-merge. Resultado: v1.3 y v1.4 no tienen release notes, el README quedó en v1.2, y el ORCHESTRATOR-STATE.md quedó stale después del merge.
**Why:** El gap está en el template `funky-cli/src/templates/sdd/tasks.md` — la sección de Fase Release nunca tuvo esos pasos. Todos los Orquestadores heredaron el gap al usar `funky phase tasks`.
**Where:** `funky-cli/src/templates/sdd/tasks.md` — Sección de Release. Efecto cascada en v1.3 y v1.4.
**Learned:** El template de `tasks.md` DEBE tener una Fase de Release con checklist explícito: (1) git commit+merge+tag, (2) crear release notes en `docs/funky-ai/releases/`, (3) actualizar README.md con nueva versión, (4) sincronizar ORCHESTRATOR-STATE.md post-merge y verificar que no quede stale.

### [DISCOVERY][worker-invocation-prompt] La Invocación del Worker no está en el Template
**What:** El usuario (Router Humano) a menudo no sabe qué "prompt" usar para invocar al Worker, porque el protocolo Funky AI reemplaza los prompts largos por el archivo `worker-handoff.md`. Sin embargo, la cadena de invocación exacta (`@archivo Ejecutá la Fase X`) no está estandarizada en ningún lado.
**Why:** Asumimos que el Orquestador siempre le diría al usuario qué copiar y pegar en el chat, pero si el Orquestador no lo hace (o el usuario no lee el chat), se pierde la fluidez.
**Where:** Protocolo de Worker Handoff.
**Learned:** El `worker-handoff.md` (y el template de la CLI) debería incluir en su parte superior o inferior un bloque para el humano: `[HUMANO] Para ejecutar este worker, abrí un chat nuevo y pegá: @ruta/al/worker-handoff.md Ejecutá la Fase X`.

### [DISCOVERY][cli-testing-pure-functions] Testear CLI Commands: Extraer Funciones Puras vs. Mockear el Framework
**What:** Al intentar testear comandos de `commander` (CLI Node.js), la estrategia de mockear el módulo `commander` directamente falla. El Worker necesitó 2-3 intentos antes de encontrar el patrón correcto.
**Why:** `commander` y `process.exit()` están acoplados internamente. Mockear el módulo completo rompe la inicialización y genera errores de "cannot read property of undefined" o "process.exit is not a function" en el contexto del test runner.
**Where:** `funky-cli/src/commands/init.js` y `phase.js` — v1.6.
**Learned:** El patrón correcto para testear comandos CLI es **Extracción de Función Pura**: mover toda la lógica de negocio a una función (`runInit(opts)`, `runPhase(opts)`) que recibe sus dependencias como parámetros. El handler de `commander` solo actúa de "entry point" que llama a esa función. Los tests unitarios prueban la función pura directamente, mockeando solo `fs`, `path`, y `console`. Nunca `commander` ni `process`.

### [DISCOVERY][tty-headless-e2e-limitation] Agentes Headless no pueden ejecutar CLIs Interactivos vía TTY
**What:** Un agente de AI ejecutando comandos en una terminal headless (sin TTY real) no puede enviar keystrokes a CLIs interactivos basados en prompts (`@clack/prompts`, `inquirer`, etc.). El proceso arranca y se renderiza, pero queda colgado esperando input que nunca llega.
**Why:** Los agentes usan shells no-interactivos. Las librerías de prompts detectan la ausencia de TTY y pueden comportarse diferente o directamente bloquear el proceso.
**Where:** Fase 4 de v1.7. Afecta cualquier feature que agregue prompts interactivos al CLI.
**Learned:** La cobertura E2E de flujos interactivos se delega a Integration Tests que ejecutan `runInit()` directamente (función pura) en disco real, bypasseando la capa de UI del CLI. El test E2E manual lo hace el humano. Documentar este límite explícitamente en los criterios de éxito del `worker-handoff.md` para flujos interactivos.

### [DISCOVERY][worker-return-envelope-compliance] Workers omiten la sección de Bugs en el Return Envelope
**What:** El Worker de la Fase 2 (v1.6) entregó un reporte en formato libre, omitiendo la sección `Bugs encontrados` del Return Envelope canónico definido en `tasks.md`. Los fallos iniciales (2-3 intentos) no quedaron documentados hasta que el Orquestador lo detectó.
**Why:** El Worker priorizó reportar los éxitos y omitió los fallos intermedios. El schema del Return Envelope no tenía una instrucción explícita de "documentar TODOS los intentos fallidos, no solo el resultado final".
**Where:** Protocolo Return Envelope en `funky-cli/src/templates/sdd/tasks.md`.
**Learned:** El template de Return Envelope debe aclarar explícitamente: "Bugs encontrados incluye intentos fallidos y los anti-patrones descartados, no solo bugs en producción". El Orquestador debe validar el schema del report antes de aprobar la siguiente fase.
