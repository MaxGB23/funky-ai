# Checklist de Refactor (Templates de funky-ai)

> **Objetivo:** Ejecutar ordenadamente las correcciones identificadas en `funky-phases.md`, `observaciones.md` y `risk-patterns-propuesta.md` para eliminar el síndrome de "Split Brain" y definir claramente la responsabilidad de cada fase.

## 1. Fase Canvas (`docs/funky-ai/canvas/init-prompt.md`)
> **Alcance y Criterio de Éxito:** El prompt debe quedar estrictamente como un recolector pasivo de requerimientos (El QUÉ). 
> 🛑 **PROHIBIDO:** Juzgar decisiones técnicas o buscar incompatibilidades (eso le corresponde a **assess**), ni estimar costos (eso le corresponde a **estimate**).

- [x] **Limpiar evaluación:** Eliminar completamente la instrucción de hacer una "Evaluación holística" (buscar incompatibilidades, sobreingeniería, subdimensionamiento). *(Ref: `observaciones.md` Punto 4)*
- [x] **Redefinir rol:** Limitar explícitamente el rol del prompt a ser un "Asistente de llenado" pasivo (asegurar que todas las secciones del brief y los canvases se completen correctamente sin huecos). *(Ref: `funky-phases.md` Fase 1)*
- [x] **Proteger decisiones previas:** Añadir la regla: *"Las decisiones marcadas con `✅ Aprobado` son decisiones cerradas en sesiones anteriores. No las re-abras ni las cuestiones."* *(Ref: `observaciones.md` Punto 1)*

## 2. Fase Assess (`docs/funky-ai/assess/assess-prompt.md`)
> **Alcance y Criterio de Éxito:** El prompt debe consolidarse como el único juez técnico implacable (El CÓMO), buscando fallas que romperían el sistema.
> 🛑 **PROHIBIDO:** Sugerir buffers de tiempo/costo o evaluar seniority del equipo (eso le corresponde a **estimate**), ni modificar el `risk-patterns.md`.

- [x] **Asumir trono arquitectónico:** Consolidarlo como el *único* lugar donde se evalúan fallas estructurales y coherencia técnica (El CÓMO). *(Ref: `funky-phases.md` Fase 2)*
- [x] **Depurar cruces con estimate:** Eliminar cualquier instrucción que pida evaluar la "senioridad del equipo" o la "complejidad operativa/costos". *(Ref: `observaciones.md` Punto 2)*
- [x] **Instrucción de frontera:** Añadir la nota explícita: *"No levantes como riesgo el costo o esfuerzo extra de implementar requerimientos complejos (eso lo cubren los flags de estimate). Tu único trabajo es validar si la arquitectura soporta los requisitos técnicos sin romperse."* *(Ref: `observaciones.md` Punto 2)*
- [x] **Feedback loop de patrones:** Modificar la sección de Cierre para instruir a la IA a proponer verbalmente al usuario nuevos patrones candidatos, reafirmando que no debe escribir ni editar el archivo `risk-patterns.md`. *(Ref: `observaciones.md` Punto 3)*
- [x] **Patch de Canvases (Mantener SSOT):** Instruir a la IA que si detecta una falla crítica y el humano aprueba la solución, **DEBE modificar** el `PROJECT-CANVAS.md` o `INFRA-CANVAS.md` original, y usar `architecture-decisions.md` como changelog/bitácora para justificar los cambios hechos. *(Ref: `funky-phases.md` Fase 2 / `observaciones.md` Punto 2)*
- [x] **Tratamiento de Decisiones Aprobadas:** Añadir la regla de que debe respetar las decisiones marcadas con `✅ Aprobado`, con una única excepción: *solo* puede re-abrirlas si detecta una incompatibilidad estructural crítica con el resto de la arquitectura. *(Ref: `observaciones.md` Punto 1)*
- [x] **Auditoría Estructural de Complejidad:** Instruir al prompt para que no ignore patrones complejos (ej. multi-tenancy, concurrencia, integraciones), sino que los audite activamente buscando bugs arquitectónicos graves (ej. falta de aislamiento de datos), recordando que el costeo lo hará estimate. *(Ref: `observaciones.md` Sección Patrones / `funky-phases.md` Fase 2)*

