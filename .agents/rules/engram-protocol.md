---
trigger: glob
description: "Protocolo para lectura y escritura estructurada de memoria (Falso Engram) en proyectos gestionados por Funky AI. Se dispara en repositorios con documentación activa."
globs: ["docs/*", "docs/**/*"]
---

# Engram Protocol (Funky AI Memory Bus)

## 1. Memory Polling (Lectura)
- **OBLIGATORIO:** Antes de cambios estructurales, ejecutar `grep_search` en `docs/engram/`.
- **OBJETIVO:** Evitar repetición de errores y colisión con decisiones previas.

## 2. Escritura Indexada (Esquema MCP)
- **DESTINO:** Archivo según tipo en `docs/engram/` (`bugfixes.md`, `decisions.md`, `architecture.md`, `discoveries.md`).
- **FORMATO:**
```markdown
### [{type}][{topic_key}] {title}
**What:** [Cambio técnico concreto]
**Why:** [Causa/Justificación]
**Where:** [Archivos afectados]
**Learned:** [Aprendizajes/Caveats]
```

## 3. Trigger Taxonomy (Cuándo guardar)
- **Decisiones:** Arquitectura, convenciones, tradeoffs de librerías.
- **Resultados:** Bugfixes (con causa raíz), features con lógica no-obvia, configuración de enviroment.
- **Hallazgos:** Edge cases, patrones nuevos, restricciones técnicas.

### 🔑 Self-Check (Obligatorio Post-Tarea): Antes de cerrar el chat, pregúntate "¿Acabo de tomar una decisión, arreglar un bug o aprender algo no-obvio? Si sí -> Escribir en Engram AHORA."

## 4. Upsert Pattern (Anti-Duplicación)
1. **Search:** `grep_search` por `{topic_key}` en `docs/engram/`.
2. **Regex:** Usar `IsRegex: true` si el key está anidado (ej: `\[tipo\]\[key\]`).
3. **Write:** Si existe, `replace_file_content` sobre la entrada. Si no, append al final.

## 5. Return Envelope (Reporte de Worker)
Todo Worker DEBE finalizar escribiendo un reporte físico en `docs/openspec/changes/{change-name}/` o `docs/funky-ai/workers/` con este formato:
```markdown
---
Worker: [ID/Fase]
Estado: [✅ Completado | ❌ Error | ⚠️ Parcial]
Archivos Mutados:
- [path]: [cambio]
Tokens Ahorrados (Est): [Solo en Fase de Dieta]
Bugs Encontrados: [Ninguno | Descripción]
---
```

## 6. Session Close (Orquestador)
Actualizar `ORCHESTRATOR-STATE.md` antes de cerrar:
```markdown
## Objetivo: [Tema de la sesión]
## Descubrimientos: [Hallazgos técnicos/aprendizajes]
## Completado: [Items cerrados]
## Próximos Pasos: [Pendientes]
## Archivos Relevantes: [Path — Descripción]
## Instrucciones Aprendidas: [Preferencias o restricciones del usuario]
```
> **REGLA DE ORO:** Un Orquestador sin `ORCHESTRATOR-STATE.md` actualizado deja ciega la siguiente sesión.