## Multi-tenant

Impacto en costos:
- El aislamiento por tenant agrega complejidad de datos, permisos y migraciones.
- Los modelos multi-tenant requieren más pruebas y control de calidad.
- La infraestructura compartida puede reducir costos unitarios pero aumenta el riesgo de regresión.

Señales de severidad:
- **Leve (+15%):** Schema compartido con RLS, pocos tenants en el MVP, sin customizaciones por tenant, migraciones unificadas.
- **Alto (+30%):** Schema-per-tenant o DB-per-tenant, permisos o configuraciones distintas por tenant, migraciones independientes por tenant o número alto de tenants desde el MVP.

> **Instrucción para cotizar:** Antes de proponer el buffer, pregunta al humano:
> 1. ¿Qué modelo de aislamiento se validó en assess: RLS en schema compartido,
>    schema-per-tenant o DB-per-tenant?
> 2. ¿Cuántos tenants se esperan en el MVP?
> 3. ¿Hay customizaciones por tenant (permisos distintos, configuración diferente)?
> Con esas respuestas, posiciónate en el rango +15% a +30% y justifica la posición.
