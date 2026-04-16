# Auditoría CLAUDE.md: Estrategias Portables a Funky AI

**Fuente:** `docs/gentle-ai/CLAUDE.md`  
**Fecha:** Abril 2026

---

## ✅ Estrategia 1: Taxonomía de Triggers Proactivos (Cuándo Guardar en Engram)

Gentle AI no le dice al agente "guardá si algo fue importante". Le da una lista de triggers **exactos y obligatorios**. Esto elimina la ambigüedad.

### Trigger Taxonomy (Portable a Funky AI)
Un Worker debe guardar en `post-mortem.md` INMEDIATAMENTE y SIN ESPERAR PEDIDO, después de cualquiera de estos eventos:

**Después de una Decisión:**
- Se tomó una decisión de Arquitectura o Diseño
- Se estableció una convención de equipo
- Se eligió una herramienta o librería con tradeoffs evaluados

**Después de Completar Trabajo:**
- Bug fix terminado (incluir causa raíz)
- Feature implementada con lógica no-obvia
- Cambio de configuración de entorno realizado

**Después de un Descubrimiento:**
- Comportamiento inesperado o edge case encontrado
- Patrón nuevo establecido (naming, estructura)
- Restricción técnica descubierta en el IDE o deps

### 🔑 La Self-Check Question (Obligatoria Post-Tarea)
Al terminar cada tarea, el agente (Worker u Orquestador) DEBE hacerse esta pregunta antes de cerrar el chat:
> *"¿Acabo de tomar una decisión, arreglar un bug, aprender algo no-obvio, o establecer una convención? Si la respuesta es Sí → escribir en `post-mortem.md` AHORA."*

---

## ✅ Estrategia 2: Session Close Protocol (Protocolo de Cierre de Sesión)

Gentle AI tiene una estructura obligatoria de cierre que se ejecuta antes de decir "listo" o "terminado". En Funky AI, esto equivale a actualizar el `ORCHESTRATOR-STATE.md` al final de cada sesión de Orquestación.

### Estructura Obligatoria de Cierre
```markdown
## Objetivo
[En qué estuvimos trabajando esta sesión]

## Instrucciones Aprendidas
[Preferencias o restricciones del usuario descubiertas - si las hay]

## Descubrimientos
- [Hallazgos técnicos, gotchas, aprendizajes no-obvios]

## Completado
- [Items terminados con detalles clave]

## Próximos Pasos
- [Lo que queda por hacer para la próxima sesión]

## Archivos Relevantes
- path/to/file — [qué hace o qué cambió]
```

> **Regla de Oro:** Si el Orquestador cierra la sesión sin actualizar el `ORCHESTRATOR-STATE.md` con esta estructura, la próxima sesión arranca CIEGA.

---

## ✅ Estrategia 3: Topic Key / Upsert Pattern (Anti-Duplicación de Memoria)

Gentle AI previene que la memoria se llene de entradas duplicadas sobre el mismo tema con la noción de `topic_key`. Si el tema ya existe, se actualiza (upsert), no se crea una entrada nueva.

### Implementación en Funky AI (Texto Plano)
En nuestro `post-mortem.md` y archivos de `docs/engram/`, esto se emula con **headers de sección consistentes**:

- ❌ **Anti-patrón:** Crear una nueva sección `### [decision] Auth Model` cada vez que el tema evoluciona → el archivo acumula 4 entradas del mismo tema.
- ✅ **Patrón correcto:** Buscar primero con `grep_search` si ya existe un header con ese `topic_key`. Si existe, **editar la entrada existente** con `replace_file_content`. Si no existe, recién crear una entrada nueva.

### El Flujo con topic_key:
1. Antes de escribir en Engram → `grep_search "auth-model" docs/post-mortem.md`
2. ¿Existe? → `replace_file_content` para actualizar.
3. ¿No existe? → `replace_file_content` con append al final del archivo.

---

## 🎯 Impacto en el Roadmap de Funky AI

| Estrategia | Dónde Implementar | Release Target |
|---|---|---|
| Trigger Taxonomy + Self-Check | `.agents/rules/engram-protocol.md` | v1.1.1 (Patch inmediato) |
| Session Close Protocol | `GEMINI-funky-global.md` + `funky-ai.md` | v1.1.1 (Patch inmediato) |
| Topic Key / Upsert | `engram-protocol.md` + `post-mortem.md` convención | v1.1.1 (Patch inmediato) |
