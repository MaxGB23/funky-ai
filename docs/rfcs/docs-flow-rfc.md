# RFC: docs-sync como proceso independiente — docs por work unit, un ancla y un índice que no puede mentir

> **STATUS: PROPUESTO (revisión 2, sin decisiones cerradas).** Origen: revisión
> de la skill `docs-sync` de este repo (2026-10-19), a partir de la sensación de
> que la documentación se trabaja dos veces y de cuatro hallazgos verificados.
>
> La revisión 1 proponía una sola pasada al cierre del track. No se sostiene: el
> que cierra depende de recordar lo que hizo en sesiones anteriores, y el
> contexto se pierde. Esta revisión mueve el trabajo al work unit y deja el
> cierre como barrido de lo que el work unit no puede ver.
>
> **Alcance**: el proceso de documentación como pieza autónoma. No asume ningún
> framework de planificación: cualquier proyecto con docs puede adoptarlo.
> `funky-cli` es el caso de estudio, no el requisito.
>
> **Qué no es**: una especificación para reescribir `docs-sync` hoy. Las
> secciones 11 y 12 sí son cambios concretos, para decidir después.

---

## 1. El problema

Hoy la documentación se trabaja en dos momentos: se edita durante el trabajo
—un work unit de docs dentro de la tarea (en este repo, una tarea ODD), o
ediciones sueltas al vuelo— y después `docs-sync` vuelve a pasar como segunda
validación. La segunda pasada no puede confiar en la primera, así que rehace el
matching y la lectura de cada sección. **El trabajo repetido no es un fallo
ocasional: es estructural.**

Y el andamiaje de la propia skill se pudre. Cuatro hallazgos verificados:

| Hallazgo | Evidencia |
|---|---|
| Dos momentos que se pisan | La tarea edita docs; `docs-sync` vuelve a decidir qué docs aplican y re-lee las secciones ya tocadas |
| El andamiaje se pudre | `.agents/templates/sdd/docs-index/skills.md` lista 8 items; `docs/funky-ai/skills.md` tiene 12 H2. Faltan *Modo no interactivo*, *Conflictos* (y su H3), *Logs* y *Sin TTY*. Nada lo detecta |
| El SSOT es un mundo cerrado | 19 filas para 126 `.md` bajo `docs/`. La mayoría de los restantes son históricos por carpeta, pero quedan docs vivos fuera: `docs/operaciones/toolchain.md` (afirma 411 tests; hoy la base es 443), `docs/operaciones/ci-cd.md`, `docs/funky-forge/README.md`, `docs/funky-forge/command-flow.md` y `docs/funky-ai/feature-secure.md`, que dice "RFC / borrador, describe lo que haremos" cuando `funky secure` se publicó en v4.6.0 |
| Nombres muertos fuera del histórico | `sdd-docs-sync` y `sdd-release` siguen citados en `docs/funky-forge/release-ideas/skills/ideas-postrelease.md`, que es la spec de instalación de skills y por tanto parece autoritativa |

La skill hace bien lo más difícil: **se ancla en el diff y en la realidad
ejecutable, no en la memoria ni en el plan.** Eso se conserva. Lo que se corrige
es el número de pasadas y la fiabilidad de sus insumos.

La tentación de resolver la duplicación con una sola pasada al cierre no
funciona, y conviene decirlo antes de proponer otra cosa: pedirle a un
orquestador que documente al final de un track asume que conserva el contexto de
sesiones anteriores, y el "lost in the middle" describe exactamente lo contrario.
Un pase al cierre puede leer el diff, pero no recuerda el porqué. Y además es
ciego a tres cosas por construcción: las menciones en archivos que el diff no
toca, los retiros (el código borrado no dice quién lo citaba) y las cifras.

Por eso el modelo va al revés: **el work unit documenta mientras el contexto
está caliente; el cierre solo barre lo que ningún work unit podía ver.**

Ninguno de estos fallos rompe algo. El daño de un doc desactualizado es
silencioso hasta que alguien lee la mentira y decide en base a ella. Un test que
falla se arregla; un doc que miente se queda, porque no hay nada que falle. Ese
es el diagnóstico de fondo: falta el bucle de retroalimentación, no la
disciplina.

## 2. Tres problemas distintos que hoy se confunden

