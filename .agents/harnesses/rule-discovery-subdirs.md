# Experimento: Descubrimiento de rules en subdirectorios

**Fecha:** 2026-08-26
**Hipotesis:** Las conditional rules en subdirectorios de \.agents/rules/\ se cargan igual que las del directorio raiz.

## Archivos de prueba creados

| Archivo | Trigger |
|---|---|
| \.agents/rules/tier2-delegation/test-always-on.md\ | Always active |
| \.agents/rules/tier2-delegation/test-model-decision.md\ | Model decision |

## Resultado

**Los archivos existen en el repo pero no fueron detectados como conditional rules.**

Solo el directorio \.agents/rules/\ de primer nivel tiene conditional rules registradas.
Los subdirectorios como \	ier2-delegation/\ y \	ier3-interactive/\ no son descubiertos automaticamente.

## Conclusion

El sistema de discovery de rules es **plano (no recursivo)**. Un archivo en \.agents/rules/subdir/foo.md\ existe en el filesystem pero el agente no tiene acceso a el como rule activa a menos que:

1. El usuario pida explicitamente leerlo via \iew_file\.
2. Una rule padre lo referencie y ordene su lectura.
3. Se registre explicitamente en la configuracion del proyecto.

## Implicacion practica

Las rules en subdirectorios (\	ier2-delegation/\, \	ier3-interactive/\, etc.) son **hojas de instruccion manual**, no conditional rules autonomas. Deben ser invocadas, no esperarse que se activen solas.
