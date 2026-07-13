# Detalle Técnico de Compresión — Fase 2

Este documento detalla los cambios quirúrgicos realizados en las reglas core para la reducción de tokens, asegurando la integridad semántica del sistema Funky AI.

---

## 📄 Archivo: `.agents/rules/engram-protocol.md`

### ❌ Eliminaciones (Ruido Narrativo)
- **Introducción Contextual:** Se eliminó el bloque explicativo inicial sobre "persistencía estructural". El modelo ya deduce el contexto por el nombre del archivo y la tarea.
- **Descripción de Tipos:** Se eliminó la lista redundante de archivos (`architecture.md`, etc.) en la sección 2, ya que el esquema MCP y el nombre del tipo lo dejan implícito.
- **Self-Check Question:** Se eliminó el bloque de "pregunta obligatoria". Se reemplazó por la instrucción directa del **Trigger Taxonomy**.
- **Ejemplos de Anti-patrón:** Se eliminaron las narrativas descriptivas de casos de error en la sección 4 (Upsert Pattern), manteniendo solo la lógica de ejecución (Search -> Regex -> Write).

### 📝 Modificaciones (Densidad)
- **§1 y §2:** Pasaron de párrafos explicativos a bullets de instrucción directa (Acción -> Objetivo).
- **§4 Flow:** Se simplificó el texto del flujo `topic_key` para que sea una lista de pasos técnicos.
- **§6 (Ex 5):** Se eliminó la advertencia final sobre "quedar a ciegas", dejando solo la estructura obligatoria de `ORCHESTRATOR-STATE.md`.

### ➕ Añadidos (Unificación)
- **§5 Return Envelope:** Se inyectó el esquema oficial de reporte de Worker. Esto permite eliminar esta instrucción en el futuro de otros archivos (como `team-guide.md`) y centralizarla.

### ✅ Preservado (Crítico)
- **Esquema MCP:** Los campos `What`, `Why`, `Where`, `Learned` están intactos.
- **Instrucción IsRegex:** La advertencia técnica sobre escape de caracteres en `grep_search` no se tocó por ser vital para la herramienta.
- **Estructura Orchestrator-State:** Los headers obligatorios de estado de sesión se mantienen sin cambios.

---

## 📄 Archivo: `.agents/rules/secops.md`

### ❌ Eliminaciones (Ruido Narrativo)
- **Preámbulo Senior:** Se eliminó la declaración de "Desarrollador Senior" y la advertencia de "Sin excepciones". Las reglas por sí mismas son imperativas.
- **Explicaciones NPM Config:** Se eliminó el razonamiento sobre por qué bloqueamos scripts. Se dejó solo la instrucción de cómo aprobar builds binarios.
- **Release Age:** Se eliminó la sugerencia de "desconfiar de paquetes recién publicados" para priorizar reglas de acción inmediata sobre archivos físicos.

### 📝 Modificaciones (Densidad)
- **Sintaxis de Reglas:** Se eliminaron los prefijos `REGLA:` y `PROHIBIDO:` dentro de los bullets, integrando la restricción directamente en el texto.
- **Consolidación de Auditoría:** Se unificaron los bullets de la sección 4 para evitar repetición de términos.

### ✅ Preservado (Crítico)
- **Exclusividad de Pnpm:** La prohibición de `npm/yarn` es absoluta y explícita.
- **Pineo de Versiones:** La instrucción de eliminar `^` y `~` en `package.json` permanece intacta.
- **Built-ins:** La prioridad de usar módulos nativos de NodeJS sobre dependencias externas.

---

## 📊 Resumen de Control
- **Intención:** Reducir latencia y consumo sin perder capacidad de ejecución.
- **Riesgo Detectado:** Ninguno. Las tools y los formatos de archivo (que son lo que el agente realmente usa para operar) no fueron alterados.
- **Ganancia Extra:** La definición unificada del Return Envelope elimina la ambigüedad en los reportes de futuros trabajadores.
