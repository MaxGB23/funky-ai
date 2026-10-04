# funky skills — Instalador interactivo de skills

## ¿Qué problema resuelve?

`funky skills` instala las skills del ecosistema agéntico MaxGB23 dentro de `.agents/skills/` del proyecto destino, junto con los docs compartidos que usan los procesos de docs y release (docs-live-index, formato canónico de índice seccional y release-notes). Cada skill declara sus propios recursos en un manifest (`src/skills/<skill>/manifest.js`), que es la única fuente de qué archivos se instalan y a dónde (R-SK-8) — el comando no tiene listas hardcodeadas de recursos.

Sin `funky skills` ninguna skill del catálogo se distribuye al proyecto, ni se bootstrapean los docs compartidos que esos procesos esperan en `.agents/templates/sdd/`.

Todas las skills del catálogo son personales de MaxGB23. Ninguna viene de un framework ni de un paquete externo, y el instalador no las trata como esenciales: la selección interactiva permite instalar solo las deseadas.

## ¿Cuándo usarlo?

Cuando el proyecto necesite las skills de release o de docs, o los docs compartidos que ambas usan. El comando es interactivo e idempotente: los archivos existentes se skipean sin sobrescribirse (skip-if-exists), por lo que las ediciones locales sobre las golden templates se conservan.

```bash
funky skills
```

## Selección interactiva

El instalador detecta las skills disponibles bajo `src/skills/` y pregunta qué instalar con un menú de **selección múltiple** (`multiselect`). Se marca cada skill con `Espacio` y se confirma con `Enter`. Cualquier subconjunto es válido — instalar 3 de 4 es una sola interacción.

El prompt **no preselecciona nada**: el valor por defecto es no instalar. Un `Enter` sin marcar es bloqueado por el prompt, que muestra el recordatorio de la tecla, así que el error va hacia "no instala" y nunca hacia "instala de más". Para instalar todo hay que marcar la opción **Todas** (la primera de la lista) y confirmar.

**Precedencia: ganan las skills marcadas.** «Todas» significa "todo" únicamente cuando es la única elección. Si además marcas skills concretas, tu decisión explícita prevalece y desmarcar una sí la excluye. Por construcción el instalador nunca copia más de lo marcado: el fallo posible va hacia "instalé menos", que es el sesgo seguro para un comando que escribe en disco.

Cancelar (Esc/Ctrl+C) sale con código 1 sin realizar cambios, igual que una confirmación vacía si llegara a alcanzarse. El orden de instalación es determinista: alfabético por skill y luego el orden del manifest (D3).

## Modo no interactivo (CI, agentes)

Sin terminal el comando no puede preguntar qué instalar, así que **exige una selección explícita**:

```bash
funky skills --all                              # todas las detectadas
funky skills --skill release                # una sola
funky skills -s release -s layout-debug     # varias (repetible)
```

Reglas, todas con código de salida 1 y sin instalar nada:

| Situación | Por qué |
|---|---|
| Sin TTY y sin flags | No hay modo no interactivo implícito: el código de salida no miente |
| `--all` y `--skill` juntos | Se pide un subconjunto o todo, no ambos: no se elige uno en silencio |
| `--skill <desconocida>` | Un éxito parcial dejaría creyendo que se instaló lo pedido |

El mensaje de error siempre lista las skills disponibles, así el reintento no necesita un `ls`.

El conflicto con flags se reporta como error con código 1, no como aviso: ver la sección
de conflictos. Los faltantes no son conflicto y se instalan igual.

## Conflictos: reemplazar o mantener

Un archivo que ya existe es un conflicto: se perdería una edición local. El comando separa
`exists` de `missing`, y por cada skill con conflictos emite **un solo aviso** que nombra
cada archivo (`ya existe:` / `falta:`) y pregunta si se reemplazan. Default **no**; cancelar
equivale a "no", nunca a abortar la instalación.

Los faltantes nunca generan aviso de conflicto: no hay nada que perder, así que se crean
siempre. Solo aparecen listados como `falta:` para que la instalación parcial sea visible.

La granularidad es por skill a propósito: reemplazar el `SKILL.md` de una skill pero conservar
sus docs compartidos dejaría esa skill internamente inconsistente — una versión nueva
apuntando a archivos de la anterior. Con una decisión por skill ese estado es imposible. También
hace que el número de preguntas escale con el catálogo, no con su número de archivos.

Un archivo que ya existe solo es conflicto si **difiere** del que se distribuye. Si es
byte-idéntico no hay nada que sobrescribir ni que perder, así que no se pregunta ni se
falla: se informa y se sigue.

```
ℹ️ 2 archivo(s) ya están en la versión más reciente: .agents/skills/release/SKILL.md, ...
```

Eso hace que la ruta con flags sea idempotente: instalar, volver a instalar y reintentar
tras un error dan el resultado correcto sin falsos positivos. Un archivo ilegible se trata
como conflicto —no se afirma que esté actualizado sin poder comprobarlo—.

### Los tres caminos ante un conflicto

| Situación | Resultado |
|---|---|
| Sin flags (humano en terminal) | Una pregunta por skill. Default: conservar |
| Con flags, sin `--force` | **Error con código 1.** Instala lo que faltaba, conserva lo existente |
| Con `--force` | **Reemplaza** sin preguntar. Código 0 |