| Problema | Pregunta | Mecanismo |
|---|---|---|
| Encontrar | ¿dónde está lo que sé que existe? | índice derivado de los docs |
| Ser verdad | ¿lo que dice sigue pasando? | ancla ejecutable + pase sobre el diff |
| Recordar lo muerto | ¿qué retiré y quién lo cita? | registro de nombres muertos |

Cuando "ser verdad" se intenta resolver con navegación —releer todo— se paga
dos veces: primero al escribir, después al verificar. Separar los tres es lo que
elimina el trabajo repetido; no hace falta un flujo nuevo, hace falta que cada
problema tenga un dueño y un mecanismo.

## 3. Las cuatro piezas

### 3.1 Índice SSOT con cuatro columnas

| Doc | Cubre | Verificado contra | Índice seccional |
|---|---|---|---|
| `docs/funky-forge/init.md` | `funky init`, bootstrap | `funky init --help` | `docs-index/init.md` |
| `docs/design/section-animations.md` | gate de reveal y entradas | HTML servido; selectores en el CSS compilado | — |
| `docs/operaciones/toolchain.md` | Node, pnpm, vitest | `package.json`; salida de `pnpm test` | — |

**"Verificado contra" es la columna que hace el flujo portable.** Nombra la
consulta que responde sí/no sobre las afirmaciones del doc. Sin ancla, el doc se
marca como semántico (`—`) y se revisa leyéndolo. Esa columna también responde
la pregunta inversa: "¿este doc se puede verificar sin que lo lea nadie?".

Regla: el SSOT indexa **solo docs vivos**. Los históricos se declaran por
carpeta (3.3), no con 126 filas.

### 3.2 Índice seccional generado

El índice seccional (H2/H3 con una línea cada uno) es la mejor idea del flujo
actual y la peor implementación: mantenido a mano, ya está desactualizado. Se
genera desde los headings y se verifica en CI. Si un doc necesita un resumen
curado por sección, ese resumen va como primera línea de la sección; no como
metadato paralelo que nadie actualiza.

### 3.3 Vida declarada por carpeta

| Vida | Carpetas típicas | Obligación |
|---|---|---|
| VIVO | docs del producto | debe ser verdad hoy; se verifica mecánicamente |
| DECISIÓN | `rfcs/`, propuestas, ADRs | se congela al aprobar; se supera con otro, no se edita |
| TRABAJO | tareas, cambios en curso | cierra al mergear; después es historia |
| INSTANTÁNEA | auditorías, mediciones, logs | fechada; nunca finge ser actual |
| HISTÓRICO | releases, archivo, backups | no se edita |

Declarar la vida por carpeta es lo que permite tener 126 docs sin mantener 126
estados: la carpeta dice qué esperar antes de abrir el archivo.

Y una regla explícita: **un doc cerrado no se actualiza.** Si una tarea vieja o
un RFC cerrado dice algo que ya no es cierto, no se reescribe: dejaría de ser el
registro de lo que se decidió. Lo que siga siendo verdad se muda al canon; lo
que murió, al registro. El linter no los lee como verdad, así que nunca te va a
pedir que los toques.

### 3.4 Registro de nombres muertos

Una tabla: símbolo retirado, fecha, sustituto, doc que lo gobierna hoy. La fila
se añade en el mismo work unit que retira la técnica. Es la única respuesta
posible a "¿quién menciona esto?" sin grep del nombre del track ni memoria.

Solo los tokens entre backticks de la primera celda se verifican; una fila en
prosa queda como documentación humana. El registro no pretende ser exhaustivo:
pretende que lo enumerable sea enumerable.

## 4. Las clases de ancla

No todas las anclas cuestan lo mismo ni corren en el mismo sitio. Esta
clasificación decide dónde vive el check; sin ella, se acaba metiendo una
verificación de servidor en un lint que nadie puede ejecutar.

| Clase | Ejemplo | Corre en |
|---|---|---|
| Estática | el archivo existe, el export existe, el script está en `package.json`, la env var está en el ejemplo | lint (sin build) |
| De build | tipos generados, schema, CSS compilado | job de build o tests |
| De ejecución | `--help`, respuesta HTTP, escenarios de comportamiento | job de tests, con build o servicio |
| Humana | intención, prosa, compatibilidad | el work unit que lo cambia |

