> OBSERVACIONES QUE SE HAN ENCONTRADO DURANTE LA EJECUCIÓN DEL SMOKE TEST

# 1. COMANDO INIT

## 1.1. Comando init: - 2ª ejecución → error `❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md...`, exit 1, sin modificar archivos.
OBSERVACIÓN: El mensaje de error menciona project canvas o infra canvas, no se tiene validacion individual, si hace falta uno debe instalarlo y skipear los que ya existen.

## 1.2. Templates de init
brief, project canvas, infra canvas fueron aprobados por el agente: "Tienes una base SÚPER SÓLIDA. Así es como se estandarizan las decisiones en equipos grandes para que la arquitectura no sea un chile con queso.".

## 1.3. Prompt en canvas planning guide
SUGERENCIA: Actualizar las instrucciones del agente IA para que el primer paso obligatorio sea leer el `brief-funcional.md`. El agente necesita entender el contexto del negocio (usuarios, casos de uso, KPIs y escala) antes de evaluar las decisiones técnicas del PROJECT-CANVAS e INFRA-CANVAS. Esto evita que valide stacks tecnológicos que no hacen match con la realidad del proyecto.
El prompt debe decir que el agente no debe modificar nada sin discutir antes. Además va a querer discutir todo en un mismo output, por lo que sería bueno que fueran discusiones de puntos en concreto, para no discutir todo de golpe e ir paso a paso.

## 1.4. Orden sugerido y refactor de init (brief, project/infra canvas, guide, prompts por cada file)
**Problema actual:** Mezclar instrucciones para la IA dentro de los templates Markdown genera confusión en el orden de ejecución y ensucia el repositorio a largo plazo. Si cada archivo tiene su propio prompt embebido, el agente revisa la arquitectura por partes y se pierde la visión holística, además de que el humano no sabe qué revisar primero.

**Flujo y orden recomendado:**
1. **Fase de Negocio (Brief):** El humano llena primero el `brief-funcional.md`. 
2. **Fase Técnica (Canvases):** El humano lee la `canvas-planning-guide.md` y llena el `PROJECT-CANVAS.md` y `INFRA-CANVAS.md`. Estos templates deben ser **100% declarativos** y limpios (sin prompts para la IA al final).
3. **Fase de Validación (Review Holístico):** Eliminar los prompts individuales de los Canvas y de la Guía. La revisión de compatibilidad debe evaluar Brief + Project + Infra *al mismo tiempo*.
Propongo que dentro de canvas/init-prompt.md se cree el prompt que evalúa los 3 files. 
Eliminar los prompts dentro de project canvas e infra canvas. El prompt de planning guide migra a init-prompt.md.

Observación extra:
El comando estimate genera el prompt en consola, hay que decidir cuál es el mejor patron para cada comando, en su carpeta dedicada siguiendo el patron de init (canvas/init-prompt.md) donde el prompt puede persistir, o deberíamos ternerlos en terminal para no ensuciar files, con el riesgo que puede perderse al cerrar la terminal.

## 1.5. Guía para el Brief Funcional
DECISIÓN: Optamos por NO crear una guía externa dedicada para el `brief-funcional.md`. **Keep it simple**. Mantener la menor cantidad de documentos posibles reduce la fricción de entrada. En Project e infra canvas si es necesario por ser más técnicos.
SUGERENCIA: Revisé el template base del Brief y actualmente los comentarios (`<!-- ... -->`) solo contienen preguntas. Hay que mejorarlos agregando un ejemplo corto al final de cada pregunta para que el documento sea 100% auto-explicativo. 
*Ejemplo para la plantilla:* `<!-- ¿Cómo se mide el éxito del producto? Ej: Reducir 30% el tiempo de armado de reportes. -->`
NOTA IMPORTANTE: Es clave recordar que el Brief nace de ideas e hipótesis de negocio, las cuales **pueden y deben ser cuestionadas** por el agente IA en la etapa final. Cuando se dispara el prompt que evalúa los 3 archivos en conjunto, la IA debe actuar como filtro para retar si esas ideas iniciales chocan contra las decisiones de arquitectura o la realidad operativa.


# 2. COMANDO ASSESS
Genera un architecture-review.md que trae incrustadas las decisiones de project e infra canvas, es un copy paste, lo que hace que el proposito del template es tener su sección de "## Fases de la Discusión", el cual es la fase de asesoramiento con IA, ademas falta mencionar que debe discutirse punto por punto y no todo de golpe, ya que se ha testeado y el agente siempre quiere hacer todo de una.

En vez de tener el copy paste de las decisiones, debería referenciar los archivos, para que sea una discusión, y tambien debe mencionarse qué no debe modificar nada sin aprobación, es fase de discusión.

Hay cosas como nfrs y patrones de referencia, se debe dejar en claro que son referencias, al proyecto puede que no apliquen, incluso podrían aplicar unas totalmente diferentes, por lo que la IA debe tener la capacidad de adaptarse, siempre sin sobreingeniería. La IA descubre huecos que podrían no haberse pensado, por eso es una segunda validación, pero el humano siempre tiene la decisión final.

Veo que los patrones de referencia se inyectan en architecture-review, esto no debe ser así ya que tiene su file dedicado risk-patterns.md, debe ser referenciado.
Además falta un apartado para que la IA sepa que una vez discutido un punto y aprobado por el humano, deben anotarse las decisiones finales en architecture-decisions.md.

