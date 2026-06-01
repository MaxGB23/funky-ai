### [DISCOVERY][readme-template-context-drift] El clonaje ciego de READMEs
**What:** Al crear el template canónico de `README.md`, el agente copió el README del CLI (`funky-cli/README.md`) en lugar de pensar en el propósito de un README a nivel ecosistema.
**Why:** Los LLMs tienden a copiar el archivo más cercano en nombre cuando se les pide un template de un archivo omnipresente sin darles instrucciones del "rol" de ese archivo.
**Where:** Fase 2 de v1.10.0 y posterior Auditoría (Fase 2.5).
**Learned:** Un README de raíz en el contexto de Funky AI debe ser un "Architecture Hub", no un repositorio de comandos CLI. Validar siempre que los templates iniciales tengan sentido lógico para la raíz del workspace.