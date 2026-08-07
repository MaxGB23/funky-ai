# Guía de flags de `funky estimate` — Índice seccional

> ⚠️ Archivo TEMPORAL de referencia. Los flags de tópicos no contienen preguntas:
> son notas de "Impacto en costos". La única sección con preguntas reales es `--brief`.
> Fuente: `funky-cli/src/templates/estimate/`.

## Índice de flags

| Flag | Sección en la guía | Tipo de contenido | Contenido |
|---|---|---|---|
| *(sin flag — R9 always-on)* | `## Alcance: ¿Aplica en esta fase?` | Tabla de estado | 6 tópicos × estado (Aplica / No aplica / Indeterminado) + nota de evidencia |
| `--brief [path]` | `## Brief Funcional` | **12 preguntas en 6 grupos** | Ver detalle abajo |
| `--roles` | `## Roles del equipo` | 3 bullets de costo | composición del equipo (rol+seniority) domina el presupuesto · seniority alto = menos horas pero tarifa mayor · dedicación (full/part-time) × duración |
| `--multi-tenant` | `## Multi-tenant` | 3 bullets de costo | aislamiento por tenant agrega complejidad de datos/permisos/migraciones · más testing y QA · infra compartida baja costo unitario pero sube riesgo de regresión |
| `--transactions` | `## Transacciones` | 3 bullets de costo | pagos/saldos exigen ACID, auditoría y seguridad · proveedores de pago (stripe, wallets) suman costos transaccionales · ledger y conciliación requieren expertise dedicado |
| `--security` | `## Seguridad` | 3 bullets de costo | auth/secretos suman esfuerzo de diseño y mantenimiento · cumplimiento (GDPR) y rate limiting → auditorías · hardening y revisión de vulnerabilidades = costo recurrente |
| `--concurrency` | `## Concurrencia` | 3 bullets de costo | colas/workers/Redis agregan complejidad de infra · race conditions y backpressure exigen testing y observabilidad · la escala define simple vs distribuido |
| `--integrations` | `## Integraciones` | 3 bullets de costo | cada integración externa (webhooks, APIs de terceros) suma desarrollo/testing/mantenimiento · dependencias críticas (CRM, ERP, pagos) condicionan timeline · versionado de APIs y compatibilidad agregan esfuerzo |
| `--pricing-team` | `## Referencia de Costos de Equipo` | Tabla + fórmulas | fórmula `rol × seniority × dedicación × duración` · modelo 1 dev · modelo equipo (1 PM + 2 devs + 1 QA + 1 diseñador) · fases con esfuerzo de referencia (descubrimiento 1-2 sem, MVP 4-8 sem, estabilización 2-4 sem, mantenimiento mensual) |

## Detalle de `--brief` (las únicas 12 preguntas)

| Grupo | Preguntas |
|---|---|
| **Producto** | ¿Qué problema resuelve el producto? · ¿Cuál es la funcionalidad principal que justifica su existencia? |
| **Usuarios** | ¿Quiénes son los usuarios finales? · ¿Cuántos usuarios se esperan en el lanzamiento? |
| **MVP** | ¿Qué funcionalidades son imprescindibles para el MVP? · ¿Qué queda explícitamente fuera de alcance en esta fase? |
| **Complejidad** | ¿Qué partes del sistema son las más complejas técnicamente? · ¿Hay decisiones pendientes o deuda técnica que afecten el costo? |
| **Integraciones** | ¿Con qué sistemas externos se integra (pagos, CRM, ERP, webhooks)? · ¿Cuáles son las dependencias críticas del proyecto? |
| **Timeline** | ¿Cuál es la fecha objetivo de lanzamiento? · ¿Hay hitos intermedios (alpha, beta, GA)? |

## Notas útiles

- **Auto-detección**: sin `--brief`, si existe `docs/funky-ai/canvas/brief-funcional.md` (de `funky init`) se usa automáticamente; `--brief` sin valor fuerza el checklist de preguntas.
- **Ficha de alcance**: no es flag, está siempre — pero usa las mismas señales que las sugerencias de consola (el ruido de `equipo`/`workspace`/`integraci` también la ensucia a ella).
- **`--pricing-team` es solo referencia**, no calculadora: dimensiona rangos, no presupuestos.
