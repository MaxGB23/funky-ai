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

El instalador detecta las skills disponibles bajo `src/skills/` y pregunta qué instalar con un menú de selección única (`select`): **Todas** o una skill específica. Elegir una skill instala solo esa skill y sus docs compartidos; **Todas** instala todas las detectadas. No existe selección vacía: la operación solo se cancela explícitamente (Esc/Ctrl+C), lo que sale con código 1 sin realizar cambios (R-SK-6). El orden de instalación es determinista: alfabético por skill y luego el orden del manifest (D3).

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
