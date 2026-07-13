---
trigger: glob
description: "Protocolo para lectura y escritura estructurada de memoria (Falso Engram) en proyectos gestionados por Funky AI. Se dispara en repositorios con documentaciÃ³n activa."
globs: ["docs/*", "docs/**/*"]
---

# Engram Protocol (Funky AI Memory Bus)

## 1. Memory Polling (Lectura)
- **OBLIGATORIO:** Antes de cambios estructurales, ejecutar `grep_search` en `docs/engram/`.
- **OBJETIVO:** Evitar repeticiÃ³n de errores y colisiÃ³n con decisiones previas.

## 2. Escritura Indexada (Esquema MCP)
- **DESTINO:** Archivo segÃºn tipo en `docs/engram/` (`bugfixes.md`, `decisions.md`, `architecture.md`, `discoveries.md`).
- **FORMATO:**
```markdown
### [{type}][{topic_key}] {title}
**What:** [Cambio tÃ©cnico concreto]
**Why:** [Causa/JustificaciÃ³n]
**Where:** [Archivos afectados]
**Learned:** [Aprendizajes/Caveats]
```

## 3. Trigger Taxonomy (CuÃ¡ndo guardar)
- **Decisiones:** Arquitectura, convenciones, tradeoffs de librerÃ­as.
- **Resultados:** Bugfixes (con causa raÃ­z), features con lÃ³gica no-obvia, configuraciÃ³n de enviroment.
- **Hallazgos:** Edge cases, patrones nuevos, restricciones tÃ©cnicas.

## 4. Upsert Pattern (Anti-DuplicaciÃ³n)
1. **Search:** `grep_search` por `{topic_key}` en `docs/engram/`.
2. **Regex:** Usar `IsRegex: true` si el key estÃ¡ anidado (ej: `\[tipo\]\[key\]`).
3. **Write:** Si existe, `replace_file_content` sobre la entrada. Si no, append al final.

## 5. Return Envelope (Reporte de Worker)
Todo Worker DEBE finalizar escribiendo un reporte fÃ­sico en `docs/openspec/changes/{change-name}/` o `docs/funky-ai/workers/` con este formato:
```markdown
---
Worker: [ID/Fase]
Estado: [âœ… Completado | âŒ Error | âš ï¸ Parcial]
Archivos Mutados:
- [path]: [cambio]
Tokens Ahorrados (Est): [Solo en Fase de Dieta]
Bugs Encontrados: [Ninguno | DescripciÃ³n]
---
```

## 6. Session Close (Orquestador)
Actualizar `ORCHESTRATOR-STATE.md` antes de cerrar:
```markdown
## Objetivo: [Tema de la sesiÃ³n]
## Descubrimientos: [Hallazgos tÃ©cnicos/aprendizajes]
## Completado: [Items cerrados]
## PrÃ³ximos Pasos: [Pendientes]
## Archivos Relevantes: [Path â€” DescripciÃ³n]
```
> **REGLA DE ORO:** Un Orquestador sin `ORCHESTRATOR-STATE.md` actualizado deja ciega la siguiente sesiÃ³n.