Regla: la clase del ancla decide su casa. Un check de ejecución fuera del job de
tests es un check que no corre.

## 5. El work unit documenta; el cierre barre

Dos niveles, con dueños distintos:

1. **En el work unit**: si el cambio altera una afirmación que un doc VIVO hace,
   el work unit no está terminado hasta que esa sección dice la verdad. Contexto
   fresco, alcance pequeño, diff delante. Es el 90% del trabajo documental.
2. **Al cerrar el track**: un barrido, no una pasada. Busca solo lo que ningún
   work unit podía ver: borrados, menciones cruzadas, coherencia estructural y
   cifras.

La regla, en una línea: **ningún work unit se cierra sin responder "¿qué doc
VIVO afirma algo sobre esto?"**. La respuesta puede ser "ninguno"; lo que no
puede es quedar sin preguntar.

Formulación para la checklist de cierre:

```
docs: <archivo#seccion actualizado> | no aplica porque <motivo>
```

Es deliberadamente incómoda. La regla actual —"sincroniza el tema si el cambio
afecta componentes, tokens o utilidades de UI"— deja la condición en manos del
mismo agente que puede no darse cuenta; una línea obligatoria, aunque diga "no
aplica", deja rastro y obliga a mirar.

### Por qué no basta el work unit

Tres cegueras estructurales, no descuidos:

| Ceguera | Ejemplo |
|---|---|
| Menciones cruzadas | Retiras un símbolo en un archivo; el doc que lo cita vive en otro y no está en el diff |
| Retiros | El código borrado no dice "un doc de otra carpeta afirma que esto existe" |
| Cifras y referencias | Un conteo caduca sin que nadie edite ese archivo |

El pin del featured es la primera: murió en un sitio y seguía descrito en cinco
documentos que ningún work unit tenía en el alcance.

### El barrido de cierre, y por qué no es una segunda pasada

El barrido tiene solo estas entradas:

1. `git diff --diff-filter=D --name-only <base>...HEAD`: qué se retiró. Cada
   nombre va al registro o se descarta con motivo.
2. El registro de nombres muertos, contra los docs VIVOS.
3. Los checks mecánicos: SSOT ↔ archivos, índice ↔ headings, enlaces.
4. Las cifras del diff, si las hay.

No re-lee todos los docs ni vuelve a decidir qué aplica. Si encuentra algo, es un
fallo del work unit que tocó esa parte, y se arregla en pequeño.

| Afirmación | Quién la caza |
|---|---|
| Superficie: el comando, flag, prop o ruta existe | el check contra el ancla, en el work unit |
| Comportamiento: hace X en este orden | el que documenta el work unit, con el diff delante |
| Algo retirado que un doc sigue afirmando | el registro (work unit) + el barrido de borrados |
| Conteos y referencias de línea | prohibidos por regla, o el barrido si son del diff |

### Condiciones

1. **El work unit es pequeño.** Si un work unit dura tres sesiones, su doc sufre
   el mismo lost in the middle que el cierre. La disciplina de docs es la de
   commits: unidades revisables.
2. **La checklist bloquea.** Un ítem que se puede dejar en blanco no existe.
3. **El barrido usa el diff como entrada**, no la memoria de quien lo corre.
4. **Lo que el cierre no puede reconstruir se anota en caliente**: hipótesis,
   retiros y decisiones no obvias van a la tarea (TRABAJO) en el momento, en
   tres líneas. Es lo único que el diff no puede dar.

## 6. Qué es mecánico y qué no

- **Mecánico**: coherencia estructural (SSOT ↔ archivos, índice ↔ headings,
  enlaces), superficie contra el ancla, nombres muertos en docs VIVOS.
- **Semántico**: comportamiento, orden, intención, compatibilidad. Nadie lo
  automatiza: lo documenta el work unit que cambió el comportamiento, y el
  reporte del cierre dice qué se leyó y qué no.
- **Frontera honesta**: un doc con `Verificado contra: —` no está "pendiente de
  automatizar"; está asignado a atención humana. Decirlo explícitamente evita la
  falsa sensación de cobertura.

## 7. Anclas por tipo de proyecto

