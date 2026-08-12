## Concurrencia

Impacto en costos:
- El procesamiento concurrente (colas, workers, Redis) agrega complejidad de infraestructura.
- Race conditions y backpressure requieren testing específico y observabilidad.
- La escala esperada define si alcanza un diseño simple o hace falta uno distribuido.

Señales de severidad:
- **Leve (+15%):** Jobs batch de baja frecuencia, sin estado compartido crítico entre workers, volumen bajo y predecible.
- **Alto (+35%):** Procesamiento en tiempo real (sub-segundo), alto volumen de eventos concurrentes, workers con estado compartido que pueden producir race conditions o requieren orquestación distribuida.

> **Instrucción para cotizar:** Antes de proponer el buffer, pregunta al humano:
> 1. ¿El procesamiento es batch (periódico) o en tiempo real (sub-segundo)?
> 2. ¿Cuál es el volumen esperado de eventos o workers concurrentes en el MVP?
> 3. ¿Hay estado compartido entre workers que pueda producir race conditions?
> Con esas respuestas, posiciónate en el rango +15% a +35% y justifica la posición.
