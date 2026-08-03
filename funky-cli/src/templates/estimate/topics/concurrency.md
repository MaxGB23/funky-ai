## Concurrencia

Impacto en costos:
- El procesamiento concurrente (colas, workers, Redis) agrega complejidad de infraestructura.
- Race conditions y backpressure requieren testing específico y observabilidad.
- La escala esperada define si alcanza un diseño simple o hace falta uno distribuido.
