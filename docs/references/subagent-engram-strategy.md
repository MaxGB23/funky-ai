# Sub-agent Engram Strategy

> Contexto: funky-ai usa custom workflows con `/slash-comandos`. Cada comando abre un chat NUEVO y vacío. No hay un orquestador persistente que viva entre fases ni delegación automática. Cada sub-agente ES su propio entry point.

---

## El problema

En Gentle AI, el orquestador:

1. Vive entre fases, mantiene contexto
2. Resuelve referencias (topic_keys) y se las pasa al sub-agente
3. El sub-agente arranca con contexto dirigido: "andá a buscar la explore a esta key, ignorá el resto"

**En funky-ai no hay eso.** Cada `/funky-propose` es un chat desde cero. No hay nadie arriba que le pase contexto resuelto.

## Decisión: Engram en cada sub-agente — SÍ

El sub-agente DEBE poder buscar engram por su cuenta. Sin eso, arranca ciego con solo lo que haya en el prompt del workflow. No sabe:

- Si ya se exploró algo similar antes
- Si hay bugs documentados que afectan este dominio
- Si hay patrones establecidos que debería seguir
- Si hay decisiones de arquitectura que impactan su trabajo

### Pero con criterio

El riesgo es que el sub-agente haga búsquedas genéricas al pedo y queme tokens. La solución no es eliminar el acceso, sino **dirigir la búsqueda**.

## Mecanismo: búsqueda por tags

Cada artifact en el falso engram (archivos md) debería tener tags en su frontmatter o naming:

```markdown
---
title: "JWT auth middleware"
tags: [auth, security, middleware]
type: decision
---
```

El sub-agente recibe un TAG desde el prompt del workflow (o lo infiere del feature name) y busca SOLO ese tag:

```
docs/engram/[TAG]/           ← si los archivos están organizados por tag
grep_search "tag: auth"      ← si los tags están en frontmatter
```

**No busca todo el engram. No busca al dope. Busca solo lo que importa para el feature que está laburando.**

## El flujo completo

```
Usuario escribe: /funky-propose add-dark-mode

Prompt que recibe el sub-agente:
─────────────────────────────────
Feature: add-dark-mode
Tags sugeridos: [ui, theme, css]

1. Buscar en engram con tags: ui, theme, css
   → encuentra decisiones de arquitectura, patrones, bugs previos
2. Leer docs/openspec/changes/add-dark-mode/explore.md
3. Producir proposal.md
4. Devolver envelope
─────────────────────────────────
```

## Comparativa: Gentle AI vs funky-ai

| Aspecto | Gentle AI | funky-ai |
|---------|-----------|----------|
| Orquestador | Vive entre fases, resuelve contexto | No existe (chat manual) |
| Sub-agente arranca | Con referencias del orquestador | Desde cero |
| Engram en sub-agente | Opcional (el orquestador ya filtró) | **Necesario** (no hay quien filtre) |
| Búsqueda | Por topic_key exacta | Por tags + feature name |
| Persistencia | Sub-agente escribe + orquestador coordina | Sub-agente escribe y devuelve |

## Sobre la RFC

El pipeline actual tiene un paso RFC antes de explore:

```
RFC → explore → propose → spec → ...
```

La recomendación es **absorber la RFC dentro de la explore**, no pasarla como artifact separado al propose. Así:

- **explore** = requirements (RFC) + codebase investigation + viability analysis
- **propose** = solo necesita `explore.md`, no sabe si existe RFC o no

La RFC puede seguir existiendo como artifact de trazabilidad upstream, pero no entra al pipeline SDD. Si la explore ya referencia y sintetiza la RFC, es suficiente.

Esta decisión la confirma o la ajusta el prompt de explore, que está pendiente de revisar.

---

## Resumen para implementar

1. Mantener acceso a engram en CADA sub-agente
2. Pasar tags en el prompt del workflow (no búsqueda genérica)
3. Sub-agente busca solo por tags relevantes al feature
4. No buscar engram index ni ORCHESTRATOR-STATE — eso es laburo del que escribe el comando
5. RFC absorbida por explore (pendiente de confirmar con el prompt de explore)
