# Explore: 024-living-specs (Transición a Living Specs)
**TIER DE ORQUESTACIÓN ELEGIDO: "N/A"**

## 1. Contexto del Problema
Actualmente, los specs viven dispersos en los cambios archivados (en la carpeta `archive/`), obligando a leer historial para entender el estado actual de un dominio (`user-auth`, etc.). El RFC 024 propone introducir "Living Specs" (`openspec/specs/`) como una fuente de verdad única y acumulativa.
El desafío principal es garantizar la **viabilidad técnica del merge**: cómo tomar un "Delta Spec" (generado durante la feature en `changes/`) y fusionarlo en el "Root Spec" sin perder información, y posteriormente asegurar el empaquetado y traslado de la feature completa al `archive/`.

## 2. Opciones de Arquitectura para el Merge de Specs

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **Opción A: Merge Delegado al LLM (Workflow)** | El agente que ejecuta `/funky-archive` lee el Root Spec y el Delta Spec (con las secciones ADDED, MODIFIED, REMOVED) y escribe el nuevo Root Spec fusionado. | - Altamente flexible para interpretar intención.<br>- Implementación rápida modificando el prompt del workflow. | - Riesgo de pérdida silenciosa de datos o alucinaciones (truncar el spec si es muy largo). |
| **Opción B: Merge Estricto Programático (AST / CLI)** | Implementar un comando `funky archive` en Node.js que parsea el Markdown AST para inyectar/reemplazar nodos basándose en headers estrictos. | - 100% determinista y seguro contra alucinaciones.<br>- Fallo predecible si el formato del delta está mal. | - Costo muy alto de desarrollo (parser Markdown robusto).<br>- Cero tolerancia a errores humanos o del agente en el formato del delta. |
| **Opción C: Diff Unificado (Git Patch)** | El agente de Spec genera un archivo `.patch` en vez de un markdown delta. Al archivar, se aplica el patch con comandos Git. | - Usa herramientas robustas probadas (Git).<br>- Soporta resolución de conflictos nativa. | - Rompe la legibilidad humana. El humano/agente tendría que leer y escribir diffs en vez de texto semántico claro. |

## 3. Recomendación + Riesgos
**Opción recomendada:** **Opción A (Merge Delegado al LLM) con validación de integridad.**

**Justificación:**
Funky AI está diseñado para que los LLMs asuman la carga de escritura basada en estructuras claras. Imponer la escritura de Diffs (C) arruina la DX del desarrollador, y construir un parser de AST (B) sobreingeniería la herramienta en su estado actual. Al enforzar una estructura estricta en el Delta Spec (`ADDED`, `MODIFIED`, `REMOVED`), minimizamos la ambigüedad para el LLM durante el merge. El archive histórico se mantiene intacto ya que simplemente consiste en mover (`mv`) el directorio de `changes/` a `archive/` (con la convención de nombres del RFC) como paso final.

**Riesgos mitigables:**
- **Riesgo 1 (Race Conditions / Root Spec desactualizado):** Que el Delta se haya creado basado en una versión vieja del Root Spec. **Mitigación:** Como sugiere el RFC, el Agente de Spec debe inyectar el SHA256 (o checksum simple) del Root Spec original en el Delta Spec. El proceso de archive fallará si el SHA actual no coincide.
- **Riesgo 2 (Corrupción del Root Spec por el LLM en el merge):** Que el LLM decida "resumir" secciones no tocadas del spec para ahorrar tokens. **Mitigación:** El Workflow `/funky-archive` debe tener una regla crítica anti-lazy (e.g. "PRESERVE TODOS LOS REQUIREMENTS EXACTAMENTE COMO ESTÁN, SOLO APLIQUE LOS DELTAS").
- **Riesgo 3 (Pérdida de Escenarios en el Delta):** El LLM/humano copia solo la línea modificada en `MODIFIED` y el archive borra el resto. **Mitigación:** Reforzar la regla del RFC: En la fase de Spec, se debe obligar a copiar el bloque de Requirement ÍNTEGRO al delta, no solo el escenario afectado.
