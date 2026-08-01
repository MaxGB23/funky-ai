<OPTIONAL_DOC_UPDATE>

### FASE N+1 — Doc-Update
> Completar SOLO si al menos un doc del índice canónico (`.agents/templates/sdd/docs-live-index.md`) aplica.

**🚫 Restricción de Contexto (Safe-Contexting y Tácticas de Cirujano):** 
1. **Durante la Planeación (`funky-tasks`):** Consulta `.agents/templates/sdd/docs-live-index.md` y evalúa la columna "Aplica si...". Para cada doc que aplique, genera los checkboxes abajo señalando la ruta del doc, su `Índice Seccional` y el concepto a cambiar. NUNCA abras los documentos de destino ni sus índices seccionales.
2. **Durante la Ejecución / Cierre (Orquestador):** Concéntrate **ÚNICAMENTE en ejecutar los checkboxes generados abajo**. Para cada checkbox activo, lee su `Índice Seccional` específico para ubicar el subtítulo exacto y usa `grep_search` sobre el documento objetivo para aplicar reemplazos quirúrgicos. ¡Prohibido hacer `view_file` completo del documento!

- [ ] **Doc [#N]** — `{ruta}` (Índice: `{ruta_indice_seccional}`): Actualizar para reflejar `{concepto nuevo o comportamiento modificado}`
- [ ] **Opcional (Nuevo Documento):** Si la feature crea un doc "nuevo" vital (no contemplado en el índice), debes: (1) crear su índice seccional en `.agents/templates/sdd/docs-index/{nombre_doc}.md` listando sus H2/H3, y (2) registrar el nuevo doc y su enlace al índice en el archivo canónico `.agents/templates/sdd/docs-live-index.md`.
- [ ] **Actualizar los índices (docs vivos y seccionales)** en caso de que requieran reflejar el estado actual de los docs modificados.

</OPTIONAL_DOC_UPDATE>