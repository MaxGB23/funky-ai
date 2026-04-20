# Propuesta v1.6: Inyección de TDD y CI en Funky CLI

## Resumen Ejecutivo
Implementar TDD (Test-Driven Development) usando **Vitest** en el CLI de Funky AI, y asegurar la calidad del código estableciendo un pipeline de Integración Continua (CI) en **GitHub Actions**.

## ¿Por qué esto es fundamental? (Momento de aprendizaje)
Como desarrollador, no podés escribir código ciego. El TDD no se trata solo de "probar código", es una **herramienta de diseño**. Escribir el test primero te obliga a pensar en *cómo* se va a usar tu código antes de implementarlo. 

Y la CI (GitHub Actions) es nuestro patovica (guardia de seguridad). Se asegura de que ningún código roto entre a la rama principal. ¡Es automatizar la disciplina!

## Solución Propuesta
1. **Testing:** Agregar `vitest` al ecosistema de `funky-cli`.
2. **Setup TDD:** Configurar los scripts de NPM (`npm run test`, `npm run test:watch`).
3. **CI Pipeline:** Crear `.github/workflows/ci.yml` que instale dependencias, corra linter y corra los tests en cada push o pull request.
4. **Refactorización Testeable:** Asegurar que las funciones del CLI puedan ser probadas inyectando dependencias (ej. mockeando llamadas al filesystem).
