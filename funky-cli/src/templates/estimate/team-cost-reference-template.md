## Referencia de Costos de Equipo

> Sección de referencia (flag `--pricing-team`): NO calcula presupuestos. ENRIQUECE la guía: los rangos reales del equipo definidos acá reemplazan a las tarifas base por rol de la guía al calcular el Costo Base. Sin esta sección se usan las tarifas base de la guía; con esta sección se usan estos rangos reales (no se combinan).

### Rangos Reales del Equipo (Llenar antes de la sesión)

> ⚠️ **ATENCIÓN HUMANO:** Reemplaza estos valores de ejemplo con los costos o salarios mensuales reales de tu equipo ANTES de ejecutar el comando. El LLM usará estos números exactos.

| Rol | Seniority | Costo Mensual / Hora (USD) |
|----------|-----------|----------------------------|
| Frontend | Senior | $0.00 |
| Backend | Semi Senior | $0.00 |
| QA | Mid | $0.00 |
| PM | Senior | $0.00 |
| UX/UI | Mid | $0.00 |

### Fórmula de referencia

Costo por rol = rol × seniority × dedicación × duración

| Variable | Descripción |
|----------|-------------|
| Rol | Perfil del puesto (desarrollo, diseño, PM, QA) |
| Seniority | Junior, Semi Senior, Senior, Lead |
| Dedicación | % del tiempo asignado (full-time, part-time) |
| Duración | Cantidad de meses del proyecto o de la fase |

### Modelo 1 dev

- 1 desarrollador full-time durante toda la duración del proyecto.
- Cubre desarrollo, integraciones y mantenimiento básico.
- Adecuado para MVPs acotados o validaciones de mercado.

### Modelo equipo

- Referencia: 1 PM + 2 desarrolladores + 1 QA + 1 diseñador.
- Aplica cuando hay integraciones múltiples, dominios complejos (transacciones, multi-tenant, seguridad) o timeline ajustado.

### Fases

| Fase | Foco | Esfuerzo de referencia |
|------|------|------------------------|
| Descubrimiento | Brief, relevamiento, arquitectura | 1-2 semanas |
| MVP | Funcionalidad core | 4-8 semanas |
| Estabilización | QA, deuda técnica, performance | 2-4 semanas |
| Mantenimiento | Soportes, evolutivos, infra | Mensual |
