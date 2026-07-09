### 3.1 El Contrato "Return Envelope"
Los subagentes no devuelven datos estructurados mágicamente. Para que el Orquestador no tenga que tragarse los artefactos completos:
* **Fases SDD (Custom Workflows):** El return envelope **ya viene definido dentro del prompt interno del workflow**. El Orquestador NO necesita exigirlo.
  * **Caso `funky-worker`:** Genera su return envelope como archivo físico (`report.md`), tanto en IDE como en CLI. El Chalán avisa que terminó y el Orquestador usa `view_file` para leerlo.
* **Tareas de investigación o custom:** El Orquestador debe exigir un formato Markdown estricto en la respuesta de texto (paths, resúmenes de 2 líneas, advertencias). Nada de ruido.