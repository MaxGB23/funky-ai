# funky feature — SDD Change Scaffolding

## ¿Qué problema resuelve?

Crea la estructura de directorios y archivos para un cambio SDD bajo `openspec/changes/<name>/`. Evita tener que crear manualmente cada archivo de template cada vez que se inicia un nuevo cambio.

## Tiers de inyección

El comando presenta un selector interactivo de tres tiers. Cada tier define un conjunto distinto de archivos a inyectar. La resolución final está gobernada por `INJECTION_MATRIX` en `feature.js` y la función pura `resolveFiles()`.

### T1 — Fix / Hotfix / Cambio trivial

**Archivos base (siempre):** `tasks.md`, `report.md`

**Condicionales:** ninguno. T1 nunca pregunta por impacto a documentación ni inyecta `release.md`.

**Total:** 2 archivos.

### T2 — Feature / SDD ligero

**Archivos base (siempre):** `tasks.md`, `report.md`

**Archivos de tier (siempre):** `explore.md`, `proposal.md`, `spec.md`

**Condicionales:** `docs.md` — se agrega solo si el usuario responde "sí" a la pregunta *¿Este cambio afecta documentación pública?*.

**Siempre inyecta:** `release.md`

**Total:** 6 archivos sin docs; 7 con docs.

### T3 — Feature compleja / Archivo viviente

**Archivos base (siempre):** `tasks.md`

**Archivos de tier:** ninguno.

**Condicionales:** `docs.md` — misma pregunta que en T2.

**Siempre inyecta:** `release.md`

**Total:** 2 archivos sin docs; 3 con docs.

## Golden templates vs Fallback

El comando busca templates en dos ubicaciones, con prioridad para el proyecto local:

1. **Golden templates** — `cwd/.agents/templates/sdd/`. Si el directorio existe y contiene los archivos solicitados, se usan estos templates.
2. **Fallback** — `src/templates/sdd/` dentro del paquete `funky-cli`. Se usan cuando no hay golden templates disponibles.

El resultado incluye la bandera `usedFallback` que el comando reporta al usuario con un warning si se está usando la ruta de respaldo.

## Diagrama de flujo

```
funky feature <name>
    │
    ├─ Sanitizar nombre (trim, espacios → guiones, lowercase)
    │
    ├─ ¿Golden templates existen en .agents/templates/sdd/?
    │   ├─ Sí → templatesToUse = .agents/templates/sdd/
    │   └─ No  → templatesToUse = src/templates/sdd/ (fallback)
    │
    ├─ selectTier (siempre)
    │   ├─ T1
    │   ├─ T2
    │   └─ T3
    │
    ├─ docsImpact? (solo T2/T3)
    │   ├─ Sí → docs.md se agrega a la lista
    │   └─ No  → no se agrega
    │
    ├─ resolveFiles(tier, docsImpact)
    │   └─ Retorna lista definitiva de archivos a copiar
    │
    └─ executeIntentions
        ├─ mkdir openspec/changes/<featureName>/
        └─ copy templates → openspec/changes/<featureName>/
```

## Flags y argumentos

| Argumento     | Tipo       | Descripción                                                |
|---------------|------------|------------------------------------------------------------|
| `<featureName>` | argumento posicional | Nombre del cambio. Se sanitiza automáticamente (kebab-case). |

No hay flags adicionales. El resto de la configuración se resuelve mediante prompts interactivos (tier y docsImpact).
