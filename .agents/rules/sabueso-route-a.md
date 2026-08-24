---
trigger: model_decision
description: "Solo CLI (`antigravity-cli` en `App Data Directory`); ignorar en `antigravity-ide`. Activa al explorar múltiples archivos o búsquedas complejas donde el ruido degrade el contexto actual."
---

# Regla JIT — Route A: Sabueso Regular

## Definición (una vez por sesión)
```jsonc
// define_subagent
{
  "name": "sabueso-regular",
  "description": "Explorador read-only del repo. Prioriza codegraph MCP; devuelve solo el bloque Hallazgo.",
  "system_prompt": "Investigador read-only: NO escribes ni editas. Prioriza las herramientas MCP de codegraph; sin ellas, lectura/grep directo. Una consulta estructurada de codegraph resuelve lo que muchos greps; no re-verifiques con grep lo que codegraph ya devolvió con líneas exactas. Devuelve ÚNICAMENTE el bloque Hallazgo pedido; si no encuentras nada: 'Hallazgo: Ninguno'.",
  "enable_mcp_tools": true
}
```
> Fallback sin `define_subagent`: built-in `TypeName: research` con `"Model": "flash_lite"` y el mismo contrato.

## Invocación
```jsonc
// invoke_subagent
{
  "Subagents": [{
    "TypeName": "sabueso-regular",
    "Role": "Sabueso Regular — Explorador",
    "Prompt": "{tarea única y acotada}. Devuelve solo:\n## Hallazgo: {título}\n**Qué**: {hallazgo}\n**Dónde**: `path[:línea]`\n**Contexto**: {2–3 líneas}",
    "Model": "flash_lite"
  }]
}
```
Una tarea por delegación. Modelo SIEMPRE `flash_lite`, nunca `inherit`.

## Ciclo de vida (lo controla el INVOCADOR)
- **Interactivo:** Running → Idle → correcciones vía `send_message` → Kill al aprobar la fase.
- **Auto:** Kill solo DESPUÉS de persistir el Hallazgo y confirmar su lectura.
- Idle para iterar la investigación en curso **y sus seguimientos relacionados**: mismo área, mismos archivos o extensión directa del Hallazgo anterior. **Tema, módulo u objetivo nuevo = Kill + subagente fresco** (el mapa acumulado deja de ser activo y pasa a ser ruido).
- El tope de 2–3 rondas aplica igual al reuso relacionado; al alcanzarlo ⇒ Kill + relanzar fresco con resumen destilado como prompt inicial.
- Cada feedback instruye reverificar rutas tocadas desde la ronda anterior.

## Deberes del Orquestador tras cada Hallazgo
- Spot-check: verificar que 1–2 rutas reclamadas existen antes de decidir sobre ese mapa.

> **No confundir con Route B (Explore SDD):** Route A investiga y resume; Route B genera artefactos SDD con modelo más capaz.