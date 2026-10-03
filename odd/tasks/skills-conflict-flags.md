# Feature: skills-conflict-flags

## Objective

Que la resolución de conflictos de `funky skills` sea fiable en modo no interactivo: un
agente nunca debe quedarse colgado esperando una tecla, y nunca debe leer éxito cuando
había algo que decidir.

## Problem

`skills-flags` dejó el comando scriptable pero conservó el manejo de conflictos del modo
interactivo. Tres fallos reales:

1. **Cuelgue.** La condición era `else if (!interactive)`, así que con flags **y** terminal
   se preguntaba. Muchos harnesses dan un pseudo-TTY al comando: `isTTY === true` sin que
   haya nadie. El proceso espera una tecla que no llega hasta el timeout.
2. **Exit 0 sin resolver.** Un conflicto con flags avisaba por `console.warn` y salía con 0.
   El agente leía "instalé" sin haber instalado. Es el mismo modo de fallo que el prompt
   original, en otra forma.
3. **No hay forma de actualizar.** `overwrite` solo se activaba dentro de
   `if (interactive)`. Un agente con `--all` en un repo ya configurado nunca podía
   actualizar una skill.

`process.stdin.isTTY` contesta "¿hay terminal?", no "¿hay alguien?". Son distintos, y en el
caso de los agentes la diferencia es exactamente el cuelgue.

## Scope

### In Scope

1. `--force` reemplaza sin preguntar, declara qué descarta, y funciona con y sin TTY.
2. El conflicto con flags pasa de `console.warn` + exit 0 a `console.error` + exit 1.
3. El prompt solo se abre con TTY **y** sin flags.
4. Un archivo byte-idéntico al distribuido no es conflicto (idempotencia).

### Out of Scope

- `--yes` / `--dry-run`.
- Any other command.

## Design decision

**Preguntar solo si hay TTY y no pasó ninguna flag.** Es la única combinación que significa
"persona al frente". Sin TTY ya se exige una flag (error), y con flag nunca se pregunta, así
que un agente siempre cae en la rama que no pregunta.

**El conflicto con flags es error, no aviso.** Decisión del usuario. Un exit 0 con archivos
sin tocar hace creer al agente que instaló. El mensaje ofrece las dos salidas: `--force`
reemplaza, o ignorar el error mantiene — "mantener" no requiere ninguna acción.

**El error se emite DESPUÉS de `executeIntentions`.** Los faltantes no son conflicto y se
crean igual. Si abortara antes, un repo a medias se quedaría a medias para siempre.

**Idempotencia por comparación de bytes.** Un archivo idéntico no tiene nada que
sobrescribir ni que perder. `isUpToDate` devuelve `false` ante error de lectura: afirmar que
algo está actualizado sin poder comprobarlo es el peor default para un comando que escribe
en disco. Lo desconocido se trata como conflicto.

## Constraints

- Strict TDD activo (runner `pnpm test`).
- Gate `tests/organization.test.js`: nada de aserciones de copy literal.

## Tasks

- [x] T7 — `--force`: reemplazar sin preguntar, declarando qué descarta
- [x] T8 — Conflicto con flags = error + invariante de no-preguntar
- [x] T9 — Idempotencia: archivo idéntico no es conflicto
- [x] T10 — `docs/funky-ai/skills.md`: tabla de los tres caminos + idempotencia

## Acceptance criteria

- [x] `--force` reemplaza sin preguntar, en ambos modos, declarando qué descarta.
- [x] Con flags, un conflicto falla con código 1 y ofrece `--force` o mantener.
- [x] Con flags nunca se pregunta, aunque haya TTY (agente con pseudo-TTY).
- [x] Un archivo idéntico al distribuido no es conflicto: la ruta con flags es idempotente.
- [x] `--force` sin conflictos no inventa avisos.
- [x] `pnpm test` verde, incluido el gate de organización.
- [x] Verificado en terminal real con pty: sin cuelgue, idempotencia confirmada fuera de los tests.

## Route declaration

Ruta inline. Un comando, dos tests y un párrafo de docs; el comando ya estaba leído y
verificado por la work unit anterior. Ningún mandatory delegation trigger dispara.

## Verification evidence

TDD estricto, tres ciclos, runner `pnpm test` (Vitest 4.1.10).

### Ciclo T7 — `--force`
- RED: 5/5, causa raíz `error: unknown option '--force'`.
- GREEN: 5/5. Suite: 36 archivos / 437 tests.
- Cobertura: reemplaza sin TTY; declara qué reemplaza; no inventa avisos si no hay conflicto;
  sin `--force` conserva; `--force` con TTY salta el prompt; `--help` lo lista.

### Ciclo T8 — conflicto como error
- RED: 4/4 con `promise resolved ... instead of rejecting` — hoy sale con exit 0.
- GREEN: 4/4. Suite: 36 archivos / 440 tests.
- Cobertura: conflicto da exit 1 sin `--force`; el mensaje nombra el archivo y ofrece ambas
  salidas; **con TTY pero con flags tampoco pregunta** (el caso del agente con pseudo-TTY);
  conflicto + faltantes instala los faltantes igual y después falla.

Un test previo afirmaba el contrato viejo ("avisa por `console.warn`") y se actualizó porque
el contrato cambió a propósito, no por descuido.

### Ciclo T9 — idempotencia
- RED: 3/3 (`❌ 2 archivo(s) ya existen...` incluía el archivo idéntico).
- GREEN: 3/3. Suite final: **36 archivos / 443 tests, 443 pass, 0 fail** (1.77s).
- Cobertura: el idéntico sale con 0; se declara "versión más reciente"; en un mixto solo se
  reporta el que difiere.

### Evidencia funcional del ciclo de vida

Sobre un directorio real, con un `SKILL.md` editado a mano:

| Paso | Exit | Resultado |
|---|---|---|
| `-s sdd-release` | 0 | 2 creados |
| repetir sin cambios | **0** | `ℹ️ 2 archivo(s) ya están en la versión más reciente` |
| editar el SKILL.md y repetir | **1** | `❌ 1 archivo(s) ya existen...` |
| `-s sdd-release --force` | 0 | `⚠️ --force: reemplazando 2` + `✅ Actualizada` |
| repetir | **0** | Idempotente de nuevo |

Ningún paso abre un prompt: el agente no puede colgarse.

**Verificado en terminal real (2026-10-03).** El usuario ejecutó el ciclo completo desde una
terminal con pty, en un repo ya instalado, y probó varios edge cases:

- `funky skills -s layout-debug` en repo ya sincronizado: `ℹ️ 1 archivo(s) ya están en la
  versión más reciente`, exit 0. Confirma la idempotencia de T9 fuera de los tests.
- Ningún prompt bloquea: ni en la ruta con flags ni en la interactiva.
- Sin fricción observada en los casos probados.

Esto cierra el hueco que la suite no podía cubrir. Los tests siguen siendo la prueba del
camino de código; la terminal real es la prueba de que no hay espera.

## Next step

Nada pendiente en código ni en verificación. Commits `bf072c3` y `98a1ac9` en `main` local,
sin pushear (push es decisión del usuario).

## Requirements moved

Ninguna spec viva afectada: `skills` no tiene living spec en `openspec/specs/`. Este
documento es el registro autoritativo del contrato de conflictos en modo scriptable.