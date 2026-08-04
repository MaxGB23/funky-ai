# funky skills — Instalador interactivo de skills

## ¿Qué problema resuelve?

`funky skills` instala las skills del ecosistema agéntico de gentle-ai dentro de `.agents/skills/` del proyecto destino, junto con los docs compartidos de SDD (docs-live-index, formato canónico de índice seccional y release-notes). Cada skill declara sus propios recursos en un manifest (`src/skills/<skill>/manifest.js`), que es la única fuente de qué archivos se instalan y a dónde (R-SK-8) — el comando no tiene listas hardcodeadas de recursos.

Sin `funky skills` las skills base (sdd-release, sdd-docs-sync) no se distribuyen al proyecto, ni se bootstrapan los docs compartidos que el flujo SDD espera en `.agents/templates/sdd/`.

## ¿Cuándo usarlo?

Cuando el proyecto necesite las skills de orquestación SDD o los docs compartidos. El comando es interactivo e idempotente: los archivos existentes se skipean sin sobrescribirse (skip-if-exists), por lo que las ediciones locales sobre las golden templates se conservan.

```bash
funky skills
```

## Selección interactiva

El instalador detecta las skills disponibles bajo `src/skills/` y pregunta cuáles instalar (multiselect). La opción **Todas** instala todas las skills detectadas; si no se selecciona ninguna, termina con un mensaje y sin realizar cambios (R-SK-6). Cancelar la operación sale con código 1. El orden de instalación es determinista: alfabético por skill y luego el orden del manifest (D3).

## Autodetección de skills (R-SK-7)

`discoverSkills(srcDir)` lista los directorios bajo `src/skills/` que contienen un `SKILL.md`. Agregar una skill nueva se reduce a crear `src/skills/<nombre>/SKILL.md` y su `manifest.js` — aparece automáticamente en la selección.

## Manifest por skill (R-SK-8)

Cada skill vive en `src/skills/<skill>/`:

```
src/skills/
├── sdd-release/
│   ├── SKILL.md
│   └── manifest.js        # SKILL.md → .agents/skills/sdd-release/
│                          # templates/bootstrap/sdd/release-notes.md → .agents/templates/sdd/ (optional)
└── sdd-docs-sync/
    ├── SKILL.md
    └── manifest.js        # SKILL.md → .agents/skills/sdd-docs-sync/
                           # docs-live-index.md → .agents/templates/sdd/
                           # docs-index/_indice-seccional-template.md → .agents/templates/sdd/docs-index/
```

Cada entrada del manifest declara `src` (relativo a `src/` de funky-cli), `dest` (relativo al proyecto destino) y opcionalmente `optional: true`: si el src falta, la intención se salta con log y nunca crashea (R-SK-3).

## Docs compartidos y paridad byte a byte (R-SK-5)

Los docs compartidos viven en `src/templates/bootstrap/sdd/` — el MISMO src que usa `funky scaffold`. Así, el índice de docs vivos (`docs-live-index.md`), el template canónico del índice seccional (`_indice-seccional-template.md`) y `release-notes.md` llegan byte a byte idénticos por `funky skills` y por `funky scaffold`; no hay dos copias que divergir.

## Regla doc-nuevo en sdd-docs-sync (R-SK-11)

La skill `sdd-docs-sync` amplió sus Decision Gates: además del doc modificado clásico, ahora un **comando nuevo** (o flag nuevo) exige crear `docs/<dominio>/<comando>.md` completo, su índice seccional y su fila en `docs-live-index.md` (SSOT); también cubren capability nueva, fraccionamiento de un doc existente y estructura de docs nueva. El matching entre el índice SSOT y el árbol de docs es bidireccional: un ítem nuevo sin fila en el índice se marca como doc nuevo.

## Diagrama de flujo

`runSkills()` resuelve los manifests contra `srcDir`, expande las intenciones de copia (orden determinista) y las delega a `executeIntentions()` — que hace skip-if-exists y salta srcs opcionales ausentes. El veredicto final reporta archivos creados y skipeados.
