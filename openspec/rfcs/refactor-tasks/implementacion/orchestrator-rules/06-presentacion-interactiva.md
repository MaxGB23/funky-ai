# 06 - Presentación e Interacción Humana (Modo Interactivo)

> **Regla de Oro:** El Orquestador NO inventa resúmenes. Los subagentes nativos devuelven un *Return Envelope* con datos estructurados. Tu chamba como Orquestador es formatear esa data en la terminal usando los templates predefinidos y **pedir confirmación explícita** al humano.

## 1. Templates de Presentación por Fase
Para cada fase del SDD, el Orquestador debe imprimir la salida según las plantillas definidas en los RFCs de `funky-interactive/`. 
- No leas el archivo entero al humano.
- Usa emojis y viñetas para que se pueda escanear en 10 segundos.
- Siempre termina con la pregunta de confirmación: *"¿Aprobamos, o tienes observaciones para despertar al agente?"*

*(Consulta los docs `funky-interactive/01` al `10` para ver la plantilla exacta de cada fase en la sección "Lo que presenta el orquestador".)*

## 2. Review Workload Guard (Pre-Apply)
Al finalizar la fase de Tasks (`07-tasks`), el subagente emitirá un forecast de líneas de código (Review Workload).
- **Si el forecast excede 400 líneas o 5+ archivos**, DEBES detenerte y aplicar **Batching Proactivo**.
- **Acción:** Presenta el warning al humano y pregunta:
  > *"El forecast es de ~X líneas. ¿Dividimos en batches o lo dejamos en uno solo?"*

## 3. Checkpoint Pre-Apply (Obligatorio)
Incluso en modo Auto, SIEMPRE hay un checkpoint antes de arrancar el Worker o funky-apply (`08-apply`). Presenta el plan de batches y deja que el humano decida el canal:
```markdown
⚡ Plan de implementación listo — "[feature-name]"

**Batch 1**: Phase 1 (...) — ~X líneas
**Batch 2**: Phase 2-3 (...) — ~Y líneas

¿Dónde lo corremos?
- **CLI**: lo delego directo al worker(tier 1,2)/funky-apply acá mismo
- **IDE**: te preparo el bloque copy-paste para ver difs
```

## 4. Veredictos de Verify
Al finalizar la fase de Verify (`09-verify`), el subagente escupirá un Veredicto. Tú (Orquestador) debes interpretarlo y actuar:

| Veredicto | Lo que presenta el Orquestador | Tu Acción Sugerida al Humano |
|-----------|--------------------------------|-----------------------------|
| **PASS** | `✅ Verify complete. Verdict: PASS` | "Archivamos directo." |
| **CRITICAL / FUNC WARN** | `❌ / ⚠️ Verdict: [TIPO]. Issues: [lista]` | "Hay que re-aplicar. Delega a `/funky-apply` con los issues como tareas." |
| **COSMETIC WARN** | `🎯 Verdict: PASS WITH COSMETIC WARNINGS` | "Son menos de 5 líneas, los arreglo inline ahora sin delegar." |
| **SUGGESTION** | `✅ Verdict: PASS + Suggestion` | "Anoto en archive, no requiere acción inmediata." |
| **FAIL** | `❌ Verdict: FAIL. Issues: [lista]` | "Frenamos. Explica qué hay que re-aplicar." |
