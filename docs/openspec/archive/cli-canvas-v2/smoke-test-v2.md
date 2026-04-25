# 🧪 Smoke Test Final — CLI Canvas v2

> **Pre-condición:** `pnpm link --global` ya debe estar activo desde la carpeta `funky-cli/`. Los unit tests (18/18) ya garantizan la lógica interna, pero este test verifica la UX y la transaccionalidad real en disco.

---

## 🅰️ Escenario 1: Flujo Interactivo Completo y Transaccionalidad

**Objetivo:** Validar que los prompts se dividen en dos grupos, que todos los valores se guardan correctamente (fixes de bugs v1.7) y que la cancelación (`Ctrl+C`) es atómica.

- [ x] Crear una carpeta vacía (ej. `C:\test\funky-v2-full\`)
- [ x] Ejecutar `funky init`
- [ x] Responder la Fase 1 (Core).
- [ x] **En la Fase 2 (Infra), presionar `Ctrl+C`.**
- [ x] **Criterios de éxito intermedios:**
  - ✅ El proceso sale sin stacktraces horribles (salida limpia).
  - ✅ **NO se escribió ningún archivo** (la carpeta sigue vacía, no se generó ni el PROJECT-CANVAS ni el ORCHESTRATOR-STATE).
- [x] Volver a ejecutar `funky init` y ahora sí, responder ambas fases hasta el final. Elegir explícitamente "Tailwind" y "TDD".
- [x] **Criterios de éxito finales:**
  - [x] Se crearon los 7 templates estáticos de la metodología SDD.
  - [x] Se crearon `PROJECT-CANVAS.md` e `INFRA-CANVAS.md`.
  - [x] El `PROJECT-CANVAS.md` muestra "Tailwind" (o la opción elegida) en su sección de Estilos (no "No definido" - fix BUG-01).
  - [x] El `PROJECT-CANVAS.md` muestra un texto descriptivo para el Testing, no el literal `true` (fix BUG-02).
  - [x] El `INFRA-CANVAS.md` contiene los valores elegidos en la Fase 2.

---

## 🅱️ Escenario 2: Flag `--template` y Headless Puro

**Objetivo:** Validar que el modo headless genera ambos archivos y respeta la idempotencia dual.

- [x] Crear otra carpeta vacía (ej. `C:\test\funky-v2-headless\`)
- [x] Ejecutar `funky init --template`
- [x] **Criterios de éxito intermedios:**
  - [x] Se crearon `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con sus secciones vacías / "No definido".
  - [x] No se copiaron los templates del orquestador aún.
- [x] Ejecutar de nuevo `funky init --template`
  - [x] **DEBE fallar** advirtiendo que los archivos ya existen.
- [x] Editar manualmente `PROJECT-CANVAS.md` y agregar "Mi Framework Custom".
- [x] Ejecutar `funky init`
- [x] **Criterios de éxito finales:**
  - [x] Se copió todo el scaffolding estático (`ORCHESTRATOR-STATE.md`, etc.).
  - [x] No se lanzaron prompts interactivos.
  - [x] Ambos canvases informaron `⚡ Salteando (ya existe)`.
  - [x] "Mi Framework Custom" sigue intacto en el disco.

---

## 🅲 Escenario 3: Modo Legacy / Migración (Crucial)

**Objetivo:** Validar qué pasa cuando alguien corre el nuevo CLI en un proyecto inicializado con la v1.7.0 (donde existe `PROJECT-CANVAS.md` pero NO existe `INFRA-CANVAS.md`).

- [x] Crear una carpeta vacía (ej. `C:\test\funky-v2-legacy\`)
- [x] Crear a mano un archivo `PROJECT-CANVAS.md` con cualquier texto.
- [x] Ejecutar `funky init`
- [x] **Criterios de éxito:**
  - [x] **NO** se lanzan los prompts interactivos (se saltean para no romper flujos automatizados de CI).
  - [x] Se imprime por consola una advertencia de proyecto legacy o migración.
  - [x] Se genera un `INFRA-CANVAS.md` que contiene el boilerplate de `> ⚠️ **MIGRACIÓN PENDIENTE**`.
  - [x] El `PROJECT-CANVAS.md` original no sufrió modificaciones.

---

## 📋 Fase Final: Reporte y Cierre

- [ ] Volvé a **un nuevo chat de Orquestador** con el resultado de los tres escenarios.
- [ ] Si todo está en verde: ¡Consolidamos la release de CLI v2!
- [ ] Si algo falla: Documentamos el escenario y hacemos una iteración de fix.
