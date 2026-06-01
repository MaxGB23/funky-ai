### [DISCOVERY][skills-obsolescence-vs-templates] Las Skills de Plantillas son redundantes con el CLI
**What:** Skills que dictan estructuras de archivos (ej. `sdd-proposal.md`) quedan obsoletas e introducen deuda técnica si el framework ya inyecta templates canónicos (ej. vía `funky phase`).
**Why:** Mantener la estructura de un archivo definida en una Skill obliga a la IA a memorizarla y transcribirla. Un CLI inyecta el template base instantáneamente y sin costo de tokens, haciendo a la skill inútil.
**Where:** Directorio `.agents/skills/`.
**Learned:** Nunca crear una Skill para definir la estructura de un documento si podés usar un scaffolding automático o template estático en el disco. Las skills deben reservarse para lógica dinámica o workflows complejos.