---
name: sdd-docs-sync
description: "Trigger: cierre de sesión, doc update, actualizar docs. Sincroniza docs del SSOT y repo-map al final del ciclo SDD."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "1.0"
---

# SDD Docs Sync

Cierra la documentación del repo al final del ciclo SDD, después de `sdd-archive` y antes de `sdd-release`. Garantiza que los docs espejen lo que el change realmente implementó.

## When to use

Tras `sdd-archive`, antes de `sdd-release` (o al cerrar cualquier sesión con cambios de código). El orquestador la sugiere cuando la sesión modificó comandos, flags, templates o estructura del repo.

## Hard Rules

1. **Safe-Contexting:** NUNCA leer el doc destino completo. Leer solo su `Índice Seccional` y aplicar `grep` quirúrgico sobre el doc.
2. **SSOT condicional:** si existe `.agents/templates/sdd/docs-live-index.md`, es la fuente de verdad de qué docs existen. Si NO existe (proyecto sin `funky scaffold`/`funky skills`), inicialízalo: crea `.agents/templates/sdd/docs-live-index.md` con el header canónico (estructura de tabla SSOT de esta skill) y registra en él cada doc que esta skill cree o modifique. No editar un doc fuera del índice; registrar cualquier doc nuevo en él y crear su índice seccional.
3. **Cambio es la verdad:** si cambió un comando, flag o fase, verificar el doc contra los artefactos del change (`apply-progress`/`verify-report`) y el estado real del repo. Corregir el DOC, nunca afirmar algo que el change no respalde.
4. **repo-map solo por estructura:** actualizar `docs/repo-map.md` únicamente si existe y cuando cambian rutas, comandos o directorios — no por contenido. Si no existe, no crearlo.
5. Guardar el resultado en engram (`mem_save`) al terminar.

## Decision Gates

| Situación | Acción |
|-----------|--------|
| Cambió un comando/flag/fase | Actualizar su doc del SSOT + fila de comandos en repo-map si aplica |
| Cambió lógica de salida (exit codes, mensajes, shapes JSON) | Verificar contra los artefactos del change (apply-progress/verify-report) |
| Doc nuevo vital | Crear índice seccional (formato canónico) + registrar en docs-live-index.md |
| Cambió estructura (dir/archivo clave) | Actualizar repo-map.md + su fecha (si existe) |
| Solo refactor interno sin superficie de usuario | No tocar docs |
| Doc desalineado vs cambio real | Corregir el doc para espejar el change |

## Steps

### 1. Entrada

Leer `apply-progress` / `verify-report` del change y listar qué se modificó (comandos, flags, templates, estructura).

### 2. Matching contra SSOT

Si existe `docs-live-index.md`, consultarlo y marcar cada doc cuya condición "Aplica si..." coincida. No abrir los docs destino todavía. Si NO existe, inicializarlo (paso 5) antes de continuar.

### 3. Cirugía por doc

Para cada doc aplicable: leer su índice seccional, `grep` el subtítulo exacto y aplicar el cambio mínimo.

### 4. repo-map

Si cambió estructura y existe `docs/repo-map.md`: actualizar filas de comandos/árboles y su fecha "Última actualización". Si no existe, omitir este paso.

### 5. SSOT

Si hubo docs nuevos o índices modificados: crear/actualizar su índice seccional en `.agents/templates/sdd/docs-index/` con el formato canónico (`# Índice de Secciones: \`docs/<ruta>.md\`` + bullets `- **N. Título:** descripción` + anidamiento por sangría; usar `.agents/templates/sdd/docs-index/_indice-seccional-template.md` como base si existe) y registrar en `docs-live-index.md` (creándolo primero si no existe).

### 6. Cierre

Reportar docs tocados y verificaciones hechas y su resultado. Guardar en engram (`mem_save`) con el listado.

## Output Contract

Devolver: (1) docs modificados con ruta y cambio, (2) verificaciones realizadas y su resultado, (3) índices/repo-map actualizados, (4) confirmación de guardado en engram.

## References

- `.agents/templates/sdd/docs-live-index.md` — SSOT de docs vivos y condición "Aplica si..." (se crea si no existe).
- `.agents/templates/sdd/docs-index/_indice-seccional-template.md` — formato canónico del índice seccional.
- `docs/repo-map.md` — mapa estructural del repo (solo si existe).
