Cosas que podrían incluirse en la feature, hasta incluso en AGENTS.md
## Siempre Usar PNPM
En agents.md es interesante ya que es por repo, y incluso en updates o syncs de gentle-ai no se sobreescribe la rule
Mencionarlo incluso al delegar subagentes que corren tests

npm install, npm ci, npm update o npm install <paquete> → pueden crear/modificar package-lock.json, modificar node_modules y descargar dependencias. Además, durante la instalación pueden ejecutarse scripts como preinstall, install o postinstall, que pueden ser un vector de supply-chain/malware.
Aunque no haya malware, generar package-lock.json es un problema en nuestro repo: compite con pnpm-lock.yaml, que es el lockfile obligatorio. Puede provocar árboles de dependencias diferentes y confusión sobre qué gestor debe usarse. Aquí solo se permite pnpm.
npm test, npm run test, npm run build, etc. → normalmente no crean package-lock.json ni instalan dependencias; ejecutan los scripts definidos en package.json.

Sin embargo, esos scripts sí podrían ejecutar código. Por ejemplo:

"test": "vitest && node scripts/check.js"

ejecuta Vitest y después scripts/check.js. Si alguno de esos componentes estuviera comprometido, podría ejecutar código malicioso.

npx <paquete> / npm exec <paquete> → requieren especial cuidado porque pueden descargar y ejecutar paquetes externos.

Regla del repo: pnpm es el único gestor permitido. No usar npm para instalar, actualizar ni gestionar dependencias, y evitar npx.





# Política global de package manager

## Objetivo

**pnpm es el único package manager permitido en nuestras máquinas y repositorios. npm no debe utilizarse para instalar, actualizar o gestionar paquetes.**

Esto busca evitar que un agente de IA, desarrollador o herramienta ejecute accidentalmente un flujo de npm que pueda:

* generar un `package-lock.json` que compita con nuestro `pnpm-lock.yaml`;
* resolver un árbol de dependencias diferente al esperado;
* descargar paquetes sin pasar por las políticas de seguridad configuradas en pnpm;
* ejecutar lifecycle scripts de paquetes;
* introducir innecesariamente una vía adicional de supply-chain attack.

## Decisión: bloquear npm en lugar de configurar una cuarentena global de npm

Se evaluó utilizar una variable de configuración global de npm, como:

```text
npm_config_minimum_release_age=4320
```

como mecanismo de defensa ante instalaciones accidentales con npm.

**Se decidió no utilizar esta estrategia como control principal.**

La razón es que nuestro objetivo no es hacer que npm tenga una configuración de seguridad equivalente a pnpm, sino **eliminar npm como vía de instalación autorizada**.

La política elegida es:

```text
npm → BLOQUEADO
pnpm → ÚNICO package manager permitido
```

De esta manera, si un agente se equivoca y ejecuta un comando como:

```bash
npm install <package>
```

el comando debe fallar inmediatamente y recomendar la alternativa:

```bash
pnpm add <package>
```

Esto evita depender de que npm interprete correctamente una configuración global y elimina directamente la ruta alternativa de instalación.

## Comportamiento esperado

Los comandos de npm relacionados con gestión de paquetes deben bloquearse y recomendar su equivalente en pnpm.

```text
npm install          → pnpm install
npm i <package>     → pnpm add <package>
npm uninstall       → pnpm remove
npm update          → pnpm update
npm ci              → pnpm install --frozen-lockfile
npx <package>       → pnpm dlx <package>
npm exec <cmd>      → pnpm exec <cmd>
npm test             → pnpm test
npm run <script>    → pnpm run <script>
```

Mensaje esperado:

```text
ERROR: npm is disabled in this environment.

This environment uses pnpm exclusively.
Use the equivalent pnpm command instead.

Example:
  npm install <package>
  → pnpm add <package>
```

La protección debe ser **global**, no depender de estar dentro de un repositorio. Incluso fuera de un proyecto, los comandos de instalación de npm deben ser rechazados.

## Seguridad de pnpm

Las instalaciones se realizan exclusivamente mediante pnpm y están sujetas a las políticas establecidas por el equipo, incluyendo:

* `pnpm-lock.yaml` como único lockfile autorizado.
* `minimum-release-age=4320` (72 horas / 3 días) como cuarentena mínima para nuevas versiones.
* `ignore-scripts=true` para impedir lifecycle scripts durante instalaciones.
* Auditoría y revisión del lockfile después de actualizaciones relevantes.

## Principio

> **No queremos eliminar el acceso al ecosistema npm; queremos eliminar npm como cliente de instalación.**

Los paquetes siguen perteneciendo al ecosistema/registry de npm, pero **pnpm es la única puerta de entrada autorizada**.

La política final es:

**npm → bloqueado**
**pnpm → permitido y sujeto a nuestras políticas de seguridad**

La cuarentena global de npm mediante `npm_config_minimum_release_age` queda como una alternativa descartada, porque preferimos **bloquear la vía de ataque en lugar de intentar asegurar un package manager que no está autorizado a utilizarse**.
