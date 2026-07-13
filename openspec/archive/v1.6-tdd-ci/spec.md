# Especificación Técnica: v1.6 TDD y CI

## 1. Setup de Vitest

**Paquetes:**
- Instalar `vitest` en `funky-cli` como `devDependency`.

**Scripts (en `funky-cli/package.json`):**
- `"test": "vitest run"`
- `"test:watch": "vitest"`
- `"test:coverage": "vitest run --coverage"`

## 2. Estructura de Directorios para Tests

En `funky-cli/`:
- `tests/`
  - `commands/`
    - `init.test.js`
    - `phase.test.js`
  - `utils/`
    - (cualquier utilidad que requiera tests aislados)

> *Nota Arquitectónica:* Para testear comandos que tocan el File System (como los de Funky AI), es crítico separar la lógica de negocio de la operación I/O, o usar mocks (ej. `vi.mock('fs')` y `vi.mock('fs/promises')`) para no escribir realmente en el disco durante los tests.

## 3. GitHub Actions (CI)

Archivo: `m:/funky-ai/.github/workflows/ci.yml`

**Esquema Básico:**
```yaml
name: CI Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Dependencies
        run: npm ci
        working-directory: ./funky-cli
      - name: Run Tests
        run: npm test
        working-directory: ./funky-cli
```
