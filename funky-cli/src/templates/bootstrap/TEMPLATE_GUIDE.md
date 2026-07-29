# 📘 Funky AI — Guía de Customización de Templates (Progressive Disclosure)

> **Propósito:** Esta guía define cómo deben mutar y evolucionar los templates agnósticos (como `tasks.md`, `README.md`, etc.) generados inicialmente por `funky init`, basándose en las decisiones del Project Canvas y el Architecture Assessment.

## 🌟 El Principio de Progressive Disclosure

Los proyectos inicializados con Funky AI no asumen un stack tecnológico complejo desde el día cero. En su lugar, utilizamos plantillas **agnósticas** y esqueletos mínimos. A medida que la arquitectura se define y crece (mediante el ciclo SDD), los templates *deben mutar* para reflejar las nuevas reglas del proyecto.

**Regla de Oro:** No inyectes complejidad en las plantillas hasta que el proyecto lo exija explícitamente a través del `arch-assessment.md` o el `project-canvas.md`.

---

## 🛠️ Flujo de Customización Post-Inicialización

Una vez que has ejecutado `funky init --bootstrap` y tienes los archivos base, el Orquestador (o el Tech Lead humano) debe adaptar las plantillas siguiendo estos pasos:

### 1. Definición de la Arquitectura
Ejecuta la evaluación arquitectónica inicial y el canvas del proyecto. Este proceso arrojará requerimientos explícitos (NFRs, stack, integraciones).

### 2. Mutación de `tasks.md`
El archivo `tasks.md` base es un esqueleto con una Fase 0 genérica y el protocolo de release. Debe ser expandido inyectando invariantes (reglas que se aplican a todas las fases) basados en las decisiones arquitectónicas:

* **Ejemplo - Linter/Formateo:**
  * **Decisión:** "El proyecto requiere linting estricto (ESLint/Prettier)."
  * **Mutación en `tasks.md`:** El Orquestador debe inyectar una regla obligatoria en los bloques de ejecución: `- [ ] Ejecutar linter y resolver advertencias antes de dar la fase por completada.`

* **Ejemplo - Testing (Vitest/Playwright):**
  * **Decisión:** "El proyecto sigue una estrategia de TDD estricta."
  * **Mutación en `tasks.md`:** El Orquestador debe inyectar en las Fases de Desarrollo: `- [ ] Escribir y pasar los tests de la unidad de código ANTES de la implementación final.`

* **Ejemplo - Seguridad:**
  * **Decisión:** "El entorno requiere auditorías de seguridad constantes en dependencias."
  * **Mutación en `tasks.md`:** Añadir `- [ ] Ejecutar auditoría de seguridad del package manager` en fases que impliquen instalación de nuevas dependencias.

### 3. Evolución del `README.md` (Architecture Hub)
El `README.md` generado por defecto está vacío de contexto específico. Debe evolucionar para convertirse en el **Architecture Hub** del proyecto:

* Insertar el diagrama de la arquitectura (mermaid).
* Listar los comandos locales específicos del repositorio (ej. `pnpm dev`, scripts de docker).
* Incluir enlaces a los documentos clave generados durante las primeras fases de SDD.

### 4. Actualización del Engram y ORCHESTRATOR-STATE
Cualquier decisión estructural de cómo mutar los templates que se convierta en un estándar para este proyecto particular, DEBE registrarse en:
* `docs/engram/discoveries.md` (y su índice en `index.md`).
* `ORCHESTRATOR-STATE.md` (como un invariante de las nuevas fases a desarrollar).

---

## ⚠️ Antipatrones a Evitar

* **Presets Rígidos:** No modifiques los templates en la herramienta `funky-cli` intentando cubrir todos los casos de uso (ej. un `tasks-react.md`, `tasks-node.md`). Mantenlos agnósticos.
* **Sobrecarga Inicial (Bloat):** No llenes de checklist items un `tasks.md` para herramientas que aún no han sido aprobadas ni documentadas en el `spec.md`.
