# 🧪 Master Smoke Test (QA Ledger)

> **Propósito:** Documento vivo para acumular checklists de validación manual (Smoke Tests E2E). 
> **Regla Doc-Ops:** En lugar de hacer QA de integración exhaustivo por cada feature individual que modifique el CLI o la arquitectura (lo cual es costoso), acumulamos los escenarios críticos aquí. El Smoke Test completo se ejecuta al finalizar la "Épica" correspondiente (ej. al terminar todas las refactorizaciones de templates).

---

## 🛠️ Épica Actual: Motor de Scaffolding y Templates (009, 009.b, 002, 011, 018)
*(Estado: ACUMULANDO. Ejecutar este bloque de validación una vez finalizados todos los issues del backlog relacionados a la inyección y configuración de templates)*

### Escenario 1: Inicialización Limpia (`funky init`)
**Origen:** Feature 009 (Base Templates)
1. [ ] Crear un directorio vacío fuera del ecosistema actual (`mkdir /tmp/smoke-test-funky`).
2. [ ] Vincular el CLI local (`pnpm link` o ejecución directa del binario local).
3. [ ] Ejecutar `funky init`.
4. [ ] **Validación:** Verificar que el archivo `TEMPLATE_GUIDE.md` exista en la raíz.
5. [ ] **Validación:** Verificar que `README.md` sea el esqueleto vacío del proyecto (no el manual del CLI).
6. [ ] **Validación:** Verificar que el `tasks.md` inyectado no contenga reglas de orquestación duras, y que sí contenga el gate de Tests en la Fase X.
7. [ ] **Validación Estructural:** El template base de convenciones (ej. `000-TEMPLATE.md`) debe estar ubicado con el resto de templates del CLI en el código fuente para mantener el orden, mientras que las versiones inyectadas/adaptadas van a la carpeta `.agents/` del workspace del usuario.

### Escenario 2: Scaffolding de Feature (`funky feature`)
**Origen:** Feature 009.b (CLI Scaffolding)
1. [ ] En el mismo directorio inicializado del Escenario 1, ejecutar `funky feature test-feature`.
2. [ ] **Validación:** Comprobar que el comando copia correctamente los "Golden Templates" desde `.agents/templates/sdd/` hacia `docs/openspec/changes/test-feature/`.
3. [ ] **Validación:** Confirmar que no inyecta los templates crudos/vacíos de `funky-cli/src/templates/sdd/` si existen los Golden.

### Escenario 3: Estimación de Costos (`funky estimate`)
**Origen:** Feature 002 (Cost Estimator)
1. [ ] En el mismo directorio inicializado, asegurar que existan los archivos `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con contenido de prueba.
2. [ ] Ejecutar `funky estimate`.
3. [ ] **Validación:** Comprobar que se presenten los prompts interactivos para los factores de negocio (Región, Tamaño, Urgencia).
4. [ ] **Validación:** Completar los inputs interactivos de consola y verificar que el comando no falle por un cuelgue del TTY (headless timeout).
5. [ ] **Validación:** Verificar la creación exitosa del artefacto `docs/pricing-analysis.md`.
6. [ ] **Validación:** Abrir `docs/pricing-analysis.md` y corroborar que se haya inyectado correctamente el prompt de mentoría y la estimación calculada.

---
*(Agregar nuevos escenarios aquí a medida que se desarrollen nuevas features complejas)*
