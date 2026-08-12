# Propuesta de Refactor: Topics de Flags (`pricing-guide.md`)

> **Propósito:** Este documento define el contenido revisado de cada bloque topic inyectable por el CLI en `pricing-guide.md`. Incluye los bullets de impacto en costos existentes, las señales de severidad que faltaban, y la instrucción activa para que el LLM calibre el buffer dentro del rango correcto sin inventarlo.
>
> **Relación con el checklist:** Cubre los ítems de refactor de la Fase Estimate (checklist L41-L49): instrucción activa por topic + rangos de buffer diferenciados.
>
> **Archivo fuente de templates:** `src/templates/estimate/topics/`

---

## Criterio de diseño

Cada topic necesita tres capas para que el LLM funcione correctamente:

1. **Impacto en costos** (existente) — contexto genérico de por qué esta flag agrega costo.
2. **Señales de severidad** (nuevo) — qué indica que el riesgo es leve vs. alto en este proyecto.
3. **Instrucción activa** (nuevo) — guion de preguntas concretas para que el LLM calibre el buffer durante la discusión socrática, sin inventar el número ni poner el centro del rango por default.

---

## `--roles` — Sin buffer (calculadora de costo base)

> Esta flag no es un multiplicador de riesgo: es el insumo para calcular el Costo Base. No lleva buffer de contingencia; su función es reemplazar las tarifas genéricas de la guía por los rangos reales del equipo.

```md
<!-- topic:roles -->
## Roles del equipo

Impacto en costos:
- La composición del equipo (roles y seniority) suele ser el factor dominante del presupuesto.
- Seniority alto reduce horas de desarrollo pero incrementa la tarifa por hora.
- La dedicación (full-time vs part-time) y la duración definen el costo acumulado por rol.

> **Instrucción para cotizar:** Esta flag alimenta el Costo Base, no un buffer de riesgo.
> Pregunta al humano: ¿Cuántos roles intervienen, con qué seniority y qué % de dedicación
> durante cuántos meses? Con esas respuestas aplica la fórmula de la sección de equipo.
> Si no hay datos suficientes, usa las tarifas base de la guía como referencia.
<!-- /topic:roles -->
```

---

## `--security` — Buffer: +10% a +25%

```md
<!-- topic:security -->
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
<!-- /topic:security -->
```

---

## `--integrations` — Buffer: +10% a +30%

```md
<!-- topic:integrations -->
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
<!-- /topic:integrations -->
```

---

## `--multi-tenant` — Buffer: +15% a +30%

```md
<!-- topic:multi-tenant -->
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
<!-- /topic:multi-tenant -->
```

---

## `--concurrency` — Buffer: +15% a +35%

```md
<!-- topic:concurrency -->
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
<!-- /topic:concurrency -->
```

---

## `--transactions` — Buffer: +20% a +40%

```md
<!-- topic:transactions -->
## Transacciones

Impacto en costos:
- Procesar pagos o mantener saldos exige consistencia (ACID), auditoría y seguridad.
- La integración con proveedores de pago (Stripe, wallets) suma costos transaccionales y de desarrollo.
- El manejo de ledger y conciliación requiere expertise dedicado.

Señales de severidad:
- **Leve (+20%):** Integración estándar con proveedor de pago existente (Stripe, Conekta), flujo simple de cobro sin lógica propia, sin auditoría formal.
- **Alto (+40%):** Ledger propio, conciliación multi-parte, auditoría regulatoria formal, flujos multi-moneda o transacciones entre usuarios.

> **Instrucción para cotizar:** Antes de proponer el buffer, pregunta al humano:
> 1. ¿Es integración con un proveedor existente (Stripe, Conekta) o se construye
>    lógica transaccional propia (ledger, saldos, conciliación)?
> 2. ¿Se requiere auditoría regulatoria de cada transacción?
> 3. ¿Hay flujos multi-moneda o multi-parte (pagos entre usuarios)?
> Con esas respuestas, posiciónate en el rango +20% a +40% y justifica la posición.
<!-- /topic:transactions -->
```

---

## `--pricing-team` — Sin buffer (referencia de tarifas reales)

> Esta flag no cambia: su estructura actual es correcta y completa. Reemplaza las tarifas base genéricas de la guía por los rangos reales del equipo. No es un multiplicador de riesgo.

*(Sin cambios al template existente.)*

---

## Nota sobre interacciones multiplicativas (pendiente de decisión)

Cuando se activan ≥2 flags del grupo de alto riesgo (`--transactions`, `--multi-tenant`, `--concurrency`), los buffers individuales subestiman la complejidad real porque la combinación es multiplicativa (ej. aislamiento ACID por tenant + observabilidad distribuida + workers concurrentes por tenant). Se propone añadir en `pricing-guide.md` §5 (Buffers de Contingencia) una regla explícita de escalón adicional para estas combinaciones.

> **Decisión pendiente:** ¿Se incluye esta regla en el refactor actual o se deja para una siguiente iteración?
