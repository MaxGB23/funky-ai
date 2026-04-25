# 📝 Auditoría de Templates - Funky CLI (v1.7)

**Contexto:** Análisis detallado de los templates del directorio `funky-cli/src/templates/bootstrap/` para el rediseño de `funky init` y `PROJECT-CANVAS.md`.

---

## 1. `ORCHESTRATOR-STATE.md`
- **Propósito principal:** Actuar como el "archivo canónico de estado" de la sesión activa. Emula la memoria a corto plazo del proyecto, llevando el tracking de tareas pendientes/completadas, rama, versión y próximos pasos.
- **Público objetivo:** Principalmente el **Orquestador** (para el Session Bootstrap al inicio), aunque también es leído por el **Worker** para obtener el contexto de la tarea.
- **Dependencias cognitivas:** Necesita conocer el contexto efímero de la sesión de trabajo: feature en curso, tareas inmediatas, estado del respositorio y hallazgos recientes o preferencias que deban persistirse durante la iteración.

## 2. `agents-rules-engram-protocol.md`
- **Propósito principal:** Define el protocolo de lectura y escritura estructurada para la "memoria persistente" (Falso Engram) en `docs/engram/`. Previene repeticiones, dicta cómo documentar bugs, descubrimientos y arquitecturas bajo un esquema estandarizado (What/Why/Where/Learned).
- **Público objetivo:** Regla global interpretada por **ambos** (Orquestador y Worker) cuando el trigger glob `docs/*` o `docs/**/*` es activado.
- **Dependencias cognitivas:** Conocimiento sobre el esquema jerárquico de `docs/engram/`, formatos específicos como el schema de Engram y el Return Envelope de los Workers en `report.md`.

## 3. `agents-rules-sdd-orchestrator.md`
- **Propósito principal:** Es el manual central arquitectónico que dicta la dualidad de la IA: Modo Orquestador (para planificación Spec-Driven) y Modo Worker (para ejecución). Establece la obligación de crear especificaciones manuales en `openspec` y delegar explícitamente vía el humano debido a la falta de delegación autónoma.
- **Público objetivo:** **El LLM (Orquestador y Worker)**. Se activa mediante `model_decision` en tareas de planificación o cuando se pide explícitamente.
- **Dependencias cognitivas:** Requiere entender la diferencia conceptual entre planificar (no codificar) y ejecutar, así como el protocolo manual de delegación, escalado de tareas y la inicialización correcta del contexto.

## 4. `agents-rules-secops.md`
- **Propósito principal:** Documentar y forzar las reglas de SecOps y Hardening para NodeJS. Obliga el uso exclusivo de `pnpm`, deshabilita post-scripts, prohíbe el uso de prefijos de versión flexibles (`^` o `~`), y mitiga riesgos de supply chain (typosquatting).
- **Público objetivo:** **Orquestador y Worker** que estén instalando dependencias, haciendo scaffolding o alterando ecosistemas de NPM.
- **Dependencias cognitivas:** Requiere conocimiento profundo de comandos de `pnpm`, manejo de `package.json`, configuraciones de NPM y riesgos de seguridad en dependencias front/back.

## 5. `plantilla-worker-handoff.md`
- **Propósito principal:** Template fundamental que estructura las misiones delegadas a un Worker LLM. Fuerza al worker a seguir 3 pasos: Inyectar contexto de forma segura (Safe-Contexting), ejecutar acciones limitadas a su scope (sin exploración lateral) y completar un Return Envelope al final.
- **Público objetivo:** El **Orquestador** (que lo llena para delinear el trabajo) y el **Worker** (que lo lee como su instrucción de ejecución).
- **Dependencias cognitivas:** Necesita contexto sobre el estado actual (`ORCHESTRATOR-STATE.md`), memoria pasada (`docs/engram/`), y los archivos exactos a modificar descritos en la tarea. Además, debe saber utilizar skills estandarizadas o `context7` antes de codear.
