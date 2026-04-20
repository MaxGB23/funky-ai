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
