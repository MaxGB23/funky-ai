# Mini-Tasks: Implementación del Fix v2.0.1

Este documento desglosa el plan de acción en pasos ejecutables para discutir antes de meter mano en el código.

---

### FASE 1: Recuperación y Unificación de la Capa 2 (El Orquestador vuelve al repo)
> **Objetivo:** Consolidar toda la lógica de planificación en un único archivo gestionado por el IDE, recuperando reglas perdidas.

- [ ] **1.1 Rescue Feature 012:** Recuperar la lógica exacta del "Paso 0 (Auto-Tiering)" y la "Escalation Matrix" desde `docs/openspec/archive/v1.19.0-012-auto-tiering/spec.md`.
- [ ] **1.2 Fusión de Lógica:** Tomar los Checklists y Reglas (G1/G2/G3) de `funky-orchestrator.md` y fusionarlos con la lógica rescatada (1.1) dentro del archivo definitivo: `.agents/rules/sdd-orchestrator.md`.
- [ ] **1.3 Depuración y Limpieza:** Asegurarse de que el nuevo archivo consolidado no contenga reglas del Worker. Eliminar físicamente el archivo viejo `.agents/rules/sdd-orchestrator-core.md` (evitando nombres confusos).
- [ ] **1.4 Ajuste del Trigger:** Validar que `sdd-orchestrator.md` mantenga el frontmatter `trigger: model_decision`.

### FASE 2: Pruebas Locales (Dogfooding en Golden Templates)
> **Objetivo:** Probar el comportamiento en vivo dentro del propio repo oficial antes de tocar el código del CLI.

- [ ] **2.1 Sandbox Test:** Abrir un chat en blanco y verificar que el IDE inyecte correctamente `.agents/rules/sdd-orchestrator.md`.
- [ ] **2.2 Validación de Auto-Tiering:** Pedir una feature y comprobar que el Orquestador realiza el "Paso 0" y se detiene a pedir confirmación del Tier.

### FASE 3: Migración al Core (Fix de la Raíz del CLI)
> **Objetivo:** Una vez aprobado el comportamiento, propagar el fix al código fuente del CLI.

- [ ] **3.1 Actualizar init.js y Templates Base:** Copiar el `.agents/rules/sdd-orchestrator.md` testeado hacia `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`.
- [ ] **3.2 Modificar el Bootstrap:** Actualizar la lógica en `funky-cli/src/commands/init.js` si fuera necesario para apuntar al archivo correcto.
- [ ] **3.3 Actualización de Handoffs:** Revisar `funky-cli/src/templates/sdd/worker-handoff.md` para asegurar que instruya el uso de `/funky-worker`.

### FASE 4: Auditoría de Pérdida de Datos (Diff Analysis)
> **Objetivo:** Evitar regresiones silentes al comparar la migración final con los archivos legacy.

- [ ] **4.1 Diff de Templates:** Comparar el nuevo `.agents/rules/sdd-orchestrator.md` contra el viejo backup del CLI (`funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`).
- [ ] **4.2 Rescate Final:** Identificar si hay instrucciones clave de la arquitectura pre-v2.0 que se nos hayan pasado por alto y re-insertarlas antes del release.

### FASE 5: Actualización Documental (Doc-Ops)
> **Objetivo:** Que los manuales reflejen este pivot arquitectónico.

- [ ] **4.1 Cheat Sheet:** Actualizar `docs/funky-ai/guias/comando-vs-archivos.md` para borrar la referencia a `/funky-orchestrator`.
- [ ] **4.2 Retrospectiva:** Agregar un apartado en `v1-vs-v2-architecture.md` titulado "La Corrección v2.0.1: Asimetría Operativa".
- [ ] **4.3 README & Estado:** Actualizar `README.md` (si corresponde) y mover el roadmap en `ORCHESTRATOR-STATE.md`.

---
**¿Qué te parece esta hoja de ruta?**
Si algún paso no te convence o sentís que falta algo para blindar el proceso, lo ajustamos. Si estás de acuerdo, empezamos a tildar casilleros con la Fase 1.