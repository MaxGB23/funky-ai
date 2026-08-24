## [DRAFT] Modelo por Fase — Optimización de Costo

> ⚠️ **Estado:** Draft experimental. Basado en investigación empírica de model tiers (ver `comparativas-tokens/model-tiers-antigravity.md`). No obligatorio aún — aplícalo cuando el humano lo autorice explícitamente.

Cada fase es un subagente independiente (`define_subagent`). El parámetro `Model` es opcional en `invoke_subagent` — si se omite, hereda el modelo del orquestador. La asignación por fase permite balancear costo vs capacidad:

| Fase | TypeName | Model recomendado | Justificación |
|------|----------|-------------------|---------------|
| 1. Explore | `research` | `flash` | I/O masivo de lectura; no requiere razonamiento profundo |
| 2. Propose | `define_subagent` | `inherit` | Creatividad arquitectónica; necesita el modelo más capaz |
| 3. Spec | `define_subagent` | `pro` | Precisión en requirements; razonamiento suficiente sin gastar el máximo |
| 4. Design | `define_subagent` | `inherit` | Fase más cognitivamente demandante; exclusiva de T3 |
| 5. Tasks | `define_subagent` | `pro` | Comprensión del spec + descomposición coherente |
| 6. Apply | `define_subagent` | `inherit` | Escritura de código real; aquí el modelo importa más |
| 7. Verify | `define_subagent` | `flash` | Mayormente mecánico: correr comandos y leer output |
| 8. Archive | `define_subagent` | `flash` | Escritura estructurada, no creativa |
| 9. Post-archive | Orquestador directo | `flash_lite` | Completamente mecánico; no consume quota del usuario |

### Guía de Delegación de Subagentes (Verídica y Tipada)

Existen tres formas principales de delegar trabajo a un subagente, dependiendo de si necesitas que escriba, si necesita contexto limpio, o si requieres un comportamiento 100% personalizado.

#### 1. Built-in: `research` (Solo Lectura)
Agente nativo, puro y aislado. No hereda tu system prompt ni tus herramientas de escritura. Su único trabajo es explorar el repo, buscar en web y leer archivos. Ideal para la fase Explore cuando el reporte se escribe en memoria o lo escribes tú.

```jsonc
// Llamada a la herramienta: invoke_subagent
{
  "Subagents": [
    {
      "TypeName": "research", // Nombre built-in obligatorio
      "Role": "Explorador de Arquitectura", // OBLIGATORIO: título del trabajo
      "Prompt": "Investiga los endpoints de la API...", // OBLIGATORIO: instrucciones detalladas
      "Model": "flash", // Opcional: 'inherit' (default), 'flash_lite', 'flash', 'pro'
      "Workspace": "inherit" // Opcional: 'inherit' (default), 'branch', 'share'
    }
  ]
}
```

#### 2. Built-in: `self` (Lectura y Escritura - Clon)
Clona tu estado actual: hereda todas tus herramientas (incluidas las de crear y editar archivos) y tu system prompt. Ideal para delegar tareas pesadas como refactors o redacción de artefactos sin tener que armar un agente desde cero.

```jsonc
// Llamada a la herramienta: invoke_subagent
{
  "Subagents": [
    {
      "TypeName": "self", // Nombre built-in obligatorio
      "Role": "Analista y Redactor", // OBLIGATORIO: Título que define su enfoque
      "Prompt": "Explora el repo y redacta el reporte en docs/explore.md",
      "Model": "pro", // Opcional
      "Workspace": "share" // Opcional
    }
  ]
}
```

#### 3. Custom: `define_subagent` + `invoke_subagent`
Cuando requieres que el subagente tenga una personalidad, formato o reglas estrictas y diferentes a las tuyas. Requiere dos pasos.

**Paso 1: Definición (Herramienta: `define_subagent`)**
Crea la plantilla del agente. Solo se hace una vez por tipo.
```jsonc
// Llamada a la herramienta: define_subagent
{
  "name": "mi-fase-propose", // OBLIGATORIO: Nombre único alfanumérico con '_' o '-'
  "description": "Redacta RFCs basados en contexto.", // OBLIGATORIO: Para qué sirve
  "system_prompt": "Eres un arquitecto. Solo escribes RFCs en Markdown...", // OBLIGATORIO: Reglas base
  "enable_write_tools": true, // Opcional (Default false): Le da poder de editar/crear archivos
  "enable_subagent_tools": false, // Opcional (Default false): Le permite crear más subagentes
  "enable_mcp_tools": false // Opcional (Default false): Le da acceso a servidores MCP
}
```

**Paso 2: Invocación (Herramienta: `invoke_subagent`)**
Invoca al agente que acabas de definir.
```jsonc
// Llamada a la herramienta: invoke_subagent
{
  "Subagents": [
    {
      "TypeName": "mi-fase-propose", // OBLIGATORIO: El 'name' del paso 1
      "Role": "Redactor Principal de RFC", // OBLIGATORIO
      "Prompt": "Lee docs/funky-ai/prompts/sdd/funky-propose.md y ejecuta tu rol...",
      "Model": "inherit", // Opcional
      "Workspace": "inherit" // Opcional
    }
  ]
}
```

### 4. Permisos Avanzados y Aislamiento de Entorno (Capacidades Interesantes)

Además de los parámetros básicos, la API te permite controlar el nivel de autonomía y el aislamiento físico de cada subagente.

#### En `define_subagent` (Permisos de Herramientas)
- `enable_write_tools` (bool): Le da acceso a `replace_file_content`, `write_to_file` y correr comandos de shell. Sin esto, es un agente inofensivo de lectura.
- `enable_subagent_tools` (bool): Le permite invocar a sus propios chalanes (subagentes anidados). Útil para arquitectos que delegan desarrollo en paralelo.
- `enable_mcp_tools` (bool): Le da acceso a herramientas MCP cargadas, ideal para agentes que requieran integraciones externas (ej. leer bases de datos, APIs de tickets).

#### En `invoke_subagent` (Aislamiento de Workspace)
El parámetro `Workspace` es una joya para experimentación. Te permite controlar dónde actúa el agente:
- `"inherit"` (default): Actúa exactamente en tu misma carpeta. Lo que escriba o borre te afecta directamente.
- `"share"`: Crea un entorno que apunta al mismo repo (como un `git worktree`). Le permite crear ramas y trabajar de forma independiente sin duplicar almacenamiento.
- `"branch"`: Hace una copia física y aislada del workspace. Ideal cuando le pides al agente que ejecute pruebas destructivas, instalaciones guarras o experimentos que podrían romper el código. Al matarlo, el desmadre desaparece.