**Con flags nunca se pregunta.** La única combinación que abre un prompt es "hay terminal
y no pasó ninguna flag", que es la única que significa "hay una persona al frente". Esto
importa para agentes: muchos harnesses dan un pseudo-TTY al comando, así que `isTTY` es
`true` aunque no haya nadie. Preguntar en ese caso cuelga el proceso esperando una tecla que
no llega.

Sin `--force`, el conflicto se reporta como **error y no como aviso**:

```
❌ 1 archivo(s) ya existen y no se sobrescriben sin --force:
  - .agents/skills/layout-debug/SKILL.md
Usa --force para reemplazarlos por la versión nueva.
Para mantener la versión actual, ignora este error: esos archivos no se modificaron.
```

Sale con código 1 porque la intención no se satisfizo entera: un `0` haría creer a un
agente que instaló todo. El error se emite **después** de instalar, así que los archivos
que faltan —que no son conflicto— sí se crean. Si abortara antes, un repo a medias se
quedaría a medias para siempre.

`--force` es destructivo: pierde ediciones locales de los archivos reemplazados. Por eso
imprime qué archivos va a descartar:

```
⚠️ --force: reemplazando 2 archivo(s) existente(s):
  - .agents/skills/release/SKILL.md
  - .agents/templates/sdd/release-notes.md
```

Así quien lo pasa puede ver el alcance en el momento, no descubrirlo después. Es también el
reinstall limpio para quien quiere dejar las skills exactamente como se distribuyen.

Un `src` marcado como opcional que no existe no cuenta como faltante: no se distribuye, no se
puede instalar.

## Logs

Cada línea nombra la ruta del archivo (`` ⚡ Omitiendo (ya existe): .agents/skills/<skill>/SKILL.md ``), no solo su basename: con varias skills, todas traen un `SKILL.md` y el nombre solo sería ambiguo.

## Sin TTY

`funky skills` sin flags es interactivo. Sin terminal el `multiselect` no puede recoger selección, así que el comando **falla con código 1** indicando `--all` o `--skill`, en vez de imprimir el prompt y terminar sin instalar. Ver la sección de modo no interactivo.

## Autodetección de skills (R-SK-7)

`discoverSkills(srcDir)` lista los directorios bajo `src/skills/` que contienen `SKILL.md` **y** `manifest.js` con nombre exacto (case-sensitive incluso en NTFS: `skill.md` en minúsculas no cuenta). Agregar una skill nueva se reduce a crear `src/skills/<nombre>/SKILL.md` y su `manifest.js` — aparece automáticamente en la selección y es instalable desde el primer momento.

## Manifest por skill (R-SK-8)

Cada skill vive en `src/skills/<skill>/`:```
src/skills/
├── release/           # proceso de release de funky-ai
│   ├── SKILL.md
│   └── manifest.js        # SKILL.md → .agents/skills/release/
│                          # templates/bootstrap/sdd/release-notes.md → .agents/templates/sdd/ (optional)
├── docs-sync/         # proceso de docs de funky-ai
│   ├── SKILL.md
│   └── manifest.js        # SKILL.md → .agents/skills/docs-sync/
│                          # docs-live-index.md → .agents/templates/sdd/
│                          # docs-index/_indice-seccional-template.md → .agents/templates/sdd/docs-index/
├── layout-debug/          # reglas del overlay de layout, instalacion cross-project
│   ├── SKILL.md
│   └── manifest.js        # SKILL.md → .agents/skills/layout-debug/
└── layout-debug-canon/    # hechos del repo, uso diario; requiere layout-debug
    ├── SKILL.md
    └── manifest.js        # SKILL.md → .agents/skills/layout-debug-canon/
```

Cada entrada del manifest declara `src` (relativo a `src/` de funky-cli), `dest` (relativo al proyecto destino) y opcionalmente `optional: true`: si el src falta, la intención se salta con log y nunca crashea (R-SK-3).

En tiempo de instalación `runSkills()` carga el manifest de cada skill seleccionada con import dinámico (`await import(...manifest.js)`): no existe ninguna lista de manifests hardcodeada en el comando, así que una skill nueva queda instalable tan pronto como existe su carpeta con `SKILL.md` y `manifest.js` (R-SK-8).

## Docs compartidos y paridad byte a byte (R-SK-5)

Los docs compartidos viven en `src/templates/bootstrap/sdd/` — el MISMO src que usa `funky sdd install`. Así, el índice de docs vivos (`docs-live-index.md`), el template canónico del índice seccional (`_indice-seccional-template.md`) y `release-notes.md` llegan byte a byte idénticos por `funky skills` y por `funky sdd install`; no hay dos copias que divergir.

## Regla doc-nuevo en docs-sync (R-SK-11)

La skill `docs-sync` amplió sus Decision Gates: además del doc modificado clásico, ahora un **comando nuevo** (o flag nuevo) exige crear `docs/<dominio>/<comando>.md` completo, su índice seccional y su fila en `docs-live-index.md` (SSOT); también cubren capability nueva, fraccionamiento de un doc existente y estructura de docs nueva. El matching entre el índice SSOT y el árbol de docs es bidireccional: un ítem nuevo sin fila en el índice se marca como doc nuevo.

## Diagrama de flujo

`runSkills()` resuelve los manifests contra `srcDir`, expande las intenciones de copia (orden determinista) y las delega a `executeIntentions()` — que hace skip-if-exists y salta srcs opcionales ausentes. El veredicto final reporta archivos creados y skipeados.
