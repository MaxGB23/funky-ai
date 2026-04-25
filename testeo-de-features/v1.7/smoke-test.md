# 🧪 Smoke Test Final v1.7.0 — Guía del Humano

> **Pre-condición:** `pnpm link --global` ya está activo desde `funky-cli/`. No hace falta volver a ejecutarlo.
> Todos los bugs detectados en el Intento 1 ya están corregidos y con 17/17 tests en verde.

---

## 🅰️ Escenario 1: Headless (Workspace fresco)

**Objetivo:** Validar que el CLI detecta un `PROJECT-CANVAS.md` existente y NO lo sobreescribe.

- [x] Crear una carpeta vacía fuera de `m:\funky-ai\` (ej. `funky-cli-v1.7.test`)
- [x] Abrir una terminal en esa carpeta y ejecutar:

  ```
  funky init --template
  ```

- [x] Validar que se generó un `PROJECT-CANVAS.md` con secciones vacías ("No definido")
- [x] Editar manualmente el `PROJECT-CANVAS.md` con cualquier contenido inventado (al menos 2-3 secciones con texto propio)
- [x] Ejecutar:

  ```
  funky init
  ```

- [x] **Criterios de éxito:**
  - ✅ No se lanzaron los prompts interactivos (`@clack/prompts`)
  - ✅ Se creó `ORCHESTRATOR-STATE.md`
  - ✅ Se creó `.agents/rules/` con los archivos de reglas (`secops.md`, etc.)
  - ✅ Se creó `docs/engram/` con `discoveries.md` y `bugfixes.md`
  - ✅ Se creó `docs/funky-ai/workers/plantilla-worker-handoff.md`
  - ✅ El `PROJECT-CANVAS.md` editado **NO fue sobreescrito** — el contenido tuyo sigue intacto


---

## 🅱️ Escenario 2: Interactivo (Otra carpeta vacía, sin Canvas)

**Objetivo:** Validar que el flujo interactivo de `@clack/prompts` funciona correctamente cuando no hay canvas previo.

- [x] Crear otra carpeta vacía distinta (ej. `prueba-interactive\`)
- [x] Abrir una terminal en esa carpeta y ejecutar:

  ```
  funky init
  ```

- [x] Responder todos los prompts interactivos (patrón arquitectónico, UI framework, TDD)
- [ ] **Criterios de éxito:**
  - [x] ✅ Los prompts se mostraron y respondieron correctamente
  - [x] ❌ Se generó `PROJECT-CANVAS.md` con los valores elegidos en los prompts (FALLÓ: Tailwind no se reflejó y TDD devolvió un booleano literal)
  - [x] ✅ Se creó toda la estructura de scaffolding (misma que el Escenario 1)
  - [x] ✅ La experiencia de usuario (UX) fue fluida, sin mensajes de error ni stacktraces


---

## 📋 Fase 3: Reporte y Cierre

- [ ] Volver a **este chat (Orquestador)** con el resultado de ambos escenarios
- [ ] **Si todo pasó:** El Orquestador actualizará el `ORCHESTRATOR-STATE.md` marcando el Smoke Test como ✅ y consolidará el tag `v1.7.0`
- [ ] **Si algo falló:** Documentar el escenario exacto, el comando ejecutado y el output observado. Abrimos nueva iteración de fix
