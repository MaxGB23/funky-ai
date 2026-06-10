# Seguridad

> **Veredicto:** AGY CLI gana por defecto — ningún comando se ejecuta sin aprobación explícita del usuario.

---

## OpenCode

Modelo de permisos **declarativo y configurable** en `opencode.json`:

```json
"permissions": {
  "bash": {
    "git commit *":     "ask",     // pide aprobación para commits
    "npm install *":    "allow",   // ejecuta sin preguntar
    "rm -rf *":         "deny"     // bloqueado siempre
  },
  "read": {
    ".env":             "deny",
    "credentials.json": "deny"
  }
}
```

**Características:**
- Granularidad por comando con glob patterns
- 3 niveles: `allow` (sin preguntar), `ask` (pide aprobación), `deny` (bloqueado)
- Legible y auditable en el JSON de configuración
- El usuario puede configurar `allow` para ciertos comandos → **el agente ejecuta sin preguntar**

**Trade-off:** Mayor velocidad de ejecución a cambio de menor protección. Si configurás algo mal con `allow`, el agente lo ejecuta sin que lo veas.

---

## Antigravity CLI

Modelo de permisos **por aprobación explícita siempre**:

### Comandos de terminal

La tool `run_command` propone el comando al usuario antes de ejecutarlo. **No hay bypass posible** — siempre aparece el prompt de aprobación en la UI.

```
[run_command propone]: pnpm install
[Usuario aprueba/rechaza] → solo entonces ejecuta
```

### Acceso a archivos

Si el agente intenta leer/escribir fuera de su scope o si el sistema bloquea por permisos:
1. La tool falla
2. El agente usa `ask_permission` con campos obligatorios:
   - `Action`: `read_file` | `write_file` | `command` | `execute_url` | etc.
   - `Target`: path específico (no wildcards)
   - `Reason`: por qué necesita acceso

**Principio de mínimo privilegio:** `ask_permission` instruye explícitamente al agente a pedir el scope más estrecho posible — nunca pedir `/` o `*`.

---

## Comparativa

| Aspecto | OpenCode | AGY CLI |
|---|---|---|
| Modelo base | Matriz declarativa configurable | Aprobación siempre requerida |
| Bypass posible | ✅ Con `"allow"` en config | ❌ No hay bypass |
| Granularidad | Por comando con globs | Por tool + scope de path |
| Auditabilidad | ✅ Visible en JSON | ⚠️ Solo en runtime (logs) |
| Velocidad de ejecución | Mayor (con `allow`) | Menor (siempre pide) |
| Riesgo de ejecución accidental | Presente si mal configurado | Prácticamente nulo |

---

## Implicación para orquestación

En un Orquestador, la seguridad por defecto de AGY CLI es **una ventaja**: el orquestador puede proponer comandos de alto impacto sin riesgo de ejecución accidental. El humano siempre tiene la última palabra.

En Workers de larga duración (muchas operaciones de archivo), la fricción de aprobación constante puede ser molesta. Por eso el setup híbrido actual (IDE como Worker con su propio modelo de permisos) tiene sentido operativo.
