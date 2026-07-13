spec, resumido:
1. Path de lectura para MODIFIED requirements
❌ Actual: docs/openspec/changes/{feature-name}/specs/{domain}/spec.md
✅ Correcto: docs/openspec/specs/{domain}/spec.md
Si es MODIFIED, el sub-agente necesita leer la source of truth actual, no el change folder que todavía no existe. Si es NEW, no necesita leer nada previo — escribe directo.
2. Target new / exists (como acordamos)
**Targets:**
- docs/openspec/changes/{feature-name}/specs/{domain}/spec.md (new)
- docs/openspec/specs/{domain}/spec.md (exists → leer solo si MODIFIED)
El (new) le dice "creá estructura + archivo". El (exists) le dice "leé primero antes de escribir el delta".
3. Creación explícita de estructura de directorios
El prompt necesita un paso que diga:
Paso 2.1: Crear estructura de specs para el change
   docs/openspec/changes/{feature-name}/
   └── specs/
       └── {domain}/
No asumir que el modelo lo va a hacer solo. Algunos modelos escriben el archivo y si el directorio no existe, fallan o alucinan un path alternativo.
4. Lo estándar (mismo que explore y propose)
Sacar ORCHESTRATOR-STATE.md, grep al index, [TAG]
Tags desde copy-paste
Generar return.md al final
En dos líneas
El spec está bien de contenido. Los problemas son:
─ Lee el path equivocado para MODIFIED (apunta al change, no a la main spec)
─ No crea la estructura de directorios explícitamente
─ Mismos vicios de bootstrap que los demás



Resumen final — Spec
Aspecto	Veredicto
Full Block para MODIFIED	✅ Fundamental, bien implementado
RFC 2119 + G/W/T + testabilidad	✅ Las tres patas firmes
Path de lectura para MODIFIED	⚠️ Bug conocido, apunta al change folder en vez del archive (o futuro specs/ raíz). Ya hay RFC para resolverlo.
Bootstrap (ORCHESTRATOR-STATE, index.md, [TAG])	❌ Mismos cambios que explore/propose
Creación de directorios specs/	⚠️ Implícito — mejor explicitar
return.md	❌ No genera — igual que los otros
Cambios necesarios	Los del checklist general + fix del path cuando implementes el RFC 024
Dale, mandá el design.