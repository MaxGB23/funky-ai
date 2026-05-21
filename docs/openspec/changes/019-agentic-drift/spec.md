# Spec: CLI Stateful Wizard (Agentic Drift Prevention)

## 1. Requerimientos Funcionales
- **Prompt Interactivo:** `funky feature <name>` debe iniciar una sesión interactiva (`@inquirer/prompts`) solicitando el Tier (T1, T2, T3, T4).
- **Máquina de Estados (REPL):** Después de inyectar los archivos iniciales según el Tier, el CLI entra en un bucle interactivo esperando comandos del usuario (`next`, `status`, `exit`, `help`).
- **Inyección por Fases:**
  - `T1`: Inyecta `tasks.md`, `worker-handoff.md`, `report.md` en una sola acción y finaliza.
  - `T2/T3`: Inyecta `explore.md`. En cada comando `next`, avanza a la siguiente fase (`proposal.md` → `spec.md` → `tasks.md` + (`worker-handoff.md` + `report.md`)).
  - `T4`: Muestra un mensaje para usar `funky gentle` y sale con código 0.
- **Template Composition:** El CLI debe buscar marcadores `<!-- T3:* -->` y `<!-- T1:REMOVE -->` en los templates y modificarlos en memoria según el Tier elegido antes de guardarlos a disco.
- **Recuperación:** Al recibir `funky feature --resume <name>`, el CLI debe leer `.funky-session.json` de la carpeta de la feature y restaurar el REPL en la fase correspondiente.

## 2. Requerimientos No Funcionales
- **Persistencia de Estado:** El archivo `.funky-session.json` debe crearse en `docs/openspec/changes/<name>/` y actualizarse atómicamente tras cada fase completada.
- **Fallback de Templates:** La lógica actual que prioriza `.agents/templates/sdd/` sobre los templates por defecto del CLI debe mantenerse intacta para la nueva función `injectTemplate`.
- **Limpieza de Marcadores:** Todos los marcadores residuales `<!-- T*:* -->` deben ser removidos del archivo final, independientemente del Tier.

## 3. Casos Borde (Edge Cases)
- **Ejecución duplicada:** Si el usuario ejecuta `funky feature <name>` y la carpeta ya existe con un `.funky-session.json`, el CLI debe mostrar un error explicativo: *"La feature ya está en curso. Usa --resume <name> para continuar"*.
- **Cierre Forzoso:** Si se interrumpe el proceso (`Ctrl+C`), el estado de la última fase completada debe estar íntegro en `.funky-session.json`.
- **Falta de Protocolos:** Si el CLI intenta inyectar un protocolo T3 (ej. `nfr-analysis.md`) y el archivo no existe, debe advertir con un warning y omitir el bloque, en lugar de crashear.

## 4. Criterios de Aceptación
1. El comando `funky feature test-t2` avanza secuencialmente fase por fase únicamente mediante el comando `next` en el REPL.
2. Al ejecutar con Tier T3, el `explore.md` generado incluye físicamente las secciones de NFR y Devil's Advocate en los lugares donde estaban los marcadores.
3. Al ejecutar con Tier T1, se genera únicamente el `tasks.md`, `worker-handoff.md` y `report.md`, y el `tasks.md` está simplificado (sin fases intermedias ni prerequisitos).
4. El comando `--resume` restaura la máquina de estados y permite continuar con el comando `next`.
