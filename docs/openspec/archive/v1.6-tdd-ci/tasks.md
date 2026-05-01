# Plan de Ejecución (Tasks) - v1.6 TDD y CI

> 🤖 **Instrucción para el Worker:** Cada fase debe ejecutarse por separado. Al terminar una fase, actualizá el `report.md` de la carpeta del cambio y pedile al humano que vuelva al Orquestador.

## 🟢 Fase 0: Control de Versiones (Git)
- **Tarea:** Crear y cambiar a una nueva rama para esta feature: `git checkout -b feat/v1.6-tdd-ci`.
- **Nota:** NUNCA debemos trabajar directo en `main` cuando estamos agregando infraestructura nueva.

## 🟢 Fase 1: Setup Core TDD
- **Tarea:** Instalar `vitest` en `funky-cli`.
- **Tarea:** Configurar los scripts de test en el `package.json`.
- **Tarea:** Escribir un test "dummy" (`tests/sanity.test.js`) de prueba y asegurarse de que `npm test` pase.

## 🟢 Fase 2: Aplicando TDD a los Comandos
- **Tarea:** Implementar el primer test real (fallando) para un comando pequeño o utilidad.
- **Tarea:** Implementar los mocks necesarios (`fs`, `path`, etc.) en Vitest para que el test sea puramente unitario.
- **Tarea:** Asegurarnos de que el coverage inicial sea representativo para comandos core (`init.js` y `phase.js`). No buscamos 100% hoy, pero sí la base estructural.

## 🟢 Fase 3: CI/CD Pipeline
- **Tarea:** Crear el directorio `.github/workflows/` en el root del repositorio.
- **Tarea:** Escribir `ci.yml` configurado para ejecutar los tests de `funky-cli` usando Node 20 y `pnpm` (NO npm — SecOps).
- **Tarea:** Validar la sintaxis del YAML y asegurarse de que apunte al directorio `funky-cli`.

---
*Fin de las fases para la v1.6.*
