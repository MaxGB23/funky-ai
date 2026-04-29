# Auditoría de Archivos y Carpetas Huérfanos

## Carpetas Sospechosas / En Desuso (Raíz)
- `M:\funky-ai\legacy\` (Identificado en Phase 1 como carpeta obsoleta)
- `M:\funky-ai\testeo-de-features\` (Identificado en Phase 1 como carpeta obsoleta)
- `M:\funky-ai\openspec\` (Parece ser una estructura SDD duplicada fuera de `docs/`)
- `M:\funky-ai\color-highlight-v2\` (Posible feature huérfana en la raíz)

## Archivos Artifacts Flotantes o Mal Ubicados
Los siguientes archivos SDD (report, explore, spec, tasks, worker-handoff) fueron encontrados fuera del directorio correcto `docs\openspec\changes\`:

**Posibles Basuras / Archivos a Eliminar:**
- `M:\funky-ai\testeo-de-features\v1.7\headless\report.md`
- `M:\funky-ai\docs\funky-ai\v1.1.0\report.md`

**Artefactos SDD ubicados en `M:\funky-ai\openspec\` (Deberían estar en `docs\openspec\`):**
- `M:\funky-ai\openspec\changes\v1-7-critical-audit\explore.md`
- `M:\funky-ai\openspec\changes\v1-7-critical-audit\report.md`
- `M:\funky-ai\openspec\changes\v1-7-critical-audit\spec.md`
- `M:\funky-ai\openspec\changes\v1-7-critical-audit\tasks.md`
- `M:\funky-ai\openspec\changes\v1-7-critical-audit\worker-handoff.md`
- `M:\funky-ai\openspec\changes\v1-7-scaffolding-fixes\explore.md`
- `M:\funky-ai\openspec\changes\v1-7-scaffolding-fixes\report.md`
- `M:\funky-ai\openspec\changes\v1-7-scaffolding-fixes\spec.md`
- `M:\funky-ai\openspec\changes\v1-7-scaffolding-fixes\tasks.md`
- `M:\funky-ai\openspec\changes\v1-7-scaffolding-fixes\worker-handoff.md`

**Artefactos Archivados (Verificar si se mantienen):**
- `M:\funky-ai\docs\openspec\archive\cli-canvas-v2\report.md`
- `M:\funky-ai\docs\openspec\archive\cli-canvas-v2\tasks.md`
- `M:\funky-ai\docs\openspec\archive\cognitive-audit\explore.md`
- `M:\funky-ai\docs\openspec\archive\cognitive-audit\report.md`
- `M:\funky-ai\docs\openspec\archive\cognitive-audit\tasks.md`
- `M:\funky-ai\docs\openspec\archive\cognitive-audit\worker-handoff.md`
- `M:\funky-ai\docs\openspec\archive\smoke-test-v1-7\explore.md`
- `M:\funky-ai\docs\openspec\archive\smoke-test-v1-7\spec.md`
- `M:\funky-ai\docs\openspec\archive\smoke-test-v1-7\tasks.md`

> **Nota importante:** Se excluyeron de esta lista los archivos en `M:\funky-ai\funky-cli\src\templates\sdd\` dado que son plantillas y no huérfanos.
