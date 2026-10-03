# funky skills — Instalador interactivo de skills

## ¿Qué problema resuelve?

`funky skills` instala las skills del ecosistema agéntico MaxGB23 dentro de `.agents/skills/` del proyecto destino, junto con los docs compartidos que usan los procesos de docs y release (docs-live-index, formato canónico de índice seccional y release-notes). Cada skill declara sus propios recursos en un manifest (`src/skills/<skill>/manifest.js`), que es la única fuente de qué archivos se instalan y a dónde (R-SK-8) — el comando no tiene listas hardcodeadas de recursos.

Sin `funky skills` ninguna skill del catálogo se distribuye al proyecto, ni se bootstrapan los docs compartidos que esos procesos esperan en `.agents/templates/sdd/`.

Todas las skills del catálogo son personales de MaxGB23. Ninguna viene de un framework ni de un paquete externo, y el instalador no las trata como esenciales: la selección interactiva permite instalar solo las deseadas.

### Sobre el prefijo `sdd-`

El prefijo es **legacy y engañoso**: no se refiere a spec-driven development, que este proyecto ya no usa. Las skills que lo llevan siguen describiendo procesos reales:

| Skill | Proceso que sirve |
|---|---|
| `sdd-release` | proceso de release de funky-ai |
| `sdd-docs-sync` | proceso de actualizar los docs de funky-ai |

El nombre se conserva para no alterar rutas ni referencias ya escritas en `AGENTS.md`, en la config de agentes y en release notes. Está previsto deprecarlo; cuando se haga, el nombre debe cambiar a algo que describa el proceso real.

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
funky skills --skill sdd-release                # una sola
funky skills -s sdd-release -s layout-debug     # varias (repetible)
```

Reglas, todas con código de salida 1 y sin instalar nada:

| Situación | Por qué |
|---|---|
| Sin TTY y sin flags | No hay modo no interactivo implícito: el código de salida no miente |
| `--all` y `--skill` juntos | Se pide un subconjunto o todo, no ambos: no se elige uno en silencio |
| `--skill <desconocida>` | Un éxito parcial dejaría creyendo que se instaló lo pedido |

El mensaje de error siempre lista las skills disponibles, así el reintento no necesita un `ls`.

Sin TTY, un archivo que ya existe se conserva y se avisa por `console.warn`: el aviso no
bloquea la instalación de lo que sí faltaba. Con TTY, en cambio, se pregunta.

## Conflictos y archivos faltantes

La unidad de decisión es **la skill, no el archivo**. Antes de instalar, el instalador compara los recursos declarados en el manifest contra lo que hay en destino y separa dos cosas:

- **Ya existe** — hay un conflicto: se perdería una edición local.
- **Falta** — no hay conflicto: no se pierde nada, así que el archivo se crea siempre.

Por cada skill con archivos en conflicto, el comando emite **un solo aviso** que nombra cada archivo afectado (`ya existe:` / `falta:`) y pregunta si se reemplazan con la versión nueva. La respuesta por defecto es **no**; cancelar el aviso equivale a "no", nunca a abortar la instalación.

La granularidad es por skill a propósito: reemplazar el `SKILL.md` de una skill pero conservar sus docs compartidos dejaría esa skill internamente inconsistente — una versión nueva apuntando a archivos de la anterior. Con una decisión por skill ese estado es imposible. También hace que el número de preguntas escale con el catálogo de skills, no con su número de archivos.

Un archivo ausente nunca genera aviso de conflicto, pero sí aparece listado como `falta:` en el aviso de su skill, para que la instalación parcial sea visible en lugar de silenciosa.

## Logs

Cada línea nombra la ruta del archivo (`` ⚡ Omitiendo (ya existe): .agents/skills/<skill>/SKILL.md ``), no solo su basename: con varias skills, todas traen un `SKILL.md` y el nombre solo sería ambiguo.

## Sin TTY

`funky skills` sin flags es interactivo. Sin terminal el `multiselect` no puede recoger selección, así que el comando **falla con código 1** indicando `--all` o `--skill`, en vez de imprimir el prompt y terminar sin instalar. Ver la sección de modo no interactivo.

## Autodetección de skills (R-SK-7)

`discoverSkills(srcDir)` lista los directorios bajo `src/skills/` que contienen `SKILL.md` **y** `manifest.js` con nombre exacto (case-sensitive incluso en NTFS: `skill.md` en minúsculas no cuenta). Agregar una skill nueva se reduce a crear `src/skills/<nombre>/SKILL.md` y su `manifest.js` — aparece automáticamente en la selección y es instalable desde el primer momento.

## Manifest por skill (R-SK-8)

Cada skill vive en `src/skills/<skill>/`:```
src/skills/
├── sdd-release/           # proceso de release de funky-ai (prefijo legacy, ver arriba)
│   ├── SKILL.md
│   └── manifest.js        # SKILL.md → .agents/skills/sdd-release/
│                          # templates/bootstrap/sdd/release-notes.md → .agents/templates/sdd/ (optional)
├── sdd-docs-sync/         # proceso de docs de funky-ai (prefijo legacy, ver arriba)
│   ├── SKILL.md
│   └── manifest.js        # SKILL.md → .agents/skills/sdd-docs-sync/
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

## Regla doc-nuevo en sdd-docs-sync (R-SK-11)

La skill `sdd-docs-sync` amplió sus Decision Gates: además del doc modificado clásico, ahora un **comando nuevo** (o flag nuevo) exige crear `docs/<dominio>/<comando>.md` completo, su índice seccional y su fila en `docs-live-index.md` (SSOT); también cubren capability nueva, fraccionamiento de un doc existente y estructura de docs nueva. El matching entre el índice SSOT y el árbol de docs es bidireccional: un ítem nuevo sin fila en el índice se marca como doc nuevo.

## Diagrama de flujo

`runSkills()` resuelve los manifests contra `srcDir`, expande las intenciones de copia (orden determinista) y las delega a `executeIntentions()` — que hace skip-if-exists y salta srcs opcionales ausentes. El veredicto final reporta archivos creados y skipeados.
