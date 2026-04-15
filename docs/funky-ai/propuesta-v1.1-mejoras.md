# Propuesta de Actualización V1.1: Protocolo Funky AI

Este documento actúa como paso previo (SDD Phase: Proposal) para listar las mejoras estructurales que se aplicarán a la filosofía y guía principal de Funky AI (`funky-ai.md`). Estas mejoras responden a un aumento escalar del proyecto y la adición del subsistema táctico de Skills.

## 🎯 Mejoras a Integrar

### 1. Búsqueda Autónoma en el Engram Simulado (Agente Activo)
**Problema:** Los Sub-agentes frescos asumen soluciones genéricas sin saber cómo rastrear el contexto histórico, alucinando código o rompiendo patrones ya definidos. Obligar al humano a buscar fragmentos de texto manualmente agota el paradigma de delegación (la única carga del humano debería ser abrir el chat).
**Mejora a Documentar:** 
- **Modificación en el GEMINI.md Global:** Se añadirá una directiva estricta de "Engram Automático". Esta regla dictará que TODO agente, independientemente de su Tier, **debe usar autónomamente sus herramientas del sistema (`grep_search` y `view_file`)** sobre la carpeta `docs/` o `knowledge/` para investigar palabras clave relacionadas con su tarea ANTES de proponer soluciones.
- **Eficiencia del Motor:** Le enseñaremos al agente a no leer archivos enteros a ciegas. Primero usará grep_search para detectar si el bug o arquitectura ya existe en el `post-mortem` o `ORCHESTRATOR-STATE.md`, y de encontrar coincidencias, aplicará `view_file` solo acotado a las líneas necesarias. Así emulamos la eficiencia de SQLite-BM25 con herramientas puras del SO.

### 2. Inserción del Ecosistema de Skills (`.agents/skills`)
**Problema:** Operatividad redundante. Los agentes no tienen instrucciones genéricas estandarizadas para las tareas repetitivas del equipo.
**Mejora a Documentar:**
- Oficializar la carpeta global `.agents/skills` como la **Caja de Herramientas Obligatoria**.
- **Regla Táctica:** Todo agente, sin importar su Tier, debe recibir instrucción para comprobar si existe un "Skill" diseñado para su misión actual dentro de ese directorio (Ej. si se trata de tests, chequear si hay un skill de Testing; si se crean skills nuevos, cargar `skill-creator`).

---

*Estado: Pendiente de Aprobación. Una vez que el Arquitecto Humano valide este flujo o arroje observaciones, las reglas serán insertadas permanentemente en el manual maestro `funky-ai.md`.*
