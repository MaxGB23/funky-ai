# Propuesta Técnica: Agent DRY Pattern

## Enfoque Arquitectónico
Eliminar la necesidad de que el Orquestador transcriba tareas en el documento de Handoff. 

El nuevo `worker-handoff.md` redirigirá cognitivamente al Worker LLM a leer su propia asignación directamente desde el archivo maestro `sdd-tasks.md`. Esto reduce la carga cognitiva y de generación de tokens del Orquestador, y asegura que el Worker siempre reciba las instrucciones originales sin alteraciones.

## Cambios Estructurales en Templates

Se reemplazará el bloque de "Acciones exactas" en la sección 2 por una "Directiva Agent DRY".

**Antes:**
```markdown
**Acciones exactas:**
1. [Acción 1 con archivo destino explícito]
2. [Acción 2]
```

**Después:**
```markdown
> **⚡ DIRECTIVA AGENT DRY (Fuente de la Verdad):**
> Tu misión detallada NO está transcrita aquí para evitar el teléfono descompuesto. 
> Tu fuente de la verdad es EXCLUSIVAMENTE el archivo `sdd-tasks.md` referenciado en la sección 1.C.
> 
> `ACTION: Ejecutá view_file sobre docs/openspec/changes/{feature-name}/sdd-tasks.md`
> Dirigite a la **Fase [N]** y ejecutá exactamente todas las acciones listadas allí, línea por línea.
```

## Beneficios
1. **Reducción de Alucinaciones:** El Orquestador no puede "olvidarse" de transcribir un paso.
2. **Eficiencia de Tokens:** Menos generación de texto al delegar.
3. **SSOT (Single Source of Truth):** `sdd-tasks.md` se vuelve el único lugar donde vive la especificación.
