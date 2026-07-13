## TDD Mode — Estructura de Tasks

**Este feature usa TDD. Al crear las tasks, respeta esta estructura:**

Para cada tarea de implementación:
1. **Task de Tests**: Crear los tests que validen el comportamiento esperado.
2. **Task de Implementación**: Escribir el código que haga pasar los tests.
3. **Task de Verificación**: Correr los tests y confirmar que pasan.

**Reglas para el workflow:**
- Las tasks de tests van ANTES de las tasks de código.
- Cada task de tests debe mencionar explícitamente qué comportamiento valida.
- Las tasks de verificación deben incluir el comando exacto de test (ej. `pnpm test`).
- NO incluir tasks de refactor — eso queda para el worker después de que todo pase.