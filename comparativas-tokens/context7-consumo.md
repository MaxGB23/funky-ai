# Consumo de Tokens — Context7 MCP

> Fecha: 2026-05-29  
> Proyecto: funky-ai  
> Query: Next.js documentation and API reference - the latest version

## Llamada: `context7_resolve-library-id`

**Input**: query + libraryName  
**Output**: 5 librerías con metadata completa (ID, descripción, snippets, reputación, score, versiones)

### Estimación de consumo

| Concepto | Tokens |
|---|---|
| Input | ~200-400 |
| Output | ~300-400 |
| **Total** | **~500-800** |
| Costo aprox (GPT-4o) | < $0.01 USD |

### Librerías devueltas

| ID | Reputación | Snippets | Score | Versiones relevantes |
|---|---|---|---|---|
| `/vercel/next.js` | High | 2,550 | 91.6 | v16.2.2, v16.1.x, v15.4.x, v14.3.x |
| `/llmstxt/nextjs_llms-full_txt` | High | 40,721 | 84.0 | — |
| `/websites/nextjs` | High | 7,602 | 73.6 | — |
| `/websites/nextjs_13` | High | 2,645 | 80.2 | — |
| `/sleeptok3n/next.js` | Medium | 7,891 | 78.9 | — |

### Análisis

- **`context7_resolve-library-id`** es barato (~500-800 tokens). Devuelve metadata para elegir la fuente correcta.
- **`context7_query-docs`** es donde está el consumo real. Dependiendo de la query y la cantidad de ejemplos que devuelva, pueden ser **varios miles de tokens** (estimado: 2k-8k por llamada).
- La librería oficial es `/vercel/next.js` (reputación High, score 91.6, versión más reciente v16.2.2).
- `/llmstxt/nextjs_llms-full_txt` tiene 40k+ snippets y también es High reputation — buena alternativa si se necesita cobertura amplia.

---

## Llamada real: `context7_query-docs` — Cache Components

**Contexto**: Simulación de pedido de feature "implementar cache components en Next.js".  
**Flujo real**: Sin skills de Next.js instalados → recurrir a Context7 → consulta específica.

**Query enviada**:
```
Cache components in Next.js - how to implement caching with React cache(),
unstable_cache, and full route cache strategies
```

**Skill detection previa**:
- Buscado en skill registry del proyecto (`**/*skill*registry*`) → no hay skills de Next.js
- Buscado con grep en `SKILL.md` → solo match marginal en `find-skills` (menciona nextjs como tag)
- **Resultado**: 0 skills relevantes → Context7 es la ruta correcta

### Cálculo de tokens real

El output de `context7_query-docs` devolvió **5 secciones** con documentación oficial + ejemplos de código:

| Sección | Descripción | Código (líneas) |
|---|---|---|
| Cache Component con `'use cache'` | Párrafo corto | ~15 líneas TSX |
| Static + Remote + Private caching | Texto explicativo | ~100 líneas TSX |
| `unstable_cache` con tags/revalidate | Párrafo | ~25 líneas TSX + JSX |
| `unstable_cache` deprecation note | 1 párrafo | — |
| `cacheComponents` config | 1 párrafo | — |

### Consumo estimado

| Concepto | Tokens |
|---|---|
| Input (query string + libraryId) | ~50-100 |
| Output (descripciones + ~140 líneas de código) | ~2,000-2,500 |
| **Total `query-docs`** | **~2,100-2,600** |
| **Total acumulado sesión (resolve + query-docs)** | **~2,600-3,400** |
| Costo aprox (GPT-4o, input + output) | ~$0.02-0.04 USD |

### Breakdown real del contenido recibido

Lo que realmente vino en el output:

