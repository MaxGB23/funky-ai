## Referencia de Costos de Equipo

> Sección de referencia: no calcula presupuestos. Úsala para dimensionar el equipo y estimar rangos durante la sesión de pricing.

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
