# Guía de Discusión de Pricing

> Generado por `funky estimate`. Guía declarativa de la sesión de pricing colaborativa.
> En esta guía los archivos del proyecto se REFERENCIAN en lugar de copiarse: la IA y el equipo los leen como material de análisis.

## Contexto del Proyecto

Lee los archivos del proyecto, en este orden:

1. `docs/funky-ai/canvas/brief-funcional.md` — contexto de **negocio**: qué se construye, para quién, casos de uso y escala esperada. Léelo PRIMERO y es OBLIGATORIO: los factores de costo dependen de entender la realidad del negocio.
2. `docs/funky-ai/canvas/PROJECT-CANVAS.md` — decisiones de la **aplicación**: framework, patrón arquitectónico, gestión de estado, UI y testing.
3. `docs/funky-ai/canvas/INFRA-CANVAS.md` — decisiones **operativas**: base de datos, autenticación, calidad de código y despliegue.
4. `docs/funky-ai/assess/architecture-decisions.md` — decisiones arquitectónicas aprobadas que afectan el costo.
5. `docs/funky-ai/estimate/pricing-decisions.md` — decisiones de pricing ya aprobadas y tabla de cotización del MVP. Solo se escribe cuando una decisión es aprobada.

Si falta alguno de los archivos referenciados, señálalo y PREGUNTA el contexto al humano. Jamás lo inventes.

<!-- topics -->
## Paso Inicial: Recomienda las Flags y sus Buffers

Tras analizar el contexto en silencio (Fase 1), la IA decide PRIMERO qué flags recomienda para este proyecto y por qué, usando la guía corta de abajo. Después de cada flag recomendada, propone su **buffer de contingencia**: un porcentaje entre +10% y +25% sobre el costo base, con justificación basada en el proyecto (nunca un número fijo). Las flags son defensa contra la sobreingeniería: si una no aplica, no se recomienda ni se cotiza.

**DETENTE por completo** después de proponer las flags y sus buffers: pide al humano que las inyecte con `funky estimate --flag`. NO inicies la discusión de pricing hasta que las haya inyectado y te dé luz verde (Fase 3).

### Guía corta de flags

| Flag | Cuándo conviene |
|------|-----------------|
| `--roles` | Si la composición del equipo (roles, seniority, dedicación) define el presupuesto o aún no está definida. |
| `--multi-tenant` | Si el producto aísla datos por cliente o tenant (datos, permisos, migraciones) o comparte infraestructura entre clientes. |
| `--transactions` | Si procesa pagos o mantiene saldos que exigen consistencia (ACID), auditoría y conciliación. |
| `--security` | Si hay autenticación, datos sensibles, cumplimiento (GDPR) o exposición pública. |
| `--concurrency` | Si hay colas, workers, procesamiento en background o picos de carga concurrente. |
| `--integrations` | Si se integra con sistemas externos (webhooks, APIs de terceros, CRM, ERP, pagos). |
| `--pricing-team` | Si se necesita dimensionar el equipo y usar sus rangos de costo REALES (reemplazan las tarifas base por rol de la sección 3; referencia, no calculadora). |

<!--
  Zona de incrustación de topics, gestionada por `funky estimate` (no editar a mano).
  Cada sección de flag vive envuelta en un par de marcadores HTML invisibles en
  markdown: un marcador de apertura y uno de cierre, ambos con el mismo nombre de
  topic (topic:transactions, topic:security, topic:roles, topic:multi-tenant,
  topic:integrations, topic:concurrency). El CLI detecta las secciones existentes
  por estos marcadores exactos, incrusta las secciones nuevas sin preguntar y
  reincrusta todas al refrescar la base. Los fragmentos fuente viven en
  src/templates/estimate/topics/. Formato esperado: marcador de apertura, contenido
  del fragmento, marcador de cierre. La zona solo contiene topics CON contenido:
  los no incrustados no dejan pares vacíos.
-->
<!-- /topics -->
## Estructura de Discusión

La discusión se hace punto por punto, un tema a la vez (ver Instrucciones). El modelo de pricing se decide PRIMERO, antes de cualquier factor de costo.

### 1. Modelo de Pricing (obligatorio, primero)

Decidir entre **Fixed-Price** y **Time & Materials** antes de estimar costos:

- **Fixed-Price**: alcance estable, bien definido y acotado; el riesgo de cambios lo asume el proveedor y se cubre con buffer.
- **Time & Materials**: alcance evolutivo, requisitos cambiantes o fases de descubrimiento; el costo sigue la dedicación real.
- Si hay dudas, proponer una combinación (fase de descubrimiento en T&M + desarrollo en Fixed-Price).