La pregunta que define el ancla: **¿qué consulta responde sí/no sobre esta
afirmación sin leer el doc ni preguntarme?** La sección CLI es la
implementación de referencia del modelo; las demás son adaptaciones.

### 7.1 CLI

- **Ancla**: `--help` para la superficie; escenarios ejecutados para el
  comportamiento (exit codes, mensajes, shapes JSON, archivos que escribe).
- **Mecánico**: cada comando, subcomando y flag documentado existe en `--help`
  y viceversa (excluyendo los auxiliares de Commander); cada exit code
  documentado se reproduce en el escenario listado; las claves de los shapes
  JSON documentados coinciden.
- **Semántico**: por qué el comando hace lo que hace, flujo interno, decisiones.
- **Clase**: ejecución. Corre con el build, nunca en el lint.
- **Trampa real de este repo**: `funky skills --help` mostró `sdd-release`
  después de un rename, sin ningún test que lo cubriera; la suite quedaba verde
  con el help obsoleto. El ancla hay que ejecutarla, no deducirla.
- **Fila típica**: `docs/funky-forge/init.md | funky init, bootstrap | funky init --help | docs-index/init.md`

### 7.2 Web / app

- **Ancla**: el HTML servido (SSR), el árbol de rutas, los exports de
  componentes, los selectores presentes en el CSS compilado, los tokens
  definidos.
- **Mecánico**: cada ruta documentada existe; los ids y textos clave aparecen en
  el HTML servido; cada clase o selector citado existe en el CSS compilado;
  cada componente citado está exportado; cada token citado está definido.
- **Semántico**: comportamiento de las animaciones, coreografía, intención de
  diseño, jerarquía visual.
- **Clase**: mixta. Rutas y exports son estáticos; CSS compilado es de build; el
  HTML servido es de ejecución.
- **Trampa**: SSR y cliente no dicen lo mismo. Un doc que solo verifica el HTML
  servido da falso verde sobre todo lo que activa JavaScript (en un portfolio,
  el gate de reveal lo pone un script inline, no React). El ancla del
  comportamiento tiene que ser el navegador.
- **Fila típica**: `docs/design/section-animations.md | gate de reveal | HTML servido; selectores .reveal-* en el CSS compilado | —`

### 7.3 Librería o API pública

- **Ancla**: el schema (OpenAPI, JSON Schema), los tipos generados, los exports
  del entrypoint, `peerDependencies`.
- **Mecánico**: cada método, tipo y parámetro documentado existe en el schema o
  en los tipos; cada parámetro obligatorio lo es también en el tipo; la versión
  mínima documentada coincide con `peerDependencies`; los ejemplos importan
  desde el entrypoint real.
- **Semántico**: garantías, semántica de errores, compatibilidad, casos límite.
- **Clase**: estática o de build, según si los tipos se generan.
- **Trampa**: documentar la API "intencionada" en lugar de la publicada. El
  `index.d.ts` es el contrato, no el README.

### 7.4 Datos, infraestructura y operaciones

- **Ancla**: `package.json` scripts, migraciones, variables de entorno,
  workflows, pins y versiones.
- **Mecánico**: cada script documentado existe; cada variable documentada
  aparece en el ejemplo de entorno; cada workflow citado existe; las versiones y
  conteos citados coinciden con lo que produce el repo (un conteo de tests se
  cita con fecha de medición o no se cita).
- **Semántico**: runbooks, topología, decisiones operativas, incidentes.
- **Clase**: estática para archivos y scripts; de ejecución para conteos.
- **Trampa de este repo**: `docs/operaciones/toolchain.md` afirma 411 tests; la
  base hoy es 443. Es el ejemplo perfecto de cifra sin fecha, y está fuera del
  SSOT, así que nada la mira.
- **Fila típica**: `docs/operaciones/toolchain.md | Node, pnpm, vitest | package.json; salida de pnpm test | —`

### 7.5 Si no existe ancla

Se marca `Verificado contra: —` y el doc entra en la checklist del work unit. No
es un fallo del doc: es el costo real de documentar algo que solo un humano puede
juzgar. Lo que sí es un fallo es no declararlo y creer que está cubierto.

## 8. Los dos runbooks

### 8.1 Cierre de un work unit

