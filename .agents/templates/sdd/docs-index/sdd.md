# Índice de Secciones: `docs/funky-ai/sdd.md`

- **1. ¿Qué problema resuelve?:** Instalación del framework agéntico (reglas, templates y engram) sobre un repo inicializado.
- **2. ¿Cuándo usarlo?:** Después de `funky init`; una sola vez, es idempotente.
- **3. Árbol completo de inyección:** Estructura que materializa el ecosistema Funky AI.
  - **Root files (3):** `ORCHESTRATOR-STATE.md`, `README.md` y `TEMPLATE_GUIDE.md`.
  - **`.agents/rules/` (23 archivos):** Reglas base (8), tier2-delegation (6), tier3-interactive (8) y risk-decision (1).
  - **`.agents/templates/sdd/` (8 + 2 copiados):** 8 templates copiados más `docs-live-index.md` y `docs-index/_indice-seccional-template.md` copiados del template base compartido (`bootstrap/sdd/`, mismo src que `funky skills` — R-SK-5).
  - **`openspec/rfcs/` — Excepción de ruta:** `000-rfc-template.md` inyectado fuera de `.agents` (dominio del proyecto).
  - **`docs/engram/` — 7 directorios:** Shards vacíos para memoria persistente por categoría.
- **4. Diagrama de flujo:** `runScaffoldCommand()` (handler de `funky sdd install`) → `runScaffold()` ensambla intenciones (`copy`, `create`, `mkdir`) que procesa `executeIntentions()`. El scaffold agnóstico (`funky scaffold`) es un comando aparte: `runAgnosticScaffold()` (4 operaciones).
