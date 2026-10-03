# Feature: skills-multiselect

## Objective

`funky skills` debe permitir instalar **cualquier subconjunto** de skills en una sola
interacción, conservando la vía rápida de "instalar todo" en un solo Enter.

## Problem

El instalador usa `p.select` (`skills.js:101`): el usuario elige **una** skill o "Todas".
Con 4 skills distribuibles, elegir 3 exige cancelar y reintentar 3 veces.

Este diseño **ya fue un multiselect** (v4.2.0) y se revirtió en v4.3.2. La causa raíz del
revert no fue el multiselect: era `required: false`, que en `@clack/prompts` 1.7.0 deja
submitir `[]` en silencio con un Enter directo (el CLI respondía "No seleccionaste ninguna
skill" aunque el usuario creyera haber seleccionado). Reproducido con harness sobre el
core de clack en aquella sesión.

## Scope

### In Scope

1. `skills.js` — `p.select` → `p.multiselect` con `initialValues` = todas (skillselected).
2. Tests del contrato: selección parcial, "Todas" como estado inicial, `required` no desactivado.
3. `docs/funky-ai/skills.md` — la sección de selección describe `select` (línea 32).
4. `fs-adapter.js` — campo opcional `label` para los logs (extensión, no cambio de contrato).
5. `console.log('🚀 Instalando skills y docs compartidos SDD...')` → sin "SDD".

### Out of Scope

- Cambios en `runSkills()`: ya acepta `selectedSkills` como array (`skills.js:64`).
- Confirmación en un segundo paso (botón "Continuar" explícito).
- Flags no interactivos (`--all`, `--skill`) para uso sin TTY.
- Retirada de SDD / migración de `openspec/` (trabajo separado del usuario).

## Design decision

**Revisión v2 (2026-10-03): nada preseleccionado + «Todas» como opción con precedencia.**

La v1 de este doc propuso «Todas» como *estado inicial* (`initialValues: available`).
Se descartó: el valor por defecto del instalador pasó a ser "instalar todo", que es lo
contrario de opt-in, y el usuario que no lee el hint e pulsa Enter se lleva las 4 skills
sin haberlo decidido. Un instalador debe fallar hacia "no instala nada", nunca hacia
"instala de más". El argumento "un Enter instala todo igual de rápido" solo favorece a
quien ya iba a instalar todo, así que no era un argumento.

Diseño final:

- El prompt **no preselecciona nada**. Un `Enter` sin marcar lo bloquea el propio prompt,
  que además enseña la tecla en su mensaje. El error va hacia "no instala".
- **«Todas»** es la primera opción de la lista. Instalar todo = Espacio + Enter, dos teclas.
- **Precedencia: ganan las skills marcadas.** «Todas» significa "todo" solo cuando es la
  única elección; si además se marcaron skills concretas, la decisión explícita prevalece y
  desmarcar una sí la excluye. Por construcción nunca se copia más de lo marcado.

| Marcaste | Instalas |
|---|---|
| solo «Todas» | todas |
| «Todas» + 2 concretas | esas 2 |
| «Todas» + todas | todas |
| 2 concretas, sin «Todas» | esas 2 |
| nada | nada (exit 1) |

La propiedad que lo justifica: el fallo posible va hacia **"instalé menos"**, no hacia
"instalé de más". Para un comando que escribe en disco, ese es el sesgo correcto.

Resucita el patrón de v4.2.0 (centinela «Todas»), que nunca fue el problema del revert: la
causa raíz fue `required: false`.

**`required` se omite a propósito** (default `true` en 1.7.0). Verificado en el paquete
instalado: `dist/index.mjs:642` (`required = opts.required ?? true`) y `dist/index.mjs:652-665`
(`validate` bloquea la submisión vacía con "Please select at least one option.").

## Constraints

- Strict TDD activo (`funky-cli` tiene runner Vitest: `pnpm test`).
- Gate mecánico `tests/organization.test.js`: `FRAGILE_DEBT` debe quedar vacío. Prohibido
  `toContain` / `toHaveBeenCalledWith` con literal de copy. Las aserciones de conteo con
  `${...}` sí son estructurales (permitidas).
- `skills.interactive.test.js` es categoría interactiva: cap de 800 líneas, sin límite de
  imports de comandos.
- No commitear sin autorización explícita del usuario en el turno actual.

## Tasks

- [x] T1 — Tests del contrato multiselect (RED)
- [x] T2 — `skills.js`: `p.multiselect` sin preselección, con centinela «Todas» y regla de precedencia (GREEN)
- [x] T3 — `docs/funky-ai/skills.md`: sección de selección al día
- [x] T4 — Logs: quitar la etiqueta SDD e identificar cada archivo en create/skip
- [x] T5 — Conflictos: preguntar una vez por skill qué se sobrescribe y qué falta
- [x] T6 — `docs/funky-ai/skills.md`: sección de conflictos y comportamiento sin TTY

## Acceptance criteria

- [x] El usuario puede instalar cualquier subconjunto de skills en una sola interacción.
- [x] El prompt no preselecciona nada: un `Enter` sin marcar no instala.
- [x] «Todas» es una opción explícita y es la vía rápida a instalar todo.
- [x] Marcar skills concretas gana sobre «Todas»: desmarcar una sí la excluye.
- [x] El instalador nunca copia más skills que las marcadas.
- [x] Un archivo existente requiere confirmación; el default es conservarlo.
- [x] El aviso nombra los archivos a sobrescribir y los faltantes de esa skill.
- [x] Un faltante se instala siempre: no es conflicto, no se pierde nada.
- [x] La decisión es por skill: nunca queda un SKILL.md nuevo junto a docs viejos.
- [x] Cancelar (Esc/Ctrl+C) sale con código 1 sin escribir archivos.
- [x] Una skill nueva con `SKILL.md` + `manifest.js` sigue instalable sin tocar código.
- [x] `pnpm test` verde, incluido el gate `organization.test.js`.

## Route declaration

| Task | Route | Trigger |
|------|-------|---------|
| T1 | inline | 1 archivo, test ya leído y entendido, sin investigación pendiente |
| T2 | inline | 1 archivo, mechanical: un prompt y una línea de derivación |
| T3 | inline | 1 párrafo de doc, cambio mechanical ya RED/T1 paralelo |

Ninguno dispara writer trigger (2+ archivos no triviales): el cambio está confinado a un
archivo de código, uno de test y un párrafo de doc. Evidence budget respetada: el código
ya estaba leído y verificado antes de editar.

## Task notes

### T4 — Logs legibles: quitar la etiqueta SDD e identificar cada archivo (GREEN)

Dos observaciones del usuario sobre la salida real:

1. `🚀 Instalando skills y docs compartidos SDD...` — la etiqueta "SDD" no corresponde
   a las skills, que son personales.
2. `⚡ Omitiendo (ya existe): SKILL.md` repetido cuatro veces, sin decir de qué skill.

**El `basename` del log de skip es un contrato deliberado, no un descuido**: decisión 2.8,
con golden snapshot (`tests/__snapshots__/fs-adapter.test.js.snap`) y un test que dice
"e incluye el basename". Cambiarlo en `fs-adapter.js` habría roto un contrato a propósito
y afectado a `assess`, `estimate`, `feature`, `init` y `scaffold`.

Solución: campo opcional `label` en la intención. `fs-adapter.js` usa
`label ?? basename` en los logs de skip y `label ?? dest` en los de create. **Sin
`label`, el comportamiento es idéntico** — el snapshot sigue verde, ningún otro comando
cambia. `runSkills` lo puebla con `item.dest` (ya relativo), así que en el output de
skills tanto "Creado" como "Omitiendo" quedan consistentes.

### T5 — Conflictos: preguntar por skill qué se sobrescribe y qué falta

Requisitos del usuario: cuando el destino ya existe, preguntar en vez de omitir en
silencio; nombrar lo que se va a sobrescribir (las skills de release y docs inyectan
docs adicionales); y avisar cuando la skill existe pero le faltan archivos.

**Granularidad elegida: B, una decisión por skill** (el usuario eligió entre A = un
confirm por archivo, B = por skill, C = multiselect de archivos).

Razón que decide: con A, reemplazar el `SKILL.md` de una skill conservando sus docs
compartidos deja la skill internamente inconsistente (versión nueva apuntando a
archivos de la anterior). Con una decisión por skill ese estado es imposible. Además
escala con el catálogo y no con el número de archivos, y es la única granularidad que
puede listar los archivos faltantes — que es parte del requisito.

Implementación:
- `fs-adapter.js`: campo opcional `overwrite` en la intención. Sin él el comportamiento
  es idéntico (el golden snapshot sigue verde). Con él, un destino existente se copia y
  se reporta como `✅ Actualizada` en vez de `⚡ Omitiendo`.
- `runSkills`: cada intención lleva `skill`, que es lo que permite agrupar.
- `skills.js`: agrupa por skill, separa `exists` de `missing`, y por cada skill con
  conflictos emite un `p.note` con las rutas + un `p.confirm` (default **no**). Cancelar
  el aviso equivale a "no", nunca a abortar la instalación.
- Un `src` opcional ausente no cuenta como faltante: no se distribuye, no se puede
  instalar.

## Verification evidence

TDD estricto, runner `pnpm test` (Vitest 4.1.10). Dos ciclos RED/GREEN: uno por cada
revisión del diseño.

**Ciclo 1 — «Todas» como estado inicial** (superseded)
- RED: 6/6 fail (`p.multiselect.mock.calls[0]` era `undefined`; `skills.js` aún invocaba
  `p.select`).
- GREEN: 6/6 pass.

**Ciclo 2 — nada preseleccionado + precedencia** (vigente)
- RED: 3/8 fail — `Todas: marcar «Todas»…` (el centinela no existía),
  `El prompt no preselecciona nada` (`initialValues` seguía puesto) y
  `Precedencia: …` (la regla no estaba implementada). Los otros 5 pasaron, incluido el
  guard de confirmación vacía.
- GREEN: 8/8 pass.
- Suite completa: **36 archivos / 416 tests, 416 pass, 0 fail** (1.46s), incluido
  `tests/organization.test.js`: `FRAGILE_DEBT` sigue vacío.

Cobertura en `skills.interactive.test.js` (8 tests: 5 de la v1, 3 nuevos en la v2):

1. *Cancel* — `isCancel` ⇒ exit 1, cero escrituras.
2. *Skill específica* — instala esa skill y sus docs compartidos.
3. *Todas* — marcar solo «Todas» instala todo.
4. *Subconjunto* — instala exactamente las elegidas y ninguna más.
5. *Prompt no preselecciona nada* — `initialValues` ausente y «Todas» primera opción.
6. *Precedencia* — «Todas» + 2 concretas ⇒ solo las 2. Es el test que mata la ambigüedad.
7. *Confirmación vacía* — si el prompt la dejara pasar, aborta con exit 1 sin escribir.
8. *`required` no desactivado* — fijado explícitamente para que nadie reintroduzca
   `required: false` por descuido.

Cambio de comportamiento en la ruta de cancelación: se añadió `return` tras
`process.exit(1)`. No era cosmético — con `[...selection]`, el símbolo de cancelación no
es iterable y habría lanzado `TypeError` (capturado por el `catch`, pero convierte "el
usuario canceló" en "error interno").

**Ciclo 3 — logs legibles** (vigente)
- RED: 2/41 fail — el log de create no usaba `label`, y los skips de skills salían como
  `SKILL.md` sin contexto.
- GREEN: `skills.test.js` tenía 3 `toEqual` con forma exacta de intención que hubo que
  actualizar al añadir `label` (no es un fallo de diseño: es el contrato afectado).
- El gate anti-brittle atrapó una aserción mía: `line.includes('Omitiendo')` es literal de
  copy. Corregida a `/Omitiendo/.test(line)`. El gate funciona.
- Suite completa: **36 archivos / 418 tests, 418 pass, 0 fail** (1.45s).
- `tests/__snapshots__/fs-adapter.test.js.snap` **sin modificar** → el contrato 2.8
  (basename en skip) sigue intacto.
- Evidencia funcional (no de mock): smoke de dos runs reales con las 4 skills del catálogo.
  El segundo run, donde todo ya existe, ahora emite
  `⚡ Omitiendo (ya existe): .agents/skills/layout-debug/SKILL.md` y las otras tres
  skills por su nombre. 7 omitidos, 0 creados, sin ambigüedad.

**Ciclo 4 — conflictos por skill** (vigente)
- RED: 4/37 fail — `overwrite` no reemplazaba, y los 3 escenarios de skills no
  llamaban a `p.confirm`.
- GREEN: `skills.test.js` tenía 3 `toEqual` con forma exacta que hubo que actualizar al
  añadir `skill` a la intención.
- Suite completa: **36 archivos / 426 tests, 426 pass, 0 fail** (1.53s).
- Cobertura nueva (8 tests): overwrite en el motor, y en el CLI — un prompt por skill
  (no por archivo), default conserva, "Sí" reemplaza con el contenido del src,
  skill a medias avisa el faltante y lo instala, cancelar el aviso conserva, sin TTY
  avisa sin preguntar, y una skill nueva no genera aviso ni pregunta.
- Golden snapshot sin modificar: el contrato 2.8 sigue intacto.

### Error propio corregido

Al insertar el bloque de conflictos, se anidó un `describe` dentro del `describe`
existente dejando 2 aperturas contra 1 cierre, y 3 tests de selección quedaban dentro
del bloque de conflictos (con su `beforeEach` de TTY). Se reestructuró moviendo esos
3 tests de vuelta al describe original y dejando los dos describes como hermanos de
nivel superior. Detectado leyendo el árbol de `describe`/`it`, antes de dar verde.

## Not verified

- El render real del `multiselect` (que abra vacío, la tecla de Espacio visible, el
  bloqueo de confirmación vacía) y el del aviso de conflicto (`p.note` + `p.confirm`)
  no se automatizaron: requieren TTY.
- **La rama sin TTY es defensiva, no alcanzable hoy.** Verificado con el CLI real y
  stdin piped: `p.multiselect` de clack imprime el prompt y termina sin selección, así
  que nunca se llega al aviso de conflicto. Queda por detrás de los flags no
  interactivos (`--all`, `--skill`), que están fuera de alcance de esta feature.

## Next step

Nada pendiente en código. Commit pendiente de autorización explícita del usuario
(`AGENTS.md`: autorizar el cambio no autoriza el commit).

## Requirements moved

R-SK-6 (spec archivada en `openspec/changes/archive/`) decía "selección única, ya no existe
selección vacía". Este cambio la reemplaza: ahora hay selección múltiple con la vacía
bloqueada por el prompt. `skills` **no tiene living spec** en `openspec/specs/` (solo hay
`assess`, `cli-testing`, `estimate`, `init`, `openspec`, `pipeline`, `workflow`), así que
no hay spec raíz que actualizar — este documento es el registro autoritativo del contrato.