1. ¿Qué doc VIVO afirma algo sobre lo que acabo de cambiar? Si la respuesta es
   "ninguno", escribirlo en la checklist con el motivo.
2. Leer solo la sección afectada (índice seccional), no el doc completo.
3. Aplicar el cambio mínimo y, si hay ancla, ejecutarla.
4. Si retiré algo: fila en el registro, en el mismo work unit.
5. Anotar en la tarea lo que el diff no va a poder contar después: qué se
   retiró y qué decisión no obvia se tomó.

### 8.2 Barrido de cierre del track

Pre-merge, con `<base>` = el punto de partida del track:

1. `git diff --stat <base>...HEAD`: qué cambió.
2. `git diff --diff-filter=D --name-only <base>...HEAD`: qué se retiró. Cada
   nombre va al registro o se descarta con motivo.
3. Correr los checks: SSOT ↔ archivos, índice ↔ headings, nombres muertos.
4. Reportar en tres listas: **verificado mecánicamente**, **actualizado en los
   work units**, **no cubierto y por qué**.

El reporte no es burocracia: uno que mezcla lo verificado con lo revisado miente
por omisión, y el siguiente que lo lea creerá que hay cobertura donde no la hay.

## 9. La herramienta

Una sola entrada, dos subcomandos, sin dependencias:

```
node scripts/docs.mjs          # check (acción por defecto)
node scripts/docs.mjs check
node scripts/docs.mjs toc --write
```

- `check` es la acción por defecto y devuelve 0 o 1. Tres checks: SSOT ↔
  archivos y enlaces; índice seccional ↔ headings; nombres muertos en VIVO.
- `toc --write` es lo único que escribe. El resto es solo lectura.
- Argumento desconocido o `--help`: cinco líneas de uso y exit 2. Sin parser,
  sin flags, sin `--json`: cada uno es superficie de mantenimiento sin llamador.
- **El `--help` describe la herramienta, nunca la política.** La política
  (cuándo correrlo, qué es VIVO) vive en el README y en `AGENTS.md`. Un help que
  repite política se pudre sin que nadie lo mire: este repo tiene el caso, con
  un `--help` que afirmaba que existía `sdd-release`.

El check de coherencia va en las tres direcciones, porque cada una caza algo
distinto:

| Dirección | Qué caza |
|---|---|
| SSOT → disco | filas que apuntan a docs inexistentes |
| Disco → SSOT | docs VIVO que nadie indexa |
| Sin clasificar | un `.md` en un área que no es VIVO ni exenta: aviso, no error |

Ese tercer caso es el que obliga a decidir una vez por área nueva, sin obligarte
a mantener los docs viejos.

**Si el proyecto no tiene CI**, el gate es un paso obligatorio del cierre
(documentado donde el agente lea las reglas) y el script no cambia. Cuando haya
CI, un workflow de quince líneas lo vuelve bloqueante.

## 10. La guía

No hay manual aparte: se explica en tres anclas.

- **README de docs**, cuatro líneas: qué es VIVO, que el índice es el índice, el
  presupuesto de tamaño y los dos comandos.
- **Reglas del agente**: el ítem de docs en la checklist de cada work unit, la
  fila del registro en el mismo work unit y el barrido al cerrar el track. Si no
  está ahí, no se lee.
- **`--help` del script**: la herramienta, no la política.

La regla que evita el árbol de decisión: **una pregunta cerrada por work unit y
un check constante.** La pregunta es "¿qué doc VIVO afirma algo sobre esto?", se
responde una vez con el cambio delante, y el check mecánico corre siempre:
tarda menos de un segundo y contesta lo enumerable. Un cambio de copy termina en
"no aplica" sin trabajo; un retiro genera una fila.

## 11. Cambios concretos sobre el flujo actual de este repo

