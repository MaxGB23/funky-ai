# 🗣️ Guía de Discusión Arquitectónica

> Generado por `funky assess`. Usá este documento como estructura para tu sesión de discusión.

## Contexto del Proyecto

### PROJECT-CANVAS
{{PROJECT_CANVAS_CONTENT}}

### INFRA-CANVAS
{{INFRA_CANVAS_CONTENT}}

## Fases de la Discusión

### Fase 1: Contexto (5 min)
Confirmar stack elegido y NFRs. Leer los canvases embebidos arriba. La IA descubre los NFRs preguntando al equipo.

### Fase 2: Preocupaciones del Equipo (10 min)
¿Qué les preocupa de la arquitectura actual? ¿Dónde ven riesgos? ¿Hay algo que no esté claro?

### Fase 3: Preguntas Guía (15 min)
- **Budget e Infraestructura**: ¿El presupuesto mensual alcanza para la infraestructura elegida? Considerá costos de hosting, servicios y herramientas.
- **Concurrencia y Base de Datos**: ¿La base de datos soporta la concurrencia esperada? Revisá límites de conexiones y estrategias de escalado.
- **SLA y Redundancia**: ¿La arquitectura elegida puede cumplir el SLA requerido? Un solo nodo implica downtime en deploys y fallos de hardware.

{{DYNAMIC_QUESTIONS}}

### Fase 4: Riesgos Detectados (15 min)
La IA analiza el stack completo buscando incompatibilidades conocidas, trade-offs no documentados y riesgos operacionales.

### Fase 5: Alternativas (10 min)
Para cada riesgo identificado, proponé al menos una alternativa con pros/cons concretos.

### Fase 6: Acuerdos (5 min)
Documentar las decisiones finales en docs/architecture-decisions.md. Incluir rationale, alternativas descartadas y riesgos aceptados.
