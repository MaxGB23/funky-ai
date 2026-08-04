---
name: sdd-docs-sync
description: "Trigger: cierre de sesión, doc update, actualizar docs. Sincroniza docs del SSOT y repo-map y verifica contra el CLI real antes de sdd-release."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "1.0"
---

# SDD Docs Sync

Cierra la documentación del repo al final del ciclo SDD, después de `sdd-archive` y antes de `sdd-release`. Garantiza que los docs espejen el comportamiento real del CLI (fuente de datos para `--help`).

## When to use

Tras `sdd-archive`, antes de `sdd-release` (o al cerrar cualquier sesión con cambios de código). El orquestador la sugiere cuando la sesión modificó comandos, flags, templates o estructura del repo.

## Hard Rules

1. **Safe-Contexting:** NUNCA leer el doc destino completo. Leer solo su `Índice Seccional` y aplicar `grep` quirúrgico sobre el doc.
2. **SSOT:** `.agents/templates/sdd/docs-live-index.md` es la fuente de verdad de qué docs existen. No editar un doc fuera del índice; registrar cualquier doc nuevo en él y crear su índice seccional.
3. **CLI es la verdad:** si cambió un comando, verificar el doc contra el CLI real (superficie y comportamiento, paso 4). Corregir el DOC, nunca afirmar algo que el CLI no muestre.
4. **repo-map solo por estructura:** actualizar `docs/repo-map.md` únicamente cuando cambian rutas, comandos o directorios — no por contenido.
5. Guardar el resultado en engram (`mem_save`) al terminar.

## Decision Gates

| Situación | Acción |
|-----------|--------|
| Cambió un comando/flag/fase | Actualizar su doc del SSOT + fila de comandos en repo-map si aplica |
| Cambió lógica de salida (exit codes, mensajes, shapes JSON) | Verificación de comportamiento (paso 4b) |
| Doc nuevo vital | Crear índice seccional + registrar en docs-live-index.md |
| Cambió estructura (dir/archivo clave) | Actualizar repo-map.md + su fecha |
| Solo refactor interno sin superficie de usuario | No tocar docs |
| Doc desalineado vs CLI real | Corregir el doc para espejar el CLI |

## Steps

### 1. Entrada

Leer `apply-progress` / `verify-report` del change y listar qué se modificó (comandos, flags, templates, estructura).

### 2. Matching contra SSOT

Consultar `docs-live-index.md` y marcar cada doc cuya condición "Aplica si..." coincida. No abrir los docs destino todavía.

### 3. Cirugía por doc

Para cada doc aplicable: leer su índice seccional, `grep` el subtítulo exacto y aplicar el cambio mínimo.

### 4. Verificación CLI (dos capas)

**4a. Superficie:** para cada comando modificado, ejecutar `node funky-cli/bin/funky.js <cmd> --help` y comparar flags/subcomandos con el doc. Cada subcomando de negocio del CLI debe tener su sección en el doc; los auxiliares de Commander (`help`, `--help`) no se documentan.

**4b. Comportamiento:** si cambió lógica de salida (exit codes, mensajes, shapes JSON), ejecutar los escenarios críticos que el doc afirma y comparar salida real vs afirmada. Ejemplo: `status --json` sin `context.json` → shape v2 not-started en stdout, exit 0. Ejecutar en directorio temporal de trabajo si el comando muta estado. Corregir el DOC cuando no coincida.

### 5. repo-map

Si cambió estructura: actualizar `docs/repo-map.md` (filas de comandos, árboles) y su fecha "Última actualización".

### 6. SSOT

Si hubo docs nuevos o índices modificados: crear/actualizar su índice seccional en `.agents/templates/sdd/docs-index/` y registrar en `docs-live-index.md`.

### 7. Cierre

Reportar docs tocados, verificaciones CLI (superficie y comportamiento) hechas y su resultado. Guardar en engram (`mem_save`) con el listado.

## Output Contract

Devolver: (1) docs modificados con ruta y cambio, (2) verificaciones CLI realizadas y su resultado (superficie + comportamiento), (3) índices/repo-map actualizados, (4) confirmación de guardado en engram.

## References

- `.agents/templates/sdd/docs-live-index.md` — SSOT de docs vivos y condición "Aplica si...".
- `.agents/templates/sdd/docs-index/{doc}.md` — índices seccionales por doc.
- `docs/repo-map.md` — mapa estructural del repo.