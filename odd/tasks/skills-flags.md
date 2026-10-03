# Feature: skills-flags

## Objective

`funky skills` debe poder ejecutarse sin terminal, para que un agente de IA o un script
lo invoquen con una selección explícita y reciba un código de salida fiable.

## Problem

Hoy la selección es exclusivamente interactiva. Verificado con el CLI real y stdin piped:
`p.multiselect` de clack imprime el prompt y **termina sin instalar nada**, sin error y sin
código de salida que lo indique. Es el peor tipo de fallo: un agente que corre
`funky skills` y lee exit 0 piensa que instaló.

## Scope

### In Scope

1. `--all` — instala todas las skills detectadas.
2. `-s, --skill <nombre>` — repetible, instala las indicadas.
3. `--all` y `--skill` juntos → error explícito (nunca elegir uno en silencio).
4. `--skill <desconocida>` → **error con las disponibles listadas** (decisión del usuario).
5. Sin flags y sin TTY → error con código 1 y la instrucción de usar un flag.
6. `--help` con ejemplos concretos, pensados para que un agente los lea.

### Out of Scope

- `--force` / resolución de conflictos en modo no interactivo. Es una work unit aparte
  (`skills-conflict-flags`) porque cambia el contrato de salida ante un conflicto.
- Selección por JSON para scripting avanzado.
- Cualquier otro comando del CLI.

## Design decision

**Skill desconocida = fallo, no aviso.** Decisión del usuario, y la razón es coherente con
el resto del trabajo: si `--skill sdd-releas` devuelve éxito parcial, el agente no puede
saber que no instaló lo que pidió. Es el mismo modo de fallo silencioso que eliminamos del
prompt. El error lista las skills disponibles para que el reintento sea inmediato.

**Sin TTY y sin flags = fallo, no no-op.** El código de salida deja de mentir.

## Constraints

- Strict TDD activo (runner `pnpm test`).
- El gate `tests/organization.test.js` sigue mandando: nada de aserciones de copy literal.
- Los tests de flags van en `skills.integration.test.js` (comando no interactivo); los de
  prompt siguen en `skills.interactive.test.js`.
- El path interactivo no cambia de comportamiento: mismo prompt, misma granularidad.

## Tasks

- [x] T1 — Tests del contrato de flags (RED)
- [x] T2 — `--all` / `--skill` / validación / path sin TTY (GREEN)
- [x] T3 — `--help` con ejemplos para agentes
- [x] T4 — `docs/funky-ai/skills.md`: sección de modo no interactivo

## Acceptance criteria

- [x] `--all` instala todas las skills detectadas sin preguntar nada.
- [x] `--skill <nombre>` instala solo esa skill; repetible para varias.
- [x] `--all` + `--skill` juntos falla con código 1 y un mensaje claro.
- [x] `--skill <desconocida>` falla con código 1 y lista las disponibles.
- [x] Sin TTY y sin flags falla con código 1 en vez de no-op silencioso.
- [x] Con TTY y sin flags el prompt actual no cambia.
- [x] `--help` documenta ambos flags con ejemplos ejecutables.
- [x] `pnpm test` verde, incluido el gate de organización.

## Route declaration

Ruta inline. Tres archivos (un comando, un test, un párrafo de docs), sin investigación
pendiente: el comando ya está leído y verificado, y el patrón `.option()` +
`.action(async (opts) => {})` está establecido en `assess.js` y `estimate.js`. Ningún
mandatory delegation trigger dispara.

## Verification evidence

TDD estricto, runner `pnpm test` (Vitest 4.1.10).

- **RED**: 5/6 tests nuevos fallan. Causa correcta: `error: unknown option '-s'` /
  `--all` — las flags no existían. El 6º (`--help`) falla porque el help no contiene los
  flags.
- **GREEN**: 6/6 pass.
- **Suite completa**: **36 archivos / 432 tests, 432 pass, 0 fail** (1.75s), incluido el
  gate `tests/organization.test.js`: `FRAGILE_DEBT` sigue vacío.

Cobertura nueva (6 tests en `skills.integration.test.js`): `--all`; `--skill` repetible;
skill desconocida; `--all` + `--skill`; sin TTY sin flags; `--help`.

### Cambios en los tests existentes

Este ajuste no es cosmético: el comando ahora promete algo que antes no era cierto.

El primer `describe` de `skills.interactive.test.js` ahora fija
`process.stdin.isTTY = true` (y lo restaura). Antes pasaban porque no había gate; ahora
pasan porque declaran el entorno que el comando exige. Es más honesto.

### Hallazgo sobre el test de `--help`

`addHelpText('after', ...)` **no** aparece en `command.helpInformation()`: commander lo
emite en `outputHelp()`. Un test que hubiera usado `helpInformation()` para verificar los
ejemplos habría pasado por la API interna y no habría probado lo que un agente lee. El
test captura `process.stdout.write` con un `skills --help` real.

### Evidencia funcional (CLI real, sin TTY)

| Comando | Resultado |
|---|---|
| `skills --help` | Lista ambos flags + bloque `Ejemplos` |
| `skills` (sin TTY, sin flags) | `❌ Sin terminal...` + disponibles, **exit 1** |
| `skills --skill sdd-releas` | `❌ Skills desconocidas: "sdd-releas". Disponibles: ...`, **exit 1** |
| `skills --all -s sdd-release` | `❌ --all y --skill son excluyentes`, **exit 1** |
| `skills -s sdd-release -s layout-debug` | 3 archivos creados, **exit 0** |

Antes del cambio, el caso 2 imprimía el prompt y terminaba con **exit 0 sin instalar nada**
— el peor tipo de fallo para un agente.

## Next step

Nada pendiente en esta work unit.

El hueco conocido queda para la siguiente: con flags y TTY, `funky skills` todavía pregunta
si reemplazar un archivo existente, y un agente con pseudo-TTY se quedaría colgado
esperando una tecla. Además, un conflicto con flags sale con 0 como si se hubiera instalado
todo. Todo eso es `skills-conflict-flags`.

## Requirements moved

Ninguna spec viva afectada: `skills` no tiene living spec en `openspec/specs/`. Este
documento es el registro autoritativo, igual que `odd/tasks/skills-multiselect.md`.