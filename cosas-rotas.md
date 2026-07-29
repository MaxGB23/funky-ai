Muchos templates les he cambiado el nombre para que no haya confusiones, por lo que el cli debe inyectarlos con ese exacto nombre en la ruta correspondiente.

Antiguamente las rules del orquestador mediante cli no estaban actualizadas, por lo que no se inyectaban las nuevas. funky-cli\src\templates\bootstrap\funky-ai-rules es donde se encuentran todas las rules que le dan vida al orquestador de funky-ai. Actualmente se inyectan con init --bootstrap, pero tendra su comando dedicado en un futuro.

Estas al haber movido su ubicacion, toda la logica del cli está rota. Estas deben inyectarse dentro de .agents\rules , este es el directorio donde está la configuracion raiz de agentes.
orchestrator-state, readme, template_guide tambien son parte de --bootstrap, pero se inyectan en raiz, son complemento pero no son rules de agentes.

Despues tenemos funky-cli\src\templates\bootstrap\sdd, estos igual se deben inyectar con --bootstrap, son templates relacionados con el flujo sdd de funky-ai. Se inyectan dentro de .agents\templates\sdd.

--bootstrap debe generar este directorio .agents\templates\sdd\docs-live-index.md, el file debe contener una tabla con "# 📚 Índice de Docs Vivos (SSOT)
| # | Doc | Cubre / Propósito | Índice Seccional | Aplica si... |
|---|-----|-------------------|------------------|--------------|", esto debido a que un template de sdd "docs.md" necesita un indice de documentacion para funcionar correctamente.

init tiene dos templates que no inyecta directamente, sino que los genera mediante cli, project canvas y el de infraestructura. Debemos resolver la pregunta: "Lo mantenemos con generación mediante cli, o lo dejamos como template normal que se inyecta simplemente?

funky-cli\src\templates\funky-pipeline aquí he puesto los templates correspondientes a funky assess, estimate, o pipeline. No sé donde deberían ser inyectados, creo que actualmente se mantienen en raiz o docs.