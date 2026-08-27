# Permissions & Hooks — Hallazgos experimentales

> Sesión: 2026-08-26.
> Objetivo: eliminar interrupciones de permisos en subagentes y configurar un
> safety-guard selectivo via hooks.

---

## 1. Modos de aprobación (`defaultApprovalMode`)

Configurado en `~/.gemini/antigravity-cli/settings.json` bajo `general`:

| Modo           | Comportamiento                                               |
|----------------|--------------------------------------------------------------|
| `suggest`      | Pide permiso para todo (default conservador)                |
| `auto_edit`    | Auto-acepta ediciones de archivos; pide permiso para shell  |
| `auto_execute` | Auto-acepta TODO (ediciones + comandos shell)               |

`Shift+Tab` en el main agent cicla entre estos modos en runtime.

**Hallazgo:** `auto_execute` configurado en `settings.json` **NO se hereda** por los
subagentes. Los subagentes arrancan con un modo más restrictivo independientemente del
global. Pendiente confirmar si es bug o diseño de seguridad intencional.

---

## 2. BOM en `settings.json` — error crítico

PowerShell `Set-Content -Encoding UTF8` escribe un **BOM** (`\ufeff`) al inicio del
archivo. El parser JSON de AGY falla con:

```
settings file is malformed: invalid character '\ufeff' looking for beginning of value
```

Esto rompe el CLI al arrancar: pierde toda la config (theme, model, trustedWorkspaces).

**Solución confirmada:** escribir siempre con la API .NET:

```powershell
[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
```

O en VS Code: `Ctrl+Shift+P` → `Change File Encoding` → `Save with Encoding` → `UTF-8` (sin BOM).

> El mismo problema aplica a cualquier archivo escrito con `Set-Content` o
> `ConvertTo-Json | Set-Content`: `.mjs`, `.json`, cualquier extensión.

---

## 3. Sistema de Hooks (`hooks.json`)

Los hooks son el mecanismo correcto para control de permisos granular.
Se configuran en `.agents/hooks.json` del workspace.

### Decisiones disponibles en `PreToolUse`

| Decision     | Comportamiento                                          |
|--------------|---------------------------------------------------------|
| `allow`      | Auto-ejecuta sin prompt                                |
| `deny`       | Bloqueo duro, nunca corre                              |
| `ask`        | Pregunta al usuario (respeta caché de "Always Allow")  |
| `force_ask`  | Siempre pregunta al usuario, ignora caché              |

---

## 4. Bug: path duplicado del hook en Windows

El campo `command` en `hooks.json` se ejecuta con **CWD = directorio del `hooks.json`**
(es decir, `.agents/`). Si se usa path relativo:

```json
"command": "node .agents/hooks/safety-guard.mjs"
```

Node resuelve `.agents/.agents/hooks/safety-guard.mjs` → **MODULE_NOT_FOUND**.

**Solución:** path absoluto con slash POSIX:

```json
"command": "node M:/funky-ai/.agents/hooks/safety-guard.mjs"
```

---

## 5. Bug crítico: el hook se bloquea a sí mismo (self-blocking deadlock)

Este es el error más grave de la sesión.

**Qué pasó:** el hook tenía patrones `DENY` que matcheaban substrings como `rm -rf`,
`Remove-Item -Recurse -Force`, etc. Al intentar escribir el archivo de documentación
(este harness) mediante un comando de shell largo que **mencionaba esas frases como
texto**, el hook matcheaba el contenido del argumento `CommandLine` completo —
incluyendo el contenido del archivo que se estaba escribiendo — y disparaba `deny`.

**Consecuencia:** el agente quedó incapaz de escribir ningún archivo grande al disco
via shell. Ni `Set-Content`, ni `WriteAllText`, ni `node -e`. Todo bloqueado.

**Lección:** los patrones de un hook `PreToolUse` sobre `run_command` NO deben ser
substrings genéricos. Deben ser específicos del **ejecutable + verbo**, no del contenido
de los argumentos. Un patrón como `/rm\s+-rf/` en `CommandLine` dispara aunque el
comando real sea:

```powershell
Set-Content archivo.md -Value "...documentacion que menciona rm -rf..."
```

