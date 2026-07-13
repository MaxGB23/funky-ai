# 🛡️ Análisis de Riesgos e Inconsistencias: CLI Canvas v2

> **Documento de QA Arquitectónico**
> Basado en la propuesta de `docs/openspec/changes/cli-canvas-v2/proposal.md` y el código fuente v1.7.0.

Tras cruzar la nueva propuesta con el flujo actual (`funky init`), se han identificado los siguientes agujeros lógicos, problemas de idempotencia y casos borde.

---

## 🚨 1. Estados Parciales y Modo Headless

**El Problema:**
Actualmente, el modo Headless se activa si `fs.existsSync('PROJECT-CANVAS.md')` es verdadero. Al dividir el canvas en dos (`PROJECT-CANVAS` e `INFRA-CANVAS`), existe el riesgo de un **estado parcial**: ¿Qué pasa si el usuario borra accidentalmente el `INFRA-CANVAS.md` pero conserva el `PROJECT-CANVAS.md`, o si venimos de un repo viejo?

**Riesgos:**
- Si el CLI asume Headless solo revisando `PROJECT-CANVAS.md`, nunca preguntará por la infraestructura faltante y el orquestador fallará al buscar `INFRA-CANVAS.md`.
- Si el CLI pide ambas cosas pero solo una falta, podríamos sobreescribir la existente si no manejamos bien la idempotencia.

**Solución Técnica Propuesta:**
- **Evaluación Independiente:** Modificar `init.js` para que evalúe la existencia de `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` por separado.
- Si falta UNO de los dos, se debe iniciar un flujo interactivo *parcial* (solo preguntar la fase faltante), o bien en modo headless generar el canvas faltante en blanco.
- Para simplificar la primera iteración: Si existe uno pero el otro no, considerarlo estado interactivo parcial (solo ejecutar los prompts del faltante) o simplemente requerir que ambos no existan para el flujo interactivo completo, y si falta uno en headless, crear un template vacío advirtiendo al usuario.

---

## 🚨 2. Compatibilidad hacia atrás (Legacy v1.7.0)

**El Problema:**
Los repositorios inicializados con `funky init` v1.7.0 tienen un único `PROJECT-CANVAS.md` que incluye secciones de infraestructura (como *Testing y CI/CD* y *SecOps y Entornos*).

**Riesgos:**
- El nuevo sistema esperará leer `INFRA-CANVAS.md` para tareas de infraestructura. Al no existir, el Agente no tendrá contexto.
- Si corremos el nuevo `funky init` sobre un repo legacy, detectará `PROJECT-CANVAS.md` y puede que no genere `INFRA-CANVAS.md` (o genere uno vacío), dejando la información atrapada en el archivo viejo.

**Solución Técnica Propuesta:**
- En `init.js`, al detectar que `PROJECT-CANVAS.md` existe pero `INFRA-CANVAS.md` no, generar un `INFRA-CANVAS.md` con un boilerplate que diga: `> ⚠️ **MIGRACIÓN PENDIENTE:** Este proyecto proviene de la v1.7.0. Por favor, mueve las secciones de Testing, CI/CD y SecOps desde PROJECT-CANVAS.md hacia este archivo.`
- Mostrar un `console.warn()` claro durante el `init` indicando que se detectó un proyecto legacy y requiere acción manual.

---

## 🚨 3. Idempotencia en Modo Headless

**El Problema:**
La variable `canvasConfig = { fromHeadless: true }` es un flag booleano genérico. Con dos archivos, un solo flag no es suficiente para saber qué archivos saltar.

**Riesgos:**
- El `runInit` podría intentar sobreescribir un archivo si no sabe exactamente cuáles existen.

**Solución Técnica Propuesta:**
- Cambiar la estructura del flag headless:
  ```javascript
  canvasConfig = {
    skipProjectCanvas: fs.existsSync(path.join(targetBase, 'PROJECT-CANVAS.md')),
    skipInfraCanvas: fs.existsSync(path.join(targetBase, 'INFRA-CANVAS.md')),
    // ... datos de los prompts
  };
  ```
- En `runInit`, verificar `if (!canvasConfig.skipProjectCanvas)` antes de generar y escribir `PROJECT-CANVAS.md`, y lo mismo para `INFRA-CANVAS.md`.

---

## 🚨 4. Flujo de Cancelación (Ctrl+C) en Prompts Múltiples

**El Problema:**
La propuesta sugiere "separadas en dos flujos visuales". Si implementamos esto como dos llamadas separadas a `p.group()`, el manejo de la cancelación (`onCancel`) se vuelve peligroso.

**Riesgos:**
- Si el usuario completa la Fase 1 (Core) pero presiona `Ctrl+C` a la mitad de la Fase 2 (Infra), ¿qué sucede?
- Si escribimos a disco después de la Fase 1, dejaremos el proyecto en un estado inconsistente (solo con `PROJECT-CANVAS.md`).

**Solución Técnica Propuesta:**
- **Todo en memoria (All or Nothing):** Las escrituras a disco (`runInit()`) SOLO deben ocurrir al final del comando, después de que ambos `p.group()` hayan concluido exitosamente.
- Si el usuario cancela en la Fase 2, se ejecuta `process.exit(1)` y se descartan las respuestas de la Fase 1 sin tocar el disco. Este es el comportamiento esperado en un CLI (transacción atómica).

---

## 🚨 5. Comportamiento del Flag `--template`

**El Problema:**
Actualmente `--template` verifica si `PROJECT-CANVAS.md` existe y si es así, falla (`process.exit(1)`).

**Riesgos:**
- Si implementamos la generación dual, el flag `--template` debe generar ambos archivos vacíos. Pero si el directorio ya tiene uno de los dos archivos, generará un conflicto.

**Solución Técnica Propuesta:**
- El flag `--template` debe verificar la existencia de **ambos** archivos. Si *cualquiera* de los dos existe, debe lanzar error para evitar sobreescrituras accidentales.
- Si ninguno existe, generar `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` vacíos y salir.

---

## 🚨 6. Valores no definidos en Infraestructura

**El Problema:**
La propuesta menciona agregar la opción "No definido / Decidir luego" para mitigar la fatiga de prompts en la Fase 2.

**Riesgos:**
- Si el CLI usa los valores crudos, podríamos terminar imprimiendo objetos vacíos o valores no semánticos en el Markdown, similar al actual BUG-02 del boolean `true`.

**Solución Técnica Propuesta:**
- Asegurar que la función `generateInfraCanvas` tenga fallbacks explícitos, o que el valor del `p.select()` de Clack para la opción "Decidir luego" sea un string literal explícito como `'[Pendiente de definición]'`. No usar `null` ni booleanos directamente.
