---
trigger: glob
description: "Protocolo de memoria estructurada (Engram Protocol) optimizado para entornos CLI con despacho de subagentes asíncronos y concurrencia física en disco."
globs: ["docs/*", "docs/**/*"]
---

# Engram Protocol — Funky AI CLI Memory Bus

## 🛰️ 1. Memory Polling Asíncrono (Lectura Obligatoria)
Antes de realizar cualquier modificación de código o scaffolding:
- **Paso 1:** Leer `docs/engram/index.md` para identificar tags semánticos relacionados con la tarea actual.
- **Paso 2:** Si se encuentra un tag relevante, usar `grep_search` quirúrgico por el `[tag-exacto]` en `docs/engram/discoveries.md` o `docs/engram/bugfixes.md` para evitar el Context Pollution y dilución de ventana de contexto.

---

## 💾 2. Estructura de Registro Indexado (Schema Engram)
Las entradas en la memoria persistente deben guardarse bajo el siguiente formato exacto:

```markdown
### [{type}][{topic_key}] {title}
**What:** [Cambio técnico concreto / gotcha identificado]
**Why:** [Explicación técnica / causa raíz real]
**Where:** [Archivos afectados o rutas relativas]
**Learned:** [Aprendizaje o regla de diseño para prevenir regresiones]
```
- **Tipos Válidos:** `BUG` (errores resueltos), `DECISION` (arquitectura/diseño), `DISCOVERY` (hallazgo no-obvio), `ARCH` (patrones estructurados).

---

## 🔒 3. Concurrencia e Idempotencia (Upsert Pattern)
Para evitar que ejecuciones en background de múltiples subagentes sobrescriban o corrompan la memoria:
1. **Verificación Previa:** Siempre realizar `grep_search` del `{topic_key}` antes de escribir.
2. **Edición Quirúrgica:** Si el `{topic_key}` ya existe, usar obligatoriamente `replace_file_content` para actualizar la sección.
3. **Escritura Append:** Si no existe, realizar un append limpio al final del archivo respetando las líneas de separación.
4. **Sincronización de Índice:** Al insertar una nueva entrada, actualizar **en la misma operación** el archivo principal `docs/engram/index.md` con el tag y resumen de una sola línea.

---

## 📝 4. Return Envelope Físico (Workers & Subagentes)
Todo subagente que se ejecute de forma asíncrona en el CLI debe culminar su ciclo de vida escribiendo un reporte estructurado y físico en el disco (evitando reporte por chat libre):

```markdown
---
Worker: [ID-FASE]
Estado: [✅ Completado | ❌ Bloqueado | ⚠️ Con Advertencias]
Archivos Mutados:
- [path]: [tipo de cambio: NEW/MODIFY/DELETE - breve resumen]
Bugs Encontrados: [Ninguno | schema engram detallando What/Why/Where/Learned]
Intentos Fallidos: [Lista de enfoques o patrones descartados durante la ejecución]
---
```
- **Destino del Reporte:** `docs/openspec/changes/{feature}/sdd-report.md`.
- **Notificación IPC:** Una vez escrito el reporte al disco, el subagente debe enviar un mensaje de control ("ping") corto al Orquestador indicando que la tarea ha finalizado y el archivo físico está listo.

---

## 🔄 5. Extracción Proactiva del Orquestador
Es responsabilidad absoluta del Orquestador leer el reporte físico (`sdd-report.md`) dejado por el Worker tras su finalización:
1. Analizar la sección `Bugs Encontrados` e `Intentos Fallidos`.
2. Extraer de manera quirúrgica cualquier gotcha o aprendizaje valioso.
3. Escribirlo en la base de conocimiento (`docs/engram/`) para que futuros subagentes no caigan en la misma trampa.
