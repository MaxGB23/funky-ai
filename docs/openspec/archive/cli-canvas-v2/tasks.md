# 📋 Plan de Tareas Ejecutables: CLI Canvas v2

> **Basado en:** La Propuesta (`proposal.md`) y las mitigaciones del Análisis de Riesgos (`risk-analysis.md`).

Este plan define las fases exactas para implementar la separación arquitectónica del CLI y expandir la recolección de contexto, mitigando todos los casos borde detectados.

---

## Fase 1: Fixes de Legacy (BUG-01 y BUG-02)
- [ ] **1.1. Unificar clave UI:** En `funky-cli/src/commands/init.js` o `canvas.js`, alinear el uso de `ui` vs `styling` para que la opción elegida por el usuario se guarde correctamente en el canvas.
- [ ] **1.2. Transformar Testing:** En `init.js`, asegurar que el booleano devuelto por `p.confirm({ message: '¿Configurar Testing estricto (TDD)?' })` se parsee a texto descriptivo (ej: `'Sí, TDD (Test-Driven Development)'` o `'No definido'`) antes de enviarlo al canvas.

---

## Fase 2: Dividir el Motor de Markdown
- [ ] **2.1. Refactorizar `generateCanvasMarkdown`:** En `funky-cli/src/utils/canvas.js`, reemplazar la función única por dos funciones independientes:
  - `generateProjectCanvasMarkdown(config)` → Para Framework, Arquitectura, Estado, UI y Testing.
  - `generateInfraCanvasMarkdown(config)` → Para Base de Datos, Auth, Deployment y Linter.
- [ ] **2.2. Fallbacks semánticos:** Asegurar que si una clave falta (o si el usuario eligió "Decidir luego"), el string interpolado sea `'No definido / Pendiente'` en lugar de `undefined`, `null` o booleanos.

---

## Fase 3: Expandir Prompts y Transaccionalidad
- [ ] **3.1. Prompts Core (Fase 1):** En `init.js`, reemplazar las preguntas actuales por un `p.group` que incluya: Framework Base (Next, Vite, Astro), Patrón (Clean, Hexagonal, Modular), UI (Tailwind, CSS Modules), Estado, y Testing (Metodología y Runner).
- [ ] **3.2. Prompts Infra (Fase 2):** Agregar un segundo `p.group` para Base de Datos, Autenticación, Linter y Deployment. **Crucial:** Todas las opciones deben incluir `'No definido / Decidir luego'`.
- [ ] **3.3. Transaccionalidad (Ctrl+C):** Garantizar que `runInit()` SOLO se llame al finalizar ambos `p.group` exitosamente. Si ocurre un `onCancel` en Fase 2, el proceso debe morir con `process.exit(1)` sin tocar el disco.

---

## Fase 4: Idempotencia, Legacy y Headless
- [ ] **4.1. Detección Independiente:** Al inicio de `init.js`, evaluar `fs.existsSync` separadamente para `PROJECT-CANVAS.md` e `INFRA-CANVAS.md`.
- [ ] **4.2. Nuevo objeto `canvasConfig`:** Reemplazar el viejo `{ fromHeadless: true }` por:
  ```javascript
  const canvasConfig = {
    skipProjectCanvas: hasProjectCanvas,
    skipInfraCanvas: hasInfraCanvas,
    projectData: { ... },
    infraData: { ... }
  };
  ```
- [ ] **4.3. Manejo de Legacy (v1.7.0):** Si `hasProjectCanvas` es `true` pero `hasInfraCanvas` es `false`, generar un `INFRA-CANVAS.md` estático con el warning de `> ⚠️ **MIGRACIÓN PENDIENTE**`. Saltar los prompts interactivos en este caso para no romper pipelines automatizados. Imprimir advertencia en consola.
- [ ] **4.4. Flag `--template`:** Modificar la validación para que **falle** si cualquiera de los dos archivos ya existe. Si ninguno existe, generar ambos en blanco y salir (`process.exit(0)`).

---

## Fase 5: Actualizar el motor de escritura (`runInit`)
- [ ] **5.1. Escritura condicional:** En `runInit`, usar `skipProjectCanvas` y `skipInfraCanvas` para decidir si se llama a `fs.writeFileSync` para cada archivo respectivo, sin depender de un flag genérico.

---

> **[SISTEMA - PARA EL ORQUESTADOR]** Este documento debe ser entregado al Worker que ejecute la codificación, referenciándolo en el `worker-handoff.md`.
