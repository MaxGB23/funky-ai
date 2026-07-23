# Presentación e Interacción (Handoff)

> **Regla de Oro:** El Orquestador NO inventa resúmenes. Tu chamba es formatear la data de los subagentes en la terminal usando los templates predefinidos y **pedir confirmación explícita** al humano.

## 1. Templates de Presentación por Fase
Para cada fase del SDD, imprime la salida según las plantillas definidas en los RFCs de `funky-interactive/`. 
- No leas el archivo entero al humano.
- Usa emojis y viñetas para escaneo rápido.
- Termina con: *"¿Aprobamos, o tienes observaciones para despertar al agente?"*

## 2. Review Workload Guard (Pre-Apply)
Al finalizar la fase de Tasks, el subagente emitirá un forecast de líneas de código.
- **Si el forecast excede 400 líneas o 5+ archivos**, DEBES detenerte y aplicar **Batching Proactivo**.
- **Acción:** Presenta el warning al humano y pregunta:
  > *"El forecast es de ~X líneas. ¿Dividimos en batches o lo dejamos en uno solo?"*

## 3. Checkpoint Pre-Apply (Obligatorio)
Incluso en modo Auto, SIEMPRE hay un checkpoint antes de arrancar el Worker o funky-apply. Presenta el plan de batches:
```markdown
⚡ Plan de implementación listo — "[feature-name]"

**Batch 1**: Phase 1 (...) — ~X líneas
**Batch 2**: Phase 2-3 (...) — ~Y líneas

¿Dónde lo corremos?
- **CLI**: lo delego directo al worker/funky-apply
- **IDE**: te preparo el bloque copy-paste para ver difs
```

## 4. Veredictos de Verify
Al finalizar la fase de Verify (`09-verify`), debes interpretar el Veredicto y actuar:

| Veredicto | Lo que presenta el Orquestador | Tu Acción Sugerida al Humano |
|-----------|--------------------------------|-----------------------------|
| **PASS** | `✅ Verify complete. Verdict: PASS` | "Archivamos directo." |
| **CRITICAL / FUNC WARN** | `❌ / ⚠️ Verdict: [TIPO]. Issues: [lista]` | "Hay que re-aplicar. Delega a `/funky-apply` con los issues como tareas." |
| **COSMETIC WARN** | `🎯 Verdict: PASS WITH COSMETIC WARNINGS` | "Son menos de 5 líneas, los arreglo inline ahora sin delegar." |
| **SUGGESTION** | `✅ Verdict: PASS + Suggestion` | "Anoto en archive, no requiere acción inmediata." |
| **FAIL** | `❌ Verdict: FAIL. Issues: [lista]` | "Frenamos. Explica qué hay que re-aplicar." |

## 5. Modo Handoff (Bloques Copy-Paste)
Cuando el IDE no soporta delegación nativa, el Orquestador CLI debe operar en **Modo Handoff**.
Cuando delegues una fase (ej. `/funky-worker`, `/funky-apply`), **TIENES LA OBLIGACIÓN** de generar un bloque listo para copy-paste.

**Estructura estricta del Handoff:**
1. Instrucción de aislamiento (chat nuevo).
2. Plantilla con el comando exacto.

**Ejemplo de salida:**
> "El plan está listo. Cierra este chat, abre uno nuevo y ejecuta:
> `/funky-[fase] [feature-name] [otros-parametros]`"

## 6. La Ley de Invarianza
> **Ley de Invarianza:** El prompt o comando que generas para el CLI y el que preparas para el IDE (bloque copy-paste) debe ser **IDÉNTICO**. Solo cambia el canal de entrega.

- **NUNCA** intentes inyectar el contexto de la conversación (historias, specs enteras, código) dentro del bloque de copy-paste. 
- Los workflows (`/funky-apply`, `/funky-spec`) ya tienen inteligencia para leer artefactos del disco. 
- Tu trabajo es únicamente pasar los **parámetros crudos** requeridos por el slash command.
