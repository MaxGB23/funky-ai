# Tier 1 Delegation Router

SDD tier 1 no contiene artefactos, únicamente se hace una exploración con un sabueso Route A, y con dichos hallazgos se genera un tasks.md. Dicho tasks.md es ejecutado por un funky-worker.

## 1. Tasks adaptado a Tier 1

Leer el template openspec/changes/{feature_name}/tasks.md y hacer replace file content

Añade una sección final de mergeo y cierre, esta sólo es ejecutada por el orquestador, el worker no debe hacerlo. 

Sección propuesta:
## Tests de validación
- [ ] pnpm build
- [ ] pnpm lint
- [ ] pnpm test
## Mergeo y cierre
- [ ] Revisar versión actual en package.json: `cat package.json`
- [ ] `git status` — confirmar limpio
- [ ] `git add -A && git commit -m "{mensaje}"`
- [ ] `git checkout main && git merge --no-ff {branch}`
- [ ] `git tag -a {version-patch} -m "{mensaje}"`
- [ ] `git push origin main --tags`
- [ ] `git branch -d {branch}`


## 2. Apply
Invocar un subagente type "self", con la ruta al tasks.md. Debes indicarle que ejecute todas las tareas, excepto la fase de tests de validación y mergeo y cierre.

## 3. Preparación de release
Tú como orquestador ejecuta la fase tests de validación. Si fallan menciona al humano qué ha fallado, pregunta cómo lo solucionan juntos, propon alternativas como lanzar un sabueso regular para que vaya a explorar.

Una vez todo haya pasado en verde, pide confirmación para ejecutar la fase mergeo y cierre.
