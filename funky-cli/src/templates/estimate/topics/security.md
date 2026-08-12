## Seguridad

Impacto en costos:
- Autenticación, autorización y gestión de secretos agregan esfuerzo de diseño y mantenimiento.
- Cumplimiento (GDPR, etc.) y rate limiting implican auditorías y monitoreo continuo.
- El hardening de infraestructura y la revisión de vulnerabilidades son costos recurrentes.

Señales de severidad:
- **Leve (+10%):** Auth básica (login/logout, JWT), sin regulación, sin datos críticos de terceros, uso interno.
- **Alto (+25%):** Cumplimiento regulatorio (GDPR, SOC2, HIPAA, PCI), datos PII sensibles, exposición pública o auditoría formal requerida.

> **Instrucción para cotizar:** Antes de proponer el buffer, pregunta al humano:
> 1. ¿Hay requisito de cumplimiento regulatorio (GDPR, SOC2, HIPAA, PCI)?
> 2. ¿El sistema expone datos sensibles de terceros o es de uso interno?
> 3. ¿Se necesita auditoría de acceso o revisión de vulnerabilidades formal?
> Con esas respuestas, posiciónate en el rango +10% a +25% y justifica la posición.
