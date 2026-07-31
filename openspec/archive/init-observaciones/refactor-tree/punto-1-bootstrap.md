# Punto 1: Arreglar inyección de `--bootstrap`

**Estado:** ✅ Completado  
**Commits:** `142b752`, `5a0efa8`

---

## Problema

El `runInit()` anterior tenía una lista plana de 13 archivos para copiar, la mayoría con nombres incorrectos o que ya no existían después de la reestructuración manual de `funky-cli/src/templates/`.

## Solución

### Estructura final de `--bootstrap`

```
bootstrap/
├── ORCHESTRATOR-STATE.md          → raíz
├── README.md                      → raíz
├── TEMPLATE_GUIDE.md              → raíz
├── funky-ai-rules/                → .agents/rules/  (24 archivos)
│   ├── engram-protocol.md
│   ├── sdd-escalation-matrix.md
│   ├── sdd-orchestrator.md
│   ├── sdd-preflight.md
│   ├── secops.md
│   ├── tier1-router.md
│   ├── tier2-router.md
│   ├── tier3-router.md
│   ├── tier2-delegation/          (6 archivos)
│   └── tier3-interactive/         (9 archivos)
└── sdd/                           → .agents/templates/sdd/  (8 archivos)
    ├── docs.md
    ├── explore.md
    ├── proposal.md
    ├── release-checklist.md
    ├── release-notes.md
    ├── report.md
    ├── spec.md
    └── tasks.md
    ── 000-rfc-template.md         → openspec/rfcs/  (excepción)

Generado además:
  - .agents/templates/sdd/docs-live-index.md  (tabla de docs vivos)
  - docs/engram/{architecture,...,release}/    (7 directorios)
```

### Cambios en `init.js`

- `runInit()` ahora es **100% explícito**: 35 `add()` hardcodeados agrupados por directorio
- No escanea el filesystem (seguro, sin riesgo de symlinks/basura)
- No recibe `rulesFiles[]` ni `sddFiles[]` — resuelve todo desde `templatesDir`
- `collectDirFiles()` eliminado
- `docs-live-index.md` se genera con el header de la tabla de taxonomía
- Engram `index.md` **removido** de init (lo maneja `funky engram add`)
- Referencias a `architecture-assessment*`, `agents-rules-secops-setup*` eliminadas
- `canvas-planning-guide.md` redirigido a `funky-pipeline/`

### Archivos removidos del source

| Archivo | Motivo |
|---------|--------|
| `bootstrap/agents-rules-engram-protocol.md` | Movido a `funky-ai-rules/` |
| `bootstrap/agents-rules-secops.md` | Movido a `funky-ai-rules/` |
| `bootstrap/agents-rules-sdd-orchestrator.md` | Movido a `funky-ai-rules/` |
| `bootstrap/agents-rules-secops-setup.md` | No existe en nuevo tree |
| `bootstrap/architecture-assessment-guide.md` | No existe en nuevo tree |
| `bootstrap/engram-bugfixes.md` | Gestionado por `funky engram add` |
| `bootstrap/engram-discoveries.md` | Gestionado por `funky engram add` |
| `bootstrap/release.md` | Reemplazado por `bootstrap/sdd/release-notes.md` |
| `sdd/` (main, 8 archivos + 6 de assess/estimate) | Movido a `bootstrap/sdd/` y `funky-pipeline/` |
| `protocols/` (2 archivos) | No forman parte del nuevo tree |

### Tests

- `init.test.js`: 130 tests (7 tests de init + resto del suite)
- `collectDirFiles` tests eliminados (función eliminada)
- Tests de `rulesFiles`/`sddFiles` reemplazados por checks de rutas hardcodeadas
- `engram.test.js` actualizado por cambios paralelos en `engram.js`

### Regla de oro

El nombre del template source = el nombre del destino. El CLI no renombra nada.
