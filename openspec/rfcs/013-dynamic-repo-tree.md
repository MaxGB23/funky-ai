# RFC: 013 - Comando de Generación Dinámica de Árbol (Dynamic Repo Tree)

> **Estado:** Draft
> **Tipo:** Feature (CLI / Tooling)
> **Motivación:** Evitar la putrefacción de documentación (Doc Rot) al intentar mantener un mapa estricto de cada archivo del repositorio a mano.

## 1. El Problema
Actualmente contamos con un mapa de alto nivel (`docs/repo-map.md`) que modela los dominios principales de la arquitectura. El usuario planteó el deseo de tener este nivel de detalle desglosado archivo por archivo (ej. documentar qué hace exactamente `/docs/engram/discoveries.md`). 
Mapear esto de forma estática en un Markdown es un antipatrón, ya que la documentación queda obsoleta con el primer commit que agregue, elimine o modifique un archivo, generando desconfianza en la documentación ("Ghost Docs").

## 2. La Propuesta
Crear un comando dentro del ecosistema (ej. `funky tree` o un script en `.agents/scripts/`) que genere el árbol completo de directorios y archivos de forma **estrictamente dinámica**.

### 2.1 Mecanismo de Extracción Semántica
En lugar de solo listar archivos como el comando `tree` del OS, el generador leerá metadatos para entender el propósito real del archivo:
1. **Frontmatter / Cabeceras:** Analizará las primeras `N` líneas de cada archivo buscando comentarios estandarizados (ej. `// Propósito: ...` en `.js`) o YAML frontmatter en archivos `.md`.
2. **Directorios:** Leerá un archivo `index.md` o `README.md` localizado dentro de una carpeta para inferir el rol macro de ese directorio.

### 2.2 Output Esperado
El script escupirá por stdout (o a un archivo no versionado en memoria temporal) un árbol renderizado en texto, anexando la descripción al lado de cada nodo:
```text
/funky-cli
 ├── /src
 │    ├── init.js     - Comando de copiado de ecosystem bootstrap.
 │    └── phase.js    - Comando de inyección de templates SDD.
```

## 3. Tradeoffs
- **Pro:** La documentación del árbol siempre representará el 100% de la realidad física del código, sin costos de mantenimiento manual.
- **Contra:** Obliga a los desarrolladores a mantener un estándar estricto de comentarios/cabeceras en los archivos críticos para que el árbol no quede vacío en sus descripciones.
- **Contra:** Parsear cabeceras de miles de archivos en repositorios inmensos puede degradar la performance si no se excluyen correctamente las carpetas de dependencias (`node_modules`, `vendor`) o si no se aplican estrategias de caché.

## 4. Criterios de Éxito
- Ejecutar el comando en la raíz genera un log en consola con el mapa completo y anotaciones semánticas, ignorando correctamente la basura del sistema.
