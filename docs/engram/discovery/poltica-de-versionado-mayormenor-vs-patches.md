### [DISCOVERY][versioning-policy] Política de Versionado: Mayor/Menor vs Patches
**What:** En versiones mayores y menores (ej. `v1.8.0`, `v1.9.0`), se debe crear un archivo de release notes oficial (`docs/funky-ai/releases/vX.Y.Z-release.md`). Para parches y fixes (ej. `v1.8.1`), NO se crean release notes separados.
**Why:** Crear archivos de release notes para patches menores genera ruido documental y fragmenta la lectura del proyecto.
**Where:** Protocolo de Cierre de Sesión y Tareas de Release.
**Learned:** Para fixes y patches, el registro debe vivir exclusivamente en tres lugares: (1) Extracción de aprendizaje al Engram (`discoveries.md` / `bugfixes.md`, etc.), (2) Bump de versión y registro en `ORCHESTRATOR-STATE.md`, y (3) Commits convencionales en Git.