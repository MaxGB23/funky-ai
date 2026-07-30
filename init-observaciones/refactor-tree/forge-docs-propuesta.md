# Propuesta — Separación de docs funky-forge vs funky-ai

> Estado: propuesta
> Fecha: 2026-07-30

---

## Problema

Hoy los docs de planeación de proyecto (init, assess, estimate, pipeline) están mezclados con los docs del framework agéntico (conceptos, reglas, SDD) bajo `docs/funky-ai/`. Esto dificulta entender qué pertenece a qué dominio.

## Solución

Separar físicamente en dos árboles de documentación:

```
docs/
├── funky-ai/          ← Framework: ecosistema agéntico
│   ├── conceptos/
│   ├── guias/         ← funky-ai.md, team-guide, sdd-survival-guide, testing-local-vs-ci
│   ├── historico/     ← releases, retrospectivas
│   └── operaciones/   ← qa-governance.md (único que se queda)
│
└── funky-forge/       ← Planning: tools de planeación de proyecto
    ├── command-flow.md         ← NUEVO — fuente de verdad consolidada
    ├── comando-vs-archivos.md  ← MOVER desde funky-ai/guias/
    ├── cli-simulations.md      ← MOVER desde funky-ai/operaciones/
    ├── escenarios-de-uso.md    ← MOVER desde funky-ai/operaciones/
    ├── funky-init-flow.md      ← MOVER desde funky-ai/operaciones/
    └── guia-flujo-completo.md  ← MOVER desde funky-ai/operaciones/
```

## Árbol físico propuesto

```
docs/funky-forge/
├── command-flow.md              ← SRC DE VERDAD de comandos
├── escenarios-de-uso.md         ← movido
├── funky-init-flow.md           ← movido
├── guia-flujo-completo.md       ← movido
├── cli-simulations.md           ← movido
└── comando-vs-archivos.md       ← movido
```

**NO se mueven:**
- `docs/funky-ai/conceptos/` — framework
- `docs/funky-ai/guias/funky-ai.md` — framework
- `docs/funky-ai/guias/funky-ai-team-guide.md` — framework
- `docs/funky-ai/guias/sdd-survival-guide.md` — framework
- `docs/funky-ai/guias/testing-local-vs-ci.md` — framework
- `docs/funky-ai/historico/` — framework
- `docs/funky-ai/operaciones/qa-governance.md` — framework
- `docs/funky-ai/drafts/` — framework
- `docs/funky-ai/journey/` — framework
- `docs/funky-ai/releases/` — framework

## Nuevo: `command-flow.md`

Documento fuente que reemplaza el viejo `diagrama-comandos.md` de `init-observaciones/roadmap/`. Contiene:

### 1. Visión general — dominio de cada comando

| Comando | Dominio | Propósito |
|---------|---------|-----------|
| `funky scaffold` | funky-ai | Inyecta rules, templates, ORCHESTRATOR-STATE |
| `funky init` | forge | Crea PROJECT-CANVAS.md e INFRA-CANVAS.md |
| `funky assess` | forge | Guía de revisión de arquitectura |
| `funky estimate` | forge | Estimación de costos |
| `funky feature` | forge | Scaffolding de features SDD |
| `funky pipeline` | forge | Orquesta assess + estimate |
| `funky engram add` | forge | Captura knowledge base |

### 2. Árbol por comando (inputs → outputs)

Cada comando con árbol exacto de qué archivos lee y escribe, como en el `diagrama-comandos.md` pero actualizado contra el código real.

### 3. Tablas de directorios

- `src/templates/` → qué comando usa cada directorio
- Outputs → dónde escribe cada comando

### 4. Data de `init-observaciones/refactor-tree/`

Los docs de refactor (`punto-4-implementado.md`, `punto-4-context-json-implementado.md`, `checklist-pendientes.md`) **se quedan** en `init-observaciones/` como registro histórico. El `command-flow.md` será la verdad actual y viva.

## Migración

1. ✅ Crear `docs/funky-forge/`
2. ✅ Escribir `docs/funky-forge/command-flow.md`
3. ✅ Mover los 5 archivos de `docs/funky-ai/` → `docs/funky-forge/`
4. ✅ Actualizar referencias cruzadas entre los docs movidos
5. Actualizar `init-observaciones/roadmap/diagrama-comandos.md` con un banner: "DEPRECATED — ver docs/funky-forge/command-flow.md"
6. Commit

Nota: el CLI y el código no cambian — `funky init` sigue siendo `funky init`. Solo es organización de documentación.
