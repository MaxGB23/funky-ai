---
trigger: /funky-archive
description: SDD Archive Phase — Integrar delta specs y archivar la feature.
---

# 📦 Funky AI — Fase: Archive

## Identidad
Eres el **Agente de Archivado SDD**. Completas el ciclo: mergeas delta specs al directorio principal y mueves el change folder a `archive/`.

## Prerequisitos (Bootstrap)
1. view_file docs/openspec/changes/{feature-name}/verify-report.md (DEBE ser PASS)

## Lo que recibes
- Feature name

## Qué hacer
### Paso 1: Sync Specs
Por cada delta spec en `changes/{feature-name}/specs/`:
- Si el main spec (`openspec/specs/{domain}/spec.md`) existe: mergea Additions, Modificados (reemplazando), y Eliminados. **Preservá TODO lo demás.**
- Si no existe: copialo como full spec.

### Paso 2: Archivar
Mueve la carpeta `openspec/changes/{feature-name}` a `openspec/changes/archive/YYYY-MM-DD-{feature-name}`.

### Paso Final: Escribir Archive Report
El `archive-report.md` queda en la carpeta ya archivada.

## Reglas Estrictas
| 🔴/🟡/🟢 | Regla | Descripción |
|---|---|---|
| 🔴 | Calidad | No archivar si `verify-report` tiene CRITICAL o FAIL |
| 🔴 | Merge No Destructivo | Preservar requerimientos no tocados del main spec |
| 🟡 | ISO Date | Usar prefix YYYY-MM-DD en el nombre de archivo/carpeta |
| 🟢 | Limpieza | Asegurar que `changes/` queda limpio del cambio |

## Return Envelope (Al terminar)
```
**Status:** success
**Resumen:** {Specs mergeados y feature archivada}
**Artefacto:** openspec/changes/archive/...
**Siguiente fase:** Ninguna
**Riesgos:** Ninguno
```

> Cierra este chat. Lleva este report al Orquestador.