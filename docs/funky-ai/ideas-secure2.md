> **Consenso 2026-08-05:** contenido debatido y volcado al RFC `feature-secure.md` §4.3 (con correcciones: cuarentena inerte en installs frozen, pinning de CI, gate de audit, tensión cuarentena↔Dependabot). Valores actualizados al estándar: cuarentena **4320 min (72 h / 3 días)**.

## Revisión de PRs de Dependabot

Las PRs de Dependabot deben revisarse como cualquier cambio de dependencias, aunque provengan de una herramienta automatizada.

Antes de hacer merge:

* Verificar que el cambio afecta únicamente a las dependencias y sus lockfiles esperados (`package.json` / `pnpm-lock.yaml`).
* Confirmar que **no aparece `package-lock.json`** ni ningún otro lockfile no autorizado.
* Revisar especialmente actualizaciones mayores o cambios que introduzcan dependencias nuevas.
* Ejecutar `pnpm audit` y los tests del proyecto.
* Revisar el diff de `pnpm-lock.yaml` para detectar paquetes inesperados o cambios sospechosos.
* Mantener `minimum-release-age=4320` como protección frente a versiones recién publicadas.
* No aceptar automáticamente una PR solo porque Dependabot la haya generado.

**Objetivo:** Dependabot puede proponer actualizaciones automáticamente, pero el merge debe confirmar que el cambio respeta nuestra política de **pnpm exclusivo, lockfile único y controles de supply-chain**.


## GitHub Actions y producción

La política de seguridad de dependencias debe aplicarse también fuera de las máquinas de desarrollo. **GitHub Actions y producción deben utilizar exclusivamente pnpm** y tener configurado el mismo `minimum-release-age=4320` (72 horas / 3 días).

El repositorio debe contener `pnpm-lock.yaml` y los workflows deben instalar con el lockfile, por ejemplo:

```bash
pnpm install --frozen-lockfile
```

Además, los runners y servidores de producción deben tener configurado:

```ini
minimum-release-age=4320
ignore-scripts=true
```

De esta forma:

* `pnpm-lock.yaml` garantiza que CI y producción utilicen las versiones fijadas.
* `minimum-release-age=4320` mantiene la cuarentena de 72 horas (3 días) también en esos entornos.
* `ignore-scripts=true` evita la ejecución automática de lifecycle scripts durante la instalación.
* npm permanece bloqueado y no debe utilizarse como alternativa.

**Importante:** `minimum-release-age` no está contenido en `pnpm-lock.yaml`; es una configuración del entorno. Por eso debe establecerse explícitamente en las máquinas/runners de CI y producción, no solo en la configuración local del proyecto.

La configuración ideal es que **desarrollo, GitHub Actions y producción compartan la misma política de pnpm**, evitando que un entorno tenga controles de seguridad más débiles que otro.
