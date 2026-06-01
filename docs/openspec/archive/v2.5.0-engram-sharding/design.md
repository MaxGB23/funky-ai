# Design: Engram Sharding y Comando Add

> **ORCHESTRATOR GATE**: If you loaded this skill, you are the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to the dedicated design worker/sub-agent.

## 1. Approach
Crear un script de migración standalone para fragmentar el historial heredado a directorios categóricos, implementar el comando interactivo/headless `funky engram add` para inyección atómica, modificar `init.js` para generar el scaffolding de los directorios en vez de archivos monolíticos, y refactorizar templates/reglas para usar `grep_search` recursivo sobre el directorio `docs/engram/`.

## 2. Architecture Decisions

| Decisión | Opción elegida | Alternativas descartadas | Rationale |
|----------|---------------|--------------------------|-----------|
| **Estructura de Storage** | Archivos individuales por tag en subdirectorios | Index JSON centralizado | Evita cuellos de botella (Single Point of Failure), respeta la filosofía Markdown-first y genera git diffs limpios. |
| **Migración** | Script Node standalone (`scripts/migrate-engram.js`) | Comando CLI temporal (`funky engram migrate`) | Es una operación "one-off" que no debe ensuciar el binario de la CLI a largo plazo. |
| **Actualización de Index** | Append automático en `index.md` al hacer `engram add` | Reconstrucción total dinámica | Un append es O(1) y previene la latencia/drift de reconstruir un AST Markdown cada vez. |

## 3. Data Flow

```text
Usuario / Agente 
       │
       ▼
CLI (funky engram add) ───[flags o prompts]───→ Inyección Atómica
       │                                              │
       ├──────────────────────────────────────────────┤
       ▼                                              ▼
docs/engram/index.md (Append fila)    docs/engram/<categoria>/<tag>.md (Crea archivo)
```

## 4. File Changes

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `funky-cli/src/commands/engram.js` | Create | Lógica pura (`runEngramAdd`) y wrapper de Commander/Inquirer. |
| `funky-cli/bin/funky.js` | Modify | Registrar e importar el nuevo comando `engram`. |
| `funky-cli/src/commands/init.js` | Modify | Reemplazar copias de archivos por `fs.mkdirSync` para los 5 directorios categóricos. |
| `scripts/migrate-engram.js` | Create | Script auxiliar de una sola ejecución para parsear y fragmentar historial heredado. |
| `.agents/rules/` y `templates/` | Modify | Múltiples replaces para cambiar lecturas de archivos planos por `grep_search`. |

## 5. Interfaces / Contracts

```javascript
/**
 * Opciones para la función pura de inyección de engrama.
 */
interface EngramAddOptions {
  tag?: string; // e.g., "[nuevo-patron]"
  category?: 'architecture' | 'pattern' | 'discovery' | 'decision' | 'bugfix';
  description?: string;
  cwd: string;
}
```

## 6. Testing Strategy

| Layer | Qué testear | Approach |
|-------|-------------|----------|
| Unit | Lógica pura `runEngramAdd` | Mockear `fs` (Vitest) para asegurar que el archivo Markdown se crea en el subdirectorio correcto y que `index.md` recibe el append. |
| Integration | Comando CLI `engram add` | Validar que la ausencia de flags detona `@inquirer/prompts` y la presencia de flags ejecuta el flujo desatendido. |

## 7. Open Questions

- [ ] `[NICE-TO-HAVE]` ¿El script de migración debería intentar inferir la categoría (basado en palabras clave como "fix" o "patrón") o debería volcar todo a `discovery/` por defecto para clasificación manual posterior?

---

> **[SISTEMA - PARA EL ORQUESTADOR]** Si el diseño es aprobado y no hay blockers abiertos, procedé a generar el `tasks.md`.
