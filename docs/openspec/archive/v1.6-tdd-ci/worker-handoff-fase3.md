# Worker Handoff — v1.6 Fase 3: CI/CD Pipeline

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/v1.6-tdd-ci/worker-handoff-fase3.md Ejecutá la Fase 3`

---

## 🎯 Misión
Crear el pipeline de CI/CD en GitHub Actions para que los tests de `funky-cli` se ejecuten automáticamente en cada push o pull request a la rama `main`.

## 📂 Contexto del Repositorio

- **Rama activa:** `feat/v1.6-tdd-ci`
- **Directorio del paquete:** `funky-cli/`
- **Test runner:** Vitest (`pnpm test` ejecuta `vitest run`)
- **Package manager:** `pnpm` — **OBLIGATORIO, sin excepción (SecOps)**

## ✅ Tareas

### 1. Crear el directorio de workflows
- Crear `.github/workflows/` en el root del repositorio (`m:\funky-ai\`).

### 2. Crear el archivo `ci.yml`
- Path: `.github/workflows/ci.yml`
- El workflow debe:
  - Dispararse en `push` y `pull_request` sobre la rama `main`
  - Correr en `ubuntu-latest`
  - Usar Node.js 20
  - Configurar `pnpm` usando `pnpm/action-setup@v4`
  - Instalar dependencias con `pnpm install --frozen-lockfile` dentro de `./funky-cli`
  - Ejecutar `pnpm test` dentro de `./funky-cli`

### 3. Validar sintaxis del YAML
- Asegurarte de que el YAML sea válido (indentación correcta, sin tabs).
- Verificar que el `working-directory` apunte correctamente a `./funky-cli`.

## ⚠️ Restricciones Críticas

- **NO usar `npm` ni `yarn`** bajo ninguna circunstancia. El `package.json` declara `"packageManager": "pnpm@10.23.0"`.
- **NO modificar** ningún archivo de tests ni de código fuente. Esta fase es exclusivamente de infraestructura CI.
- Si el workflow necesita el `pnpm-lock.yaml`, recordar que debe existir en `funky-cli/`. Si no existe, notificar en el `report.md` como bug.

## 📋 Return Envelope (schema obligatorio)

Al terminar, actualizar `docs/openspec/changes/v1.6-tdd-ci/report.md` con:

```markdown
## Fase 3 — CI/CD Pipeline
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista exacta)
- **Bugs encontrados:** (incluir intentos fallidos y anti-patrones descartados, no solo bugs finales)
- **Próxima acción:** Orquestador ejecuta merge y release de la v1.6
```

> **[SISTEMA — PARA EL WORKER]** No escribas el prompt en el chat. El único output esperado es el archivo `ci.yml` creado y el `report.md` actualizado. Cuando termines, decile al humano que vuelva al chat del Orquestador con el reporte.
