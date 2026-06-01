### [BUG][ci-lockfile-mismatch] CI falla con `--frozen-lockfile` al pinear versión exacta post-instalación
**Síntoma:** `pnpm install --frozen-lockfile` falla en GitHub Actions con error de mismatch entre `package.json` y `pnpm-lock.yaml`.
**Causa:** El lockfile fue generado con `"vitest": "^4.1.4"`. Luego el Orquestador lo cambió a `"vitest": "4.1.4"` (SecOps) sin regenerar el lockfile. El `--frozen-lockfile` detecta la inconsistencia y rechaza la instalación.
**Anti-patrón:** Escuchar a Copilot/GitHub que sugiere volver al caret `^` — eso viola SecOps y es la solución incorrecta.
**Fix correcto:** Regenerar el lockfile localmente con `pnpm install` (sin flags) dentro del directorio del paquete, y luego commitear el `pnpm-lock.yaml` actualizado junto con el `package.json`.
**Regla:** Siempre que se modifique una versión en `package.json`, regenerar el lockfile ANTES del commit y del push.