# 🧪 Smoke Test Final v1.12.0 — Guía del Humano

> **Pre-condición:** `pnpm link --global` ya está activo desde `funky-cli/`. No hace falta volver a ejecutarlo.
> El objetivo es probar la Architecture Readiness Gate (`funky assess`).

---

## 🅰️ Escenario 1: Generación del Template (Workspace fresco)

**Objetivo:** Validar que el CLI detecta la falta de un assessment y lo genera correctamente.

- [x ] Crear una carpeta vacía fuera de `m:\funky-ai\` (ej. `C:\test\funky-assess\`)
- [x ] Abrir una terminal en esa carpeta y ejecutar:
  ```bash
  funky assess
  ```
- [x] **Criterios de éxito:**
  - ✅ El comando finaliza con éxito (exit code 0).
  - ✅ Se imprimió en consola: "📄 Se ha creado docs/architecture-assessment.md" y la instrucción de completarlo.
  - ✅ El archivo `docs/architecture-assessment.md` existe y tiene el template base.

---

## 🅱️ Escenario 2: Falla de Validación Arquitectónica (Challenges Generados)

**Objetivo:** Validar que el motor de reglas detecta inconsistencias y genera el prompt de revisión para el agente.

- [ ] En la misma carpeta del Escenario 1, editar el frontmatter de `docs/architecture-assessment.md` forzando fallas de validación. Editá estos valores clave:
  ```yaml
  budget: "20"
  rps: "5000"
  sla: "99.9"
  redundancy: "Single Node"
  db_tech: "SQLite"
  infra_tech: "K8s"
  ```
- [ ] Ejecutar en la terminal:
  ```bash
  funky assess
  ```
- [ ] **Criterios de éxito:**
  - ✅ El comando falla intencionalmente (exit code 1).
  - ✅ Se imprimió en consola la advertencia de Challenges Críticos.
  - ✅ Se creó el archivo `.agents/prompts/architecture-review.md`.
  - ✅ El archivo de review contiene textualmente los 3 challenges (Overengineering, Cuello de Botella, Underengineering).

---

## 🅲 Escenario 3: Validación Exitosa

**Objetivo:** Validar que una arquitectura coherente pase el gate sin generar bloqueos.

- [ ] Editar nuevamente el frontmatter de `docs/architecture-assessment.md` con valores sensatos:
  ```yaml
  budget: "500"
  rps: "500"
  sla: "99.0"
  redundancy: "Multi-AZ"
  db_tech: "PostgreSQL"
  infra_tech: "Vercel"
  ```
- [ ] Ejecutar en la terminal:
  ```bash
  funky assess
  ```
- [ ] **Criterios de éxito:**
  - ✅ El comando finaliza con éxito (exit code 0).
  - ✅ Se imprime en consola: "✅ Arquitectura validada sin problemas críticos."

---

## 📋 Fase 3: Reporte y Cierre

- [ ] Volver a **este chat (Orquestador)** pegando el output y el resultado de los 3 escenarios.
- [ ] **Si todo pasó:** Marcamos el Smoke Test como ✅ en el `ORCHESTRATOR-STATE.md`.
- [ ] **Si algo falló:** Reportá acá el error y levantamos un Worker para fixearlo.
