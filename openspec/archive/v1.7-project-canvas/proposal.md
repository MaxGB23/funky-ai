# 🛠️ Propuesta Arquitectónica: v1.7 Project Canvas Dinámico

## 🎯 Objetivo
Evolucionar el comando `funky init` hacia un modelo dual (Headless/Interactivo) para la definición de la arquitectura inicial:
1. **Modo SDD (PRD-First):** Capacidad de consumir un `PROJECT-CANVAS.md` previamente planificado por el Orquestador para inicializar el ecosistema en silencio.
2. **Modo CLI (Interactivo):** Generador dinámico con prompts para usuarios humanos que inician un proyecto desde cero.

## 🏛️ Pilares Arquitectónicos del Canvas
Ya sea redactado por el Orquestador o generado vía prompts, el documento define:

1. **Patrón Arquitectónico Base:** (Ej: Clean Architecture, Modular, MVC, Feature-Sliced).
2. **Gestión de Estado y Datos:** (Ej: Signals, Zustand, React Query vs SWR).
3. **Ecosistema y Tooling:** (Package manager, Husky + lint-staged, Monorepo).
4. **Estrategia de Estilos y UI:** (Tailwind, Vanilla CSS, Headless UI).
5. **Testing y CI/CD:** (TDD Estricto vs Convencional, Vitest, Playwright, GitHub Actions).
6. **SecOps y Entornos:** (Manejo de secretos, validación de variables de entorno con Zod).

## ⚙️ Implementación Técnica (Bajo el Capot)

### 1. Interfaz de Usuario y Flujo Dual (CLI)
En la función `action()` de `init.js` de Commander, el flujo será:
- **Detección Headless:** Revisa si existe `PROJECT-CANVAS.md`. Si existe, lo lee y extrae la configuración (ideal para flujos automatizados de Funky AI).
- **Fallback Interactivo:** Si no existe, integra una librería como `@clack/prompts` para capturar las decisiones del usuario, armar el `canvasConfig` y generar el archivo físico.

### 2. Refactor de la lógica Core (`runInit()`)
La función pura `runInit(opts)` se modificará para aceptar `canvasConfig` como parámetro. Tendrá un flujo dual:
- **Flujo Estático:** Continúa usando `fs.copyFileSync` para archivos inmutables como las reglas de sistema en `.agents/rules/`.
- **Flujo Dinámico:** Pasará el `canvasConfig` a una función generadora pura (ej: `generateCanvasMarkdown(config)`), la cual hará string interpolation para construir el markdown, escribiéndolo finalmente con `fs.writeFileSync`.

### 3. Estrategia de Testing (La Regla de Oro)
- **Unit Tests:** Al separar la captura (Commander) de la inyección (`runInit`), se testeará `runInit` inyectándole mocks de `canvasConfig` para validar la correcta generación del string de markdown, sin interactuar con la consola.
- **Integration Tests:** Se ejecutará `runInit` contra un directorio `tmp/` real asegurando que `fs.writeFileSync` persista correctamente el `PROJECT-CANVAS.md` físico.
