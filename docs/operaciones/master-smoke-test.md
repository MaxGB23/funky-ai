# 🧪 Master Smoke Test (QA Ledger)

> **Propósito:** Documento vivo para acumular checklists de validación manual (Smoke Tests E2E).
> **Regla Doc-Ops:** En lugar de hacer QA de integración exhaustivo por cada feature individual que modifique el CLI o la arquitectura (lo cual es costoso), acumulamos los escenarios críticos aquí. El Smoke Test completo se ejecuta al finalizar la "Épica" correspondiente.

---

## 🎯 Épica Actual: Motor de Scaffolding, Templates y Arquitectura de Agentes (009, 009.b, 002, 011, 018, v2.0.1)
*(Estado: ACUMULANDO. Ejecutar este bloque de validación una vez finalizados todos los issues del backlog relacionados a la inyección y configuración de templates)*

### Escenario 1: Inicialización Limpia (`funky init`)
**Origen:** Feature 009 (Base Templates)
1. [ ] Crear un directorio vacío fuera del ecosistema actual.
2. [ ] Vincular el CLI local (`pnpm link` o ejecución directa del binario local).
3. [ ] Ejecutar `funky init`.
4. [ ] **Validación:** Verificar que `.agents/rules/sdd-orchestrator.md` exista con `trigger: model_decision` en el frontmatter.
5. [ ] **Validación:** Verificar que `.agents/rules/secops.md` y `.agents/rules/engram-protocol.md` existan.
6. [ ] **Validación:** Verificar que `ORCHESTRATOR-STATE.md` exista en la raíz.
7. [ ] **Validación:** Verificar que `docs/engram/discoveries.md` y `docs/engram/bugfixes.md` existan.
8. [ ] **Validación:** Verificar que el `tasks.md` inyectado contenga el gate de Tests en el MANDATORY_RELEASE_PROTOCOL.

---

### Escenario 2: Scaffolding de Feature (`funky feature`)
**Origen:** Feature 009.b (CLI Scaffolding)
1. [ ] En el mismo directorio inicializado del Escenario 1, ejecutar `funky feature test-feature`.
2. [ ] **Validación:** Comprobar que el comando copia correctamente los Golden Templates desde `.agents/templates/sdd/` hacia `openspec/changes/test-feature/`.
3. [ ] **Validación:** Confirmar que NO inyecta los templates crudos de `funky-cli/src/templates/sdd/` si existen los Golden.

---

### Escenario 3: Estimación de Costos (`funky estimate`)
**Origen:** Feature 002 (Cost Estimator)
1. [ ] En el mismo directorio inicializado, asegurar que existan `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con contenido de prueba.
2. [ ] Ejecutar `funky estimate`.
3. [ ] **Validación:** Comprobar que se presenten los prompts interactivos para los factores de negocio (Región, Tamaño, Urgencia).
4. [ ] **Validación:** Completar los inputs interactivos y verificar que el comando no falle por un cuelgue del TTY.
5. [ ] **Validación:** Verificar la creación exitosa del artefacto `docs/pricing-analysis.md`.
6. [ ] **Validación:** Abrir `docs/pricing-analysis.md` y corroborar que se haya inyectado el prompt de mentoría y la estimación calculada.

---

### Escenario 4: Scaffolding Tier 4 (`funky gentle`)
**Origen:** Feature 012.b (Gentle SDD)
1. [ ] En el mismo directorio inicializado del Escenario 1, ejecutar `funky gentle test-critical`.
2. [ ] **Validación:** Comprobar que el comando crea `openspec/gentle/test-critical/` con los 7 archivos (`1-explore.md` → `7-verify.md`).
3. [ ] **Validación:** Confirmar que usa los Golden Templates de `.agents/templates/gentle/` si existen.
4. [ ] **Validación:** Verificar que cada template contiene un bloque `<system_prompt>` con la restricción del rol.
5. [ ] **Validación:** Ejecutar `funky gentle test-critical` nuevamente — debe fallar con error "directorio ya existe".

---

### Escenario 5: Arquitectura de Agentes v2.0.1 (Capa 2 + Auto-Tiering)
**Origen:** Fix v2.0.1 (Context Fading + Feature 012 Rescue)
1. [ ] Crear un proyecto nuevo e inicializar con `funky init`.
2. [ ] **Validación (Capa 2):** Confirmar que `.agents/rules/sdd-orchestrator.md` se crea con `trigger: model_decision` en el frontmatter. El archivo obsoleto `orchestrator-core.md` NO debe existir.
3. [ ] **Validación (Auto-Tiering):** Abrir un chat nuevo en blanco (sin taggear archivos ni invocar slash commands). Escribir *"Quiero planificar una nueva feature"*. Verificar que el Orquestador responde con el **Paso 0 — Razonamiento Pre-Vuelo**, declara un Tier y se detiene a pedir confirmación antes de generar artefactos.
4. [ ] **Validación (Persistencia):** En el mismo chat del paso anterior, mantener una conversación larga (10+ turnos). Verificar que el Orquestador NO "olvida" su rol ni empieza a comportarse como Worker.
5. [ ] **Validación (Worker separado):** Invocar `/funky-worker @worker-handoff.md Ejecutá la Fase N`. Verificar que el Worker ejecuta sin preguntar ni planificar.
6. [ ] **Validación (CLI sync):** Confirmar que `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md` es idéntico al golden local `.agents/rules/sdd-orchestrator.md`.

---
*(Agregar nuevos escenarios aquí a medida que se desarrollen nuevas features complejas)*