## 3. Patrones de Riesgo (`docs/funky-ai/assess/risk-patterns.md`)
> **Alcance y Criterio de Éxito:** Transformar el archivo de una lista plana a un framework estructurado por los 4 ejes de riesgo arquitectónico.
> 🛑 **PROHIBIDO:** Ser usado como temario de discusión al inicio (sesga a la IA) o ser editado dinámicamente por la IA.

- [x] **Reestructurar documento:** Cambiar la estructura actual de lista plana y agrupar los riesgos bajo los **4 Ejes de Validación Arquitectónica**: *(Ref: `risk-patterns-propuesta.md`)*
  - Eje 1: Sobreingeniería.
  - Eje 2: Decisión de datos incorrecta.
  - Eje 3: Incompatibilidades estructurales.
  - Eje 4: Hipótesis de negocio dudosas.
- [x] **Clarificar su uso:** Añadir la aclaración de que el archivo se lee al final como un *checklist de completitud interno* (para no sesgar el análisis) y que es estrictamente *Read-Only*. *(Ref: `observaciones.md` Punto 3 / `risk-patterns-propuesta.md`)*

## 4. Fase Estimate (`docs/funky-ai/estimate/estimate-prompt.md` y `pricing-guide.md`)
> **Alcance y Criterio de Éxito:** El prompt debe cobrar el esfuerzo de implementar la complejidad técnica previamente validada (El CUÁNTO).
> 🛑 **PROHIBIDO:** Reevaluar si la arquitectura es correcta o debatir el stack técnico elegido (eso ya lo validó **assess** y se definió en **canvas**).

- [x] **Respetar la arquitectura:** Reforzar que `estimate` asume las decisiones arquitectónicas como ya validadas y se limita a cobrar el esfuerzo de las mismas. *(Ref: `funky-phases.md` Fase 3)*
- [x] **Refactorizar inyectables de Flags (Prompt Augmentation):** Modificar los bloques HTML de los `topics` según el contenido definido en `flags-propuestas.md`: *(Ref: `observaciones.md` Punto 5 / `flags-propuestas.md`)*
  - [x] Añadir **señales de severidad** (leve vs. alto) a cada topic para que el LLM pueda posicionarse dentro del rango del buffer sin inventarlo. *(Ref: `flags-propuestas.md` §Criterio de diseño)*
  - [x] Añadir una **instrucción activa** al final de cada bloque con el guion de preguntas de calibración específico por flag. *(Ref: `flags-propuestas.md` — un bloque por flag)*
  - [x] **Ajustar rangos de buffer** en los topics según su riesgo real, en lugar del rango genérico (10-25%). Aplicar los siguientes pesos definidos en `flags-propuestas.md`:
    - `--roles`: N/A (Solo calculadora base)
    - `--security`: +10% a +25%
    - `--integrations`: +10% a +30%
    - `--multi-tenant`: +15% a +30%
    - `--concurrency`: +15% a +35%
    - `--transactions`: +20% a +40% (El rey del riesgo)
- [x] **Estructura de Cotización (Base vs TCO):** Instruir al prompt para que desglose claramente la cotización separando: 1) Costo Base del MVP, 2) Buffers de Riesgo (flags), y 3) TCO recurrente mensual (como rubro separado). *(Ref: `funky-phases.md` Fase 3)*
- [x] **Variables de Negocio y Salida:** Asegurar que el prompt evalúe explícitamente el modelo de pricing (Fixed vs T&M) y el contexto geográfico, y que registre el desglose final en `pricing-decisions.md`. *(Ref: `funky-phases.md` Fase 3)*
- [x] **Buffers de interacción entre flags de alto riesgo:** Añadir en `pricing-guide.md` §5 (Buffers de Contingencia) la regla: cuando se activan ≥2 flags del grupo `--transactions`, `--multi-tenant`, `--concurrency`, aplicar un escalón adicional al buffer combinado y justificarlo. Los buffers individuales son aditivos pero la complejidad de estas combinaciones es multiplicativa. *(Ref: `flags-propuestas.md` §Nota interacciones multiplicativas)*
- [x] **Resumen narrativo de cierre en `pricing-decisions.md`:** Añadir al template un bloque de cierre e instruir al `estimate-prompt.md` para que lo genere al final del documento. Reglas críticas de la instrucción:
  - [x] El resumen documenta **solo lo que ocurrió en el flujo real de las 3 fases** (canvas → assess → estimate). No usa elementos genéricos de plantilla. Si un proyecto no activó ninguna flag, el resumen no menciona buffers.
  - [x] **Cierre de tabla MVP:** síntesis de las decisiones tomadas en la sesión: modelo de pricing elegido y su justificación, variables de negocio que influyeron en el número (solo las que se discutieron), y flags activas con su buffer y razonamiento. Si no hubo flags, se omite esa sección.
  - [x] **Cierre de tabla TCO:** solo si se discutió el costo operativo. Qué cubre, quién lo paga y bajo qué condición escala. Si el proyecto no tiene TCO relevante (ej. CRUD con localStorage), se omite o se declara explícitamente que no aplica.

