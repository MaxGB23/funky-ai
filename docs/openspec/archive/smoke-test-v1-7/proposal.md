# Propuesta: Smoke Test v1.7.0

## Solución Propuesta
Vamos a crear un directorio sandbox (`m:\funky-ai\smoke-test-sandbox`), inicializar un proyecto allí usando el CLI localmente (`node m:\funky-ai\funky-cli\bin\funky.js init`) y verificar visualmente/estructuralmente que los prompts interactivos se muestren bien y el canvas resultante sea correcto. 

## Alternativas Consideradas
- **Publicar un dry-run en npm:** Excesivo para este punto.
- **Usar Docker:** Añade fricción innecesaria. El entorno local de Windows es suficiente para validar la interacción de la TTY y la escritura en disco.

## Riesgos y Mitigaciones
- **Problemas con TTY en el entorno de agente:** Como los agentes a veces tienen problemas con prompts interactivos crudos, la ejecución de la fase interactiva podría requerir supervisión manual o el uso de comandos expect/scripts, o bien el worker puede intentar interactuar si la TTY lo permite. Si no, podemos priorizar la prueba headless y dejar que el humano valide la interactiva, pero intentaremos que el worker lo haga si es posible.