| Pieza | Hoy | Propuesta |
|---|---|---|
| Cierre del work unit | Docs tocados al vuelo, sin criterio | Ítem obligatorio: qué doc VIVO afirma algo sobre el cambio, o "no aplica" con motivo |
| Trigger de `docs-sync` | Pase post-merge, segunda validación | Barrido pre-merge sobre `<base>...HEAD`: borrados, registro y checks; el post-merge queda como red para ramas que se saltaron el gate |
| SSOT | 3 columnas (Doc, Cubre, Índice) | Añadir "Verificado contra"; indexar solo VIVO |
| Índice seccional | Mantenido a mano | Generado y verificado |
| Vida de los docs | Implícita | Declarada por carpeta; cerrados congelados |
| Nombres muertos | No existe | Registro propio |
| Verificación | Lectura semántica | 3 checks en el barrido + doc por work unit con su ancla |
| Herramienta | — | `docs.mjs` con `check` y `toc`; gate procedural si no hay CI |

## 12. Migración

1. Clasificar carpetas y reducir el SSOT a docs vivos. Los que queden fuera y
   parezcan vivos (`operaciones/`, `feature-secure.md`, `funky-forge/README.md`)
   se deciden uno por uno: vivo, histórico o propuesta.
2. Añadir "Verificado contra" **solo donde el ancla exista hoy**. No inventar
   anclas: un `—` honesto vale más que un check que no comprueba nada.
3. Generar índices seccionales, escribir `docs.mjs` y activar el check.
4. Registro de nombres muertos con los conocidos (`sdd-docs-sync`,
   `sdd-release`) y los que aparezcan en la clasificación.
5. Añadir el ítem de docs a la checklist de cada work unit y mover el trigger de
   `docs-sync` a barrido pre-merge.
6. Barrido en el cierre (y en CI si el proyecto lo tiene).

Presupuesto: uno o dos días, la mitad clasificación. No meterlo dentro de un
track de feature: la clasificación es un trabajo propio y se mezcla mal con un
cambio de comportamiento.

## 13. Alternativas descartadas

- **Dos pasadas (actual)**: el verificador no puede confiar en el predictor, así
  que rehace todo lo que el predictor tocó. No es una red, es un borrador extra.
- **Una sola pasada al cierre del track (revisión 1 de este RFC)**: asume que el
  que cierra conserva el contexto de sesiones anteriores. Puede leer el diff,
  pero no recuerda el porqué, y es ciega a las menciones cruzadas y a los
  retiros. El trabajo se mueve al work unit, que es donde el contexto está
  caliente.
- **Auditar todo semánticamente al cerrar**: no escala y produce hallazgos que
  nadie cierra. El diff acota.
- **Estado por archivo (frontmatter o línea)**: 126 archivos para ganar lo mismo
  que declara la carpeta.
- **SSOT exhaustivo de los 126 docs**: convierte el índice en un cementerio con
  filas; el índice es para lo vivo.
- **Un CLI con parser, flags y `--json`**: superficie de mantenimiento sin
  llamador. Dos subcomandos y un `--help` de cinco líneas bastan.
- **Un skill que lo haga todo sin checks**: lo que no rompe nada se olvida. La
  parte determinista pertenece a un comando con exit code; el skill se queda
  con lo semántico.

## 14. Criterios de aceptación

- Un doc que miente sobre una superficie falla el check; un doc vivo fuera del
  SSOT también.
- Un índice seccional no puede desincronizarse sin que el check lo note.
- La fila del registro se añade en el mismo work unit que retira la técnica.
- El reporte del cierre separa verificado, leído y no cubierto.
- Ningún work unit cierra sin el ítem de docs respondido; "no aplica" con motivo
  es una respuesta válida, dejarlo en blanco no.
- Ningún doc cerrado se edita nunca.
- El barrido de cierre no encuentra docs VIVO sin actualizar ni borrados sin
  registrar.

## 15. Fuera de alcance

- Reescribir el contenido de los docs actuales: primero el flujo, después el
  contenido.
- Cambiar la estructura de las tareas.
- Sustituir las skills de producto.

## 16. Preguntas abiertas

- ¿"Verificado contra" admite varias anclas por doc? Propuesta: sí, separadas
  por `;`, y el check corre todas.
- ¿El check de superficie corre en el mismo job que los tests? Propuesta: sí,
  donde ya hay build.
- ¿Dónde vive el registro: archivo propio o sección del SSOT? Propuesta:
  archivo propio; el SSOT indexa, no acumula historia.
- ¿La clasificación de carpetas se hace antes o después de instalar el ítem de
  docs? Propuesta: antes; sin la clasificación, el SSOT sigue siendo un mundo
  cerrado.
