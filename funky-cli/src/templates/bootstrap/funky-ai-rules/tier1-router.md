---
trigger: model_decision
description: Leer obligatoriamente antes de CUALQUIER delegación a un subagente Tier 1 (nueva fase, reintento o feedback).
---

# Tier 1 Delegation Router

SDD tier 1 no contiene artefactos, únicamente se hace una exploración con un sabueso Route A, y con dichos hallazgos se genera un tasks.md. Dicho tasks.md es ejecutado por un funky-worker.

## 1. Tasks adaptado a Tier 1

Leer el template openspec/changes/{feature_name}/tasks.md y hacer replace file content

Añade una sección final de mergeo y cierre (inyectar al final del tasks.md generado). Esta sólo es ejecutada por el orquestador, el worker no debe hacerlo:

---
> 🔴 **STOP — WORKER PARA AQUÍ. Las siguientes secciones son exclusivas del Orquestador. No las ejecutes.**
---
## Tests de validación
- [ ] pnpm lint
- [ ] pnpm test
- [ ] pnpm build

## Mergeo y cierre
- [ ] Revisar versión actual en package.json: `cat package.json`
- [ ] Bumpar versión en package.json
- [ ] Actualizar ORCHESTRATOR-STATE.md
- [ ] `git status` — confirmar limpio
- [ ] `git add -A && git commit -m "{mensaje}"`
- [ ] `git checkout main && git merge --no-ff {branch}`
- [ ] `git tag -a {version-patch} -m "{mensaje}"`
- [ ] `git push origin main --tags`
- [ ] `git branch -d {branch}`


## 2. Apply
**CHECKPOINT PRE-APPLY EN TODOS LOS MODOS**: Incluso en modo Auto muestra resumen de las decisiones tomadas y solicita aprobación humana antes de iniciar la ejecución de Apply. **OBLIGATORIO:** Pregunta explícitamente al usuario si desea ejecutar vía nativa (CLI con subagentes) o vía Handoff (copiar/pegar para el IDE).
Una vez aprobado:
Invocar un subagente type "self" o copy-paste listo para IDE, con la ruta al tasks.md. Debes indicarle que ejecute todas las tareas, excepto la fase de tests de validación y mergeo y cierre. 

## 3. Preparación de release
Tú como orquestador ejecuta la fase tests de validación. Si fallan menciona al humano qué ha fallado, pregunta cómo lo solucionan juntos, propon alternativas como lanzar un sabueso regular para que vaya a explorar.

Una vez todo haya pasado en verde, pide confirmación para ejecutar la fase mergeo y cierre.