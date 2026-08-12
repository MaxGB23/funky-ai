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
