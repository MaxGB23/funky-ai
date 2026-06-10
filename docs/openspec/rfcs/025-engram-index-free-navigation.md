# RFC 025: Engram Memory Polling — Index-Free Navigation

> **🛑 WARNING PARA LA IA (ORQUESTADOR):** 
> Este documento es un **RFC (Request for Comments) / Brain Dump**. Son notas crudas del humano y del Orquestador.
> **NO ES UN PROPOSAL FORMAL**. Tu trabajo es **leer esto, extraer la intención, validar viabilidad, y generar un `proposal.md` formal** en el directorio del change.

---

## 🧠 El Problema / La Idea

El **Two-Stage Memory Polling** actual funciona así:
1. **Stage 1 (siempre):** `view_file docs/engram/index.md` — carga el archivo completo del índice.
2. **Stage 2 (condicional):** `grep_search "[TAG]"` recursivo en `docs/engram/`.

El pedo del Stage 1 es que el `index.md` **crece con cada engrama que se agrega**. Con el tiempo se vuelve un archivo XXL que el agente se traga entero para obtener, en la mayoría de casos, solo 1-3 tags relevantes. Eso es **token waste puro** — el equivalente de leer todo el diccionario para buscar una palabra.

### La Propuesta: `list_dir` como Stage 1

En lugar de `view_file` del `index.md`, usar `list_dir docs/engram/` para obtener los **nombres de los archivos** (que son los slugs de los tags). Esto da el panorama de qué existe en el engram **sin cargar ni un byte de contenido**.

Flujo propuesto:
1. **Stage 1 (siempre):** `list_dir docs/engram/` — lista las subcarpetas (`architecture/`, `discovery/`, `bugfix/`, etc.) y sus archivos (slugs = tags).
2. **Stage 2 (condicional — si hay slug relevante al task):** `view_file docs/engram/{categoria}/{slug}.md` del archivo específico.

---

## 🗑️ Brain Dump

### ¿Por qué `list_dir` y no `grep_search` directo?

El problema del grep puro es el **chicken-and-egg**: si el agente no sabe qué tags existen, ¿qué keyword busca? `list_dir` resuelve el discovery de tags de forma ultra-ligera (solo nombres de archivos, sin contenido). Es O(1) en tokens comparado con O(N) del `view_file` del index.

### ¿Qué pasa con el `index.md`?

Dos opciones:
1. **Deprecarlo por completo:** Si `list_dir` da suficiente información de discovery, el `index.md` se vuelve redundante y puede ser un artefacto histórico que nadie mantendrá bien (ya vivimos el `[doc-update-index-manual-drift]`).
2. **Mantenerlo como fallback humano:** El `index.md` puede quedarse como lectura para humanos (resumen legible), pero sacar al agente de la obligación de leerlo en cada sesión.

**Mi recomendación:** Opción 2 corto plazo. Si el `list_dir` demuestra ser suficiente en la práctica, deprecamos el index en un RFC posterior.

### Impacto en Reglas

- **`sdd-orchestrator.md`:** Cambiar Stage 1 de `view_file docs/engram/index.md` → `list_dir docs/engram/`.
- **`funky-explore.md`:** Mismo cambio.
- **`funky-worker.md`:** Mismo cambio en todos los workflows que aplique.
- **`funky-tasks.md`:** Mismo cambio (si aplica Stage).
- **`funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`:** Mirror del cambio en el template distribuido.

### Preguntas Abiertas

1. ¿El output de `list_dir` incluye suficiente info (nombres de archivo sin extensión = slugs) para que el agente infiera si un tag es relevante al task actual?
2. ¿Hay casos edge donde el agente genuinamente necesite el panorama completo del index para navegar el engram? (Ej: al abrir una sesión nueva con contexto mínimo)
3. ¿Conviene agregar una convención de prefijos en los nombres de archivo de engrama para mejorar el discovery por `list_dir`? Ej: `[discovery]-cli-template-sync-drift.md` en lugar del nombre actual.

---

## 🎯 Qué NO es esto

- NO cambia cómo se escriben los engramas (`funky engram add`).
- NO cambia la estructura de carpetas del engram.
- NO afecta el Stage 2 (ese ya es eficiente — lee solo el archivo específico).
