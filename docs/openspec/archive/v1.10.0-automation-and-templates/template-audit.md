# Auditoría de Templates (Phase 2.5)

## 1. Auditoría de `release.md`

**Hallazgos:**
- El template canónico requiere una sección de `### 🧪 Tests` (con placeholders de cantidad de tests pasando y cobertura). Al comparar con releases reales (ej. `v1.9.0-release.md`, `v1.8.0-release.md`), esta sección frecuentemente se omite porque es burocracia repetitiva (el CI/CD ya valida esto).
- Las releases reales suelen incluir tanto nuevas features como cambios de arquitectura en una sola sección llamada "Nuevas Funcionalidades y Refactor".

**Decisión (Pragmatismo):**
- **Eliminar** la sección `### 🧪 Tests` del template canónico. Si no se usa en la práctica, es ruido.
- **Renombrar** `### ✨ Nuevas Funcionalidades` a `### ✨ Nuevas Funcionalidades y Refactor` para alinearse con el golden path de las notas de versión reales.

## 2. Auditoría de `README.md`

**Hallazgos:**
- El template actual `funky-cli/src/templates/README.md` (creado en Fase 2) es simplemente un clon del `README.md` de la herramienta CLI. Describe comandos (`funky init`, `funky phase`), pero **no sirve** como template para la raíz de un proyecto de usuario.
- El `README.md` de la raíz del repositorio (`m:\funky-ai\README.md`) actúa como un "Mapa de Navegación" (Architecture Hub), enlazando manuales, core concepts, y el Falso Engram. Este es el verdadero Golden Path.

**Decisión (Pragmatismo):**
- **Refactorizar** `funky-cli/src/templates/README.md` para que sea una plantilla de "Architecture Hub" genérica. Cuando alguien inicie un proyecto con Funky AI, debe tener un README que enlace su `PROJECT-CANVAS.md`, su `ORCHESTRATOR-STATE.md`, y su carpeta `docs/engram/`.
- No pedir datos redundantes. El template solo debe estructurar los puntos de entrada para la colaboración IA-Humano.
