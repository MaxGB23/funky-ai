# CI/CD — GitHub Actions

Un workflow definido en `.github/workflows/`, más Dependabot para actualizaciones automáticas. Todos los workflows usan SHA pinning y permisos mínimos explícitos.

| Workflow | Disparadores | Permisos clave | Tiempo estimado |
|---|---|---|---|
| **CI** | `push` / `pull_request` a `main` | `contents: read` | ~30s |

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

- [RFC original — checklist de hardening](openspec/rfcs/github-actions-megalodon-vulnerability.md)
- [Workflows en este repo](.github/workflows/)
- [Dependabot config](.github/dependabot.yml)
