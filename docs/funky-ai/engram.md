# funky engram add — Knowledge Base

## ¿Qué problema resuelve?

Capturar conocimientos, decisiones técnicas y bugs en una base estructurada dentro del repositorio. Cada engrama se guarda como un archivo Markdown individual con campos predefinidos, y se indexa automáticamente en un índice central.

## Requisitos (Automatizados)

Para que los agentes de IA utilicen el protocolo de engramas de manera autónoma, es fundamental que exista la regla (`engram-protocol.md`) en el proyecto destino (`.agents/rules/`).

**¡No te preocupes por configurarlo manualmente!** El CLI lo maneja de forma automática por ti:
1. **Ecosistema Completo:** Al ejecutar `funky sdd install`, se instalan preventivamente todas las reglas y la estructura de carpetas (`docs/engram/*`).
2. **Modo Standalone:** Si prefieres no usar el scaffold, simplemente ejecuta `funky engram add`. El comando inyectará automáticamente la regla faltante en `.agents/rules/` y creará las carpetas requeridas al vuelo (*on-demand*) la primera vez que lo necesites.

## Uso

El comando puede utilizarse de forma interactiva (prompts) o automatizada mediante flags:

```bash
# Modo interactivo
funky engram add

# Modo con flags (ideal para IA)
funky engram add --tag "fix-cors" --category "bugfix" --desc "Arregla problema de CORS en preflight"
```

## Categorías disponibles

| Categoría     | Uso |
|---------------|-----|
| `architecture` | Decisiones de arquitectura, estructura del proyecto, diseño de componentes |
| `pattern`      | Patrones de diseño, convenciones, idioms adoptados |
| `discovery`    | Hallazgos técnicos, comportamientos inesperados, aprendizajes |
| `decision`     | Decisiones con tradeoffs explícitos (librería X sobre Y) |
| `bugfix`       | Bugs corregidos, causa raíz y solución aplicada |
| `session`      | Resúmenes de sesión de trabajo (acomplished / next steps) |
| `release`      | Notas de release, versiones, changelog |

## Qué genera

- **Archivo individual:** `docs/engram/{category}/{tag}.md` con el siguiente template:

```markdown
### [{TYPE}][{tag}] {desc}

**Date:** {YYYY-MM-DD}
**What:**
**Why:**
**Where:**
**Learned:**
```

- **Índice central:** `docs/engram/index.md` — se crea automáticamente si no existe y se actualiza con cada nuevo engrama agregando una entrada con link en la sección de la categoría correspondiente.

## Flags

| Flag                     | Descripción |
|--------------------------|-------------|
| `-t, --tag <tag>`        | Identificador del engrama (ej. `fix-auth`, `add-pipeline`). Se sanitiza a kebab-case. |
| `-c, --category <category>` | Categoría del engrama. Si no se provee, se solicita por selector interactivo. |
| `-d, --desc <desc>`      | Descripción breve de una línea. Si no se provee, se solicita por prompt. |

## Buenas prácticas

### Cuándo capturar un engrama

- **Bugfix:** inmediatamente después de corregir un bug, antes de pasar a otra tarea.
- **Decisión:** en el momento en que se toma la decisión, con los tradeoffs frescos.
- **Descubrimiento:** en cuanto encuentres algo que no esperabas y que podría ser relevante después.
- **Arquitectura:** antes o inmediatamente después de implementar un cambio estructural.
- **Pattern:** cuando establecés una convención o repetís una solución por segunda vez.
- **Session:** al finalizar una sesión de trabajo.

### Qué poner en cada campo

| Campo     | Contenido esperado |
|-----------|--------------------|
| **What**  | Una línea que describa qué se hizo. Debe poder leerse standalone. |
| **Why**   | Qué motivó el cambio: bug, request, mejora, deuda técnica. |
| **Where** | Archivos o módulos afectados. Usar rutas relativas al proyecto. |
| **Learned** | Cosas que aprendiste en el proceso: gotchas, edge cases, comportamientos no obvios. |

### Reglas

- No sobrescribe engramas existentes. Si el tag ya existe, avisa y aborta.
- Los tags se sanitizan automáticamente: espacios a guiones, caracteres especiales removidos, todo minúscula.
- Siempre mantener el índice actualizado (se hace automáticamente al agregar).
- Los engramas no reemplazan los tests o la documentación de API; son complemento contextual.
