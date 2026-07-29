# Conclusión: Skills vs Context7

> Proyecto: funky-ai  
> Basado en experimento real con Next.js Cache Components / `'use cache'`  
> Fecha: 2026-05-29

## No es binario

Skills y Context7 **no compiten**. Se complementan. Usar solo uno es perder la mitad del juego.

## Skills

| ✅ Ventajas | ❌ Desventajas |
|---|---|
| Costo **0 tokens** — ya están en contexto | Se **desactualizan** — Next.js 16 deprecó `unstable_cache` y la skill sigue diciendo que es lo correcto |
| **Cero latencia** — sin llamada externa | **Mantenimiento** — alguien tiene que actualizarlas o quedan obsoletas |
| Adaptadas al proyecto — convenciones, paths, patrones locales | **Crearlas lleva tiempo** — no sale gratis |
| **Siempre disponibles** — incluso offline | **Copan contexto** — skills que no se usan ocupan espacio en vano |

## Context7

| ✅ Ventajas | ❌ Desventajas |
|---|---|
| **Siempre actualizado** — trae la información actualizada del repo oficial | **Cuesta tokens** — ~2,500 por consulta enfocada (verify: context7-consumo.md) |
| **Ejemplos de código reales** del código fuente oficial | **Latencia** — llamada HTTP |
| **Cubre todo el ecosistema** — no solo lo que alguien documentó | **Dependencia externa** — necesita conexión |
| **Cero mantenimiento** — siempre la última versión | |

## Regla de decisión

| Situación | Usar |
|---|---|
| Patrones estables del proyecto (estructura, tooling, convenciones) | **Skills** |
| APIs que cambian rápido (Next.js, React, Vite, Tailwind) | **Context7** |
| Features nuevas que no conocés | **Context7** |
| Conocimiento interno del equipo ("en este proyecto hacemos X así") | **Skills** |
| Necesitás la fuente oficial, no una interpretación | **Context7** |
| Estás offline | **Skills** |
| Querés cero latencia | **Skills** |

## La combinación ganadora

La skill no tiene por qué compilar toda la documentación de una librería. Puede ser **delgada** y **derivar**:

> **"Para features nuevas de [librería], usá Context7 con [library ID] y query específica."**

Eso te da:

- **Skills para lo estable** → 0 tokens, siempre disponibles
- **Context7 para lo movedizo** → ~2,500 tokens, solo cuando hace falta

## El experimento lo confirma

| Paso | Herramienta | Tokens | Resultado |
|---|---|---|---|
| Skill registry | — | 0 | 0 skills de Next.js → deriva a Context7 ✅ |
| resolve-library-id | Context7 | ~500-800 | Cachea `/vercel/next.js` ✅ |
| query-docs enfocada | Context7 | ~2,100-2,600 | Descubre que `unstable_cache` está deprecado ✅ |
| **Total** | | **~2,600-3,400** | **Documentación oficial actualizada + descubrimiento crítico** |

Si hubiera tenido una skill de Next.js estática, habría seguido implementando con `unstable_cache` como si fuera 2024. Context7 nos avisó que está deprecado.

Si hubiera usado Context7 para cada consulta trivial (estructura de carpetas, cómo correr tests), habría quemado tokens en vano.

**Ahí está la clave: cada uno en su lugar.**
