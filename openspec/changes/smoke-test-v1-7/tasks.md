# Tareas: Smoke Test v1.7.0 (Out-of-Workspace)

> [!WARNING]
> **ESTADO: ❌ CANCELADO**
> Se detectó un bug destructivo en el flujo Headless (`runInit` sobreescribe el Canvas existente). Este plan queda suspendido hasta que se complete la **Auditoría de Inconsistencias** y el fix correspondiente.

## Fase 0: Preparación Global (En este workspace)
- [ ] Navegar a `funky-cli` y ejecutar `pnpm link --global` para disponibilizar el comando `funky` globalmente respetando nuestro gestor de paquetes.

## Fase 1: Escenario Headless (SDD / PRD-First)
- [ ] Abrir un directorio externo vacío y un chat nuevo.
- [ ] Discutir con el Agente la arquitectura.
- [ ] El Agente ejecuta `funky init --template` para obtener el esqueleto del Canvas, lo edita con la información acordada y guarda los cambios en `PROJECT-CANVAS.md`.
- [ ] Ejecutar `funky init`.
- [ ] Validar que la CLI detecta el archivo, lo consume silenciosamente y hace el scaffolding sin lanzar los prompts interactivos.

## Fase 2: Escenario Interactivo (CLI Manual)
- [ ] Abrir otra carpeta externa vacía (asegurándose de que **NO** exista `PROJECT-CANVAS.md`).
- [ ] Ejecutar `funky init` manualmente.
- [ ] Responder a todos los prompts interactivos (`@clack/prompts`).
- [ ] Validar la generación exitosa del archivo `PROJECT-CANVAS.md` y de los demás archivos de scaffolding.

## Fase 3: Reporte y Cierre
- [ ] El humano vuelve a **este chat (Orquestador)** con el resultado.
- [ ] Si hay fallos, se documentan y abrimos nueva iteración. Si pasa todo, actualizamos `ORCHESTRATOR-STATE.md` marcando la tarea como ✅ Completada y consolidamos el tag v1.7.0.
