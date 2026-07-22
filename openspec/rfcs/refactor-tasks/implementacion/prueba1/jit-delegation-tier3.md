# Guardrails Tier 3 (Deep Workflows)

En **Tier 3**, la complejidad es alta, por lo que **cada fase se aísla** en su propio workflow (agentes especializados). Aquí NO redactas prompts inline ni usas "Chalanes Crikosos" básicos; instruyes al humano a usar los workflows nativos.

## 1. Delegación de Fases (Handoff o CLI Nativo)
- **Explore (`/funky-explore`)**: Pide al humano que cierre el chat e inicie `/funky-explore` pasándole el path del feature y un "Objetivo Especial".
- **Propose (`/funky-propose`)**: Produce el `proposal.md` desde cero. **PROHIBIDO** sobrescribir desde cero en T1/T2, pero aquí sí.
- **Spec (`/funky-spec`)**: Genera requirements detallados (happy paths + edge cases + error states).
- **Design (`/funky-design`)**: **Exclusivo de Tier 3.** Obligatorio. Documenta arquitectura, decisiones técnicas y testing strategy en `design.md`. NO SE PUEDE SALTAR.
- **Tasks (`/funky-tasks`)**: Generación adaptativa de batching.
- **Apply (`/funky-apply`)**: Ejecución secuencial por fase.
- **Verify (`/funky-verify`)**: Exhaustivo. Valida Build, Tests, Spec Compliance Matrix, Design Coherence y NFR Tracing.

## 3. Control y Cascada de NFRs (Non-Functional Requirements)
Los NFRs (latencia, seguridad, migraciones) son **exclusivos de Tier 3**. Tienen el siguiente ciclo de vida, donde tú (Orquestador) eres responsable de la **Cascada**:

1. **Discovery & Formalización**: El `explore` detecta riesgos y el `proposal` los formaliza.
2. **Bloqueo**: El `spec` los bloquea con métricas duras (ej. P95 < 200ms).
3. **Cascada Downstream (TU RESPONSABILIDAD)**: 
   - Debes leer el `spec.md` al finalizar la fase Spec.
   - Si existen NFRs bloqueados, **DEBES inyectarlos textualmente como contexto obligatorio en el prompt / bloque de handoff** para las siguientes fases (`design`, `tasks`, `apply`).
   - *Ejemplo de inyección:* "⚠️ NFR Obligatorio a considerar: P95 < 200ms. Asegúrate de diseñar y ejecutar respetando esta métrica."
4. **Verificación**: En la fase de `tasks`, los NFRs se taguean. Al final, `funky-verify` valida que los umbrales se cumplieron.

## 4. Manejo de Veredictos del Verify Completo

El Return Envelope del `/funky-verify` en Tier 3 incluye matrices de cumplimiento.
- **Spec Compliance Matrix**: Si hay escenarios ⚠️ UNTESTED o ❌ FAILED, la acción sugerida es re-aplicar.
- **Design Coherence**: Si hay desviaciones no autorizadas, sugerir re-aplicar para alinearse al diseño.
- **NFR Tracing**: Si un umbral NFR (ej. `nfr:security`) falla, el veredicto debe ser tratado como CRITICAL.
