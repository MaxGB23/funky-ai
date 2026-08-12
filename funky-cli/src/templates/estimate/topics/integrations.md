## Integraciones

Impacto en costos:
- Cada integración externa (webhooks, APIs de terceros) suma desarrollo, testing y mantenimiento.
- Las dependencias críticas (CRM, ERP, pagos) condicionan el timeline y el riesgo.
- El versionado de APIs externas y la compatibilidad hacia atrás agregan esfuerzo.

Señales de severidad:
- **Leve (+10%):** 1-2 integraciones de solo lectura (webhooks entrantes), APIs estables y bien documentadas, no críticas para el flujo principal.
- **Alto (+30%):** ≥3 integraciones, alguna bidireccional en tiempo real, integración crítica de negocio (ERP, CRM, pagos) o APIs externas inestables o con versiones frecuentes.

> **Instrucción para cotizar:** Antes de proponer el buffer, pregunta al humano:
> 1. ¿Cuántas integraciones tiene el MVP? ¿Son de lectura (webhooks entrantes) o bidireccionales?
> 2. ¿Alguna es crítica para el flujo principal (pago, ERP, CRM)?
> 3. ¿Las APIs externas tienen versiones estables o cambian frecuentemente?
> Con esas respuestas, posiciónate en el rango +10% a +30% y justifica la posición.