Registrar el modelo elegido y su justificación en `docs/funky-ai/estimate/pricing-decisions.md`.

### 2. Variables de Negocio

Pregunta y aplica estas cuatro variables durante la discusión:

1. **Contexto geográfico del cliente**: ¿dónde opera? Aplica un *modificador regional* de tarifa según el poder adquisitivo del mercado.
2. **Tamaño de empresa / bolsillo**: ¿Startup, Pyme o Corporativo? Ajusta el margen de ganancia y la percepción de valor (un precio muy bajo puede restar credibilidad en corporativos).
3. **Límite CapEx vs OpEx**: ¿el cliente especificó un límite para el costo del proyecto (CapEx) o para su gasto mensual de servidores (OpEx)? Si el límite mensual es estricto, la arquitectura se adapta a herramientas más baratas aunque el desarrollo tarde más.
4. **ROI / valor de negocio**: calcula cuánto dinero o tiempo ahorra la solución ANTES de cotizar. Este valor ancla el precio: si la solución ahorra más de lo que cuesta, la inversión se justifica sola.

### 3. Factores de Costo del MVP

- **Infraestructura**: hosting, servicios, herramientas.
- **Complejidad técnica**: stack, integraciones, deuda técnica.
- **Equipo**: seniority, tamaño, dedicación. Para el Costo Base usa las tarifas base por rol de la tabla de abajo (referencia, edición profesional). Si se incluyó la sección de `--pricing-team`, usa los rangos REALES del equipo de esa sección: reemplazan a las tarifas base, no se usan ambas.
- **Timeline**: urgencia, hitos, mantenimiento post-lanzamiento.

#### Tarifas base por rol (USD/hora, edición profesional)

| Rol | Tarifa base (USD/h) |
|-----|---------------------|
| Junior | 20–35 |
| Semi Senior / Mid | 35–55 |
| Senior | 55–85 |
| Lead / Arquitecto | 85–120 |

> Referencia por defecto: usa estas tarifas base para calcular el Costo Base cuando NO se incluyó la sección de `--pricing-team`. Si se incluyó, usa los rangos reales del equipo de esa sección en lugar de estas tarifas (no combines ambas).

Estimar el **Costo Base** del desarrollo del MVP (suma de los factores anteriores).

### 4. Costo Total de Operación (TCO) — rubro separado

Los **costos recurrentes operativos** son distintos del costo de desarrollo del MVP:

- Pólizas de soporte y mantenimiento.
- Monitoreo y observabilidad.
- Límites y planes de proveedores (Vercel, Neon, etc.).
- Herramientas y dependencias de pago.

Se estiman como **costo mensual (OpEx) aparte** y NO se suman al precio de venta del MVP. Se documentan como decisión propia.

### 5. Buffers de Contingencia

Por cada flag recomendada en el paso inicial, valida su buffer dentro del rango **+10% a +25%**, con justificación basada en el proyecto. El buffer acumulado se suma al Costo Base para cubrir el riesgo.

### 6. Tabla de Cotización Final

La sesión cierra llenando la tabla de cotización en `docs/funky-ai/estimate/pricing-decisions.md`:

> **Costo Base + Buffer de Riesgo + Margen de Ganancia = Precio de Venta del MVP**

El margen de ganancia se define según el tamaño de empresa (variable de negocio 2). El TCO recurrente mensual queda documentado aparte, sin sumarse al precio de venta.

## NFRs, Patrones y Referencias (condicionales)

Los NFRs (rendimiento, seguridad, disponibilidad, escala) y los patrones de referencia no siempre aplican: evalúalos explícitamente — si aplican, acuerda cómo se cumplen; si no aplican, declara el porqué. Nunca los omitas en silencio, pero tampoco los fuerces. La IA se adapta sin sobreingeniería, y las flags condicionales son la defensa contra ella.

## Instrucciones (anti-monólogo)

1. Discute **un punto a la vez**: presenta UN solo tema por turno. Está prohibido entregar la discusión completa en un solo bloque.
2. **Detente y espera** la respuesta del humano después de cada punto; no continúes hasta recibirla.
3. Guarda cada decisión aprobada **DE INMEDIATO** en `docs/funky-ai/estimate/pricing-decisions.md`, siguiendo su estructura. **NUNCA** anotes un punto que no haya sido aprobado.
4. No modifiques `brief-funcional.md`, los canvases, `architecture-decisions.md` ni esta guía sin aprobación explícita del humano.
5. Usa español neutro profesional.
