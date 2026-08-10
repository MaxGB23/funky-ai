# 🔨 funky-forge — Project Planning Tools

**funky-forge** son las tools de planeación de proyecto asistida con IA. Convierten una idea difusa en un plan estructurado: stack, arquitectura, costos.

Esto NO es el framework agéntico — las tools del framework (`sdd install`, `feature`, `engram add`) están en `docs/funky-ai/`.

---

## Comandos forge

| Comando | Propósito | Docs |
|---------|-----------|------|
| `funky init` | Crea PROJECT-CANVAS.md e INFRA-CANVAS.md | [init.md](init.md) |
| `funky assess` | Guía de revisión de arquitectura con preguntas dinámicas | [assess.md](assess.md) |
| `funky estimate` | Estimación de costos de infraestructura y servicios | [estimate.md](estimate.md) |
| `funky pipeline` | Orquesta assess + estimate con estado compartido | [pipeline.md](pipeline.md) |

## Resumen rápido

```
[Idea] → funky init → llenar canvases → funky sdd install* → funky assess → funky estimate
                                           ↓
                                    [funky pipeline (opcional)]
```

> **\*** `funky sdd install` es del framework funky-ai — instala reglas agénticas y templates SDD.

## Referencia

| Doc | Qué contiene |
|-----|-------------|
| [command-flow.md](command-flow.md) | Tabla resumen: cuándo usar cada comando |
| [init.md](init.md) | Init en detalle: flujo, outputs, preguntas guía |
| [assess.md](assess.md) | Assess: inputs, architecture review, preguntas dinámicas |
| [estimate.md](estimate.md) | Estimate: pricing guide, decisiones, prompt IA |
| [pipeline.md](pipeline.md) | Pipeline: cuándo usarlo, context.json, anti-patrones |

## Archivos migrados

Estos archivos se movieron desde `docs/funky-ai/` como parte de la consolidación:

- [cli-simulations.md](cli-simulations.md) — Simulaciones de uso del CLI
- [escenarios-de-uso.md](escenarios-de-uso.md) — Escenarios de uso del flujo completo
- [funky-init-flow.md](funky-init-flow.md) — Flujo detallado de init

---

> **Nota:** Los comandos se llaman `funky init`, `funky assess`, etc. — no cambian. Solo la documentación está organizada bajo `funky-forge/` para distinguir tools de planeación del framework agéntico.