## 2.1 Observaciones sobre las Fases de Discusión en el template:
1. **Falta de Contexto de Negocio (Brief Funcional en Fase 1):** Es un error crítico que la Fase 1 solo indique leer los canvases técnicos. Debe incluir obligatoriamente el `brief-funcional.md`. La arquitectura no se puede validar en el vacío; los NFRs y riesgos dependen de los casos de uso, volumen de usuarios y KPIs del negocio.
2. **Falta de Instrucción Iterativa (Anti-Monólogo):** Las fases deben indicarle a la IA explícitamente que funcione de forma Socrática: debatir **un solo punto a la vez y DETENERSE** a esperar la respuesta del humano. Actualmente, la estructura invita a que el agente escupa un pergamino continuo saltando de la Fase 1 a la 6 de golpe.
3. **Validación Cruzada Técnica vs Negocio (Fase 4):** En la fase de Riesgos Detectados, no basta con buscar "incompatibilidades de stack". La IA debe recibir la instrucción de chocar las decisiones técnicas contra el Brief Funcional para detectar sobreingeniería (matar moscas a cañonazos) o si el stack se queda corto frente a las expectativas del producto.

# 3. COMANDO ESTIMATE
El prompt que es inyectado en consola es enorme, por lo que dificulta leer los checks o warnings del cli. 
El cli al detectar usa argentinismos, por ejemplo: "💡 Se detectó Roles del equipo (equipo). Considerá --roles para incluir su sección en la guía." Debe usar español neutro para cualquier tipo de usuario.
Se encontró la falta de ortografía en "sobbrescribió."

pricing-guide.md embebe todos los documentos anteriores, a manera de copy paste, de init y assess. Esto creo se debe a que podría que el comando de estimate se ejecutara individualmente sin requerir init ni assess. Creo que debería ser obligatorio, pero esto creo le quitaría protagonismo a funky pipeline, o podría hacer que el comando estimate muestre error sin haber ejecutado los anteriores. Aquí hay que encontrar la mejor solución.

Cualquier flag como "funky estimate --security" el cli ensucia la terminal con información que no es necesaria, como el prompt gigante.

The cli detecta secciones, y sugiere --flag, esto es inconsistente ya que matchea palabras que pueden dar falsos positivos. Se ha decidido eliminarlas, y en vez de esto, reemplazar la seccion de pricing-guide.md "## Alcance: ¿Aplica en esta fase?" por una guía corta de cuando conviene usar cada flag, tengo un ejemplo en estimate-flags-guia-tmp.md. Como en la fase estimate el agente debe leer todos los templates anteriores llenados, ya debe tener contexto del proyecto entero, ya sabrá qué hacer. 
Esto de los flags debe ser el paso inicial, antes de la fase de discusión de pricing.
Debe tener la instrucción de decidir primero los flags que recomienda al humano y el por qué aplican a este proyecto. La sección de discusión debe tener una instrucción de hacerse punto por punto, para que el agente de ia vaya discutiendo a la par y no haga todo de golpe. 

Al correr un flag no debe sobreescribirse el contenido que ya había en pricing-guide.md, debería incrustarse siempre antes de la seccion de "## Estructura de Discusión", todo con validaciones en caso de que no se encuentre algo.

## Recomendaciones del agente que ejecutó el flujo
- **Obligar a definir el Modelo de Pricing:** Actualmente la guía salta directo a los factores de costo. Antes de eso, debe haber un paso explícito para decidir entre *Fixed-Price* o *Time & Materials*. Sin el modelo, los números no tienen sentido de riesgo.
- **Cuantificar el riesgo de las flags (Buffers):** Las flags (`--security`, `--concurrency`) inyectan viñetas cualitativas muy buenas, pero les falta impacto cuantitativo. Sugiero que la IA esté instruida a proponer un buffer de contingencia (ej. +10% a +25%) por cada flag compleja detectada.
- **Incluir Costo Total de Propiedad (TCO):** La estimación se centra mucho en el costo de desarrollo del MVP (horas nalga). Falta forzar la discusión sobre costos recurrentes operativos (pólizas de soporte, monitoreo, límites de Vercel/Neon) como un rubro separado.
- **Resumen Financiero Final:** El documento `pricing-decisions.md` deja las decisiones como texto suelto. Para presentarlo a un cliente, faltaría que la sesión de IA termine generando una tabla de cotización concreta: `Costo Base + Buffer de Riesgo + Margen de Ganancia = Precio de Venta del MVP`.
Las flags condicionales son un mecanismo de defensa contra la sobreingeniería. Si un proyecto es un simple CRUD interno, no tienes por qué andarle metiendo Redis, colas de mensajes ni microservicios (y por ende, no corres la flag --concurrency).
Leer pricing-factors-analysis.md para mas sugerencias de factores de costo.

# 4. GENERALES
funky init no sigue el patrón de guías se sobreescriben para tenerlas actualizadas, pero templates de decisiones no se sobreescriben, es peligroso sobreescribir decisiones de usuarios.
El cli en cada comando debería dar feedback al usuario, por ejemplo, "Guía x actualizada con éxito" o "guía ya existe, quieres actualizarla? Y/N", "PROJECT-CANVAS.md salteado, ya existe y contiene decisiones del proyecto" podría tener una sugerencia de eliminarlo o moverlo a otro path si se quiere traer la versión mas reciente.

La sección de discusión de assess y estimate deben tener una instrucción de hacerse punto por punto, para que el agente de ia vaya discutiendo a la par y no haga todo de golpe. Ademas de su instruccion de ir guardando las decisiones aprobadas en su respectivo {fase}-decisions.md.
