# Tareas: Smoke Test v1.7.0 (Out-of-Workspace)

## Fase 0: Preparación Global (En este workspace)
- [ ] Navegar a `funky-cli` y ejecutar `npm link` para que el comando `funky` quede disponible globalmente en el sistema operativo.

## Fase 1: Escenario AI-Driven (Chat Nuevo)
- [ ] Abrir un directorio externo vacío y un chat nuevo.
- [ ] Discutir con el Agente un proyecto nuevo (tipo PRD), para que defina qué stack y configuraciones usar, basándose en los inputs que va a pedir el CLI.
- [ ] Pedirle al Agente que ejecute `funky init` y llene la información (si falla la interactividad por TTY en el entorno del agente, asistir manualmente).
- [ ] Validar que el agente entienda el `PROJECT-CANVAS.md` resultante.

## Fase 2: Escenario Interactivo Manual
- [ ] Abrir otra carpeta externa vacía.
- [ ] Como humano, correr `funky init` en la terminal.
- [ ] Llenar opción por opción para sentir la Developer Experience.
- [ ] Validar la escritura en disco del Canvas.

## Fase 3: Escenario Headless
- [ ] En otra carpeta externa, ejecutar `funky init -y`.
- [ ] Comprobar que asume defaults y sale rápido.

## Fase 4: Reporte y Cierre
- [ ] El humano vuelve a **este chat (Orquestador)** con el resultado de las pruebas.
- [ ] Si hay errores, se documentan y abrimos nueva iteración. Si pasa todo, actualizamos `ORCHESTRATOR-STATE.md` marcando todo como ✅ Completado y consolidamos el tag v1.7.0.