1. **Directiva `'use cache'`** — Marcar componentes/funciones como cacheados. Se ejecuta una vez y se reusa. Permite prerenderizado si los inputs están disponibles antes del request.
2. **Estrategias mixtas** — Combinar `'use cache'` (static), `'use cache: remote'` (compartido con expiración), `'use cache: private'` (por usuario). Uso de `cacheTag()` y `cacheLife()` para control fino.
3. **`unstable_cache` (legacy)** — API anterior con tags y revalidate. **Deprecada en Next.js 16**, reemplazada por `'use cache'`.
4. **`cacheComponents` config** — Opción de configuración en `next.config.js` para habilitar Cache Components a nivel global.

### Dato clave

La feature que pediste (**Cache Components**) ya no se implementa con `unstable_cache`. Next.js 16 la reemplazó con la **directiva `'use cache'`** — se pone arriba de cualquier función async y Next.js maneja el caching automáticamente. Hay 3 variantes:
- `'use cache'` → estático, compartido, prerenderizado
- `'use cache: remote'` → runtime compartido con `cacheLife` + `cacheTag`
- `'use cache: private'` → por usuario, con cookie/session

---

## Principio: Especificidad de Query = Token Savings

Este es el patrón más importante para usar Context7 sin quemar tokens al pedo.

### El problema

Si preguntás genérico, Context7 te devuelve **todo lo que encuentra** asociado a esa librería. No discrimina, no prioriza, no pregunta "¿esto te sirve?". Te manda el combo completo.

```
Query: "Next.js documentation"                → output: 8k+ tokens ❌
Query: "Next.js cache components use cache"    → output: ~2.5k tokens ✅
```

### El patrón

```
Quiero saber X sobre [librería]
  └→ ¿Qué exactamente de X?
       └→ ¿Qué variantes/alternativas de X me interesan?
            └→ ¿Qué NO me interesa (para excluirlo)?
```

En la práctica:

| Query genérica (mala) | Query específica (buena) |
|---|---|
| `"Next.js docs"` | `"Next.js App Router route handlers with revalidation"` |
| `"React hooks"` | `"React useCallback vs useMemo performance tradeoffs"` |
| `"Tailwind CSS"` | `"Tailwind CSS custom theme with dark mode breakpoints"` |

### El costo de no hacerlo

| Escenario | Query | Tokens output | Diferencia |
|---|---|---|---|
| Cache Components | Específica | ~2,100-2,600 | — |
| Documentación general | Genérica | ~6,000-8,000+ | **3x-4x más** |
| Varias queries genéricas | Genérica x3 | ~18,000-24,000 | **9x-10x más** |

### TL;DR

> Cada palabra extra que aclara QUÉ querés = tokens que NO gastás en lo que NO querés.

La query de Cache Components funcionó porque en una sola frase aclaré:
- **Qué**: cache components
- **Variante**: `'use cache'`
- **Alternativa legacy**: `unstable_cache`
- **Contexto**: full route cache

Context7 devolvió justo eso y nada más.

### Análisis de eficiencia

| Aspecto | Resultado |
|---|---|
| ¿La query fue suficientemente específica? | Sí — pidió cache components + unstable_cache + full route cache |
| ¿Sirvió cachear el library ID? | Sí — evitó llamada extra a `resolve-library-id` |
| ¿Se podría haber reducido el output? | Apenas — la query estaba bien enfocada, el tamaño vino de los ejemplos de código |
| ¿Valió la pena vs buscar manualmente? | **Sí** — trajo documentación oficial actualizada con ejemplos funcionales y la nota de deprecación de `unstable_cache` |

### Recomendación actualizada

Para minimizar tokens:
1. Usar **`resolve-library-id`** una sola vez por sesión y cachear el ID ✅ (hecho)
2. Ser **específico** en la query de `query-docs` ✅ (cache components + variantes)
3. Preferir `/vercel/next.js` (oficial) para autoridad, o `/llmstxt/nextjs_llms-full_txt` para cobertura máxima.
4. **Cachear el resultado** de `query-docs` en Engram para no repetir la misma consulta en otra sesión.