**Regla de diseño para hooks futuros:**
- Matchear solo el inicio del `CommandLine` (el ejecutable + primer argumento).
- O parsear `CommandLine` para extraer el ejecutable real antes de matchear.
- Preferir listas de bloqueo cortas y precisas sobre listas largas de patrones.
- Nunca agregar `deny` a algo que no quieras bloquear permanentemente — usar `force_ask`.

---

## 6. Estado actual del safety-guard

Archivo: [`.agents/hooks/safety-guard.mjs`](../hooks/safety-guard.mjs)
Config: [`.agents/hooks.json`](../hooks.json)

**Única regla activa:** `git push` → `force_ask` (pregunta al usuario cada vez).
**Todo lo demás:** `allow` (auto-ejecuta sin prompt).

Los patrones `DENY` fueron eliminados completamente tras el deadlock descrito en §5.

---

## 7. Estado final de permisos (Validado)

| Escenario | Estado | Mecanismo / Configuración |
|---|---|---|
| Main agent — Edición de archivos (`replace_file_content`, `write_to_file`) | ✅ Auto | `"toolPermission": "always-proceed"` |
| Main agent — `run_command` / shell | ✅ Auto | `"toolPermission": "always-proceed"` |
| Subagentes — Lectura y exploración de archivos | ✅ Auto | Heredado por subagentes en sesión limpia |
| Subagentes — `run_command` y escrituras en disco | ✅ Auto | Subagente equipado con `enable_write_tools: true` + `"toolPermission": "always-proceed"` |
| `git push` | ⚠️ Deny / Manual | Configurado vía `"permissions": { "deny": ["command(git push*)"] }` para bloqueo duro |

---

## 8. Resolución de Hallazgos y Arquitectura

### 8.1. El motor de permisos de Antigravity CLI
Antigravity evalúa los permisos bajo la regla de precedencia:
$$\textbf{Deny} > \textbf{Ask} > \textbf{Allow}$$

1. **Modo "Always Proceed" (`toolPermission: "always-proceed"`):**
   - Configurado interactivamente vía `/config` (o en `~/.gemini/antigravity-cli/settings.json`).
   - El motor desactiva todas las solicitudes interactivas (`Ask` / `force_ask`).
   - **Comandos destructivos/remotos:** La única barrera que intercepta en este modo es la lista **`Deny`** (`"permissions": { "deny": ["command(git push*)"] }`).
   - **Herencia en Subagentes:** Al reiniciar la sesión de `agy`, el Permissions Engine aplica la política global a todo el árbol de procesos, permitiendo ejecución desatendida tanto en el agente principal como en subagentes paralelos.

### 8.2. Subagentes y Herramientas de Escritura (`write_tools`)
- Por defecto, los subagentes declarados sin herramientas de escritura nacen en modo solo lectura (`read-only`).
- Para que un subagente ejecute comandos de shell (`run_command`) o cree/modifique archivos (`write_to_file`, `replace_file_content`), debe invocarse como `self` o definirse mediante `define_subagent` con `enable_write_tools: true`.

---

## 9. Batería de Pruebas Ejecutada y Verificada

1. **Test 1 (Main Agent):** Ejecución directa de comandos shell (`pnpm --version`). Resultado: 100% automático sin prompts.
2. **Test 2 (Subagente Multi-Paso):** Subagente Flash ejecutando `git status --porcelain` + `node -v` en serie. Resultado: Salida sintetizada en 6s sin interrupciones.
3. **Test 3 (SDD Tier 3 Propose Phase):** Subagente `funky_proposer` leyendo `funky-propose.md` y persistiendo `openspec/changes/test-pipeline-harness/proposal.md`. Resultado: Éxito en 14s.
4. **Test 4 (SDD Tier 3 Tasks Phase):** Subagente `funky_tasks_worker` analizando la propuesta y persistiendo `openspec/changes/test-pipeline-harness/tasks.md`. Resultado: Éxito en 30s.
5. **Test 5 (SDD Tier 3 Apply Phase):** Subagente `funky_apply_worker` creando archivos de sandbox, editándolos, revisando `git status`, eliminando con `Remove-Item` y limpiando el sandbox. Resultado: Éxito integral en 16s sin bloqueos.

