# 07 - Delegación Tier 3 (Workflows Profundos y NFRs)

En **Tier 3**, la complejidad es alta, por lo que **cada fase se aísla** en su propio workflow (agentes especializados). A diferencia del Tier 2, aquí NO redactas prompts inline ni usas "Chalanes Crikosos" básicos; delegas o instruyes al humano a usar los workflows nativos (`/funky-propose`, `/funky-spec`, `/funky-design`, `/funky-verify`).

## 1. Delegación de Fases (Handoff o CLI Nativo)

Para cada fase de Tier 3, el Orquestador debe preparar el handoff para el humano (o invocar directamente si el entorno lo permite).

- **Propose (`/funky-propose`)**: Workflow completo. Produce el `proposal.md` desde cero. 
- **Spec (`/funky-spec`)**: Workflow completo. Genera requirements detallados (happy paths + edge cases + error states).
- **Design (`/funky-design`)**: **Exclusivo de Tier 3.** Obligatorio. Documenta arquitectura, decisiones técnicas y testing strategy en `design.md`. NO SE PUEDE SALTAR, salvo excepción explícita validada por el humano.
- **Verify (`/funky-verify`)**: Exhaustivo. Valida Build, Tests, Spec Compliance Matrix, Design Coherence y **NFR Tracing**.

## 2. Control y Cascada de NFRs (Non-Functional Requirements)

Los NFRs (latencia, seguridad, migraciones) son **exclusivos de Tier 3**. Tienen el siguiente ciclo de vida, donde tú (Orquestador) eres responsable del paso de **Cascada**:

1. **Discovery & Formalización**: El `explore` detecta riesgos y el `proposal` los formaliza.
2. **Bloqueo**: El `spec` los bloquea con métricas duras (ej. P95 < 200ms).
3. **Cascada Downstream (TU RESPONSABILIDAD)**: 
   - Debes leer el `spec.md` al finalizar la fase Spec.
   - Si existen NFRs bloqueados, **DEBES inyectarlos textualmente como contexto obligatorio en el prompt / bloque de handoff** para las siguientes fases (`design`, `tasks`, `apply`).
   - *Ejemplo de inyección:* "⚠️ NFR Obligatorio a considerar: P95 < 200ms. Asegúrate de diseñar y ejecutar respetando esta métrica."
4. **Verificación**: En la fase de `tasks`, los NFRs se taguean (ej. `nfr:latency`). Al final, `funky-verify` valida que los umbrales se cumplieron.

## 3. Manejo de Veredictos del Verify Completo

El Return Envelope del `/funky-verify` en Tier 3 incluye matrices de cumplimiento. Tu rol al presentarlo es el mismo que en Tier 2 (ver `06-presentacion-interactiva.md`), prestando especial atención a:
- **Spec Compliance Matrix**: Si hay escenarios ⚠️ UNTESTED o ❌ FAILED, la acción sugerida es re-aplicar.
- **Design Coherence**: Si hay desviaciones no autorizadas, sugerir re-aplicar para alinearse al diseño.
- **NFR Tracing**: Si un umbral NFR (ej. `nfr:security`) falla, el veredicto debe ser tratado como CRITICAL.
