# Test Suite — Funky CLI

**Tipo:** Unit Tests (100% puros — sin I/O real)
**Runner:** Vitest `4.1.4`
**Comando:** `pnpm test` (dentro de `funky-cli/`)
**CI:** Corre automáticamente vía GitHub Actions en cada push/PR a `main`.

---

## Filosofía de Testing

Los tests de Funky CLI son **unitarios puros**. Esto significa:
- El módulo `fs` (filesystem) está mockeado con `vi.mock('fs')` — nunca se escribe en el disco real.
- La lógica de `commander` (el framework CLI) está **aislada**: los comandos exponen funciones puras (`runInit`, `runPhase`) que los tests llaman directamente.
- El `console.log`/`error` está silenciado con `vi.spyOn` para no contaminar la salida del runner.

**¿Por qué unitarios y no integration/E2E?**
- Velocidad: 10 tests en 220ms.
- Seguridad: nunca accidente en el disco del desarrollador.
- Determinismo: el resultado siempre es el mismo independientemente del entorno.

---

## Archivo: `sanity.test.js`

**Propósito:** Verificar que Vitest está correctamente instalado y configurado.

| ID | Descripción | Por qué importa |
|---|---|---|
| SANITY-001 | `should be true` | Si falla, el problema es el entorno (Node, Vitest, ESM), no el código |

---

## Archivo: `init.test.js`

**Comando testeado:** `funky init` → función `runInit(opts)`

**Contrato que protege:** `funky init` copia archivos del ecosystem bootstrap al proyecto del usuario. Nunca debe sobreescribir, nunca debe silenciar errores.

| ID | Descripción | Tipo | Por qué importa |
|---|---|---|---|
| INIT-001 | Crea todos los archivos si ninguno existe | Happy Path | Validación del flujo principal |
| INIT-002 | Saltea archivos que ya existen | Idempotencia | Correr `funky init` dos veces no destruye trabajo existente |
| INIT-003 | Crea solo los archivos que no existen (estado mixto) | Edge Case | Proyecto parcialmente inicializado — caso más común en la práctica |
| INIT-004 | Propaga el error si `copyFileSync` falla | Error Handling | Errores de permisos o disco lleno nunca se silencian |

---

## Archivo: `phase.test.js`

**Comando testeado:** `funky phase <nombre>` → función `runPhase(opts)`

**Contrato que protege:** `funky phase` inyecta un template SDD en el directorio del proyecto. No debe sobreescribir, debe ser case-insensitive, y debe fallar limpiamente con fases inexistentes.

| ID | Descripción | Tipo | Por qué importa |
|---|---|---|---|
| PHASE-001 | Inyecta el template correcto en el destino | Happy Path | Validación del flujo principal |
| PHASE-002 | Normaliza el nombre de fase a lowercase | UX / Edge Case | `funky phase TASKS` debe funcionar igual que `funky phase tasks` |
| PHASE-003 | Lanza error si el template no existe | Error Handling | Protección contra fases inventadas o mal escritas |
| PHASE-004 | No sobreescribe si el archivo ya existe en destino | Idempotencia | No destruye trabajo del usuario si el archivo ya fue modificado |
| PHASE-005 | Propaga el error si `copyFileSync` falla | Error Handling | Errores de filesystem no se silencian |

---

## Cobertura por Tipo

| Tipo de test | Cantidad | % del total |
|---|---|---|
| Happy Path | 2 | 20% |
| Idempotencia | 2 | 20% |
| Edge Cases / UX | 2 | 20% |
| Error Handling | 3 | 30% |
| Setup / Sanity | 1 | 10% |

> **Nota:** No tenemos tests de integración ni E2E actualmente. Los tests de integración serían el siguiente paso natural: escribir en una carpeta `tmp/` real y verificar que los archivos existan en disco.
