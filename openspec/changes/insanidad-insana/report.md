# Reporte de Ejecución: [Nombre de la Funcionalidad o Cambio]

## Resumen Ejecutivo
[Resumen de alto nivel del estado general de la feature. Actualizado por el Worker o al finalizar la feature.]

---

## Archivos Modificados Globales
[Lista acumulativa de archivos que fueron tocados a lo largo de las distintas fases.]

---

## Bugs Encontrados
[Si se encontró algún bug, documentarlo utilizando el schema de Engram:]

### [bug] [Título del Bug]
**What:** [Qué pasaba]
**Why:** [Por qué pasaba]
**Where:** [Dónde estaba el problema]
**Learned:** [Qué aprendimos]

---

## Historial de Fases
> **[SISTEMA - PARA EL WORKER]** Añade tus reportes al final de esta sección copiando la estructura base de la "Fase 1". TIENES PROHIBIDO borrar los reportes de workers anteriores o sobrescribir el archivo completo.

### Fase 1 — [Nombre]
- **Status:** [✅ Completada / ❌ Bloqueada]
- **🔴 Cambio de Scope Detectado:** [No / Sí - Razón]
- **Archivos creados/modificados:**
  - `archivo.js`: Breve descripción del cambio
- **Bugs encontrados:** [Ninguno]
- **Próxima acción:** [Instrucción para el orquestador]

---

> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, extrae el conocimiento ganado al engram usando `funky engram add --tag "[tag]" --category <categoría> --desc "..."` (categorías: `architecture`, `pattern`, `discovery`, `decision`, `bugfix`).