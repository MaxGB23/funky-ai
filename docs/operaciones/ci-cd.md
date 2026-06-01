# CI/CD — GitHub Actions

Tres workflows definidos en `.github/workflows/`, más Dependabot para actualizaciones automáticas. Todos los workflows usan SHA pinning y permisos mínimos explícitos.

## Visión general

| Workflow | Disparadores | Permisos clave | Tiempo estimado |
|---|---|---|---|
| **CI** | `push` / `pull_request` a `main` | `contents: read` | ~30s |
| **CodeQL** | `push` / `pull_request` a `main` + schedule (lun 10am) | `security-events: write` | ~1m |
| **Scorecards** | `push` a `main` + schedule (lun 0am) | `security-events: write`, `id-token: write` | ~20s |

El schedule de CodeQL y Scorecards se superpone los lunes a la mañana para que los resultados lleguen juntos.

---

## CI — `ci.yml`

**Qué hace:** Instala dependencias, sincroniza templates y corre tests.

```yaml
# .github/workflows/ci.yml

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
```

### Steps

1. **Checkout** — `actions/checkout` con `persist-credentials: false` (no necesita credenciales)
2. **Setup pnpm** — `pnpm/action-setup` con versión fija `10.23.0`
3. **Setup Node.js** — `actions/setup-node` con `node-version: "20"` y cache de pnpm
4. **Install** — `pnpm install --frozen-lockfile` en `funky-cli/`
5. **Sync templates** — `pnpm sync` (genera templates antes de testear)
6. **Run tests** — `pnpm test` (`vitest run`)

### SHAs actuales

| Action | SHA | Release |
|---|---|---|
| `actions/checkout` | `08eba0b27e820071cde6df949e0beb9ba4906955` | v4.3.0 |
| `pnpm/action-setup` | `fc06bc1257f339d1d5d8b3a19a8cae5388b55320` | v4.4.0 |
| `actions/setup-node` | `49933ea5288caeca8642d1e84afbd3f7d6820020` | v4.4.0 |

---

## CodeQL — `codeql.yml`

**Qué hace:** Análisis estático de seguridad con CodeQL sobre JavaScript/TypeScript.

```yaml
# .github/workflows/codeql.yml

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 10 * * 1"   # lunes 10am UTC

permissions:
  contents: read

jobs:
  analyze:
    permissions:
      actions: read
      contents: read
      security-events: write
```

Usa `github/codeql-action` con SHA `03e4368ac7daa2bd82b3e85262f3bf87ee112f57` (v3) en tres pasos: `init`, `autobuild` y `analyze`.

Los resultados aparecen en GitHub → **Security** → **Code scanning**.

---

## Scorecards — `scorecards.yml`

**Qué hace:** Evalúa el proyecto contra las [OpenSSF Scorecard](https://securityscorecards.dev/) y sube los resultados a GitHub Security.

```yaml
# .github/workflows/scorecards.yml

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 0 * * 1"    # lunes 0am UTC

permissions: read-all

jobs:
  analysis:
    permissions:
      security-events: write
      id-token: write       # necesario para publish_results: true
```

Usa `ossf/scorecard-action` con SHA `4eaacf0543bb3f2c246792bd56e8cdeffafb205a` (v2.4.3) y sube el SARIF con `github/codeql-action/upload-sarif`.

Los resultados aparecen en GitHub → **Security** → **Code scanning** y en el badge del README si está configurado.

---

## Dependabot — `.github/dependabot.yml`

**Qué hace:** Abre PRs semanales para actualizar dependencias.

| Ecosistema | Directorio | Schedule |
|---|---|---|
| `github-actions` | `/` | Semanal (lunes) |
| `npm` | `/funky-cli` | Semanal (lunes) |

Límite de 5 PRs abiertos por ecosistema.

---

## Cómo mantener las Actions

### Actualizar SHAs

Cuando Dependabot o vos quieran actualizar una Action:

1. Ir al release del repo (ej: `github.com/actions/checkout/releases`)
2. Copiar el SHA completo del commit del release
3. Reemplazar en el workflow, manteniendo el comentario con la versión legible:

```yaml
uses: actions/checkout@<NUEVO_SHA> # vX.Y.Z
```

### Probar cambios localmente

No hay forma de correr GitHub Actions localmente con `act` para este repo (usa pnpm y paths específicos). La validación es:

1. Pushear a una branch
2. Abrir PR
3. Verificar que el CI pase en GitHub

---

## Referencias

- [RFC original — checklist de hardening](docs/openspec/rfcs/github-actions-megalodon-vulnerability.md)
- [Workflows en este repo](.github/workflows/)
- [Dependabot config](.github/dependabot.yml)
