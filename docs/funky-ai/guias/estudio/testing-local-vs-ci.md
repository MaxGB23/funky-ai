# Guía de Estudio: Testing Local vs GitHub Actions (CI/CD)

> **Propósito:** Entender la diferencia conceptual entre escribir/correr tests en tu máquina (Vitest) y la automatización de validaciones en la nube (GitHub Actions), y por qué la estructura de carpetas es de vida o muerte para que esto funcione.

## 1. Testing Local (El entorno de desarrollo)
Cuando escribís un archivo `.test.js` en tu repositorio, estás usando un framework (en el caso de Funky AI, usamos **Vitest**). 

**¿Cómo funciona?**
- Escribís código que ejecuta tus funciones reales y verifica que devuelvan lo que esperás.
- Corrés un comando en tu consola (`npm run test`).
- Vitest escanea tu computadora, busca los archivos de prueba y te avisa si todo está verde o si rompiste algo.
- **El problema:** Todo esto ocurre en *tu* máquina. Si estás apurado, te olvidás de correr el comando, hacés un `git push` y subís código roto al repositorio oficial sin darte cuenta.

## 2. GitHub Actions (El Robot del CI/CD)
Acá es donde entra la magia de la **Integración Continua (CI)**. GitHub Actions es, en términos simples, un robot o un servidor en la nube de GitHub que vigila tu código.

**¿Qué hace este robot?**
1. Detecta que hiciste un `git push` a la rama principal (o abriste un Pull Request).
2. Levanta una computadora vacía en la nube (ej. Linux Ubuntu).
3. Descarga tu código y hace `npm install` para preparar el entorno.
4. **Ejecuta tus tests automáticamente** (`npm run test`).
5. Si un test falla, pone una cruz roja gigante en GitHub y te bloquea para que no rompas producción.

**¿Dónde vive?**
Toda la configuración de este robot está adentro de la carpeta `.github/workflows/`. Ahí están los archivos `.yml` que le dictan paso a paso las instrucciones al servidor.

### 2.1 ¿Cómo lo configuramos en Funky AI (v1.6)?
Para lograr que nuestros tests locales en Vitest se ejecuten automáticamente en cada push, armamos un "puente" en tres pasos:

1. **El Script de NPM (`package.json`):** 
   Nos aseguramos de tener un comando estandarizado bajo `"test": "vitest run"`. El uso del flag `run` es clave: le dice a Vitest que ejecute los tests *una vez* y termine el proceso (ideal para CI), en vez de quedarse en modo escucha continua (watch mode) que usarías en tu computadora.

2. **El Archivo YAML:** 
   Creamos el archivo `.github/workflows/ci.yml`. Este archivo es el "contrato" directo con GitHub.

3. **Las Instrucciones (El Pipeline):** 
   En ese YAML le dictamos a GitHub exactamente qué hacer:
   - **Cuándo ejecutarse:** `on: [push, pull_request]` (dispará la acción en cada nuevo commit o PR).
   - **Dónde ejecutarse:** `runs-on: ubuntu-latest` (dame una máquina Linux fresca y en blanco).
   - **Qué pasos dar:**
     1. Usá la acción `actions/checkout` para descargarte nuestro código fuente.
     2. Instalá Node.js.
     3. Corré `npm install` (instalando Vitest y nuestras dependencias).
     4. Corré `npm run test` (que por debajo dispara la batería de Vitest sobre nuestra carpeta unificada `tests/`).
## 3. ¿Por qué era crítico consolidar `test/` y `tests/`?
En nuestra auditoría vimos que había archivos en `funky-cli/test/` y otros en `funky-cli/tests/`. Esto es un *antipatrón* letal para el CI/CD:

- Los sistemas automatizados (y el propio Vitest) suelen configurarse para mirar un patrón específico, por ejemplo: *"corré todo lo que esté adentro de `tests/`"*.
- Si dejás pruebas tiradas en una carpeta con otro nombre (`test/`), el robot **no las va a ejecutar**.
- **El desenlace fatal:** El robot corre los tests de la carpeta principal, te da el OK verde (✅), y vos pensás que el sistema está perfecto. Pero los tests de la carpeta ignorada podrían estar fallando y jamás te enterarías. Es un "falso positivo" de seguridad.

### La Regla de Oro
**Single Source of Truth (Única fuente de la verdad):** Al mover todo a una única carpeta oficial (`tests/`), garantizamos que el 100% de la batería de pruebas sea ejecutada tanto en tu máquina como por el robot de GitHub Actions. Si el código está ordenado, la automatización nunca falla.
