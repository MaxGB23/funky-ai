# 🗣️ Guía de Discusión Arquitectónica

> Generado por `funky assess`. Agenda declarativa de la sesión: referencia los archivos del proyecto, no los incrusta.

## Cómo usar esta guía

1. Copia el contenido de `assess-prompt.md` (ubicado junto a esta guía) y pégalo como primer mensaje de tu sesión con la IA.
2. El agente lee los archivos referenciados abajo, en el orden que marca el prompt.
3. Anota cada decisión aprobada en `architecture-decisions.md` durante la discusión.

## Archivos de referencia

- `docs/funky-ai/canvas/brief-funcional.md` — contexto de **negocio** (obligatorio, léelo primero): qué se construye, para quién, casos de uso, KPIs y escala esperada.
- `docs/funky-ai/canvas/PROJECT-CANVAS.md` — decisiones de la **aplicación**: framework, patrón arquitectónico, gestión de estado, UI y testing.
- `docs/funky-ai/canvas/INFRA-CANVAS.md` — decisiones **operativas**: base de datos, autenticación, calidad de código y despliegue.
- `docs/funky-ai/assess/risk-patterns.md` — patrones de riesgo de **referencia**: pueden no aplicar a este proyecto.

## Fases de la Discusión

- **Fase 1 — Contexto y NFRs**: confirmar stack elegido y NFRs. Evalúa cada NFR explícitamente (derivan del brief: casos de uso, volumen y KPIs): si aplica, se acuerda cómo se cumple; si no aplica, se declara el porqué. Los patrones de referencia son condicionales, se aplican solo si el contexto los amerita.
- **Fase 2 — Preocupaciones del equipo**: ¿Qué les preocupa de la arquitectura actual? ¿Dónde ven riesgos? ¿Hay algo que no esté claro?
- **Fase 3 — Preguntas guía**: candidatos a plantear uno a la vez, cuando apliquen al proyecto concreto:
  - **Budget e Infraestructura**: ¿El presupuesto mensual alcanza para la infraestructura elegida? Considera costos de hosting, servicios y herramientas.
  - **Concurrencia y Base de Datos**: ¿La base de datos soporta la concurrencia esperada? Revisa límites de conexiones y estrategias de escalado.
  - **SLA y Redundancia**: ¿La arquitectura elegida puede cumplir el SLA requerido? Un solo nodo implica downtime en deploys y fallos de hardware.
- **Fase 4 — Riesgos con validación cruzada**: la IA analiza el stack completo y choca cada decisión técnica contra el brief para detectar incompatibilidades, sobreingeniería o un stack corto frente a las expectativas del producto.
- **Fase 5 — Alternativas**: para cada riesgo identificado, al menos una alternativa con pros/cons concretos.
- **Fase 6 — Acuerdos**: documentar las decisiones finales en `docs/funky-ai/assess/architecture-decisions.md`. Las decisiones aprobadas se anotan punto por punto durante la discusión.
