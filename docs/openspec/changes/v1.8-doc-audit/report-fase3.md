# 📋 Report — Fase 3: Auditoría del Ecosistema CLI

---

## Return Envelope

```
Worker: v1.8-doc-audit / Fase 3
Estado: ✅ Completada
```

---

## Archivos Revisados (Scope: templates de funky-cli)

| Archivo | Estado |
|---------|--------|
| `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md` | ⚠️ Corregido |
| `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md` | ⚠️ Corregido |
| `funky-cli/src/templates/sdd/tasks.md` | ⚠️ Corregido |
| `funky-cli/src/templates/sdd/explore.md` | ⚠️ Corregido |
| `funky-cli/src/templates/sdd/proposal.md` | ⚠️ Corregido |
| `funky-cli/src/templates/sdd/worker-handoff.md` | ✅ Limpio |
| Otros archivos en `bootstrap/` y `sdd/` | ✅ Limpio |

---

## Incongruencias Encontradas y Correcciones Aplicadas

### 🔴 INC-01: Protocolo de Engram Legacy en Orchestrator Rules
**Archivo:** `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`
**Problema:** La sección "Manual Engram Protocol (Bug & Decision Persistence)" hacía referencias repetidas a `docs/post-mortem.md` para el polling de memoria, en lugar del sistema sharded de Engram implementado en la v1.2.
**Fix aplicado:** 
- Se actualizó el título a "Manual Engram Protocol (Proactive Persistence)".
- Se reemplazó el mandato de Dynamic Memory Polling a `grep_search` sobre `docs/engram/discoveries.md` y `docs/engram/bugfixes.md`.
- Se reemplazaron todas las referencias a `docs/post-mortem.md` por `docs/engram/` en las responsabilidades del Worker y del Orchestrator.

### 🔴 INC-02: Referencias a Artefactos MD Manuales (Sin prefijo `sdd-`)
**Archivos:** 
- `funky-cli/src/templates/sdd/tasks.md`
- `funky-cli/src/templates/sdd/explore.md`
- `funky-cli/src/templates/sdd/proposal.md`
- `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md`
**Problema:** Los templates de arquitectura y handoff mantenían referencias legacy a los nombres de archivo manuales del protocolo SDD (ej: `proposal.md`, `report.md`, `tasks.md`), omitiendo el prefijo `sdd-` automatizado por el comando `funky phase` de la herramienta CLI.
**Fix aplicado:** 
- En `tasks.md`: se actualizó la referencia a `sdd-proposal.md` y la instrucción de envelope a `sdd-report.md`.
- En `explore.md`: la instrucción del Orquestador fue actualizada a usar `sdd-proposal.md`.
- En `proposal.md`: la instrucción del Orquestador fue actualizada a usar `sdd-tasks.md`.
- En `plantilla-worker-handoff.md`: se reemplazaron absolutamente todas las referencias de `report.md` por `sdd-report.md` y `tasks.md` por `sdd-tasks.md` para uniformizar la salida del Worker.

---

## Verificación Final

Se validó a través de búsquedas exhaustivas (grep) sobre todos los subdirectorios `bootstrap/` y `sdd/` del paquete CLI para asegurar la ausencia total de la cadena literal "post-mortem" y artefactos que no cumplan la estructura moderna "sdd-*.md". El ecosistema CLI se encuentra sanitizado.

---

*Fase 3 completada. Cerrá este chat y volvé al Orquestador con este reporte.*