---

## RESUMEN DE ALCANCE POR FASE, QUÉ DEBE HACER Y QUÉ NO ENTRA EN SU FUNCIÓN

> Extraído de `funky-phases.md`. Referencia para validar que ningún checklist item invada el territorio de otra fase.

### Fase 1 — `canvas` (El QUÉ)

**Hace:** Definir el producto (brief), el stack técnico (PROJECT-CANVAS) y las decisiones operativas (INFRA-CANVAS). Registrar correcciones aprobadas con `✅ Aprobado`.

**NO hace:** Evaluar coherencia entre decisiones · Estimar costos · Levantar riesgos operativos o buffers.

---

### Fase 2 — `assess` (El CÓMO)

**Hace:** Leer brief + canvases como sistema único. Auditar bajo los 4 ejes:
1. Incompatibilidades estructurales (bugs, deploy roto, bloqueos de escala).
2. Sobreingeniería (stack que excede el volumen y KPIs del brief).
3. Decisiones de datos incorrectas.
4. Hipótesis de negocio dudosas.

Valida viabilidad técnica de requisitos complejos (multi-tenancy, concurrencia, seguridad). Parchea los canvases si detecta falla crítica (con aprobación del humano). Usa `risk-patterns.md` al FINAL como checklist de completitud (read-only, no lo edita).

**NO hace:** Definir buffers de tiempo/costo · Evaluar seniority o composición del equipo · Re-abrir decisiones `✅ Aprobado` salvo incompatibilidad estructural directa.

**Criterio clave:** Si el problema produce un bug o diseño fundamentalmente roto → es de `assess`. Si agrega costo o complejidad operable con un buffer → es de `estimate`.

---

### Fase 3 — `estimate` (El CUÁNTO)

**Hace:** Leer brief, canvases y `architecture-decisions.md`. Definir modelo de pricing (Fixed vs T&M). Evaluar variables de negocio (geografía, tamaño empresa, CapEx/OpEx, ROI). Estimar costo base del MVP. Calcular TCO como rubro separado. Aplicar buffers por flag para **cobrar el esfuerzo** de las arquitecturas complejas ya validadas por `assess`.

**NO hace:** Re-validar decisiones arquitectónicas · Re-debatir stack o patrón · Evaluar coherencia brief ↔ canvas · Modificar canvases ni `architecture-decisions.md`.

---

### Mapa de responsabilidades cruzadas

| Tema | canvas | assess | estimate |
|---|---|---|---|
| Definir producto y stack | ✅ | — | — |
| Coherencia brief ↔ canvas | — | ✅ | — |
| Sobreingeniería del stack | — | ✅ | — |
| Incompatibilidades arquitectónicas | — | ✅ | — |
| Multi-tenancy | ✅ Define si aplica | ✅ Valida patrón (ej. RLS) | ✅ `--multi-tenant` cobra esfuerzo |
| Seguridad y auth | ✅ Define requisito | ✅ Valida que el provider embone | ✅ `--security` buffer de costo |
| Concurrencia / workers | ✅ Define si hay volumen | ✅ Valida diseño asíncrono | ✅ `--concurrency` buffer de costo |
| Integraciones externas | ✅ Lista de APIs | ✅ Valida rate limits y webhooks | ✅ `--integrations` buffer de costo |
| Observabilidad / E2E testing | — | — | ✅ `--observability`, `--e2e-testing` |
| Seniority y equipo | — | — | ✅ `--roles` |
| Costo base del MVP | — | — | ✅ |
| Buffers de contingencia | — | — | ✅ |
| TCO recurrente | — | — | ✅ |